import { type NextRequest } from 'next/server';
import { randomUUID } from 'crypto';
import { apiSuccess, apiError, API_ERROR_CODES } from '@/lib/server/api-response';
import {
  buildRequestOrigin,
  isValidClassroomId,
  persistClassroom,
  readClassroom,
} from '@/lib/server/classroom-storage';
import { createLogger } from '@/lib/logger';
import {
  ClassroomAudioImportError,
  MAX_CLASSROOM_AUDIO_BYTES,
} from '@/lib/server/classroom-audio-import';

const log = createLogger('Classroom API');

export async function POST(request: NextRequest) {
  let stageId: string | undefined;
  let sceneCount: number | undefined;
  try {
    // Base64 plus ordinary scene content; reject obvious oversized transports before parsing.
    if (Number(request.headers.get('content-length') || 0) > MAX_CLASSROOM_AUDIO_BYTES * 1.5) {
      return apiError(API_ERROR_CODES.INVALID_REQUEST, 413, 'Classroom import is too large');
    }
    const body = await request.json();
    const { stage, scenes, audioAssets } = body;
    stageId = stage?.id;
    sceneCount = scenes?.length;

    if (!stage || !Array.isArray(scenes)) {
      return apiError(
        API_ERROR_CODES.MISSING_REQUIRED_FIELD,
        400,
        'Missing required fields: stage, scenes',
      );
    }

    const id = stage.id || randomUUID();
    const baseUrl = buildRequestOrigin(request);

    const persisted = await persistClassroom(
      { id, stage: { ...stage, id }, scenes, audioAssets },
      baseUrl,
    );

    return apiSuccess({ id: persisted.id, url: persisted.url }, 201);
  } catch (error) {
    if (error instanceof ClassroomAudioImportError) {
      return apiError(API_ERROR_CODES.INVALID_REQUEST, 400, error.message);
    }
    log.error(
      `Classroom storage failed [stageId=${stageId ?? 'unknown'}, scenes=${sceneCount ?? 0}]:`,
      error,
    );
    return apiError(
      API_ERROR_CODES.INTERNAL_ERROR,
      500,
      'Failed to store classroom',
      error instanceof Error ? error.message : String(error),
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');

    if (!id) {
      return apiError(
        API_ERROR_CODES.MISSING_REQUIRED_FIELD,
        400,
        'Missing required parameter: id',
      );
    }

    if (!isValidClassroomId(id)) {
      return apiError(API_ERROR_CODES.INVALID_REQUEST, 400, 'Invalid classroom id');
    }

    const classroom = await readClassroom(id);
    if (!classroom) {
      return apiError(API_ERROR_CODES.INVALID_REQUEST, 404, 'Classroom not found');
    }

    return apiSuccess({ classroom });
  } catch (error) {
    log.error(
      `Classroom retrieval failed [id=${request.nextUrl.searchParams.get('id') ?? 'unknown'}]:`,
      error,
    );
    return apiError(
      API_ERROR_CODES.INTERNAL_ERROR,
      500,
      'Failed to retrieve classroom',
      error instanceof Error ? error.message : String(error),
    );
  }
}
