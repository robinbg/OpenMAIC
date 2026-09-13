/** Server-to-server Noiz speech adapter for OpenMAIC's OpenAI TTS provider. */
import { createHash, timingSafeEqual } from 'node:crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 150;

const MAX_INPUT_CHARS = 2000;
const CHUNK_CHARS = 130;
const MAX_BODY_BYTES = 16384;
const MAX_AUDIO_BYTES = 24 * 1024 * 1024;
const MAX_QUEUE = 8;
const DEADLINE_MS = 150000;
let active = false;
type Waiter = { enter: () => void; reject: (error: Error) => void; signal: AbortSignal; abort: () => void };
const waiting: Waiter[] = [];

class SpeechError extends Error {
  constructor(readonly status: number, readonly code: string, message: string) { super(message); }
}

function failure(status: number, code: string, message: string) {
  return Response.json({ error: { message, type: 'speech_error', code } }, {
    status, headers: { 'Cache-Control': 'no-store' },
  });
}

function releaseSlot() {
  const next = waiting.shift();
  if (next) {
    next.signal.removeEventListener('abort', next.abort);
    next.enter();
  } else active = false;
}

async function acquireSlot(signal: AbortSignal): Promise<() => void> {
  signal.throwIfAborted();
  if (active) {
    if (waiting.length >= MAX_QUEUE) throw new SpeechError(429, 'tts_busy', 'Speech service is busy.');
    await new Promise<void>((resolve, reject) => {
      const waiter: Waiter = { enter: resolve, reject, signal, abort: () => {
        const index = waiting.indexOf(waiter);
        if (index >= 0) waiting.splice(index, 1);
        reject(new SpeechError(504, 'tts_timeout', 'Speech request timed out.'));
      } };
      waiting.push(waiter);
      signal.addEventListener('abort', waiter.abort, { once: true });
    });
  } else active = true;
  let released = false;
  return () => { if (!released) { released = true; releaseSlot(); } };
}

async function readBounded(body: ReadableStream<Uint8Array> | null, maximum: number, signal: AbortSignal): Promise<Buffer> {
  if (!body) return Buffer.alloc(0);
  const reader = body.getReader();
  const buffers: Buffer[] = [];
  let total = 0;
  const cancel = () => { void reader.cancel().catch(() => {}); };
  signal.addEventListener('abort', cancel, { once: true });
  try {
    while (true) {
      signal.throwIfAborted();
      const { done, value } = await reader.read();
      signal.throwIfAborted();
      if (done) break;
      total += value.byteLength;
      if (total > maximum) {
        cancel();
        throw new SpeechError(413, 'tts_payload_too_large', 'Speech payload exceeds the size limit.');
      }
      buffers.push(Buffer.from(value));
    }
    return Buffer.concat(buffers, total);
  } finally {
    signal.removeEventListener('abort', cancel);
    reader.releaseLock();
  }
}

function splitText(text: string): string[] {
  const chunks: string[] = [];
  let current = '';
  let currentLength = 0;
  for (const sentence of text.match(/[^。！？!?；;\n]+[。！？!?；;\n]*|[。！？!?；;\n]+/gu) ?? [text]) {
    const characters = Array.from(sentence);
    if (currentLength && currentLength + characters.length > CHUNK_CHARS) {
      if (current.trim()) chunks.push(current.trim());
      current = ''; currentLength = 0;
    }
    while (characters.length > CHUNK_CHARS) {
      const piece = characters.splice(0, CHUNK_CHARS).join('').trim();
      if (piece) chunks.push(piece);
    }
    current += characters.join('');
    currentLength += characters.length;
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

function mp3Bytes(buffer: Buffer, keepId3: boolean): Buffer {
  let offset = 0;
  if (buffer.subarray(0, 3).toString('ascii') === 'ID3') {
    if (buffer.length < 10 || ![2, 3, 4].includes(buffer[3]) || buffer.subarray(6, 10).some((byte) => byte > 127)) {
      throw new SpeechError(502, 'tts_invalid_audio', 'Speech service returned invalid audio.');
    }
    const tagSize = buffer[6] * 2097152 + buffer[7] * 16384 + buffer[8] * 128 + buffer[9];
    offset = 10 + tagSize + (buffer[3] === 4 && (buffer[5] & 0x10) ? 10 : 0);
  }
  // Validate an MPEG audio frame after any ID3v2 metadata; never return a JSON/HTML error as audio.
  if (buffer.length < offset + 4 || buffer[offset] !== 255 || (buffer[offset + 1] & 0xe0) !== 0xe0
    || ((buffer[offset + 1] >> 3) & 3) === 1 || ((buffer[offset + 1] >> 1) & 3) === 0
    || (buffer[offset + 2] >> 4) === 15 || ((buffer[offset + 2] >> 2) & 3) === 3) {
    throw new SpeechError(502, 'tts_invalid_audio', 'Speech service returned invalid audio.');
  }
  const end = buffer.length >= 128 && buffer.subarray(buffer.length - 128, buffer.length - 125).toString('ascii') === 'TAG'
    ? buffer.length - 128 : buffer.length;
  return buffer.subarray(keepId3 ? 0 : offset, end);
}

export async function POST(request: Request) {
  const secret = process.env.CODEMATE_OPENMAIC_TTS_SECRET;
  const authorization = request.headers.get('authorization') ?? '';
  const supplied = /^Bearer ([^\s]+)$/i.exec(authorization)?.[1] ?? '';
  if (!secret || !supplied || !timingSafeEqual(
    createHash('sha256').update(supplied).digest(), createHash('sha256').update(secret).digest(),
  )) return failure(401, 'unauthorized', 'A valid speech credential is required.');

  const baseUrl = process.env.NOIZ_BASE_URL;
  const apiKey = process.env.NOIZ_API_KEY;
  const voiceId = process.env.NOIZ_VOICE_ID;
  if (!baseUrl || !apiKey || !voiceId) return failure(503, 'tts_unconfigured', 'Speech service is unavailable.');
  let endpoint: string;
  try {
    const url = new URL(baseUrl.replace(/\/+$/, '') + '/text-to-speech');
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) throw new Error();
    endpoint = url.toString();
  } catch { return failure(503, 'tts_unconfigured', 'Speech service is unavailable.'); }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DEADLINE_MS);
  const signal = AbortSignal.any([request.signal, controller.signal]);
  let release: (() => void) | undefined;
  try {
    if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) {
      return failure(400, 'invalid_request', 'A JSON speech request is required.');
    }
    const raw = await readBounded(request.body, MAX_BODY_BYTES, signal);
    let body: { input?: unknown; response_format?: unknown };
    try { body = JSON.parse(raw.toString('utf8')); }
    catch { return failure(400, 'invalid_request', 'Invalid JSON speech request.'); }
    if (!body || typeof body !== 'object' || Array.isArray(body) || typeof body.input !== 'string'
      || !body.input.trim() || Array.from(body.input).length > MAX_INPUT_CHARS) {
      return failure(400, 'invalid_input', `Speech input must contain 1 to ${MAX_INPUT_CHARS} characters.`);
    }
    if (body.response_format !== undefined && body.response_format !== 'mp3') {
      return failure(400, 'unsupported_format', 'Only mp3 speech output is supported.');
    }
    const chunks = splitText(body.input.trim());
    release = await acquireSlot(signal);
    const audio: Buffer[] = [];
    let total = 0;
    for (const chunk of chunks) {
      signal.throwIfAborted();
      const form = new FormData();
      form.set('text', chunk);
      form.set('voice_id', voiceId);
      form.set('output_format', 'mp3');
      const upstream = await fetch(endpoint, {
        method: 'POST', headers: { Authorization: apiKey }, body: form,
        signal: AbortSignal.any([signal, AbortSignal.timeout(60000)]), redirect: 'error',
      });
      if (!upstream.ok || !/^audio\//i.test(upstream.headers.get('content-type') ?? '')) {
        void upstream.body?.cancel().catch(() => {});
        throw new SpeechError(502, 'tts_upstream_failed', 'Speech service could not generate audio.');
      }
      const bytes = await readBounded(upstream.body, MAX_AUDIO_BYTES - total, signal);
      const output = mp3Bytes(bytes, audio.length === 0);
      total += output.length;
      audio.push(output);
    }
    signal.throwIfAborted();
    return new Response(new Uint8Array(Buffer.concat(audio, total)), {
      status: 200,
      headers: { 'Content-Type': 'audio/mpeg', 'Content-Length': String(total), 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    if (signal.aborted || (error instanceof Error && ['AbortError', 'TimeoutError'].includes(error.name))) {
      return failure(504, 'tts_timeout', 'Speech request timed out.');
    }
    if (error instanceof SpeechError) return failure(error.status, error.code, error.message);
    return failure(502, 'tts_upstream_failed', 'Speech service could not generate audio.');
  } finally {
    clearTimeout(timer);
    release?.();
  }
}
