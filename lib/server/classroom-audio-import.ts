import { createHash, randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';
import type { Scene } from '@/lib/types/stage';

export const MAX_CLASSROOM_AUDIO_BYTES = 64 * 1024 * 1024;
const MAX_AUDIO_BYTES = 8 * 1024 * 1024;
const MAX_AUDIO_ASSETS = 128;

export class ClassroomAudioImportError extends Error {}

interface ImportedAudio {
  id: string;
  filename: string;
  bytes: Buffer;
}

/** Transport assets must belong to narration in this classroom, never arbitrary files. */
export function prepareClassroomAudioAssets(
  scenes: readonly Scene[],
  input: unknown,
): ImportedAudio[] {
  if (input === undefined) return [];
  if (!Array.isArray(input) || input.length > MAX_AUDIO_ASSETS) {
    throw new ClassroomAudioImportError('Invalid classroom audio asset list');
  }
  const referenced = new Set<string>();
  for (const scene of scenes) {
    for (const action of scene.actions ?? []) {
      if (action.type === 'speech' && action.audioId) referenced.add(action.audioId);
    }
  }
  const seen = new Set<string>();
  let total = 0;
  return input.map((item) => {
    if (
      !item ||
      typeof item !== 'object' ||
      typeof item.id !== 'string' ||
      !/^ast_[a-zA-Z0-9_-]{1,96}$/.test(item.id) ||
      !referenced.has(item.id) ||
      seen.has(item.id) ||
      !['audio/mpeg', 'audio/mp3'].includes(item.mimeType) ||
      typeof item.base64 !== 'string' ||
      !item.base64.length ||
      item.base64.length > Math.ceil(MAX_AUDIO_BYTES / 3) * 4 ||
      item.base64.length % 4 !== 0 ||
      !/^[A-Za-z0-9+/]*={0,2}$/.test(item.base64)
    ) {
      throw new ClassroomAudioImportError('Invalid or unreferenced classroom audio asset');
    }
    const bytes = Buffer.from(item.base64, 'base64');
    total += bytes.length;
    if (
      bytes.length < 3 ||
      bytes.length > MAX_AUDIO_BYTES ||
      total > MAX_CLASSROOM_AUDIO_BYTES ||
      bytes.toString('base64') !== item.base64 ||
      !(
        bytes.subarray(0, 3).toString('ascii') === 'ID3' ||
        (bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0)
      )
    ) {
      throw new ClassroomAudioImportError('Invalid or oversized classroom MP3 audio');
    }
    seen.add(item.id);
    // Content-addressed names agree with the immutable media-serving cache.
    const hash = createHash('sha256').update(bytes).digest('hex').slice(0, 20);
    return { id: item.id, filename: `${item.id}-${hash}.mp3`, bytes };
  });
}

/** Publish complete audio files before the classroom JSON can reference them. */
export async function persistClassroomAudioAssets(
  assets: readonly ImportedAudio[],
  audioDir: string,
  publicBaseUrl: string,
  scenes: Scene[],
): Promise<void> {
  if (!assets.length) return;
  await fs.mkdir(audioDir, { recursive: true });
  const urls = new Map<string, string>();
  for (const asset of assets) {
    const temporary = path.join(audioDir, `.${asset.filename}.${randomUUID()}.tmp`);
    try {
      await fs.writeFile(temporary, asset.bytes, { flag: 'wx' });
      await fs.rename(temporary, path.join(audioDir, asset.filename));
    } finally {
      await fs.unlink(temporary).catch((error: NodeJS.ErrnoException) => {
        if (error.code !== 'ENOENT') throw error;
      });
    }
    urls.set(asset.id, `${publicBaseUrl.replace(/\/$/, '')}/${asset.filename}`);
  }
  for (const scene of scenes) {
    for (const action of scene.actions ?? []) {
      if (action.type !== 'speech' || !action.audioId) continue;
      const audioUrl = urls.get(action.audioId);
      if (audioUrl) Object.assign(action, { audioUrl });
    }
  }
}
