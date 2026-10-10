import { afterEach, describe, expect, test } from 'vitest';
import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';
import type { Scene } from '@/lib/types/stage';
import {
  prepareClassroomAudioAssets,
  persistClassroomAudioAssets,
} from '@/lib/server/classroom-audio-import';

const bytes = Buffer.from('ID3 narration bytes');
const id = 'ast_testaudio';
const asset = (extra = {}) => ({
  id,
  base64: bytes.toString('base64'),
  mimeType: 'audio/mpeg',
  ...extra,
});
const scenes = () =>
  [{ actions: [{ id: 'speech1', type: 'speech', text: 'Welcome', audioId: id }] }] as Scene[];
const temporary: string[] = [];
afterEach(async () => {
  await Promise.all(temporary.splice(0).map((dir) => fs.rm(dir, { recursive: true, force: true })));
});

describe('imported classroom narration', () => {
  test('writes referenced bytes and attaches a retrievable URL to every occurrence', async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'classroom-audio-'));
    temporary.push(dir);
    const data = scenes();
    data[0].actions!.push({ ...data[0].actions![0], id: 'speech2' });
    const assets = prepareClassroomAudioAssets(data, [asset()]);
    await persistClassroomAudioAssets(
      assets,
      dir,
      'http://classroom/api/classroom-media/class1/audio/',
      data,
    );
    const audioUrl = (data[0].actions![0] as { audioUrl?: string }).audioUrl!;
    expect(audioUrl).toMatch(
      /^http:\/\/classroom\/api\/classroom-media\/class1\/audio\/ast_testaudio-[a-f0-9]+\.mp3$/,
    );
    expect(await fs.readFile(path.join(dir, path.basename(audioUrl)))).toEqual(bytes);
    expect((data[0].actions![1] as { audioUrl?: string }).audioUrl).toBe(audioUrl);
    expect(await fs.readdir(dir)).toEqual([assets[0].filename]);
  });
  test('unchanged bytes keep a stable URL and replacements cannot reuse immutable cache URLs', () => {
    expect(prepareClassroomAudioAssets(scenes(), [asset()])[0].filename).toBe(
      prepareClassroomAudioAssets(scenes(), [asset()])[0].filename,
    );
    expect(
      prepareClassroomAudioAssets(scenes(), [
        asset({ base64: Buffer.from('ID3 replacement').toString('base64') }),
      ])[0].filename,
    ).not.toBe(prepareClassroomAudioAssets(scenes(), [asset()])[0].filename);
  });
  test('legacy payloads without audio assets remain supported', () => {
    expect(prepareClassroomAudioAssets(scenes(), undefined)).toEqual([]);
  });
  test('supports same-origin media URLs without leaking the backend import origin', async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'classroom-audio-'));
    temporary.push(dir);
    const data = scenes();
    await persistClassroomAudioAssets(
      prepareClassroomAudioAssets(data, [asset()]),
      dir,
      '/api/classroom-media/class1/audio',
      data,
    );
    const audioUrl = (data[0].actions![0] as { audioUrl?: string }).audioUrl!;
    expect(new URL(audioUrl, 'http://public-classroom:13010').origin).toBe(
      'http://public-classroom:13010',
    );
    expect(await fs.readFile(path.join(dir, path.basename(audioUrl)))).toEqual(bytes);
  });
  test.each([
    ['unreferenced', [asset({ id: 'ast_other' })]],
    ['path traversal', [asset({ id: 'ast_../../outside' })]],
    ['duplicates', [asset(), asset()]],
    ['empty', [asset({ base64: '' })]],
    ['invalid base64', [asset({ base64: '%%%=' })]],
    [
      'HTML body',
      [asset({ base64: Buffer.from('<html>upstream failed</html>').toString('base64') })],
    ],
    ['incorrect MIME', [asset({ mimeType: 'text/html' })]],
    ['too many', Array.from({ length: 129 }, () => asset())],
    [
      'too large',
      [
        asset({
          base64: Buffer.concat([Buffer.from('ID3'), Buffer.alloc(8 * 1024 * 1024)]).toString(
            'base64',
          ),
        }),
      ],
    ],
  ])('rejects %s before writing any asset', (_name, input) => {
    expect(() => prepareClassroomAudioAssets(scenes(), input)).toThrow();
  });
  test('write failures leave narration references unchanged', async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'classroom-audio-'));
    temporary.push(dir);
    const file = path.join(dir, 'file');
    await fs.writeFile(file, 'not a directory');
    const data = scenes();
    await expect(
      persistClassroomAudioAssets(
        prepareClassroomAudioAssets(data, [asset()]),
        file,
        '/audio',
        data,
      ),
    ).rejects.toThrow();
    expect(data[0].actions![0]).not.toHaveProperty('audioUrl');
  });
});
