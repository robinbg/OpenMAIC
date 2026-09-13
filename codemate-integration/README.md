# CodeMate × OpenMAIC

This integration runs the official OpenMAIC application at `/data/dev-codemate/OpenMAIC`, pinned initially to `1e10f60b151cedb59ac21ddbcceb5ee0eed9c984` (v1.0.0, MIT). Classroom planning, GenUI generation, slides, quizzes, orchestration and playback are provided by that project.

CodeMate now uses `POST /ai-correction/openmaic` to create or reuse a classroom from an authorized correction record, and `GET /ai-correction/openmaic?rid=…` to check it. Its UI embeds the official classroom. The old local text/TTS lesson code is retained for compatibility but is no longer the main button.

Small OpenMAIC extensions:

- `/api/access-code/codemate`: validates a 60-second HMAC launch link, creates the official HttpOnly session cookie and redirects to the classroom. Long-lived secrets stay server-side.
- `/api/access-code/codemate-tts/audio/speech`: authenticated OpenAI-format TTS adapter backed by the existing Noiz voice. It chunks narration, validates MP3 output, serializes requests and applies deadlines.
- `experimental.cpus=1`: limits build workers on this shared development host.

Configuration is in `OpenMAIC/.env.local` and the backend's private environment. `work/openmaic-integration/configure.cjs` copies the existing CodeMate AI/image/Noiz configuration without printing its keys. It stages backend settings in `work/openmaic-integration/backend.env`; activation is a separate step.

The default development public origin is `http://106.52.206.55:13010`, with frame parents `http://106.52.206.55:13000` and `http://106.52.206.55:13080`. For an HTTPS site, set an HTTPS public origin and precise `ALLOWED_FRAME_ANCESTORS`, rebuild OpenMAIC, and update the backend public URL. A plain `/openmaic/` path proxy is not sufficient: upstream uses root-relative routes.

The official access cookie grants access to this development instance, not a per-record tenant sandbox. The CodeMate bridge rechecks record permissions on every request. A separate multi-user deployment needs a corresponding tenant/session policy for the native OpenMAIC APIs.

Media provider configuration is not proof that assets were generated. The bridge checks the stored classroom for actual native interactive HTML and reports missing/unverified interaction. The runtime still needs provider credentials and quota to generate images/audio. Video generation is only enabled if a video provider is configured. This host does not enable the optional MP4 render service (upstream requires at least 4 GiB for its low-memory profile).

Validation commands, from `/data/dev-codemate`:

```sh
OpenMAIC/node_modules/.bin/tsx --test aioj-core/packages/codemate-plugin/plugins/ai-correction/openmaic.test.ts
TYPESCRIPT_PATH=/data/dev-codemate/aioj-core/node_modules/typescript node --test OpenMAIC/codemate-integration/test-launch.cjs OpenMAIC/codemate-integration/test-tts.cjs
```

These 34 automated tests use mocks and do not spend model/TTS credits. Actual generation and browser checks are separate deployment acceptance steps. Logs and source backups are under `work/openmaic-integration/`. Each changed pre-existing application file was hash-checked against the original snapshot before installation, then copied into the dated backups directory.

Official source: https://github.com/THU-MAIC/OpenMAIC
