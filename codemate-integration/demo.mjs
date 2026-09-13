import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require2() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key2 of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key2) && key2 !== except)
        __defProp(to, key2, { get: () => from[key2], enumerable: !(desc = __getOwnPropDesc(from, key2)) || desc.enumerable });
  }
  return to;
};
var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// aioj-core/node_modules/dotenv/package.json
var require_package = __commonJS({
  "aioj-core/node_modules/dotenv/package.json"(exports, module) {
    module.exports = {
      name: "dotenv",
      version: "16.4.5",
      description: "Loads environment variables from .env file",
      main: "lib/main.js",
      types: "lib/main.d.ts",
      exports: {
        ".": {
          types: "./lib/main.d.ts",
          require: "./lib/main.js",
          default: "./lib/main.js"
        },
        "./config": "./config.js",
        "./config.js": "./config.js",
        "./lib/env-options": "./lib/env-options.js",
        "./lib/env-options.js": "./lib/env-options.js",
        "./lib/cli-options": "./lib/cli-options.js",
        "./lib/cli-options.js": "./lib/cli-options.js",
        "./package.json": "./package.json"
      },
      scripts: {
        "dts-check": "tsc --project tests/types/tsconfig.json",
        lint: "standard",
        "lint-readme": "standard-markdown",
        pretest: "npm run lint && npm run dts-check",
        test: "tap tests/*.js --100 -Rspec",
        "test:coverage": "tap --coverage-report=lcov",
        prerelease: "npm test",
        release: "standard-version"
      },
      repository: {
        type: "git",
        url: "git://github.com/motdotla/dotenv.git"
      },
      funding: "https://dotenvx.com",
      keywords: [
        "dotenv",
        "env",
        ".env",
        "environment",
        "variables",
        "config",
        "settings"
      ],
      readmeFilename: "README.md",
      license: "BSD-2-Clause",
      devDependencies: {
        "@definitelytyped/dtslint": "^0.0.133",
        "@types/node": "^18.11.3",
        decache: "^4.6.1",
        sinon: "^14.0.1",
        standard: "^17.0.0",
        "standard-markdown": "^7.1.0",
        "standard-version": "^9.5.0",
        tap: "^16.3.0",
        tar: "^6.1.11",
        typescript: "^4.8.4"
      },
      engines: {
        node: ">=12"
      },
      browser: {
        fs: false
      }
    };
  }
});

// aioj-core/node_modules/dotenv/lib/main.js
var require_main = __commonJS({
  "aioj-core/node_modules/dotenv/lib/main.js"(exports, module) {
    "use strict";
    var fs6 = __require("fs");
    var path6 = __require("path");
    var os = __require("os");
    var crypto3 = __require("crypto");
    var packageJson = require_package();
    var version = packageJson.version;
    var LINE = /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/mg;
    function parse(src) {
      const obj = {};
      let lines = src.toString();
      lines = lines.replace(/\r\n?/mg, "\n");
      let match;
      while ((match = LINE.exec(lines)) != null) {
        const key2 = match[1];
        let value = match[2] || "";
        value = value.trim();
        const maybeQuote = value[0];
        value = value.replace(/^(['"`])([\s\S]*)\1$/mg, "$2");
        if (maybeQuote === '"') {
          value = value.replace(/\\n/g, "\n");
          value = value.replace(/\\r/g, "\r");
        }
        obj[key2] = value;
      }
      return obj;
    }
    function _parseVault(options4) {
      const vaultPath = _vaultPath(options4);
      const result = DotenvModule.configDotenv({ path: vaultPath });
      if (!result.parsed) {
        const err = new Error(`MISSING_DATA: Cannot parse ${vaultPath} for an unknown reason`);
        err.code = "MISSING_DATA";
        throw err;
      }
      const keys = _dotenvKey(options4).split(",");
      const length = keys.length;
      let decrypted;
      for (let i = 0; i < length; i++) {
        try {
          const key2 = keys[i].trim();
          const attrs = _instructions(result, key2);
          decrypted = DotenvModule.decrypt(attrs.ciphertext, attrs.key);
          break;
        } catch (error) {
          if (i + 1 >= length) {
            throw error;
          }
        }
      }
      return DotenvModule.parse(decrypted);
    }
    function _log(message) {
      console.log(`[dotenv@${version}][INFO] ${message}`);
    }
    function _warn(message) {
      console.log(`[dotenv@${version}][WARN] ${message}`);
    }
    function _debug(message) {
      console.log(`[dotenv@${version}][DEBUG] ${message}`);
    }
    function _dotenvKey(options4) {
      if (options4 && options4.DOTENV_KEY && options4.DOTENV_KEY.length > 0) {
        return options4.DOTENV_KEY;
      }
      if (process.env.DOTENV_KEY && process.env.DOTENV_KEY.length > 0) {
        return process.env.DOTENV_KEY;
      }
      return "";
    }
    function _instructions(result, dotenvKey) {
      let uri;
      try {
        uri = new URL(dotenvKey);
      } catch (error) {
        if (error.code === "ERR_INVALID_URL") {
          const err = new Error("INVALID_DOTENV_KEY: Wrong format. Must be in valid uri format like dotenv://:key_1234@dotenvx.com/vault/.env.vault?environment=development");
          err.code = "INVALID_DOTENV_KEY";
          throw err;
        }
        throw error;
      }
      const key2 = uri.password;
      if (!key2) {
        const err = new Error("INVALID_DOTENV_KEY: Missing key part");
        err.code = "INVALID_DOTENV_KEY";
        throw err;
      }
      const environment = uri.searchParams.get("environment");
      if (!environment) {
        const err = new Error("INVALID_DOTENV_KEY: Missing environment part");
        err.code = "INVALID_DOTENV_KEY";
        throw err;
      }
      const environmentKey = `DOTENV_VAULT_${environment.toUpperCase()}`;
      const ciphertext = result.parsed[environmentKey];
      if (!ciphertext) {
        const err = new Error(`NOT_FOUND_DOTENV_ENVIRONMENT: Cannot locate environment ${environmentKey} in your .env.vault file.`);
        err.code = "NOT_FOUND_DOTENV_ENVIRONMENT";
        throw err;
      }
      return { ciphertext, key: key2 };
    }
    function _vaultPath(options4) {
      let possibleVaultPath = null;
      if (options4 && options4.path && options4.path.length > 0) {
        if (Array.isArray(options4.path)) {
          for (const filepath of options4.path) {
            if (fs6.existsSync(filepath)) {
              possibleVaultPath = filepath.endsWith(".vault") ? filepath : `${filepath}.vault`;
            }
          }
        } else {
          possibleVaultPath = options4.path.endsWith(".vault") ? options4.path : `${options4.path}.vault`;
        }
      } else {
        possibleVaultPath = path6.resolve(process.cwd(), ".env.vault");
      }
      if (fs6.existsSync(possibleVaultPath)) {
        return possibleVaultPath;
      }
      return null;
    }
    function _resolveHome(envPath) {
      return envPath[0] === "~" ? path6.join(os.homedir(), envPath.slice(1)) : envPath;
    }
    function _configVault(options4) {
      _log("Loading env from encrypted .env.vault");
      const parsed = DotenvModule._parseVault(options4);
      let processEnv = process.env;
      if (options4 && options4.processEnv != null) {
        processEnv = options4.processEnv;
      }
      DotenvModule.populate(processEnv, parsed, options4);
      return { parsed };
    }
    function configDotenv(options4) {
      const dotenvPath = path6.resolve(process.cwd(), ".env");
      let encoding = "utf8";
      const debug = Boolean(options4 && options4.debug);
      if (options4 && options4.encoding) {
        encoding = options4.encoding;
      } else {
        if (debug) {
          _debug("No encoding is specified. UTF-8 is used by default");
        }
      }
      let optionPaths = [dotenvPath];
      if (options4 && options4.path) {
        if (!Array.isArray(options4.path)) {
          optionPaths = [_resolveHome(options4.path)];
        } else {
          optionPaths = [];
          for (const filepath of options4.path) {
            optionPaths.push(_resolveHome(filepath));
          }
        }
      }
      let lastError;
      const parsedAll = {};
      for (const path7 of optionPaths) {
        try {
          const parsed = DotenvModule.parse(fs6.readFileSync(path7, { encoding }));
          DotenvModule.populate(parsedAll, parsed, options4);
        } catch (e) {
          if (debug) {
            _debug(`Failed to load ${path7} ${e.message}`);
          }
          lastError = e;
        }
      }
      let processEnv = process.env;
      if (options4 && options4.processEnv != null) {
        processEnv = options4.processEnv;
      }
      DotenvModule.populate(processEnv, parsedAll, options4);
      if (lastError) {
        return { parsed: parsedAll, error: lastError };
      } else {
        return { parsed: parsedAll };
      }
    }
    function config(options4) {
      if (_dotenvKey(options4).length === 0) {
        return DotenvModule.configDotenv(options4);
      }
      const vaultPath = _vaultPath(options4);
      if (!vaultPath) {
        _warn(`You set DOTENV_KEY but you are missing a .env.vault file at ${vaultPath}. Did you forget to build it?`);
        return DotenvModule.configDotenv(options4);
      }
      return DotenvModule._configVault(options4);
    }
    function decrypt(encrypted, keyStr) {
      const key2 = Buffer.from(keyStr.slice(-64), "hex");
      let ciphertext = Buffer.from(encrypted, "base64");
      const nonce = ciphertext.subarray(0, 12);
      const authTag = ciphertext.subarray(-16);
      ciphertext = ciphertext.subarray(12, -16);
      try {
        const aesgcm = crypto3.createDecipheriv("aes-256-gcm", key2, nonce);
        aesgcm.setAuthTag(authTag);
        return `${aesgcm.update(ciphertext)}${aesgcm.final()}`;
      } catch (error) {
        const isRange = error instanceof RangeError;
        const invalidKeyLength = error.message === "Invalid key length";
        const decryptionFailed = error.message === "Unsupported state or unable to authenticate data";
        if (isRange || invalidKeyLength) {
          const err = new Error("INVALID_DOTENV_KEY: It must be 64 characters long (or more)");
          err.code = "INVALID_DOTENV_KEY";
          throw err;
        } else if (decryptionFailed) {
          const err = new Error("DECRYPTION_FAILED: Please check your DOTENV_KEY");
          err.code = "DECRYPTION_FAILED";
          throw err;
        } else {
          throw error;
        }
      }
    }
    function populate(processEnv, parsed, options4 = {}) {
      const debug = Boolean(options4 && options4.debug);
      const override = Boolean(options4 && options4.override);
      if (typeof parsed !== "object") {
        const err = new Error("OBJECT_REQUIRED: Please check the processEnv argument being passed to populate");
        err.code = "OBJECT_REQUIRED";
        throw err;
      }
      for (const key2 of Object.keys(parsed)) {
        if (Object.prototype.hasOwnProperty.call(processEnv, key2)) {
          if (override === true) {
            processEnv[key2] = parsed[key2];
          }
          if (debug) {
            if (override === true) {
              _debug(`"${key2}" is already defined and WAS overwritten`);
            } else {
              _debug(`"${key2}" is already defined and was NOT overwritten`);
            }
          }
        } else {
          processEnv[key2] = parsed[key2];
        }
      }
    }
    var DotenvModule = {
      configDotenv,
      _configVault,
      _parseVault,
      config,
      decrypt,
      parse,
      populate
    };
    module.exports.configDotenv = DotenvModule.configDotenv;
    module.exports._configVault = DotenvModule._configVault;
    module.exports._parseVault = DotenvModule._parseVault;
    module.exports.config = DotenvModule.config;
    module.exports.decrypt = DotenvModule.decrypt;
    module.exports.parse = DotenvModule.parse;
    module.exports.populate = DotenvModule.populate;
    module.exports = DotenvModule;
  }
});

// OpenMAIC/lib/logger.ts
function getMinLevel() {
  const env = (process.env.LOG_LEVEL ?? "info").toLowerCase();
  return env in LOG_LEVELS ? env : "info";
}
function isJsonFormat() {
  return process.env.LOG_FORMAT === "json";
}
function formatLine(level, tag, args) {
  const timestamp = (/* @__PURE__ */ new Date()).toISOString();
  const upperLevel = level.toUpperCase();
  const msg = args.map(
    (a) => a instanceof Error ? a.stack ?? a.message : typeof a === "string" ? a : JSON.stringify(a)
  ).join(" ");
  if (isJsonFormat()) {
    return JSON.stringify({ timestamp, level: upperLevel, tag, message: msg });
  }
  return `[${timestamp}] [${upperLevel}] [${tag}] ${msg}`;
}
function createLogger(tag) {
  const emit = (level, args) => {
    if (LOG_LEVELS[level] < LOG_LEVELS[getMinLevel()]) return;
    const line = formatLine(level, tag, args);
    const fn = level === "debug" ? console.debug : level === "warn" ? console.warn : level === "error" ? console.error : console.log;
    fn(line);
  };
  return {
    debug: (...args) => emit("debug", args),
    info: (...args) => emit("info", args),
    warn: (...args) => emit("warn", args),
    error: (...args) => emit("error", args)
  };
}
var LOG_LEVELS;
var init_logger = __esm({
  "OpenMAIC/lib/logger.ts"() {
    "use strict";
    LOG_LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
  }
});

// OpenMAIC/lib/ai/reasoning-sse.ts
function encodeKimiReasoning(text) {
  return `${KIMI_REASONING_MARKER}${text.length}:${text}`;
}
function extractKimiReasoning(content) {
  let remaining = content;
  let reasoning = "";
  for (; ; ) {
    const markerIndex = remaining.indexOf(KIMI_REASONING_MARKER);
    if (markerIndex < 0) break;
    const lengthStart = markerIndex + KIMI_REASONING_MARKER.length;
    const separatorIndex = remaining.indexOf(":", lengthStart);
    if (separatorIndex < 0) break;
    const lengthText = remaining.slice(lengthStart, separatorIndex);
    if (!/^\d+$/.test(lengthText)) break;
    const reasoningLength = Number(lengthText);
    const reasoningStart = separatorIndex + 1;
    const reasoningEnd = reasoningStart + reasoningLength;
    if (reasoningEnd > remaining.length) break;
    reasoning += remaining.slice(reasoningStart, reasoningEnd);
    remaining = remaining.slice(0, markerIndex) + remaining.slice(reasoningEnd);
  }
  return reasoning ? { content: remaining, reasoning } : { content };
}
function createKimiReasoningPreservationMiddleware() {
  return {
    specificationVersion: "v3",
    transformParams: async ({ params }) => ({
      ...params,
      prompt: params.prompt.map(
        (message) => message.role !== "assistant" ? message : {
          ...message,
          content: message.content.map(
            (part) => part.type === "reasoning" ? { type: "text", text: encodeKimiReasoning(part.text) } : part
          )
        }
      )
    })
  };
}
function restoreKimiReasoningInRequestBody(body) {
  if (!body || typeof body !== "object") return;
  const messages = body.messages;
  if (!Array.isArray(messages)) return;
  for (const message of messages) {
    if (!message || typeof message !== "object") continue;
    const record = message;
    if (record.role !== "assistant" || typeof record.content !== "string") continue;
    const restored = extractKimiReasoning(record.content);
    if (!restored.reasoning) continue;
    record.reasoning_content = restored.reasoning;
    record.content = restored.content === "" && Array.isArray(record.tool_calls) ? null : restored.content;
  }
}
function createReasoningContentRewriter() {
  let open = false;
  let closed = false;
  return function rewrite(chunk) {
    const choice = chunk.choices?.[0];
    const delta = choice?.delta;
    if (!delta) return chunk;
    const rc = delta.reasoning_content;
    const reasoning = typeof rc === "string" ? rc : "";
    if (reasoning !== "" && !closed) {
      const origContent = typeof delta.content === "string" ? delta.content : "";
      const prefix = open ? "" : "<think>";
      open = true;
      if (origContent !== "") {
        delta.content = prefix + reasoning + "</think>" + origContent;
        closed = true;
      } else {
        delta.content = prefix + reasoning;
      }
      delete delta.reasoning_content;
      return chunk;
    }
    if ("reasoning_content" in delta) delete delta.reasoning_content;
    if (open && !closed) {
      const hasContent = typeof delta.content === "string" && delta.content !== "";
      const hasToolCall = Array.isArray(delta.tool_calls) && delta.tool_calls.length > 0;
      const finishing = choice?.finish_reason != null;
      if (hasContent || hasToolCall || finishing) {
        delta.content = "</think>" + (typeof delta.content === "string" ? delta.content : "");
        closed = true;
      }
    }
    return chunk;
  };
}
function wrapResponseWithReasoning(response) {
  if (!response.body) return response;
  const rewrite = createReasoningContentRewriter();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";
  const rewriteLine = (line) => {
    if (!line.startsWith("data:")) return line;
    const payload = line.slice(5).trim();
    if (payload === "" || payload === "[DONE]") return line;
    try {
      const obj = rewrite(JSON.parse(payload));
      return "data: " + JSON.stringify(obj);
    } catch {
      return line;
    }
  };
  const transform = new TransformStream({
    transform(chunk, controller) {
      buffer += decoder.decode(chunk, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) controller.enqueue(encoder.encode(rewriteLine(line) + "\n"));
    },
    flush(controller) {
      if (buffer) controller.enqueue(encoder.encode(rewriteLine(buffer)));
    }
  });
  return new Response(response.body.pipeThrough(transform), {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers
  });
}
async function wrapJsonResponseWithReasoning(response) {
  let body;
  try {
    body = await response.clone().json();
  } catch {
    return response;
  }
  if (!body || typeof body !== "object") return response;
  const choices = body.choices;
  if (!Array.isArray(choices)) return response;
  let changed = false;
  for (const choice of choices) {
    if (!choice || typeof choice !== "object") continue;
    const message = choice.message;
    if (!message || typeof message !== "object") continue;
    const record = message;
    if (typeof record.reasoning_content !== "string" || record.reasoning_content === "") continue;
    const content = typeof record.content === "string" ? record.content : "";
    record.content = `<think>${record.reasoning_content}</think>${content}`;
    delete record.reasoning_content;
    changed = true;
  }
  if (!changed) return response;
  const headers = new Headers(response.headers);
  headers.delete("content-length");
  return new Response(JSON.stringify(body), {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}
var KIMI_REASONING_MARKER;
var init_reasoning_sse = __esm({
  "OpenMAIC/lib/ai/reasoning-sse.ts"() {
    "use strict";
    KIMI_REASONING_MARKER = "\0openmaic:kimi-reasoning:";
  }
});

// OpenMAIC/lib/ai/model-aliases.ts
function getCanonicalModelId(providerId, modelId) {
  return MODEL_ID_ALIASES.get(`${providerId}:${modelId}`) ?? modelId;
}
function modelIdsMatch(providerId, left, right) {
  return getCanonicalModelId(providerId, left) === getCanonicalModelId(providerId, right);
}
function findModelById(providerId, models, modelId) {
  const canonicalModelId = getCanonicalModelId(providerId, modelId);
  return models?.find((model) => model.id === canonicalModelId) ?? models?.find((model) => modelIdsMatch(providerId, model.id, modelId));
}
var MODEL_ID_ALIASES;
var init_model_aliases = __esm({
  "OpenMAIC/lib/ai/model-aliases.ts"() {
    "use strict";
    MODEL_ID_ALIASES = /* @__PURE__ */ new Map([["openai:gpt-5.6-sol", "gpt-5.6"]]);
  }
});

// OpenMAIC/lib/ai/model-metadata.ts
function getModelMetadataKey(providerId, modelId) {
  return `${providerId}:${modelId}`;
}
function effortCapability(requestAdapter, effortValues, defaultEffort) {
  return {
    control: "effort",
    requestAdapter,
    effortValues,
    defaultEffort,
    defaultMode: effortValues.includes("none") ? "disabled" : "enabled",
    toggleable: effortValues.includes("none"),
    budgetAdjustable: true,
    defaultEnabled: !effortValues.includes("none")
  };
}
function levelCapability(levelValues, defaultLevel) {
  return {
    control: "level",
    requestAdapter: "google",
    levelValues,
    defaultLevel,
    defaultMode: "enabled",
    toggleable: false,
    budgetAdjustable: true,
    defaultEnabled: true
  };
}
function toggleCapability(requestAdapter, defaultEnabled = true) {
  return {
    control: "toggle",
    requestAdapter,
    defaultMode: defaultEnabled ? "enabled" : "disabled",
    toggleable: true,
    budgetAdjustable: false,
    defaultEnabled
  };
}
function toggleBudgetCapability(requestAdapter, range, defaultEnabled = false, defaultBudgetTokens) {
  return {
    control: "toggle-budget",
    requestAdapter,
    budgetRange: range,
    defaultBudgetTokens,
    defaultMode: defaultEnabled ? "enabled" : "disabled",
    toggleable: true,
    budgetAdjustable: true,
    defaultEnabled
  };
}
function budgetOnlyCapability(requestAdapter, range, defaultBudgetTokens) {
  return {
    control: "budget-only",
    requestAdapter,
    budgetRange: range,
    defaultBudgetTokens,
    defaultMode: "enabled",
    toggleable: false,
    budgetAdjustable: true,
    defaultEnabled: true
  };
}
function getCatalogThinkingCapability(providerId, modelId) {
  const canonicalModelId = getCanonicalModelId(providerId, modelId);
  const exact = THINKING_CAPABILITIES[getModelMetadataKey(providerId, canonicalModelId)];
  if (exact) return exact;
  if (providerId === "lemonade") {
    return lemonadeToggleBudget;
  }
  return void 0;
}
function applyModelMetadata(providers) {
  for (const provider of Object.values(providers)) {
    for (const model of provider.models) {
      const thinking = getCatalogThinkingCapability(provider.id, model.id);
      if (thinking) {
        model.capabilities = {
          ...model.capabilities,
          thinking
        };
      }
    }
  }
}
var fixedThinkingCapability, anthropicManualBudgetByEffort, anthropicManualEffort, anthropicAdaptiveEffort, anthropicBudget, anthropicOpus47Effort, anthropicClaude5Effort, anthropicFable5Effort, kimiK3Effort, grok46Effort, grok45Effort, grok43Effort, deepseekEffort, glm52Effort, hunyuanHy3Effort, lemonadeToggleBudget, qwenBudgetEnabled, qwenBudgetDisabled, siliconflowBudget, siliconflowToggleBudget, doubaoMode, doubaoSeed20Effort, minimaxM3Thinking, openaiGpt56Effort, THINKING_CAPABILITIES;
var init_model_metadata = __esm({
  "OpenMAIC/lib/ai/model-metadata.ts"() {
    "use strict";
    init_model_aliases();
    fixedThinkingCapability = {
      control: "none",
      requestAdapter: "none",
      defaultMode: "enabled",
      toggleable: false,
      budgetAdjustable: false,
      defaultEnabled: true
    };
    anthropicManualBudgetByEffort = {
      low: 4096,
      medium: 10240,
      high: 32768,
      max: 64e3
    };
    anthropicManualEffort = {
      control: "effort",
      requestAdapter: "anthropic",
      effortValues: ["none", "low", "medium", "high", "max"],
      defaultEffort: "medium",
      defaultMode: "enabled",
      toggleable: true,
      budgetAdjustable: true,
      defaultEnabled: true,
      anthropicThinking: {
        type: "enabled",
        budgetByEffort: anthropicManualBudgetByEffort
      }
    };
    anthropicAdaptiveEffort = {
      ...anthropicManualEffort,
      anthropicThinking: { type: "adaptive" }
    };
    anthropicBudget = toggleBudgetCapability(
      "anthropic",
      { min: 1024, max: 64e3, step: 1024 },
      false,
      1024
    );
    anthropicOpus47Effort = {
      ...anthropicAdaptiveEffort,
      effortValues: ["none", "low", "medium", "high", "xhigh", "max"]
    };
    anthropicClaude5Effort = {
      ...anthropicOpus47Effort,
      defaultEffort: "high",
      defaultMode: "enabled",
      defaultEnabled: true
    };
    anthropicFable5Effort = {
      ...anthropicOpus47Effort,
      effortValues: ["low", "medium", "high", "xhigh", "max"],
      defaultEffort: "high",
      toggleable: false,
      budgetAdjustable: false
    };
    kimiK3Effort = effortCapability("openai", ["low", "high", "max"], "max");
    grok46Effort = effortCapability("openai", ["low", "medium", "high", "xhigh"], "high");
    grok45Effort = effortCapability("openai", ["low", "medium", "high"], "high");
    grok43Effort = effortCapability("openai", ["none", "low", "medium", "high"], "none");
    deepseekEffort = {
      control: "effort",
      requestAdapter: "deepseek",
      effortValues: ["none", "high", "max"],
      defaultEffort: "high",
      defaultMode: "enabled",
      toggleable: true,
      budgetAdjustable: true,
      defaultEnabled: true
    };
    glm52Effort = {
      control: "effort",
      requestAdapter: "glm",
      effortValues: ["none", "minimal", "low", "medium", "high", "xhigh", "max"],
      defaultEffort: "max",
      defaultMode: "enabled",
      toggleable: true,
      budgetAdjustable: true,
      defaultEnabled: true
    };
    hunyuanHy3Effort = {
      control: "effort",
      requestAdapter: "hunyuan",
      effortValues: ["none", "low", "high"],
      defaultEffort: "none",
      defaultMode: "disabled",
      toggleable: true,
      budgetAdjustable: true,
      defaultEnabled: false
    };
    lemonadeToggleBudget = toggleBudgetCapability(
      "lemonade",
      { min: 0, max: 81920, step: 1024, disableValue: 0 },
      false
    );
    qwenBudgetEnabled = toggleBudgetCapability(
      "qwen",
      { min: 0, max: 81920, step: 1024, disableValue: 0 },
      true
    );
    qwenBudgetDisabled = toggleBudgetCapability(
      "qwen",
      { min: 0, max: 81920, step: 1024, disableValue: 0 },
      false
    );
    siliconflowBudget = budgetOnlyCapability(
      "siliconflow",
      { min: 128, max: 32768, step: 1024 },
      4096
    );
    siliconflowToggleBudget = toggleBudgetCapability(
      "siliconflow",
      { min: 128, max: 32768, step: 1024, disableValue: 0 },
      true,
      4096
    );
    doubaoMode = {
      control: "mode",
      requestAdapter: "doubao",
      defaultMode: "auto",
      toggleable: true,
      budgetAdjustable: false,
      defaultEnabled: true
    };
    doubaoSeed20Effort = {
      control: "effort",
      requestAdapter: "doubao",
      effortValues: ["minimal", "low", "medium", "high"],
      defaultEffort: "medium",
      defaultMode: "enabled",
      toggleable: true,
      budgetAdjustable: true,
      defaultEnabled: true
    };
    minimaxM3Thinking = toggleCapability("anthropic", false);
    openaiGpt56Effort = {
      control: "effort",
      requestAdapter: "openai",
      effortValues: ["none", "low", "medium", "high", "xhigh", "max"],
      defaultEffort: "medium",
      defaultMode: "enabled",
      toggleable: true,
      budgetAdjustable: true,
      defaultEnabled: true
    };
    THINKING_CAPABILITIES = {
      [getModelMetadataKey("openai", "gpt-5.6")]: openaiGpt56Effort,
      [getModelMetadataKey("openai", "gpt-5.6-terra")]: openaiGpt56Effort,
      [getModelMetadataKey("openai", "gpt-5.6-luna")]: openaiGpt56Effort,
      [getModelMetadataKey("openai", "gpt-5.5")]: effortCapability(
        "openai",
        ["low", "medium", "high", "xhigh"],
        "medium"
      ),
      [getModelMetadataKey("openai", "gpt-5.4-pro")]: effortCapability(
        "openai",
        ["medium", "high", "xhigh"],
        "medium"
      ),
      [getModelMetadataKey("openai", "gpt-5.4")]: effortCapability(
        "openai",
        ["none", "low", "medium", "high", "xhigh"],
        "none"
      ),
      [getModelMetadataKey("openai", "gpt-5.4-mini")]: effortCapability(
        "openai",
        ["none", "low", "medium", "high", "xhigh"],
        "none"
      ),
      [getModelMetadataKey("openai", "gpt-5.4-nano")]: effortCapability(
        "openai",
        ["none", "low", "medium", "high", "xhigh"],
        "none"
      ),
      [getModelMetadataKey("anthropic", "claude-fable-5")]: anthropicFable5Effort,
      [getModelMetadataKey("anthropic", "claude-opus-5")]: anthropicClaude5Effort,
      [getModelMetadataKey("anthropic", "claude-sonnet-5")]: anthropicClaude5Effort,
      [getModelMetadataKey("anthropic", "claude-opus-4-8")]: anthropicOpus47Effort,
      [getModelMetadataKey("anthropic", "claude-opus-4-7")]: anthropicOpus47Effort,
      [getModelMetadataKey("anthropic", "claude-opus-4-6")]: anthropicAdaptiveEffort,
      [getModelMetadataKey("anthropic", "claude-sonnet-4-6")]: anthropicAdaptiveEffort,
      [getModelMetadataKey("anthropic", "claude-sonnet-4-5")]: anthropicManualEffort,
      [getModelMetadataKey("anthropic", "claude-haiku-4-5")]: anthropicBudget,
      [getModelMetadataKey("google", "gemini-3.6-flash")]: levelCapability(
        ["minimal", "low", "medium", "high"],
        "medium"
      ),
      [getModelMetadataKey("google", "gemini-3.5-flash-lite")]: levelCapability(
        ["minimal", "low", "medium", "high"],
        "minimal"
      ),
      [getModelMetadataKey("google", "gemini-3.5-flash")]: levelCapability(
        ["minimal", "low", "medium", "high"],
        "medium"
      ),
      [getModelMetadataKey("google", "gemini-3.1-pro-preview")]: levelCapability(
        ["minimal", "low", "medium", "high"],
        "high"
      ),
      [getModelMetadataKey("google", "gemini-3-flash-preview")]: levelCapability(
        ["minimal", "low", "medium", "high"],
        "high"
      ),
      [getModelMetadataKey("google", "gemini-2.5-flash")]: toggleBudgetCapability(
        "google",
        { min: 0, max: 24576, step: 1024, allowDynamic: true, disableValue: 0 },
        true,
        -1
      ),
      [getModelMetadataKey("google", "gemini-2.5-flash-lite")]: toggleBudgetCapability(
        "google",
        { min: 0, max: 24576, step: 1024, allowDynamic: true, disableValue: 0 },
        false,
        0
      ),
      [getModelMetadataKey("google", "gemini-2.5-pro")]: budgetOnlyCapability(
        "google",
        { min: 128, max: 32768, step: 1024, allowDynamic: true },
        -1
      ),
      [getModelMetadataKey("glm", "glm-5.2")]: glm52Effort,
      [getModelMetadataKey("glm", "glm-5.1")]: toggleCapability("glm"),
      [getModelMetadataKey("glm", "glm-5v-turbo")]: toggleCapability("glm"),
      [getModelMetadataKey("glm", "glm-5")]: toggleCapability("glm"),
      [getModelMetadataKey("glm", "glm-4.7")]: toggleCapability("glm"),
      [getModelMetadataKey("glm", "glm-4.7-flashx")]: toggleCapability("glm"),
      [getModelMetadataKey("glm", "glm-4.7-flash")]: toggleCapability("glm"),
      [getModelMetadataKey("glm", "glm-4.6")]: toggleCapability("glm"),
      [getModelMetadataKey("glm", "glm-4.6v")]: toggleCapability("glm"),
      [getModelMetadataKey("glm", "glm-4.6v-flash")]: toggleCapability("glm"),
      [getModelMetadataKey("qwen", "qwen3.7-plus")]: qwenBudgetEnabled,
      [getModelMetadataKey("qwen", "qwen3.7-max")]: qwenBudgetEnabled,
      [getModelMetadataKey("qwen", "qwen3.6-max-preview")]: qwenBudgetDisabled,
      [getModelMetadataKey("qwen", "qwen3.6-plus")]: qwenBudgetEnabled,
      [getModelMetadataKey("qwen", "qwen3.6-plus-2026-04-02")]: qwenBudgetEnabled,
      [getModelMetadataKey("qwen", "qwen3.6-flash")]: qwenBudgetEnabled,
      [getModelMetadataKey("qwen", "qwen3.6-flash-2026-04-16")]: qwenBudgetEnabled,
      [getModelMetadataKey("qwen", "qwen3.6-35b-a3b")]: qwenBudgetEnabled,
      [getModelMetadataKey("qwen", "qwen3.5-flash")]: qwenBudgetEnabled,
      [getModelMetadataKey("qwen", "qwen3.5-plus")]: qwenBudgetEnabled,
      [getModelMetadataKey("qwen", "qwen3-max")]: qwenBudgetDisabled,
      [getModelMetadataKey("qwen", "qwen3-vl-plus")]: qwenBudgetDisabled,
      [getModelMetadataKey("deepseek", "deepseek-v4-pro")]: deepseekEffort,
      [getModelMetadataKey("deepseek", "deepseek-v4-flash")]: deepseekEffort,
      [getModelMetadataKey("atlascloud", "deepseek-ai/deepseek-v4-pro")]: deepseekEffort,
      [getModelMetadataKey("kimi", "kimi-k3")]: kimiK3Effort,
      [getModelMetadataKey("kimi", "kimi-k2.7-code")]: fixedThinkingCapability,
      [getModelMetadataKey("kimi", "kimi-k2.7-code-highspeed")]: fixedThinkingCapability,
      [getModelMetadataKey("kimi", "kimi-k2.6")]: toggleCapability("kimi"),
      [getModelMetadataKey("kimi", "kimi-k2.5")]: toggleCapability("kimi"),
      [getModelMetadataKey("kimi", "kimi-k2-thinking")]: toggleCapability("kimi"),
      [getModelMetadataKey("siliconflow", "deepseek-ai/DeepSeek-V3.2")]: siliconflowToggleBudget,
      [getModelMetadataKey("siliconflow", "deepseek-ai/DeepSeek-R1")]: siliconflowBudget,
      [getModelMetadataKey("siliconflow", "deepseek-ai/DeepSeek-R1-Distill-Qwen-7B")]: siliconflowBudget,
      [getModelMetadataKey("siliconflow", "Qwen/Qwen3-VL-32B-Instruct")]: siliconflowToggleBudget,
      [getModelMetadataKey("siliconflow", "THUDM/GLM-4.1V-9B-Thinking")]: siliconflowBudget,
      [getModelMetadataKey("siliconflow", "THUDM/GLM-Z1-Rumination-32B-0414")]: siliconflowBudget,
      [getModelMetadataKey("doubao", "doubao-seed-2-1-pro-260628")]: doubaoSeed20Effort,
      [getModelMetadataKey("doubao", "doubao-seed-2-1-turbo-260628")]: doubaoSeed20Effort,
      [getModelMetadataKey("doubao", "doubao-seed-evolving")]: doubaoSeed20Effort,
      [getModelMetadataKey("doubao", "doubao-seed-character-260628")]: toggleCapability("doubao"),
      [getModelMetadataKey("doubao", "doubao-seed-2-0-pro-260215")]: doubaoSeed20Effort,
      [getModelMetadataKey("doubao", "doubao-seed-2-0-lite-260215")]: doubaoSeed20Effort,
      [getModelMetadataKey("doubao", "doubao-seed-2-0-mini-260215")]: doubaoSeed20Effort,
      [getModelMetadataKey("doubao", "doubao-seed-1-8-251228")]: doubaoMode,
      // Volcengine Ark Agent Plan exposes the Seed 2.0 family under dotted aliases
      // (the token-plan preset seeds these). They're the same native Doubao models
      // as the catalog ids above, served from the plan's own endpoint, so they
      // carry the identical doubao thinking control. (Cross-vendor models the plan
      // also serves — deepseek/minimax/glm/kimi via ark's OpenAI-compatible path —
      // are intentionally NOT mapped here: their native thinking transport doesn't
      // apply through that gateway.)
      [getModelMetadataKey("doubao", "doubao-seed-2.0-pro")]: doubaoSeed20Effort,
      [getModelMetadataKey("doubao", "doubao-seed-2.0-code")]: doubaoSeed20Effort,
      [getModelMetadataKey("doubao", "doubao-seed-2.0-lite")]: doubaoSeed20Effort,
      [getModelMetadataKey("doubao", "doubao-seed-2.0-mini")]: doubaoSeed20Effort,
      // Cross-vendor models the Ark Agent Plan also serves through its
      // OpenAI-compatible endpoint (all under the `doubao` provider id). Verified
      // against a live plan key: each accepts the gateway's unified `reasoning_effort`
      // field (low/medium/high) and actually reasons, so they share the doubao
      // effort adapter — which sends `minimal` (not `none`) to disable, matching
      // what the plan endpoint accepts. The token-plan preset seeds these aliases.
      [getModelMetadataKey("doubao", "deepseek-v4-pro")]: doubaoSeed20Effort,
      [getModelMetadataKey("doubao", "deepseek-v4-flash")]: doubaoSeed20Effort,
      [getModelMetadataKey("doubao", "glm-5.2")]: doubaoSeed20Effort,
      [getModelMetadataKey("doubao", "kimi-k2.7-code")]: doubaoSeed20Effort,
      [getModelMetadataKey("doubao", "kimi-k2.6")]: doubaoSeed20Effort,
      [getModelMetadataKey("doubao", "minimax-m3")]: doubaoSeed20Effort,
      [getModelMetadataKey("doubao", "minimax-m2.7")]: doubaoSeed20Effort,
      [getModelMetadataKey("doubao", "ark-code-latest")]: doubaoSeed20Effort,
      [getModelMetadataKey("openrouter", "deepseek/deepseek-v4-pro")]: effortCapability(
        "openrouter",
        ["low", "medium", "high"],
        "medium"
      ),
      [getModelMetadataKey("openrouter", "deepseek/deepseek-v4-flash")]: effortCapability(
        "openrouter",
        ["low", "medium", "high"],
        "medium"
      ),
      [getModelMetadataKey("grok", "grok-4.6")]: grok46Effort,
      [getModelMetadataKey("grok", "grok-4.5")]: grok45Effort,
      [getModelMetadataKey("grok", "grok-4.3")]: grok43Effort,
      [getModelMetadataKey("grok", "grok-build-0.1")]: fixedThinkingCapability,
      [getModelMetadataKey("grok", "grok-4.20-reasoning")]: fixedThinkingCapability,
      [getModelMetadataKey("grok", "grok-4.20-multi-agent")]: fixedThinkingCapability,
      [getModelMetadataKey("grok", "grok-4-1-fast-reasoning")]: fixedThinkingCapability,
      [getModelMetadataKey("minimax", "MiniMax-M3")]: minimaxM3Thinking,
      [getModelMetadataKey("minimax", "MiniMax-M2.7")]: fixedThinkingCapability,
      [getModelMetadataKey("tencent-hunyuan", "hy3-preview")]: hunyuanHy3Effort,
      [getModelMetadataKey("xiaomi", "mimo-v2.5-pro")]: toggleCapability("xiaomi"),
      [getModelMetadataKey("xiaomi", "mimo-v2-pro")]: toggleCapability("xiaomi"),
      [getModelMetadataKey("xiaomi", "mimo-v2.5")]: toggleCapability("xiaomi"),
      [getModelMetadataKey("xiaomi", "mimo-v2-omni")]: toggleCapability("xiaomi"),
      [getModelMetadataKey("xiaomi", "mimo-v2-flash")]: toggleCapability("xiaomi"),
      [getModelMetadataKey("lemonade", "Qwen3-4B-GGUF")]: lemonadeToggleBudget,
      [getModelMetadataKey("lemonade", "Qwen3.5-4B-GGUF")]: lemonadeToggleBudget,
      [getModelMetadataKey("lemonade", "Gemma-4-26B-A4B-it-GGUF")]: lemonadeToggleBudget,
      [getModelMetadataKey("lemonade", "gpt-oss-20b")]: lemonadeToggleBudget,
      [getModelMetadataKey("lemonade", "GPT-OSS-20B-GGUF")]: lemonadeToggleBudget
    };
  }
});

// OpenMAIC/lib/ai/thinking-config.ts
function getThinkingConfigKey(providerId, modelId) {
  return `${providerId}:${getCanonicalModelId(providerId, modelId)}`;
}
function supportsConfigurableThinking(thinking) {
  return !!thinking?.control && thinking.control !== "none" && !!thinking.requestAdapter;
}
function clampBudgetForCapability(thinking, budgetTokens) {
  const range = thinking.budgetRange;
  if (!range || typeof budgetTokens !== "number" || Number.isNaN(budgetTokens)) {
    return void 0;
  }
  if (budgetTokens === -1 && range.allowDynamic) return -1;
  return Math.max(range.min, Math.min(range.max, Math.round(budgetTokens)));
}
function getThinkingMode(config) {
  if (!config) return void 0;
  if (config.mode && config.mode !== "default") return config.mode;
  if (config.enabled === false) return "disabled";
  if (config.enabled === true) return "enabled";
  return void 0;
}
function pickThinkingEffort(thinking, config) {
  const allowed = thinking.effortValues;
  if (!allowed?.length) return void 0;
  if (config.effort && allowed.includes(config.effort)) return config.effort;
  const mode = getThinkingMode(config);
  if (mode === "disabled") {
    return allowed.includes("none") && "none" || allowed.includes("minimal") && "minimal" || allowed.includes("low") && "low" || thinking.defaultEffort;
  }
  if (mode === "enabled") return thinking.defaultEffort;
  return void 0;
}
function pickThinkingLevel(thinking, config) {
  const allowed = thinking.levelValues;
  if (!allowed?.length) return void 0;
  if (config.level && allowed.includes(config.level)) return config.level;
  const mode = getThinkingMode(config);
  if (mode === "disabled") {
    return allowed.includes("minimal") && "minimal" || allowed.includes("low") && "low" || thinking.defaultLevel;
  }
  if (mode === "enabled") return thinking.defaultLevel;
  return void 0;
}
function pickThinkingBudget(thinking, config) {
  const range = thinking.budgetRange;
  if (!range) return void 0;
  const mode = getThinkingMode(config);
  if (mode === "disabled" && range.disableValue !== void 0) {
    return range.disableValue;
  }
  const rawBudget = typeof config.budgetTokens === "number" ? config.budgetTokens : thinking.defaultBudgetTokens;
  return clampBudgetForCapability(thinking, rawBudget);
}
function defaultModeForCapability(thinking) {
  return thinking.defaultMode ?? (thinking.defaultEnabled === false ? "disabled" : "enabled");
}
function defaultEffortForCapability(thinking) {
  return thinking.defaultEffort ?? thinking.effortValues?.[0];
}
function defaultLevelForCapability(thinking) {
  return thinking.defaultLevel ?? thinking.levelValues?.[0];
}
function getDefaultThinkingConfig(thinking) {
  if (!supportsConfigurableThinking(thinking)) return void 0;
  switch (thinking.control) {
    case "effort": {
      const effort = defaultEffortForCapability(thinking);
      return effort ? { mode: effort === "none" ? "disabled" : "enabled", effort } : { mode: defaultModeForCapability(thinking) };
    }
    case "level": {
      const level = defaultLevelForCapability(thinking);
      return level ? { mode: "enabled", level } : { mode: defaultModeForCapability(thinking) };
    }
    case "toggle":
      return { mode: defaultModeForCapability(thinking) };
    case "toggle-budget":
      return {
        mode: defaultModeForCapability(thinking),
        budgetTokens: thinking.defaultBudgetTokens
      };
    case "budget-only":
      return { mode: "enabled", budgetTokens: thinking.defaultBudgetTokens };
    case "mode":
      return { mode: defaultModeForCapability(thinking) };
    default:
      return void 0;
  }
}
var init_thinking_config = __esm({
  "OpenMAIC/lib/ai/thinking-config.ts"() {
    "use strict";
    init_model_aliases();
  }
});

// OpenMAIC/lib/ai/azure.ts
function normalizeAzureBaseUrl(baseUrl) {
  const value = baseUrl?.trim();
  if (!value) return void 0;
  const url = new URL(value);
  url.search = "";
  url.hash = "";
  let path6 = url.pathname.replace(/\/+$/, "");
  path6 = path6.replace(/\/(?:chat\/completions|responses)$/i, "");
  path6 = path6.replace(/\/deployments\/[^/]+$/i, "");
  if (url.hostname.endsWith(".openai.azure.com")) {
    path6 = path6.replace(/\/v1$/i, "");
    if (!path6) path6 = "/openai";
  }
  url.pathname = path6 || "/";
  return url.toString().replace(/\/$/, "");
}
var init_azure = __esm({
  "OpenMAIC/lib/ai/azure.ts"() {
    "use strict";
  }
});

// OpenMAIC/lib/ai/providers.ts
import { createOpenAI } from "@ai-sdk/openai";
import { createAzure } from "@ai-sdk/azure";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createAmazonBedrock } from "@ai-sdk/amazon-bedrock";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { wrapLanguageModel, extractReasoningMiddleware } from "ai";
function getProviderConfig(providerId) {
  if (PROVIDERS[providerId]) {
    return PROVIDERS[providerId];
  }
  if (typeof window !== "undefined") {
    try {
      const storedConfig = localStorage.getItem("providersConfig");
      if (storedConfig) {
        const config = JSON.parse(storedConfig);
        const providerSettings = config[providerId];
        if (providerSettings) {
          return {
            id: providerId,
            name: providerSettings.name,
            type: providerSettings.type,
            defaultBaseUrl: providerSettings.defaultBaseUrl,
            icon: providerSettings.icon,
            requiresApiKey: providerSettings.requiresApiKey,
            models: providerSettings.models
          };
        }
      }
    } catch (e) {
      log.error("Failed to load provider config:", e);
    }
  }
  return null;
}
function getCompatThinkingBodyParams(providerId, modelId, config) {
  if (providerId === "openai" && modelId === "deepseek-v4-flash-vision-exp") {
    const mode2 = getThinkingMode(config);
    return mode2 === void 0 ? void 0 : { chat_template_kwargs: { thinking: mode2 === "enabled" } };
  }
  const capability = getCatalogThinkingCapability(providerId, modelId);
  if (!capability || capability.control === "none") return void 0;
  const mode = getThinkingMode(config);
  const budget = pickThinkingBudget(capability, config);
  switch (capability.requestAdapter) {
    case "openai": {
      const effort = pickThinkingEffort(capability, config);
      return effort ? { reasoning_effort: effort } : void 0;
    }
    case "kimi":
    case "xiaomi":
      if (mode === "disabled") return { thinking: { type: "disabled" } };
      if (mode === "enabled") return { thinking: { type: "enabled" } };
      return void 0;
    case "glm": {
      if (capability.control === "effort") {
        if (mode === "disabled" || config.effort === "none") {
          return { thinking: { type: "disabled" } };
        }
        const effort = config.effort && capability.effortValues?.includes(config.effort) ? config.effort : mode === "enabled" ? capability.defaultEffort : void 0;
        const body = {};
        if (mode === "enabled" || effort) body.thinking = { type: "enabled" };
        if (effort) body.reasoning_effort = effort;
        return Object.keys(body).length > 0 ? body : void 0;
      }
      if (mode === "disabled") return { thinking: { type: "disabled" } };
      if (mode === "enabled") return { thinking: { type: "enabled" } };
      return void 0;
    }
    case "deepseek": {
      if (mode === "disabled" || config.effort === "none") {
        return { thinking: { type: "disabled" } };
      }
      const effort = config.effort === "max" || config.effort === "xhigh" ? "max" : "high";
      return {
        thinking: { type: "enabled" },
        reasoning_effort: effort
      };
    }
    case "qwen": {
      if (mode === "disabled") return { enable_thinking: false };
      const body = {};
      if (mode === "enabled") body.enable_thinking = true;
      if (budget !== void 0) body.thinking_budget = budget;
      return Object.keys(body).length > 0 ? body : void 0;
    }
    case "siliconflow": {
      const body = {};
      if (capability.control === "toggle-budget") {
        if (mode === "disabled") body.enable_thinking = false;
        if (mode === "enabled") body.enable_thinking = true;
      }
      if (budget !== void 0 && budget > 0) body.thinking_budget = budget;
      return Object.keys(body).length > 0 ? body : void 0;
    }
    case "doubao": {
      if (capability.control === "effort") {
        const effort = mode === "disabled" ? "minimal" : config.effort && capability.effortValues?.includes(config.effort) ? config.effort : mode === "enabled" ? capability.defaultEffort : void 0;
        return effort ? { reasoning_effort: effort } : void 0;
      }
      if (mode === "auto") return { thinking: { type: "auto" } };
      if (mode === "disabled") return { thinking: { type: "disabled" } };
      if (mode === "enabled") return { thinking: { type: "enabled" } };
      return void 0;
    }
    case "openrouter": {
      const reasoning = {};
      if (mode === "disabled") reasoning.enabled = false;
      if (mode === "enabled") reasoning.enabled = true;
      if (config.effort) reasoning.effort = config.effort;
      if (budget !== void 0) reasoning.max_tokens = budget;
      if (typeof config.excludeReasoningOutput === "boolean") {
        reasoning.exclude = config.excludeReasoningOutput;
      }
      return Object.keys(reasoning).length > 0 ? { reasoning } : void 0;
    }
    case "hunyuan": {
      let reasoningEffort;
      if (mode === "disabled" || config.effort === "none") {
        reasoningEffort = "no_think";
      } else if (config.effort === "high" || config.effort === "max" || config.effort === "xhigh") {
        reasoningEffort = "high";
      } else if (config.effort === "low" || config.effort === "medium" || config.effort === "minimal") {
        reasoningEffort = "low";
      } else if (mode === "enabled") {
        reasoningEffort = capability.defaultEffort === "high" ? "high" : "low";
      }
      return reasoningEffort ? { chat_template_kwargs: { reasoning_effort: reasoningEffort } } : void 0;
    }
    case "lemonade": {
      const chatTemplateKwargs = {};
      if (mode === "enabled") {
        chatTemplateKwargs.enable_thinking = true;
      } else {
        chatTemplateKwargs.enable_thinking = false;
      }
      if (mode === "enabled" && budget !== void 0) {
        chatTemplateKwargs.thinking_budget = budget;
      }
      return { chat_template_kwargs: chatTemplateKwargs };
    }
    default:
      return void 0;
  }
}
function normalizeMiniMaxAnthropicBaseUrl(providerId, baseUrl) {
  if (providerId !== "minimax" || !baseUrl) {
    return baseUrl;
  }
  const trimmed = baseUrl.replace(/\/$/, "");
  if (trimmed.endsWith("/anthropic/v1")) {
    return trimmed;
  }
  if (trimmed.endsWith("/anthropic")) {
    return `${trimmed}/v1`;
  }
  return `${trimmed}/anthropic/v1`;
}
function resolveBedrockRegion() {
  return process.env.BEDROCK_REGION?.trim() || process.env.AWS_REGION?.trim() || process.env.AWS_DEFAULT_REGION?.trim() || "us-east-1";
}
function getBedrockCredentialProvider() {
  bedrockCredentialProviderPromise ??= import("@aws-sdk/credential-providers").then(
    ({ fromNodeProviderChain }) => fromNodeProviderChain()
  );
  return bedrockCredentialProviderPromise;
}
function createBedrockCredentialProvider() {
  return async () => {
    const credentialProvider = await getBedrockCredentialProvider();
    const credentials = await credentialProvider();
    return {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      sessionToken: credentials.sessionToken,
      expiration: credentials.expiration
    };
  };
}
function shouldUseOpenAIResponsesApi(providerId, modelId) {
  if (providerId !== "openai") return false;
  return /^gpt-5\.\d+-pro(?:-|$)/.test(modelId) || /^gpt-5\.6(?:-|$)/.test(modelId) || /^gpt-5\.5(?:-|$)/.test(modelId) || /^gpt-5\.[3-9]-codex(?:-|$)/.test(modelId);
}
function usesCustomOpenAIBaseUrl(baseUrl) {
  if (!baseUrl) return false;
  const trimmed = baseUrl.trim();
  if (!trimmed) return false;
  try {
    const url = new URL(trimmed);
    const pathname = url.pathname.replace(/\/+$/, "");
    return url.origin !== "https://api.openai.com" || pathname !== "/v1";
  } catch {
    return true;
  }
}
function shouldUseOpenAIStreamingChatCompat(providerId, baseUrl) {
  return providerId === "openai" && usesCustomOpenAIBaseUrl(baseUrl) && process.env.OPENAI_COMPAT_USE_STREAMING_CHAT === "true";
}
function requestUrlString(input) {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.toString();
  return input.url;
}
function appendChatDelta(value) {
  if (typeof value === "string") return value;
  if (!Array.isArray(value)) return "";
  return value.map((part) => {
    if (!part || typeof part !== "object") return "";
    const record = part;
    return typeof record.text === "string" ? record.text : "";
  }).join("");
}
function openAIJsonResponseHeaders(response) {
  const headers = new Headers(response.headers);
  headers.set("content-type", "application/json");
  headers.delete("content-length");
  headers.delete("content-encoding");
  headers.delete("transfer-encoding");
  return headers;
}
function openAIStreamErrorStatus(error) {
  const status = typeof error.code === "number" ? error.code : typeof error.code === "string" ? Number(error.code) : NaN;
  return Number.isInteger(status) && status >= 400 && status <= 599 ? status : 500;
}
async function fetchCustomOpenAIChat(input, init) {
  const requestUrl = requestUrlString(input);
  if (!requestUrl.includes("/chat/completions") || !init?.body || typeof init.body !== "string") {
    return globalThis.fetch(input, init);
  }
  let requestBody;
  try {
    requestBody = JSON.parse(init.body);
  } catch {
    return globalThis.fetch(input, init);
  }
  if (requestBody.stream === true) return globalThis.fetch(input, init);
  const streamOptions = requestBody.stream_options && typeof requestBody.stream_options === "object" && !Array.isArray(requestBody.stream_options) ? requestBody.stream_options : {};
  const response = await globalThis.fetch(input, {
    ...init,
    body: JSON.stringify({
      ...requestBody,
      stream: true,
      stream_options: { ...streamOptions, include_usage: true }
    })
  });
  if (!response.ok) return response;
  const rawStream = await response.text();
  const streamLines = rawStream.split(/\r?\n/);
  if (!streamLines.some((line) => line.startsWith("data:"))) {
    const headers = new Headers(response.headers);
    headers.delete("content-length");
    headers.delete("content-encoding");
    headers.delete("transfer-encoding");
    return new Response(rawStream, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }
  let id = "";
  let created = 0;
  let model = typeof requestBody.model === "string" ? requestBody.model : "";
  let content = "";
  let finishReason = null;
  let usage;
  const toolCalls = /* @__PURE__ */ new Map();
  for (const line of streamLines) {
    if (!line.startsWith("data:")) continue;
    const data = line.slice(5).trim();
    if (!data || data === "[DONE]") continue;
    try {
      const chunk = JSON.parse(data);
      const error = chunk.error && typeof chunk.error === "object" && !Array.isArray(chunk.error) ? chunk.error : void 0;
      if (error && typeof error.message === "string") {
        return new Response(JSON.stringify(chunk), {
          status: openAIStreamErrorStatus(error),
          headers: openAIJsonResponseHeaders(response)
        });
      }
      if (typeof chunk.id === "string") id = chunk.id;
      if (typeof chunk.created === "number") created = chunk.created;
      if (typeof chunk.model === "string") model = chunk.model;
      if (chunk.usage) usage = chunk.usage;
      const choices = Array.isArray(chunk.choices) ? chunk.choices : [];
      for (const rawChoice of choices) {
        if (!rawChoice || typeof rawChoice !== "object") continue;
        const choice = rawChoice;
        if (typeof choice.index === "number" && choice.index !== 0) continue;
        if (choice.finish_reason) finishReason = choice.finish_reason;
        if (!choice.delta || typeof choice.delta !== "object") continue;
        const delta = choice.delta;
        content += appendChatDelta(delta.content);
        if (!Array.isArray(delta.tool_calls)) continue;
        for (const rawToolCall of delta.tool_calls) {
          if (!rawToolCall || typeof rawToolCall !== "object") continue;
          const toolCall = rawToolCall;
          const index = typeof toolCall.index === "number" ? toolCall.index : 0;
          const current = toolCalls.get(index) || {
            id: "",
            type: "function",
            function: { name: "", arguments: "" }
          };
          if (typeof toolCall.id === "string") current.id = toolCall.id;
          if (typeof toolCall.type === "string") current.type = toolCall.type;
          if (toolCall.function && typeof toolCall.function === "object") {
            const fn = toolCall.function;
            if (typeof fn.name === "string" && fn.name) current.function.name = fn.name;
            if (typeof fn.arguments === "string") current.function.arguments += fn.arguments;
          }
          toolCalls.set(index, current);
        }
      }
    } catch {
    }
  }
  const message = { role: "assistant", content };
  if (toolCalls.size > 0) {
    message.tool_calls = [...toolCalls.entries()].sort(([a], [b]) => a - b).map(([, toolCall]) => toolCall);
  }
  return new Response(
    JSON.stringify({
      id: id || `chatcmpl_${Date.now()}`,
      object: "chat.completion",
      created: created || Math.floor(Date.now() / 1e3),
      model,
      choices: [{ index: 0, message, finish_reason: finishReason }],
      ...usage ? { usage } : {}
    }),
    {
      status: response.status,
      statusText: response.statusText,
      headers: openAIJsonResponseHeaders(response)
    }
  );
}
function isProviderKeyRequired(providerId) {
  return getProviderConfig(providerId)?.requiresApiKey ?? true;
}
function getModel(config) {
  let providerType = config.providerType;
  const provider = getProviderConfig(config.providerId);
  const requiresApiKey = provider?.requiresApiKey ?? true;
  if (provider && providerType && providerType !== provider.type) {
    throw new Error(
      `Provider type mismatch for ${config.providerId}: expected ${provider.type}, received ${providerType}.`
    );
  }
  if (!providerType) {
    if (provider) {
      providerType = provider.type;
    } else {
      throw new Error(`Unknown provider: ${config.providerId}. Please provide providerType.`);
    }
  }
  if (requiresApiKey && !config.apiKey) {
    throw new Error(`API key required for provider: ${config.providerId}`);
  }
  const effectiveApiKey = config.apiKey || "";
  const effectiveBaseUrl = normalizeMiniMaxAnthropicBaseUrl(
    config.providerId,
    config.baseUrl || provider?.defaultBaseUrl || void 0
  );
  let model;
  switch (providerType) {
    case "azure": {
      const azure = createAzure({
        apiKey: effectiveApiKey,
        baseURL: normalizeAzureBaseUrl(effectiveBaseUrl)
      });
      model = azure(config.modelId);
      break;
    }
    case "openai": {
      const useStreamingChatCompat = shouldUseOpenAIStreamingChatCompat(
        config.providerId,
        effectiveBaseUrl
      );
      const openaiOptions = {
        apiKey: effectiveApiKey,
        baseURL: effectiveBaseUrl,
        name: config.providerId
      };
      const usesOpenAIResponses = !useStreamingChatCompat && shouldUseOpenAIResponsesApi(config.providerId, config.modelId);
      const usesCompatTransport = config.providerId !== "openai" || usesCustomOpenAIBaseUrl(config.baseUrl) && !usesOpenAIResponses;
      if (usesCompatTransport) {
        const providerId = config.providerId;
        const compatFetch = async (url, init) => {
          const thinkingCtx = globalThis.__thinkingContext;
          const thinkingFromContext = thinkingCtx?.getStore?.();
          const thinking = thinkingFromContext ?? (providerId === "lemonade" ? getDefaultThinkingConfig(getCatalogThinkingCapability(providerId, config.modelId)) : void 0);
          if (thinking && init?.body && typeof init.body === "string") {
            const extra = getCompatThinkingBodyParams(providerId, config.modelId, thinking);
            if (extra) {
              try {
                const body = JSON.parse(init.body);
                if (providerId === "lemonade" && "stream_options" in body) {
                  delete body.stream_options;
                }
                Object.assign(body, extra);
                init = { ...init, body: JSON.stringify(body) };
              } catch {
              }
            }
          }
          if (providerId === "kimi" && config.modelId === "kimi-k3" && init?.body && typeof init.body === "string") {
            try {
              const body = JSON.parse(init.body);
              restoreKimiReasoningInRequestBody(body);
              init = { ...init, body: JSON.stringify(body) };
            } catch {
            }
          }
          const response = useStreamingChatCompat ? await fetchCustomOpenAIChat(url, init) : await globalThis.fetch(url, init);
          let streaming = false;
          if (init?.body && typeof init.body === "string") {
            try {
              streaming = JSON.parse(init.body)?.stream === true;
            } catch {
            }
          }
          const normalizedReasoningResponse = streaming ? wrapResponseWithReasoning(response) : providerId === "kimi" && config.modelId === "kimi-k3" ? await wrapJsonResponseWithReasoning(response) : response;
          if (providerId !== "lemonade") {
            return normalizedReasoningResponse;
          }
          const contentType = response.headers.get("content-type") || "";
          let isStreamingRequest = false;
          if (init?.body && typeof init.body === "string") {
            try {
              const requestBody = JSON.parse(init.body);
              isStreamingRequest = requestBody?.stream === true;
            } catch {
            }
          }
          if (isStreamingRequest) {
            return response;
          }
          try {
            const cloned = response.clone();
            const text = await cloned.text();
            try {
              JSON.parse(text);
            } catch (error) {
              const message = error instanceof Error ? error.message : String(error);
              log.warn(
                `[Lemonade] Invalid JSON response from OpenAI-compatible path: status=${response.status}, contentType=${contentType || "n/a"}, bodyLen=${text.length}, first=${JSON.stringify(text.slice(0, 500))}, last=${JSON.stringify(text.slice(Math.max(0, text.length - 500)))}, parseError=${message}`
              );
            }
          } catch (error) {
            log.warn("[Lemonade] Failed to inspect JSON response body:", error);
          }
          return response;
        };
        openaiOptions.fetch = compatFetch;
      }
      const openai = createOpenAI(openaiOptions);
      model = usesOpenAIResponses ? openai.responses(config.modelId) : openai.chat(config.modelId);
      if (usesCompatTransport) {
        const middleware = config.providerId === "kimi" && config.modelId === "kimi-k3" ? [
          createKimiReasoningPreservationMiddleware(),
          extractReasoningMiddleware({ tagName: "think" })
        ] : extractReasoningMiddleware({ tagName: "think" });
        model = wrapLanguageModel({
          model,
          middleware
        });
      }
      break;
    }
    case "anthropic": {
      const anthropicOptions = {
        baseURL: effectiveBaseUrl
      };
      if (config.providerId === "minimax" && effectiveApiKey.startsWith("sk-cp-")) {
        anthropicOptions.authToken = effectiveApiKey;
      } else {
        anthropicOptions.apiKey = effectiveApiKey;
      }
      if (config.providerId === "minimax") {
        anthropicOptions.fetch = (async (url, init) => {
          const capability = getCatalogThinkingCapability(config.providerId, config.modelId);
          const thinkingCtx = globalThis.__thinkingContext;
          const thinking = thinkingCtx?.getStore?.();
          if (capability?.requestAdapter === "anthropic" && capability.control !== "none" && getThinkingMode(thinking) === "disabled" && init?.body && typeof init.body === "string") {
            try {
              const body = JSON.parse(init.body);
              body.thinking = { type: "disabled" };
              init = { ...init, body: JSON.stringify(body) };
            } catch {
            }
          }
          return globalThis.fetch(url, init);
        });
      }
      const anthropic = createAnthropic(anthropicOptions);
      model = anthropic.chat(config.modelId);
      break;
    }
    case "bedrock": {
      const bedrock = createAmazonBedrock({
        apiKey: effectiveApiKey || void 0,
        region: resolveBedrockRegion(),
        baseURL: effectiveBaseUrl,
        credentialProvider: createBedrockCredentialProvider()
      });
      model = bedrock(config.modelId);
      break;
    }
    case "google": {
      const googleOptions = {
        apiKey: effectiveApiKey,
        baseURL: effectiveBaseUrl
      };
      if (config.proxy) {
        const proxy = config.proxy;
        let agent;
        googleOptions.fetch = (async (input, init) => {
          const { ProxyAgent: ProxyAgent2, fetch: undiciFetch2 } = await import(
            /* webpackIgnore: true */
            "undici"
          );
          agent ??= new ProxyAgent2(proxy);
          const response = await undiciFetch2(input, {
            ...init,
            dispatcher: agent
          });
          return response;
        });
      }
      const google = createGoogleGenerativeAI(googleOptions);
      model = google.chat(config.modelId);
      break;
    }
    default:
      throw new Error(`Unsupported provider type: ${providerType}`);
  }
  const modelInfo = findModelById(config.providerId, provider?.models, config.modelId) ?? null;
  return { model, modelInfo };
}
function parseModelString(modelString) {
  const colonIndex = modelString.indexOf(":");
  if (colonIndex > 0) {
    return {
      providerId: modelString.slice(0, colonIndex),
      modelId: modelString.slice(colonIndex + 1)
    };
  }
  return {
    providerId: "openai",
    modelId: modelString
  };
}
function getProvider(providerId) {
  return PROVIDERS[providerId];
}
var log, PROVIDERS, bedrockCredentialProviderPromise;
var init_providers = __esm({
  "OpenMAIC/lib/ai/providers.ts"() {
    "use strict";
    init_reasoning_sse();
    init_model_metadata();
    init_model_aliases();
    init_thinking_config();
    init_logger();
    init_azure();
    log = createLogger("AIProviders");
    PROVIDERS = {
      openai: {
        id: "openai",
        name: "OpenAI",
        type: "openai",
        defaultBaseUrl: "https://api.openai.com/v1",
        requiresApiKey: true,
        icon: "/logos/openai.svg",
        models: [
          {
            id: "gpt-5.6",
            name: "GPT-5.6 Sol",
            contextWindow: 105e4,
            outputWindow: 128e3,
            capabilities: {
              streaming: true,
              tools: true,
              vision: true,
              thinking: {
                toggleable: true,
                budgetAdjustable: true,
                defaultEnabled: true
              }
            }
          },
          {
            id: "gpt-5.6-terra",
            name: "GPT-5.6 Terra",
            contextWindow: 105e4,
            outputWindow: 128e3,
            capabilities: {
              streaming: true,
              tools: true,
              vision: true,
              thinking: {
                toggleable: true,
                budgetAdjustable: true,
                defaultEnabled: true
              }
            }
          },
          {
            id: "gpt-5.6-luna",
            name: "GPT-5.6 Luna",
            contextWindow: 105e4,
            outputWindow: 128e3,
            capabilities: {
              streaming: true,
              tools: true,
              vision: true,
              thinking: {
                toggleable: true,
                budgetAdjustable: true,
                defaultEnabled: true
              }
            }
          },
          {
            id: "gpt-5.5",
            name: "GPT-5.5",
            contextWindow: 105e4,
            outputWindow: 128e3,
            capabilities: {
              streaming: true,
              tools: true,
              vision: true,
              thinking: {
                toggleable: false,
                budgetAdjustable: true,
                defaultEnabled: true
              }
            }
          },
          {
            id: "gpt-5.4-pro",
            name: "GPT-5.4 Pro",
            contextWindow: 105e4,
            outputWindow: 128e3,
            capabilities: {
              streaming: true,
              tools: true,
              vision: true,
              thinking: {
                toggleable: true,
                budgetAdjustable: true,
                defaultEnabled: true
              }
            }
          },
          {
            id: "gpt-5.4",
            name: "GPT-5.4",
            contextWindow: 105e4,
            outputWindow: 128e3,
            capabilities: {
              streaming: true,
              tools: true,
              vision: true,
              thinking: {
                toggleable: true,
                budgetAdjustable: true,
                defaultEnabled: false
              }
            }
          },
          {
            id: "gpt-5.4-mini",
            name: "GPT-5.4 Mini",
            contextWindow: 4e5,
            outputWindow: 128e3,
            capabilities: {
              streaming: true,
              tools: true,
              vision: true,
              thinking: {
                toggleable: true,
                budgetAdjustable: true,
                defaultEnabled: false
              }
            }
          },
          {
            id: "gpt-5.4-nano",
            name: "GPT-5.4 Nano",
            contextWindow: 4e5,
            outputWindow: 128e3,
            capabilities: {
              streaming: true,
              tools: true,
              vision: true,
              thinking: {
                toggleable: true,
                budgetAdjustable: true,
                defaultEnabled: false
              }
            }
          }
        ]
      },
      azure: {
        id: "azure",
        name: "Azure OpenAI",
        type: "azure",
        baseUrlPlaceholder: "https://YOUR-RESOURCE.openai.azure.com/openai",
        supportsModelDiscovery: false,
        requiresApiKey: true,
        icon: "/logos/azure.svg",
        // Azure requests use user-defined deployment names rather than model IDs.
        models: []
      },
      atlascloud: {
        id: "atlascloud",
        name: "Atlas Cloud",
        type: "openai",
        defaultBaseUrl: "https://api.atlascloud.ai/v1",
        supportsModelDiscovery: true,
        requiresApiKey: true,
        models: [
          {
            id: "qwen/qwen3.5-flash",
            name: "Qwen3.5 Flash",
            contextWindow: 1e6,
            outputWindow: 67072,
            capabilities: { streaming: true, tools: false, vision: false }
          },
          {
            id: "deepseek-ai/deepseek-v4-pro",
            name: "DeepSeek V4 Pro",
            contextWindow: 1048576,
            outputWindow: 393216,
            // Live-verified with enabled/disabled thinking payloads and a forced
            // OpenAI-compatible function call against Atlas Cloud.
            capabilities: {
              streaming: true,
              tools: true,
              vision: false,
              thinking: {
                toggleable: true,
                budgetAdjustable: true,
                defaultEnabled: true
              }
            }
          }
        ]
      },
      anthropic: {
        id: "anthropic",
        name: "Claude",
        type: "anthropic",
        requiresApiKey: true,
        defaultBaseUrl: "https://api.anthropic.com/v1",
        icon: "/logos/claude.svg",
        models: [
          {
            id: "claude-opus-5",
            name: "Claude Opus 5",
            contextWindow: 1e6,
            outputWindow: 128e3,
            capabilities: {
              streaming: true,
              tools: true,
              vision: true,
              thinking: {
                toggleable: true,
                budgetAdjustable: true,
                defaultEnabled: true
              }
            }
          },
          {
            id: "claude-sonnet-5",
            name: "Claude Sonnet 5",
            contextWindow: 1e6,
            outputWindow: 128e3,
            capabilities: {
              streaming: true,
              tools: true,
              vision: true,
              thinking: {
                toggleable: true,
                budgetAdjustable: true,
                defaultEnabled: true
              }
            }
          },
          {
            id: "claude-fable-5",
            name: "Claude Fable 5",
            contextWindow: 1e6,
            outputWindow: 128e3,
            capabilities: {
              streaming: true,
              tools: true,
              vision: true,
              thinking: {
                toggleable: false,
                budgetAdjustable: false,
                defaultEnabled: true
              }
            }
          },
          {
            id: "claude-opus-4-8",
            name: "Claude Opus 4.8",
            contextWindow: 1e6,
            outputWindow: 128e3,
            capabilities: {
              streaming: true,
              tools: true,
              vision: true,
              thinking: {
                toggleable: true,
                budgetAdjustable: true,
                defaultEnabled: false
              }
            }
          },
          {
            id: "claude-opus-4-7",
            name: "Claude Opus 4.7",
            contextWindow: 1e6,
            outputWindow: 128e3,
            capabilities: {
              streaming: true,
              tools: true,
              vision: true,
              thinking: {
                toggleable: true,
                budgetAdjustable: true,
                defaultEnabled: false
              }
            }
          },
          {
            id: "claude-opus-4-6",
            name: "Claude Opus 4.6",
            contextWindow: 2e5,
            outputWindow: 128e3,
            capabilities: {
              streaming: true,
              tools: true,
              vision: true,
              thinking: {
                toggleable: true,
                budgetAdjustable: true,
                defaultEnabled: false
              }
            }
          },
          {
            id: "claude-sonnet-4-6",
            name: "Claude Sonnet 4.6",
            contextWindow: 2e5,
            outputWindow: 128e3,
            capabilities: {
              streaming: true,
              tools: true,
              vision: true,
              thinking: {
                toggleable: true,
                budgetAdjustable: true,
                defaultEnabled: false
              }
            }
          },
          {
            id: "claude-sonnet-4-5",
            name: "Claude Sonnet 4.5",
            contextWindow: 2e5,
            outputWindow: 64e3,
            capabilities: {
              streaming: true,
              tools: true,
              vision: true,
              thinking: {
                toggleable: true,
                budgetAdjustable: true,
                defaultEnabled: false
              }
            }
          },
          {
            id: "claude-haiku-4-5",
            name: "Claude Haiku 4.5",
            contextWindow: 2e5,
            outputWindow: 64e3,
            capabilities: {
              streaming: true,
              tools: true,
              vision: true,
              thinking: {
                toggleable: true,
                budgetAdjustable: true,
                defaultEnabled: false
              }
            }
          }
        ]
      },
      bedrock: {
        id: "bedrock",
        name: "Amazon Bedrock",
        type: "bedrock",
        requiresApiKey: false,
        icon: "/logos/bedrock.svg",
        models: [
          {
            id: "us.anthropic.claude-sonnet-5",
            name: "Claude Sonnet 5 (Bedrock)",
            contextWindow: 1e6,
            outputWindow: 128e3,
            capabilities: { streaming: true, tools: true, vision: true }
          },
          {
            id: "us.anthropic.claude-opus-4-8",
            name: "Claude Opus 4.8 (Bedrock)",
            contextWindow: 1e6,
            outputWindow: 128e3,
            capabilities: { streaming: true, tools: true, vision: true }
          },
          {
            id: "us.anthropic.claude-opus-4-7",
            name: "Claude Opus 4.7 (Bedrock)",
            contextWindow: 1e6,
            outputWindow: 128e3,
            capabilities: { streaming: true, tools: true, vision: true }
          },
          {
            id: "us.anthropic.claude-sonnet-4-6",
            name: "Claude Sonnet 4.6 (Bedrock)",
            contextWindow: 1e6,
            outputWindow: 64e3,
            capabilities: { streaming: true, tools: true, vision: true }
          },
          {
            id: "us.amazon.nova-pro-v1:0",
            name: "Amazon Nova Pro",
            contextWindow: 3e5,
            outputWindow: 1e4,
            capabilities: { streaming: true, tools: true, vision: true }
          },
          {
            id: "us.amazon.nova-lite-v1:0",
            name: "Amazon Nova Lite",
            contextWindow: 3e5,
            outputWindow: 1e4,
            capabilities: { streaming: true, tools: true, vision: true }
          },
          {
            id: "us.amazon.nova-micro-v1:0",
            name: "Amazon Nova Micro",
            contextWindow: 128e3,
            outputWindow: 1e4,
            capabilities: { streaming: true, tools: true, vision: false }
          },
          {
            id: "us.meta.llama3-3-70b-instruct-v1:0",
            name: "Llama 3.3 70B Instruct (Bedrock)",
            contextWindow: 128e3,
            capabilities: { streaming: true, tools: true, vision: false }
          }
        ]
      },
      google: {
        id: "google",
        name: "Gemini",
        type: "google",
        requiresApiKey: true,
        defaultBaseUrl: "https://generativelanguage.googleapis.com/v1beta",
        icon: "/logos/gemini.svg",
        models: [
          {
            id: "gemini-3.6-flash",
            name: "Gemini 3.6 Flash",
            contextWindow: 1048576,
            outputWindow: 65536,
            capabilities: {
              streaming: true,
              tools: true,
              vision: true,
              thinking: {
                toggleable: false,
                budgetAdjustable: true,
                defaultEnabled: true
              }
            }
          },
          {
            id: "gemini-3.5-flash-lite",
            name: "Gemini 3.5 Flash-Lite",
            contextWindow: 1048576,
            outputWindow: 65536,
            capabilities: {
              streaming: true,
              tools: true,
              vision: true,
              thinking: {
                toggleable: false,
                budgetAdjustable: true,
                defaultEnabled: true
              }
            }
          },
          {
            id: "gemini-3.5-flash",
            name: "Gemini 3.5 Flash",
            contextWindow: 1048576,
            outputWindow: 65536,
            capabilities: {
              streaming: true,
              tools: true,
              vision: true,
              thinking: {
                toggleable: false,
                budgetAdjustable: true,
                defaultEnabled: true
              }
            }
          },
          {
            id: "gemini-3.1-pro-preview",
            name: "Gemini 3.1 Pro Preview",
            contextWindow: 1048576,
            outputWindow: 65536,
            capabilities: {
              streaming: true,
              tools: true,
              vision: true,
              thinking: {
                toggleable: false,
                budgetAdjustable: true,
                defaultEnabled: true
              }
            }
          },
          {
            id: "gemini-3-flash-preview",
            name: "Gemini 3 Flash Preview",
            contextWindow: 1048576,
            outputWindow: 65536,
            capabilities: {
              streaming: true,
              tools: true,
              vision: true,
              thinking: {
                toggleable: false,
                budgetAdjustable: true,
                defaultEnabled: true
              }
            }
          },
          {
            id: "gemini-2.5-flash",
            name: "Gemini 2.5 Flash",
            contextWindow: 1048576,
            outputWindow: 65536,
            capabilities: {
              streaming: true,
              tools: true,
              vision: true,
              thinking: {
                toggleable: true,
                budgetAdjustable: true,
                defaultEnabled: true
              }
            }
          },
          {
            id: "gemini-2.5-flash-lite",
            name: "Gemini 2.5 Flash Lite",
            contextWindow: 1048576,
            outputWindow: 65536,
            capabilities: {
              streaming: true,
              tools: true,
              vision: true,
              thinking: {
                toggleable: true,
                budgetAdjustable: true,
                defaultEnabled: false
              }
            }
          },
          {
            id: "gemini-2.5-pro",
            name: "Gemini 2.5 Pro",
            contextWindow: 1048576,
            outputWindow: 65536,
            capabilities: {
              streaming: true,
              tools: true,
              vision: true,
              thinking: {
                toggleable: false,
                budgetAdjustable: true,
                defaultEnabled: true
              }
            }
          }
        ]
      },
      glm: {
        id: "glm",
        name: "GLM",
        type: "openai",
        defaultBaseUrl: "https://open.bigmodel.cn/api/paas/v4",
        alternateBaseUrls: [
          { label: "settings.baseUrlRegion.china", url: "https://open.bigmodel.cn/api/paas/v4" },
          { label: "settings.baseUrlRegion.international", url: "https://api.z.ai/api/paas/v4" }
        ],
        requiresApiKey: true,
        icon: "/logos/glm.svg",
        models: [
          // GLM-5.2 Series - Long-horizon coding model
          {
            id: "glm-5.2",
            name: "GLM-5.2",
            contextWindow: 1e6,
            outputWindow: 128e3,
            capabilities: {
              streaming: true,
              tools: true,
              vision: false,
              thinking: {
                toggleable: true,
                budgetAdjustable: true,
                defaultEnabled: true
              }
            }
          },
          // GLM-5.1 Series
          {
            id: "glm-5.1",
            name: "GLM-5.1",
            contextWindow: 2e5,
            outputWindow: 128e3,
            capabilities: { streaming: true, tools: true, vision: false }
          },
          {
            id: "glm-5v-turbo",
            name: "GLM-5V-Turbo",
            contextWindow: 2e5,
            outputWindow: 128e3,
            capabilities: { streaming: true, tools: true, vision: true }
          },
          // GLM-5 Series
          {
            id: "glm-5",
            name: "GLM-5",
            contextWindow: 2e5,
            outputWindow: 128e3,
            capabilities: { streaming: true, tools: true, vision: false }
          },
          // GLM-4.7 Series
          {
            id: "glm-4.7",
            name: "GLM-4.7",
            contextWindow: 2e5,
            outputWindow: 128e3,
            capabilities: { streaming: true, tools: true, vision: false }
          },
          {
            id: "glm-4.7-flashx",
            name: "GLM-4.7-FlashX",
            contextWindow: 2e5,
            outputWindow: 128e3,
            capabilities: { streaming: true, tools: true, vision: false }
          },
          {
            id: "glm-4.7-flash",
            name: "GLM-4.7-Flash",
            contextWindow: 2e5,
            outputWindow: 128e3,
            capabilities: { streaming: true, tools: true, vision: false }
          },
          // GLM-4.6 Series - Advanced coding & reasoning
          {
            id: "glm-4.6",
            name: "GLM-4.6",
            contextWindow: 2e5,
            outputWindow: 128e3,
            capabilities: { streaming: true, tools: true, vision: false }
          },
          {
            id: "glm-4.6v",
            name: "GLM-4.6V",
            contextWindow: 128e3,
            outputWindow: 32e3,
            capabilities: { streaming: true, tools: true, vision: true }
          },
          {
            id: "glm-4.6v-flash",
            name: "GLM-4.6V-Flash",
            contextWindow: 128e3,
            outputWindow: 32e3,
            capabilities: { streaming: true, tools: true, vision: true }
          }
        ]
      },
      qwen: {
        id: "qwen",
        name: "Qwen",
        type: "openai",
        defaultBaseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
        requiresApiKey: true,
        icon: "/logos/qwen.svg",
        models: [
          {
            id: "qwen3.7-plus",
            name: "Qwen3.7 Plus",
            contextWindow: 1e6,
            outputWindow: 64e3,
            capabilities: {
              streaming: true,
              tools: true,
              vision: true,
              thinking: {
                toggleable: true,
                budgetAdjustable: true,
                defaultEnabled: true
              }
            }
          },
          {
            id: "qwen3.7-max",
            name: "Qwen3.7 Max",
            contextWindow: 1e6,
            outputWindow: 64e3,
            capabilities: {
              streaming: true,
              tools: true,
              vision: false,
              thinking: {
                toggleable: true,
                budgetAdjustable: true,
                defaultEnabled: true
              }
            }
          },
          {
            id: "qwen3.6-max-preview",
            name: "Qwen3.6 Max Preview",
            contextWindow: 256e3,
            outputWindow: 64e3,
            capabilities: {
              streaming: true,
              tools: true,
              vision: false,
              thinking: {
                toggleable: true,
                budgetAdjustable: true,
                defaultEnabled: false
              }
            }
          },
          {
            id: "qwen3.6-plus",
            name: "Qwen3.6 Plus",
            contextWindow: 1e6,
            outputWindow: 64e3,
            capabilities: {
              streaming: true,
              tools: true,
              vision: false,
              thinking: {
                toggleable: true,
                budgetAdjustable: true,
                defaultEnabled: false
              }
            }
          },
          {
            id: "qwen3.6-plus-2026-04-02",
            name: "Qwen3.6 Plus (2026-04-02)",
            contextWindow: 1e6,
            outputWindow: 64e3,
            capabilities: {
              streaming: true,
              tools: true,
              vision: false,
              thinking: {
                toggleable: true,
                budgetAdjustable: true,
                defaultEnabled: false
              }
            }
          },
          {
            id: "qwen3.6-flash",
            name: "Qwen3.6 Flash",
            contextWindow: 1e6,
            outputWindow: 64e3,
            capabilities: {
              streaming: true,
              tools: true,
              vision: false,
              thinking: {
                toggleable: true,
                budgetAdjustable: true,
                defaultEnabled: false
              }
            }
          },
          {
            id: "qwen3.6-flash-2026-04-16",
            name: "Qwen3.6 Flash (2026-04-16)",
            contextWindow: 1e6,
            outputWindow: 64e3,
            capabilities: {
              streaming: true,
              tools: true,
              vision: false,
              thinking: {
                toggleable: true,
                budgetAdjustable: true,
                defaultEnabled: false
              }
            }
          },
          {
            id: "qwen3.6-35b-a3b",
            name: "Qwen3.6 35B A3B",
            contextWindow: 262144,
            outputWindow: 64e3,
            capabilities: {
              streaming: true,
              tools: true,
              vision: true,
              thinking: {
                toggleable: true,
                budgetAdjustable: true,
                defaultEnabled: false
              }
            }
          },
          {
            id: "qwen3.5-flash",
            name: "Qwen3.5 Flash",
            contextWindow: 1e6,
            outputWindow: 65536,
            capabilities: { streaming: true, tools: true, vision: true }
          },
          {
            id: "qwen3.5-plus",
            name: "Qwen3.5 Plus",
            contextWindow: 1e6,
            outputWindow: 65536,
            capabilities: { streaming: true, tools: true, vision: true }
          },
          {
            id: "qwen3-max",
            name: "Qwen3 Max",
            contextWindow: 262144,
            outputWindow: 65536,
            capabilities: { streaming: true, tools: true, vision: false }
          },
          {
            id: "qwen3-vl-plus",
            name: "Qwen3 VL Plus",
            contextWindow: 262144,
            outputWindow: 32768,
            capabilities: { streaming: true, tools: true, vision: true }
          }
        ]
      },
      deepseek: {
        id: "deepseek",
        name: "DeepSeek",
        type: "openai",
        defaultBaseUrl: "https://api.deepseek.com/v1",
        requiresApiKey: true,
        icon: "/logos/deepseek.svg",
        models: [
          {
            id: "deepseek-v4-pro",
            name: "DeepSeek V4 Pro",
            contextWindow: 1048576,
            outputWindow: 393216,
            capabilities: {
              streaming: true,
              tools: true,
              vision: false,
              thinking: {
                toggleable: true,
                budgetAdjustable: true,
                defaultEnabled: true
              }
            }
          },
          {
            id: "deepseek-v4-flash",
            name: "DeepSeek V4 Flash",
            contextWindow: 1048576,
            outputWindow: 393216,
            capabilities: {
              streaming: true,
              tools: true,
              vision: false,
              thinking: {
                toggleable: true,
                budgetAdjustable: true,
                defaultEnabled: true
              }
            }
          }
        ]
      },
      kimi: {
        id: "kimi",
        name: "Kimi",
        type: "openai",
        defaultBaseUrl: "https://api.moonshot.cn/v1",
        alternateBaseUrls: [
          { label: "settings.baseUrlRegion.china", url: "https://api.moonshot.cn/v1" },
          { label: "settings.baseUrlRegion.international", url: "https://api.moonshot.ai/v1" }
        ],
        requiresApiKey: true,
        icon: "/logos/kimi.png",
        models: [
          {
            id: "kimi-k3",
            name: "Kimi K3",
            contextWindow: 1048576,
            outputWindow: 131072,
            capabilities: {
              streaming: true,
              tools: true,
              vision: true,
              thinking: {
                toggleable: false,
                budgetAdjustable: true,
                defaultEnabled: true
              }
            }
          },
          {
            id: "kimi-k2.7-code",
            name: "Kimi K2.7 Code",
            contextWindow: 256e3,
            outputWindow: 32768,
            capabilities: {
              streaming: true,
              tools: true,
              vision: true,
              thinking: {
                toggleable: false,
                budgetAdjustable: false,
                defaultEnabled: true
              }
            }
          },
          {
            id: "kimi-k2.7-code-highspeed",
            name: "Kimi K2.7 Code HighSpeed",
            contextWindow: 256e3,
            outputWindow: 32768,
            capabilities: {
              streaming: true,
              tools: true,
              vision: true,
              thinking: {
                toggleable: false,
                budgetAdjustable: false,
                defaultEnabled: true
              }
            }
          },
          {
            id: "kimi-k2.6",
            name: "Kimi K2.6",
            contextWindow: 256e3,
            outputWindow: 8192,
            capabilities: {
              streaming: true,
              tools: true,
              vision: true,
              thinking: {
                toggleable: true,
                budgetAdjustable: false,
                defaultEnabled: true
              }
            }
          },
          // K2.5 Series (2026) - 1T MoE, 32B active parameters
          {
            id: "kimi-k2.5",
            name: "Kimi K2.5",
            contextWindow: 256e3,
            outputWindow: 8192,
            capabilities: {
              streaming: true,
              tools: true,
              vision: true,
              thinking: {
                toggleable: true,
                budgetAdjustable: false,
                defaultEnabled: true
              }
            }
          },
          {
            id: "kimi-k2-thinking",
            name: "Kimi K2 Thinking",
            contextWindow: 256e3,
            outputWindow: 8192,
            capabilities: {
              streaming: true,
              tools: true,
              vision: false,
              thinking: {
                toggleable: true,
                budgetAdjustable: false,
                defaultEnabled: true
              }
            }
          }
        ]
      },
      minimax: {
        id: "minimax",
        name: "MiniMax",
        type: "anthropic",
        defaultBaseUrl: "https://api.minimaxi.com/anthropic/v1",
        alternateBaseUrls: [
          { label: "settings.baseUrlRegion.china", url: "https://api.minimaxi.com/anthropic/v1" },
          { label: "settings.baseUrlRegion.international", url: "https://api.minimax.io/anthropic/v1" }
        ],
        requiresApiKey: true,
        icon: "/logos/minimax.svg",
        models: [
          {
            id: "MiniMax-M3",
            name: "MiniMax M3",
            contextWindow: 1e6,
            outputWindow: 32768,
            capabilities: { streaming: true, tools: true, vision: true }
          },
          {
            id: "MiniMax-M2.7",
            name: "MiniMax M2.7",
            contextWindow: 204800,
            outputWindow: 8192,
            capabilities: { streaming: true, tools: true, vision: false }
          }
        ]
      },
      siliconflow: {
        id: "siliconflow",
        name: "\u7845\u57FA\u6D41\u52A8",
        type: "openai",
        defaultBaseUrl: "https://api.siliconflow.cn/v1",
        requiresApiKey: true,
        icon: "/logos/siliconflow.svg",
        models: [
          // DeepSeek Series
          {
            id: "deepseek-ai/DeepSeek-V3.2",
            name: "DeepSeek-V3.2",
            contextWindow: 128e3,
            outputWindow: 8192,
            capabilities: { streaming: true, tools: true, vision: false }
          },
          {
            id: "deepseek-ai/DeepSeek-R1",
            name: "DeepSeek-R1",
            contextWindow: 128e3,
            outputWindow: 8192,
            capabilities: { streaming: true, tools: true, vision: false }
          },
          {
            id: "deepseek-ai/DeepSeek-R1-Distill-Qwen-7B",
            name: "DeepSeek-R1-Distill-Qwen-7B",
            contextWindow: 128e3,
            outputWindow: 8192,
            capabilities: { streaming: true, tools: true, vision: false }
          },
          // Qwen Series
          {
            id: "Qwen/Qwen3-VL-32B-Instruct",
            name: "Qwen3-VL-32B-Instruct",
            contextWindow: 256e3,
            outputWindow: 32768,
            capabilities: { streaming: true, tools: true, vision: true }
          },
          // Kimi Series
          {
            id: "Pro/moonshotai/Kimi-K2.5",
            name: "Kimi-K2.5",
            contextWindow: 256e3,
            outputWindow: 96e3,
            capabilities: { streaming: true, tools: true, vision: false }
          },
          // GLM Series
          {
            id: "THUDM/GLM-4.1V-9B-Thinking",
            name: "GLM-4.1V-9B-Thinking",
            contextWindow: 64e3,
            outputWindow: 8192,
            capabilities: { streaming: true, tools: true, vision: true }
          },
          {
            id: "THUDM/GLM-Z1-Rumination-32B-0414",
            name: "GLM-Z1-Rumination-32B",
            contextWindow: 32e3,
            outputWindow: 16384,
            capabilities: { streaming: true, tools: true, vision: false }
          }
        ]
      },
      doubao: {
        id: "doubao",
        name: "\u8C46\u5305",
        type: "openai",
        defaultBaseUrl: "https://ark.cn-beijing.volces.com/api/v3",
        requiresApiKey: true,
        icon: "/logos/doubao.svg",
        models: [
          {
            id: "doubao-seed-2-1-pro-260628",
            name: "Doubao Seed 2.1 Pro",
            contextWindow: 256e3,
            outputWindow: 32768,
            capabilities: { streaming: true, tools: true, vision: true }
          },
          {
            id: "doubao-seed-2-1-turbo-260628",
            name: "Doubao Seed 2.1 Turbo",
            contextWindow: 256e3,
            outputWindow: 32768,
            capabilities: { streaming: true, tools: true, vision: true }
          },
          {
            id: "doubao-seed-evolving",
            name: "Doubao Seed Evolving",
            contextWindow: 256e3,
            outputWindow: 32768,
            capabilities: { streaming: true, tools: true, vision: true }
          },
          {
            id: "doubao-seed-character-260628",
            name: "Doubao Seed Character",
            contextWindow: 256e3,
            outputWindow: 32768,
            capabilities: { streaming: true, tools: true, vision: true }
          },
          {
            id: "doubao-seed-2-0-pro-260215",
            name: "Doubao Seed 2.0 Pro",
            contextWindow: 128e3,
            outputWindow: 32768,
            capabilities: { streaming: true, tools: true, vision: true }
          },
          {
            id: "doubao-seed-2-0-lite-260215",
            name: "Doubao Seed 2.0 Lite",
            contextWindow: 128e3,
            outputWindow: 32768,
            capabilities: { streaming: true, tools: true, vision: true }
          },
          {
            id: "doubao-seed-2-0-mini-260215",
            name: "Doubao Seed 2.0 Mini",
            contextWindow: 128e3,
            outputWindow: 32768,
            capabilities: { streaming: true, tools: true, vision: true }
          },
          {
            id: "doubao-seed-1-8-251228",
            name: "Doubao Seed 1.8",
            contextWindow: 128e3,
            outputWindow: 32768,
            capabilities: { streaming: true, tools: true, vision: true }
          }
        ]
      },
      openrouter: {
        id: "openrouter",
        name: "OpenRouter",
        type: "openai",
        defaultBaseUrl: "https://openrouter.ai/api/v1",
        requiresApiKey: true,
        icon: "/logos/openrouter.svg",
        models: [
          {
            id: "deepseek/deepseek-v4-pro",
            name: "DeepSeek V4 Pro",
            contextWindow: 1048576,
            outputWindow: 131072,
            capabilities: { streaming: true, tools: true, vision: false }
          },
          {
            id: "deepseek/deepseek-v4-flash",
            name: "DeepSeek V4 Flash",
            contextWindow: 1048576,
            outputWindow: 131072,
            capabilities: { streaming: true, tools: true, vision: false }
          }
        ]
      },
      grok: {
        id: "grok",
        name: "Grok",
        type: "openai",
        defaultBaseUrl: "https://api.x.ai/v1",
        requiresApiKey: true,
        icon: "/logos/grok.svg",
        models: [
          {
            id: "grok-4.6",
            name: "Grok 4.6",
            contextWindow: 5e5,
            outputWindow: 5e5,
            capabilities: {
              streaming: true,
              tools: true,
              vision: true,
              thinking: {
                toggleable: false,
                budgetAdjustable: true,
                defaultEnabled: true
              }
            }
          },
          {
            id: "grok-4.5",
            name: "Grok 4.5",
            contextWindow: 5e5,
            outputWindow: 5e5,
            capabilities: {
              streaming: true,
              tools: true,
              vision: true,
              thinking: {
                toggleable: false,
                budgetAdjustable: true,
                defaultEnabled: true
              }
            }
          },
          {
            id: "grok-4.3",
            name: "Grok 4.3",
            contextWindow: 1e6,
            outputWindow: 3e4,
            capabilities: {
              streaming: true,
              tools: true,
              vision: true,
              thinking: {
                toggleable: true,
                budgetAdjustable: true,
                defaultEnabled: false
              }
            }
          },
          {
            id: "grok-build-0.1",
            name: "Grok Build 0.1",
            contextWindow: 256e3,
            outputWindow: 256e3,
            capabilities: {
              streaming: true,
              tools: true,
              vision: true,
              thinking: {
                toggleable: false,
                budgetAdjustable: false,
                defaultEnabled: true
              }
            }
          },
          {
            id: "grok-4.20-reasoning",
            name: "Grok 4.20 Reasoning",
            contextWindow: 2e6,
            outputWindow: 131072,
            capabilities: {
              streaming: true,
              tools: true,
              vision: true,
              thinking: {
                toggleable: false,
                budgetAdjustable: false,
                defaultEnabled: true
              }
            }
          },
          {
            id: "grok-4.20",
            name: "Grok 4.20",
            contextWindow: 2e6,
            outputWindow: 131072,
            capabilities: { streaming: true, tools: true, vision: true }
          },
          {
            id: "grok-4.20-multi-agent",
            name: "Grok 4.20 Multi-Agent",
            contextWindow: 2e6,
            outputWindow: 131072,
            capabilities: {
              streaming: true,
              tools: true,
              vision: true,
              thinking: {
                toggleable: false,
                budgetAdjustable: false,
                defaultEnabled: true
              }
            }
          },
          {
            id: "grok-4-1-fast-reasoning",
            name: "Grok 4.1 Fast Reasoning",
            contextWindow: 2e6,
            outputWindow: 131072,
            capabilities: {
              streaming: true,
              tools: true,
              vision: true,
              thinking: {
                toggleable: false,
                budgetAdjustable: false,
                defaultEnabled: true
              }
            }
          },
          {
            id: "grok-4-1-fast-non-reasoning",
            name: "Grok 4.1 Fast",
            contextWindow: 2e6,
            outputWindow: 131072,
            capabilities: { streaming: true, tools: true, vision: true }
          },
          {
            id: "grok-code-fast-1",
            name: "Grok Code Fast",
            contextWindow: 256e3,
            outputWindow: 32768,
            capabilities: { streaming: true, tools: true, vision: false }
          }
        ]
      },
      "tencent-hunyuan": {
        id: "tencent-hunyuan",
        name: "Tencent Hunyuan",
        type: "openai",
        defaultBaseUrl: "https://tokenhub.tencentmaas.com/v1",
        alternateBaseUrls: [
          { label: "settings.baseUrlRegion.china", url: "https://tokenhub.tencentmaas.com/v1" },
          {
            label: "settings.baseUrlRegion.international",
            url: "https://tokenhub-intl.tencentmaas.com/v1"
          }
        ],
        requiresApiKey: true,
        icon: "/logos/hunyuan.svg",
        models: [
          {
            id: "hy3-preview",
            name: "Tencent Hy3 Preview",
            contextWindow: 256e3,
            outputWindow: 64e3,
            capabilities: { streaming: true, tools: true, vision: false }
          }
        ]
      },
      xiaomi: {
        id: "xiaomi",
        name: "Xiaomi MiMo",
        type: "openai",
        defaultBaseUrl: "https://api.xiaomimimo.com/v1",
        // Token Plan endpoints use the same OpenAI-compatible path with regional hosts.
        alternateBaseUrls: [
          { label: "settings.baseUrlRegion.xiaomiPayg", url: "https://api.xiaomimimo.com/v1" },
          {
            label: "settings.baseUrlRegion.xiaomiTokenPlanCN",
            url: "https://token-plan-cn.xiaomimimo.com/v1"
          },
          {
            label: "settings.baseUrlRegion.xiaomiTokenPlanSGP",
            url: "https://token-plan-sgp.xiaomimimo.com/v1"
          },
          {
            label: "settings.baseUrlRegion.xiaomiTokenPlanEU",
            url: "https://token-plan-ams.xiaomimimo.com/v1"
          }
        ],
        requiresApiKey: true,
        icon: "/logos/xiaomi.svg",
        models: [
          {
            id: "mimo-v2.5-pro",
            name: "MiMo V2.5 Pro",
            contextWindow: 1048576,
            outputWindow: 131072,
            capabilities: {
              streaming: true,
              tools: true,
              vision: false,
              thinking: {
                toggleable: true,
                budgetAdjustable: false,
                defaultEnabled: true
              }
            }
          },
          {
            id: "mimo-v2-pro",
            name: "MiMo V2 Pro",
            contextWindow: 1048576,
            outputWindow: 131072,
            capabilities: {
              streaming: true,
              tools: true,
              vision: false,
              thinking: {
                toggleable: true,
                budgetAdjustable: false,
                defaultEnabled: true
              }
            }
          },
          {
            id: "mimo-v2.5",
            name: "MiMo V2.5",
            contextWindow: 1048576,
            outputWindow: 131072,
            capabilities: {
              streaming: true,
              tools: true,
              vision: true,
              thinking: {
                toggleable: true,
                budgetAdjustable: false,
                defaultEnabled: true
              }
            }
          },
          {
            id: "mimo-v2-omni",
            name: "MiMo V2 Omni",
            contextWindow: 262144,
            outputWindow: 131072,
            capabilities: {
              streaming: true,
              tools: true,
              vision: true,
              thinking: {
                toggleable: true,
                budgetAdjustable: false,
                defaultEnabled: true
              }
            }
          },
          {
            id: "mimo-v2-flash",
            name: "MiMo V2 Flash",
            contextWindow: 262144,
            outputWindow: 65536,
            capabilities: {
              streaming: true,
              tools: true,
              vision: false,
              thinking: {
                toggleable: true,
                budgetAdjustable: false,
                defaultEnabled: true
              }
            }
          }
        ]
      },
      ollama: {
        id: "ollama",
        name: "Ollama",
        type: "openai",
        defaultBaseUrl: "http://localhost:11434/v1",
        requiresApiKey: false,
        icon: "/logos/ollama.svg",
        models: [
          {
            id: "llama3.3",
            name: "Llama 3.3 70B",
            contextWindow: 131072,
            outputWindow: 4096,
            capabilities: { streaming: true, tools: true, vision: false }
          },
          {
            id: "gemma3",
            name: "Gemma 3 12B",
            contextWindow: 131072,
            outputWindow: 8192,
            capabilities: { streaming: true, tools: true, vision: true }
          },
          {
            id: "deepseek-r1",
            name: "DeepSeek R1",
            contextWindow: 131072,
            outputWindow: 8192,
            capabilities: { streaming: true, tools: false, vision: false }
          }
        ]
      },
      lemonade: {
        id: "lemonade",
        name: "Lemonade",
        type: "openai",
        defaultBaseUrl: "http://localhost:13305/v1",
        requiresApiKey: false,
        icon: "/logos/lemonade.svg",
        models: [
          {
            id: "Gemma-4-26B-A4B-it-GGUF",
            name: "Gemma 4 26B A4B IT GGUF",
            capabilities: { streaming: true, tools: true, vision: false }
          }
        ]
      }
    };
    applyModelMetadata(PROVIDERS);
  }
});

// OpenMAIC/lib/ai/thinking-context.ts
import { AsyncLocalStorage } from "node:async_hooks";
var thinkingContext;
var init_thinking_context = __esm({
  "OpenMAIC/lib/ai/thinking-context.ts"() {
    "use strict";
    thinkingContext = new AsyncLocalStorage();
    globalThis.__thinkingContext = thinkingContext;
  }
});

// OpenMAIC/lib/usage/normalize.ts
var normalize_exports = {};
__export(normalize_exports, {
  hasBillableTokens: () => hasBillableTokens,
  normalizeUsage: () => normalizeUsage
});
function num(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}
function normalizeUsage(usage) {
  if (!usage) {
    return {
      inputTokens: 0,
      outputTokens: 0,
      cacheReadTokens: 0,
      cacheCreationTokens: 0,
      reasoningTokens: 0
    };
  }
  const cacheRead = num(usage.inputTokenDetails?.cacheReadTokens) || num(usage.cachedInputTokens);
  const cacheCreation = num(usage.inputTokenDetails?.cacheWriteTokens);
  const reasoning = num(usage.outputTokenDetails?.reasoningTokens) || num(usage.reasoningTokens);
  return {
    inputTokens: num(usage.inputTokens),
    outputTokens: num(usage.outputTokens),
    cacheReadTokens: cacheRead,
    cacheCreationTokens: cacheCreation,
    reasoningTokens: reasoning
  };
}
function hasBillableTokens(usage) {
  return usage.inputTokens > 0 || usage.outputTokens > 0 || usage.cacheReadTokens > 0 || usage.cacheCreationTokens > 0;
}
var init_normalize = __esm({
  "OpenMAIC/lib/usage/normalize.ts"() {
    "use strict";
  }
});

// OpenMAIC/lib/server/usage-storage.ts
var usage_storage_exports = {};
__export(usage_storage_exports, {
  readUsageRecords: () => readUsageRecords,
  recordGenerationUsage: () => recordGenerationUsage,
  recordUsage: () => recordUsage
});
import { promises as fs } from "fs";
import path from "path";
function usageDir(baseDir) {
  return baseDir ?? path.join(process.cwd(), "data", "usage");
}
function monthlyFile(dir, now) {
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  return path.join(dir, `${y}-${m}.jsonl`);
}
function makeId(now) {
  counter = (counter + 1) % 1e6;
  return `${now.getTime()}-${counter.toString(36)}`;
}
async function recordUsage(input, opts = {}) {
  if (!opts.baseDir && (process.env.VITEST || process.env.NODE_ENV === "test")) return;
  try {
    const kind = input.kind ?? "llm";
    const usage = input.usage ?? ZERO_USAGE;
    if (kind === "llm") {
      if (!hasBillableTokens(usage)) return;
    } else if (!input.quantity || input.quantity <= 0) {
      return;
    }
    const now = opts.now ?? /* @__PURE__ */ new Date();
    const record = {
      id: makeId(now),
      createdAt: now.getTime(),
      kind,
      source: input.source,
      providerId: input.providerId,
      modelId: input.modelId,
      modelString: input.modelString,
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
      cacheReadTokens: usage.cacheReadTokens,
      cacheCreationTokens: usage.cacheCreationTokens,
      reasoningTokens: usage.reasoningTokens,
      ...input.quantity != null ? { quantity: input.quantity } : {},
      ...input.unit ? { unit: input.unit } : {}
    };
    const dir = usageDir(opts.baseDir);
    await fs.mkdir(dir, { recursive: true });
    await fs.appendFile(monthlyFile(dir, now), JSON.stringify(record) + "\n", "utf-8");
  } catch (err) {
    log2.warn("Failed to record usage (ignored):", err);
  }
}
function recordGenerationUsage(input) {
  const modelId = input.modelId || input.providerId;
  return recordUsage({
    kind: input.kind,
    unit: input.unit,
    source: input.kind,
    providerId: input.providerId,
    modelId,
    modelString: `${input.providerId}:${modelId}`,
    quantity: input.quantity
  });
}
async function readUsageRecords(opts = {}) {
  const dir = usageDir(opts.baseDir);
  let files;
  try {
    files = (await fs.readdir(dir)).filter((f) => f.endsWith(".jsonl"));
  } catch {
    return [];
  }
  if (opts.months?.length) {
    files = files.filter((f) => opts.months.some((m) => f.startsWith(m)));
  }
  const records = [];
  for (const file of files.sort()) {
    let content;
    try {
      content = await fs.readFile(path.join(dir, file), "utf-8");
    } catch {
      continue;
    }
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        const row = JSON.parse(trimmed);
        if (!row.kind) row.kind = "llm";
        records.push(row);
      } catch {
      }
    }
  }
  return records;
}
var log2, counter, ZERO_USAGE;
var init_usage_storage = __esm({
  "OpenMAIC/lib/server/usage-storage.ts"() {
    "use strict";
    init_logger();
    init_normalize();
    log2 = createLogger("UsageStorage");
    counter = 0;
    ZERO_USAGE = {
      inputTokens: 0,
      outputTokens: 0,
      cacheReadTokens: 0,
      cacheCreationTokens: 0,
      reasoningTokens: 0
    };
  }
});

// OpenMAIC/lib/ai/llm.ts
import { generateText, streamText } from "ai";
function getModelId(params) {
  const m = params.model;
  if (typeof m === "string") return m;
  if (m && typeof m === "object" && "modelId" in m) return m.modelId;
  return "unknown";
}
function getGlobalThinkingConfig() {
  if (process.env.LLM_THINKING_DISABLED === "true") {
    return { mode: "disabled", enabled: false };
  }
  return void 0;
}
function getAnthropicEffort(thinking, config) {
  const effort = pickThinkingEffort(thinking, config);
  if (!effort || effort === "none" || effort === "minimal") return void 0;
  return effort;
}
function normalizeProviderId(provider, modelId) {
  if (!provider) return void 0;
  if (provider === "anthropic.messages" && modelId?.startsWith("MiniMax-")) return "minimax";
  if (provider === "amazon-bedrock") return "bedrock";
  if (provider in PROVIDERS) return provider;
  const prefix = provider.split(".")[0];
  return prefix in PROVIDERS ? prefix : void 0;
}
function getModelProviderId(params) {
  const m = params.model;
  if (!m || typeof m !== "object" || !("provider" in m)) return void 0;
  const provider = m.provider;
  const modelId = "modelId" in m ? m.modelId : void 0;
  return normalizeProviderId(provider, modelId);
}
function buildThinkingProviderOptions(providerId, modelId, config) {
  const lookupModelId = providerId ? getCanonicalModelId(providerId, modelId) : modelId;
  const info = providerId ? MODEL_THINKING_MAP.get(getModelMetadataKey(providerId, lookupModelId)) : UNIQUE_MODEL_THINKING_MAP.get(lookupModelId);
  if (!info?.thinking) return void 0;
  const thinking = info.thinking;
  if (thinking.control === "none") return void 0;
  const mode = getThinkingMode(config);
  switch (thinking.requestAdapter) {
    case "openai": {
      const effort = pickThinkingEffort(thinking, config);
      return effort ? { openai: { reasoningEffort: effort } } : void 0;
    }
    case "anthropic": {
      const buildAnthropicOptions = (options4) => ({
        anthropic: options4
      });
      if (mode === "disabled" && thinking.toggleable !== false) {
        return buildAnthropicOptions({ thinking: { type: "disabled" } });
      }
      if (thinking.control === "toggle-budget" || thinking.control === "budget-only") {
        const budget2 = pickThinkingBudget(thinking, config);
        return budget2 === void 0 ? void 0 : buildAnthropicOptions({ thinking: { type: "enabled", budgetTokens: budget2 } });
      }
      const effort = getAnthropicEffort(thinking, config);
      if (!effort) return void 0;
      if (thinking.anthropicThinking?.type === "adaptive") {
        return buildAnthropicOptions({
          thinking: { type: "adaptive" },
          effort
        });
      }
      const manualEffort = effort === "xhigh" ? "max" : effort;
      const budget = thinking.anthropicThinking?.budgetByEffort?.[manualEffort];
      if (!budget) return void 0;
      return buildAnthropicOptions({
        thinking: { type: "enabled", budgetTokens: budget },
        effort: manualEffort
      });
    }
    case "google": {
      if (thinking.control === "level") {
        const level = pickThinkingLevel(thinking, config);
        return level ? { google: { thinkingConfig: { thinkingLevel: level } } } : void 0;
      }
      const budget = pickThinkingBudget(thinking, config);
      if (budget === void 0) return void 0;
      return { google: { thinkingConfig: { thinkingBudget: budget } } };
    }
    default:
      return void 0;
  }
}
function injectProviderOptions(params, thinking) {
  if (params.providerOptions) return params;
  const modelId = getModelId(params);
  const providerId = getModelProviderId(params);
  if (thinking) {
    const opts = buildThinkingProviderOptions(providerId, modelId, thinking);
    if (opts) return { ...params, providerOptions: opts };
  }
  return params;
}
function buildUsageMeta(params, source) {
  const rawModelId = getModelId(params);
  const providerId = getModelProviderId(params) ?? "unknown";
  const modelId = getCanonicalModelId(providerId, rawModelId);
  return { source, providerId, modelId, modelString: `${providerId}:${modelId}` };
}
function recordUsageSafe(rawUsage, meta) {
  void (async () => {
    try {
      const { normalizeUsage: normalizeUsage2 } = await Promise.resolve().then(() => (init_normalize(), normalize_exports));
      const { recordUsage: recordUsage2 } = await Promise.resolve().then(() => (init_usage_storage(), usage_storage_exports));
      await recordUsage2({
        kind: "llm",
        source: meta.source,
        providerId: meta.providerId,
        modelId: meta.modelId,
        modelString: meta.modelString,
        usage: normalizeUsage2(rawUsage)
      });
    } catch (err) {
      log3.warn("Usage capture failed (ignored):", err);
    }
  })();
}
async function callLLM(params, source, retryOptions, thinking) {
  const maxAttempts = (retryOptions?.retries ?? 0) + 1;
  const validate = retryOptions?.validate ?? (maxAttempts > 1 ? DEFAULT_VALIDATE : void 0);
  let lastResult;
  let lastError;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const effectiveThinking = thinking ?? getGlobalThinkingConfig();
      const injectedParams = injectProviderOptions(params, effectiveThinking);
      const result = await thinkingContext.run(
        effectiveThinking,
        () => generateText(injectedParams)
      );
      recordUsageSafe(result.totalUsage ?? result.usage, buildUsageMeta(params, source));
      if (validate && !validate(result.text)) {
        log3.warn(
          `[${source}] Validation failed (attempt ${attempt}/${maxAttempts}), ${attempt < maxAttempts ? "retrying..." : "giving up"}`
        );
        lastResult = result;
        continue;
      }
      return result;
    } catch (error) {
      lastError = error;
      if (attempt < maxAttempts) {
        log3.warn(`[${source}] Call failed (attempt ${attempt}/${maxAttempts}), retrying...`, error);
        continue;
      }
    }
  }
  if (lastResult) return lastResult;
  throw lastError;
}
var log3, MODEL_THINKING_MAP, UNIQUE_MODEL_THINKING_MAP, DEFAULT_VALIDATE;
var init_llm = __esm({
  "OpenMAIC/lib/ai/llm.ts"() {
    "use strict";
    init_logger();
    init_providers();
    init_thinking_context();
    init_model_metadata();
    init_model_aliases();
    init_thinking_config();
    log3 = createLogger("LLM");
    MODEL_THINKING_MAP = (() => {
      const map = /* @__PURE__ */ new Map();
      for (const provider of Object.values(PROVIDERS)) {
        for (const model of provider.models) {
          map.set(getModelMetadataKey(provider.id, model.id), {
            thinking: model.capabilities?.thinking
          });
        }
      }
      return map;
    })();
    UNIQUE_MODEL_THINKING_MAP = (() => {
      const counts = /* @__PURE__ */ new Map();
      for (const provider of Object.values(PROVIDERS)) {
        for (const model of provider.models) {
          counts.set(model.id, (counts.get(model.id) ?? 0) + 1);
        }
      }
      const map = /* @__PURE__ */ new Map();
      for (const provider of Object.values(PROVIDERS)) {
        for (const model of provider.models) {
          if (counts.get(model.id) === 1) {
            map.set(model.id, {
              thinking: model.capabilities?.thinking
            });
          }
        }
      }
      return map;
    })();
    DEFAULT_VALIDATE = (text) => text.trim().length > 0;
  }
});

// OpenMAIC/lib/api/stage-api-defaults.ts
import { nanoid } from "nanoid";
function generateId(prefix) {
  return prefix ? `${prefix}_${nanoid(10)}` : nanoid(10);
}
function validateSceneId(scenes, sceneId) {
  return scenes.some((s) => s.id === sceneId);
}
function getScene(scenes, sceneId) {
  return scenes.find((s) => s.id === sceneId) || null;
}
function createDefaultSlideContent() {
  return {
    type: "slide",
    canvas: {
      id: generateId("slide"),
      viewportSize: 1e3,
      viewportRatio: 0.5625,
      // 16:9
      theme: {
        backgroundColor: "#ffffff",
        themeColors: ["#5b9bd5", "#ed7d31", "#a5a5a5", "#ffc000", "#4472c4"],
        fontColor: "#333333",
        fontName: "Microsoft YaHei",
        outline: {
          color: "#d14424",
          width: 2,
          style: "solid"
        },
        shadow: {
          h: 0,
          v: 0,
          blur: 10,
          color: "#000000"
        }
      },
      elements: []
    }
  };
}
function createDefaultQuizContent() {
  return {
    type: "quiz",
    questions: []
  };
}
function createDefaultInteractiveContent() {
  return {
    type: "interactive",
    url: ""
  };
}
function createDefaultPBLContent() {
  return { type: "pbl" };
}
function createDefaultContent(type) {
  switch (type) {
    case "slide":
      return createDefaultSlideContent();
    case "quiz":
      return createDefaultQuizContent();
    case "interactive":
      return createDefaultInteractiveContent();
    case "pbl":
      return createDefaultPBLContent();
    default:
      throw new Error(`Unknown scene type: ${type}`);
  }
}
var init_stage_api_defaults = __esm({
  "OpenMAIC/lib/api/stage-api-defaults.ts"() {
    "use strict";
  }
});

// OpenMAIC/lib/types/stage.ts
import { isSlideContent, isQuizContent } from "@openmaic/dsl";
function makeScene(core, content) {
  return { ...core, type: content.type, content };
}
var init_stage = __esm({
  "OpenMAIC/lib/types/stage.ts"() {
    "use strict";
  }
});

// OpenMAIC/lib/api/stage-api-scene.ts
function createSceneAPI(store2) {
  return {
    /**
     * Create a new scene
     *
     * @param params - Scene parameters
     * @returns Scene ID
     *
     * @example
     * const sceneId = api.scene.create({
     *   type: 'slide',
     *   title: 'Introduction',
     *   // speech is now in actions
     * });
     */
    create(params) {
      try {
        const state = store2.getState();
        if (!state.stage) {
          return {
            success: false,
            error: "No stage set - cannot create scene without a stage"
          };
        }
        const sceneId = generateId("scene");
        const order = params.order ?? state.scenes.length;
        let content;
        if (params.content) {
          if (params.content.type !== void 0 && params.content.type !== params.type) {
            return {
              success: false,
              error: `content.type '${params.content.type}' does not match scene type '${params.type}'`
            };
          }
          content = {
            ...createDefaultContent(params.type),
            ...params.content,
            type: params.type
          };
        } else {
          content = createDefaultContent(params.type);
        }
        const newScene = makeScene(
          {
            id: sceneId,
            stageId: state.stage.id,
            title: params.title,
            order,
            actions: params.actions,
            ...params.outlineId !== void 0 && { outlineId: params.outlineId },
            createdAt: Date.now(),
            updatedAt: Date.now()
          },
          content
        );
        const newScenes = [...state.scenes, newScene].sort((a, b) => a.order - b.order);
        store2.setState({ scenes: newScenes });
        return { success: true, data: sceneId };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    },
    /**
     * Delete a scene
     *
     * @param sceneId - Scene ID
     * @returns Whether successful
     */
    delete(sceneId) {
      try {
        const state = store2.getState();
        if (!validateSceneId(state.scenes, sceneId)) {
          return { success: false, error: `Scene not found: ${sceneId}` };
        }
        const newScenes = state.scenes.filter((s) => s.id !== sceneId);
        let newCurrentSceneId = state.currentSceneId;
        if (state.currentSceneId === sceneId) {
          newCurrentSceneId = newScenes.length > 0 ? newScenes[0].id : null;
        }
        store2.setState({
          scenes: newScenes,
          currentSceneId: newCurrentSceneId
        });
        return { success: true, data: true };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    },
    /**
     * Update a scene
     *
     * @param sceneId - Scene ID
     * @param updates - Fields to update
     * @returns Whether successful
     */
    update(sceneId, updates) {
      try {
        const state = store2.getState();
        if (!validateSceneId(state.scenes, sceneId)) {
          return { success: false, error: `Scene not found: ${sceneId}` };
        }
        const newScenes = state.scenes.map((scene) => {
          if (scene.id !== sceneId) return scene;
          const content = updates.content ?? scene.content;
          return makeScene({ ...scene, ...updates, updatedAt: Date.now() }, content);
        });
        store2.setState({ scenes: newScenes });
        return { success: true, data: true };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    },
    /**
     * Get all scenes
     *
     * @returns Scene list
     */
    list() {
      try {
        const state = store2.getState();
        return { success: true, data: [...state.scenes] };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    },
    /**
     * Get a specific scene
     *
     * @param sceneId - Scene ID
     * @returns Scene object
     */
    get(sceneId) {
      try {
        const state = store2.getState();
        const scene = getScene(state.scenes, sceneId);
        if (!scene) {
          return { success: false, error: `Scene not found: ${sceneId}` };
        }
        return { success: true, data: scene };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    }
  };
}
var init_stage_api_scene = __esm({
  "OpenMAIC/lib/api/stage-api-scene.ts"() {
    "use strict";
    init_stage();
    init_stage_api_defaults();
  }
});

// OpenMAIC/lib/api/stage-api-element.ts
function createElementAPI(store2) {
  return {
    /**
     * Add an element to a Slide
     *
     * @param sceneId - Scene ID
     * @param element - Element parameters (must include type, left, top, width, height)
     * @returns Element ID
     */
    add(sceneId, element) {
      try {
        const state = store2.getState();
        const scene = getScene(state.scenes, sceneId);
        if (!scene) {
          return { success: false, error: `Scene not found: ${sceneId}` };
        }
        if (scene.type !== "slide") {
          return { success: false, error: `Scene is not a slide: ${sceneId}` };
        }
        const content = scene.content;
        const elementId = generateId(element.type);
        const newElement = {
          ...element,
          id: elementId,
          rotate: element.rotate ?? 0
        };
        const newScenes = state.scenes.map((s) => {
          if (s.id === sceneId) {
            return {
              ...s,
              content: {
                ...content,
                canvas: {
                  ...content.canvas,
                  elements: [...content.canvas.elements, newElement]
                }
              },
              updatedAt: Date.now()
            };
          }
          return s;
        });
        store2.setState({ scenes: newScenes });
        return { success: true, data: elementId };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    },
    /**
     * Add elements in batch
     *
     * @deprecated will be removed in the future
     * @param sceneId - Scene ID
     * @param elements - Element array
     * @returns Element ID array
     */
    addBatch(sceneId, elements) {
      try {
        const state = store2.getState();
        const scene = getScene(state.scenes, sceneId);
        if (!scene) {
          return { success: false, error: `Scene not found: ${sceneId}` };
        }
        if (scene.type !== "slide") {
          return { success: false, error: `Scene is not a slide: ${sceneId}` };
        }
        const content = scene.content;
        const elementIds = [];
        const newElements = elements.map((el) => {
          const elementId = generateId(el.type);
          elementIds.push(elementId);
          return {
            ...el,
            id: elementId,
            rotate: el.rotate ?? 0
          };
        });
        const newScenes = state.scenes.map((s) => {
          if (s.id === sceneId) {
            return {
              ...s,
              content: {
                ...content,
                canvas: {
                  ...content.canvas,
                  elements: [...content.canvas.elements, ...newElements]
                }
              },
              updatedAt: Date.now()
            };
          }
          return s;
        });
        store2.setState({ scenes: newScenes });
        return { success: true, data: elementIds };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    },
    /**
     * Delete an element
     *
     * @param sceneId - Scene ID
     * @param elementId - Element ID
     * @returns Whether successful
     */
    delete(sceneId, elementId) {
      try {
        const state = store2.getState();
        const scene = getScene(state.scenes, sceneId);
        if (!scene) {
          return { success: false, error: `Scene not found: ${sceneId}` };
        }
        if (scene.type !== "slide") {
          return { success: false, error: `Scene is not a slide: ${sceneId}` };
        }
        const content = scene.content;
        const newScenes = state.scenes.map((s) => {
          if (s.id === sceneId) {
            return {
              ...s,
              content: {
                ...content,
                canvas: {
                  ...content.canvas,
                  elements: content.canvas.elements.filter((el) => el.id !== elementId)
                }
              },
              updatedAt: Date.now()
            };
          }
          return s;
        });
        store2.setState({ scenes: newScenes });
        return { success: true, data: true };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    },
    /**
     * Delete elements in batch
     *
     * @deprecated will be removed in the future
     * @param sceneId - Scene ID
     * @param elementIds - Element ID array
     * @returns Whether successful
     */
    deleteBatch(sceneId, elementIds) {
      try {
        const state = store2.getState();
        const scene = getScene(state.scenes, sceneId);
        if (!scene) {
          return { success: false, error: `Scene not found: ${sceneId}` };
        }
        if (scene.type !== "slide") {
          return { success: false, error: `Scene is not a slide: ${sceneId}` };
        }
        const content = scene.content;
        const elementIdSet = new Set(elementIds);
        const newScenes = state.scenes.map((s) => {
          if (s.id === sceneId) {
            return {
              ...s,
              content: {
                ...content,
                canvas: {
                  ...content.canvas,
                  elements: content.canvas.elements.filter((el) => !elementIdSet.has(el.id))
                }
              },
              updatedAt: Date.now()
            };
          }
          return s;
        });
        store2.setState({ scenes: newScenes });
        return { success: true, data: true };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    },
    /**
     * Update an element
     *
     * @param sceneId - Scene ID
     * @param elementId - Element ID
     * @param updates - Properties to update
     * @returns Whether successful
     */
    update(sceneId, elementId, updates) {
      try {
        const state = store2.getState();
        const scene = getScene(state.scenes, sceneId);
        if (!scene) {
          return { success: false, error: `Scene not found: ${sceneId}` };
        }
        if (scene.type !== "slide") {
          return { success: false, error: `Scene is not a slide: ${sceneId}` };
        }
        const content = scene.content;
        const newScenes = state.scenes.map((s) => {
          if (s.id === sceneId) {
            return {
              ...s,
              content: {
                ...content,
                canvas: {
                  ...content.canvas,
                  elements: content.canvas.elements.map(
                    (el) => el.id === elementId ? { ...el, ...updates } : el
                  )
                }
              },
              updatedAt: Date.now()
            };
          }
          return s;
        });
        store2.setState({ scenes: newScenes });
        return { success: true, data: true };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    },
    /**
     * Get an element
     *
     * @param sceneId - Scene ID
     * @param elementId - Element ID
     * @returns Element object
     */
    get(sceneId, elementId) {
      try {
        const state = store2.getState();
        const scene = getScene(state.scenes, sceneId);
        if (!scene) {
          return { success: false, error: `Scene not found: ${sceneId}` };
        }
        if (scene.type !== "slide") {
          return { success: false, error: `Scene is not a slide: ${sceneId}` };
        }
        const content = scene.content;
        const element = content.canvas.elements.find((el) => el.id === elementId);
        if (!element) {
          return { success: false, error: `Element not found: ${elementId}` };
        }
        return { success: true, data: element };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    },
    /**
     * Get all elements of a scene
     *
     * @param sceneId - Scene ID
     * @returns Element list
     */
    list(sceneId) {
      try {
        const state = store2.getState();
        const scene = getScene(state.scenes, sceneId);
        if (!scene) {
          return { success: false, error: `Scene not found: ${sceneId}` };
        }
        if (scene.type !== "slide") {
          return { success: false, error: `Scene is not a slide: ${sceneId}` };
        }
        const content = scene.content;
        return { success: true, data: [...content.canvas.elements] };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    },
    /**
     * Move an element (relative movement)
     *
     * @deprecated will be removed in the future
     * @param sceneId - Scene ID
     * @param elementId - Element ID
     * @param deltaX - X-axis movement distance
     * @param deltaY - Y-axis movement distance
     * @returns Whether successful
     */
    move(sceneId, elementId, deltaX, deltaY) {
      try {
        const state = store2.getState();
        const scene = getScene(state.scenes, sceneId);
        if (!scene) {
          return { success: false, error: `Scene not found: ${sceneId}` };
        }
        if (scene.type !== "slide") {
          return { success: false, error: `Scene is not a slide: ${sceneId}` };
        }
        const content = scene.content;
        const newScenes = state.scenes.map((s) => {
          if (s.id === sceneId) {
            return {
              ...s,
              content: {
                ...content,
                canvas: {
                  ...content.canvas,
                  elements: content.canvas.elements.map((el) => {
                    if (el.id === elementId) {
                      return {
                        ...el,
                        left: el.left + deltaX,
                        top: el.top + deltaY
                      };
                    }
                    return el;
                  })
                }
              },
              updatedAt: Date.now()
            };
          }
          return s;
        });
        store2.setState({ scenes: newScenes });
        return { success: true, data: true };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    }
  };
}
var init_stage_api_element = __esm({
  "OpenMAIC/lib/api/stage-api-element.ts"() {
    "use strict";
    init_stage_api_defaults();
  }
});

// OpenMAIC/lib/utils/create-selectors.ts
var createSelectors;
var init_create_selectors = __esm({
  "OpenMAIC/lib/utils/create-selectors.ts"() {
    "use strict";
    createSelectors = (_store) => {
      const store2 = _store;
      store2.use = {};
      for (const k of Object.keys(store2.getState())) {
        store2.use[k] = () => store2((s) => s[k]);
      }
      return store2;
    };
  }
});

// OpenMAIC/lib/prosemirror/utils.ts
import { selectAll } from "prosemirror-commands";
var defaultRichTextAttrs;
var init_utils = __esm({
  "OpenMAIC/lib/prosemirror/utils.ts"() {
    "use strict";
    defaultRichTextAttrs = {
      bold: false,
      em: false,
      underline: false,
      strikethrough: false,
      superscript: false,
      subscript: false,
      code: false,
      color: "#000000",
      backcolor: "",
      fontsize: "16px",
      fontname: "",
      link: "",
      align: "left",
      bulletList: false,
      orderedList: false,
      blockquote: false
    };
  }
});

// OpenMAIC/lib/store/canvas.ts
import { create } from "zustand";
var initialState, useCanvasStoreBase, useCanvasStore;
var init_canvas = __esm({
  "OpenMAIC/lib/store/canvas.ts"() {
    "use strict";
    init_create_selectors();
    init_utils();
    initialState = {
      // Element selection
      activeElementIdList: [],
      handleElementId: "",
      activeGroupElementId: "",
      editingElementId: "",
      hiddenElementIdList: [],
      // Canvas viewport
      canvasScale: 1,
      canvasPercentage: 90,
      viewportSize: 1e3,
      viewportRatio: 0.5625,
      // 16:9
      canvasDragged: false,
      // Display aids
      showRuler: false,
      gridLineSize: 0,
      // Toolbar and panels
      toolbarState: "ai",
      showSelectPanel: false,
      showSearchPanel: false,
      // Element creation
      creatingElement: null,
      creatingCustomShape: false,
      // Editing state
      isScaling: false,
      clipingImageElementId: "",
      richTextAttrs: defaultRichTextAttrs,
      // Format painter
      textFormatPainter: null,
      shapeFormatPainter: null,
      // Video playback
      playingVideoElementId: "",
      // Whiteboard
      whiteboardOpen: false,
      whiteboardClearing: false,
      whiteboardManualVisibilityRevision: 0,
      runtimeWhiteboardProjection: null,
      runtimeWhiteboardProjectionGeneration: 0,
      // Other: false,
      editorAreaFocus: false,
      thumbnailsFocus: false,
      disableHotkeys: false,
      selectedTableCells: [],
      // Teaching features
      spotlightElementId: "",
      spotlightOptions: null,
      spotlightMode: "pixel",
      spotlightPercentageGeometry: null,
      highlightedElementIds: [],
      highlightOptions: null,
      laserElementId: "",
      laserOptions: null,
      zoomTarget: null,
      pickTarget: null
    };
    useCanvasStoreBase = create((set, get) => ({
      ...initialState,
      // ===== Element Selection Actions =====
      setActiveElementIdList: (ids) => {
        set({ activeElementIdList: ids });
        if (ids.length === 1) {
          set({ handleElementId: ids[0] });
        } else if (ids.length === 0) {
          set({ handleElementId: "" });
        }
        if (ids.length > 0) {
          set({ toolbarState: "design" });
        }
      },
      setHandleElementId: (id) => set({ handleElementId: id }),
      setActiveGroupElementId: (id) => set({ activeGroupElementId: id }),
      setEditingElementId: (id) => set({ editingElementId: id }),
      setHiddenElementIdList: (ids) => set({ hiddenElementIdList: ids }),
      clearSelection: () => {
        set({
          activeElementIdList: [],
          handleElementId: "",
          activeGroupElementId: "",
          editingElementId: ""
        });
      },
      // ===== Canvas Viewport Actions =====
      setCanvasScale: (scale) => set({ canvasScale: scale }),
      setCanvasPercentage: (percentage) => set({ canvasPercentage: percentage }),
      setViewportSize: (size) => set({ viewportSize: size }),
      setViewportRatio: (ratio) => set({ viewportRatio: ratio }),
      setCanvasDragged: (dragged) => set({ canvasDragged: dragged }),
      // ===== Display Aids Actions =====
      setRulerState: (show) => set({ showRuler: show }),
      setGridLineSize: (size) => set({ gridLineSize: size }),
      // ===== Toolbar and Panel Actions =====
      setToolbarState: (toolbarState) => set({ toolbarState }),
      setSelectPanelState: (show) => set({ showSelectPanel: show }),
      setSearchPanelState: (show) => set({ showSearchPanel: show }),
      // ===== Element Creation Actions =====
      setCreatingElement: (element) => set({ creatingElement: element }),
      setCreatingCustomShapeState: (creating) => set({ creatingCustomShape: creating }),
      // ===== Editing State Actions =====
      setScalingState: (isScaling) => set({ isScaling }),
      setClipingImageElementId: (id) => set({ clipingImageElementId: id }),
      setRichtextAttrs: (attrs) => set({ richTextAttrs: attrs }),
      // ===== Format Painter Actions =====
      setTextFormatPainter: (painter) => set({ textFormatPainter: painter }),
      setShapeFormatPainter: (painter) => set({ shapeFormatPainter: painter }),
      // ===== Video Playback Actions =====
      playVideo: (elementId) => set({ playingVideoElementId: elementId }),
      pauseVideo: () => set({ playingVideoElementId: "" }),
      // ===== Whiteboard Actions =====
      setWhiteboardOpen: (open) => set({ whiteboardOpen: open }),
      setWhiteboardOpenManually: (open) => set((state) => ({
        whiteboardOpen: open,
        whiteboardManualVisibilityRevision: state.whiteboardManualVisibilityRevision + 1
      })),
      setWhiteboardClearing: (clearing2) => set({ whiteboardClearing: clearing2 }),
      beginRuntimeWhiteboardProjection: (stageId) => {
        const generation = get().runtimeWhiteboardProjectionGeneration + 1;
        set((state) => ({
          runtimeWhiteboardProjectionGeneration: generation,
          ...state.runtimeWhiteboardProjection?.stageId === stageId ? {} : { runtimeWhiteboardProjection: null }
        }));
        return generation;
      },
      setRuntimeWhiteboardProjection: (projection) => set({ runtimeWhiteboardProjection: projection }),
      clearRuntimeWhiteboardProjection: () => set((state) => ({
        runtimeWhiteboardProjection: null,
        runtimeWhiteboardProjectionGeneration: state.runtimeWhiteboardProjectionGeneration + 1
      })),
      // ===== Other Actions =====
      setThumbnailsFocus: (focus) => set({ thumbnailsFocus: focus }),
      setEditorAreaFocus: (focus) => set({ editorAreaFocus: focus }),
      setDisableHotkeysState: (disable) => set({ disableHotkeys: disable }),
      setSelectedTableCells: (cells) => set({ selectedTableCells: cells }),
      // ===== Teaching Feature Actions =====
      setSpotlight: (elementId, options4 = {}) => {
        set({
          spotlightElementId: elementId,
          spotlightMode: "pixel",
          spotlightOptions: {
            radius: 200,
            dimness: 0.7,
            transition: 300,
            ...options4
          },
          spotlightPercentageGeometry: null
        });
      },
      setSpotlightPercentage: (elementId, geometry, options4 = {}) => {
        set({
          spotlightElementId: elementId,
          spotlightMode: "percentage",
          spotlightPercentageGeometry: geometry,
          spotlightOptions: {
            dimness: 0.7,
            transition: 300,
            ...options4
          }
        });
      },
      clearSpotlight: () => {
        set({
          spotlightElementId: "",
          spotlightOptions: null,
          spotlightMode: "pixel",
          spotlightPercentageGeometry: null
        });
      },
      setHighlight: (elementIds, options4 = {}) => {
        set({
          highlightedElementIds: elementIds,
          highlightOptions: {
            color: "#ff6b6b",
            opacity: 0.3,
            borderWidth: 3,
            animated: true,
            ...options4
          }
        });
      },
      clearHighlight: () => {
        set({
          highlightedElementIds: [],
          highlightOptions: null
        });
      },
      setLaser: (elementId, options4 = {}) => {
        set({
          laserElementId: elementId,
          laserOptions: {
            color: "#ff0000",
            duration: 3e3,
            ...options4
          }
        });
      },
      clearLaser: () => {
        set({
          laserElementId: "",
          laserOptions: null
        });
      },
      setPickTarget: (target) => set({ pickTarget: target }),
      setZoom: (elementId, scale) => {
        set({
          zoomTarget: { elementId, scale }
        });
      },
      clearZoom: () => {
        set({
          zoomTarget: null
        });
      },
      clearAllEffects: () => {
        set({
          spotlightElementId: "",
          spotlightOptions: null,
          spotlightMode: "pixel",
          spotlightPercentageGeometry: null,
          highlightedElementIds: [],
          highlightOptions: null,
          laserElementId: "",
          laserOptions: null,
          zoomTarget: null,
          pickTarget: null
          // Note: playingVideoElementId intentionally NOT cleared here.
          // Video playback has its own lifecycle (playVideo/pauseVideo/onEnded)
          // and must not be interrupted by visual effect auto-clear timers.
        });
      },
      // ===== Batch Operations =====
      resetCanvasState: () => {
        const runtimeWhiteboardProjection = get().runtimeWhiteboardProjection;
        const runtimeWhiteboardProjectionGeneration = get().runtimeWhiteboardProjectionGeneration;
        const whiteboardManualVisibilityRevision = get().whiteboardManualVisibilityRevision;
        set({
          ...initialState,
          // Preserve viewport settings
          viewportSize: get().viewportSize,
          viewportRatio: get().viewportRatio,
          runtimeWhiteboardProjection,
          runtimeWhiteboardProjectionGeneration,
          whiteboardManualVisibilityRevision
        });
      }
    }));
    useCanvasStore = createSelectors(useCanvasStoreBase);
  }
});

// OpenMAIC/lib/api/stage-api-canvas.ts
function createCanvasAPI(store2) {
  return {
    /**
     * Set background
     *
     * @param sceneId - Scene ID
     * @param background - Background settings
     * @returns Whether successful
     */
    setBackground(sceneId, background) {
      try {
        const state = store2.getState();
        const scene = getScene(state.scenes, sceneId);
        if (!scene || scene.type !== "slide") {
          return { success: false, error: "Invalid scene" };
        }
        const content = scene.content;
        const newScenes = state.scenes.map((s) => {
          if (s.id === sceneId) {
            return {
              ...s,
              content: {
                ...content,
                canvas: {
                  ...content.canvas,
                  background
                }
              },
              updatedAt: Date.now()
            };
          }
          return s;
        });
        store2.setState({ scenes: newScenes });
        return { success: true, data: true };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    },
    /**
     * Set theme
     *
     * @param sceneId - Scene ID
     * @param theme - Theme settings
     * @returns Whether successful
     */
    setTheme(sceneId, theme) {
      try {
        const state = store2.getState();
        const scene = getScene(state.scenes, sceneId);
        if (!scene || scene.type !== "slide") {
          return { success: false, error: "Invalid scene" };
        }
        const content = scene.content;
        const newScenes = state.scenes.map((s) => {
          if (s.id === sceneId) {
            return {
              ...s,
              content: {
                ...content,
                canvas: {
                  ...content.canvas,
                  theme: {
                    ...content.canvas.theme,
                    ...theme
                  }
                }
              },
              updatedAt: Date.now()
            };
          }
          return s;
        });
        store2.setState({ scenes: newScenes });
        return { success: true, data: true };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    },
    /**
     * Highlight an element (teaching feature)
     *
     * Emphasize an element by adding a highlight border or shadow
     *
     * @param sceneId - Scene ID
     * @param elementId - Element ID
     * @param options - Highlight options
     * @returns Whether successful
     */
    highlight(sceneId, elementId, options4 = {}) {
      const { duration, color = "#ff6b6b", style = "outline" } = options4;
      try {
        const canvasStore = useCanvasStore.getState();
        canvasStore.setHighlight([elementId], {
          color,
          opacity: style === "fill" ? 0.3 : 0.5,
          borderWidth: 3,
          animated: true
        });
        if (duration) {
          setTimeout(() => {
            canvasStore.clearHighlight();
          }, duration);
        }
        return { success: true, data: true };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    },
    /**
     * Spotlight effect (teaching feature)
     *
     * Highlight a specific element while dimming everything else
     * Note: this requires a mask layer in the frontend rendering layer
     *
     * @param sceneId - Scene ID
     * @param elementId - Element ID
     * @param options - Spotlight options
     * @returns Whether successful
     */
    spotlight(sceneId, elementId, options4 = {}) {
      try {
        const canvasStore = useCanvasStore.getState();
        canvasStore.setSpotlight(elementId, options4);
        if (options4.duration) {
          setTimeout(() => {
            canvasStore.clearSpotlight();
          }, options4.duration);
        }
        return { success: true, data: true };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    },
    /**
     * Clear all highlight and spotlight effects
     *
     * @param sceneId - Scene ID
     * @returns Whether successful
     */
    clearHighlights(_sceneId) {
      try {
        const canvasStore = useCanvasStore.getState();
        canvasStore.clearHighlight();
        canvasStore.clearSpotlight();
        return { success: true, data: true };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    },
    /**
     * Clear spotlight effect
     *
     * @returns Whether successful
     */
    clearSpotlight(_sceneId) {
      try {
        const canvasStore = useCanvasStore.getState();
        canvasStore.clearSpotlight();
        return { success: true, data: true };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    },
    /**
     * Set percentage-mode spotlight
     *
     * @param sceneId - Scene ID
     * @param elementId - Element ID
     * @param geometry - Percentage geometry info
     * @param options - Spotlight options
     * @returns Whether successful
     */
    setSpotlightPercentage(sceneId, elementId, geometry, options4 = {}) {
      try {
        const canvasStore = useCanvasStore.getState();
        canvasStore.setSpotlightPercentage(elementId, geometry, options4);
        if (options4.duration) {
          setTimeout(() => {
            canvasStore.clearSpotlight();
          }, options4.duration);
        }
        return { success: true, data: true };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    },
    /**
     * Set laser pointer effect
     *
     * @param sceneId - Scene ID
     * @param elementId - Element ID
     * @param geometry - Percentage geometry info
     * @param options - Laser pointer options
     * @returns Whether successful
     */
    setLaser(sceneId, elementId, geometry, options4 = {}) {
      try {
        const canvasStore = useCanvasStore.getState();
        canvasStore.setLaser(elementId, options4);
        if (options4.duration) {
          setTimeout(() => {
            canvasStore.clearLaser();
          }, options4.duration);
        }
        return { success: true, data: true };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    },
    /**
     * Clear laser pointer effect
     *
     * @param sceneId - Scene ID
     * @returns Whether successful
     */
    clearLaser(_sceneId) {
      try {
        const canvasStore = useCanvasStore.getState();
        canvasStore.clearLaser();
        return { success: true, data: true };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    },
    /**
     * Set zoom effect
     *
     * @param sceneId - Scene ID
     * @param elementId - Element ID
     * @param geometry - Percentage geometry info
     * @param scale - Zoom scale
     * @returns Whether successful
     */
    setZoom(sceneId, elementId, geometry, scale) {
      try {
        const canvasStore = useCanvasStore.getState();
        canvasStore.setZoom(elementId, scale);
        return { success: true, data: true };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    },
    /**
     * Clear zoom effect
     *
     * @param sceneId - Scene ID
     * @returns Whether successful
     */
    clearZoom(_sceneId) {
      try {
        const canvasStore = useCanvasStore.getState();
        canvasStore.clearZoom();
        return { success: true, data: true };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    },
    /**
     * Clear all visual effects (spotlight, laser, zoom, etc.)
     *
     * @param sceneId - Scene ID
     * @returns Whether successful
     */
    clearAllEffects(_sceneId) {
      try {
        const canvasStore = useCanvasStore.getState();
        canvasStore.clearAllEffects();
        return { success: true, data: true };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    },
    /**
     * Highlight multiple elements in batch
     *
     * @param sceneId - Scene ID
     * @param elementIds - Element ID list
     * @param options - Highlight options
     * @returns Whether successful
     */
    highlightMultiple(sceneId, elementIds, options4 = {}) {
      const { duration, color = "#ff6b6b" } = options4;
      try {
        const canvasStore = useCanvasStore.getState();
        canvasStore.setHighlight(elementIds, {
          color,
          opacity: 0.3,
          borderWidth: 3,
          animated: true
        });
        if (duration) {
          setTimeout(() => {
            canvasStore.clearHighlight();
          }, duration);
        }
        return { success: true, data: true };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    }
  };
}
var init_stage_api_canvas = __esm({
  "OpenMAIC/lib/api/stage-api-canvas.ts"() {
    "use strict";
    init_canvas();
    init_stage_api_defaults();
  }
});

// OpenMAIC/lib/api/stage-api-navigation.ts
function createNavigationAPI(store2) {
  return {
    /**
     * Navigate to a specific scene
     *
     * @param sceneId - Scene ID
     * @returns Whether successful
     */
    goTo(sceneId) {
      try {
        const state = store2.getState();
        if (!validateSceneId(state.scenes, sceneId)) {
          return { success: false, error: `Scene not found: ${sceneId}` };
        }
        store2.setState({ currentSceneId: sceneId });
        return { success: true, data: true };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    },
    /**
     * Next scene
     *
     * @returns Whether successful
     */
    next() {
      try {
        const state = store2.getState();
        if (!state.currentSceneId || state.scenes.length === 0) {
          return { success: false, error: "No current scene" };
        }
        const currentIndex = state.scenes.findIndex((s) => s.id === state.currentSceneId);
        if (currentIndex === -1 || currentIndex === state.scenes.length - 1) {
          return { success: false, error: "Already at last scene" };
        }
        const nextScene = state.scenes[currentIndex + 1];
        store2.setState({ currentSceneId: nextScene.id });
        return { success: true, data: true };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    },
    /**
     * Previous scene
     *
     * @returns Whether successful
     */
    previous() {
      try {
        const state = store2.getState();
        if (!state.currentSceneId || state.scenes.length === 0) {
          return { success: false, error: "No current scene" };
        }
        const currentIndex = state.scenes.findIndex((s) => s.id === state.currentSceneId);
        if (currentIndex === -1 || currentIndex === 0) {
          return { success: false, error: "Already at first scene" };
        }
        const prevScene = state.scenes[currentIndex - 1];
        store2.setState({ currentSceneId: prevScene.id });
        return { success: true, data: true };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    },
    /**
     * Get the current scene
     *
     * @returns Current scene
     */
    current() {
      try {
        const state = store2.getState();
        if (!state.currentSceneId) {
          return { success: false, error: "No current scene" };
        }
        const scene = getScene(state.scenes, state.currentSceneId);
        if (!scene) {
          return { success: false, error: "Current scene not found" };
        }
        return { success: true, data: scene };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    }
  };
}
var init_stage_api_navigation = __esm({
  "OpenMAIC/lib/api/stage-api-navigation.ts"() {
    "use strict";
    init_stage_api_defaults();
  }
});

// OpenMAIC/lib/api/stage-api-whiteboard.ts
function createWhiteboardAPI(store2) {
  const whiteboardAPI = {
    /**
     * Create a whiteboard
     *
     * @returns Whether successful
     */
    create() {
      try {
        const state = store2.getState();
        const whiteboard = {
          id: generateId("whiteboard"),
          viewportSize: 1e3,
          // viewportRatio is height/width, so a 16:9 landscape sheet is 9/16.
          viewportRatio: 9 / 16,
          elements: [],
          background: {
            type: "solid",
            color: "#ffffff"
          },
          animations: []
        };
        const whiteboardList = state.stage?.whiteboard ? [...state.stage.whiteboard, whiteboard] : [whiteboard];
        store2.setState({
          stage: { ...state.stage, whiteboard: whiteboardList }
        });
        return { success: true, data: whiteboard };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    },
    /**
     * Get a whiteboard
     *
     * @returns The most recently created whiteboard object
     */
    get() {
      try {
        const state = store2.getState();
        if (!state.stage?.whiteboard || state.stage.whiteboard.length === 0) {
          return whiteboardAPI.create();
        }
        return { success: true, data: state.stage.whiteboard.at(-1) };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    },
    /**
     * Update a whiteboard
     *
     * @param updates - Fields to update
     * @param whiteboardId - Whiteboard ID
     * @returns Whether successful
     */
    update(updates, whiteboardId) {
      try {
        const state = store2.getState();
        const whiteboard = state.stage?.whiteboard?.find((wb) => wb.id === whiteboardId);
        if (!whiteboard) return { success: false, error: "Whiteboard not found" };
        const newWhiteboard = { ...whiteboard, ...updates };
        const whiteboardList = state.stage.whiteboard.map(
          (wb) => wb.id === whiteboardId ? newWhiteboard : wb
        );
        store2.setState({
          stage: { ...state.stage, whiteboard: whiteboardList }
        });
        return { success: true, data: true };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    },
    /**
     * Delete a whiteboard
     *
     * @param whiteboardId - Whiteboard ID
     * @returns Whether successful
     */
    delete(whiteboardId) {
      try {
        const state = store2.getState();
        const whiteboardList = state.stage.whiteboard.filter((wb) => wb.id !== whiteboardId);
        store2.setState({
          stage: { ...state.stage, whiteboard: whiteboardList }
        });
        return { success: true, data: true };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    },
    /**
     * Get all whiteboards
     *
     * @returns List of all whiteboards
     */
    list() {
      try {
        const state = store2.getState();
        return { success: true, data: state.stage.whiteboard };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    },
    /**
     * Get a whiteboard element
     *
     * @param elementId - Element ID
     * @param whiteboardId - Whiteboard ID
     * @returns Element object
     */
    getElement(elementId, whiteboardId) {
      try {
        const state = store2.getState();
        const whiteboard = state.stage.whiteboard.find((wb) => wb.id === whiteboardId);
        if (!whiteboard) return { success: false, error: "Whiteboard not found" };
        return {
          success: true,
          data: whiteboard.elements.find((el) => el.id === elementId)
        };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    },
    /**
     * Add a whiteboard element
     *
     * @param element - Element object
     * @param whiteboardId - Whiteboard ID
     * @returns Whether successful
     */
    addElement(element, whiteboardId) {
      try {
        const state = store2.getState();
        const whiteboard = state.stage.whiteboard.find((wb) => wb.id === whiteboardId);
        if (!whiteboard) return { success: false, error: "Whiteboard not found" };
        const newElement = {
          ...element,
          id: element.id || generateId(element.type)
        };
        const newWhiteboard = {
          ...whiteboard,
          elements: [...whiteboard.elements, newElement]
        };
        const whiteboardList = state.stage.whiteboard.map(
          (wb) => wb.id === whiteboardId ? newWhiteboard : wb
        );
        store2.setState({
          stage: { ...state.stage, whiteboard: whiteboardList }
        });
        return { success: true, data: true };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    },
    /**
     * Delete a whiteboard element
     *
     * @param elementId - Element ID
     * @param whiteboardId - Whiteboard ID
     * @returns Whether successful
     */
    deleteElement(elementId, whiteboardId) {
      try {
        const state = store2.getState();
        const whiteboard = state.stage.whiteboard.find((wb) => wb.id === whiteboardId);
        if (!whiteboard) return { success: false, error: "Whiteboard not found" };
        const newWhiteboard = {
          ...whiteboard,
          elements: whiteboard.elements.filter((el) => el.id !== elementId)
        };
        const whiteboardList = state.stage.whiteboard.map(
          (wb) => wb.id === whiteboardId ? newWhiteboard : wb
        );
        store2.setState({
          stage: { ...state.stage, whiteboard: whiteboardList }
        });
        return { success: true, data: true };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    },
    /**
     * Update a whiteboard element
     *
     * @param element - Element object
     * @param whiteboardId - Whiteboard ID
     * @returns Whether successful
     */
    updateElement(element, whiteboardId) {
      try {
        const state = store2.getState();
        const whiteboard = state.stage.whiteboard.find((wb) => wb.id === whiteboardId);
        if (!whiteboard) return { success: false, error: "Whiteboard not found" };
        const newWhiteboard = {
          ...whiteboard,
          elements: whiteboard.elements.map((el) => el.id === element.id ? element : el)
        };
        const whiteboardList = state.stage.whiteboard.map(
          (wb) => wb.id === whiteboardId ? newWhiteboard : wb
        );
        store2.setState({
          stage: { ...state.stage, whiteboard: whiteboardList }
        });
        return { success: true, data: true };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    },
    /**
     * Get whiteboard element list
     *
     * @param whiteboardId - Whiteboard ID
     * @returns Element list
     */
    listElements(whiteboardId) {
      try {
        const state = store2.getState();
        const whiteboard = state.stage.whiteboard.find((wb) => wb.id === whiteboardId);
        if (!whiteboard) return { success: false, error: "Whiteboard not found" };
        return { success: true, data: whiteboard.elements };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    }
  };
  return whiteboardAPI;
}
var init_stage_api_whiteboard = __esm({
  "OpenMAIC/lib/api/stage-api-whiteboard.ts"() {
    "use strict";
    init_stage_api_defaults();
  }
});

// OpenMAIC/lib/api/stage-api-mode.ts
function createModeAPI(store2) {
  return {
    /**
     * Set mode
     *
     * @param newMode - New mode
     */
    set(newMode) {
      try {
        store2.setState({ mode: newMode });
        return { success: true, data: true };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    },
    /**
     * Get current mode
     *
     * @returns Current mode
     */
    get() {
      try {
        const state = store2.getState();
        return { success: true, data: state.mode };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    }
  };
}
function createStageMetaAPI(store2) {
  return {
    /**
     * Get Stage info
     *
     * @returns Stage object
     */
    get() {
      try {
        const state = store2.getState();
        if (!state.stage) {
          return { success: false, error: "No stage" };
        }
        return { success: true, data: state.stage };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    },
    /**
     * Update Stage info
     *
     * @param updates - Fields to update
     * @returns Whether successful
     */
    update(updates) {
      try {
        const state = store2.getState();
        if (!state.stage) {
          return { success: false, error: "No stage" };
        }
        const newStage = {
          ...state.stage,
          ...updates,
          updatedAt: Date.now()
        };
        store2.setState({ stage: newStage });
        return { success: true, data: true };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    }
  };
}
var init_stage_api_mode = __esm({
  "OpenMAIC/lib/api/stage-api-mode.ts"() {
    "use strict";
  }
});

// OpenMAIC/lib/audio/types.ts
function isCustomTTSProvider(id) {
  return id.startsWith("custom-tts-");
}
function isCustomASRProvider(id) {
  return id.startsWith("custom-asr-");
}
var init_types = __esm({
  "OpenMAIC/lib/audio/types.ts"() {
    "use strict";
  }
});

// OpenMAIC/lib/audio/voice-design.ts
function sanitizeVoiceDesignPart(value) {
  return (value || "").replace(/[\p{C}]+/gu, " ").replace(/[()（）]/gu, " ").replace(/\s+/gu, " ").trim().slice(0, VOICE_DESIGN_PROMPT_MAX_CHARS).trim();
}
function buildVoiceDesignPrompt(design) {
  return [design.identity, design.texture, design.delivery].map((part) => sanitizeVoiceDesignPart(part)).filter(Boolean).join(", ");
}
async function getDeterministicVoiceId(design, opts = {}) {
  const seed = [
    opts.providerId || "",
    design.identity,
    design.texture,
    design.delivery,
    opts.model || ""
  ].join("|");
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(seed));
  const hex = Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${AUTO_VOICE_ID_PREFIX}${hex.slice(0, 16)}`;
}
var VOICE_DESIGN_PROMPT_MAX_CHARS, AUTO_VOICE_ID_PREFIX;
var init_voice_design = __esm({
  "OpenMAIC/lib/audio/voice-design.ts"() {
    "use strict";
    VOICE_DESIGN_PROMPT_MAX_CHARS = 200;
    AUTO_VOICE_ID_PREFIX = "auto-";
  }
});

// OpenMAIC/lib/audio/voxcpm.ts
function normalizeVoxCPMBackend(value) {
  return VOXCPM_BACKENDS.some((backend) => backend.id === value) ? value : DEFAULT_VOXCPM_BACKEND;
}
function getVoxCPMProfileIdFromVoiceId(voiceId) {
  if (!voiceId.startsWith(VOXCPM_PROFILE_VOICE_PREFIX)) return null;
  return voiceId.slice(VOXCPM_PROFILE_VOICE_PREFIX.length);
}
function sanitizeAutoVoicePromptPart(value) {
  return (value || "").replace(/[\p{C}]+/gu, " ").replace(/\s+/gu, " ").trim().slice(0, VOXCPM_AUTO_VOICE_PROMPT_MAX_CHARS).trim();
}
function voxCPMBackendSupportsVoiceRegistration(backend) {
  return backend === "vllm-omni";
}
function buildAutoVoxCPMVoicePrompt(context2 = {}) {
  if (context2.voiceDesign) {
    const designPrompt = sanitizeAutoVoicePromptPart(buildVoiceDesignPrompt(context2.voiceDesign));
    if (designPrompt) return designPrompt;
  }
  const persona = sanitizeAutoVoicePromptPart(context2.persona);
  if (persona) return persona;
  const fallbackParts = [context2.role, context2.agentName].map(sanitizeAutoVoicePromptPart).filter(Boolean);
  const fallbackPrompt = sanitizeAutoVoicePromptPart(fallbackParts.join(" "));
  return fallbackPrompt || "natural classroom voice";
}
var VOXCPM_TTS_PROVIDER_ID, VOXCPM_MODEL_ID, VOXCPM_VLLM_MODEL_ID, VOXCPM_AUTO_VOICE_ID, VOXCPM_PROFILE_VOICE_PREFIX, VOXCPM_AUTO_VOICE_PROMPT_MAX_CHARS, VOXCPM_BACKENDS, DEFAULT_VOXCPM_BACKEND, VOXCPM_AUTO_VOICE;
var init_voxcpm = __esm({
  "OpenMAIC/lib/audio/voxcpm.ts"() {
    "use strict";
    init_voice_design();
    VOXCPM_TTS_PROVIDER_ID = "voxcpm-tts";
    VOXCPM_MODEL_ID = "VoxCPM2";
    VOXCPM_VLLM_MODEL_ID = "voxcpm2";
    VOXCPM_AUTO_VOICE_ID = "voxcpm:auto";
    VOXCPM_PROFILE_VOICE_PREFIX = "voxcpm:profile:";
    VOXCPM_AUTO_VOICE_PROMPT_MAX_CHARS = 200;
    VOXCPM_BACKENDS = [
      {
        id: "vllm-omni",
        name: "vLLM-Omni",
        endpoint: "/v1/audio/speech",
        description: "OpenAI-compatible speech endpoint"
      },
      {
        id: "python-api",
        name: "Python API",
        endpoint: "/tts/upload",
        description: "FastAPI deployment backed by the VoxCPM Python runtime"
      },
      {
        id: "nano-vllm",
        name: "Nano-vLLM",
        endpoint: "/generate",
        description: "Nano-vLLM VoxCPM FastAPI deployment"
      }
    ];
    DEFAULT_VOXCPM_BACKEND = "vllm-omni";
    VOXCPM_AUTO_VOICE = {
      id: VOXCPM_AUTO_VOICE_ID,
      name: "Auto Voice",
      language: "auto",
      gender: "neutral",
      description: "Generate a voice prompt from agent metadata"
    };
  }
});

// OpenMAIC/lib/audio/constants.ts
function isQwenVoiceCloneModel(modelId, configuredModelId) {
  return !!modelId && (/-tts-vc(?:-|$)/iu.test(modelId) || !!configuredModelId && modelId === configuredModelId);
}
function isQwenCatalogVoice(voiceId) {
  return !!voiceId && TTS_PROVIDERS["qwen-tts"].voices.some((voice) => voice.id === voiceId);
}
function isQwenCloneVoice(voiceId) {
  return !!voiceId && !isQwenCatalogVoice(voiceId);
}
function resolveTTSModelForVoice(providerId, voiceId, requestedModelId) {
  if (providerId !== "qwen-tts") return requestedModelId;
  if (isQwenCloneVoice(voiceId)) return QWEN_TTS_VOICE_CLONE_MODEL;
  return requestedModelId && !isQwenVoiceCloneModel(requestedModelId) ? requestedModelId : TTS_PROVIDERS["qwen-tts"].defaultModelId;
}
function isKnownTTSProviderId(id) {
  return Object.hasOwn(TTS_PROVIDERS, id) || isCustomTTSProvider(id);
}
var CUSTOM_ASR_DEFAULT_LANGUAGES, MINIMAX_TTS_MODELS, DEFAULT_QWEN_TTS_VOICE_CLONE_MODEL, QWEN_TTS_VOICE_CLONE_MODEL, TTS_PROVIDERS, ASR_PROVIDERS, DEFAULT_TTS_VOICES, DEFAULT_TTS_MODELS;
var init_constants = __esm({
  "OpenMAIC/lib/audio/constants.ts"() {
    "use strict";
    init_types();
    init_voxcpm();
    CUSTOM_ASR_DEFAULT_LANGUAGES = [
      "auto",
      "zh",
      "en",
      "ja",
      "ko",
      "es",
      "fr",
      "de",
      "ru",
      "ar",
      "pt",
      "it",
      "hi"
    ];
    MINIMAX_TTS_MODELS = [
      { id: "speech-2.8-hd", name: "Speech 2.8 HD" },
      { id: "speech-2.8-turbo", name: "Speech 2.8 Turbo" },
      { id: "speech-2.6-hd", name: "Speech 2.6 HD" },
      { id: "speech-2.6-turbo", name: "Speech 2.6 Turbo" },
      { id: "speech-02-hd", name: "Speech 02 HD" },
      { id: "speech-02-turbo", name: "Speech 02 Turbo" }
    ];
    DEFAULT_QWEN_TTS_VOICE_CLONE_MODEL = "qwen3-tts-vc-2026-01-22";
    QWEN_TTS_VOICE_CLONE_MODEL = DEFAULT_QWEN_TTS_VOICE_CLONE_MODEL;
    TTS_PROVIDERS = {
      "openai-tts": {
        id: "openai-tts",
        name: "OpenAI TTS",
        requiresApiKey: true,
        defaultBaseUrl: "https://api.openai.com/v1",
        icon: "/logos/openai.svg",
        models: [
          { id: "gpt-4o-mini-tts", name: "GPT-4o Mini TTS" },
          { id: "tts-1", name: "TTS-1" },
          { id: "tts-1-hd", name: "TTS-1 HD" }
        ],
        defaultModelId: "gpt-4o-mini-tts",
        voices: [
          // Recommended voices (best quality)
          {
            id: "marin",
            name: "Marin",
            language: "en",
            gender: "neutral",
            description: "voiceMarin",
            compatibleModels: ["gpt-4o-mini-tts"]
          },
          {
            id: "cedar",
            name: "Cedar",
            language: "en",
            gender: "neutral",
            description: "voiceCedar",
            compatibleModels: ["gpt-4o-mini-tts"]
          },
          // Standard voices (alphabetical)
          {
            id: "alloy",
            name: "Alloy",
            language: "en",
            gender: "neutral",
            description: "voiceAlloy"
          },
          {
            id: "ash",
            name: "Ash",
            language: "en",
            gender: "neutral",
            description: "voiceAsh"
          },
          {
            id: "ballad",
            name: "Ballad",
            language: "en",
            gender: "neutral",
            description: "voiceBallad"
          },
          {
            id: "coral",
            name: "Coral",
            language: "en",
            gender: "neutral",
            description: "voiceCoral"
          },
          {
            id: "echo",
            name: "Echo",
            language: "en",
            gender: "male",
            description: "voiceEcho"
          },
          {
            id: "fable",
            name: "Fable",
            language: "en",
            gender: "neutral",
            description: "voiceFable"
          },
          {
            id: "nova",
            name: "Nova",
            language: "en",
            gender: "female",
            description: "voiceNova"
          },
          {
            id: "onyx",
            name: "Onyx",
            language: "en",
            gender: "male",
            description: "voiceOnyx"
          },
          {
            id: "sage",
            name: "Sage",
            language: "en",
            gender: "neutral",
            description: "voiceSage"
          },
          {
            id: "shimmer",
            name: "Shimmer",
            language: "en",
            gender: "female",
            description: "voiceShimmer"
          },
          {
            id: "verse",
            name: "Verse",
            language: "en",
            gender: "neutral",
            description: "voiceVerse"
          }
        ],
        supportedFormats: ["mp3", "opus", "aac", "flac"],
        speedRange: { min: 0.25, max: 4, default: 1 }
      },
      "azure-tts": {
        id: "azure-tts",
        name: "Azure TTS",
        requiresApiKey: true,
        defaultBaseUrl: "https://{region}.tts.speech.microsoft.com",
        icon: "/logos/azure.svg",
        models: [],
        defaultModelId: "",
        voices: [
          {
            id: "zh-CN-XiaoxiaoNeural",
            name: "\u6653\u6653 (\u5973)",
            language: "zh-CN",
            gender: "female"
          },
          {
            id: "zh-CN-YunxiNeural",
            name: "\u4E91\u5E0C (\u7537)",
            language: "zh-CN",
            gender: "male"
          },
          {
            id: "zh-CN-XiaoyiNeural",
            name: "\u6653\u4F0A (\u5973)",
            language: "zh-CN",
            gender: "female"
          },
          {
            id: "zh-CN-YunjianNeural",
            name: "\u4E91\u5065 (\u7537)",
            language: "zh-CN",
            gender: "male"
          },
          {
            id: "en-US-JennyNeural",
            name: "Jenny",
            language: "en-US",
            gender: "female"
          },
          { id: "en-US-GuyNeural", name: "Guy", language: "en-US", gender: "male" }
        ],
        supportedFormats: ["mp3", "wav", "ogg"],
        speedRange: { min: 0.5, max: 2, default: 1 }
      },
      "glm-tts": {
        id: "glm-tts",
        name: "GLM TTS",
        requiresApiKey: true,
        defaultBaseUrl: "https://open.bigmodel.cn/api/paas/v4",
        icon: "/logos/glm.svg",
        models: [{ id: "glm-tts", name: "GLM TTS" }],
        defaultModelId: "glm-tts",
        voices: [
          {
            id: "tongtong",
            name: "\u5F64\u5F64",
            language: "zh",
            gender: "neutral",
            description: "glmVoiceTongtong"
          },
          {
            id: "chuichui",
            name: "\u9524\u9524",
            language: "zh",
            gender: "neutral",
            description: "glmVoiceChuichui"
          },
          {
            id: "xiaochen",
            name: "\u5C0F\u9648",
            language: "zh",
            gender: "neutral",
            description: "glmVoiceXiaochen"
          },
          {
            id: "jam",
            name: "Jam",
            language: "zh",
            gender: "neutral",
            description: "glmVoiceJam"
          },
          {
            id: "kazi",
            name: "Kazi",
            language: "zh",
            gender: "neutral",
            description: "glmVoiceKazi"
          },
          {
            id: "douji",
            name: "\u8C46\u51E0",
            language: "zh",
            gender: "neutral",
            description: "glmVoiceDouji"
          },
          {
            id: "luodo",
            name: "\u7F57\u591A",
            language: "zh",
            gender: "neutral",
            description: "glmVoiceLuodo"
          }
        ],
        supportedFormats: ["mp3", "wav"],
        speedRange: { min: 0.5, max: 2, default: 1 }
      },
      "qwen-tts": {
        id: "qwen-tts",
        name: "Qwen TTS (\u963F\u91CC\u4E91\u767E\u70BC)",
        requiresApiKey: true,
        defaultBaseUrl: "https://dashscope.aliyuncs.com/api/v1",
        icon: "/logos/bailian.svg",
        // Paid showcase presets: never offered to the agent even when this provider
        // is configured (explicit mechanism, not "no env so absent"). A clone
        // registered this session through the registration adapter stays bindable;
        // only the preset list is excluded from the agent catalog.
        excludeFromAgentVoiceCatalog: true,
        models: [
          { id: "qwen3-tts-flash", name: "Qwen3 TTS Flash" },
          { id: "qwen3-tts-instruct-flash", name: "Qwen3 TTS Instruct Flash" },
          { id: "qwen-tts", name: "Qwen TTS" },
          { id: QWEN_TTS_VOICE_CLONE_MODEL, name: "Qwen3 TTS Voice Clone" }
        ],
        defaultModelId: "qwen3-tts-flash",
        voices: [
          // Standard Mandarin voices
          {
            id: "Cherry",
            name: "\u828A\u60A6 (Cherry)",
            language: "zh-CN",
            gender: "female",
            description: "qwenVoiceCherry"
          },
          {
            id: "Serena",
            name: "\u82CF\u7476 (Serena)",
            language: "zh-CN",
            gender: "female",
            description: "qwenVoiceSerena"
          },
          {
            id: "Ethan",
            name: "\u6668\u7166 (Ethan)",
            language: "zh-CN",
            gender: "male",
            description: "qwenVoiceEthan"
          },
          {
            id: "Chelsie",
            name: "\u5343\u96EA (Chelsie)",
            language: "zh-CN",
            gender: "female",
            description: "qwenVoiceChelsie"
          },
          {
            id: "Momo",
            name: "\u8309\u5154 (Momo)",
            language: "zh-CN",
            gender: "female",
            description: "qwenVoiceMomo"
          },
          {
            id: "Vivian",
            name: "\u5341\u4E09 (Vivian)",
            language: "zh-CN",
            gender: "female",
            description: "qwenVoiceVivian"
          },
          {
            id: "Moon",
            name: "\u6708\u767D (Moon)",
            language: "zh-CN",
            gender: "male",
            description: "qwenVoiceMoon"
          },
          {
            id: "Maia",
            name: "\u56DB\u6708 (Maia)",
            language: "zh-CN",
            gender: "female",
            description: "qwenVoiceMaia"
          },
          {
            id: "Kai",
            name: "\u51EF (Kai)",
            language: "zh-CN",
            gender: "male",
            description: "qwenVoiceKai"
          },
          {
            id: "Nofish",
            name: "\u4E0D\u5403\u9C7C (Nofish)",
            language: "zh-CN",
            gender: "male",
            description: "qwenVoiceNofish"
          },
          {
            id: "Bella",
            name: "\u840C\u5B9D (Bella)",
            language: "zh-CN",
            gender: "female",
            description: "qwenVoiceBella"
          },
          {
            id: "Jennifer",
            name: "\u8A79\u59AE\u5F17 (Jennifer)",
            language: "zh-CN",
            gender: "female",
            description: "qwenVoiceJennifer"
          },
          {
            id: "Ryan",
            name: "\u751C\u8336 (Ryan)",
            language: "zh-CN",
            gender: "male",
            description: "qwenVoiceRyan"
          },
          {
            id: "Katerina",
            name: "\u5361\u6377\u7433\u5A1C (Katerina)",
            language: "zh-CN",
            gender: "female",
            description: "qwenVoiceKaterina"
          },
          {
            id: "Aiden",
            name: "\u827E\u767B (Aiden)",
            language: "zh-CN",
            gender: "male",
            description: "qwenVoiceAiden"
          },
          {
            id: "Eldric Sage",
            name: "\u6CA7\u660E\u5B50 (Eldric Sage)",
            language: "zh-CN",
            gender: "male",
            description: "qwenVoiceEldricSage"
          },
          {
            id: "Mia",
            name: "\u4E56\u5C0F\u59B9 (Mia)",
            language: "zh-CN",
            gender: "female",
            description: "qwenVoiceMia"
          },
          {
            id: "Mochi",
            name: "\u6C99\u5C0F\u5F25 (Mochi)",
            language: "zh-CN",
            gender: "male",
            description: "qwenVoiceMochi"
          },
          {
            id: "Bellona",
            name: "\u71D5\u94EE\u83BA (Bellona)",
            language: "zh-CN",
            gender: "female",
            description: "qwenVoiceBellona"
          },
          {
            id: "Vincent",
            name: "\u7530\u53D4 (Vincent)",
            language: "zh-CN",
            gender: "male",
            description: "qwenVoiceVincent"
          },
          {
            id: "Bunny",
            name: "\u840C\u5C0F\u59EC (Bunny)",
            language: "zh-CN",
            gender: "female",
            description: "qwenVoiceBunny"
          },
          {
            id: "Neil",
            name: "\u963F\u95FB (Neil)",
            language: "zh-CN",
            gender: "male",
            description: "qwenVoiceNeil"
          },
          {
            id: "Elias",
            name: "\u58A8\u8BB2\u5E08 (Elias)",
            language: "zh-CN",
            gender: "female",
            description: "qwenVoiceElias"
          },
          {
            id: "Arthur",
            name: "\u5F90\u5927\u7237 (Arthur)",
            language: "zh-CN",
            gender: "male",
            description: "qwenVoiceArthur"
          },
          {
            id: "Nini",
            name: "\u90BB\u5BB6\u59B9\u59B9 (Nini)",
            language: "zh-CN",
            gender: "female",
            description: "qwenVoiceNini"
          },
          {
            id: "Ebona",
            name: "\u8BE1\u5A46\u5A46 (Ebona)",
            language: "zh-CN",
            gender: "female",
            description: "qwenVoiceEbona"
          },
          {
            id: "Seren",
            name: "\u5C0F\u5A49 (Seren)",
            language: "zh-CN",
            gender: "female",
            description: "qwenVoiceSeren"
          },
          {
            id: "Pip",
            name: "\u987D\u5C41\u5C0F\u5B69 (Pip)",
            language: "zh-CN",
            gender: "male",
            description: "qwenVoicePip"
          },
          {
            id: "Stella",
            name: "\u5C11\u5973\u963F\u6708 (Stella)",
            language: "zh-CN",
            gender: "female",
            description: "qwenVoiceStella"
          },
          // International voices
          {
            id: "Bodega",
            name: "\u535A\u5FB7\u52A0 (Bodega)",
            language: "es",
            gender: "male",
            description: "qwenVoiceBodega"
          },
          {
            id: "Sonrisa",
            name: "\u7D22\u5C3C\u838E (Sonrisa)",
            language: "es",
            gender: "female",
            description: "qwenVoiceSonrisa"
          },
          {
            id: "Alek",
            name: "\u963F\u5217\u514B (Alek)",
            language: "ru",
            gender: "male",
            description: "qwenVoiceAlek"
          },
          {
            id: "Dolce",
            name: "\u591A\u5C14\u5207 (Dolce)",
            language: "it",
            gender: "male",
            description: "qwenVoiceDolce"
          },
          {
            id: "Sohee",
            name: "\u7D20\u7199 (Sohee)",
            language: "ko",
            gender: "female",
            description: "qwenVoiceSohee"
          },
          {
            id: "Ono Anna",
            name: "\u5C0F\u91CE\u674F (Ono Anna)",
            language: "ja",
            gender: "female",
            description: "qwenVoiceOnoAnna"
          },
          {
            id: "Lenn",
            name: "\u83B1\u6069 (Lenn)",
            language: "de",
            gender: "male",
            description: "qwenVoiceLenn"
          },
          {
            id: "Emilien",
            name: "\u57C3\u7C73\u5C14\u5B89 (Emilien)",
            language: "fr",
            gender: "male",
            description: "qwenVoiceEmilien"
          },
          {
            id: "Andre",
            name: "\u5B89\u5FB7\u96F7 (Andre)",
            language: "zh-CN",
            gender: "male",
            description: "qwenVoiceAndre"
          },
          {
            id: "Radio Gol",
            name: "\u62C9\u8FEA\u5965\xB7\u6208\u5C14 (Radio Gol)",
            language: "pt",
            gender: "male",
            description: "qwenVoiceRadioGol"
          },
          // Dialect voices
          {
            id: "Jada",
            name: "\u4E0A\u6D77-\u963F\u73CD (Jada)",
            language: "zh-CN",
            gender: "female",
            description: "qwenVoiceJada"
          },
          {
            id: "Dylan",
            name: "\u5317\u4EAC-\u6653\u4E1C (Dylan)",
            language: "zh-CN",
            gender: "male",
            description: "qwenVoiceDylan"
          },
          {
            id: "Li",
            name: "\u5357\u4EAC-\u8001\u674E (Li)",
            language: "zh-CN",
            gender: "male",
            description: "qwenVoiceLi"
          },
          {
            id: "Marcus",
            name: "\u9655\u897F-\u79E6\u5DDD (Marcus)",
            language: "zh-CN",
            gender: "male",
            description: "qwenVoiceMarcus"
          },
          {
            id: "Roy",
            name: "\u95FD\u5357-\u963F\u6770 (Roy)",
            language: "zh-CN",
            gender: "male",
            description: "qwenVoiceRoy"
          },
          {
            id: "Peter",
            name: "\u5929\u6D25-\u674E\u5F7C\u5F97 (Peter)",
            language: "zh-CN",
            gender: "male",
            description: "qwenVoicePeter"
          },
          {
            id: "Sunny",
            name: "\u56DB\u5DDD-\u6674\u513F (Sunny)",
            language: "zh-CN",
            gender: "female",
            description: "qwenVoiceSunny"
          },
          {
            id: "Eric",
            name: "\u56DB\u5DDD-\u7A0B\u5DDD (Eric)",
            language: "zh-CN",
            gender: "male",
            description: "qwenVoiceEric"
          },
          {
            id: "Rocky",
            name: "\u7CA4\u8BED-\u963F\u5F3A (Rocky)",
            language: "zh-HK",
            gender: "male",
            description: "qwenVoiceRocky"
          },
          {
            id: "Kiki",
            name: "\u7CA4\u8BED-\u963F\u6E05 (Kiki)",
            language: "zh-HK",
            gender: "female",
            description: "qwenVoiceKiki"
          }
        ],
        supportedFormats: ["mp3", "wav", "pcm"]
      },
      "minimax-tts": {
        id: "minimax-tts",
        name: "MiniMax TTS",
        requiresApiKey: true,
        defaultBaseUrl: "https://api.minimaxi.com",
        icon: "/logos/minimax.svg",
        models: MINIMAX_TTS_MODELS.map((m) => ({ id: m.id, name: m.name })),
        defaultModelId: "speech-2.8-hd",
        voices: [
          // 中文常用
          {
            id: "female-yujie",
            name: "\u5FA1\u59D0\u97F3\u8272",
            language: "zh-CN",
            gender: "female"
          },
          {
            id: "male-qn-jingying",
            name: "\u7CBE\u82F1\u9752\u5E74",
            language: "zh-CN",
            gender: "male"
          },
          {
            id: "female-shaonv",
            name: "\u5C11\u5973\u97F3\u8272",
            language: "zh-CN",
            gender: "female"
          },
          {
            id: "Chinese (Mandarin)_Gentleman",
            name: "\u6E29\u6DA6\u7537\u58F0",
            language: "zh-CN",
            gender: "male"
          },
          {
            id: "Chinese (Mandarin)_News_Anchor",
            name: "\u65B0\u95FB\u5973\u58F0",
            language: "zh-CN",
            gender: "female"
          },
          {
            id: "Chinese (Mandarin)_Warm_Girl",
            name: "\u6E29\u6696\u5C11\u5973",
            language: "zh-CN",
            gender: "female"
          },
          {
            id: "Chinese (Mandarin)_Radio_Host",
            name: "\u7535\u53F0\u7537\u4E3B\u64AD",
            language: "zh-CN",
            gender: "male"
          },
          // 英文
          {
            id: "English_Trustworthy_Man",
            name: "Trustworthy Man",
            language: "en-US",
            gender: "male"
          },
          {
            id: "English_Graceful_Lady",
            name: "Graceful Lady",
            language: "en-US",
            gender: "female"
          },
          {
            id: "English_expressive_narrator",
            name: "Expressive Narrator",
            language: "en-US",
            gender: "neutral"
          }
        ],
        supportedFormats: ["mp3", "wav", "flac", "pcm"],
        speedRange: {
          min: 0.5,
          max: 2,
          default: 1
        }
      },
      "voxcpm-tts": {
        id: VOXCPM_TTS_PROVIDER_ID,
        name: "VoxCPM2",
        requiresApiKey: false,
        defaultBaseUrl: "http://127.0.0.1:8000",
        icon: "/logos/voxcpm-icon.png",
        models: [{ id: VOXCPM_VLLM_MODEL_ID, name: "VoxCPM2" }],
        defaultModelId: VOXCPM_VLLM_MODEL_ID,
        voices: [VOXCPM_AUTO_VOICE],
        supportedFormats: ["mp3", "wav"],
        speedRange: {
          min: 0.5,
          max: 2,
          default: 1
        }
      },
      "doubao-tts": {
        id: "doubao-tts",
        name: "\u8C46\u5305 TTS 2.0\uFF08\u706B\u5C71\u5F15\u64CE\uFF09",
        requiresApiKey: true,
        defaultBaseUrl: "https://openspeech.bytedance.com/api/v3/tts",
        icon: "/logos/doubao.svg",
        models: [],
        defaultModelId: "",
        voices: [
          { id: "zh_female_vv_uranus_bigtts", name: "Vivi 2.0", language: "zh-CN", gender: "female" },
          {
            id: "zh_female_xiaohe_uranus_bigtts",
            name: "\u5C0F\u4F55 2.0",
            language: "zh-CN",
            gender: "female"
          },
          {
            id: "zh_male_m191_uranus_bigtts",
            name: "\u4E91\u821F 2.0",
            language: "zh-CN",
            gender: "male"
          },
          {
            id: "zh_male_taocheng_uranus_bigtts",
            name: "\u5C0F\u5929 2.0",
            language: "zh-CN",
            gender: "male"
          },
          {
            id: "zh_male_liufei_uranus_bigtts",
            name: "\u5218\u98DE 2.0",
            language: "zh-CN",
            gender: "male"
          },
          {
            id: "zh_female_qingxinnvsheng_uranus_bigtts",
            name: "\u6E05\u65B0\u5973\u58F0 2.0",
            language: "zh-CN",
            gender: "female"
          },
          {
            id: "zh_female_cancan_uranus_bigtts",
            name: "\u77E5\u6027\u707F\u707F 2.0",
            language: "zh-CN",
            gender: "female"
          },
          {
            id: "zh_female_shuangkuaisisi_uranus_bigtts",
            name: "\u723D\u5FEB\u601D\u601D 2.0",
            language: "zh-CN",
            gender: "female"
          },
          {
            id: "zh_female_tianmeixiaoyuan_uranus_bigtts",
            name: "\u751C\u7F8E\u5C0F\u6E90 2.0",
            language: "zh-CN",
            gender: "female"
          },
          {
            id: "zh_female_linjianvhai_uranus_bigtts",
            name: "\u90BB\u5BB6\u5973\u5B69 2.0",
            language: "zh-CN",
            gender: "female"
          },
          {
            id: "zh_male_shaonianzixin_uranus_bigtts",
            name: "\u5C11\u5E74\u6893\u8F9B 2.0",
            language: "zh-CN",
            gender: "male"
          },
          {
            id: "zh_male_ruyayichen_uranus_bigtts",
            name: "\u5112\u96C5\u9038\u8FB0 2.0",
            language: "zh-CN",
            gender: "male"
          },
          {
            id: "zh_female_yingyujiaoxue_uranus_bigtts",
            name: "Tina\u8001\u5E08 2.0",
            language: "zh-CN",
            gender: "female"
          },
          {
            id: "zh_female_kefunvsheng_uranus_bigtts",
            name: "\u6696\u9633\u5973\u58F0 2.0",
            language: "zh-CN",
            gender: "female"
          },
          { id: "en_male_tim_uranus_bigtts", name: "Tim", language: "en-US", gender: "male" },
          { id: "en_female_dacey_uranus_bigtts", name: "Dacey", language: "en-US", gender: "female" },
          {
            id: "en_female_stokie_uranus_bigtts",
            name: "Stokie",
            language: "en-US",
            gender: "female"
          }
        ],
        supportedFormats: ["mp3"],
        speedRange: { min: 0.5, max: 2, default: 1 }
      },
      "elevenlabs-tts": {
        id: "elevenlabs-tts",
        name: "ElevenLabs TTS",
        requiresApiKey: true,
        defaultBaseUrl: "https://api.elevenlabs.io/v1",
        icon: "/logos/elevenlabs.svg",
        models: [
          { id: "eleven_multilingual_v2", name: "Multilingual v2" },
          { id: "eleven_flash_v2_5", name: "Flash v2.5" },
          { id: "eleven_flash_v2", name: "Flash v2" }
        ],
        defaultModelId: "eleven_multilingual_v2",
        // Free-tier-safe fallback set; account-specific/custom voices should come from /v2/voices dynamically later.
        voices: [
          {
            id: "EXAVITQu4vr4xnSDxMaL",
            name: "Sarah",
            language: "en-US",
            gender: "female",
            description: "Confident and warm professional voice for clear narration"
          },
          {
            id: "Xb7hH8MSUJpSbSDYk0k2",
            name: "Alice",
            language: "en-GB",
            gender: "female",
            description: "Clear and engaging British educator voice for e-learning"
          },
          {
            id: "XrExE9yKIg1WjnnlVkGX",
            name: "Matilda",
            language: "en-US",
            gender: "female",
            description: "Knowledgeable and upbeat voice suited for lectures"
          },
          {
            id: "CwhRBWXzGAHq8TQ4Fs17",
            name: "Roger",
            language: "en-US",
            gender: "male",
            description: "Laid-back but resonant male voice for friendly lessons"
          },
          {
            id: "cjVigY5qzO86Huf0OWal",
            name: "Eric",
            language: "en-US",
            gender: "male",
            description: "Smooth and trustworthy voice for polished classroom audio"
          },
          {
            id: "onwK4e9ZLuTAKqWW03F9",
            name: "Daniel",
            language: "en-GB",
            gender: "male",
            description: "Steady British broadcaster voice for formal explanations"
          },
          {
            id: "SAz9YHcvj6GT2YYXdXww",
            name: "River",
            language: "en-US",
            gender: "neutral",
            description: "Relaxed and informative neutral voice for general narration"
          }
        ],
        supportedFormats: ["mp3", "opus", "pcm", "wav", "ulaw", "alaw"],
        speedRange: { min: 0.7, max: 1.2, default: 1 }
      },
      "browser-native-tts": {
        id: "browser-native-tts",
        name: "\u6D4F\u89C8\u5668\u539F\u751F (Web Speech API)",
        requiresApiKey: false,
        icon: "/logos/browser.svg",
        models: [],
        defaultModelId: "",
        voices: [
          // Note: Actual voices are determined by the browser and OS
          // These are placeholder - real voices are fetched dynamically via speechSynthesis.getVoices()
          { id: "default", name: "\u9ED8\u8BA4", language: "zh-CN", gender: "neutral" }
        ],
        supportedFormats: ["browser"],
        // Browser native audio
        speedRange: { min: 0.1, max: 10, default: 1 }
      },
      "lemonade-tts": {
        id: "lemonade-tts",
        name: "Lemonade TTS",
        requiresApiKey: false,
        defaultBaseUrl: "http://localhost:13305/v1",
        icon: "/logos/lemonade.svg",
        models: [{ id: "kokoro-v1", name: "Kokoro v1" }],
        defaultModelId: "kokoro-v1",
        voices: [
          // American English — female
          { id: "af_alloy", name: "Alloy", language: "en-US", gender: "female" },
          { id: "af_aoede", name: "Aoede", language: "en-US", gender: "female" },
          { id: "af_bella", name: "Bella", language: "en-US", gender: "female" },
          { id: "af_heart", name: "Heart", language: "en-US", gender: "female" },
          { id: "af_jessica", name: "Jessica", language: "en-US", gender: "female" },
          { id: "af_kore", name: "Kore", language: "en-US", gender: "female" },
          { id: "af_nicole", name: "Nicole", language: "en-US", gender: "female" },
          { id: "af_nova", name: "Nova", language: "en-US", gender: "female" },
          { id: "af_river", name: "River", language: "en-US", gender: "female" },
          { id: "af_sarah", name: "Sarah", language: "en-US", gender: "female" },
          { id: "af_sky", name: "Sky", language: "en-US", gender: "female" },
          // American English — male
          { id: "am_adam", name: "Adam", language: "en-US", gender: "male" },
          { id: "am_echo", name: "Echo", language: "en-US", gender: "male" },
          { id: "am_eric", name: "Eric", language: "en-US", gender: "male" },
          { id: "am_fenrir", name: "Fenrir", language: "en-US", gender: "male" },
          { id: "am_liam", name: "Liam", language: "en-US", gender: "male" },
          { id: "am_michael", name: "Michael", language: "en-US", gender: "male" },
          { id: "am_onyx", name: "Onyx", language: "en-US", gender: "male" },
          { id: "am_puck", name: "Puck", language: "en-US", gender: "male" },
          // British English — female
          { id: "bf_alice", name: "Alice", language: "en-GB", gender: "female" },
          { id: "bf_emma", name: "Emma", language: "en-GB", gender: "female" },
          { id: "bf_isabella", name: "Isabella", language: "en-GB", gender: "female" },
          { id: "bf_lily", name: "Lily", language: "en-GB", gender: "female" },
          // British English — male
          { id: "bm_daniel", name: "Daniel", language: "en-GB", gender: "male" },
          { id: "bm_fable", name: "Fable", language: "en-GB", gender: "male" },
          { id: "bm_george", name: "George", language: "en-GB", gender: "male" },
          { id: "bm_lewis", name: "Lewis", language: "en-GB", gender: "male" },
          // Mandarin Chinese — female
          { id: "zf_xiaobei", name: "\u6653\u8D1D", language: "zh-CN", gender: "female" },
          { id: "zf_xiaoni", name: "\u6653\u59AE", language: "zh-CN", gender: "female" },
          { id: "zf_xiaoxiao", name: "\u6653\u6653", language: "zh-CN", gender: "female" },
          { id: "zf_xiaoyi", name: "\u6653\u4F0A", language: "zh-CN", gender: "female" },
          // Mandarin Chinese — male
          { id: "zm_yunjian", name: "\u4E91\u5065", language: "zh-CN", gender: "male" },
          { id: "zm_yunxi", name: "\u4E91\u5E0C", language: "zh-CN", gender: "male" },
          { id: "zm_yunxia", name: "\u4E91\u590F", language: "zh-CN", gender: "male" },
          { id: "zm_yunyang", name: "\u4E91\u626C", language: "zh-CN", gender: "male" },
          // Japanese — female
          { id: "jf_alpha", name: "Alpha", language: "ja-JP", gender: "female" },
          { id: "jf_gongitsune", name: "Gongitsune", language: "ja-JP", gender: "female" },
          { id: "jf_nezumi", name: "Nezumi", language: "ja-JP", gender: "female" },
          { id: "jf_tebukuro", name: "Tebukuro", language: "ja-JP", gender: "female" },
          // Japanese — male
          { id: "jm_kumo", name: "Kumo", language: "ja-JP", gender: "male" },
          // Spanish
          { id: "ef_dora", name: "Dora", language: "es-ES", gender: "female" },
          { id: "em_alex", name: "Alex", language: "es-ES", gender: "male" },
          { id: "em_santa", name: "Santa", language: "es-ES", gender: "male" },
          // French
          { id: "ff_siwis", name: "Siwis", language: "fr-FR", gender: "female" },
          // Hindi
          { id: "hf_alpha", name: "Alpha", language: "hi-IN", gender: "female" },
          { id: "hf_beta", name: "Beta", language: "hi-IN", gender: "female" },
          { id: "hm_omega", name: "Omega", language: "hi-IN", gender: "male" },
          { id: "hm_psi", name: "Psi", language: "hi-IN", gender: "male" },
          // Italian
          { id: "if_sara", name: "Sara", language: "it-IT", gender: "female" },
          { id: "im_nicola", name: "Nicola", language: "it-IT", gender: "male" },
          // Brazilian Portuguese
          { id: "pf_dora", name: "Dora", language: "pt-BR", gender: "female" },
          { id: "pm_alex", name: "Alex", language: "pt-BR", gender: "male" },
          { id: "pm_santa", name: "Santa", language: "pt-BR", gender: "male" }
        ],
        supportedFormats: ["wav"],
        speedRange: { min: 0.25, max: 4, default: 1 }
      }
    };
    ASR_PROVIDERS = {
      "openai-whisper": {
        id: "openai-whisper",
        name: "OpenAI Whisper",
        requiresApiKey: true,
        defaultBaseUrl: "https://api.openai.com/v1",
        icon: "/logos/openai.svg",
        models: [
          { id: "gpt-4o-mini-transcribe", name: "GPT-4o Mini Transcribe" },
          { id: "gpt-4o-transcribe", name: "GPT-4o Transcribe" },
          { id: "whisper-1", name: "Whisper-1" }
        ],
        defaultModelId: "gpt-4o-mini-transcribe",
        supportedLanguages: [
          // OpenAI Whisper supports 58 languages (as of official docs)
          // Source: https://platform.openai.com/docs/guides/speech-to-text
          "auto",
          // Auto-detect
          // Hot languages (commonly used)
          "zh",
          // Chinese
          "en",
          // English
          "ja",
          // Japanese
          "ko",
          // Korean
          "es",
          // Spanish
          "fr",
          // French
          "de",
          // German
          "ru",
          // Russian
          "ar",
          // Arabic
          "pt",
          // Portuguese
          "it",
          // Italian
          "hi",
          // Hindi
          // Other languages (alphabetical)
          "af",
          // Afrikaans
          "hy",
          // Armenian
          "az",
          // Azerbaijani
          "be",
          // Belarusian
          "bs",
          // Bosnian
          "bg",
          // Bulgarian
          "ca",
          // Catalan
          "hr",
          // Croatian
          "cs",
          // Czech
          "da",
          // Danish
          "nl",
          // Dutch
          "et",
          // Estonian
          "fi",
          // Finnish
          "gl",
          // Galician
          "el",
          // Greek
          "he",
          // Hebrew
          "hu",
          // Hungarian
          "is",
          // Icelandic
          "id",
          // Indonesian
          "kn",
          // Kannada
          "kk",
          // Kazakh
          "lv",
          // Latvian
          "lt",
          // Lithuanian
          "mk",
          // Macedonian
          "ms",
          // Malay
          "mr",
          // Marathi
          "mi",
          // Maori
          "ne",
          // Nepali
          "no",
          // Norwegian
          "fa",
          // Persian
          "pl",
          // Polish
          "ro",
          // Romanian
          "sr",
          // Serbian
          "sk",
          // Slovak
          "sl",
          // Slovenian
          "sw",
          // Swahili
          "sv",
          // Swedish
          "tl",
          // Tagalog
          "ta",
          // Tamil
          "th",
          // Thai
          "tr",
          // Turkish
          "uk",
          // Ukrainian
          "ur",
          // Urdu
          "vi",
          // Vietnamese
          "cy"
          // Welsh
        ],
        supportedFormats: ["mp3", "mp4", "mpeg", "mpga", "m4a", "wav", "webm"]
      },
      "qwen-asr": {
        id: "qwen-asr",
        name: "Qwen ASR (\u963F\u91CC\u4E91\u767E\u70BC)",
        requiresApiKey: true,
        defaultBaseUrl: "https://dashscope.aliyuncs.com/api/v1",
        icon: "/logos/bailian.svg",
        models: [{ id: "qwen3-asr-flash", name: "Qwen3 ASR Flash" }],
        defaultModelId: "qwen3-asr-flash",
        supportedLanguages: [
          // Qwen ASR supports 27 languages + auto-detect
          // If language is uncertain or mixed (e.g. Chinese-English-Japanese-Korean), use "auto" (do not specify language parameter)
          "auto",
          // Auto-detect (do not specify language parameter)
          // Hot languages (commonly used)
          "zh",
          // Chinese (Mandarin, Sichuanese, Minnan, Wu dialects)
          "yue",
          // Cantonese
          "en",
          // English
          "ja",
          // Japanese
          "ko",
          // Korean
          "de",
          // German
          "fr",
          // French
          "ru",
          // Russian
          "es",
          // Spanish
          "pt",
          // Portuguese
          "ar",
          // Arabic
          "it",
          // Italian
          "hi",
          // Hindi
          // Other languages (alphabetical)
          "cs",
          // Czech
          "da",
          // Danish
          "fi",
          // Finnish
          "fil",
          // Filipino
          "id",
          // Indonesian
          "is",
          // Icelandic
          "ms",
          // Malay
          "no",
          // Norwegian
          "pl",
          // Polish
          "sv",
          // Swedish
          "th",
          // Thai
          "tr",
          // Turkish
          "uk",
          // Ukrainian
          "vi"
          // Vietnamese
        ],
        supportedFormats: ["mp3", "wav", "webm", "m4a", "flac"]
      },
      "azure-asr": {
        id: "azure-asr",
        name: "Azure STT",
        requiresApiKey: true,
        defaultBaseUrl: "https://{region}.api.cognitive.microsoft.com",
        icon: "/logos/azure.svg",
        models: [],
        defaultModelId: "",
        supportedLanguages: [
          "auto",
          "en",
          "zh",
          "ja",
          "ko",
          "de",
          "fr",
          "es",
          "it",
          "pt",
          "ru",
          "ar",
          "hi"
        ],
        supportedFormats: ["wav", "ogg", "webm", "mp3", "flac", "m4a"]
      },
      "browser-native": {
        id: "browser-native",
        name: "\u6D4F\u89C8\u5668\u539F\u751F ASR (Web Speech API)",
        requiresApiKey: false,
        icon: "/logos/browser.svg",
        models: [],
        defaultModelId: "",
        supportedLanguages: [
          // Chinese variants
          "zh-CN",
          // Mandarin (Simplified, China)
          "zh-TW",
          // Mandarin (Traditional, Taiwan)
          "zh-HK",
          // Cantonese (Hong Kong)
          "yue-Hant-HK",
          // Cantonese (Traditional)
          // English variants
          "en-US",
          // English (United States)
          "en-GB",
          // English (United Kingdom)
          "en-AU",
          // English (Australia)
          "en-CA",
          // English (Canada)
          "en-IN",
          // English (India)
          "en-NZ",
          // English (New Zealand)
          "en-ZA",
          // English (South Africa)
          // Japanese & Korean
          "ja-JP",
          // Japanese (Japan)
          "ko-KR",
          // Korean (South Korea)
          // European languages
          "de-DE",
          // German (Germany)
          "fr-FR",
          // French (France)
          "es-ES",
          // Spanish (Spain)
          "es-MX",
          // Spanish (Mexico)
          "es-AR",
          // Spanish (Argentina)
          "es-CO",
          // Spanish (Colombia)
          "it-IT",
          // Italian (Italy)
          "pt-BR",
          // Portuguese (Brazil)
          "pt-PT",
          // Portuguese (Portugal)
          "ru-RU",
          // Russian (Russia)
          "nl-NL",
          // Dutch (Netherlands)
          "pl-PL",
          // Polish (Poland)
          "cs-CZ",
          // Czech (Czech Republic)
          "da-DK",
          // Danish (Denmark)
          "fi-FI",
          // Finnish (Finland)
          "sv-SE",
          // Swedish (Sweden)
          "no-NO",
          // Norwegian (Norway)
          "tr-TR",
          // Turkish (Turkey)
          "el-GR",
          // Greek (Greece)
          "hu-HU",
          // Hungarian (Hungary)
          "ro-RO",
          // Romanian (Romania)
          "sk-SK",
          // Slovak (Slovakia)
          "bg-BG",
          // Bulgarian (Bulgaria)
          "hr-HR",
          // Croatian (Croatia)
          "ca-ES",
          // Catalan (Spain)
          // Middle East & Asia
          "ar-SA",
          // Arabic (Saudi Arabia)
          "ar-EG",
          // Arabic (Egypt)
          "he-IL",
          // Hebrew (Israel)
          "hi-IN",
          // Hindi (India)
          "th-TH",
          // Thai (Thailand)
          "vi-VN",
          // Vietnamese (Vietnam)
          "id-ID",
          // Indonesian (Indonesia)
          "ms-MY",
          // Malay (Malaysia)
          "fil-PH",
          // Filipino (Philippines)
          // Other
          "af-ZA",
          // Afrikaans (South Africa)
          "uk-UA"
          // Ukrainian (Ukraine)
        ],
        supportedFormats: ["webm"]
        // MediaRecorder format
      },
      "funasr-asr": {
        id: "funasr-asr",
        name: "FunASR",
        requiresApiKey: false,
        defaultBaseUrl: "http://localhost:8000/v1",
        icon: "/logos/funasr.png",
        models: [
          { id: "sensevoice", name: "SenseVoiceSmall" },
          { id: "paraformer", name: "Paraformer" },
          { id: "fun-asr-nano", name: "Fun-ASR-Nano" }
        ],
        defaultModelId: "sensevoice",
        supportedLanguages: ["auto", "zh", "en", "ja", "ko", "yue"],
        supportedFormats: ["wav"]
      },
      "lemonade-asr": {
        id: "lemonade-asr",
        name: "Lemonade ASR",
        requiresApiKey: false,
        defaultBaseUrl: "http://localhost:13305/v1",
        icon: "/logos/lemonade.svg",
        models: [
          { id: "Whisper-Base", name: "Whisper Base" },
          { id: "Whisper-Large-v3", name: "Whisper Large v3" },
          { id: "Whisper-Large-v3-Turbo", name: "Whisper Large v3 Turbo" },
          { id: "Whisper-Medium", name: "Whisper Medium" },
          { id: "Whisper-Small", name: "Whisper Small" },
          { id: "Whisper-Tiny", name: "Whisper Tiny" }
        ],
        defaultModelId: "Whisper-Base",
        supportedLanguages: CUSTOM_ASR_DEFAULT_LANGUAGES,
        supportedFormats: ["wav"]
      }
    };
    DEFAULT_TTS_VOICES = {
      "openai-tts": "alloy",
      "azure-tts": "zh-CN-XiaoxiaoNeural",
      "glm-tts": "tongtong",
      "qwen-tts": "Cherry",
      "voxcpm-tts": VOXCPM_AUTO_VOICE_ID,
      "doubao-tts": "zh_female_vv_uranus_bigtts",
      "elevenlabs-tts": "EXAVITQu4vr4xnSDxMaL",
      "minimax-tts": "female-yujie",
      "lemonade-tts": "af_heart",
      "browser-native-tts": "default"
    };
    DEFAULT_TTS_MODELS = {
      "openai-tts": "gpt-4o-mini-tts",
      "azure-tts": "",
      "glm-tts": "glm-tts",
      "qwen-tts": "qwen3-tts-flash",
      "voxcpm-tts": VOXCPM_VLLM_MODEL_ID,
      "doubao-tts": "",
      "elevenlabs-tts": "eleven_multilingual_v2",
      "minimax-tts": "speech-2.8-hd",
      "lemonade-tts": "kokoro-v1",
      "browser-native-tts": ""
    };
  }
});

// OpenMAIC/lib/pdf/constants.ts
var PDF_PROVIDERS;
var init_constants2 = __esm({
  "OpenMAIC/lib/pdf/constants.ts"() {
    "use strict";
    PDF_PROVIDERS = {
      unpdf: {
        id: "unpdf",
        name: "unpdf",
        requiresApiKey: false,
        icon: "/logos/unpdf.svg",
        features: ["text", "images", "metadata"]
      },
      mineru: {
        id: "mineru",
        name: "MinerU",
        requiresApiKey: false,
        icon: "/logos/mineru.png",
        features: ["text", "images", "tables", "formulas", "layout-analysis"]
      },
      "mineru-cloud": {
        id: "mineru-cloud",
        name: "MinerU (Cloud)",
        requiresApiKey: true,
        icon: "/logos/mineru.png",
        features: ["text", "images", "tables", "formulas", "layout-analysis"]
      },
      alidocmind: {
        id: "alidocmind",
        name: "AliDocMind",
        requiresApiKey: true,
        icon: "/logos/aliyun.svg",
        features: ["text", "images", "tables", "formulas", "layout-analysis", "ocr"]
      }
    };
  }
});

// OpenMAIC/lib/media/probe-auth.ts
var init_probe_auth = __esm({
  "OpenMAIC/lib/media/probe-auth.ts"() {
    "use strict";
  }
});

// OpenMAIC/lib/media/require-model.ts
function requireModel(model, providerLabel) {
  if (!model) {
    throw new Error(`${providerLabel} requires a model to be configured`);
  }
  return model;
}
var init_require_model = __esm({
  "OpenMAIC/lib/media/require-model.ts"() {
    "use strict";
  }
});

// OpenMAIC/lib/media/adapters/seedream-adapter.ts
function resolveArkRoot(baseUrl) {
  const trimmed = baseUrl.replace(/\/+$/, "");
  return /\/api\//.test(trimmed) ? trimmed : `${trimmed}/api/v3`;
}
function resolveSeedreamSize(options4) {
  if (options4.width && options4.height) {
    const pixels = options4.width * options4.height;
    if (pixels < 3686400) {
      const scale = Math.ceil(Math.sqrt(3686400 / pixels));
      return `${options4.width * scale}x${options4.height * scale}`;
    }
    return `${options4.width}x${options4.height}`;
  }
  return "2K";
}
async function generateWithSeedream(config, options4) {
  const baseUrl = config.baseUrl || DEFAULT_BASE_URL;
  const response = await fetch(`${resolveArkRoot(baseUrl)}/images/generations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model: requireModel(config.model, "Seedream"),
      prompt: options4.prompt,
      size: resolveSeedreamSize(options4),
      watermark: false
    })
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Seedream generation failed (${response.status}): ${text}`);
  }
  const data = await response.json();
  const imageData = data.data?.[0];
  if (!imageData) {
    throw new Error("Seedream returned empty response");
  }
  return {
    url: imageData.url,
    base64: imageData.b64_json,
    width: options4.width || 1024,
    height: options4.height || 1024
  };
}
var DEFAULT_BASE_URL;
var init_seedream_adapter = __esm({
  "OpenMAIC/lib/media/adapters/seedream-adapter.ts"() {
    "use strict";
    init_probe_auth();
    init_require_model();
    DEFAULT_BASE_URL = "https://ark.cn-beijing.volces.com";
  }
});

// OpenMAIC/lib/media/adapters/openai-image-adapter.ts
function normalizeBaseUrl(baseUrl) {
  return (baseUrl || DEFAULT_BASE_URL2).replace(/\/$/, "");
}
function resolveSize(options4) {
  return `${options4.width || 1024}x${options4.height || 1024}`;
}
async function generateWithOpenAIImage(config, options4) {
  const baseUrl = normalizeBaseUrl(config.baseUrl);
  const model = requireModel(config.model, "OpenAI Image");
  const width = options4.width || 1024;
  const height = options4.height || 1024;
  const response = await fetch(`${baseUrl}/images/generations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model,
      prompt: options4.prompt,
      n: 1,
      size: resolveSize(options4)
    })
  });
  if (!response.ok) {
    const text = await response.text().catch(() => response.statusText);
    throw new Error(`OpenAI image generation failed (${response.status}): ${text}`);
  }
  const data = await response.json();
  const imageData = data.data?.[0];
  if (!imageData?.url && !imageData?.b64_json) {
    throw new Error("OpenAI Image returned empty image response");
  }
  return {
    url: imageData.url,
    base64: imageData.b64_json,
    width,
    height
  };
}
var DEFAULT_BASE_URL2;
var init_openai_image_adapter = __esm({
  "OpenMAIC/lib/media/adapters/openai-image-adapter.ts"() {
    "use strict";
    init_require_model();
    DEFAULT_BASE_URL2 = "https://api.openai.com/v1";
  }
});

// OpenMAIC/lib/media/adapters/qwen-image-adapter.ts
function resolveDashScopeSize(options4) {
  const w = options4.width || 1024;
  const h = options4.height || 576;
  return `${w}*${h}`;
}
async function generateWithQwenImage(config, options4) {
  const baseUrl = config.baseUrl || DEFAULT_BASE_URL3;
  const response = await fetch(`${baseUrl}/api/v1/services/aigc/multimodal-generation/generation`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model: requireModel(config.model, "Qwen Image"),
      input: {
        messages: [
          {
            role: "user",
            content: [
              {
                text: options4.prompt
              }
            ]
          }
        ]
      },
      parameters: {
        negative_prompt: options4.negativePrompt || void 0,
        prompt_extend: true,
        watermark: false,
        size: resolveDashScopeSize(options4)
      }
    })
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Qwen Image generation failed (${response.status}): ${text}`);
  }
  const data = await response.json();
  const choices = data.output?.choices;
  if (!choices || choices.length === 0) {
    if (data.code || data.message) {
      throw new Error(`Qwen Image error: ${data.code} - ${data.message}`);
    }
    throw new Error("Qwen Image returned empty response");
  }
  const content = choices[0]?.message?.content;
  const imageContent = content?.find((c) => c.image);
  if (!imageContent?.image) {
    throw new Error("Qwen Image response missing image URL");
  }
  return {
    url: imageContent.image,
    width: options4.width || 1024,
    height: options4.height || 576
  };
}
var DEFAULT_BASE_URL3;
var init_qwen_image_adapter = __esm({
  "OpenMAIC/lib/media/adapters/qwen-image-adapter.ts"() {
    "use strict";
    init_probe_auth();
    init_require_model();
    DEFAULT_BASE_URL3 = "https://dashscope.aliyuncs.com";
  }
});

// OpenMAIC/lib/media/adapters/nano-banana-adapter.ts
async function generateWithNanoBanana(config, options4) {
  const baseUrl = config.baseUrl || DEFAULT_BASE_URL4;
  const model = requireModel(config.model, "Nano Banana");
  const response = await fetch(`${baseUrl}/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": config.apiKey
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: options4.prompt }]
        }
      ],
      generationConfig: {
        responseModalities: ["IMAGE"]
      }
    })
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Gemini image generation failed (${response.status}): ${text}`);
  }
  const data = await response.json();
  if (data.error) {
    throw new Error(`Gemini error: ${data.error.code} - ${data.error.message}`);
  }
  const parts = data.candidates?.[0]?.content?.parts;
  if (!parts || parts.length === 0) {
    throw new Error("Gemini returned empty response");
  }
  const imagePart = parts.find((p) => p.inlineData);
  if (!imagePart?.inlineData) {
    const textPart = parts.find((p) => p.text);
    throw new Error(`Gemini did not return an image. Response text: ${textPart?.text || "none"}`);
  }
  return {
    base64: imagePart.inlineData.data,
    width: options4.width || 1024,
    height: options4.height || 1024
  };
}
var DEFAULT_BASE_URL4;
var init_nano_banana_adapter = __esm({
  "OpenMAIC/lib/media/adapters/nano-banana-adapter.ts"() {
    "use strict";
    init_require_model();
    DEFAULT_BASE_URL4 = "https://generativelanguage.googleapis.com";
  }
});

// OpenMAIC/lib/media/adapters/minimax-image-adapter.ts
async function generateWithMiniMaxImage(config, options4) {
  const baseUrl = (config.baseUrl || BASE_URL).replace(/\/$/, "");
  const model = requireModel(config.model, "MiniMax Image");
  const aspectRatio = options4.aspectRatio || "1:1";
  const response = await fetch(`${baseUrl}/v1/image_generation`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json; charset=utf-8"
    },
    body: JSON.stringify({
      model,
      prompt: options4.prompt,
      negative_prompt: options4.negativePrompt,
      aspect_ratio: aspectRatio,
      response_format: "url",
      n: 1,
      prompt_optimizer: false
    })
  });
  if (!response.ok) {
    const errText = await response.text().catch(() => response.statusText);
    throw new Error(`MiniMax Image API error: ${errText}`);
  }
  const data = await response.json();
  if (data?.base_resp?.status_code !== 0 && data?.base_resp?.status_code !== void 0) {
    const code = data.base_resp.status_code;
    const msg = data.base_resp.status_msg || "unknown error";
    throw new Error(`MiniMax Image API error ${code}: ${msg}`);
  }
  const imageUrls = data?.data?.image_urls;
  if (!imageUrls || imageUrls.length === 0) {
    throw new Error(`MiniMax Image: no image URLs returned. Response: ${JSON.stringify(data)}`);
  }
  const imageUrl = imageUrls[0];
  let width = options4.width || 1024;
  let height = options4.height || 1024;
  if (!options4.width && !options4.height) {
    const [w, h] = aspectRatio.split(":").map(Number);
    if (w && h) {
      if (w > h) {
        width = 1024;
        height = Math.round(1024 * h / w);
      } else {
        height = 1024;
        width = Math.round(1024 * w / h);
      }
    }
  }
  return {
    url: imageUrl,
    width,
    height
  };
}
var BASE_URL;
var init_minimax_image_adapter = __esm({
  "OpenMAIC/lib/media/adapters/minimax-image-adapter.ts"() {
    "use strict";
    init_require_model();
    BASE_URL = "https://api.minimaxi.com";
  }
});

// OpenMAIC/lib/media/adapters/grok-image-adapter.ts
async function generateWithGrokImage(config, options4) {
  const baseUrl = config.baseUrl || DEFAULT_BASE_URL5;
  const response = await fetch(`${baseUrl}/images/generations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model: requireModel(config.model, "Grok Image"),
      prompt: options4.prompt,
      n: 1,
      response_format: "url"
    })
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Grok image generation failed (${response.status}): ${text}`);
  }
  const data = await response.json();
  const imageData = data.data?.[0];
  if (!imageData) {
    throw new Error("Grok returned empty image response");
  }
  return {
    url: imageData.url,
    base64: imageData.b64_json,
    width: options4.width || 1024,
    height: options4.height || 1024
  };
}
var DEFAULT_BASE_URL5;
var init_grok_image_adapter = __esm({
  "OpenMAIC/lib/media/adapters/grok-image-adapter.ts"() {
    "use strict";
    init_probe_auth();
    init_require_model();
    DEFAULT_BASE_URL5 = "https://api.x.ai/v1";
  }
});

// OpenMAIC/lib/media/comfyui-workflows.ts
var comfyui_workflows_exports = {};
__export(comfyui_workflows_exports, {
  filenameToDisplayName: () => filenameToDisplayName,
  isComfyuiWorkflowFilename: () => isComfyuiWorkflowFilename,
  listComfyuiWorkflowFilenames: () => listComfyuiWorkflowFilenames,
  listComfyuiWorkflows: () => listComfyuiWorkflows
});
function filenameToDisplayName(filename) {
  return filename.replace(/\.json$/i, "").replace(/^comfyui[-_]?/i, "").replace(/[-_]+/g, " ").trim().replace(/\b\w/g, (c) => c.toUpperCase()) || // title-case
  "Default Workflow";
}
function isComfyuiWorkflowFilename(filename) {
  if (filename.includes("/") || filename.includes("\\") || filename.includes("..")) {
    return false;
  }
  const lower = filename.toLowerCase();
  return lower.endsWith(".json") && (lower.startsWith("comfyui") || lower.includes("workflow"));
}
async function listComfyuiWorkflows() {
  if (typeof window === "undefined") {
    try {
      const fs6 = await import("fs");
      const path6 = await import("path");
      const publicDir = path6.join(process.cwd(), "public");
      if (!fs6.existsSync(publicDir)) return [];
      return fs6.readdirSync(publicDir).filter(
        (f) => isComfyuiWorkflowFilename(f) && fs6.statSync(path6.join(publicDir, f)).isFile()
      ).map((filename) => ({ id: filename, name: filenameToDisplayName(filename) })).sort((a, b) => a.name.localeCompare(b.name));
    } catch (err) {
      console.error("[ComfyUI Workflows] Failed to list workflows:", err);
      return [];
    }
  }
  return [];
}
async function listComfyuiWorkflowFilenames() {
  const workflows = await listComfyuiWorkflows();
  return workflows.map((w) => w.id);
}
var init_comfyui_workflows = __esm({
  "OpenMAIC/lib/media/comfyui-workflows.ts"() {
    "use strict";
  }
});

// OpenMAIC/lib/media/adapters/comfyui-image-adapter.ts
async function loadWorkflow(config) {
  if (config.workflowJson) {
    log4.debug("Using pre-supplied workflowJson (skipping fetch)");
    return JSON.parse(JSON.stringify(config.workflowJson));
  }
  if (typeof window === "undefined") {
    const fs6 = await import("fs");
    const path6 = await import("path");
    const { isComfyuiWorkflowFilename: isComfyuiWorkflowFilename2, listComfyuiWorkflowFilenames: listComfyuiWorkflowFilenames2 } = await Promise.resolve().then(() => (init_comfyui_workflows(), comfyui_workflows_exports));
    let filename;
    if (config.workflowPublicPath) {
      filename = path6.basename(config.workflowPublicPath);
    } else if (config.model) {
      if (!isComfyuiWorkflowFilename2(config.model)) {
        log4.error(`Rejected unsafe workflow identifier: "${config.model}"`);
        throw new Error(`ComfyUI: "${config.model}" is not a valid workflow filename.`);
      }
      const known = await listComfyuiWorkflowFilenames2();
      if (!known.includes(config.model)) {
        log4.error(`Rejected unknown workflow identifier: "${config.model}"`);
        throw new Error(
          `ComfyUI: workflow "${config.model}" was not found. Choose one returned by /api/comfyui-workflows.`
        );
      }
      filename = config.model;
    } else {
      const known = await listComfyuiWorkflowFilenames2();
      if (known.length === 0) {
        log4.error("No ComfyUI workflow files found in public/");
        throw new Error(
          "ComfyUI: no workflow JSON files found in the public/ folder. Add at least one comfyui-*.json workflow \u2014 see comfyui-setup-instructions.md."
        );
      }
      filename = known[0];
      log4.info(`No workflow specified \u2014 defaulting to first available: "${filename}"`);
    }
    const publicDir = path6.join(process.cwd(), "public");
    const filePath = path6.join(publicDir, filename);
    const resolvedPublicDir = path6.resolve(publicDir) + path6.sep;
    if (!path6.resolve(filePath).startsWith(resolvedPublicDir)) {
      log4.error(`Refusing to read outside public/ directory: "${filePath}"`);
      throw new Error("ComfyUI: resolved workflow path escapes the public/ directory.");
    }
    log4.info(`Loading workflow from disk: "${filePath}"`);
    if (!fs6.existsSync(filePath)) {
      log4.error(`Workflow file not found at "${filePath}"`);
      throw new Error(
        `ComfyUI: workflow file not found at "${filePath}". Place comfyui-workflow.json in your Next.js public/ folder.`
      );
    }
    const raw = fs6.readFileSync(filePath, "utf-8");
    log4.debug(`Workflow loaded from disk successfully`);
    return JSON.parse(raw);
  }
  let publicPath = DEFAULT_WORKFLOW_PUBLIC_PATH;
  if (config.workflowPublicPath) {
    publicPath = config.workflowPublicPath;
  } else if (config.model) {
    const { isComfyuiWorkflowFilename: isComfyuiWorkflowFilename2 } = await Promise.resolve().then(() => (init_comfyui_workflows(), comfyui_workflows_exports));
    if (!isComfyuiWorkflowFilename2(config.model)) {
      log4.error(`Rejected unsafe workflow identifier: "${config.model}"`);
      throw new Error(`ComfyUI: "${config.model}" is not a valid workflow filename.`);
    }
    publicPath = `/${config.model}`;
  }
  const url = `${window.location.origin}${publicPath}`;
  log4.info(`Loading workflow from "${url}"`);
  const response = await fetch(url);
  if (!response.ok) {
    log4.error(`Failed to load workflow from "${url}" (HTTP ${response.status})`);
    throw new Error(
      `ComfyUI: could not load workflow from "${url}" (HTTP ${response.status}). Place comfyui-workflow.json in your Next.js public/ folder.`
    );
  }
  log4.debug(`Workflow loaded from URL successfully`);
  return await response.json();
}
function resolveDimensions(options4, maxWidth, maxHeight) {
  const raw = options4.aspectRatio ? aspectRatioToDimensions(options4.aspectRatio, maxWidth) : options4.width && options4.height ? { width: options4.width, height: options4.height } : null;
  if (!raw) return null;
  const scale = Math.min(1, maxWidth / raw.width, maxHeight / raw.height);
  return {
    width: Math.round(raw.width * scale),
    height: Math.round(raw.height * scale)
  };
}
function nodeInputs(node) {
  const inputs = node?.["inputs"];
  return inputs && typeof inputs === "object" ? inputs : void 0;
}
function findNodeIdByTitle(workflow, title) {
  const lower = title.toLowerCase();
  for (const [id, node] of Object.entries(workflow)) {
    const meta = node["_meta"];
    if (typeof meta?.title === "string" && meta.title.toLowerCase() === lower) {
      return id;
    }
  }
  return void 0;
}
function patchWorkflow(workflow, options4, maxWidth, maxHeight) {
  const dims = resolveDimensions(options4, maxWidth, maxHeight);
  const promptNodeId = findNodeIdByTitle(workflow, "Input Prompt") ?? findNodeIdByTitle(workflow, "String (Multiline - Prompt)");
  if (!promptNodeId) {
    log4.error('No prompt node found \u2014 add a node titled "Input Prompt" to your workflow');
    throw new Error(
      'ComfyUI workflow is missing a prompt input node. Add a node titled "Input Prompt" (or "String (Multiline - Prompt)") to your workflow.'
    );
  }
  const promptInputs = nodeInputs(workflow[promptNodeId]);
  if (!promptInputs) {
    log4.error(`Prompt node (id: ${promptNodeId}) has no "inputs" object`);
    throw new Error(
      `ComfyUI workflow prompt node (id: ${promptNodeId}) is malformed \u2014 it has no "inputs" object. Re-export the workflow in API format (see comfyui-setup-instructions.md).`
    );
  }
  promptInputs["value"] = options4.prompt;
  log4.debug(
    `Patched prompt node (id: ${promptNodeId}) \u2192 "${options4.prompt.slice(0, 80)}${options4.prompt.length > 80 ? "\u2026" : ""}"`
  );
  const widthNodeId = findNodeIdByTitle(workflow, "Width");
  const heightNodeId = findNodeIdByTitle(workflow, "Height");
  if (widthNodeId && heightNodeId) {
    if (dims) {
      const widthInputs = nodeInputs(workflow[widthNodeId]);
      const heightInputs = nodeInputs(workflow[heightNodeId]);
      if (widthInputs && heightInputs) {
        widthInputs["value"] = dims.width;
        heightInputs["value"] = dims.height;
        log4.debug(`Patched Width node (id: ${widthNodeId}) \u2192 ${dims.width}`);
        log4.debug(`Patched Height node (id: ${heightNodeId}) \u2192 ${dims.height}`);
      } else {
        log4.warn('Width/Height nodes are malformed (missing "inputs") \u2014 using workflow defaults');
      }
    } else {
      log4.debug("Width/Height nodes found but no dimensions resolved \u2014 using workflow defaults");
    }
  } else {
    if (widthNodeId || heightNodeId) {
      log4.warn(
        'Only one of "Width"/"Height" nodes found \u2014 both are needed. Falling back to latent node.'
      );
    }
    const latentNodeId = findNodeIdByTitle(workflow, "Empty Flux 2 Latent");
    if (latentNodeId) {
      const latentInputs = nodeInputs(workflow[latentNodeId]);
      if (dims && latentInputs) {
        latentInputs["width"] = dims.width;
        latentInputs["height"] = dims.height;
        log4.debug(
          `Patched latent size node (id: ${latentNodeId}) \u2192 ${dims.width}\xD7${dims.height} (aspectRatio: ${options4.aspectRatio ?? "none"})`
        );
      } else if (dims && !latentInputs) {
        log4.warn(
          `Latent size node (id: ${latentNodeId}) is malformed (missing "inputs") \u2014 using workflow defaults`
        );
      } else {
        log4.debug(
          `Latent size node (id: ${latentNodeId}) \u2014 no dimensions resolved, using workflow defaults`
        );
      }
    } else {
      log4.warn(
        'No dimension nodes found ("Width"/"Height" or "Empty Flux 2 Latent") \u2014 using workflow defaults'
      );
    }
  }
  const samplerNodeId = findNodeIdByTitle(workflow, "KSampler");
  if (samplerNodeId) {
    const samplerInputs = nodeInputs(workflow[samplerNodeId]);
    if (samplerInputs) {
      const seed = Math.floor(Math.random() * 1e15);
      samplerInputs["seed"] = seed;
      log4.debug(`Patched KSampler seed (id: ${samplerNodeId}) \u2192 ${seed}`);
    } else {
      log4.warn(
        `KSampler node (id: ${samplerNodeId}) is malformed (missing "inputs") \u2014 seed not randomised`
      );
    }
  } else {
    log4.warn("KSampler node not found \u2014 seed not randomised");
  }
}
function extractExecutionError(entry) {
  const messages = entry.status?.messages;
  if (!Array.isArray(messages)) return void 0;
  for (const [event, data] of messages) {
    if (event === "execution_error" && data) {
      const nodeType = typeof data["node_type"] === "string" ? data["node_type"] : void 0;
      const exception = typeof data["exception_message"] === "string" ? data["exception_message"] : void 0;
      const parts = [nodeType, exception].filter(Boolean);
      if (parts.length > 0) return parts.join(": ");
      return "execution_error";
    }
  }
  return void 0;
}
async function queuePrompt(baseUrl, workflow, clientId) {
  log4.info(`Submitting workflow to queue [client_id: ${clientId}]`);
  const response = await fetch(`${baseUrl}/prompt`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: workflow, client_id: clientId }),
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS)
  });
  if (!response.ok) {
    const text = await response.text();
    log4.error(`/prompt request failed (HTTP ${response.status}): ${text}`);
    throw new Error(`ComfyUI /prompt failed (${response.status}): ${text}`);
  }
  const data = await response.json();
  if (data.node_errors && Object.keys(data.node_errors).length > 0) {
    log4.error(`Node errors returned: ${JSON.stringify(data.node_errors)}`);
    throw new Error(`ComfyUI reported node errors: ${JSON.stringify(data.node_errors)}`);
  }
  log4.info(`Queued successfully \u2014 prompt_id: ${data.prompt_id} (queue position: ${data.number})`);
  return data.prompt_id;
}
async function pollHistory(baseUrl, promptId) {
  try {
    const response = await fetch(`${baseUrl}/history/${promptId}`, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS)
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data[promptId] ?? null;
  } catch (err) {
    log4.debug(`Poll request failed (will retry): ${err}`);
    return null;
  }
}
async function fetchImageAsBase64(baseUrl, filename, subfolder, type) {
  const params = new URLSearchParams({ filename, subfolder, type });
  const response = await fetch(`${baseUrl}/view?${params.toString()}`, {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS)
  });
  if (!response.ok) {
    throw new Error(`ComfyUI /view failed (${response.status}) for image "${filename}"`);
  }
  const buffer = await response.arrayBuffer();
  if (typeof Buffer !== "undefined") {
    return Buffer.from(buffer).toString("base64");
  }
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}
async function generateWithComfyuiImage(config, options4) {
  const baseUrl = (config.baseUrl || DEFAULT_BASE_URL6).replace(/\/$/, "");
  const comfyConfig = config;
  log4.info(`Starting image generation [baseUrl: ${baseUrl}] [model: ${config.model ?? "default"}]`);
  log4.info(`Prompt: "${options4.prompt.slice(0, 120)}${options4.prompt.length > 120 ? "\u2026" : ""}"`);
  log4.debug(
    `Options: ${JSON.stringify({ width: options4.width, height: options4.height, aspectRatio: options4.aspectRatio })}`
  );
  const startTime = Date.now();
  const maxResolution = IMAGE_PROVIDERS[config.providerId]?.maxResolution;
  const maxWidth = maxResolution?.width ?? DEFAULT_MAX_WIDTH;
  const maxHeight = maxResolution?.height ?? DEFAULT_MAX_WIDTH;
  const workflow = await loadWorkflow(comfyConfig);
  patchWorkflow(workflow, options4, maxWidth, maxHeight);
  const clientId = `openmaic-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const promptId = await queuePrompt(baseUrl, workflow, clientId);
  const deadline = Date.now() + GENERATION_TIMEOUT_MS;
  let entry = null;
  let pollCount = 0;
  log4.info(`Polling for completion [prompt_id: ${promptId}]`);
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    pollCount++;
    entry = await pollHistory(baseUrl, promptId);
    if (entry?.status?.status_str === "error") {
      const detail = extractExecutionError(entry);
      log4.error(`Workflow execution error [prompt_id: ${promptId}]${detail ? `: ${detail}` : ""}`);
      throw new Error(
        `ComfyUI workflow execution failed (prompt_id: ${promptId})` + (detail ? `: ${detail}` : ". Check the ComfyUI server logs for details.")
      );
    }
    if (entry?.status?.completed) {
      log4.info(
        `Generation complete after ${pollCount} poll(s) (${((Date.now() - startTime) / 1e3).toFixed(1)}s)`
      );
      break;
    }
    if (pollCount % 10 === 0) {
      log4.debug(
        `Still waiting\u2026 ${pollCount} polls, ${((Date.now() - startTime) / 1e3).toFixed(0)}s elapsed`
      );
    }
  }
  if (!entry?.status?.completed) {
    log4.error(
      `Generation timed out after ${GENERATION_TIMEOUT_MS / 1e3}s [prompt_id: ${promptId}]`
    );
    throw new Error(
      `ComfyUI generation timed out after ${GENERATION_TIMEOUT_MS / 1e3}s (prompt_id: ${promptId})`
    );
  }
  let imageInfo;
  for (const nodeOutput of Object.values(entry.outputs)) {
    if (nodeOutput.images && nodeOutput.images.length > 0) {
      imageInfo = nodeOutput.images[0];
      break;
    }
  }
  if (!imageInfo) {
    log4.error("Generation finished but no images found in output nodes");
    throw new Error(
      "ComfyUI finished but returned no images. Check that your workflow includes a SaveImage node."
    );
  }
  log4.info(`Fetching image "${imageInfo.filename}" from ComfyUI /view`);
  const base64 = await fetchImageAsBase64(
    baseUrl,
    imageInfo.filename,
    imageInfo.subfolder,
    imageInfo.type
  );
  const totalMs = Date.now() - startTime;
  const dims = resolveDimensions(options4, maxWidth, maxHeight);
  log4.info(
    `Image generation complete \u2014 ${imageInfo.filename} (${dims?.width ?? options4.width ?? 1024}\xD7${dims?.height ?? options4.height ?? 1024}) in ${(totalMs / 1e3).toFixed(1)}s`
  );
  return {
    base64,
    width: dims?.width ?? options4.width ?? 1024,
    height: dims?.height ?? options4.height ?? 1024
  };
}
var COMPONENT, log4, DEFAULT_BASE_URL6, DEFAULT_WORKFLOW_FILENAME, DEFAULT_WORKFLOW_PUBLIC_PATH, POLL_INTERVAL_MS, GENERATION_TIMEOUT_MS, FETCH_TIMEOUT_MS, DEFAULT_MAX_WIDTH;
var init_comfyui_image_adapter = __esm({
  "OpenMAIC/lib/media/adapters/comfyui-image-adapter.ts"() {
    "use strict";
    init_image_providers();
    COMPONENT = "ComfyUI Image";
    log4 = {
      info: (msg) => console.log(`[${(/* @__PURE__ */ new Date()).toISOString()}] [INFO]  [${COMPONENT}] ${msg}`),
      warn: (msg) => console.warn(`[${(/* @__PURE__ */ new Date()).toISOString()}] [WARN]  [${COMPONENT}] ${msg}`),
      error: (msg) => console.error(`[${(/* @__PURE__ */ new Date()).toISOString()}] [ERROR] [${COMPONENT}] ${msg}`),
      debug: (msg) => console.debug(`[${(/* @__PURE__ */ new Date()).toISOString()}] [DEBUG] [${COMPONENT}] ${msg}`)
    };
    DEFAULT_BASE_URL6 = "http://localhost:8188";
    DEFAULT_WORKFLOW_FILENAME = "comfyui-workflow.json";
    DEFAULT_WORKFLOW_PUBLIC_PATH = `/${DEFAULT_WORKFLOW_FILENAME}`;
    POLL_INTERVAL_MS = 1500;
    GENERATION_TIMEOUT_MS = 3e5;
    FETCH_TIMEOUT_MS = 3e4;
    DEFAULT_MAX_WIDTH = 1024;
  }
});

// OpenMAIC/lib/media/adapters/lemonade-image-adapter.ts
function normalizeBaseUrl2(baseUrl) {
  return (baseUrl || DEFAULT_BASE_URL7).replace(/\/$/, "");
}
function authHeaders(apiKey) {
  const key2 = apiKey?.trim();
  return key2 ? { Authorization: `Bearer ${key2}` } : {};
}
function resolveSize2(options4) {
  return `${options4.width || 1024}x${options4.height || 1024}`;
}
async function generateWithLemonadeImage(config, options4) {
  const baseUrl = normalizeBaseUrl2(config.baseUrl);
  const width = options4.width || 1024;
  const height = options4.height || 1024;
  const response = await fetch(`${baseUrl}/images/generations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(config.apiKey)
    },
    body: JSON.stringify({
      model: requireModel(config.model, "Lemonade Image"),
      prompt: options4.prompt,
      n: 1,
      size: resolveSize2(options4),
      response_format: "b64_json"
    })
  });
  if (!response.ok) {
    const text = await response.text().catch(() => response.statusText);
    throw new Error(`Lemonade image generation failed (${response.status}): ${text}`);
  }
  const data = await response.json();
  const imageData = data.data?.[0];
  if (!imageData?.url && !imageData?.b64_json) {
    throw new Error("Lemonade returned empty image response");
  }
  return {
    url: imageData.url,
    base64: imageData.b64_json,
    width,
    height
  };
}
var DEFAULT_BASE_URL7;
var init_lemonade_image_adapter = __esm({
  "OpenMAIC/lib/media/adapters/lemonade-image-adapter.ts"() {
    "use strict";
    init_require_model();
    DEFAULT_BASE_URL7 = "http://localhost:13305/v1";
  }
});

// OpenMAIC/lib/media/image-providers.ts
async function generateImage(config, options4) {
  switch (config.providerId) {
    case "seedream":
      return generateWithSeedream(config, options4);
    case "openai-image":
      return generateWithOpenAIImage(config, options4);
    case "qwen-image":
      return generateWithQwenImage(config, options4);
    case "nano-banana":
      return generateWithNanoBanana(config, options4);
    case "minimax-image":
      return generateWithMiniMaxImage(config, options4);
    case "grok-image":
      return generateWithGrokImage(config, options4);
    case "comfyui-image":
      return generateWithComfyuiImage(config, options4);
    case "lemonade":
      return generateWithLemonadeImage(config, options4);
    default:
      throw new Error(`Unsupported image provider: ${config.providerId}`);
  }
}
function aspectRatioToDimensions(ratio, maxWidth = 1024) {
  const [w, h] = ratio.split(":").map(Number);
  if (!w || !h) return { width: maxWidth, height: Math.round(maxWidth * 9 / 16) };
  return { width: maxWidth, height: Math.round(maxWidth * h / w) };
}
function applyMinPixelFloor(width, height, minPixels) {
  if (!(minPixels > 0) || width <= 0 || height <= 0) return { width, height };
  const area = width * height;
  if (area >= minPixels) return { width, height };
  const scale = Math.sqrt(minPixels / area);
  return {
    width: Math.ceil(width * scale / 8) * 8,
    height: Math.ceil(height * scale / 8) * 8
  };
}
var IMAGE_PROVIDERS;
var init_image_providers = __esm({
  "OpenMAIC/lib/media/image-providers.ts"() {
    "use strict";
    init_seedream_adapter();
    init_openai_image_adapter();
    init_qwen_image_adapter();
    init_nano_banana_adapter();
    init_minimax_image_adapter();
    init_grok_image_adapter();
    init_comfyui_image_adapter();
    init_lemonade_image_adapter();
    IMAGE_PROVIDERS = {
      seedream: {
        id: "seedream",
        name: "Seedream",
        requiresApiKey: true,
        defaultBaseUrl: "https://ark.cn-beijing.volces.com",
        models: [
          { id: "doubao-seedream-5-0-260128", name: "Seedream 5.0 Lite" },
          { id: "doubao-seedream-5-0-lite-260128", name: "Seedream 5.0 Lite (Alias)" },
          { id: "doubao-seedream-4-5-251128", name: "Seedream 4.5" },
          { id: "doubao-seedream-4-0-250828", name: "Seedream 4.0" },
          { id: "doubao-seedream-3-0-t2i-250415", name: "Seedream 3.0" }
        ],
        supportedAspectRatios: ["16:9", "4:3", "1:1", "9:16"]
      },
      "openai-image": {
        id: "openai-image",
        name: "OpenAI Image",
        requiresApiKey: true,
        defaultBaseUrl: "https://api.openai.com/v1",
        models: [
          { id: "gpt-image-2", name: "GPT Image 2" },
          { id: "gpt-image-2-2026-04-21", name: "GPT Image 2 (2026-04-21)" },
          { id: "gpt-image-1.5", name: "GPT Image 1.5" },
          { id: "gpt-image-1", name: "GPT Image 1" },
          { id: "gpt-image-1-mini", name: "GPT Image 1 Mini" },
          { id: "chatgpt-image-latest", name: "ChatGPT Image Latest" }
        ],
        supportedAspectRatios: ["16:9", "4:3", "1:1", "9:16"]
      },
      "qwen-image": {
        id: "qwen-image",
        name: "Qwen Image",
        requiresApiKey: true,
        defaultBaseUrl: "https://dashscope.aliyuncs.com",
        models: [
          { id: "qwen-image-2.0-pro", name: "Qwen Image 2.0 Pro" },
          { id: "qwen-image-2.0-pro-2026-03-03", name: "Qwen Image 2.0 Pro (2026-03-03)" },
          { id: "qwen-image-2.0", name: "Qwen Image 2.0" },
          { id: "qwen-image-2.0-2026-03-03", name: "Qwen Image 2.0 (2026-03-03)" },
          { id: "qwen-image-max", name: "Qwen Image Max" },
          { id: "qwen-image-max-2025-12-30", name: "Qwen Image Max (2025-12-30)" },
          { id: "qwen-image-plus", name: "Qwen Image Plus" },
          {
            id: "qwen-image-plus-2026-01-09",
            name: "Qwen Image Plus (2026-01-09)"
          },
          { id: "qwen-image", name: "Qwen Image" },
          { id: "z-image-turbo", name: "Z-Image Turbo" }
        ],
        supportedAspectRatios: ["16:9", "4:3", "1:1", "9:16"]
      },
      "nano-banana": {
        id: "nano-banana",
        name: "Nano Banana (Gemini)",
        requiresApiKey: true,
        defaultBaseUrl: "https://generativelanguage.googleapis.com",
        models: [
          {
            id: "gemini-3.1-flash-image-preview",
            name: "Gemini 3.1 Flash Image (Nano Banana 2)"
          },
          {
            id: "gemini-3-pro-image-preview",
            name: "Gemini 3 Pro Image (Nano Banana Pro)"
          },
          {
            id: "gemini-2.5-flash-image",
            name: "Gemini 2.5 Flash Image (Nano Banana)"
          }
        ],
        supportedAspectRatios: ["16:9", "4:3", "1:1"]
      },
      "minimax-image": {
        id: "minimax-image",
        name: "MiniMax Image",
        requiresApiKey: true,
        defaultBaseUrl: "https://api.minimaxi.com",
        models: [
          { id: "image-01", name: "Image 01" },
          { id: "image-01-live", name: "Image 01 Live" }
        ],
        supportedAspectRatios: ["16:9", "4:3", "1:1", "9:16"]
      },
      "grok-image": {
        id: "grok-image",
        name: "Grok Image (xAI)",
        requiresApiKey: true,
        defaultBaseUrl: "https://api.x.ai/v1",
        models: [
          { id: "grok-imagine-image", name: "Grok Imagine Image" },
          { id: "grok-imagine-image-pro", name: "Grok Imagine Image Pro" }
        ],
        supportedAspectRatios: ["16:9", "4:3", "1:1", "9:16"]
      },
      "comfyui-image": {
        id: "comfyui-image",
        name: "ComfyUI Image",
        requiresApiKey: false,
        defaultBaseUrl: "http://localhost:8188",
        // No static models here — real selectable workflows are discovered at
        // runtime from GET /api/comfyui-workflows (files in public/) and picked
        // in Settings. A placeholder id like "comfyui-image" doesn't correspond
        // to any real workflow file, so resolveSelectedModel() would resolve it
        // to a dead path the first time this provider became active (#P2).
        // With models: [], imageModelId resolves to '' when this provider is
        // selected with no workflow chosen yet. In that case (and on the
        // autonomous classroom-media path, which has no model id to pass) the
        // adapter's loadWorkflow() defaults to the first workflow file discovered
        // in public/ via listComfyuiWorkflowFilenames() — not a hard-coded
        // filename, since no particular workflow name is guaranteed to exist.
        models: [],
        supportedAspectRatios: ["16:9", "4:3", "1:1", "9:16"],
        maxResolution: { width: 1920, height: 1920 }
      },
      lemonade: {
        id: "lemonade",
        name: "Lemonade",
        requiresApiKey: false,
        defaultBaseUrl: "http://localhost:13305/v1",
        icon: "/logos/lemonade.svg",
        models: [
          { id: "Qwen-Image-GGUF", name: "Qwen Image GGUF" },
          { id: "sd-cpp", name: "Stable Diffusion (sd-cpp)" }
        ],
        supportedAspectRatios: ["16:9", "4:3", "1:1", "9:16"],
        maxResolution: { width: 1024, height: 1024 }
      }
    };
  }
});

// OpenMAIC/lib/media/polled-task.ts
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function runPolledTask({
  submit,
  poll,
  intervalMs,
  maxAttempts,
  label,
  formatTimeout
}) {
  const submitted = await submit();
  if (submitted.status === "done") return submitted.result;
  if (submitted.status === "failed") throw new Error(submitted.message);
  let attempts = 0;
  let lastPendingDetail;
  while (attempts < maxAttempts) {
    await delay(intervalMs);
    const result = await poll(submitted.taskId);
    attempts++;
    if (result.status === "done") return result.result;
    if (result.status === "failed") throw new Error(result.message);
    lastPendingDetail = result.detail;
  }
  const timeoutContext = {
    label,
    taskId: submitted.taskId,
    attempts,
    intervalMs,
    elapsedMs: attempts * intervalMs,
    lastPendingDetail
  };
  const message = formatTimeout ? formatTimeout(timeoutContext) : `${label} timed out after ${attempts} polls`;
  throw new Error(message);
}
var init_polled_task = __esm({
  "OpenMAIC/lib/media/polled-task.ts"() {
    "use strict";
  }
});

// OpenMAIC/lib/media/adapters/seedance-adapter.ts
function resolveArkRoot2(baseUrl) {
  const trimmed = baseUrl.replace(/\/+$/, "");
  return /\/api\//.test(trimmed) ? trimmed : `${trimmed}/api/v3`;
}
function toSeedanceRatio(aspectRatio) {
  if (!aspectRatio) return void 0;
  return aspectRatio;
}
function toSeedanceResolution(resolution) {
  if (!resolution) return void 0;
  return resolution;
}
function estimateDimensions(ratio, resolution) {
  const resMap = {
    "480p": 480,
    "720p": 720,
    "1080p": 1080
  };
  const h = resMap[resolution || "720p"] || 720;
  if (!ratio) return { width: Math.round(h * 16 / 9), height: h };
  const [w, hRatio] = ratio.split(":").map(Number);
  if (!w || !hRatio) return { width: Math.round(h * 16 / 9), height: h };
  return { width: Math.round(h * w / hRatio), height: h };
}
async function submitSeedanceTask(config, options4) {
  const baseUrl = config.baseUrl || DEFAULT_BASE_URL8;
  const body = {
    model: requireModel(config.model, "Seedance"),
    content: [
      {
        type: "text",
        text: options4.prompt
      }
    ],
    watermark: false
  };
  const ratio = toSeedanceRatio(options4.aspectRatio);
  if (ratio) body.ratio = ratio;
  if (options4.duration) body.duration = options4.duration;
  const resolution = toSeedanceResolution(options4.resolution);
  if (resolution) body.resolution = resolution;
  const response = await fetch(`${resolveArkRoot2(baseUrl)}/contents/generations/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`
    },
    body: JSON.stringify(body)
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Seedance task submission failed (${response.status}): ${text}`);
  }
  const data = await response.json();
  if (!data.id) {
    throw new Error("Seedance returned empty task ID");
  }
  return data.id;
}
async function pollSeedanceTask(config, taskId) {
  const baseUrl = config.baseUrl || DEFAULT_BASE_URL8;
  const response = await fetch(`${resolveArkRoot2(baseUrl)}/contents/generations/tasks/${taskId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${config.apiKey}`
    }
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Seedance poll failed (${response.status}): ${text}`);
  }
  const data = await response.json();
  if (data.status === "succeeded") {
    if (!data.content?.video_url) {
      throw new Error("Seedance task succeeded but no video URL returned");
    }
    const dims = estimateDimensions(data.ratio, data.resolution);
    return {
      url: data.content.video_url,
      duration: data.duration || 5,
      width: dims.width,
      height: dims.height
    };
  }
  if (data.status === "failed") {
    throw new Error(`Seedance video generation failed: ${data.error?.message || "Unknown error"}`);
  }
  return null;
}
async function generateWithSeedance(config, options4) {
  return runPolledTask({
    submit: async () => ({
      status: "submitted",
      taskId: await submitSeedanceTask(config, options4)
    }),
    poll: async (taskId) => {
      const result = await pollSeedanceTask(config, taskId);
      return result ? { status: "done", result } : { status: "pending" };
    },
    intervalMs: POLL_INTERVAL_MS2,
    maxAttempts: MAX_POLL_ATTEMPTS,
    label: "Seedance video generation",
    formatTimeout: ({ taskId, elapsedMs }) => `Seedance video generation timed out after ${elapsedMs / 1e3}s (task: ${taskId})`
  });
}
var DEFAULT_BASE_URL8, POLL_INTERVAL_MS2, MAX_POLL_ATTEMPTS;
var init_seedance_adapter = __esm({
  "OpenMAIC/lib/media/adapters/seedance-adapter.ts"() {
    "use strict";
    init_probe_auth();
    init_polled_task();
    init_require_model();
    DEFAULT_BASE_URL8 = "https://ark.cn-beijing.volces.com";
    POLL_INTERVAL_MS2 = 5e3;
    MAX_POLL_ATTEMPTS = 60;
  }
});

// OpenMAIC/lib/media/adapters/kling-adapter.ts
import crypto2 from "crypto";
function base64url(data) {
  const buf = Buffer.isBuffer(data) ? data : Buffer.from(data, "utf-8");
  return buf.toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}
function generateJWT(accessKey, secretKey) {
  const now = Math.floor(Date.now() / 1e3);
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = base64url(
    JSON.stringify({
      iss: accessKey,
      exp: now + JWT_EXPIRY_SECS,
      nbf: now - 5,
      iat: now
    })
  );
  const signature = base64url(
    crypto2.createHmac("sha256", secretKey).update(`${header}.${payload}`).digest()
  );
  return `${header}.${payload}.${signature}`;
}
function parseApiKey(apiKey) {
  const sep = apiKey.indexOf(":");
  if (sep <= 0) {
    throw new Error('Kling apiKey must be "accessKey:secretKey" format');
  }
  return {
    accessKey: apiKey.slice(0, sep),
    secretKey: apiKey.slice(sep + 1)
  };
}
function getDimensions(aspectRatio) {
  switch (aspectRatio) {
    case "9:16":
      return { width: 720, height: 1280 };
    case "1:1":
      return { width: 1080, height: 1080 };
    case "4:3":
      return { width: 1024, height: 768 };
    default:
      return { width: 1280, height: 720 };
  }
}
async function submitTask(baseUrl, token, model, options4) {
  const body = {
    model_name: model,
    prompt: options4.prompt,
    negative_prompt: "",
    mode: "pro"
  };
  if (options4.duration) body.duration = String(options4.duration);
  if (options4.aspectRatio) body.aspect_ratio = options4.aspectRatio;
  const response = await fetch(`${baseUrl}/v1/videos/text2video`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(body)
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Kling submit failed (${response.status}): ${text}`);
  }
  const data = await response.json();
  if (data.code !== 0) {
    throw new Error(`Kling submit error ${data.code}: ${data.message}`);
  }
  if (!data.data?.task_id) {
    throw new Error("Kling returned empty task_id");
  }
  return data.data.task_id;
}
async function pollTask(baseUrl, token, taskId) {
  const response = await fetch(`${baseUrl}/v1/videos/text2video/${taskId}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Kling poll failed (${response.status}): ${text}`);
  }
  const data = await response.json();
  if (data.code !== 0) {
    throw new Error(`Kling poll error ${data.code}: ${data.message}`);
  }
  return data.data;
}
async function generateWithKling(config, options4) {
  const model = requireModel(config.model, "Kling");
  const baseUrl = config.baseUrl || DEFAULT_BASE_URL9;
  const { accessKey, secretKey } = parseApiKey(config.apiKey);
  const token = generateJWT(accessKey, secretKey);
  return runPolledTask({
    submit: async () => ({
      status: "submitted",
      taskId: await submitTask(baseUrl, token, model, options4)
    }),
    poll: async (taskId) => {
      const result = await pollTask(baseUrl, token, taskId);
      if (result.task_status === "succeed") {
        const video = result.task_result?.videos?.[0];
        if (!video?.url) {
          throw new Error("Kling task succeeded but no video URL returned");
        }
        const { width, height } = getDimensions(options4.aspectRatio);
        return {
          status: "done",
          result: {
            url: video.url,
            duration: Number(video.duration) || options4.duration || 5,
            width,
            height
          }
        };
      }
      if (result.task_status === "failed") {
        return {
          status: "failed",
          message: `Kling video generation failed: ${result.task_status_msg || "Unknown error"}`
        };
      }
      return { status: "pending" };
    },
    intervalMs: POLL_INTERVAL_MS3,
    maxAttempts: MAX_POLL_ATTEMPTS2,
    label: "Kling video generation",
    formatTimeout: ({ taskId, elapsedMs }) => `Kling video generation timed out after ${elapsedMs / 1e3}s (task: ${taskId})`
  });
}
var DEFAULT_BASE_URL9, POLL_INTERVAL_MS3, MAX_POLL_ATTEMPTS2, JWT_EXPIRY_SECS;
var init_kling_adapter = __esm({
  "OpenMAIC/lib/media/adapters/kling-adapter.ts"() {
    "use strict";
    init_probe_auth();
    init_polled_task();
    init_require_model();
    DEFAULT_BASE_URL9 = "https://api-beijing.klingai.com";
    POLL_INTERVAL_MS3 = 5e3;
    MAX_POLL_ATTEMPTS2 = 120;
    JWT_EXPIRY_SECS = 1800;
  }
});

// OpenMAIC/lib/media/adapters/veo-adapter.ts
function getDimensions2(aspectRatio) {
  switch (aspectRatio) {
    case "9:16":
      return { width: 720, height: 1280 };
    case "1:1":
      return { width: 1080, height: 1080 };
    case "4:3":
      return { width: 1024, height: 768 };
    default:
      return { width: 1280, height: 720 };
  }
}
function apiHeaders(apiKey) {
  return {
    "Content-Type": "application/json",
    "x-goog-api-key": apiKey
  };
}
function resolveCompletedOperation(operation, options4) {
  if (operation.error) {
    return {
      status: "failed",
      message: `Veo generation failed: ${operation.error.code} - ${operation.error.message}`
    };
  }
  const videos = operation.response?.videos;
  if (!videos || videos.length === 0) {
    throw new Error("Veo returned no generated videos");
  }
  const first = videos[0];
  if (!first.bytesBase64Encoded) {
    throw new Error("Veo returned video entry without data");
  }
  const mimeType = first.mimeType || "video/mp4";
  const { width, height } = getDimensions2(options4.aspectRatio);
  return {
    status: "done",
    result: {
      url: `data:${mimeType};base64,${first.bytesBase64Encoded}`,
      duration: options4.duration || 8,
      width,
      height
    }
  };
}
async function submitVideoGeneration(baseUrl, apiKey, model, options4) {
  const url = `${baseUrl}/v1beta/models/${model}:predictLongRunning`;
  const body = {
    instances: [{ prompt: options4.prompt }]
  };
  const parameters = {};
  if (options4.aspectRatio) parameters.aspectRatio = options4.aspectRatio;
  if (options4.duration) parameters.durationSeconds = options4.duration;
  if (Object.keys(parameters).length > 0) {
    body.parameters = parameters;
  }
  const response = await fetch(url, {
    method: "POST",
    headers: apiHeaders(apiKey),
    body: JSON.stringify(body)
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Veo submit failed (${response.status}): ${text}`);
  }
  return response.json();
}
async function pollOperation(baseUrl, apiKey, model, operationName) {
  const url = `${baseUrl}/v1beta/models/${model}:fetchPredictOperation`;
  const response = await fetch(url, {
    method: "POST",
    headers: apiHeaders(apiKey),
    body: JSON.stringify({ operationName })
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Veo poll failed (${response.status}): ${text}`);
  }
  return response.json();
}
async function generateWithVeo(config, options4) {
  const model = requireModel(config.model, "Veo");
  const baseUrl = config.baseUrl || DEFAULT_BASE_URL10;
  return runPolledTask({
    submit: async () => {
      const operation = await submitVideoGeneration(baseUrl, config.apiKey, model, options4);
      if (!operation.name) {
        throw new Error("Veo returned operation without name");
      }
      return operation.done ? resolveCompletedOperation(operation, options4) : { status: "submitted", taskId: operation.name };
    },
    poll: async (operationName) => {
      const operation = await pollOperation(baseUrl, config.apiKey, model, operationName);
      return operation.done ? resolveCompletedOperation(operation, options4) : { status: "pending" };
    },
    intervalMs: POLL_INTERVAL_MS4,
    maxAttempts: MAX_POLL_ATTEMPTS3,
    label: "Veo video generation",
    formatTimeout: () => "Veo video generation timed out after 10 minutes"
  });
}
var DEFAULT_BASE_URL10, POLL_INTERVAL_MS4, MAX_POLL_ATTEMPTS3;
var init_veo_adapter = __esm({
  "OpenMAIC/lib/media/adapters/veo-adapter.ts"() {
    "use strict";
    init_polled_task();
    init_require_model();
    DEFAULT_BASE_URL10 = "https://generativelanguage.googleapis.com";
    POLL_INTERVAL_MS4 = 1e4;
    MAX_POLL_ATTEMPTS3 = 60;
  }
});

// OpenMAIC/lib/media/adapters/minimax-video-adapter.ts
async function submitTask2(config, options4) {
  const baseUrl = (config.baseUrl || BASE_URL2).replace(/\/$/, "");
  const model = requireModel(config.model, "MiniMax Video");
  const duration = options4.duration || 6;
  const resolutionMap = {
    "720p": "768P",
    "1080p": "1080P"
  };
  const resolution = resolutionMap[options4.resolution || ""] || "768P";
  const response = await fetch(`${baseUrl}/v1/video_generation`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json; charset=utf-8"
    },
    body: JSON.stringify({
      model,
      prompt: options4.prompt,
      duration,
      resolution,
      prompt_optimizer: false
    })
  });
  if (!response.ok) {
    const errText = await response.text().catch(() => response.statusText);
    throw new Error(`MiniMax Video submit error: ${errText}`);
  }
  const data = await response.json();
  if (data.base_resp?.status_code !== 0) {
    const code = data.base_resp?.status_code;
    const msg = data.base_resp?.status_msg || "unknown error";
    throw new Error(`MiniMax Video API error ${code}: ${msg}`);
  }
  if (!data.task_id) {
    throw new Error(`MiniMax Video: no task_id returned. Response: ${JSON.stringify(data)}`);
  }
  return data.task_id;
}
async function pollTaskStatus(config, taskId) {
  const baseUrl = (config.baseUrl || BASE_URL2).replace(/\/$/, "");
  const url = `${baseUrl}/v1/query/video_generation?task_id=${encodeURIComponent(taskId)}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${config.apiKey}`
    }
  });
  if (!response.ok) {
    const errText = await response.text().catch(() => response.statusText);
    throw new Error(`MiniMax Video poll error: ${errText}`);
  }
  return response.json();
}
async function retrieveFileDownloadUrl(config, fileId) {
  const baseUrl = (config.baseUrl || BASE_URL2).replace(/\/$/, "");
  const url = `${baseUrl}/v1/files/retrieve?file_id=${encodeURIComponent(fileId)}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${config.apiKey}`
    }
  });
  if (!response.ok) {
    const errText = await response.text().catch(() => response.statusText);
    throw new Error(`MiniMax Video file retrieve error: ${errText}`);
  }
  const data = await response.json();
  if (data.base_resp?.status_code !== 0) {
    const code = data.base_resp?.status_code;
    const msg = data.base_resp?.status_msg || "unknown error";
    throw new Error(`MiniMax Video file retrieve error ${code}: ${msg}`);
  }
  const downloadUrl = data.file?.download_url;
  if (!downloadUrl) {
    throw new Error(`MiniMax Video: no download_url returned. Response: ${JSON.stringify(data)}`);
  }
  return downloadUrl;
}
async function generateWithMiniMaxVideo(config, options4) {
  return runPolledTask({
    submit: async () => ({
      status: "submitted",
      taskId: await submitTask2(config, options4)
    }),
    poll: async (taskId) => {
      const result = await pollTaskStatus(config, taskId);
      if (result.status === "Success") {
        if (!result.file_id) {
          throw new Error(`MiniMax Video: task succeeded but no file_id returned`);
        }
        return {
          status: "done",
          result: {
            url: await retrieveFileDownloadUrl(config, result.file_id),
            width: result.video_width || 1920,
            height: result.video_height || 1080,
            duration: options4.duration || 6
          }
        };
      }
      if (result.status === "Fail") {
        return {
          status: "failed",
          message: `MiniMax Video generation failed: ${result.base_resp?.status_msg || "unknown"}`
        };
      }
      return { status: "pending", detail: result.status };
    },
    intervalMs: POLL_INTERVAL_MS5,
    maxAttempts: MAX_POLL_ATTEMPTS4,
    label: "MiniMax Video",
    formatTimeout: ({ attempts, lastPendingDetail }) => `MiniMax Video: timeout after ${attempts} polls, last status: ${lastPendingDetail ?? ""}`
  });
}
var BASE_URL2, POLL_INTERVAL_MS5, MAX_POLL_ATTEMPTS4;
var init_minimax_video_adapter = __esm({
  "OpenMAIC/lib/media/adapters/minimax-video-adapter.ts"() {
    "use strict";
    init_polled_task();
    init_require_model();
    BASE_URL2 = "https://api.minimaxi.com";
    POLL_INTERVAL_MS5 = 5e3;
    MAX_POLL_ATTEMPTS4 = 120;
  }
});

// OpenMAIC/lib/media/adapters/grok-video-adapter.ts
function getDimensions3(aspectRatio) {
  switch (aspectRatio) {
    case "9:16":
      return { width: 720, height: 1280 };
    case "1:1":
      return { width: 1080, height: 1080 };
    case "4:3":
      return { width: 1024, height: 768 };
    default:
      return { width: 1280, height: 720 };
  }
}
function apiHeaders2(apiKey) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`
  };
}
async function submitVideoGeneration2(baseUrl, apiKey, model, options4) {
  const body = {
    model,
    prompt: options4.prompt
  };
  if (options4.duration) body.duration = options4.duration;
  const response = await fetch(`${baseUrl}/videos/generations`, {
    method: "POST",
    headers: apiHeaders2(apiKey),
    body: JSON.stringify(body)
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Grok video submit failed (${response.status}): ${text}`);
  }
  const data = await response.json();
  if (!data.request_id) {
    throw new Error("Grok video returned empty request_id");
  }
  return data.request_id;
}
async function pollVideoStatus(baseUrl, apiKey, requestId) {
  const response = await fetch(`${baseUrl}/videos/${requestId}`, {
    method: "GET",
    headers: apiHeaders2(apiKey)
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Grok video poll failed (${response.status}): ${text}`);
  }
  return response.json();
}
async function generateWithGrokVideo(config, options4) {
  const model = requireModel(config.model, "Grok Video");
  const baseUrl = config.baseUrl || DEFAULT_BASE_URL11;
  return runPolledTask({
    submit: async () => ({
      status: "submitted",
      taskId: await submitVideoGeneration2(baseUrl, config.apiKey, model, options4)
    }),
    poll: async (requestId) => {
      const result = await pollVideoStatus(baseUrl, config.apiKey, requestId);
      if (result.status === "done") {
        if (!result.video?.url) {
          throw new Error("Grok video task completed but no video URL returned");
        }
        const { width, height } = getDimensions3(options4.aspectRatio);
        return {
          status: "done",
          result: {
            url: result.video.url,
            duration: result.video.duration || options4.duration || 6,
            width,
            height
          }
        };
      }
      if (result.status === "failed") {
        return {
          status: "failed",
          message: `Grok video generation failed: ${JSON.stringify(result)}`
        };
      }
      return { status: "pending" };
    },
    intervalMs: POLL_INTERVAL_MS6,
    maxAttempts: MAX_POLL_ATTEMPTS5,
    label: "Grok video generation",
    formatTimeout: ({ taskId, elapsedMs }) => `Grok video generation timed out after ${elapsedMs / 1e3}s (request: ${taskId})`
  });
}
var DEFAULT_BASE_URL11, POLL_INTERVAL_MS6, MAX_POLL_ATTEMPTS5;
var init_grok_video_adapter = __esm({
  "OpenMAIC/lib/media/adapters/grok-video-adapter.ts"() {
    "use strict";
    init_probe_auth();
    init_polled_task();
    init_require_model();
    DEFAULT_BASE_URL11 = "https://api.x.ai/v1";
    POLL_INTERVAL_MS6 = 1e4;
    MAX_POLL_ATTEMPTS5 = 60;
  }
});

// OpenMAIC/lib/media/adapters/happyhorse-adapter.ts
function normalizeBaseUrl3(baseUrl) {
  return (baseUrl || DEFAULT_BASE_URL12).replace(/\/$/, "");
}
function authHeaders2(apiKey) {
  return {
    Authorization: `Bearer ${apiKey}`
  };
}
function jsonHeaders(apiKey) {
  return {
    ...authHeaders2(apiKey),
    "Content-Type": "application/json"
  };
}
function toHappyHorseResolution(resolution) {
  return resolution === "1080p" ? "1080P" : "720P";
}
function estimateDimensions2(ratio, resolution) {
  const height = resolution || 720;
  const [widthRatio, heightRatio] = (ratio || "16:9").split(":").map(Number);
  if (!widthRatio || !heightRatio) return { width: Math.round(height * 16 / 9), height };
  return { width: Math.round(height * widthRatio / heightRatio), height };
}
function getErrorMessage(data) {
  const code = data.output?.code || data.code;
  const message = data.output?.message || data.message || "Unknown error";
  return code ? `${code}: ${message}` : message;
}
async function submitHappyHorseTask(config, options4) {
  const baseUrl = normalizeBaseUrl3(config.baseUrl);
  const response = await fetch(`${baseUrl}/api/v1/services/aigc/video-generation/video-synthesis`, {
    method: "POST",
    headers: {
      ...jsonHeaders(config.apiKey),
      "X-DashScope-Async": "enable"
    },
    body: JSON.stringify({
      model: requireModel(config.model, "HappyHorse"),
      input: {
        prompt: options4.prompt
      },
      parameters: {
        resolution: toHappyHorseResolution(options4.resolution),
        ratio: options4.aspectRatio || "16:9",
        duration: options4.duration || 5,
        watermark: false
      }
    })
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HappyHorse task submission failed (${response.status}): ${text}`);
  }
  const data = await response.json();
  if (data.code || data.message) {
    throw new Error(`HappyHorse task submission failed: ${getErrorMessage(data)}`);
  }
  if (!data.output?.task_id) {
    throw new Error(`HappyHorse returned empty task ID. Response: ${JSON.stringify(data)}`);
  }
  return data.output.task_id;
}
async function pollHappyHorseTask(config, taskId) {
  const baseUrl = normalizeBaseUrl3(config.baseUrl);
  const response = await fetch(`${baseUrl}/api/v1/tasks/${encodeURIComponent(taskId)}`, {
    method: "GET",
    headers: authHeaders2(config.apiKey)
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HappyHorse poll failed (${response.status}): ${text}`);
  }
  const data = await response.json();
  const status = data.output?.task_status;
  if (status === "SUCCEEDED") {
    if (!data.output?.video_url) {
      throw new Error("HappyHorse task succeeded but no video URL returned");
    }
    const dimensions = estimateDimensions2(data.usage?.ratio, data.usage?.SR);
    return {
      url: data.output.video_url,
      duration: data.usage?.duration || 5,
      width: dimensions.width,
      height: dimensions.height
    };
  }
  if (status === "FAILED" || status === "CANCELED" || status === "UNKNOWN") {
    throw new Error(`HappyHorse video generation failed: ${getErrorMessage(data)}`);
  }
  return null;
}
async function generateWithHappyHorse(config, options4) {
  return runPolledTask({
    submit: async () => ({
      status: "submitted",
      taskId: await submitHappyHorseTask(config, options4)
    }),
    poll: async (taskId) => {
      const result = await pollHappyHorseTask(config, taskId);
      return result ? { status: "done", result } : { status: "pending" };
    },
    intervalMs: POLL_INTERVAL_MS7,
    maxAttempts: MAX_POLL_ATTEMPTS6,
    label: "HappyHorse video generation",
    formatTimeout: ({ taskId, elapsedMs }) => `HappyHorse video generation timed out after ${elapsedMs / 1e3}s (task: ${taskId})`
  });
}
var DEFAULT_BASE_URL12, POLL_INTERVAL_MS7, MAX_POLL_ATTEMPTS6;
var init_happyhorse_adapter = __esm({
  "OpenMAIC/lib/media/adapters/happyhorse-adapter.ts"() {
    "use strict";
    init_probe_auth();
    init_polled_task();
    init_require_model();
    DEFAULT_BASE_URL12 = "https://dashscope.aliyuncs.com";
    POLL_INTERVAL_MS7 = 15e3;
    MAX_POLL_ATTEMPTS6 = 40;
  }
});

// OpenMAIC/lib/media/video-providers.ts
function normalizeVideoOptions(providerId, options4) {
  const provider = VIDEO_PROVIDERS[providerId];
  if (!provider) return options4;
  const normalized = { ...options4 };
  if (provider.supportedDurations && provider.supportedDurations.length > 0) {
    if (!normalized.duration || !provider.supportedDurations.includes(normalized.duration)) {
      normalized.duration = provider.supportedDurations[0];
    }
  }
  if (provider.supportedAspectRatios && provider.supportedAspectRatios.length > 0) {
    if (!normalized.aspectRatio || !provider.supportedAspectRatios.includes(normalized.aspectRatio)) {
      normalized.aspectRatio = provider.supportedAspectRatios[0];
    }
  }
  if (provider.supportedResolutions && provider.supportedResolutions.length > 0) {
    if (!normalized.resolution || !provider.supportedResolutions.includes(normalized.resolution)) {
      normalized.resolution = provider.supportedResolutions[0];
    }
  }
  return normalized;
}
async function generateVideo(config, options4) {
  switch (config.providerId) {
    case "seedance":
      return generateWithSeedance(config, options4);
    case "kling":
      return generateWithKling(config, options4);
    case "veo":
      return generateWithVeo(config, options4);
    case "minimax-video":
      return generateWithMiniMaxVideo(config, options4);
    case "grok-video":
      return generateWithGrokVideo(config, options4);
    case "happyhorse":
      return generateWithHappyHorse(config, options4);
    default:
      throw new Error(`Unsupported video provider: ${config.providerId}`);
  }
}
var VIDEO_PROVIDERS;
var init_video_providers = __esm({
  "OpenMAIC/lib/media/video-providers.ts"() {
    "use strict";
    init_seedance_adapter();
    init_kling_adapter();
    init_veo_adapter();
    init_minimax_video_adapter();
    init_grok_video_adapter();
    init_happyhorse_adapter();
    VIDEO_PROVIDERS = {
      seedance: {
        id: "seedance",
        name: "Seedance",
        requiresApiKey: true,
        defaultBaseUrl: "https://ark.cn-beijing.volces.com",
        models: [
          { id: "doubao-seedance-2-0-260128", name: "Seedance 2.0" },
          {
            id: "doubao-seedance-2-0-fast-260128",
            name: "Seedance 2.0 Fast"
          },
          {
            id: "doubao-seedance-2-0-mini-260615",
            name: "Seedance 2.0 Mini"
          },
          { id: "doubao-seedance-1-5-pro-251215", name: "Seedance 1.5 Pro" },
          { id: "doubao-seedance-1-0-pro-250528", name: "Seedance 1.0 Pro" },
          {
            id: "doubao-seedance-1-0-pro-fast-251015",
            name: "Seedance 1.0 Pro Fast"
          },
          {
            id: "doubao-seedance-1-0-lite-t2v-250428",
            name: "Seedance 1.0 Lite T2V"
          }
        ],
        supportedAspectRatios: ["16:9", "4:3", "1:1", "9:16", "3:4", "21:9"],
        supportedDurations: [5, 10],
        supportedResolutions: ["480p", "720p", "1080p"],
        maxDuration: 10
      },
      kling: {
        id: "kling",
        name: "Kling",
        requiresApiKey: true,
        defaultBaseUrl: "https://api-beijing.klingai.com",
        models: [
          { id: "kling-v2-6", name: "Kling V2.6" },
          { id: "kling-v1-6", name: "Kling V1.6" }
        ],
        supportedAspectRatios: ["16:9", "1:1", "9:16"],
        supportedDurations: [5, 10],
        maxDuration: 10
      },
      veo: {
        id: "veo",
        name: "Veo",
        requiresApiKey: true,
        defaultBaseUrl: "https://generativelanguage.googleapis.com",
        models: [
          { id: "veo-3.1-fast-generate-001", name: "Veo 3.1 Fast" },
          { id: "veo-3.1-generate-001", name: "Veo 3.1" },
          { id: "veo-3.0-fast-generate-001", name: "Veo 3.0 Fast" },
          { id: "veo-3.0-generate-001", name: "Veo 3.0" },
          { id: "veo-2.0-generate-001", name: "Veo 2.0" }
        ],
        supportedAspectRatios: ["16:9", "1:1", "9:16"],
        supportedDurations: [8],
        supportedResolutions: ["720p"],
        maxDuration: 8
      },
      "minimax-video": {
        id: "minimax-video",
        name: "MiniMax Video",
        requiresApiKey: true,
        defaultBaseUrl: "https://api.minimaxi.com",
        // Hailuo 2.3 Fast requires Image-to-Video with first_frame_image; this
        // provider currently submits Text-to-Video requests only.
        models: [
          { id: "MiniMax-Hailuo-2.3", name: "Hailuo 2.3" },
          { id: "MiniMax-Hailuo-02", name: "Hailuo 02" },
          { id: "T2V-01-Director", name: "T2V-01 Director" },
          { id: "T2V-01", name: "T2V-01" }
        ],
        supportedAspectRatios: ["16:9", "4:3", "1:1", "9:16"],
        supportedDurations: [6, 10],
        supportedResolutions: ["720p", "1080p"],
        maxDuration: 10
      },
      "grok-video": {
        id: "grok-video",
        name: "Grok Video (xAI)",
        requiresApiKey: true,
        defaultBaseUrl: "https://api.x.ai/v1",
        models: [{ id: "grok-imagine-video", name: "Grok Imagine Video" }],
        supportedAspectRatios: ["16:9", "1:1", "9:16"],
        supportedDurations: [6],
        maxDuration: 6
      },
      happyhorse: {
        id: "happyhorse",
        name: "HappyHorse",
        requiresApiKey: true,
        defaultBaseUrl: "https://dashscope.aliyuncs.com",
        models: [{ id: "happyhorse-1.0-t2v", name: "HappyHorse 1.0 T2V" }],
        supportedAspectRatios: ["16:9", "9:16", "1:1", "4:3", "3:4"],
        supportedDurations: [5, 10, 15],
        supportedResolutions: ["720p", "1080p"],
        maxDuration: 15
      }
    };
  }
});

// OpenMAIC/lib/web-search/constants.ts
function isWebSearchConfigUsable(providerId, cfg) {
  if (!cfg) return false;
  if (cfg.serverDisabled) return false;
  if (cfg.isServerConfigured) return true;
  const provider = WEB_SEARCH_PROVIDERS[providerId];
  if (providerId === "searxng") return false;
  const requiresApiKey = cfg.requiresApiKey ?? provider.requiresApiKey;
  if (!requiresApiKey) {
    if (provider.requiresBaseUrl) return !!cfg.baseUrl;
    return true;
  }
  return !!cfg.apiKey;
}
function buildWebSearchFallbackOrder(config) {
  const ids = Object.keys(WEB_SEARCH_PROVIDERS);
  const serverManaged = ids.filter(
    (id) => isWebSearchConfigUsable(id, config[id]) && config[id]?.isServerConfigured
  );
  const clientUsable = ids.filter(
    (id) => isWebSearchConfigUsable(id, config[id]) && !config[id]?.isServerConfigured
  );
  return [...serverManaged, ...clientUsable];
}
var WEB_SEARCH_PROVIDERS, CLAUDE_WEB_SEARCH_DEFAULT_MODEL;
var init_constants3 = __esm({
  "OpenMAIC/lib/web-search/constants.ts"() {
    "use strict";
    WEB_SEARCH_PROVIDERS = {
      tavily: {
        id: "tavily",
        name: "Tavily",
        requiresApiKey: true,
        defaultBaseUrl: "https://api.tavily.com",
        endpointPath: "/search",
        icon: "/logos/tavily.svg"
      },
      exa: {
        id: "exa",
        name: "Exa",
        requiresApiKey: true,
        defaultBaseUrl: "https://api.exa.ai",
        endpointPath: "/search"
      },
      bocha: {
        id: "bocha",
        name: "Bocha",
        requiresApiKey: true,
        defaultBaseUrl: "https://api.bocha.cn",
        endpointPath: "/v1/web-search",
        icon: "/logos/bocha.png"
      },
      brave: {
        id: "brave",
        name: "Brave Search",
        requiresApiKey: false,
        defaultBaseUrl: "https://search.brave.com",
        endpointPath: "/search",
        icon: "/logos/brave.png"
      },
      baidu: {
        id: "baidu",
        name: "Baidu",
        requiresApiKey: true,
        defaultBaseUrl: "https://qianfan.baidubce.com",
        endpointPath: "/v2/ai_search/web_search",
        icon: "/logos/baidu.png"
      },
      claude: {
        id: "claude",
        name: "Claude",
        requiresApiKey: true,
        defaultBaseUrl: "https://api.anthropic.com/v1",
        endpointPath: "/messages",
        icon: "/logos/claude.svg"
      },
      minimax: {
        id: "minimax",
        name: "MiniMax",
        requiresApiKey: true,
        defaultBaseUrl: "https://api.minimaxi.com",
        endpointPath: "/v1/coding_plan/search",
        icon: "/logos/minimax.svg"
      },
      doubao: {
        id: "doubao",
        name: "Doubao",
        requiresApiKey: true,
        // 豆包搜索 Custom 版: the Agent Plan key authenticates directly here
        // (verified). The MCP/Skill path wraps this same REST endpoint.
        defaultBaseUrl: "https://open.feedcoopapi.com",
        endpointPath: "/search_api/web_search",
        icon: "/logos/doubao.svg"
      },
      searxng: {
        id: "searxng",
        name: "SearXNG",
        requiresApiKey: false,
        requiresBaseUrl: true,
        endpointPath: "/search"
      }
    };
    CLAUDE_WEB_SEARCH_DEFAULT_MODEL = "claude-sonnet-5";
  }
});

// OpenMAIC/lib/store/settings-validation.ts
function isProviderUsable(cfg) {
  if (!cfg) return false;
  if (cfg.serverDisabled) return false;
  if (cfg.isServerConfigured) return true;
  if (cfg.requiresApiKey === false) return !!cfg.baseUrl;
  return !!cfg.apiKey;
}
function validateProvider(currentId, configMap, fallbackOrder, defaultId) {
  if (!currentId) return currentId;
  if (isProviderUsable(configMap[currentId])) return currentId;
  for (const id of fallbackOrder) {
    if (isProviderUsable(configMap[id])) return id;
  }
  return defaultId ?? "";
}
function resolveSelectedModel(currentModelId, availableModels) {
  if (availableModels.some((m) => m.id === currentModelId)) return currentModelId;
  return availableModels[0]?.id ?? "";
}
function isLLMProviderConfigured(config) {
  if (!config.models || config.models.length < 1) return false;
  if (config.isServerConfigured) return true;
  if (config.requiresApiKey === false) return !!config.baseUrl;
  if (!config.apiKey) return false;
  return !!(config.baseUrl || config.defaultBaseUrl);
}
var init_settings_validation = __esm({
  "OpenMAIC/lib/store/settings-validation.ts"() {
    "use strict";
  }
});

// OpenMAIC/lib/store/persist-health.ts
function publish(event) {
  const slot = `${event.name}:${event.status === "changes-lost" ? "lost" : "fault"}`;
  const timer = setTimeout(() => {
    pending.delete(slot);
    if (event.status === "recovered") delivered.delete(event.name);
    else if (event.status === "unavailable") delivered.add(event.name);
    for (const listener of listeners) listener(event);
  }, 0);
  pending.set(slot, timer);
}
function cancelPending(slot) {
  const timer = pending.get(slot);
  if (timer !== void 0) {
    clearTimeout(timer);
    pending.delete(slot);
  }
}
function reportPersistHealth(name, status) {
  if (status === "changes-lost") {
    if (lost.has(name)) return;
    lost.add(name);
    publish({ name, status });
    return;
  }
  if (status === "recovered") {
    if (!unavailable.delete(name)) return;
    cancelPending(`${name}:fault`);
    if (!delivered.has(name)) return;
    publish({ name, status });
    return;
  }
  if (unavailable.has(name)) return;
  unavailable.add(name);
  cancelPending(`${name}:fault`);
  publish({ name, status });
}
var listeners, unavailable, lost, pending, delivered;
var init_persist_health = __esm({
  "OpenMAIC/lib/store/persist-health.ts"() {
    "use strict";
    listeners = /* @__PURE__ */ new Set();
    unavailable = /* @__PURE__ */ new Set();
    lost = /* @__PURE__ */ new Set();
    pending = /* @__PURE__ */ new Map();
    delivered = /* @__PURE__ */ new Set();
  }
});

// OpenMAIC/lib/store/kv-persist.ts
import {
  BrowserKVStore,
  kvPersistStorage
} from "@openmaic/storage";
function isBrowserRuntime() {
  return typeof window !== "undefined";
}
function ambientLocalStorage() {
  try {
    return typeof localStorage === "undefined" ? null : localStorage;
  } catch {
    return null;
  }
}
function resolveKv(deps) {
  if (deps.kv) return deps.kv;
  if (!ambientLocalStorage()) return null;
  return defaultKv ??= new BrowserKVStore();
}
function isDeviceSafeKVStore(kv) {
  return kv.servesDeviceScopeLocally === true;
}
function purgeLegacyPersistKey(name) {
  const storage = ambientLocalStorage();
  if (!storage) return;
  try {
    storage.removeItem(name);
  } catch (error) {
    log5.warn(`Could not purge the legacy "${name}" entry:`, error);
  }
}
function createKVPersistStorage(scope, deps = {}) {
  const resolveKvStorage = () => {
    const kv = resolveKv(deps);
    if (!kv) return null;
    if (scope === "account") return kvPersistStorage(kv, "account");
    if (isDeviceSafeKVStore(kv)) return kvPersistStorage(kv, "device");
    throw new Error(
      "@/lib/store/kv-persist: a device-scoped persist store requires a KV backend whose device scope stays local (servesDeviceScopeLocally)"
    );
  };
  const states = /* @__PURE__ */ new Map();
  function stateFor(name) {
    let state = states.get(name);
    if (!state) {
      state = new KeyState(name, {
        backoffMs: deps.recoveryBackoffMs ?? DEFAULT_RECOVERY_BACKOFF_MS,
        // Deferred: recovery usually calls back into `persist.rehydrate()`,
        // and running that inside a `setItem` call would re-enter the store
        // mid-update. A recovery that throws is just a recovery that did not
        // work — the key stays unavailable and its notice stands, so there is
        // nothing to do but say what happened.
        requestRecovery: (key2, delayMs, done) => {
          setTimeout(() => {
            void Promise.resolve().then(() => deps.onWriteRefused?.(key2)).catch((error) => log5.error(`Recovery attempt for "${key2}" failed:`, error)).finally(done);
          }, delayMs);
        }
      });
      states.set(name, state);
    }
    return state;
  }
  const queues = /* @__PURE__ */ new Map();
  function serial(name, task) {
    const previous = queues.get(name) ?? Promise.resolve();
    const run = previous.then(task);
    queues.set(
      name,
      run.then(
        () => void 0,
        () => void 0
      )
    );
    return run;
  }
  async function concludeRead(state, name, value) {
    state.settle();
    const replay = state.peekReplay();
    if (replay === null) return value;
    if (!state.admitWrite(replay)) return value;
    const kvStorage = resolveKvStorage();
    if (!kvStorage) {
      state.replayFailed();
      return replay;
    }
    const written = (await Outcome.run(() => kvStorage.setItem(name, replay))).into(
      state,
      `replay the refused write for "${name}" to the KV ${scope} scope`
    );
    if (written === UNAVAILABLE) {
      state.replayFailed();
      return replay;
    }
    state.replayLanded();
    return replay;
  }
  return {
    getItem(name) {
      const state = stateFor(name);
      return serial(name, async () => {
        const value = await load();
        if (value !== null) state.noteRealData();
        return value;
      });
      async function load() {
        const kvStorage = resolveKvStorage();
        if (!kvStorage) {
          if (isBrowserRuntime()) {
            state.onFailure(
              "reach browser storage",
              new Error("localStorage is unavailable in this browser context")
            );
          }
          return null;
        }
        const stored = (await Outcome.run(() => kvStorage.getItem(name))).into(
          state,
          `read "${name}" from the KV ${scope} scope`
        );
        if (stored === UNAVAILABLE) return null;
        return concludeRead(state, name, stored);
      }
    },
    setItem(name, value) {
      const state = stateFor(name);
      if (!state.admitWrite(value)) return Promise.resolve();
      return serial(name, async () => {
        const kvStorage = resolveKvStorage();
        if (!kvStorage) {
          if (isBrowserRuntime()) {
            state.onFailure(
              "reach browser storage",
              new Error("localStorage is unavailable in this browser context")
            );
          }
          return;
        }
        const written = (await Outcome.run(() => kvStorage.setItem(name, value))).into(
          state,
          `write "${name}" to the KV ${scope} scope`
        );
        if (written === UNAVAILABLE) state.noteWriteFailed(value);
        else state.noteWriteSucceeded();
      });
    },
    removeItem(name) {
      const state = stateFor(name);
      state.beginClear();
      return serial(name, async () => {
        const kvStorage = resolveKvStorage();
        if (!kvStorage) {
          if (isBrowserRuntime()) {
            state.onFailure(
              "reach browser storage",
              new Error("localStorage is unavailable in this browser context")
            );
            throw new Error(`Could not clear ${JSON.stringify(name)}: storage is unreachable`);
          }
          state.finishClear();
          return;
        }
        const removed = (await Outcome.run(() => kvStorage.removeItem(name))).into(
          state,
          `remove "${name}" from the KV ${scope} scope`
        );
        if (removed === UNAVAILABLE) {
          throw new Error(`Could not remove ${JSON.stringify(name)} from the KV ${scope} scope`);
        }
        state.finishClear();
      });
    }
  };
}
var log5, defaultKv, UNAVAILABLE, Outcome, KeyState, DEFAULT_RECOVERY_BACKOFF_MS;
var init_kv_persist = __esm({
  "OpenMAIC/lib/store/kv-persist.ts"() {
    "use strict";
    init_logger();
    init_persist_health();
    log5 = createLogger("KVPersist");
    UNAVAILABLE = /* @__PURE__ */ Symbol("kv-unavailable");
    Outcome = class _Outcome {
      #result;
      constructor(result) {
        this.#result = result;
      }
      /** Run a backend operation, capturing a throw rather than propagating it. */
      static async run(work) {
        try {
          return new _Outcome({ ok: true, value: await work() });
        } catch (error) {
          return new _Outcome({ ok: false, error });
        }
      }
      /** An already-known value, for paths with no backend to call. */
      static resolved(value) {
        return new _Outcome({ ok: true, value });
      }
      /**
       * Open the outcome through the state machine. A failure is recorded against
       * the key — unsettling it, raising the health signal and scheduling recovery
       * — before `UNAVAILABLE` is handed back.
       */
      into(state, operation) {
        if (this.#result.ok) return this.#result.value;
        state.onFailure(operation, this.#result.error);
        return UNAVAILABLE;
      }
    };
    KeyState = class {
      constructor(name, hooks) {
        this.name = name;
        this.hooks = hooks;
      }
      #phase = "unhydrated";
      #storeHoldsRealData = false;
      #refused = null;
      #replay = null;
      #recoveryAttempts = 0;
      #recoveryInFlight = false;
      #recoveryExhausted = false;
      get phase() {
        return this.#phase;
      }
      /**
       * A backend operation failed. Every failure means the same thing, whichever
       * operation it was: the key's stored state is no longer something this
       * session can reason about, so it must not be written over and the user has
       * to be told.
       */
      onFailure(operation, error) {
        log5.error(`Could not ${operation}:`, error);
        if (this.#phase === "unavailable") return;
        this.#phase = "unavailable";
        reportPersistHealth(this.name, "unavailable");
        this.#askForRecovery();
      }
      /** A read path concluded. */
      settle() {
        if (this.#settleOutcome()) this.#rearmRecoveryIfHealthy();
      }
      /** Returns false when the key was left untouched (a clear is in progress). */
      #settleOutcome() {
        if (this.#phase === "clearing") {
          this.#refused = null;
          this.#replay = null;
          return false;
        }
        this.#phase = "settled";
        const refused = this.#refused;
        this.#refused = null;
        if (refused === null) {
          reportPersistHealth(this.name, "recovered");
          return true;
        }
        if (refused.replayable) {
          this.#replay = refused.value;
          log5.info(`Replaying the write that was refused for "${this.name}"`);
          reportPersistHealth(this.name, "recovered");
          return true;
        }
        if (refused.origin !== "unavailable") {
          log5.warn(
            `A write to "${this.name}" issued before its storage hydrated was dropped; the stored value stands`
          );
          reportPersistHealth(this.name, "recovered");
          return true;
        }
        log5.error(
          `Changes to "${this.name}" made while its storage was unavailable could not be saved, and have been replaced by the stored value`
        );
        reportPersistHealth(this.name, "changes-lost");
        return true;
      }
      /** `removeItem` was called. Synchronous by design — see the table. */
      beginClear() {
        this.#phase = "clearing";
        this.#refused = null;
        this.#replay = null;
      }
      /** The clear completed: the key is known again, and known to be empty. */
      finishClear() {
        this.#phase = "settled";
        this.#refused = null;
        this.#replay = null;
        this.#rearmRecoveryIfHealthy();
        reportPersistHealth(this.name, "recovered");
      }
      /**
       * Decide a write at the moment it is issued, never when its queued turn
       * arrives: a write issued during hydration would otherwise wait behind the
       * read, find the gate opened by the very read it raced, and persist its
       * pre-hydration snapshot over the stored value.
       */
      admitWrite(value) {
        if (this.#phase === "settled") return true;
        if (this.#phase !== "clearing") {
          this.#refused = { value, replayable: this.#storeHoldsRealData, origin: this.#phase };
        }
        log5.error(
          `Refusing to persist "${this.name}" while its storage is ${this.#phase}. Changes made in this session are not being saved.`
        );
        if (this.#phase !== "clearing") this.#askForRecovery();
        return false;
      }
      /**
       * Record that the store now holds the authoritative persisted value rather
       * than defaults — because the KV scope returned a value.
       *
       * Latches on and never off: once a session has had the real value in hand,
       * every later snapshot is built on it. This is what decides whether a write
       * the backend rejected can be replayed — see {@link RefusedWrite}.
       */
      noteRealData() {
        this.#storeHoldsRealData = true;
      }
      /**
       * A write was admitted and the backend then rejected it. Remember it exactly
       * as a refused write would be: it is the newest copy of the user's data and
       * the only place it still exists is memory.
       */
      noteWriteFailed(value) {
        this.#refused = { value, replayable: this.#storeHoldsRealData, origin: this.#phase };
      }
      /**
       * A write landed. Anything remembered from an earlier failed write is now
       * stale: both were admitted before the key closed, so the queue ordered them,
       * and replaying the older one later would undo this newer value.
       */
      noteWriteSucceeded() {
        this.#storeHoldsRealData = true;
        this.#refused = null;
        this.#replay = null;
      }
      /**
       * The value a recovering read should write back and return in place of what
       * it found. Left in place until {@link replayLanded} says it is durable —
       * a read that succeeds says nothing about whether the write will, and a
       * snapshot dropped on the strength of an attempt is a snapshot lost.
       */
      peekReplay() {
        return this.#replay;
      }
      /** The replay write landed; nothing is owed any more. */
      replayLanded() {
        this.#replay = null;
        this.#refused = null;
        this.#storeHoldsRealData = true;
        this.#rearmRecoveryIfHealthy();
      }
      /**
       * The replay write did not land. The snapshot goes back to being a refused
       * write — still the newest copy of the user's data, still owed — so the next
       * recovery tries again and a permanent failure is eventually reported rather
       * than passing as success.
       */
      replayFailed() {
        const value = this.#replay;
        this.#replay = null;
        if (value === null) return;
        this.#refused = { value, replayable: this.#storeHoldsRealData, origin: this.#phase };
      }
      /**
       * Schedule one rehydrate, backing off and eventually giving up.
       *
       * A backend that reads but cannot write — a quota-exhausted one does exactly
       * that — turns recovery into a treadmill: the read succeeds, the key settles,
       * the replay write fails, and that failure asks for recovery again. Without a
       * cap that is an unbounded loop of microtasks, and the app is worse off than
       * if nothing had been retried at all.
       */
      #askForRecovery() {
        if (this.#recoveryInFlight || this.#recoveryExhausted) return;
        const { backoffMs } = this.hooks;
        if (this.#recoveryAttempts >= backoffMs.length) {
          this.#recoveryExhausted = true;
          log5.error(
            `Giving up on recovering "${this.name}" after ${backoffMs.length} attempts; storage stays read-only until something outside this session changes`
          );
          if (this.#refused !== null || this.#replay !== null) {
            reportPersistHealth(this.name, "changes-lost");
          }
          return;
        }
        const delayMs = backoffMs[this.#recoveryAttempts++] ?? 0;
        this.#recoveryInFlight = true;
        this.hooks.requestRecovery(this.name, delayMs, () => this.#onRecoveryFinished());
      }
      /**
       * One attempt has run its course. If the key is still unhealthy, spend the
       * next slot in the budget — an attempt that fails part-way through leaves
       * nothing else to trigger the retry, and the debt would otherwise sit there
       * unpaid and unannounced.
       */
      #onRecoveryFinished() {
        this.#recoveryInFlight = false;
        const owed = this.#refused !== null || this.#replay !== null;
        if (this.#phase === "unavailable" || owed) this.#askForRecovery();
      }
      /**
       * Re-arm the recovery budget, but only on real progress: nothing left owed.
       * A settle reached *by* a recovery attempt, with a replay still queued to
       * write, is not progress — counting it as such is exactly what makes the
       * treadmill above unbounded, because every lap looks like a fresh start.
       */
      #rearmRecoveryIfHealthy() {
        if (this.#refused !== null || this.#replay !== null) return;
        this.#recoveryAttempts = 0;
        this.#recoveryExhausted = false;
      }
    };
    DEFAULT_RECOVERY_BACKOFF_MS = [0, 250, 1e3];
  }
});

// OpenMAIC/lib/audio/provider-enablement.ts
function hasText(value) {
  return !!value && value.trim().length > 0;
}
function isTTSProviderConfigured(providerId, config) {
  if (providerId === BROWSER_NATIVE_TTS_PROVIDER_ID) return true;
  if (!config) return false;
  if (config.isServerConfigured) return true;
  if (isCustomTTSProvider(providerId)) {
    return hasText(config.apiKey) || hasText(config.baseUrl) || (config.customVoices?.length ?? 0) > 0;
  }
  const def = TTS_PROVIDERS[providerId];
  if (!def) return false;
  if (def.requiresApiKey) return hasText(config.apiKey);
  return hasText(config.serverBaseUrl) || hasText(config.baseUrl);
}
function isTTSProviderEnabled(providerId, config) {
  if (config?.serverDisabled) return false;
  if (!isTTSProviderConfigured(providerId, config)) return false;
  return config?.enabled !== false;
}
var BROWSER_NATIVE_TTS_PROVIDER_ID;
var init_provider_enablement = __esm({
  "OpenMAIC/lib/audio/provider-enablement.ts"() {
    "use strict";
    init_constants();
    init_types();
    BROWSER_NATIVE_TTS_PROVIDER_ID = "browser-native-tts";
  }
});

// OpenMAIC/lib/store/settings.ts
import { create as create2 } from "zustand";
import { persist } from "zustand/middleware";
function pruneThinkingConfigs(thinkingConfigs, providersConfig) {
  if (!thinkingConfigs || !providersConfig) return {};
  const validKeys = /* @__PURE__ */ new Set();
  for (const [providerId, providerConfig] of Object.entries(providersConfig)) {
    for (const model of providerConfig.models) {
      if (supportsConfigurableThinking(model.capabilities?.thinking)) {
        validKeys.add(getThinkingConfigKey(providerId, model.id));
      }
    }
  }
  return Object.fromEntries(
    Object.entries(thinkingConfigs).filter(([key2]) => validKeys.has(key2))
  );
}
function resolveLLMSelection(config, currentProviderId, currentModelId) {
  const isUsable = (id) => !!config[id] && isLLMProviderConfigured(config[id]);
  const providerId = isUsable(currentProviderId) ? currentProviderId : Object.keys(config).find(isUsable) ?? "";
  const modelId = providerId ? resolveSelectedLLMModel(providerId, currentModelId, config[providerId]?.models ?? []) : "";
  return { providerId, modelId };
}
function resolveSelectedLLMModel(providerId, currentModelId, availableModels) {
  if (availableModels.some((model) => model.id === currentModelId)) return currentModelId;
  const canonicalModelId = getCanonicalModelId(providerId, currentModelId);
  if (canonicalModelId !== currentModelId && availableModels.some((model) => model.id === canonicalModelId)) {
    return currentModelId;
  }
  return availableModels[0]?.id ?? "";
}
function resolveMediaModels(builtInModels, config) {
  const customModels = config?.customModels ?? [];
  return config?.replaceBuiltInModels && customModels.length > 0 ? customModels : [...builtInModels, ...customModels];
}
function hasMediaCredential(value) {
  return !!value && value.trim().length > 0;
}
function isUsableMediaProvider(provider, config) {
  if (!provider || config?.enabled === false) return false;
  if (config?.isServerConfigured) return true;
  if (provider.requiresApiKey) return hasMediaCredential(config?.apiKey);
  return hasMediaCredential(config?.baseUrl);
}
function shouldTurnOn(currentlyEnabled, usable) {
  return !currentlyEnabled && usable;
}
function hasProviderId(providerMap, providerId) {
  return typeof providerId === "string" && providerId in providerMap;
}
function ensureValidProviderSelections(state) {
  const defaultAudioConfig = getDefaultAudioConfig();
  const defaultPdfConfig = getDefaultPDFConfig();
  const defaultImageConfig = getDefaultImageConfig();
  const defaultVideoConfig = getDefaultVideoConfig();
  const defaultWebSearchConfig = getDefaultWebSearchConfig();
  if (!hasProviderId(PDF_PROVIDERS, state.pdfProviderId)) {
    state.pdfProviderId = defaultPdfConfig.pdfProviderId;
  }
  if (!hasProviderId(WEB_SEARCH_PROVIDERS, state.webSearchProviderId)) {
    state.webSearchProviderId = defaultWebSearchConfig.webSearchProviderId;
  }
  ensureBaiduSubSources(state);
  if (!hasProviderId(IMAGE_PROVIDERS, state.imageProviderId)) {
    state.imageProviderId = defaultImageConfig.imageProviderId;
  }
  if (!hasProviderId(VIDEO_PROVIDERS, state.videoProviderId)) {
    state.videoProviderId = defaultVideoConfig.videoProviderId;
  }
  if (!hasProviderId(TTS_PROVIDERS, state.ttsProviderId) && !(state.ttsProviderId && isCustomTTSProvider(state.ttsProviderId) && state.ttsProvidersConfig && state.ttsProviderId in state.ttsProvidersConfig)) {
    state.ttsProviderId = defaultAudioConfig.ttsProviderId;
  }
  if (!hasProviderId(ASR_PROVIDERS, state.asrProviderId) && !(state.asrProviderId && isCustomASRProvider(state.asrProviderId) && state.asrProvidersConfig && state.asrProviderId in state.asrProvidersConfig)) {
    state.asrProviderId = defaultAudioConfig.asrProviderId;
  }
}
function ensureBuiltInAudioProviders(state) {
  const defaultAudioConfig = getDefaultAudioConfig();
  if (state.ttsProvidersConfig) {
    for (const providerId of Object.keys(TTS_PROVIDERS)) {
      if (!state.ttsProvidersConfig[providerId]) {
        state.ttsProvidersConfig[providerId] = defaultAudioConfig.ttsProvidersConfig[providerId];
      }
    }
    const voxcpmConfig = state.ttsProvidersConfig["voxcpm-tts"];
    if (voxcpmConfig) {
      if (!voxcpmConfig.modelId || voxcpmConfig.modelId === VOXCPM_MODEL_ID) {
        voxcpmConfig.modelId = VOXCPM_VLLM_MODEL_ID;
      }
      voxcpmConfig.providerOptions = {
        backend: DEFAULT_VOXCPM_BACKEND,
        ...voxcpmConfig.providerOptions || {}
      };
    }
  }
  if (state.asrProvidersConfig) {
    for (const providerId of Object.keys(ASR_PROVIDERS)) {
      if (!state.asrProvidersConfig[providerId]) {
        state.asrProvidersConfig[providerId] = defaultAudioConfig.asrProvidersConfig[providerId];
      }
    }
  }
}
function ensureBuiltInProviders(state) {
  if (!state.providersConfig) return;
  const defaultConfig = getDefaultProvidersConfig();
  Object.keys(PROVIDERS).forEach((pid) => {
    const providerId = pid;
    if (!state.providersConfig[providerId]) {
      state.providersConfig[providerId] = defaultConfig[providerId];
    } else {
      const provider = PROVIDERS[providerId];
      const existing = state.providersConfig[providerId];
      const builtInModelIds = new Set(provider.models.map((m) => m.id));
      const customModels = (existing.models || []).filter((m) => !builtInModelIds.has(m.id));
      const mergedModels = [...provider.models, ...customModels];
      state.providersConfig[providerId] = {
        ...existing,
        models: mergedModels,
        name: existing.name || provider.name,
        type: existing.type || provider.type,
        defaultBaseUrl: existing.defaultBaseUrl || provider.defaultBaseUrl,
        icon: provider.icon || existing.icon,
        requiresApiKey: existing.requiresApiKey ?? provider.requiresApiKey,
        isBuiltIn: existing.isBuiltIn ?? true
      };
    }
  });
}
function promoteLegacyCustomProviderBaseUrls(state) {
  if (!state.providersConfig) return;
  Object.values(state.providersConfig).forEach((config) => {
    if (!config.isBuiltIn && !config.baseUrl && config.defaultBaseUrl) {
      config.baseUrl = config.defaultBaseUrl;
    }
  });
}
function ensureBuiltInImageProviders(state) {
  if (!state.imageProvidersConfig) return;
  const defaultConfig = getDefaultImageConfig().imageProvidersConfig;
  Object.keys(IMAGE_PROVIDERS).forEach((pid) => {
    const providerId = pid;
    if (!state.imageProvidersConfig[providerId]) {
      state.imageProvidersConfig[providerId] = defaultConfig[providerId];
    }
  });
}
function ensureBuiltInPDFProviders(state) {
  if (!state.pdfProvidersConfig) return;
  const defaultConfig = getDefaultPDFConfig().pdfProvidersConfig;
  Object.keys(PDF_PROVIDERS).forEach((pid) => {
    const providerId = pid;
    if (!state.pdfProvidersConfig[providerId]) {
      state.pdfProvidersConfig[providerId] = defaultConfig[providerId];
    }
  });
}
function ensureBuiltInVideoProviders(state) {
  if (!state.videoProvidersConfig) return;
  const defaultConfig = getDefaultVideoConfig().videoProvidersConfig;
  Object.keys(VIDEO_PROVIDERS).forEach((pid) => {
    const providerId = pid;
    if (!state.videoProvidersConfig[providerId]) {
      state.videoProvidersConfig[providerId] = defaultConfig[providerId];
    }
  });
}
function ensureBuiltInWebSearchProviders(state) {
  if (!state.webSearchProvidersConfig) return;
  const defaultConfig = getDefaultWebSearchConfig().webSearchProvidersConfig;
  Object.keys(WEB_SEARCH_PROVIDERS).forEach((pid) => {
    const providerId = pid;
    if (!state.webSearchProvidersConfig[providerId]) {
      state.webSearchProvidersConfig[providerId] = defaultConfig[providerId];
    } else {
      state.webSearchProvidersConfig[providerId] = {
        ...state.webSearchProvidersConfig[providerId],
        requiresApiKey: WEB_SEARCH_PROVIDERS[providerId].requiresApiKey
      };
    }
  });
}
function ensureBaiduSubSources(state) {
  const defaults = getDefaultWebSearchConfig().baiduSubSources;
  const current = state.baiduSubSources;
  state.baiduSubSources = {
    webSearch: current?.webSearch ?? defaults.webSearch,
    baike: current?.baike ?? defaults.baike,
    scholar: current?.scholar ?? defaults.scholar
  };
}
function stripLegacyServerBaseUrl(state) {
  const maps = [
    state.providersConfig,
    state.ttsProvidersConfig,
    state.asrProvidersConfig,
    state.pdfProvidersConfig,
    state.imageProvidersConfig,
    state.videoProvidersConfig,
    state.webSearchProvidersConfig
  ];
  for (const map of maps) {
    if (!map) continue;
    for (const cfg of Object.values(map)) {
      if (cfg && "serverBaseUrl" in cfg) delete cfg.serverBaseUrl;
    }
  }
}
var log6, SETTINGS_PERSIST_VERSION, recovery, getDefaultProvidersConfig, getDefaultAudioConfig, getDefaultPDFConfig, getDefaultImageConfig, getDefaultVideoConfig, getDefaultWebSearchConfig, useSettingsStore;
var init_settings = __esm({
  "OpenMAIC/lib/store/settings.ts"() {
    "use strict";
    init_providers();
    init_model_aliases();
    init_thinking_config();
    init_types();
    init_constants();
    init_voxcpm();
    init_constants2();
    init_image_providers();
    init_video_providers();
    init_constants3();
    init_logger();
    init_settings_validation();
    init_kv_persist();
    init_provider_enablement();
    log6 = createLogger("Settings");
    SETTINGS_PERSIST_VERSION = 4;
    recovery = {};
    getDefaultProvidersConfig = () => {
      const config = {};
      Object.keys(PROVIDERS).forEach((pid) => {
        const provider = PROVIDERS[pid];
        config[pid] = {
          apiKey: "",
          baseUrl: "",
          models: provider.models,
          name: provider.name,
          type: provider.type,
          defaultBaseUrl: provider.defaultBaseUrl,
          icon: provider.icon,
          requiresApiKey: provider.requiresApiKey,
          isBuiltIn: true
        };
      });
      return config;
    };
    getDefaultAudioConfig = () => ({
      ttsProviderId: "browser-native-tts",
      ttsVoice: "default",
      ttsSpeed: 1,
      asrProviderId: "browser-native",
      asrLanguage: "zh",
      ttsProvidersConfig: {
        // Built-in providers default enabled:true — they only ever surface once
        // configured (API key or server-managed), so "enabled" is a user opt-OUT,
        // not the visibility gate. A server-configured provider must not be hidden
        // by a stale default (#665).
        "openai-tts": { apiKey: "", baseUrl: "", enabled: true },
        "azure-tts": { apiKey: "", baseUrl: "", enabled: true },
        "glm-tts": { apiKey: "", baseUrl: "", enabled: true },
        "qwen-tts": { apiKey: "", baseUrl: "", enabled: true },
        "voxcpm-tts": {
          apiKey: "",
          baseUrl: "",
          modelId: VOXCPM_VLLM_MODEL_ID,
          enabled: true,
          providerOptions: { backend: DEFAULT_VOXCPM_BACKEND }
        },
        "doubao-tts": { apiKey: "", baseUrl: "", enabled: true },
        "elevenlabs-tts": { apiKey: "", baseUrl: "", enabled: true },
        "minimax-tts": { apiKey: "", baseUrl: "", modelId: "speech-2.8-hd", enabled: true },
        "lemonade-tts": {
          apiKey: "",
          baseUrl: "",
          modelId: "kokoro-v1",
          enabled: true
        },
        // Browser-native is OFF by default — fully opt-in. Native voice quality is
        // poor; it must never be a silent default (#665).
        "browser-native-tts": { apiKey: "", baseUrl: "", enabled: false }
      },
      asrProvidersConfig: {
        "openai-whisper": { apiKey: "", baseUrl: "", enabled: true },
        "browser-native": { apiKey: "", baseUrl: "", enabled: true },
        "qwen-asr": { apiKey: "", baseUrl: "", enabled: false },
        "azure-asr": { apiKey: "", baseUrl: "", enabled: false },
        "funasr-asr": { apiKey: "", baseUrl: "", enabled: false },
        "lemonade-asr": { apiKey: "", baseUrl: "", enabled: false }
      }
    });
    getDefaultPDFConfig = () => ({
      pdfProviderId: "unpdf",
      pdfProvidersConfig: {
        unpdf: { apiKey: "", baseUrl: "", enabled: true },
        mineru: { apiKey: "", baseUrl: "", enabled: false },
        "mineru-cloud": { apiKey: "", baseUrl: "", enabled: false },
        alidocmind: { apiKey: "", baseUrl: "", enabled: false, accessKeyId: "", accessKeySecret: "" }
      }
    });
    getDefaultImageConfig = () => ({
      imageProviderId: "seedream",
      imageModelId: "doubao-seedream-5-0-260128",
      imageProvidersConfig: {
        seedream: { apiKey: "", baseUrl: "", enabled: false },
        "openai-image": { apiKey: "", baseUrl: "", enabled: false },
        "qwen-image": { apiKey: "", baseUrl: "", enabled: false },
        "nano-banana": { apiKey: "", baseUrl: "", enabled: false },
        "minimax-image": { apiKey: "", baseUrl: "", enabled: false },
        "grok-image": { apiKey: "", baseUrl: "", enabled: false },
        "comfyui-image": { apiKey: "", baseUrl: "", enabled: false },
        lemonade: { apiKey: "", baseUrl: "", enabled: false }
      }
    });
    getDefaultVideoConfig = () => ({
      videoProviderId: "seedance",
      videoModelId: "doubao-seedance-2-0-260128",
      videoProvidersConfig: {
        seedance: { apiKey: "", baseUrl: "", enabled: false },
        kling: { apiKey: "", baseUrl: "", enabled: false },
        veo: { apiKey: "", baseUrl: "", enabled: false },
        "minimax-video": { apiKey: "", baseUrl: "", enabled: false },
        "grok-video": { apiKey: "", baseUrl: "", enabled: false },
        happyhorse: { apiKey: "", baseUrl: "", enabled: false }
      }
    });
    getDefaultWebSearchConfig = () => ({
      webSearchProviderId: "tavily",
      webSearchProvidersConfig: {
        tavily: { apiKey: "", baseUrl: "", enabled: true, requiresApiKey: true },
        exa: {
          apiKey: "",
          baseUrl: WEB_SEARCH_PROVIDERS.exa.defaultBaseUrl || "",
          enabled: true,
          requiresApiKey: true
        },
        bocha: { apiKey: "", baseUrl: "", enabled: true, requiresApiKey: true },
        brave: {
          apiKey: "",
          baseUrl: WEB_SEARCH_PROVIDERS.brave.defaultBaseUrl || "",
          enabled: true,
          requiresApiKey: false
        },
        baidu: { apiKey: "", baseUrl: "", enabled: true, requiresApiKey: true },
        claude: {
          apiKey: "",
          baseUrl: "",
          enabled: true,
          requiresApiKey: true,
          modelId: ""
        },
        minimax: {
          apiKey: "",
          baseUrl: WEB_SEARCH_PROVIDERS.minimax.defaultBaseUrl || "",
          enabled: true,
          requiresApiKey: true
        },
        doubao: {
          apiKey: "",
          baseUrl: WEB_SEARCH_PROVIDERS.doubao.defaultBaseUrl || "",
          enabled: true,
          requiresApiKey: true
        },
        searxng: {
          apiKey: "",
          baseUrl: "",
          enabled: true,
          requiresApiKey: false
        }
      },
      baiduSubSources: {
        webSearch: true,
        baike: true,
        scholar: true
      }
    });
    useSettingsStore = create2()(
      persist(
        (set, get) => {
          const defaultAudioConfig = getDefaultAudioConfig();
          const defaultPDFConfig = getDefaultPDFConfig();
          const defaultImageConfig = getDefaultImageConfig();
          const defaultVideoConfig = getDefaultVideoConfig();
          const defaultWebSearchConfig = getDefaultWebSearchConfig();
          return {
            // Initial state is plain defaults. This store does not migrate any
            // pre-cutover localStorage data — everything persisted arrives through
            // the KVStore on rehydration; an upgrading user reconfigures once.
            providerId: "openai",
            modelId: "",
            thinkingConfigs: {},
            providersConfig: getDefaultProvidersConfig(),
            ttsModel: "openai-tts",
            selectedAgentIds: ["default-1", "default-2", "default-3"],
            agentMode: "auto",
            autoAgentCount: 3,
            agentVoiceOverrides: {},
            agentSelectionIsUserSet: false,
            // Playback controls
            ttsMuted: false,
            ttsVolume: 1,
            autoPlayLecture: false,
            playbackSpeed: 1,
            // Layout preferences
            sidebarCollapsed: true,
            chatAreaCollapsed: true,
            chatAreaWidth: 320,
            editRailCollapsed: false,
            editRailWidth: 220,
            // Audio settings (use defaults)
            ...defaultAudioConfig,
            // PDF settings (use defaults)
            ...defaultPDFConfig,
            // Image settings (use defaults)
            ...defaultImageConfig,
            // Video settings (use defaults)
            ...defaultVideoConfig,
            // Media generation toggles (off by default)
            imageGenerationEnabled: false,
            videoGenerationEnabled: false,
            reviewOutlineEnabled: false,
            // TTS is OFF by default; auto-enabled on first server-sync when a TTS
            // provider is configured (mirrors image/video). Fresh installs with no
            // provider stay off and show an "enable browser-native" CTA (#665).
            ttsEnabled: false,
            asrEnabled: true,
            // Off until the server reports a concurrency via fetchServerProviders.
            parallelSceneConcurrency: 0,
            autoConfigApplied: false,
            // Web Search settings (use defaults)
            ...defaultWebSearchConfig,
            // Actions
            setModel: (providerId, modelId) => set({ providerId, modelId }),
            setThinkingConfig: (providerId, modelId, config) => set((state) => {
              const key2 = getThinkingConfigKey(providerId, modelId);
              const next = { ...state.thinkingConfigs };
              if (config) {
                next[key2] = config;
              } else {
                delete next[key2];
              }
              return { thinkingConfigs: next };
            }),
            setProviderConfig: (providerId, config) => set((state) => {
              const providersConfig = {
                ...state.providersConfig,
                [providerId]: {
                  ...state.providersConfig[providerId],
                  ...config
                }
              };
              const { providerId: nextProvider, modelId: nextModel } = resolveLLMSelection(
                providersConfig,
                state.providerId,
                state.modelId
              );
              return {
                providersConfig,
                thinkingConfigs: pruneThinkingConfigs(state.thinkingConfigs, providersConfig),
                ...nextProvider !== state.providerId && { providerId: nextProvider },
                ...nextModel !== state.modelId && { modelId: nextModel }
              };
            }),
            setProvidersConfig: (config) => set((state) => {
              const { providerId: nextProvider, modelId: nextModel } = resolveLLMSelection(
                config,
                state.providerId,
                state.modelId
              );
              return {
                providersConfig: config,
                thinkingConfigs: pruneThinkingConfigs(state.thinkingConfigs, config),
                ...nextProvider !== state.providerId && { providerId: nextProvider },
                ...nextModel !== state.modelId && { modelId: nextModel }
              };
            }),
            setTtsModel: (model) => set({ ttsModel: model }),
            setTTSMuted: (muted) => set({ ttsMuted: muted }),
            setTTSVolume: (volume) => set({ ttsVolume: Math.max(0, Math.min(1, volume)) }),
            setAutoPlayLecture: (autoPlay) => set({ autoPlayLecture: autoPlay }),
            setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),
            setSelectedAgentIds: (ids) => set({ selectedAgentIds: ids }),
            setAgentMode: (mode) => set({ agentMode: mode }),
            setAutoAgentCount: (count) => set({ autoAgentCount: count }),
            setAgentVoiceOverride: (agentId, voice) => set((state) => {
              const next = { ...state.agentVoiceOverrides };
              if (voice) {
                next[agentId] = voice;
              } else {
                delete next[agentId];
              }
              return { agentVoiceOverrides: next };
            }),
            setAgentSelectionIsUserSet: (isUserSet) => set({ agentSelectionIsUserSet: isUserSet }),
            // Layout actions
            setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
            setChatAreaCollapsed: (collapsed) => set({ chatAreaCollapsed: collapsed }),
            setEditRailCollapsed: (collapsed) => set({ editRailCollapsed: collapsed }),
            setEditRailWidth: (width) => set({ editRailWidth: width }),
            setChatAreaWidth: (width) => set({ chatAreaWidth: width }),
            // Audio actions
            setTTSProvider: (providerId) => set((state) => {
              const shouldUpdateVoice = state.ttsProviderId !== providerId;
              const defaultVoice = isCustomTTSProvider(providerId) ? state.ttsProvidersConfig[providerId]?.customVoices?.[0]?.id || "default" : DEFAULT_TTS_VOICES[providerId] || "default";
              return {
                ttsProviderId: providerId,
                ...shouldUpdateVoice && { ttsVoice: defaultVoice },
                ...providerId === "qwen-tts" && isQwenCatalogVoice(defaultVoice) && isQwenVoiceCloneModel(state.ttsProvidersConfig["qwen-tts"]?.modelId) ? {
                  ttsProvidersConfig: {
                    ...state.ttsProvidersConfig,
                    "qwen-tts": {
                      ...state.ttsProvidersConfig["qwen-tts"],
                      modelId: TTS_PROVIDERS["qwen-tts"].defaultModelId
                    }
                  }
                } : {}
              };
            }),
            setTTSVoice: (voice) => set((state) => ({
              ttsVoice: voice,
              ...state.ttsProviderId === "qwen-tts" && isQwenCatalogVoice(voice) && isQwenVoiceCloneModel(state.ttsProvidersConfig["qwen-tts"]?.modelId) ? {
                ttsProvidersConfig: {
                  ...state.ttsProvidersConfig,
                  "qwen-tts": {
                    ...state.ttsProvidersConfig["qwen-tts"],
                    modelId: TTS_PROVIDERS["qwen-tts"].defaultModelId
                  }
                }
              } : {}
            })),
            setTTSSpeed: (speed) => set({ ttsSpeed: speed }),
            // Reset language when switching providers, since language code formats differ
            // (e.g. browser-native uses BCP-47 "en-US", OpenAI Whisper uses ISO 639-1 "en")
            setASRProvider: (providerId) => set((state) => {
              let supportedLanguages;
              if (isCustomASRProvider(providerId)) {
                supportedLanguages = ["auto"];
              } else {
                supportedLanguages = ASR_PROVIDERS[providerId]?.supportedLanguages || [];
              }
              const isLanguageValid = supportedLanguages.includes(state.asrLanguage);
              return {
                asrProviderId: providerId,
                ...isLanguageValid ? {} : { asrLanguage: supportedLanguages[0] || "auto" }
              };
            }),
            setASRLanguage: (language) => set({ asrLanguage: language }),
            setTTSProviderConfig: (providerId, config) => set((state) => {
              const mergedProvider = {
                ...state.ttsProvidersConfig[providerId],
                ...config
              };
              const ttsProvidersConfig = {
                ...state.ttsProvidersConfig,
                [providerId]: mergedProvider
              };
              if (state.ttsProviderId === providerId && config.enabled === false) {
                return {
                  ttsProvidersConfig,
                  ttsProviderId: getDefaultAudioConfig().ttsProviderId,
                  ttsVoice: "default"
                };
              }
              const wasUsable = isTTSProviderEnabled(
                providerId,
                state.ttsProvidersConfig[providerId]
              );
              const nowUsable = isTTSProviderEnabled(providerId, mergedProvider);
              const turnOnNarration = providerId !== "browser-native-tts" && shouldTurnOn(state.ttsEnabled, !wasUsable && nowUsable);
              return {
                ttsProvidersConfig,
                ...turnOnNarration ? { ttsEnabled: true } : {}
              };
            }),
            setASRProviderConfig: (providerId, config) => set((state) => ({
              asrProvidersConfig: {
                ...state.asrProvidersConfig,
                [providerId]: {
                  ...state.asrProvidersConfig[providerId],
                  ...config
                }
              }
            })),
            // PDF actions
            setPDFProvider: (providerId) => set({ pdfProviderId: providerId }),
            setPDFProviderConfig: (providerId, config) => set((state) => ({
              pdfProvidersConfig: {
                ...state.pdfProvidersConfig,
                [providerId]: {
                  ...state.pdfProvidersConfig[providerId],
                  ...config
                }
              }
            })),
            // Image Generation actions
            setImageProvider: (providerId) => set((state) => ({
              imageProviderId: providerId,
              imageModelId: resolveSelectedModel(
                state.imageModelId,
                resolveMediaModels(
                  IMAGE_PROVIDERS[providerId]?.models ?? [],
                  state.imageProvidersConfig[providerId]
                )
              )
            })),
            setImageModelId: (modelId) => set({ imageModelId: modelId }),
            setImageProviderConfig: (providerId, config) => set((state) => {
              const mergedProvider = {
                ...state.imageProvidersConfig[providerId],
                ...config
              };
              const imageProvidersConfig = {
                ...state.imageProvidersConfig,
                [providerId]: mergedProvider
              };
              const wasUsable = isUsableMediaProvider(
                IMAGE_PROVIDERS[providerId],
                state.imageProvidersConfig[providerId]
              );
              const nowUsable = isUsableMediaProvider(IMAGE_PROVIDERS[providerId], mergedProvider);
              const turnOnImage = shouldTurnOn(state.imageGenerationEnabled, !wasUsable && nowUsable);
              const base = {
                imageProvidersConfig,
                ...turnOnImage ? { imageGenerationEnabled: true } : {}
              };
              if (state.imageProviderId === providerId) {
                if (config.enabled === false) {
                  const providerIds = Object.keys(IMAGE_PROVIDERS);
                  const usableFallback = providerIds.find(
                    (id) => id !== providerId && isUsableMediaProvider(IMAGE_PROVIDERS[id], imageProvidersConfig[id])
                  );
                  const fallback = usableFallback ?? providerIds.find((id) => id !== providerId) ?? providerId;
                  const fallbackModels = resolveMediaModels(
                    IMAGE_PROVIDERS[fallback]?.models ?? [],
                    imageProvidersConfig[fallback]
                  );
                  return {
                    ...base,
                    imageProviderId: fallback,
                    imageModelId: resolveSelectedModel(state.imageModelId, fallbackModels),
                    ...!usableFallback ? { imageGenerationEnabled: false } : {}
                  };
                }
                const models = resolveMediaModels(
                  IMAGE_PROVIDERS[providerId]?.models ?? [],
                  mergedProvider
                );
                const imageModelId = resolveSelectedModel(state.imageModelId, models);
                if (imageModelId) {
                  return { ...base, imageModelId };
                }
              }
              return base;
            }),
            // Video Generation actions
            setVideoProvider: (providerId) => set((state) => ({
              videoProviderId: providerId,
              videoModelId: resolveSelectedModel(
                state.videoModelId,
                resolveMediaModels(
                  VIDEO_PROVIDERS[providerId]?.models ?? [],
                  state.videoProvidersConfig[providerId]
                )
              )
            })),
            setVideoModelId: (modelId) => set({ videoModelId: modelId }),
            setVideoProviderConfig: (providerId, config) => set((state) => {
              const mergedProvider = {
                ...state.videoProvidersConfig[providerId],
                ...config
              };
              const videoProvidersConfig = {
                ...state.videoProvidersConfig,
                [providerId]: mergedProvider
              };
              const wasUsable = isUsableMediaProvider(
                VIDEO_PROVIDERS[providerId],
                state.videoProvidersConfig[providerId]
              );
              const nowUsable = isUsableMediaProvider(VIDEO_PROVIDERS[providerId], mergedProvider);
              const turnOnVideo = shouldTurnOn(state.videoGenerationEnabled, !wasUsable && nowUsable);
              const base = {
                videoProvidersConfig,
                ...turnOnVideo ? { videoGenerationEnabled: true } : {}
              };
              if (state.videoProviderId === providerId) {
                if (config.enabled === false) {
                  const providerIds = Object.keys(VIDEO_PROVIDERS);
                  const usableFallback = providerIds.find(
                    (id) => id !== providerId && isUsableMediaProvider(VIDEO_PROVIDERS[id], videoProvidersConfig[id])
                  );
                  const fallback = usableFallback ?? providerIds.find((id) => id !== providerId) ?? providerId;
                  const fallbackModels = resolveMediaModels(
                    VIDEO_PROVIDERS[fallback]?.models ?? [],
                    videoProvidersConfig[fallback]
                  );
                  return {
                    ...base,
                    videoProviderId: fallback,
                    videoModelId: resolveSelectedModel(state.videoModelId, fallbackModels),
                    ...!usableFallback ? { videoGenerationEnabled: false } : {}
                  };
                }
                const models = resolveMediaModels(
                  VIDEO_PROVIDERS[providerId]?.models ?? [],
                  mergedProvider
                );
                const videoModelId = resolveSelectedModel(state.videoModelId, models);
                if (videoModelId) {
                  return { ...base, videoModelId };
                }
              }
              return base;
            }),
            // Media generation toggle actions
            setImageGenerationEnabled: (enabled) => {
              if (enabled) {
                const cfg = get().imageProvidersConfig;
                const hasUsable = Object.values(cfg).some((c) => c.isServerConfigured || c.apiKey);
                if (!hasUsable) return;
              }
              set({ imageGenerationEnabled: enabled });
            },
            setVideoGenerationEnabled: (enabled) => {
              if (enabled) {
                const cfg = get().videoProvidersConfig;
                const hasUsable = Object.values(cfg).some((c) => c.isServerConfigured || c.apiKey);
                if (!hasUsable) return;
              }
              set({ videoGenerationEnabled: enabled });
            },
            setReviewOutlineEnabled: (enabled) => set({ reviewOutlineEnabled: enabled }),
            setTTSEnabled: (enabled) => set({ ttsEnabled: enabled }),
            setASREnabled: (enabled) => set({ asrEnabled: enabled }),
            // Custom audio provider actions
            addCustomTTSProvider: (id, name, baseUrl, requiresApiKey, defaultModel) => set((state) => ({
              ttsProvidersConfig: {
                ...state.ttsProvidersConfig,
                [id]: {
                  apiKey: "",
                  baseUrl: "",
                  enabled: true,
                  modelId: defaultModel || "",
                  customName: name,
                  customDefaultBaseUrl: baseUrl,
                  customVoices: [],
                  isBuiltIn: false,
                  requiresApiKey
                }
              },
              ttsProviderId: id
            })),
            removeCustomTTSProvider: (id) => set((state) => {
              if (!isCustomTTSProvider(id)) return state;
              const { [id]: _, ...rest } = state.ttsProvidersConfig;
              return {
                ttsProvidersConfig: rest,
                ...state.ttsProviderId === id && {
                  ttsProviderId: "browser-native-tts",
                  ttsVoice: "default"
                }
              };
            }),
            addCustomASRProvider: (id, name, baseUrl, requiresApiKey) => set((state) => ({
              asrProvidersConfig: {
                ...state.asrProvidersConfig,
                [id]: {
                  apiKey: "",
                  baseUrl: "",
                  enabled: true,
                  modelId: "",
                  customModels: [],
                  customName: name,
                  customDefaultBaseUrl: baseUrl,
                  isBuiltIn: false,
                  requiresApiKey
                }
              },
              asrProviderId: id
            })),
            removeCustomASRProvider: (id) => set((state) => {
              if (!isCustomASRProvider(id)) return state;
              const { [id]: _, ...rest } = state.asrProvidersConfig;
              return {
                asrProvidersConfig: rest,
                ...state.asrProviderId === id && {
                  asrProviderId: "browser-native",
                  asrLanguage: "zh"
                }
              };
            }),
            // Web Search actions
            setWebSearchProvider: (providerId) => set({ webSearchProviderId: providerId }),
            setWebSearchProviderConfig: (providerId, config) => set((state) => {
              const webSearchProvidersConfig = {
                ...state.webSearchProvidersConfig,
                [providerId]: {
                  ...state.webSearchProvidersConfig[providerId],
                  ...config
                }
              };
              if (state.webSearchProviderId === providerId && config.enabled === false) {
                return {
                  webSearchProvidersConfig,
                  webSearchProviderId: getDefaultWebSearchConfig().webSearchProviderId
                };
              }
              return { webSearchProvidersConfig };
            }),
            setBaiduSubSources: (sources) => set((state) => {
              const next = {
                ...state.baiduSubSources,
                ...sources
              };
              if (!next.webSearch && !next.baike && !next.scholar) {
                return state;
              }
              return { baiduSubSources: next };
            }),
            // Fetch server-configured providers and merge into local state
            fetchServerProviders: async () => {
              try {
                const res = await fetch("/api/server-providers");
                if (!res.ok) return;
                const data = await res.json();
                set((state) => {
                  const newProvidersConfig = { ...state.providersConfig };
                  for (const pid of Object.keys(newProvidersConfig)) {
                    const key2 = pid;
                    if (newProvidersConfig[key2]) {
                      newProvidersConfig[key2] = {
                        ...newProvidersConfig[key2],
                        isServerConfigured: false,
                        serverModels: void 0
                      };
                    }
                  }
                  for (const [pid, info] of Object.entries(data.providers)) {
                    const key2 = pid;
                    if (newProvidersConfig[key2]) {
                      const currentModels = newProvidersConfig[key2].models;
                      const filteredModels = info.models?.length ? info.models.map((id) => {
                        const currentModel = findModelById(key2, currentModels, id);
                        const builtInModel = findModelById(key2, PROVIDERS[key2]?.models, id);
                        const model = currentModel && builtInModel ? {
                          ...builtInModel,
                          ...currentModel,
                          name: currentModel.name === currentModel.id ? builtInModel.name : currentModel.name,
                          capabilities: {
                            ...builtInModel.capabilities,
                            ...currentModel.capabilities
                          }
                        } : currentModel ?? builtInModel;
                        return model ? { ...model, id, name: model.name || id } : { id, name: id };
                      }) : currentModels;
                      newProvidersConfig[key2] = {
                        ...newProvidersConfig[key2],
                        isServerConfigured: true,
                        serverModels: info.models,
                        models: filteredModels
                      };
                    }
                  }
                  const newTTSConfig = { ...state.ttsProvidersConfig };
                  for (const pid of Object.keys(newTTSConfig)) {
                    const key2 = pid;
                    if (newTTSConfig[key2]) {
                      newTTSConfig[key2] = {
                        ...newTTSConfig[key2],
                        isServerConfigured: false,
                        serverDisabled: false
                      };
                    }
                  }
                  for (const [pid, info] of Object.entries(data.tts)) {
                    const key2 = pid;
                    if (newTTSConfig[key2]) {
                      newTTSConfig[key2] = {
                        ...newTTSConfig[key2],
                        isServerConfigured: !info.disabled,
                        serverDisabled: info.disabled === true
                      };
                    }
                  }
                  const newASRConfig = { ...state.asrProvidersConfig };
                  for (const pid of Object.keys(newASRConfig)) {
                    const key2 = pid;
                    if (newASRConfig[key2]) {
                      newASRConfig[key2] = {
                        ...newASRConfig[key2],
                        isServerConfigured: false,
                        serverDisabled: false
                      };
                    }
                  }
                  for (const [pid, info] of Object.entries(data.asr)) {
                    const key2 = pid;
                    if (newASRConfig[key2]) {
                      newASRConfig[key2] = {
                        ...newASRConfig[key2],
                        isServerConfigured: !info.disabled,
                        serverDisabled: info.disabled === true
                      };
                    }
                  }
                  const newPDFConfig = { ...state.pdfProvidersConfig };
                  for (const pid of Object.keys(newPDFConfig)) {
                    const key2 = pid;
                    if (newPDFConfig[key2]) {
                      newPDFConfig[key2] = {
                        ...newPDFConfig[key2],
                        isServerConfigured: false
                      };
                    }
                  }
                  for (const pid of Object.keys(data.pdf)) {
                    const key2 = pid;
                    if (newPDFConfig[key2]) {
                      newPDFConfig[key2] = {
                        ...newPDFConfig[key2],
                        isServerConfigured: true
                      };
                    }
                  }
                  const newImageConfig = { ...state.imageProvidersConfig };
                  for (const pid of Object.keys(newImageConfig)) {
                    const key2 = pid;
                    if (newImageConfig[key2]) {
                      newImageConfig[key2] = {
                        ...newImageConfig[key2],
                        isServerConfigured: false,
                        serverDisabled: false
                      };
                    }
                  }
                  for (const [pid, info] of Object.entries(data.image)) {
                    const key2 = pid;
                    if (newImageConfig[key2]) {
                      newImageConfig[key2] = {
                        ...newImageConfig[key2],
                        isServerConfigured: !info.disabled,
                        serverDisabled: info.disabled === true,
                        ...info.models?.length ? {
                          customModels: info.models.map((id) => ({ id, name: id })),
                          replaceBuiltInModels: true
                        } : {}
                      };
                    }
                  }
                  const newVideoConfig = { ...state.videoProvidersConfig };
                  for (const pid of Object.keys(newVideoConfig)) {
                    const key2 = pid;
                    if (newVideoConfig[key2]) {
                      newVideoConfig[key2] = {
                        ...newVideoConfig[key2],
                        isServerConfigured: false,
                        serverDisabled: false
                      };
                    }
                  }
                  if (data.video) {
                    for (const [pid, info] of Object.entries(data.video)) {
                      const key2 = pid;
                      if (newVideoConfig[key2]) {
                        newVideoConfig[key2] = {
                          ...newVideoConfig[key2],
                          isServerConfigured: !info.disabled,
                          serverDisabled: info.disabled === true,
                          ...info.models?.length ? {
                            customModels: info.models.map((id) => ({ id, name: id })),
                            replaceBuiltInModels: true
                          } : {}
                        };
                      }
                    }
                  }
                  const newWebSearchConfig = { ...state.webSearchProvidersConfig };
                  for (const key2 of Object.keys(newWebSearchConfig)) {
                    newWebSearchConfig[key2] = {
                      ...newWebSearchConfig[key2],
                      isServerConfigured: false,
                      serverDisabled: false
                    };
                  }
                  if (data.webSearch) {
                    for (const [pid, info] of Object.entries(data.webSearch)) {
                      const key2 = pid;
                      if (newWebSearchConfig[key2]) {
                        newWebSearchConfig[key2] = {
                          ...newWebSearchConfig[key2],
                          isServerConfigured: !info.disabled,
                          serverDisabled: info.disabled === true
                        };
                      }
                    }
                  }
                  const buildFallback = (config) => [
                    // Server-disabled providers are never fallback targets.
                    ...Object.entries(config).filter(([, c]) => c.isServerConfigured && !c.serverDisabled).map(([id]) => id),
                    ...Object.entries(config).filter(([, c]) => !c.isServerConfigured && !c.serverDisabled && !!c.apiKey).map(([id]) => id)
                  ];
                  const llmFallback = buildFallback(newProvidersConfig);
                  const ttsFallback = buildFallback(newTTSConfig);
                  const asrFallback = buildFallback(newASRConfig);
                  const pdfFallback = buildFallback(newPDFConfig);
                  const imageFallback = buildFallback(newImageConfig);
                  const videoFallback = buildFallback(newVideoConfig);
                  const webSearchFallback = buildWebSearchFallbackOrder(newWebSearchConfig);
                  let validLLMProvider = validateProvider(
                    state.providerId,
                    newProvidersConfig,
                    llmFallback
                  );
                  const validTTSProvider = validateProvider(
                    state.ttsProviderId,
                    newTTSConfig,
                    ttsFallback,
                    "browser-native-tts"
                  );
                  const validASRProvider = validateProvider(
                    state.asrProviderId,
                    newASRConfig,
                    asrFallback,
                    "browser-native"
                  );
                  const validPDFProvider = validateProvider(
                    state.pdfProviderId,
                    newPDFConfig,
                    pdfFallback,
                    "unpdf"
                  );
                  let validImageProvider = validateProvider(
                    state.imageProviderId,
                    newImageConfig,
                    imageFallback
                  );
                  let validVideoProvider = validateProvider(
                    state.videoProviderId,
                    newVideoConfig,
                    videoFallback
                  );
                  const validWebSearchProvider = validateProvider(
                    state.webSearchProviderId,
                    newWebSearchConfig,
                    webSearchFallback,
                    "tavily"
                  );
                  if (!validLLMProvider && llmFallback.length > 0) {
                    validLLMProvider = llmFallback[0];
                  }
                  if (!validImageProvider && imageFallback.length > 0) {
                    validImageProvider = imageFallback[0];
                  }
                  if (!validVideoProvider && videoFallback.length > 0) {
                    validVideoProvider = videoFallback[0];
                  }
                  const llmModels = validLLMProvider ? newProvidersConfig[validLLMProvider]?.models ?? [] : [];
                  const validLLMModel = validLLMProvider ? resolveSelectedLLMModel(validLLMProvider, state.modelId, llmModels) : "";
                  const imageModels = validImageProvider ? resolveMediaModels(
                    IMAGE_PROVIDERS[validImageProvider]?.models ?? [],
                    newImageConfig[validImageProvider]
                  ) : [];
                  const validImageModel = validImageProvider ? resolveSelectedModel(state.imageModelId, imageModels) : "";
                  const videoModels = validVideoProvider ? resolveMediaModels(
                    VIDEO_PROVIDERS[validVideoProvider]?.models ?? [],
                    newVideoConfig[validVideoProvider]
                  ) : [];
                  const validVideoModel = validVideoProvider ? resolveSelectedModel(state.videoModelId, videoModels) : "";
                  const validTTSVoice = validTTSProvider !== state.ttsProviderId ? DEFAULT_TTS_VOICES[validTTSProvider] || "default" : state.ttsVoice;
                  const shouldDisableImage = !validImageProvider && state.imageGenerationEnabled;
                  const shouldDisableVideo = !validVideoProvider && state.videoGenerationEnabled;
                  let autoTtsProvider;
                  let autoTtsVoice;
                  let autoAsrProvider;
                  let autoPdfProvider;
                  let autoImageProvider;
                  let autoImageModel;
                  let autoVideoProvider;
                  let autoVideoModel;
                  let autoImageEnabled;
                  let autoVideoEnabled;
                  let autoTtsEnabled;
                  if (!state.autoConfigApplied) {
                    if (state.pdfProviderId === "unpdf") {
                      if (newPDFConfig["mineru-cloud"]?.isServerConfigured) {
                        autoPdfProvider = "mineru-cloud";
                      } else if (newPDFConfig.mineru?.isServerConfigured) {
                        autoPdfProvider = "mineru";
                      }
                    }
                    const serverTtsIds = Object.entries(data.tts).filter(([, info]) => !info.disabled).map(([id]) => id);
                    if (serverTtsIds.length > 0 && !newTTSConfig[state.ttsProviderId]?.isServerConfigured) {
                      autoTtsProvider = serverTtsIds[0];
                      autoTtsVoice = DEFAULT_TTS_VOICES[autoTtsProvider] || "default";
                    }
                    if (serverTtsIds.length > 0 && !state.ttsEnabled) {
                      autoTtsEnabled = true;
                    }
                    const serverAsrIds = Object.entries(data.asr).filter(([, info]) => !info.disabled).map(([id]) => id);
                    if (serverAsrIds.length > 0 && !newASRConfig[state.asrProviderId]?.isServerConfigured) {
                      autoAsrProvider = serverAsrIds[0];
                    }
                    const serverImageIds = Object.entries(data.image).filter(([, info]) => !info.disabled).map(([id]) => id);
                    if (serverImageIds.length > 0 && !newImageConfig[state.imageProviderId]?.isServerConfigured) {
                      autoImageProvider = serverImageIds[0];
                      const models = IMAGE_PROVIDERS[autoImageProvider]?.models;
                      if (models?.length) autoImageModel = models[0].id;
                    }
                    if (serverImageIds.length > 0 && !state.imageGenerationEnabled) {
                      autoImageEnabled = true;
                    }
                    const serverVideoIds = Object.entries(data.video || {}).filter(([, info]) => !info.disabled).map(([id]) => id);
                    if (serverVideoIds.length > 0 && !newVideoConfig[state.videoProviderId]?.isServerConfigured) {
                      autoVideoProvider = serverVideoIds[0];
                      const models = VIDEO_PROVIDERS[autoVideoProvider]?.models;
                      if (models?.length) autoVideoModel = models[0].id;
                    }
                    if (serverVideoIds.length > 0 && !state.videoGenerationEnabled) {
                      autoVideoEnabled = true;
                    }
                  }
                  return {
                    providersConfig: newProvidersConfig,
                    ttsProvidersConfig: newTTSConfig,
                    asrProvidersConfig: newASRConfig,
                    pdfProvidersConfig: newPDFConfig,
                    imageProvidersConfig: newImageConfig,
                    videoProvidersConfig: newVideoConfig,
                    webSearchProvidersConfig: newWebSearchConfig,
                    // Already clamped server-side (getParallelSceneConcurrency); this
                    // re-clamp is intentional belt-and-suspenders against a malformed
                    // response. The consumer (use-scene-generator) clamps once more.
                    parallelSceneConcurrency: Math.max(
                      0,
                      Math.floor(data.generation?.parallelSceneConcurrency ?? 0)
                    ),
                    autoConfigApplied: true,
                    // Validated selections
                    ...validLLMProvider !== state.providerId && {
                      providerId: validLLMProvider
                    },
                    ...validLLMModel !== state.modelId && { modelId: validLLMModel },
                    ...validTTSProvider !== state.ttsProviderId && {
                      ttsProviderId: validTTSProvider,
                      ttsVoice: validTTSVoice
                    },
                    ...validASRProvider !== state.asrProviderId && {
                      asrProviderId: validASRProvider
                    },
                    ...validPDFProvider !== state.pdfProviderId && {
                      pdfProviderId: validPDFProvider
                    },
                    ...validWebSearchProvider !== state.webSearchProviderId && {
                      webSearchProviderId: validWebSearchProvider
                    },
                    ...validImageProvider !== state.imageProviderId && {
                      imageProviderId: validImageProvider
                    },
                    ...validImageModel !== state.imageModelId && {
                      imageModelId: validImageModel
                    },
                    ...validVideoProvider !== state.videoProviderId && {
                      videoProviderId: validVideoProvider
                    },
                    ...validVideoModel !== state.videoModelId && {
                      videoModelId: validVideoModel
                    },
                    ...shouldDisableImage && { imageGenerationEnabled: false },
                    ...shouldDisableVideo && { videoGenerationEnabled: false },
                    // First-run auto-select overrides validation (autoConfigApplied guard).
                    // On first sync, auto-select picks the best provider. On subsequent syncs,
                    // auto* variables stay undefined so only validation spreads take effect.
                    ...autoPdfProvider && { pdfProviderId: autoPdfProvider },
                    ...autoTtsProvider && {
                      ttsProviderId: autoTtsProvider,
                      ttsVoice: autoTtsVoice
                    },
                    ...autoAsrProvider && { asrProviderId: autoAsrProvider },
                    ...autoImageProvider && {
                      imageProviderId: autoImageProvider
                    },
                    ...autoImageModel && { imageModelId: autoImageModel },
                    ...autoVideoProvider && {
                      videoProviderId: autoVideoProvider
                    },
                    ...autoVideoModel && { videoModelId: autoVideoModel },
                    ...autoImageEnabled !== void 0 && {
                      imageGenerationEnabled: autoImageEnabled
                    },
                    ...autoVideoEnabled !== void 0 && {
                      videoGenerationEnabled: autoVideoEnabled
                    },
                    ...autoTtsEnabled !== void 0 && { ttsEnabled: autoTtsEnabled }
                  };
                });
              } catch (e) {
                log6.warn("Failed to fetch server providers:", e);
              }
            }
          };
        },
        {
          name: "settings-storage",
          // `Partial<SettingsState>` because `migrate` below returns a partial —
          // that is what zustand infers as the persisted shape here.
          storage: createKVPersistStorage("account", {
            // One recovery attempt when a write is refused because hydration never
            // succeeded — the backend may have come back since. Routed through a
            // variable assigned below rather than naming the store directly: a
            // self-reference here would make the store's own type circular, and
            // every `useSettingsStore(s => ...)` selector would silently widen to
            // `any`.
            onWriteRefused: () => recovery.rehydrate?.()
          }),
          version: SETTINGS_PERSIST_VERSION,
          // Migrate persisted state
          migrate: (persistedState, version) => {
            const state = persistedState;
            if (version === 0) {
              if (state.providerId === "openai" && state.modelId === "gpt-4o-mini") {
                state.modelId = "";
              }
            }
            ensureBuiltInProviders(state);
            promoteLegacyCustomProviderBaseUrls(state);
            ensureBuiltInImageProviders(state);
            ensureBuiltInVideoProviders(state);
            ensureBuiltInPDFProviders(state);
            if (state.ttsModel && !state.ttsProviderId) {
              if (state.ttsModel === "openai-tts") {
                state.ttsProviderId = "openai-tts";
              } else if (state.ttsModel === "azure-tts") {
                state.ttsProviderId = "azure-tts";
              } else {
                state.ttsProviderId = "openai-tts";
              }
            }
            if (!state.ttsProvidersConfig || !state.asrProvidersConfig) {
              const defaultAudioConfig = getDefaultAudioConfig();
              Object.assign(state, defaultAudioConfig);
            }
            ensureBuiltInAudioProviders(state);
            ensureBuiltInWebSearchProviders(state);
            if (state.ttsModelId) {
              const pid = state.ttsProviderId;
              if (pid && state.ttsProvidersConfig?.[pid]) {
                state.ttsProvidersConfig[pid].modelId = state.ttsModelId;
              }
              delete state.ttsModelId;
            }
            if (state.asrModelId) {
              const pid = state.asrProviderId;
              if (pid && state.asrProvidersConfig?.[pid]) {
                state.asrProvidersConfig[pid].modelId = state.asrModelId;
              }
              delete state.asrModelId;
            }
            for (const [, cfg] of Object.entries(
              state.ttsProvidersConfig || {}
            )) {
              if (cfg.model && !cfg.modelId) {
                cfg.modelId = cfg.model;
                delete cfg.model;
              }
            }
            if (!state.pdfProvidersConfig) {
              const defaultPDFConfig = getDefaultPDFConfig();
              Object.assign(state, defaultPDFConfig);
            }
            if (!state.imageProvidersConfig) {
              const defaultImageConfig = getDefaultImageConfig();
              Object.assign(state, defaultImageConfig);
            }
            if (!state.videoProvidersConfig) {
              const defaultVideoConfig = getDefaultVideoConfig();
              Object.assign(state, defaultVideoConfig);
            }
            if (version < 2) {
              delete state.deepResearchProviderId;
              delete state.deepResearchProvidersConfig;
            }
            if (state.imageGenerationEnabled === void 0) {
              state.imageGenerationEnabled = false;
            }
            if (state.videoGenerationEnabled === void 0) {
              state.videoGenerationEnabled = false;
            }
            if (state.reviewOutlineEnabled === void 0) {
              state.reviewOutlineEnabled = false;
            }
            if (state.ttsEnabled === void 0) {
              state.ttsEnabled = false;
            }
            if (state.asrEnabled === void 0) {
              state.asrEnabled = true;
            }
            if (state.autoConfigApplied === void 0) {
              state.autoConfigApplied = true;
            }
            if (state.agentMode === void 0) {
              state.agentMode = "preset";
            }
            if (state.autoAgentCount === void 0) {
              state.autoAgentCount = 3;
            }
            if (state.thinkingConfigs === void 0) {
              state.thinkingConfigs = {};
            }
            if (!state.webSearchProvidersConfig) {
              const stateRecord = state;
              const oldApiKey = stateRecord.webSearchApiKey || "";
              const oldIsServerConfigured = stateRecord.webSearchIsServerConfigured || false;
              state.webSearchProviderId = "tavily";
              state.webSearchProvidersConfig = {
                tavily: {
                  apiKey: oldApiKey,
                  baseUrl: "",
                  enabled: true,
                  requiresApiKey: true,
                  isServerConfigured: oldIsServerConfigured
                },
                exa: {
                  apiKey: "",
                  baseUrl: WEB_SEARCH_PROVIDERS.exa.defaultBaseUrl || "",
                  enabled: true,
                  requiresApiKey: true
                },
                bocha: {
                  apiKey: "",
                  baseUrl: "",
                  enabled: true,
                  requiresApiKey: true
                },
                brave: {
                  apiKey: "",
                  baseUrl: WEB_SEARCH_PROVIDERS.brave.defaultBaseUrl || "",
                  enabled: true,
                  requiresApiKey: false
                },
                baidu: {
                  apiKey: "",
                  baseUrl: "",
                  enabled: true,
                  requiresApiKey: true
                },
                minimax: {
                  apiKey: "",
                  baseUrl: WEB_SEARCH_PROVIDERS.minimax.defaultBaseUrl || "",
                  enabled: true,
                  requiresApiKey: true
                },
                doubao: {
                  apiKey: "",
                  baseUrl: WEB_SEARCH_PROVIDERS.doubao.defaultBaseUrl || "",
                  enabled: true,
                  requiresApiKey: true
                },
                searxng: {
                  apiKey: "",
                  baseUrl: "",
                  enabled: true,
                  requiresApiKey: false
                }
              };
              delete stateRecord.webSearchApiKey;
              delete stateRecord.webSearchIsServerConfigured;
            }
            stripLegacyServerBaseUrl(state);
            if (version < 4 && state.ttsProvidersConfig) {
              for (const pid of Object.keys(TTS_PROVIDERS)) {
                const cfg = state.ttsProvidersConfig[pid];
                if (cfg) cfg.enabled = pid !== "browser-native-tts";
              }
            }
            ensureValidProviderSelections(state);
            ensureBuiltInAudioProviders(state);
            ensureBuiltInWebSearchProviders(state);
            state.thinkingConfigs = pruneThinkingConfigs(state.thinkingConfigs, state.providersConfig);
            return state;
          },
          // Custom merge: always sync built-in providers on every rehydrate,
          // so newly added providers/models appear without clearing cache.
          merge: (persistedState, currentState) => {
            const persisted = { ...persistedState };
            delete persisted.editInsertToolbarCollapsed;
            const merged = { ...currentState, ...persisted };
            ensureBuiltInProviders(merged);
            promoteLegacyCustomProviderBaseUrls(merged);
            ensureBuiltInAudioProviders(merged);
            ensureBuiltInImageProviders(merged);
            ensureBuiltInVideoProviders(merged);
            ensureBuiltInPDFProviders(merged);
            ensureBuiltInWebSearchProviders(merged);
            ensureValidProviderSelections(merged);
            stripLegacyServerBaseUrl(merged);
            const typedMerged = merged;
            typedMerged.thinkingConfigs = pruneThinkingConfigs(
              typedMerged.thinkingConfigs,
              typedMerged.providersConfig
            );
            return merged;
          }
        }
      )
    );
    recovery.rehydrate = () => useSettingsStore.persist.rehydrate();
    purgeLegacyPersistKey("settings-storage");
  }
});

// OpenMAIC/lib/orchestration/registry/types.ts
function getActionsForRole(role) {
  return ROLE_ACTIONS[role] || [...WHITEBOARD_ACTIONS];
}
var WHITEBOARD_ACTIONS, SLIDE_ACTIONS, ROLE_ACTIONS;
var init_types2 = __esm({
  "OpenMAIC/lib/orchestration/registry/types.ts"() {
    "use strict";
    WHITEBOARD_ACTIONS = [
      "wb_open",
      "wb_close",
      "wb_draw_text",
      "wb_draw_shape",
      "wb_draw_chart",
      "wb_draw_latex",
      "wb_draw_table",
      "wb_draw_line",
      "wb_draw_code",
      "wb_edit_code",
      "wb_clear",
      "wb_delete"
    ];
    SLIDE_ACTIONS = ["spotlight", "laser", "play_video"];
    ROLE_ACTIONS = {
      teacher: [...SLIDE_ACTIONS, ...WHITEBOARD_ACTIONS],
      assistant: [...WHITEBOARD_ACTIONS],
      student: [...WHITEBOARD_ACTIONS]
    };
  }
});

// OpenMAIC/lib/types/roundtable.ts
var init_roundtable = __esm({
  "OpenMAIC/lib/types/roundtable.ts"() {
    "use strict";
  }
});

// OpenMAIC/lib/store/user-profile.ts
import { create as create3 } from "zustand";
import { persist as persist2 } from "zustand/middleware";
var recovery2, AVATAR_OPTIONS, useUserProfileStore;
var init_user_profile = __esm({
  "OpenMAIC/lib/store/user-profile.ts"() {
    "use strict";
    init_kv_persist();
    recovery2 = {};
    AVATAR_OPTIONS = [
      "/avatars/user.png",
      "/avatars/teacher-2.png",
      "/avatars/assist-2.png",
      "/avatars/clown-2.png",
      "/avatars/curious-2.png",
      "/avatars/note-taker-2.png",
      "/avatars/thinker-2.png"
    ];
    useUserProfileStore = create3()(
      persist2(
        (set) => ({
          avatar: AVATAR_OPTIONS[0],
          nickname: "",
          bio: "",
          setAvatar: (avatar) => set({ avatar }),
          setNickname: (nickname) => set({ nickname }),
          setBio: (bio) => set({ bio })
        }),
        {
          name: "user-profile-storage",
          storage: createKVPersistStorage("account", {
            // One recovery attempt when a write is refused because hydration never
            // succeeded — the backend may have come back since. Routed through a
            // variable assigned below rather than naming the store directly: a
            // self-reference here would make the store's own type circular and
            // silently widen every selector to `any`.
            onWriteRefused: () => recovery2.rehydrate?.()
          })
        }
      )
    );
    recovery2.rehydrate = () => useUserProfileStore.persist.rehydrate();
    purgeLegacyPersistKey("user-profile-storage");
  }
});

// OpenMAIC/lib/pbl/v2/types.ts
function isNonArrayObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function isObjectArray(value) {
  return Array.isArray(value) && value.every(isNonArrayObject);
}
function hasPBLProjectV2Containers(value) {
  if (!isNonArrayObject(value)) return false;
  if (!isObjectArray(value.milestones) || !isObjectArray(value.roles) || !isObjectArray(value.submissions) || !isObjectArray(value.evaluations) || !isObjectArray(value.threads) || !isObjectArray(value.engagementEvents)) {
    return false;
  }
  if (value.milestones.some((milestone) => !isObjectArray(milestone.microtasks))) return false;
  if (value.threads.some((thread) => !isObjectArray(thread.messages))) return false;
  if (value.gains !== void 0 && !Array.isArray(value.gains)) return false;
  if (value.runtimeEvents !== void 0 && !isObjectArray(value.runtimeEvents)) return false;
  if (value.scenario !== void 0) {
    if (!isNonArrayObject(value.scenario)) return false;
    if (!isObjectArray(value.scenario.characters)) return false;
  }
  return true;
}
function isRunnablePBLProjectV2(value) {
  if (!hasPBLProjectV2Containers(value)) return false;
  const project = value;
  return project.roles.some(
    (role) => role.type === "instructor" && typeof role.id === "string" && role.id.trim().length > 0 && typeof role.name === "string"
  ) && project.milestones.length > 0 && project.milestones.every(
    (milestone) => milestone.microtasks.length > 0 && milestone.microtasks.every(
      (microtask) => typeof microtask.id === "string" && microtask.id.trim().length > 0 && typeof microtask.title === "string"
    )
  );
}
var init_types3 = __esm({
  "OpenMAIC/lib/pbl/v2/types.ts"() {
    "use strict";
  }
});

// OpenMAIC/lib/pbl/legacy/read.ts
function isEmptyLegacyPBLConfig(config) {
  if (!config || Array.isArray(config) || typeof config !== "object" || !config?.projectInfo || Array.isArray(config.projectInfo) || typeof config.projectInfo !== "object" || !Array.isArray(config?.agents) || config.agents.some(
    (agent) => !agent || Array.isArray(agent) || typeof agent !== "object" || agent.name !== void 0 && agent.name !== null && typeof agent.name !== "string"
  ) || !config?.issueboard || Array.isArray(config.issueboard) || typeof config.issueboard !== "object" || !Array.isArray(config.issueboard?.issues) || config.issueboard.issues.some(
    (issue) => !issue || Array.isArray(issue) || typeof issue !== "object"
  ) || !config?.chat || Array.isArray(config.chat) || typeof config.chat !== "object" || !Array.isArray(config.chat?.messages) || config.chat.messages.some(
    (message) => !message || Array.isArray(message) || typeof message !== "object"
  ) || config.selectedRole !== void 0 && config.selectedRole !== null && typeof config.selectedRole !== "string") {
    return true;
  }
  return !config?.projectInfo?.title && !config?.projectInfo?.description && config.agents.length === 0 && config.issueboard.issues.length === 0 && config.chat.messages.length === 0;
}
function resolvePBLContent(content) {
  if (isRunnablePBLProjectV2(content.projectV2)) {
    return { kind: "v2", projectV2: content.projectV2 };
  }
  if (content.projectConfig != null && !isEmptyLegacyPBLConfig(content.projectConfig) && content.projectConfig.issueboard.issues.length > 0) {
    return { kind: "legacy", projectConfig: content.projectConfig };
  }
  return { kind: "empty" };
}
var init_read = __esm({
  "OpenMAIC/lib/pbl/legacy/read.ts"() {
    "use strict";
    init_types3();
  }
});

// OpenMAIC/lib/document-store/validators.ts
import {
  isActionType,
  validateAction,
  validateScene,
  validateStage
} from "@openmaic/dsl";
function objectValue(value) {
  return typeof value === "object" && value !== null ? value : null;
}
function requiredString(value, key2, errors) {
  if (typeof value[key2] !== "string" || value[key2] === "") {
    errors.push({ path: `/${key2}`, message: `expected non-empty string \`${key2}\`` });
  }
}
var validateAppScene, validateAppStage;
var init_validators = __esm({
  "OpenMAIC/lib/document-store/validators.ts"() {
    "use strict";
    init_types3();
    init_read();
    validateAppScene = (scene) => {
      const value = objectValue(scene);
      if (!value) {
        return { valid: false, errors: [{ path: "/", message: "scene must be an object" }] };
      }
      if (value.type === "slide" || value.type === "quiz") return validateScene(scene);
      const errors = [];
      requiredString(value, "id", errors);
      requiredString(value, "stageId", errors);
      requiredString(value, "title", errors);
      if (typeof value.order !== "number" || !Number.isFinite(value.order)) {
        errors.push({ path: "/order", message: "expected finite number `order`" });
      }
      const content = objectValue(value.content);
      if (value.type !== "interactive" && value.type !== "pbl") {
        errors.push({
          path: "/type",
          message: `unknown app scene type: ${JSON.stringify(value.type)}`
        });
      } else if (!content) {
        errors.push({ path: "/content", message: "scene `content` must be an object" });
      } else if (content.type !== value.type) {
        errors.push({
          path: "/content/type",
          message: `content type ${JSON.stringify(content.type)} does not match scene type ${JSON.stringify(value.type)}`
        });
      } else if (value.type === "interactive") {
        if (typeof content.html !== "string" && typeof content.url !== "string") {
          errors.push({
            path: "/content",
            message: "interactive content requires `html` or `url` as a string"
          });
        }
        if (content.url !== void 0 && typeof content.url !== "string") {
          errors.push({ path: "/content/url", message: "`url` must be a string when present" });
        }
        if (content.html !== void 0 && typeof content.html !== "string") {
          errors.push({ path: "/content/html", message: "`html` must be a string when present" });
        }
        if (content.widgetConfig !== void 0 && objectValue(content.widgetConfig) === null) {
          errors.push({
            path: "/content/widgetConfig",
            message: "`widgetConfig` must be an object when present"
          });
        }
      } else if (value.type === "pbl" && content.projectConfig !== void 0 && (!objectValue(content.projectConfig) || Array.isArray(content.projectConfig))) {
        errors.push({ path: "/content/projectConfig", message: "`projectConfig` must be an object" });
      } else if (value.type === "pbl" && // null is treated like absent so documents stored before projectV2
      // validation existed keep saving; the renderer applies the same rule.
      content.projectV2 != null && // Every scene accepted by the old write barrier carried projectConfig, so
      // stored scenes with both fields are the pre-cutover hybrid cohort. Preserve
      // a damaged projectV2 there as inert bytes — but only when the legacy config
      // is structurally sound and non-empty (real stored v1 data, the renderer's
      // actual fallback); an empty stub like `{}` must not disable v2 validation.
      // V2-only scenes are new planner writes, where strict container validation
      // enforces planner output quality.
      !(objectValue(content.projectConfig) && !Array.isArray(content.projectConfig) && !isEmptyLegacyPBLConfig(content.projectConfig)) && !hasPBLProjectV2Containers(content.projectV2)) {
        errors.push({
          path: "/content/projectV2",
          message: "`projectV2` must contain milestones, roles and threads arrays"
        });
      }
      if (value.actions !== void 0) {
        if (!Array.isArray(value.actions)) {
          errors.push({ path: "/actions", message: "`actions` must be an array" });
        } else {
          value.actions.forEach((action, index) => {
            if (action === null || typeof action !== "object" || Array.isArray(action)) {
              errors.push({ path: `/actions/${index}`, message: "action must be an object" });
              return;
            }
            const record = action;
            if (typeof record.id !== "string") {
              errors.push({ path: `/actions/${index}/id`, message: "expected string `id`" });
            }
            if (typeof record.type !== "string") {
              errors.push({ path: `/actions/${index}/type`, message: "expected string `type`" });
              return;
            }
            if (isActionType(record.type)) {
              const variant = validateAction(record);
              if (!variant.valid) {
                for (const issue of variant.errors ?? []) {
                  errors.push({
                    path: `/actions/${index}${issue.path === "/" ? "" : issue.path}`,
                    message: issue.message
                  });
                }
              }
            }
          });
        }
      }
      return errors.length === 0 ? { valid: true } : { valid: false, errors };
    };
    validateAppStage = (stage) => {
      const base = validateStage(stage);
      const value = objectValue(stage);
      if (!value || !Object.prototype.hasOwnProperty.call(value, "currentSceneId")) return base;
      const issue = {
        path: "/currentSceneId",
        message: "`currentSceneId` is device playback state and is not allowed on AppStage"
      };
      return base.valid ? { valid: false, errors: [issue] } : { valid: false, errors: [...base.errors, issue] };
    };
  }
});

// OpenMAIC/lib/document-store/config.ts
function configureDocumentStorage(next) {
  assertDocumentStorageConfigurable();
  options = { store: next.store };
}
function assertDocumentStorageConfigurable() {
  if (resolutionStarted) {
    throw new Error(
      "configureDocumentStorage must be called at module-level bootstrap, before any document consumer runs \u2014 a component effect is too late. Document storage resolution has already started; configuration remains sealed even if resolution failed. Retry the document consumer to retry resolution."
    );
  }
  if (options) {
    throw new Error("Document storage has already been configured");
  }
}
function registerDocumentStorageResetHook(hook) {
  resetHooks.push(hook);
}
function resolveConfiguredDocumentStore() {
  resolutionStarted = true;
  const configured = options?.store;
  return typeof configured === "function" ? configured({ validateScene: validateAppScene, validateStage: validateAppStage }) : configured;
}
var options, resolutionStarted, resetHooks;
var init_config = __esm({
  "OpenMAIC/lib/document-store/config.ts"() {
    "use strict";
    init_validators();
    resolutionStarted = false;
    resetHooks = [];
  }
});

// OpenMAIC/lib/runtime/config.ts
function configureRuntimeStorage(next) {
  assertRuntimeStorageConfigurable();
  options2 = { store: next.store, learnerKey: next.learnerKey };
}
function assertRuntimeStorageConfigurable() {
  if (resolutionStarted2) {
    throw new Error(
      "configureRuntimeStorage must be called at module-level bootstrap, before any runtime consumer runs \u2014 a component effect is too late. Runtime storage resolution has already started; configuration remains sealed even if resolution failed. Retry the runtime consumer to retry resolution."
    );
  }
  if (options2) {
    throw new Error("Runtime storage has already been configured");
  }
}
function registerRuntimeStorageResetHook(hook) {
  resetHooks2.push(hook);
}
function resolveConfiguredRuntimeStore() {
  resolutionStarted2 = true;
  const configured = options2?.store;
  return typeof configured === "function" ? configured() : configured;
}
function resolveConfiguredLearnerKey() {
  resolutionStarted2 = true;
  const provider = options2?.learnerKey;
  return provider ? Promise.resolve().then(provider) : void 0;
}
var options2, resolutionStarted2, resetHooks2;
var init_config2 = __esm({
  "OpenMAIC/lib/runtime/config.ts"() {
    "use strict";
    resolutionStarted2 = false;
    resetHooks2 = [];
  }
});

// OpenMAIC/lib/runtime/learner-key.ts
import { BrowserKVStore as BrowserKVStore2 } from "@openmaic/storage";
function mintLearnerKey() {
  const uuid = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `anon:${uuid}`;
}
async function mintPersisted(store2) {
  const minted = mintLearnerKey();
  await store2.set(LEARNER_KEY_KV_KEY, minted, "device");
  return await store2.get(LEARNER_KEY_KV_KEY, "device") ?? minted;
}
async function readOrMint(store2) {
  const existing = await store2.get(LEARNER_KEY_KV_KEY, "device");
  if (existing) return existing;
  if (typeof navigator !== "undefined" && navigator.locks) {
    return await navigator.locks.request(LEARNER_KEY_LOCK, async () => {
      const won = await store2.get(LEARNER_KEY_KV_KEY, "device");
      return won ?? mintPersisted(store2);
    });
  }
  return mintPersisted(store2);
}
function getLearnerKey(kv) {
  if (kv) return readOrMint(kv);
  const configured = configuredInFlight ?? resolveConfiguredLearnerKey();
  if (configured) {
    configuredInFlight ??= configured.catch((error) => {
      configuredInFlight = void 0;
      throw error;
    });
    return configuredInFlight;
  }
  defaultInFlight ??= readOrMint(defaultKv2 ??= new BrowserKVStore2()).catch((error) => {
    defaultInFlight = void 0;
    throw error;
  });
  return defaultInFlight;
}
var LEARNER_KEY_KV_KEY, LEARNER_KEY_LOCK, defaultKv2, defaultInFlight, configuredInFlight;
var init_learner_key = __esm({
  "OpenMAIC/lib/runtime/learner-key.ts"() {
    "use strict";
    init_config2();
    LEARNER_KEY_KV_KEY = "runtime.learnerKey";
    LEARNER_KEY_LOCK = "maic:learner-key";
    registerRuntimeStorageResetHook(() => {
      configuredInFlight = void 0;
      defaultInFlight = void 0;
      defaultKv2 = void 0;
    });
  }
});

// OpenMAIC/lib/persistence/bootstrap.ts
import { BrowserKVStore as BrowserKVStore3, HttpDocumentStore } from "@openmaic/storage";
import { HttpRuntimeStore } from "@openmaic/storage/runtime/http";
function isBrowserPersistenceEnabled() {
  return typeof window !== "undefined" && process.env.NEXT_PUBLIC_PERSISTENCE === "1";
}
function getPersistenceLearnerKey() {
  if (!isBrowserPersistenceEnabled()) {
    return Promise.reject(new Error("Browser persistence is not enabled"));
  }
  return learnerKeyPromise ??= getLearnerKey(deviceKv ??= new BrowserKVStore3()).catch(
    (error) => {
      learnerKeyPromise = void 0;
      throw error;
    }
  );
}
async function getPersistenceRequestHeaders() {
  if (!isBrowserPersistenceEnabled()) return {};
  const resolvedLearnerKey = await getPersistenceLearnerKey();
  const token = process.env.NEXT_PUBLIC_PERSISTENCE_TOKEN;
  return {
    "x-learner-key": resolvedLearnerKey,
    ...token ? { authorization: `Bearer ${token}` } : {}
  };
}
var deviceKv, learnerKeyPromise;
var init_bootstrap = __esm({
  "OpenMAIC/lib/persistence/bootstrap.ts"() {
    "use strict";
    init_config();
    init_config2();
    init_learner_key();
    if (isBrowserPersistenceEnabled()) {
      const learnerKey = getPersistenceLearnerKey;
      const headers = getPersistenceRequestHeaders;
      const runtimeOptions = {
        store: () => new HttpRuntimeStore({
          baseUrl: "/api/persistence",
          headers
        }),
        learnerKey
      };
      const documentOptions = {
        store: ({ validateScene: validateScene2, validateStage: validateStage2 }) => new HttpDocumentStore({
          baseUrl: "/api/persistence",
          headers,
          validateScene: validateScene2,
          validateStage: validateStage2
        })
      };
      try {
        assertRuntimeStorageConfigurable();
        assertDocumentStorageConfigurable();
        configureRuntimeStorage(runtimeOptions);
        configureDocumentStorage(documentOptions);
      } catch (error) {
        console.error(
          "FATAL: server-backed persistence bootstrap failed; no storage seam changes were applied",
          error
        );
      }
    }
  }
});

// OpenMAIC/lib/whiteboard/viewport.ts
function normalizeWhiteboardViewportRatio(ratio) {
  if (!Number.isFinite(ratio)) return 9 / 16;
  const repaired = ratio > 1 ? 1 / ratio : ratio;
  return Math.min(Math.max(repaired, MIN_WHITEBOARD_VIEWPORT_RATIO), MAX_WHITEBOARD_VIEWPORT_RATIO);
}
var MIN_WHITEBOARD_VIEWPORT_RATIO, MAX_WHITEBOARD_VIEWPORT_RATIO;
var init_viewport = __esm({
  "OpenMAIC/lib/whiteboard/viewport.ts"() {
    "use strict";
    MIN_WHITEBOARD_VIEWPORT_RATIO = 0.4;
    MAX_WHITEBOARD_VIEWPORT_RATIO = 1;
  }
});

// OpenMAIC/lib/whiteboard/runtime/types.ts
var WHITEBOARD_RUNTIME_PAYLOAD_VERSION, LEGACY_WHITEBOARD_SOURCE_KIND;
var init_types4 = __esm({
  "OpenMAIC/lib/whiteboard/runtime/types.ts"() {
    "use strict";
    WHITEBOARD_RUNTIME_PAYLOAD_VERSION = 1;
    LEGACY_WHITEBOARD_SOURCE_KIND = "stage.whiteboard";
  }
});

// OpenMAIC/lib/whiteboard/runtime/validate.ts
import { normalizeElement } from "@openmaic/dsl";
import sceneSchemaJson from "@openmaic/dsl/schema/scene.schema.json";
function objectValue2(value) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null ? value : null;
}
function hasOnlyAllowedOwnKeys(value, allowed) {
  return Object.keys(value).every((key2) => allowed.has(key2));
}
function hasAllRequiredOwnKeys(value, required) {
  return Array.from(required).every((key2) => Object.hasOwn(value, key2));
}
function hasExactOwnKeys(value, expected) {
  return Object.keys(value).length === expected.size && hasOnlyAllowedOwnKeys(value, expected) && hasAllRequiredOwnKeys(value, expected);
}
function isSafeIdentifier(value, maxLength = MAX_OPERATION_ID_LENGTH) {
  return typeof value === "string" && value.length > 0 && value.length <= maxLength && SAFE_ID.test(value);
}
function decodeRefName(ref) {
  const match = ref.match(/^#\/definitions\/(.+)$/u);
  return match ? match[1].replace(/~1/gu, "/").replace(/~0/gu, "~") : null;
}
function resolveSchema(schema, seen = /* @__PURE__ */ new Set()) {
  if (!schema.$ref) return schema;
  const name = decodeRefName(schema.$ref);
  if (!name || seen.has(name)) return schema;
  const target = schemaDefinitions[name];
  if (!target) return schema;
  seen.add(name);
  return resolveSchema(target, seen);
}
function schemaTypeMatches(value, type) {
  switch (type) {
    case "string":
      return typeof value === "string";
    case "number":
      return typeof value === "number" && Number.isFinite(value);
    case "boolean":
      return typeof value === "boolean";
    case "object":
      return objectValue2(value) !== null;
    case "array":
      return Array.isArray(value);
    case "null":
      return value === null;
    default:
      return false;
  }
}
function validateSchema(value, input, path6) {
  const schema = resolveSchema(input);
  if (schema.$ref) return `${path6} contains an unresolved schema reference`;
  if (Object.keys(schema).some((key2) => !SUPPORTED_SCHEMA_KEYWORDS.has(key2))) {
    return `${path6} uses an unsupported schema construct`;
  }
  if (schema.anyOf) {
    if (schema.anyOf.some((option) => validateSchema(value, option, path6) === null)) return null;
    return `${path6} does not match any allowed schema`;
  }
  if ("const" in schema && !Object.is(value, schema.const)) {
    return `${path6} must be ${JSON.stringify(schema.const)}`;
  }
  if (schema.enum && !schema.enum.some((item) => Object.is(item, value))) {
    return `${path6} is not an allowed value`;
  }
  if (schema.type) {
    const types = Array.isArray(schema.type) ? schema.type : [schema.type];
    if (!types.some((type) => schemaTypeMatches(value, type))) {
      return `${path6} has the wrong type`;
    }
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return `${path6} must be finite`;
    if (schema.minimum !== void 0 && value < schema.minimum) return `${path6} is too small`;
    if (schema.maximum !== void 0 && value > schema.maximum) return `${path6} is too large`;
  }
  if (schema.properties) {
    const object = objectValue2(value);
    if (!object) return `${path6} must be a plain object`;
    for (const required of schema.required ?? []) {
      if (!Object.hasOwn(object, required)) return `${path6}.${required} is required`;
    }
    if (schema.additionalProperties === false) {
      for (const key2 of Object.keys(object)) {
        if (!Object.hasOwn(schema.properties, key2)) return `${path6}.${key2} is out of contract`;
      }
    }
    for (const [key2, nested] of Object.entries(schema.properties)) {
      if (Object.hasOwn(object, key2)) {
        const error = validateSchema(object[key2], nested, `${path6}.${key2}`);
        if (error) return error;
      }
    }
  }
  if (schema.items) {
    if (!Array.isArray(value)) return `${path6} must be an array`;
    if (schema.minItems !== void 0 && value.length < schema.minItems) {
      return `${path6} has too few items`;
    }
    if (schema.maxItems !== void 0 && value.length > schema.maxItems) {
      return `${path6} has too many items`;
    }
    if (Array.isArray(schema.items)) {
      if (value.length !== schema.items.length) return `${path6} has the wrong tuple length`;
      for (let index = 0; index < value.length; index += 1) {
        const error = validateSchema(value[index], schema.items[index], `${path6}[${index}]`);
        if (error) return error;
      }
    } else {
      for (let index = 0; index < value.length; index += 1) {
        const error = validateSchema(value[index], schema.items, `${path6}[${index}]`);
        if (error) return error;
      }
    }
  }
  return null;
}
function validateElement(element) {
  const definitionName = ELEMENT_SCHEMA_DEFINITION_BY_TYPE.get(element.type);
  const schema = definitionName ? schemaDefinitions[definitionName] : void 0;
  return schema ? validateSchema(element, schema, "element") : "unknown element type";
}
function validateCodeLineTargetIds(value, label) {
  if (!Array.isArray(value) || value.length === 0) throw new Error(`${label} must be non-empty`);
  const ids = /* @__PURE__ */ new Set();
  for (const id of value) {
    if (typeof id !== "string") throw new Error(`${label} contains an invalid id`);
    if (ids.has(id)) throw new Error(`${label} contains a duplicate id`);
    ids.add(id);
  }
}
function validateCodeLines(value, label, options4) {
  if (!Array.isArray(value) || options4.nonEmpty && value.length === 0) {
    throw new Error(`${label} must be ${options4.nonEmpty ? "a non-empty array" : "an array"}`);
  }
  const ids = /* @__PURE__ */ new Set();
  for (const candidate of value) {
    const line = objectValue2(candidate);
    if (!line || !hasExactOwnKeys(line, CODE_LINE_KEYS)) {
      throw new Error(`${label} contains an invalid code line`);
    }
    if (!isSafeIdentifier(line.id)) throw new Error(`${label} contains an invalid line id`);
    if (ids.has(line.id)) throw new Error(`${label} contains a duplicate line id`);
    if (typeof line.content !== "string") throw new Error(`${label} contains invalid content`);
    ids.add(line.id);
  }
}
function normalizeAndValidateWhiteboardElement(value) {
  assertLosslessJson(value, "$");
  const normalized = normalizeElement(value);
  if (!isSafeIdentifier(normalized.id)) throw new Error("invalid element id");
  const error = validateElement(normalized);
  if (error) throw new Error(error);
  return cloneCanonicalJson(normalized);
}
function assertLosslessJson(value, path6, seen = /* @__PURE__ */ new Set()) {
  if (value === null || typeof value === "boolean" || typeof value === "string") {
    if (typeof value === "string" && (value.includes("\0") || /[\uD800-\uDFFF]/u.test(value))) {
      throw new Error(`${path6} contains a non-portable string`);
    }
    return;
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value) || Object.is(value, -0))
      throw new Error(`${path6} is not finite JSON`);
    return;
  }
  if (typeof value !== "object") throw new Error(`${path6} is not JSON`);
  if (seen.has(value)) throw new Error(`${path6} is cyclic`);
  seen.add(value);
  try {
    if (Array.isArray(value)) {
      for (const key2 of Reflect.ownKeys(value)) {
        if (key2 === "length") continue;
        const index = typeof key2 === "string" ? Number(key2) : Number.NaN;
        if (!Number.isInteger(index) || index < 0 || index >= value.length || String(index) !== key2) {
          throw new Error(`${path6} has a non-index array property`);
        }
        const descriptor = Object.getOwnPropertyDescriptor(value, key2);
        if (!descriptor?.enumerable || descriptor.get || descriptor.set) {
          throw new Error(`${path6}[${String(key2)}] is not a plain data property`);
        }
      }
      for (let index = 0; index < value.length; index += 1) {
        if (!Object.hasOwn(value, index)) throw new Error(`${path6}[${index}] is sparse`);
        assertLosslessJson(value[index], `${path6}[${index}]`, seen);
      }
      return;
    }
    const object = objectValue2(value);
    if (!object) throw new Error(`${path6} is not a plain object`);
    for (const key2 of Reflect.ownKeys(object)) {
      if (typeof key2 !== "string") throw new Error(`${path6} has a symbol key`);
      if (key2.includes("\0") || /[\uD800-\uDFFF]/u.test(key2)) {
        throw new Error(`${path6} has a non-portable object key`);
      }
      const descriptor = Object.getOwnPropertyDescriptor(object, key2);
      if (!descriptor?.enumerable || descriptor.get || descriptor.set) {
        throw new Error(`${path6}.${key2} is not a plain data property`);
      }
      assertLosslessJson(object[key2], `${path6}.${key2}`, seen);
    }
  } finally {
    seen.delete(value);
  }
}
function cloneCanonicalJson(value) {
  assertLosslessJson(value, "$");
  const clone2 = (input) => {
    if (Array.isArray(input)) return input.map(clone2);
    const object = objectValue2(input);
    if (!object) return input;
    const output = {};
    for (const key2 of Object.keys(object).sort()) {
      Object.defineProperty(output, key2, {
        value: clone2(object[key2]),
        enumerable: true,
        writable: true,
        configurable: true
      });
    }
    return output;
  };
  return clone2(value);
}
function canonicalJson(value) {
  return JSON.stringify(cloneCanonicalJson(value));
}
function normalizeAndValidateLegacyWhiteboard(value) {
  assertLosslessJson(value, "$");
  const board = objectValue2(value);
  if (!board || !hasOnlyAllowedOwnKeys(board, WHITEBOARD_KEYS) || !hasAllRequiredOwnKeys(board, REQUIRED_WHITEBOARD_KEYS))
    throw new Error("invalid whiteboard envelope");
  if (!isSafeIdentifier(board.id)) throw new Error("invalid whiteboard id");
  if (typeof board.viewportSize !== "number" || !Number.isFinite(board.viewportSize)) {
    throw new Error("invalid whiteboard viewportSize");
  }
  if (typeof board.viewportRatio !== "number" || !Number.isFinite(board.viewportRatio)) {
    throw new Error("invalid whiteboard viewportRatio");
  }
  const viewportRatio = normalizeWhiteboardViewportRatio(board.viewportRatio);
  if (!Array.isArray(board.elements)) throw new Error("invalid whiteboard elements");
  if (Object.hasOwn(board, "background")) {
    const error = validateSchema(
      board.background,
      schemaDefinitions.SlideBackground ?? {},
      "background"
    );
    if (error) throw new Error(error);
  }
  if (Object.hasOwn(board, "animations")) {
    if (!Array.isArray(board.animations)) throw new Error("invalid whiteboard animations");
    for (const animation of board.animations) {
      const error = validateSchema(animation, schemaDefinitions.PPTAnimation ?? {}, "animation");
      if (error) throw new Error(error);
    }
  }
  if (Object.hasOwn(board, "script") && typeof board.script !== "string") {
    throw new Error("invalid whiteboard script");
  }
  const ids = /* @__PURE__ */ new Set();
  const elements = board.elements.map((candidate) => {
    const normalized = normalizeAndValidateWhiteboardElement(candidate);
    if (ids.has(normalized.id)) throw new Error("duplicate element id");
    ids.add(normalized.id);
    return normalized;
  });
  return cloneCanonicalJson({ ...board, elements, viewportRatio });
}
function validateWhiteboardRuntimePayload(payload) {
  try {
    assertLosslessJson(payload, "$");
    const value = objectValue2(payload);
    if (!value || !hasExactOwnKeys(value, PAYLOAD_KEYS)) {
      throw new Error("payload keys are invalid");
    }
    if (value.payloadVersion !== WHITEBOARD_RUNTIME_PAYLOAD_VERSION) {
      throw new Error("payloadVersion must be 1");
    }
    if (!isSafeIdentifier(value.operationId)) throw new Error("operationId is invalid");
    const operation = objectValue2(value.operation);
    if (!operation) throw new Error("operation is invalid");
    if (operation.kind === "legacy_snapshot_imported") {
      if (!hasExactOwnKeys(operation, LEGACY_OPERATION_KEYS)) {
        throw new Error("operation is invalid");
      }
      const source = objectValue2(operation.source);
      if (!source || !hasExactOwnKeys(source, SOURCE_KEYS)) throw new Error("source is invalid");
      if (source.kind !== LEGACY_WHITEBOARD_SOURCE_KIND) throw new Error("source kind is invalid");
      if (typeof source.fingerprint !== "string" || source.fingerprint.length !== MAX_FINGERPRINT_LENGTH || !SHA256.test(source.fingerprint)) {
        throw new Error("source fingerprint is invalid");
      }
      const normalized = normalizeAndValidateLegacyWhiteboard(operation.whiteboard);
      const whiteboard = operation.whiteboard;
      const expected = { ...whiteboard, viewportRatio: normalized.viewportRatio };
      if (canonicalJson(normalized) !== canonicalJson(expected)) {
        throw new Error("whiteboard payload is not canonical");
      }
    } else if (operation.kind === "element_added") {
      if (!hasExactOwnKeys(operation, ELEMENT_ADDED_OPERATION_KEYS)) {
        throw new Error("operation is invalid");
      }
      const normalized = normalizeAndValidateWhiteboardElement(operation.element);
      if (canonicalJson(normalized) !== canonicalJson(operation.element)) {
        throw new Error("element payload is not canonical");
      }
    } else if (operation.kind === "element_deleted") {
      if (!hasExactOwnKeys(operation, ELEMENT_DELETED_OPERATION_KEYS)) {
        throw new Error("operation is invalid");
      }
      if (!isSafeIdentifier(operation.elementId)) throw new Error("elementId is invalid");
    } else if (operation.kind === "elements_cleared") {
      if (!hasExactOwnKeys(operation, ELEMENTS_CLEARED_OPERATION_KEYS)) {
        throw new Error("operation is invalid");
      }
    } else if (operation.kind === "code_lines_edited") {
      if (!hasExactOwnKeys(operation, CODE_LINES_EDITED_OPERATION_KEYS)) {
        throw new Error("operation is invalid");
      }
      if (!isSafeIdentifier(operation.elementId)) throw new Error("elementId is invalid");
      const edit = objectValue2(operation.edit);
      if (!edit) throw new Error("edit is invalid");
      if (edit.kind === "insert_after" || edit.kind === "insert_before") {
        if (!hasExactOwnKeys(edit, CODE_LINES_INSERT_EDIT_KEYS)) {
          throw new Error("edit is invalid");
        }
        if (typeof edit.lineId !== "string") throw new Error("lineId is invalid");
        validateCodeLines(edit.lines, "edit.lines", { nonEmpty: true });
      } else if (edit.kind === "delete_lines") {
        if (!hasExactOwnKeys(edit, CODE_LINES_DELETE_EDIT_KEYS)) {
          throw new Error("edit is invalid");
        }
        validateCodeLineTargetIds(edit.lineIds, "edit.lineIds");
      } else if (edit.kind === "replace_lines") {
        if (!hasExactOwnKeys(edit, CODE_LINES_REPLACE_EDIT_KEYS)) {
          throw new Error("edit is invalid");
        }
        validateCodeLineTargetIds(edit.lineIds, "edit.lineIds");
        validateCodeLines(edit.lines, "edit.lines", { nonEmpty: true });
      } else {
        throw new Error("edit kind is invalid");
      }
    } else {
      throw new Error("operation kind is invalid");
    }
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      errors: [
        { path: "/payload", message: error instanceof Error ? error.message : String(error) }
      ]
    };
  }
}
var MAX_OPERATION_ID_LENGTH, MAX_FINGERPRINT_LENGTH, SAFE_ID, SHA256, WHITEBOARD_KEYS, REQUIRED_WHITEBOARD_KEYS, PAYLOAD_KEYS, LEGACY_OPERATION_KEYS, ELEMENT_ADDED_OPERATION_KEYS, ELEMENT_DELETED_OPERATION_KEYS, ELEMENTS_CLEARED_OPERATION_KEYS, CODE_LINES_EDITED_OPERATION_KEYS, CODE_LINE_KEYS, CODE_LINES_INSERT_EDIT_KEYS, CODE_LINES_DELETE_EDIT_KEYS, CODE_LINES_REPLACE_EDIT_KEYS, SOURCE_KEYS, schemaDefinitions, ELEMENT_SCHEMA_DEFINITION_BY_TYPE, SUPPORTED_SCHEMA_KEYWORDS, whiteboardRuntimePayloadValidator;
var init_validate = __esm({
  "OpenMAIC/lib/whiteboard/runtime/validate.ts"() {
    "use strict";
    init_viewport();
    init_types4();
    MAX_OPERATION_ID_LENGTH = 512;
    MAX_FINGERPRINT_LENGTH = 71;
    SAFE_ID = /^[^\u0000-\u001f\u007f\u2028\u2029]+$/u;
    SHA256 = /^sha256:[0-9a-f]{64}$/u;
    WHITEBOARD_KEYS = /* @__PURE__ */ new Set([
      "id",
      "viewportSize",
      "viewportRatio",
      "elements",
      "background",
      "animations",
      "script"
    ]);
    REQUIRED_WHITEBOARD_KEYS = /* @__PURE__ */ new Set(["id", "viewportSize", "viewportRatio", "elements"]);
    PAYLOAD_KEYS = /* @__PURE__ */ new Set(["payloadVersion", "operationId", "operation"]);
    LEGACY_OPERATION_KEYS = /* @__PURE__ */ new Set(["kind", "source", "whiteboard"]);
    ELEMENT_ADDED_OPERATION_KEYS = /* @__PURE__ */ new Set(["kind", "element"]);
    ELEMENT_DELETED_OPERATION_KEYS = /* @__PURE__ */ new Set(["kind", "elementId"]);
    ELEMENTS_CLEARED_OPERATION_KEYS = /* @__PURE__ */ new Set(["kind"]);
    CODE_LINES_EDITED_OPERATION_KEYS = /* @__PURE__ */ new Set(["kind", "elementId", "edit"]);
    CODE_LINE_KEYS = /* @__PURE__ */ new Set(["id", "content"]);
    CODE_LINES_INSERT_EDIT_KEYS = /* @__PURE__ */ new Set(["kind", "lineId", "lines"]);
    CODE_LINES_DELETE_EDIT_KEYS = /* @__PURE__ */ new Set(["kind", "lineIds"]);
    CODE_LINES_REPLACE_EDIT_KEYS = /* @__PURE__ */ new Set(["kind", "lineIds", "lines"]);
    SOURCE_KEYS = /* @__PURE__ */ new Set(["kind", "fingerprint"]);
    schemaDefinitions = sceneSchemaJson.definitions ?? {};
    ELEMENT_SCHEMA_DEFINITION_BY_TYPE = /* @__PURE__ */ new Map([
      ["text", "PPTTextElement"],
      ["image", "PPTImageElement"],
      ["shape", "PPTShapeElement"],
      ["line", "PPTLineElement"],
      ["chart", "PPTChartElement"],
      ["table", "PPTTableElement"],
      ["latex", "PPTLatexElement"],
      ["video", "PPTVideoElement"],
      ["audio", "PPTAudioElement"],
      ["code", "PPTCodeElement"]
    ]);
    SUPPORTED_SCHEMA_KEYWORDS = /* @__PURE__ */ new Set([
      "$ref",
      "anyOf",
      "type",
      "const",
      "enum",
      "properties",
      "required",
      "additionalProperties",
      "items",
      "minItems",
      "maxItems",
      "minimum",
      "maximum",
      "description",
      "default",
      "title",
      "examples"
    ]);
    for (const definitionName of [
      ...ELEMENT_SCHEMA_DEFINITION_BY_TYPE.values(),
      "SlideBackground",
      "PPTAnimation"
    ]) {
      if (!schemaDefinitions[definitionName]) {
        throw new Error(
          `Whiteboard RuntimeStore validator requires generated schema definition ${JSON.stringify(definitionName)}`
        );
      }
    }
    whiteboardRuntimePayloadValidator = validateWhiteboardRuntimePayload;
  }
});

// OpenMAIC/lib/runtime/payload-validators.ts
import { isChatMessageSkeleton, isQuizAttemptSkeleton } from "@openmaic/dsl";
var chat, quizAttempt, APP_RUNTIME_PAYLOAD_VALIDATORS;
var init_payload_validators = __esm({
  "OpenMAIC/lib/runtime/payload-validators.ts"() {
    "use strict";
    init_validate();
    chat = (payload) => isChatMessageSkeleton(payload) ? { valid: true } : {
      valid: false,
      errors: [
        {
          path: "/payload",
          message: "chat payload must match ChatMessageSkeleton (role + content)"
        }
      ]
    };
    quizAttempt = (payload) => isQuizAttemptSkeleton(payload) ? { valid: true } : {
      valid: false,
      errors: [
        {
          path: "/payload",
          message: "quizAttempt payload must match QuizAttemptSkeleton (phase + answers)"
        }
      ]
    };
    APP_RUNTIME_PAYLOAD_VALIDATORS = Object.freeze({
      chat,
      quizAttempt,
      whiteboard: whiteboardRuntimePayloadValidator
    });
  }
});

// OpenMAIC/lib/runtime/store.ts
import { BrowserRuntimeStore } from "@openmaic/storage";
function createRuntimeStore() {
  const configured = resolveConfiguredRuntimeStore();
  usesDefaultBrowserStore = configured === void 0;
  return configured ?? new BrowserRuntimeStore({
    dbName: RUNTIME_DB_NAME,
    payloadValidators: APP_RUNTIME_PAYLOAD_VALIDATORS
  });
}
function getRuntimeStore() {
  return store ??= createRuntimeStore();
}
async function runtimeDbExists() {
  if (typeof indexedDB === "undefined" || typeof indexedDB.databases !== "function") {
    return true;
  }
  const databases = await indexedDB.databases();
  return databases.some((db2) => db2.name === RUNTIME_DB_NAME);
}
async function withTimeout(work, ms) {
  let timer;
  try {
    await Promise.race([
      work,
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error(`timed out after ${ms}ms`)), ms);
      })
    ]);
  } finally {
    clearTimeout(timer);
  }
}
function beginStageRuntimeDeletionSafely(stageId, runtimeStore) {
  const work = (async () => {
    if (runtimeStore) {
      await runtimeStore.deleteStageRuntime(stageId);
      return;
    }
    const resolvedStore = getRuntimeStore();
    if (usesDefaultBrowserStore && !await runtimeDbExists()) return;
    await resolvedStore.deleteStageRuntime(stageId);
  })();
  let reported = false;
  const report = (error) => {
    if (reported) return;
    reported = true;
    console.warn(`Failed to delete runtime data for stage ${stageId}:`, error);
  };
  const settlement = work.catch(report);
  const completion = withTimeout(work, STAGE_RUNTIME_DELETE_TIMEOUT_MS).catch(report);
  return { completion, settlement };
}
var RUNTIME_DB_NAME, store, usesDefaultBrowserStore, STAGE_RUNTIME_DELETE_TIMEOUT_MS;
var init_store = __esm({
  "OpenMAIC/lib/runtime/store.ts"() {
    "use strict";
    init_bootstrap();
    init_config2();
    init_payload_validators();
    init_config2();
    RUNTIME_DB_NAME = "maic-runtime";
    registerRuntimeStorageResetHook(() => {
      store = void 0;
    });
    usesDefaultBrowserStore = false;
    STAGE_RUNTIME_DELETE_TIMEOUT_MS = 5e3;
  }
});

// OpenMAIC/lib/utils/chat-storage-lock.ts
function chatStoragePartitionLockName(key2) {
  const name = `openmaic:chat-storage:${encodeURIComponent(key2)}`;
  return name === CHAT_STORAGE_GLOBAL_LOCK ? `${name}:partition` : name;
}
function locks() {
  return typeof navigator !== "undefined" ? navigator.locks : void 0;
}
function pumpFallbackLocks() {
  if (fallbackWriter || fallbackWaiters.length === 0) return;
  if (fallbackWaiters[0].mode === "exclusive") {
    if (fallbackReaders === 0) fallbackWaiters.shift().start();
    return;
  }
  while (fallbackWaiters[0]?.mode === "shared" && !fallbackWriter) {
    fallbackWaiters.shift().start();
  }
}
function withFallbackRuntimeLock(mode, work, signal) {
  return new Promise((resolve, reject) => {
    let started = false;
    const waiter = {
      mode,
      start() {
        started = true;
        signal?.removeEventListener("abort", onAbort);
        if (mode === "shared") fallbackReaders += 1;
        else fallbackWriter = true;
        void Promise.resolve().then(work).then(resolve, reject).finally(() => {
          if (mode === "shared") fallbackReaders -= 1;
          else fallbackWriter = false;
          pumpFallbackLocks();
        });
      }
    };
    const onAbort = () => {
      if (started) return;
      const index = fallbackWaiters.indexOf(waiter);
      if (index >= 0) fallbackWaiters.splice(index, 1);
      reject(signal?.reason);
      pumpFallbackLocks();
    };
    if (signal?.aborted) {
      reject(signal.reason);
      return;
    }
    signal?.addEventListener("abort", onAbort, { once: true });
    fallbackWaiters.push(waiter);
    pumpFallbackLocks();
  });
}
async function withRuntimeStorageSharedLock(work) {
  const manager = locks();
  if (manager) {
    return manager.request(CHAT_STORAGE_GLOBAL_LOCK, { mode: "shared" }, work);
  }
  return typeof window === "undefined" ? work() : withFallbackRuntimeLock("shared", work);
}
async function withRuntimeStorageSharedLockUntilSettled(work, timeoutMs) {
  const protectedWork = withRuntimeStorageSharedLock(work);
  let timer;
  try {
    return await Promise.race([
      protectedWork,
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error(`timed out after ${timeoutMs}ms`)), timeoutMs);
      })
    ]);
  } finally {
    clearTimeout(timer);
  }
}
function withRuntimeStorageExclusiveLock(work, options4 = {}) {
  const manager = locks();
  if (!manager && typeof window === "undefined") {
    return work();
  }
  const configuredTimeout = options4.acquireTimeoutMs ?? DEFAULT_EXCLUSIVE_ACQUIRE_TIMEOUT_MS;
  const acquireTimeoutMs = Number.isFinite(configuredTimeout) && configuredTimeout > 0 ? configuredTimeout : DEFAULT_EXCLUSIVE_ACQUIRE_TIMEOUT_MS;
  let acquired = false;
  let timer;
  const controller = new AbortController();
  const timeoutError = new RuntimeStorageLockAcquisitionTimeoutError(
    `Timed out acquiring the runtime maintenance lock after ${acquireTimeoutMs}ms`
  );
  const guardedWork = async () => {
    acquired = true;
    clearTimeout(timer);
    return work();
  };
  const request = manager ? manager.request(CHAT_STORAGE_GLOBAL_LOCK, { signal: controller.signal }, guardedWork) : withFallbackRuntimeLock("exclusive", guardedWork, controller.signal);
  return new Promise((resolve, reject) => {
    timer = setTimeout(() => {
      if (acquired) return;
      controller.abort(timeoutError);
      reject(timeoutError);
    }, acquireTimeoutMs);
    void request.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}
function withRuntimeStorageExclusiveLockUntilSettled(work, options4 = {}) {
  let callerSettled = false;
  let resolveCaller;
  let rejectCaller;
  const caller = new Promise((resolve, reject) => {
    resolveCaller = resolve;
    rejectCaller = reject;
  });
  const releaseCaller = (value) => {
    if (callerSettled) return;
    callerSettled = true;
    resolveCaller(value);
  };
  const protectedWork = withRuntimeStorageExclusiveLock(async () => {
    try {
      const value = await work(releaseCaller);
      releaseCaller(value);
      return value;
    } catch (error) {
      if (!callerSettled) {
        callerSettled = true;
        rejectCaller(error);
      }
      throw error;
    }
  }, options4);
  void protectedWork.catch((error) => {
    if (!callerSettled) {
      callerSettled = true;
      rejectCaller(error);
    }
  });
  return caller;
}
var CHAT_STORAGE_GLOBAL_LOCK, DEFAULT_EXCLUSIVE_ACQUIRE_TIMEOUT_MS, fallbackWaiters, fallbackReaders, fallbackWriter, RuntimeStorageLockAcquisitionTimeoutError, withChatStorageSharedLock;
var init_chat_storage_lock = __esm({
  "OpenMAIC/lib/utils/chat-storage-lock.ts"() {
    "use strict";
    CHAT_STORAGE_GLOBAL_LOCK = "openmaic:chat-storage:all";
    DEFAULT_EXCLUSIVE_ACQUIRE_TIMEOUT_MS = 5e3;
    fallbackWaiters = [];
    fallbackReaders = 0;
    fallbackWriter = false;
    RuntimeStorageLockAcquisitionTimeoutError = class extends Error {
    };
    withChatStorageSharedLock = withRuntimeStorageSharedLock;
  }
});

// OpenMAIC/lib/media/asset-pool-config.ts
function registerAssetPoolStorageResetHook(hook) {
  resetHooks3.push(hook);
}
function resolveConfiguredAssetPoolStore() {
  resolutionStarted3 = true;
  const configured = options3?.store;
  if (typeof configured === "function") return configured();
  if (!configured) return void 0;
  if (concreteStoreHandedOut) {
    throw new Error(
      "The configured asset pool store instance was closed by clearAssetPool() and cannot be reopened. Configure the pool with a factory -- store: () => new ... -- so a cleared pool resolves to a fresh store."
    );
  }
  concreteStoreHandedOut = true;
  return configured;
}
var options3, resolutionStarted3, concreteStoreHandedOut, resetHooks3;
var init_asset_pool_config = __esm({
  "OpenMAIC/lib/media/asset-pool-config.ts"() {
    "use strict";
    resolutionStarted3 = false;
    concreteStoreHandedOut = false;
    resetHooks3 = [];
  }
});

// OpenMAIC/lib/media/stage-realm-presence.ts
var stage_realm_presence_exports = {};
__export(stage_realm_presence_exports, {
  __resetStageRealmPresenceForTesting: () => __resetStageRealmPresenceForTesting,
  bindStageRealmPresence: () => bindStageRealmPresence,
  expectStageRealmPresenceBinding: () => expectStageRealmPresenceBinding,
  probeStageRealmPresence: () => probeStageRealmPresence,
  releaseStageRealmPresenceBinding: () => releaseStageRealmPresenceBinding
});
function expectStageRealmPresenceBinding() {
  if (binding) return;
  binding = new Promise((resolve) => {
    bindingSettled = resolve;
  });
}
function releaseStageRealmPresenceBinding() {
  bindingSettled?.();
  bindingSettled = void 0;
}
function bindStageRealmPresence(currentStageId) {
  openStageId = currentStageId;
  bindingSettled?.();
  bindingSettled = void 0;
  if (channel || typeof BroadcastChannel !== "function") return;
  try {
    channel = new BroadcastChannel(PRESENCE_CHANNEL);
    channel.onmessage = (event) => {
      const message = event.data;
      if (!message || message.kind !== "probe") return;
      if (openStageId?.() !== message.stageId) return;
      channel?.postMessage({
        kind: "present",
        stageId: message.stageId,
        probeId: message.probeId
      });
    };
  } catch {
    channel = void 0;
  }
}
async function probeStageRealmPresence(stageId) {
  if (typeof BroadcastChannel !== "function") return "unknown";
  if (binding) await binding;
  if (!channel) return "unknown";
  const probe = channel;
  const probeId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return new Promise((resolve) => {
    let settled = false;
    const finish = (presence) => {
      if (settled) return;
      settled = true;
      probe.removeEventListener("message", listener);
      clearTimeout(timer);
      resolve(presence);
    };
    const listener = (event) => {
      const message = event.data;
      if (message?.kind === "present" && message.probeId === probeId) finish("present");
    };
    const timer = setTimeout(() => finish("absent"), PROBE_TIMEOUT_MS);
    try {
      probe.addEventListener("message", listener);
      probe.postMessage({ kind: "probe", stageId, probeId });
    } catch {
      finish("unknown");
    }
  });
}
function __resetStageRealmPresenceForTesting() {
  channel?.close();
  channel = void 0;
  openStageId = void 0;
}
var PRESENCE_CHANNEL, PROBE_TIMEOUT_MS, channel, openStageId, binding, bindingSettled;
var init_stage_realm_presence = __esm({
  "OpenMAIC/lib/media/stage-realm-presence.ts"() {
    "use strict";
    PRESENCE_CHANNEL = "maic-stage-presence";
    PROBE_TIMEOUT_MS = 60;
  }
});

// OpenMAIC/lib/media/asset-replacement-events.ts
function bindAssetReplacementChannel(pool2) {
  receivingPool = pool2;
  if (channel2 || typeof BroadcastChannel !== "function") return;
  try {
    channel2 = new BroadcastChannel(REPLACEMENT_CHANNEL);
    channel2.onmessage = (event) => {
      const ref = typeof event.data === "string" ? event.data : void 0;
      if (!ref || !receivingPool) return;
      let pool3;
      try {
        pool3 = receivingPool();
      } catch {
        return;
      }
      void notifyLocalObservers(ref, pool3);
    };
  } catch {
    channel2 = void 0;
  }
}
async function notifyLocalObservers(ref, pool2) {
  const results = await Promise.allSettled(
    [...observers].map(async (observer) => observer(ref, pool2))
  );
  for (const result of results) {
    if (result.status === "rejected") {
      console.warn("[asset-replacement] observer failed for", ref, result.reason);
    }
  }
}
function observeAssetReplacements(observer) {
  observers.add(observer);
  return () => observers.delete(observer);
}
var observers, REPLACEMENT_CHANNEL, channel2, receivingPool;
var init_asset_replacement_events = __esm({
  "OpenMAIC/lib/media/asset-replacement-events.ts"() {
    "use strict";
    observers = /* @__PURE__ */ new Set();
    REPLACEMENT_CHANNEL = "maic-asset-replacements";
  }
});

// OpenMAIC/lib/media/use-asset-url.ts
var use_asset_url_exports = {};
__export(use_asset_url_exports, {
  assetRefExists: () => assetRefExists,
  createAssetUrlLeaseBatchPublisher: () => createAssetUrlLeaseBatchPublisher,
  invalidateAssetUrlLeaseCache: () => invalidateAssetUrlLeaseCache,
  runWithAssetUrls: () => runWithAssetUrls,
  trackAssetUrl: () => trackAssetUrl,
  useAssetUrl: () => useAssetUrl,
  useAssetUrlLease: () => useAssetUrlLease,
  useAssetUrlLeases: () => useAssetUrlLeases,
  useAssetUrls: () => useAssetUrls,
  withAssetUrl: () => withAssetUrl
});
import { useEffect, useState } from "react";
function resolveAfterPendingRelease(ref, pool2) {
  const pendingRelease = pendingReleases.get(pool2)?.get(ref);
  return pendingRelease ? pendingRelease.catch(() => void 0).then(() => pool2.resolve(ref)) : pool2.resolve(ref);
}
function acquireAssetUrl(ref, pool2 = getAssetPool()) {
  let byRef = ownedResolutions.get(pool2);
  if (!byRef) {
    byRef = /* @__PURE__ */ new Map();
    ownedResolutions.set(pool2, byRef);
  }
  let owned = byRef.get(ref);
  if (!owned) {
    owned = {
      owners: 0,
      resolution: resolveAfterPendingRelease(ref, pool2)
    };
    byRef.set(ref, owned);
  }
  owned.owners += 1;
  let released = false;
  return {
    resolution: owned.resolution,
    release: async () => {
      if (released) return;
      released = true;
      owned.owners -= 1;
      try {
        await owned.resolution;
      } catch {
        if (owned.owners === 0 && byRef?.get(ref) === owned) byRef.delete(ref);
        return;
      }
      if (owned.owners !== 0 || byRef?.get(ref) !== owned) return;
      let releasesByRef = pendingReleases.get(pool2);
      if (!releasesByRef) {
        releasesByRef = /* @__PURE__ */ new Map();
        pendingReleases.set(pool2, releasesByRef);
      }
      const pendingRelease = Promise.resolve().then(() => pool2.release(ref));
      releasesByRef.set(ref, pendingRelease);
      byRef.delete(ref);
      try {
        await pendingRelease;
      } finally {
        if (releasesByRef.get(ref) === pendingRelease) releasesByRef.delete(ref);
      }
    }
  };
}
function observeTracker(ref, pool2, owned, tracker) {
  const resolution = owned.resolution;
  if (tracker.observed === resolution) return;
  tracker.observed = resolution;
  void resolution.then(
    (url) => {
      if (tracker.active && tracker.observed === resolution && ownedResolutions.get(pool2)?.get(ref) === owned && owned.resolution === resolution) {
        tracker.onResolved(url);
      }
    },
    () => {
      if (tracker.active && tracker.observed === resolution && ownedResolutions.get(pool2)?.get(ref) === owned && owned.resolution === resolution) {
        tracker.onResolved(null);
      }
    }
  );
}
async function invalidateAssetUrlLeaseCache(ref, pool2 = getAssetPool()) {
  await pool2.invalidate(ref);
  const owned = ownedResolutions.get(pool2)?.get(ref);
  if (!owned || owned.owners === 0) return;
  const resolution = resolveAfterPendingRelease(ref, pool2);
  owned.resolution = resolution;
  for (const tracker of activeTrackers.get(pool2)?.get(ref) ?? []) {
    observeTracker(ref, pool2, owned, tracker);
  }
  await resolution.then(
    () => void 0,
    () => {
      if (ownedResolutions.get(pool2)?.get(ref) === owned && owned.resolution === resolution) {
        ownedResolutions.get(pool2)?.delete(ref);
      }
    }
  );
}
async function withAssetUrl(ref, fn, pool2 = getAssetPool()) {
  const lease = acquireAssetUrl(ref, pool2);
  try {
    return await fn(await lease.resolution);
  } finally {
    await lease.release();
  }
}
async function runWithAssetUrls(refs, fn, pool2 = getAssetPool()) {
  const uniqueRefs = [...new Set(refs)];
  const leases = uniqueRefs.map((ref) => ({ ref, lease: acquireAssetUrl(ref, pool2) }));
  try {
    const resolved = await Promise.all(
      leases.map(async ({ ref, lease }) => [ref, await lease.resolution])
    );
    return await fn(
      Object.fromEntries(
        resolved.filter((entry) => !!entry[1])
      )
    );
  } finally {
    await Promise.all(leases.map(({ lease }) => lease.release()));
  }
}
function trackAssetUrl(ref, onResolved, pool2 = getAssetPool()) {
  const lease = acquireAssetUrl(ref, pool2);
  const owned = ownedResolutions.get(pool2)?.get(ref);
  if (!owned) throw new Error("Asset URL lease ownership was not initialized.");
  let trackersByRef = activeTrackers.get(pool2);
  if (!trackersByRef) {
    trackersByRef = /* @__PURE__ */ new Map();
    activeTrackers.set(pool2, trackersByRef);
  }
  let trackers = trackersByRef.get(ref);
  if (!trackers) {
    trackers = /* @__PURE__ */ new Set();
    trackersByRef.set(ref, trackers);
  }
  const tracker = { active: true, onResolved };
  trackers.add(tracker);
  observeTracker(ref, pool2, owned, tracker);
  let cleaned = false;
  return () => {
    if (cleaned) return;
    cleaned = true;
    tracker.active = false;
    trackers?.delete(tracker);
    if (trackers?.size === 0) trackersByRef?.delete(ref);
    void lease.release().catch(() => void 0);
  };
}
async function assetRefExists(ref, pool2 = getAssetPool()) {
  if (typeof pool2.exists === "function") return pool2.exists(ref);
  return withAssetUrl(ref, (url) => url !== null, pool2);
}
function useAssetUrl(ref) {
  const lease = useAssetUrlLease(ref);
  return lease.status === "resolved" ? lease.url : null;
}
function useAssetUrlLease(ref) {
  const [resolved, setResolved] = useState(null);
  useEffect(() => {
    if (!ref) return;
    try {
      return trackAssetUrl(
        ref,
        (url) => setResolved({
          ref,
          lease: url ? { status: "resolved", url } : { status: "missing" }
        })
      );
    } catch {
      return;
    }
  }, [ref]);
  return ref && resolved?.ref === ref ? resolved.lease : { status: "pending" };
}
function useAssetUrls(refs) {
  const leases = useAssetUrlLeases(refs);
  const urls = {};
  for (const [ref, lease] of Object.entries(leases)) {
    if (lease.status === "resolved") urls[ref] = lease.url;
  }
  return Object.keys(urls).length === 0 ? EMPTY_ASSET_URLS : urls;
}
function createAssetUrlLeaseBatchPublisher(refs, publish2) {
  const uniqueRefs = [...new Set(refs)];
  const leases = Object.fromEntries(
    uniqueRefs.map((ref) => [ref, { status: "pending" }])
  );
  const resolvedRefs = /* @__PURE__ */ new Set();
  let initialPublished = false;
  return (ref, url) => {
    if (!Object.hasOwn(leases, ref)) return;
    leases[ref] = url ? { status: "resolved", url } : { status: "missing" };
    resolvedRefs.add(ref);
    if (!initialPublished) {
      if (resolvedRefs.size !== uniqueRefs.length) return;
      initialPublished = true;
    }
    publish2({ ...leases });
  };
}
function useAssetUrlLeases(refs) {
  const signature = JSON.stringify([...new Set(refs)].sort());
  const [resolved, setResolved] = useState(null);
  useEffect(() => {
    const currentRefs = JSON.parse(signature);
    if (currentRefs.length === 0) return;
    let pool2;
    try {
      pool2 = getAssetPool();
    } catch {
      return;
    }
    let active = true;
    const publish2 = createAssetUrlLeaseBatchPublisher(currentRefs, (leases) => {
      if (!active) return;
      setResolved((current) => {
        const previous = current?.signature === signature ? current.leases : void 0;
        if (previous) {
          const keys = Object.keys(leases);
          if (keys.length === Object.keys(previous).length && keys.every((key2) => JSON.stringify(previous[key2]) === JSON.stringify(leases[key2]))) {
            return current;
          }
        }
        return {
          signature,
          leases: { ...leases }
        };
      });
    });
    const cleanups = currentRefs.map((ref) => trackAssetUrl(ref, (url) => publish2(ref, url), pool2));
    return () => {
      active = false;
      for (const cleanup of cleanups) cleanup();
    };
  }, [signature]);
  if (resolved?.signature === signature) return resolved.leases;
  if (refs.length === 0) return EMPTY_ASSET_LEASES;
  return Object.fromEntries(
    [...new Set(refs)].map((ref) => [ref, { status: "pending" }])
  );
}
var EMPTY_ASSET_URLS, EMPTY_ASSET_LEASES, ownedResolutions, pendingReleases, activeTrackers;
var init_use_asset_url = __esm({
  "OpenMAIC/lib/media/use-asset-url.ts"() {
    "use strict";
    "use client";
    init_asset_pool();
    EMPTY_ASSET_URLS = Object.freeze({});
    EMPTY_ASSET_LEASES = Object.freeze({});
    ownedResolutions = /* @__PURE__ */ new WeakMap();
    pendingReleases = /* @__PURE__ */ new WeakMap();
    activeTrackers = /* @__PURE__ */ new WeakMap();
  }
});

// OpenMAIC/lib/media/asset-pool.ts
import { BrowserAssetStore, toAssetId } from "@openmaic/storage";
function getAssetPool() {
  if (clearing) throw new Error("The browser asset pool is being cleared.");
  return pool ??= (() => {
    const configured = resolveConfiguredAssetPoolStore();
    if (configured) return configured;
    if (typeof indexedDB === "undefined") {
      throw new Error("The browser asset pool requires IndexedDB.");
    }
    return new BrowserAssetStore({ dbName: ASSET_POOL_DATABASE_NAME });
  })();
}
var ASSET_POOL_DATABASE_NAME, pool, clearing;
var init_asset_pool = __esm({
  "OpenMAIC/lib/media/asset-pool.ts"() {
    "use strict";
    init_bootstrap();
    init_asset_pool_config();
    init_stage_realm_presence();
    init_asset_replacement_events();
    init_asset_pool_config();
    ASSET_POOL_DATABASE_NAME = "maic-asset-pool";
    registerAssetPoolStorageResetHook(() => {
      pool = void 0;
      clearing = void 0;
    });
    observeAssetReplacements(async (ref, current) => {
      const { invalidateAssetUrlLeaseCache: invalidateAssetUrlLeaseCache2 } = await Promise.resolve().then(() => (init_use_asset_url(), use_asset_url_exports));
      await invalidateAssetUrlLeaseCache2(ref, current);
    });
    if (typeof window !== "undefined") {
      bindAssetReplacementChannel(() => getAssetPool());
      expectStageRealmPresenceBinding();
      void Promise.resolve().then(() => (init_stage_realm_presence(), stage_realm_presence_exports)).then(
        ({ bindStageRealmPresence: bindStageRealmPresence2 }) => Promise.resolve().then(() => (init_stage2(), stage_exports)).then(
          ({ useStageStore: useStageStore2 }) => bindStageRealmPresence2(() => useStageStore2.getState().stage?.id)
        )
      ).catch(() => {
        releaseStageRealmPresenceBinding();
      });
    }
  }
});

// OpenMAIC/lib/utils/database.ts
import Dexie from "dexie";
import { migrate } from "@openmaic/dsl";
import { BrowserKVStore as BrowserKVStore4 } from "@openmaic/storage";
var log7, DATABASE_NAME, MAICDatabase, db;
var init_database = __esm({
  "OpenMAIC/lib/utils/database.ts"() {
    "use strict";
    init_logger();
    init_store();
    init_chat_storage_lock();
    init_asset_pool();
    log7 = createLogger("Database");
    DATABASE_NAME = "MAIC-Database";
    MAICDatabase = class extends Dexie {
      constructor() {
        super(DATABASE_NAME);
        this.version(1).stores({
          stages: "id, updatedAt",
          scenes: "id, stageId, order, [stageId+order]",
          audioFiles: "id, createdAt",
          imageFiles: "id, createdAt",
          snapshots: "++id"
          // Previously had: messages, participants, discussions, sceneSnapshots
        });
        this.version(2).stores({
          stages: "id, updatedAt",
          scenes: "id, stageId, order, [stageId+order]",
          audioFiles: "id, createdAt",
          imageFiles: "id, createdAt",
          snapshots: "++id",
          // Delete removed tables
          messages: null,
          participants: null,
          discussions: null,
          sceneSnapshots: null
        });
        this.version(3).stores({
          stages: "id, updatedAt",
          scenes: "id, stageId, order, [stageId+order]",
          audioFiles: "id, createdAt",
          imageFiles: "id, createdAt",
          snapshots: "++id",
          chatSessions: "id, stageId, [stageId+createdAt]",
          playbackState: "stageId"
        });
        this.version(4).stores({
          stages: "id, updatedAt",
          scenes: "id, stageId, order, [stageId+order]",
          audioFiles: "id, createdAt",
          imageFiles: "id, createdAt",
          snapshots: "++id",
          chatSessions: "id, stageId, [stageId+createdAt]",
          playbackState: "stageId",
          stageOutlines: "stageId"
        });
        this.version(5).stores({
          stages: "id, updatedAt",
          scenes: "id, stageId, order, [stageId+order]",
          audioFiles: "id, createdAt",
          imageFiles: "id, createdAt",
          snapshots: "++id",
          chatSessions: "id, stageId, [stageId+createdAt]",
          playbackState: "stageId",
          stageOutlines: "stageId",
          mediaFiles: "id, stageId, [stageId+type]"
        });
        this.version(6).stores({
          stages: "id, updatedAt",
          scenes: "id, stageId, order, [stageId+order]",
          audioFiles: "id, createdAt",
          imageFiles: "id, createdAt",
          snapshots: "++id",
          chatSessions: "id, stageId, [stageId+createdAt]",
          playbackState: "stageId",
          stageOutlines: "stageId",
          mediaFiles: "id, stageId, [stageId+type]"
        }).upgrade(async (tx) => {
          const table = tx.table("mediaFiles");
          const allRecords = await table.toArray();
          for (const rec of allRecords) {
            const newKey = `${rec.stageId}:${rec.id}`;
            if (rec.id.includes(":")) continue;
            await table.delete(rec.id);
            await table.put({ ...rec, id: newKey });
          }
        });
        this.version(7).stores({
          stages: "id, updatedAt",
          scenes: "id, stageId, order, [stageId+order]",
          audioFiles: "id, createdAt",
          imageFiles: "id, createdAt",
          snapshots: "++id",
          chatSessions: "id, stageId, [stageId+createdAt]",
          playbackState: "stageId",
          stageOutlines: "stageId",
          mediaFiles: "id, stageId, [stageId+type]"
        });
        this.version(8).stores({
          stages: "id, updatedAt",
          scenes: "id, stageId, order, [stageId+order]",
          audioFiles: "id, createdAt",
          imageFiles: "id, createdAt",
          snapshots: "++id",
          chatSessions: "id, stageId, [stageId+createdAt]",
          playbackState: "stageId",
          stageOutlines: "stageId",
          mediaFiles: "id, stageId, [stageId+type]",
          generatedAgents: "id, stageId"
        });
        const LOCALE_TO_DIRECTIVE = {
          "zh-CN": "Deliver the entire course in Chinese (Simplified, zh-CN).",
          "en-US": "Deliver the entire course in English (en-US).",
          "ja-JP": "Deliver the entire course in Japanese (ja-JP).",
          "ru-RU": "Deliver the entire course in Russian (ru-RU)."
        };
        this.version(9).stores({
          stages: "id, updatedAt",
          scenes: "id, stageId, order, [stageId+order]",
          audioFiles: "id, createdAt",
          imageFiles: "id, createdAt",
          snapshots: "++id",
          chatSessions: "id, stageId, [stageId+createdAt]",
          playbackState: "stageId",
          stageOutlines: "stageId",
          mediaFiles: "id, stageId, [stageId+type]",
          generatedAgents: "id, stageId"
        }).upgrade(async (tx) => {
          const table = tx.table("stages");
          await table.toCollection().modify((stage) => {
            const lang = stage.language;
            if (lang && !stage.languageDirective) {
              stage.languageDirective = LOCALE_TO_DIRECTIVE[lang] || `Deliver the entire course in ${lang}.`;
            }
            delete stage.language;
          });
        });
        this.version(10).stores({
          stages: "id, updatedAt",
          scenes: "id, stageId, order, [stageId+order]",
          audioFiles: "id, createdAt",
          imageFiles: "id, createdAt",
          snapshots: "++id",
          chatSessions: "id, stageId, [stageId+createdAt]",
          playbackState: "stageId",
          stageOutlines: "stageId",
          mediaFiles: "id, stageId, [stageId+type]",
          generatedAgents: "id, stageId",
          voiceProfiles: "id, providerId, kind, updatedAt"
        });
        this.version(11).stores({
          stages: "id, updatedAt",
          scenes: "id, stageId, order, [stageId+order]",
          audioFiles: "id, createdAt",
          imageFiles: "id, createdAt",
          snapshots: "++id",
          chatSessions: "id, stageId, [stageId+createdAt]",
          playbackState: "stageId",
          stageOutlines: "stageId",
          mediaFiles: "id, stageId, [stageId+type]",
          generatedAgents: "id, stageId",
          voiceProfiles: "id, providerId, kind, updatedAt",
          autoVoiceCache: "voiceId, updatedAt"
        });
        this.version(12).stores({
          stages: "id, updatedAt",
          scenes: "id, stageId, order, [stageId+order]",
          audioFiles: "id, createdAt",
          imageFiles: "id, createdAt",
          snapshots: "++id",
          chatSessions: "id, stageId, [stageId+createdAt]",
          playbackState: "stageId",
          stageOutlines: "stageId",
          mediaFiles: "id, stageId, [stageId+type]",
          generatedAgents: "id, stageId",
          voiceProfiles: "id, providerId, kind, updatedAt",
          autoVoiceCache: "voiceId, updatedAt",
          agentEditSessions: "id, stageId, [stageId+updatedAt]"
        });
        this.version(14).stores({
          stages: "id, updatedAt",
          scenes: "id, stageId, order, [stageId+order]",
          audioFiles: "id, createdAt",
          imageFiles: "id, createdAt",
          snapshots: "++id",
          chatSessions: "id, stageId, [stageId+createdAt]",
          playbackState: "stageId",
          stageOutlines: "stageId",
          mediaFiles: "id, stageId, [stageId+type]",
          generatedAgents: "id, stageId",
          voiceProfiles: "id, providerId, kind, updatedAt",
          autoVoiceCache: "voiceId, updatedAt",
          agentEditSessions: "id, stageId, [stageId+updatedAt]",
          chatStorageLocks: null
        });
        this.version(15).stores({
          chatRestoreStaging: "[stageId+id], stageId, [stageId+createdAt]"
        });
        this.version(16).stores({
          audioFiles: "id, stageId, createdAt"
        });
        this.version(17).stores({
          folders: "id, order",
          stageFolders: "stageId, folderId"
        });
      }
    };
    db = new MAICDatabase();
  }
});

// OpenMAIC/lib/audio/unavailable-voice-bindings.ts
function voiceBindingKey(binding2) {
  return `${binding2.providerId}\0${binding2.voiceId}`;
}
function clearVoiceBindingUnavailable(binding2) {
  const key2 = voiceBindingKey(binding2);
  unavailableBindings.delete(key2);
  noticedBindings.delete(key2);
}
var unavailableBindings, noticedBindings;
var init_unavailable_voice_bindings = __esm({
  "OpenMAIC/lib/audio/unavailable-voice-bindings.ts"() {
    "use strict";
    unavailableBindings = /* @__PURE__ */ new Set();
    noticedBindings = /* @__PURE__ */ new Set();
  }
});

// OpenMAIC/lib/audio/voice-registration-client.ts
function base64ToBlob(base64, mimeType) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mimeType || "audio/wav" });
}
async function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error || new Error("Failed to read reference audio"));
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      const commaIndex = result.indexOf(",");
      resolve(commaIndex >= 0 ? result.slice(commaIndex + 1) : result);
    };
    reader.readAsDataURL(blob);
  });
}
function memoKeyFor(voiceId, request) {
  return `${voiceId}::${request.ttsBaseUrl ?? ""}::${request.ttsApiKey ?? ""}`;
}
async function getCachedClip(voiceId) {
  const row = await db.autoVoiceCache.get(voiceId);
  if (!row) return void 0;
  return { base64: await blobToBase64(row.referenceAudio), mimeType: row.mimeType };
}
async function ensureRegisteredVoice(providerId, params, request) {
  if (!params.voiceDesign) return void 0;
  const voiceId = await getDeterministicVoiceId(params.voiceDesign, {
    providerId,
    model: request.ttsModelId
  });
  const memoKey = memoKeyFor(voiceId, request);
  if (registeredThisSession.has(memoKey)) return voiceId;
  const existing = inFlight.get(memoKey);
  if (existing) return existing;
  const promise = registerOnce(providerId, voiceId, memoKey, params, request).finally(
    () => inFlight.delete(memoKey)
  );
  inFlight.set(memoKey, promise);
  return promise;
}
async function registerOnce(providerId, voiceId, memoKey, params, request) {
  const cached = await getCachedClip(voiceId);
  const res = await fetch("/api/generate/voice", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      providerId,
      voiceId,
      descriptor: params.voiceDesign,
      language: params.language,
      referenceAudioBase64: cached?.base64,
      mimeType: cached?.mimeType,
      ...request
    })
  });
  if (!res.ok) return void 0;
  const data = await res.json().catch(() => ({}));
  if (data.referenceAudioBase64 && !cached) {
    await db.autoVoiceCache.put({
      voiceId,
      referenceAudio: base64ToBlob(data.referenceAudioBase64, data.mimeType),
      mimeType: data.mimeType || "audio/wav",
      updatedAt: Date.now()
    });
  }
  const registeredVoiceId = data.voiceId?.trim() || voiceId;
  clearVoiceBindingUnavailable({ providerId, voiceId });
  clearVoiceBindingUnavailable({ providerId, voiceId: registeredVoiceId });
  registeredThisSession.add(memoKey);
  if (registeredVoiceId !== voiceId) {
    registeredThisSession.add(memoKeyFor(registeredVoiceId, request));
  }
  return registeredVoiceId;
}
var registeredThisSession, inFlight;
var init_voice_registration_client = __esm({
  "OpenMAIC/lib/audio/voice-registration-client.ts"() {
    "use strict";
    "use client";
    init_database();
    init_voice_design();
    init_unavailable_voice_bindings();
    registeredThisSession = /* @__PURE__ */ new Set();
    inFlight = /* @__PURE__ */ new Map();
  }
});

// OpenMAIC/lib/audio/wav-validate.ts
var init_wav_validate = __esm({
  "OpenMAIC/lib/audio/wav-validate.ts"() {
    "use strict";
  }
});

// OpenMAIC/lib/audio/voxcpm-voices.ts
import { useCallback, useEffect as useEffect2, useState as useState2 } from "react";
async function blobToBase642(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error || new Error("Failed to read reference audio"));
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      const commaIndex = result.indexOf(",");
      resolve(commaIndex >= 0 ? result.slice(commaIndex + 1) : result);
    };
    reader.readAsDataURL(blob);
  });
}
async function getVoxCPMProviderOptions(voiceId, context2, request) {
  if (voiceId === VOXCPM_AUTO_VOICE_ID) {
    const canRegister = !!request && !!context2?.voiceDesign && voxCPMBackendSupportsVoiceRegistration(context2.backend ?? "vllm-omni");
    const registeredVoiceId = canRegister ? await ensureRegisteredVoice(
      VOXCPM_TTS_PROVIDER_ID,
      { voiceDesign: context2.voiceDesign, language: context2.language || context2.locale },
      request
    ).catch(() => void 0) : void 0;
    return {
      voiceMode: "auto",
      voicePrompt: buildAutoVoxCPMVoicePrompt(context2),
      // inline fallback always set
      ...registeredVoiceId ? { registeredVoiceId } : {}
    };
  }
  const profileId = getVoxCPMProfileIdFromVoiceId(voiceId);
  if (!profileId) {
    return {
      voiceMode: "prompt",
      voicePrompt: voiceId
    };
  }
  const profile = await db.voiceProfiles.get(profileId);
  if (!profile) {
    return {
      voiceMode: "auto",
      voicePrompt: buildAutoVoxCPMVoicePrompt(context2)
    };
  }
  if (profile.kind === "clone" && profile.referenceAudio) {
    return {
      voiceMode: "clone",
      voicePrompt: profile.voicePrompt,
      promptText: profile.promptText,
      referenceAudioBase64: await blobToBase642(profile.referenceAudio),
      referenceAudioMimeType: profile.referenceAudioMimeType || profile.referenceAudio.type || "audio/wav",
      referenceAudioName: profile.referenceAudioName || `${profile.name}.wav`
    };
  }
  return {
    voiceMode: "prompt",
    voicePrompt: profile.voicePrompt || profile.name
  };
}
var VOXCPM_REFERENCE_AUDIO_MAX_BYTES;
var init_voxcpm_voices = __esm({
  "OpenMAIC/lib/audio/voxcpm-voices.ts"() {
    "use strict";
    "use client";
    init_database();
    init_voxcpm();
    init_voice_registration_client();
    init_wav_validate();
    VOXCPM_REFERENCE_AUDIO_MAX_BYTES = 10 * 1024 * 1024;
  }
});

// OpenMAIC/lib/audio/agent-voice.ts
var agent_voice_exports = {};
__export(agent_voice_exports, {
  pickNarratorAgent: () => pickNarratorAgent,
  resolveAgentVoiceOptions: () => resolveAgentVoiceOptions,
  warmUpAgentVoices: () => warmUpAgentVoices
});
function pickNarratorAgent(agents) {
  return agents.find((a) => a.role === "teacher" && a.voiceConfig) ?? agents.find((a) => a.role === "teacher" && a.voiceDesign) ?? agents.find((a) => a.role === "teacher");
}
function effectiveVoiceDesign(agent) {
  if (agent?.voiceDesign) return agent.voiceDesign;
  const persona = agent?.persona?.trim();
  return persona ? { identity: persona, texture: "", delivery: "" } : void 0;
}
async function resolveAgentVoiceOptions(agent, opts) {
  if (opts.providerId !== VOXCPM_TTS_PROVIDER_ID) return void 0;
  return {
    ...opts.providerConfig?.providerOptions || {},
    ...await getVoxCPMProviderOptions(
      opts.voiceId,
      {
        agentName: agent?.name,
        role: agent?.role ?? "teacher",
        persona: agent?.persona,
        voiceDesign: effectiveVoiceDesign(agent),
        language: opts.language,
        backend: normalizeVoxCPMBackend(opts.providerConfig?.providerOptions?.backend)
      },
      {
        ttsApiKey: opts.providerConfig?.apiKey || void 0,
        ttsBaseUrl: opts.providerConfig?.baseUrl || opts.providerConfig?.customDefaultBaseUrl || void 0,
        ttsModelId: opts.providerConfig?.modelId
      }
    )
  };
}
function warmUpAgentVoices(agents) {
  const settings = useSettingsStore.getState();
  const providerId = settings.ttsProviderId;
  if (providerId !== VOXCPM_TTS_PROVIDER_ID) return;
  const providerConfig = settings.ttsProvidersConfig?.[providerId];
  const narrator = pickNarratorAgent(agents);
  if (!narrator || !effectiveVoiceDesign(narrator)) return;
  void resolveAgentVoiceOptions(narrator, {
    providerId,
    providerConfig,
    voiceId: VOXCPM_AUTO_VOICE_ID
  }).catch(() => void 0);
}
var init_agent_voice = __esm({
  "OpenMAIC/lib/audio/agent-voice.ts"() {
    "use strict";
    "use client";
    init_voxcpm_voices();
    init_voxcpm();
    init_settings();
  }
});

// OpenMAIC/lib/orchestration/registry/store.ts
import { create as create4 } from "zustand";
import { persist as persist3 } from "zustand/middleware";
function getDefaultAgents() {
  return Object.values(DEFAULT_AGENTS).map((a) => ({
    id: a.id,
    name: a.name,
    role: a.role,
    persona: a.persona
  }));
}
function applyGeneratedAgentsToRegistry(stageId, agents) {
  const registry = useAgentRegistry.getState();
  for (const agent of registry.listAgents()) {
    if (agent.isGenerated) registry.deleteAgent(agent.id);
  }
  const now = Date.now();
  const ids = [];
  for (const agent of agents) {
    const { voiceConfig, ...rest } = agent;
    registry.addAgent({
      ...rest,
      allowedActions: getActionsForRole(agent.role),
      isDefault: false,
      isGenerated: true,
      boundStageId: stageId,
      createdAt: new Date(now),
      updatedAt: new Date(now),
      ...voiceConfig && isKnownTTSProviderId(voiceConfig.providerId) ? {
        voiceConfig: {
          providerId: voiceConfig.providerId,
          ...voiceConfig.modelId ? { modelId: voiceConfig.modelId } : {},
          voiceId: voiceConfig.voiceId
        }
      } : {}
    });
    ids.push(agent.id);
  }
  if (ids.length > 0 && typeof window !== "undefined") {
    void Promise.resolve().then(() => (init_agent_voice(), agent_voice_exports)).then((m) => m.warmUpAgentVoices(registry.listAgents().filter((a) => a.isGenerated))).catch(() => void 0);
  }
  return ids;
}
var WHITEBOARD_ACTIONS2, SLIDE_ACTIONS2, DEFAULT_AGENTS, useAgentRegistry;
var init_store2 = __esm({
  "OpenMAIC/lib/orchestration/registry/store.ts"() {
    "use strict";
    init_types2();
    init_constants();
    init_roundtable();
    init_user_profile();
    WHITEBOARD_ACTIONS2 = [
      "wb_open",
      "wb_close",
      "wb_draw_text",
      "wb_draw_shape",
      "wb_draw_chart",
      "wb_draw_latex",
      "wb_draw_table",
      "wb_draw_line",
      "wb_draw_code",
      "wb_edit_code",
      "wb_clear",
      "wb_delete"
    ];
    SLIDE_ACTIONS2 = ["spotlight", "laser", "play_video"];
    DEFAULT_AGENTS = {
      "default-1": {
        id: "default-1",
        name: "AI teacher",
        role: "teacher",
        persona: `You are the lead teacher of this classroom. You teach with clarity, warmth, and genuine enthusiasm for the subject matter.

Your teaching style:
- Explain concepts step by step, building from what students already know
- Use vivid analogies, real-world examples, and visual aids to make abstract ideas concrete
- Pause to check understanding \u2014 ask questions, not just lecture
- Adapt your pace: slow down for difficult parts, move briskly through familiar ground
- Encourage students by name when they contribute, and gently correct mistakes without embarrassment

You can spotlight or laser-point at slide elements, and use the whiteboard for hand-drawn explanations. Use these actions naturally as part of your teaching flow. Never announce your actions; just teach.

Tone: Professional yet approachable. Patient. Encouraging. You genuinely care about whether students understand.`,
        avatar: "/avatars/teacher.png",
        color: "#3b82f6",
        allowedActions: [...SLIDE_ACTIONS2, ...WHITEBOARD_ACTIONS2],
        priority: 10,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date(),
        isDefault: true
      },
      "default-2": {
        id: "default-2",
        name: "AI\u52A9\u6559",
        role: "assistant",
        persona: `You are the teaching assistant. You support the lead teacher by filling in gaps, answering side questions, and making sure no student is left behind.

Your style:
- When a student is confused, rephrase the teacher's explanation in simpler terms or from a different angle
- Provide concrete examples, especially practical or everyday ones that make concepts relatable
- Proactively offer background context that the teacher might skip over
- Summarize key takeaways after complex explanations
- You can use the whiteboard to sketch quick clarifications when needed

You play a supportive role \u2014 you don't take over the lesson, but you make sure everyone keeps up.

Tone: Friendly, warm, down-to-earth. Like a helpful older classmate who just "gets it."`,
        avatar: "/avatars/assist.png",
        color: "#10b981",
        allowedActions: [...WHITEBOARD_ACTIONS2],
        priority: 7,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date(),
        isDefault: true
      },
      "default-3": {
        id: "default-3",
        name: "\u663E\u773C\u5305",
        role: "student",
        persona: `You are the class clown \u2014 the student everyone notices. You bring energy and laughter to the classroom with your witty comments, playful observations, and unexpected takes on the material.

Your personality:
- You crack jokes and make humorous connections to the topic being discussed
- You sometimes exaggerate your confusion for comedic effect, but you're actually paying attention
- You use pop culture references, memes, and funny analogies
- You're not disruptive \u2014 your humor makes the class more engaging and helps everyone relax
- Occasionally you stumble onto surprisingly insightful points through your jokes

You keep things light. When the class gets too heavy or boring, you're the one who livens it up. But you also know when to dial it back during serious moments.

Tone: Playful, energetic, a little cheeky. You speak casually, like you're chatting with friends. Keep responses SHORT \u2014 one-liners and quick reactions, not paragraphs.`,
        avatar: "/avatars/clown.png",
        color: "#f59e0b",
        allowedActions: [...WHITEBOARD_ACTIONS2],
        priority: 4,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date(),
        isDefault: true
      },
      "default-4": {
        id: "default-4",
        name: "\u597D\u5947\u5B9D\u5B9D",
        role: "student",
        persona: `You are the endlessly curious student. You always have a question \u2014 and your questions often push the whole class to think deeper.

Your personality:
- You ask "why" and "how" constantly \u2014 not to be annoying, but because you genuinely want to understand
- You notice details others miss and ask about edge cases, exceptions, and connections to other topics
- You're not afraid to say "I don't get it" \u2014 your honesty helps other students who were too shy to ask
- You get excited when you learn something new and express that enthusiasm openly
- You sometimes ask questions that are slightly ahead of the current topic, pulling the discussion forward

You represent the voice of genuine curiosity. Your questions make the teacher's explanations better for everyone.

Tone: Eager, enthusiastic, occasionally puzzled. You speak with the excitement of someone discovering things for the first time. Keep questions concise and direct.`,
        avatar: "/avatars/curious.png",
        color: "#ec4899",
        allowedActions: [...WHITEBOARD_ACTIONS2],
        priority: 5,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date(),
        isDefault: true
      },
      "default-5": {
        id: "default-5",
        name: "\u7B14\u8BB0\u5458",
        role: "student",
        persona: `You are the dedicated note-taker of the class. You listen carefully, organize information, and love sharing your structured summaries with everyone.

Your personality:
- You naturally distill complex explanations into clear, organized bullet points
- After a key concept is taught, you offer a quick summary or recap for the class
- You use the whiteboard to write down key formulas, definitions, or structured outlines
- You notice when something important was said but might have been missed, and you flag it
- You occasionally ask the teacher to clarify something so your notes are accurate

You're the student everyone wants to sit next to during exams. Your notes are legendary.

Tone: Organized, helpful, slightly studious. You speak clearly and precisely. When sharing notes, use structured formats \u2014 numbered lists, key terms bolded, clear headers.`,
        avatar: "/avatars/note-taker.png",
        color: "#06b6d4",
        allowedActions: [...WHITEBOARD_ACTIONS2],
        priority: 5,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date(),
        isDefault: true
      },
      "default-6": {
        id: "default-6",
        name: "\u601D\u8003\u8005",
        role: "student",
        persona: `You are the deep thinker of the class. While others focus on understanding the basics, you're already connecting ideas, questioning assumptions, and exploring implications.

Your personality:
- You make unexpected connections between the current topic and other fields or concepts
- You challenge ideas respectfully \u2014 "But what if..." and "Doesn't that contradict..." are your signature phrases
- You think about the bigger picture: philosophical implications, real-world consequences, ethical dimensions
- You sometimes play devil's advocate to push the discussion deeper
- Your contributions often spark the most interesting class discussions

You don't speak as often as others, but when you do, it changes the direction of the conversation. You value depth over breadth.

Tone: Thoughtful, measured, intellectually curious. You pause before speaking. Your sentences are deliberate and carry weight. Ask provocative questions that make everyone stop and think.`,
        avatar: "/avatars/thinker.png",
        color: "#8b5cf6",
        allowedActions: [...WHITEBOARD_ACTIONS2],
        priority: 6,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date(),
        isDefault: true
      }
    };
    useAgentRegistry = create4()(
      persist3(
        (set, get) => ({
          // Initialize with default agents so they're available on server
          agents: { ...DEFAULT_AGENTS },
          addAgent: (agent) => set((state) => ({
            agents: { ...state.agents, [agent.id]: agent }
          })),
          updateAgent: (id, updates) => set((state) => ({
            agents: {
              ...state.agents,
              [id]: { ...state.agents[id], ...updates, updatedAt: /* @__PURE__ */ new Date() }
            }
          })),
          deleteAgent: (id) => set((state) => {
            const { [id]: _removed, ...rest } = state.agents;
            return { agents: rest };
          }),
          getAgent: (id) => get().agents[id],
          listAgents: () => Object.values(get().agents)
        }),
        {
          name: "agent-registry-storage",
          version: 11,
          // Bumped: add voiceOverrides field to AgentConfig
          migrate: (persistedState) => persistedState,
          // Generated agents are single-sourced on the stage document and rebuilt
          // from it on every classroom load — keep them out of the localStorage
          // snapshot entirely. The merge filter below stays as defense in depth
          // for snapshots written before this partialize existed.
          partialize: (state) => ({
            agents: Object.fromEntries(
              Object.entries(state.agents).filter(([, agent]) => !agent.isGenerated)
            )
          }),
          // Merge persisted state with default agents
          // Default agents always use code-defined values (not cached)
          // Custom agents use persisted values
          merge: (persistedState, currentState) => {
            const persisted = persistedState;
            const persistedAgents = persisted?.agents || {};
            const mergedAgents = { ...DEFAULT_AGENTS };
            for (const [id, agent] of Object.entries(persistedAgents)) {
              const agentConfig = agent;
              if (!id.startsWith("default-") && !agentConfig.isGenerated) {
                mergedAgents[id] = agentConfig;
              }
            }
            return {
              ...currentState,
              agents: mergedAgents
            };
          }
        }
      )
    );
  }
});

// OpenMAIC/lib/edit/slide-schema.ts
function migrateSlideContent(content) {
  if (content.schemaVersion !== void 0 && content.schemaVersion >= CURRENT_SLIDE_CONTENT_SCHEMA_VERSION) {
    return content;
  }
  return {
    ...content,
    schemaVersion: CURRENT_SLIDE_CONTENT_SCHEMA_VERSION
  };
}
function migrateInteractiveContent(content) {
  const legacy = content;
  const hasTop = "teacherActions" in legacy;
  const hasNested = legacy.widgetConfig != null && "teacherActions" in legacy.widgetConfig;
  if (!hasTop && !hasNested) {
    return content;
  }
  const { teacherActions: _top, widgetConfig, ...rest } = legacy;
  const next = rest;
  if (widgetConfig !== void 0) {
    if (hasNested) {
      const { teacherActions: _nested, ...widgetRest } = widgetConfig;
      next.widgetConfig = widgetRest;
    } else {
      next.widgetConfig = widgetConfig;
    }
  }
  return next;
}
function migrateScene(scene) {
  const migratedContent = migrateSceneContent(scene.content);
  if (migratedContent === scene.content) {
    return scene;
  }
  return makeScene(scene, migratedContent);
}
function migrateSceneContent(content) {
  if (content.type === "slide") {
    return migrateSlideContent(content);
  }
  if (content.type === "interactive") {
    return migrateInteractiveContent(content);
  }
  return content;
}
var CURRENT_SLIDE_CONTENT_SCHEMA_VERSION;
var init_slide_schema = __esm({
  "OpenMAIC/lib/edit/slide-schema.ts"() {
    "use strict";
    init_stage();
    CURRENT_SLIDE_CONTENT_SCHEMA_VERSION = 1;
  }
});

// OpenMAIC/lib/pbl/v2/runtime/clone.ts
function clone(value) {
  return structuredClone(value);
}
var init_clone = __esm({
  "OpenMAIC/lib/pbl/v2/runtime/clone.ts"() {
    "use strict";
  }
});

// OpenMAIC/lib/persistence/plain-json.ts
function isPlainObject(value) {
  const prototype = Object.getPrototypeOf(value);
  return prototype === null || Object.getPrototypeOf(prototype) === null;
}
function isPlainArray(value) {
  const arrayPrototype = Object.getPrototypeOf(value);
  const objectPrototype = arrayPrototype === null ? null : Object.getPrototypeOf(arrayPrototype);
  return objectPrototype !== null && Object.getPrototypeOf(objectPrototype) === null;
}
function isCanonicalArrayIndex(key2, length) {
  const index = Number(key2);
  return Number.isInteger(index) && index >= 0 && index < length && String(index) === key2;
}
function omitUndefinedObjectMembers(value) {
  return canonicalize(value, /* @__PURE__ */ new WeakMap());
}
function canonicalize(value, seen) {
  if (value === null || typeof value !== "object") return value;
  const prior = seen.get(value);
  if (prior) return prior;
  if (Array.isArray(value)) {
    if (!isPlainArray(value)) return value;
    for (const key2 of Reflect.ownKeys(value)) {
      if (key2 === "length") continue;
      if (typeof key2 !== "string" || !isCanonicalArrayIndex(key2, value.length)) return value;
      const descriptor = Object.getOwnPropertyDescriptor(value, key2);
      if (descriptor?.get || descriptor?.set) return value;
    }
    const copy2 = new Array(value.length);
    seen.set(value, copy2);
    for (let index = 0; index < value.length; index += 1) {
      if (!Object.hasOwn(value, index)) continue;
      const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
      if (!descriptor || !("value" in descriptor)) continue;
      Object.defineProperty(copy2, index, {
        ...descriptor,
        value: canonicalize(descriptor.value, seen)
      });
    }
    return copy2;
  }
  if (!isPlainObject(value)) return value;
  const keys = Reflect.ownKeys(value);
  for (const key2 of keys) {
    if (typeof key2 !== "string") return value;
    const descriptor = Object.getOwnPropertyDescriptor(value, key2);
    if (!descriptor?.enumerable || descriptor.get || descriptor.set) return value;
  }
  const copy = Object.create(Object.getPrototypeOf(value));
  seen.set(value, copy);
  for (const key2 of keys) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key2);
    if (!descriptor || !("value" in descriptor) || descriptor.value === void 0) continue;
    Object.defineProperty(copy, key2, {
      ...descriptor,
      value: canonicalize(descriptor.value, seen)
    });
  }
  return copy;
}
var init_plain_json = __esm({
  "OpenMAIC/lib/persistence/plain-json.ts"() {
    "use strict";
  }
});

// OpenMAIC/lib/pbl/v2/runtime/record-payloads.ts
function findMessage(project, event) {
  return project.threads.find((thread) => thread.agentId === event.threadId)?.messages.find((message) => message.id === event.messageId);
}
function statusAttachment(project, event) {
  if (event.entityType === "project" || event.entityType === "ui_phase") {
    return {
      attachment: { kind: "status", entityType: event.entityType, entityId: event.entityId }
    };
  }
  const milestone = event.entityType === "milestone" ? project.milestones.find((candidate) => candidate.id === event.entityId) : project.milestones.find(
    (candidate) => candidate.microtasks.some((microtask2) => microtask2.id === event.entityId)
  );
  if (!milestone) return { attachment: null, reason: "milestone_not_found" };
  if (event.entityType === "milestone") {
    return {
      attachment: {
        kind: "status",
        entityType: "milestone",
        entityId: event.entityId,
        milestone: { internalAssessment: milestone.internalAssessment }
      }
    };
  }
  const microtask = milestone.microtasks.find((candidate) => candidate.id === event.entityId);
  if (!microtask) return { attachment: null, reason: "microtask_not_found" };
  return {
    attachment: {
      kind: "status",
      entityType: "microtask",
      entityId: event.entityId,
      microtask: {
        internalAssessment: microtask.internalAssessment,
        completionReason: microtask.completionReason,
        engagement: microtask.engagement
      }
    }
  };
}
function enrichPBLRuntimeEvent(project, event) {
  const withAttachment = (attachment, attachmentMissingReason) => omitUndefinedObjectMembers({
    kind: "pbl_runtime_event",
    payloadVersion: PBL_RUNTIME_PAYLOAD_VERSION,
    event: clone(event),
    attachment: clone(attachment),
    attachmentMissingReason
  });
  switch (event.kind) {
    case "message_created": {
      const message = findMessage(project, event);
      return message ? withAttachment({ kind: "message", message }) : withAttachment(null, "message_not_found");
    }
    case "submission_created": {
      const submission = project.submissions.find(
        (candidate) => candidate.id === event.submissionId
      );
      return submission ? withAttachment({ kind: "submission", submission }) : withAttachment(null, "submission_not_found");
    }
    case "evaluation_created": {
      const evaluation = project.evaluations.find(
        (candidate) => candidate.id === event.evaluationId
      );
      return evaluation ? withAttachment({ kind: "evaluation", evaluation }) : withAttachment(null, "evaluation_not_found");
    }
    case "status_changed": {
      const { attachment, reason } = statusAttachment(project, event);
      return withAttachment(attachment, reason);
    }
    case "handover_staged":
    case "handover_consumed":
      return project.pendingHandover ? withAttachment({ kind: "handover", handover: project.pendingHandover }) : withAttachment(null, "handover_not_found");
    case "task_completion_staged":
      return project.pendingTaskCompletion ? withAttachment({
        kind: "pending_task_completion",
        pendingTaskCompletion: project.pendingTaskCompletion
      }) : withAttachment(null, "pending_task_completion_not_found");
    case "proficiency_updated":
      return project.proficiencyAssessment ? withAttachment({ kind: "proficiency", assessment: project.proficiencyAssessment }) : withAttachment(null, "proficiency_assessment_not_found");
    case "project_reset":
    case "task_completion_cleared":
    case "tool_call_started":
    case "tool_call_succeeded":
    case "tool_call_failed":
      return withAttachment(null);
    default: {
      const _exhaustive = event;
      void _exhaustive;
      return withAttachment(null, "unhandled_event_kind");
    }
  }
}
function pblEngagementRecordPayload(event) {
  return omitUndefinedObjectMembers({
    kind: "pbl_engagement_event",
    payloadVersion: PBL_RUNTIME_PAYLOAD_VERSION,
    event: clone(event)
  });
}
function pblSnapshotRecordPayload(args) {
  return omitUndefinedObjectMembers({
    kind: "pbl_snapshot",
    payloadVersion: PBL_RUNTIME_PAYLOAD_VERSION,
    epoch: args.epoch,
    learnerState: clone(args.learnerState),
    anchor: { ...args.anchor },
    reason: args.reason
  });
}
var PBL_RUNTIME_PAYLOAD_VERSION, PBL_RUNTIME_EVENT_KINDS_REQUIRING_ATTACHMENT;
var init_record_payloads = __esm({
  "OpenMAIC/lib/pbl/v2/runtime/record-payloads.ts"() {
    "use strict";
    init_clone();
    init_plain_json();
    PBL_RUNTIME_PAYLOAD_VERSION = 1;
    PBL_RUNTIME_EVENT_KINDS_REQUIRING_ATTACHMENT = /* @__PURE__ */ new Set([
      "message_created",
      "submission_created",
      "evaluation_created",
      "proficiency_updated",
      "handover_staged",
      "handover_consumed",
      "task_completion_staged"
    ]);
  }
});

// OpenMAIC/lib/pbl/v2/runtime/drain.ts
import { BrowserKVStore as BrowserKVStore5 } from "@openmaic/storage";
function getDefaultKv() {
  return defaultKv3 ??= new BrowserKVStore5();
}
function watermarkKey(stageId, sceneId, learnerKey) {
  return `runtime.pblDrain.${stageId}.${sceneId}.${learnerKey}`;
}
function deterministicPBLSessionId(stageId, learnerKey) {
  return `pbl-${stageId}-${learnerKey}`;
}
function createDrainDeadline(ms) {
  return { expiresAt: Date.now() + ms };
}
function isDeadlineExpired(deadline) {
  return Date.now() >= deadline.expiresAt;
}
async function withTimeout2(work, ms) {
  let timer;
  try {
    return await Promise.race([
      work,
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error(`timed out after ${ms}ms`)), ms);
      })
    ]);
  } finally {
    clearTimeout(timer);
  }
}
function normalizeWatermark(value) {
  if (!value || typeof value !== "object") return {};
  const maybe = value;
  const watermark = {};
  if (typeof maybe.lastRuntimeEventId === "string") {
    watermark.lastRuntimeEventId = maybe.lastRuntimeEventId;
  }
  if (typeof maybe.lastEngagementEventId === "string") {
    watermark.lastEngagementEventId = maybe.lastEngagementEventId;
  }
  return watermark;
}
async function readWatermark(kv, key2) {
  try {
    return normalizeWatermark(await kv.get(key2, WATERMARK_SCOPE));
  } catch (error) {
    console.warn(
      `Ignoring unreadable PBL drain watermark ${key2}; redraining visible events:`,
      error
    );
    return {};
  }
}
function undrainedEvents(events, lastEventId) {
  if (!lastEventId) return [...events];
  const drainedIndex = events.findIndex((event) => event.id === lastEventId);
  if (drainedIndex < 0) {
    return [...events];
  }
  return events.slice(drainedIndex + 1);
}
async function ensurePBLRuntimeSession(store2, stageId, learnerKey) {
  const inFlightKey = `${stageId}:${learnerKey}`;
  const inFlight2 = inFlightPblSessions.get(inFlightKey);
  if (inFlight2) return inFlight2;
  const sessionPromise = ensurePBLSessionUnmemoized(store2, stageId, learnerKey);
  inFlightPblSessions.set(inFlightKey, sessionPromise);
  try {
    return await sessionPromise;
  } finally {
    inFlightPblSessions.delete(inFlightKey);
  }
}
async function ensurePBLSessionUnmemoized(store2, stageId, learnerKey) {
  const sessions = await store2.listSessions(stageId, learnerKey);
  const active = sessions.find((session) => session.kind === "pbl" && session.status === "active");
  if (active) return active.id;
  const now = (/* @__PURE__ */ new Date()).toISOString();
  try {
    const created = await store2.createSession({
      id: deterministicPBLSessionId(stageId, learnerKey),
      kind: "pbl",
      stageId,
      learnerKey,
      status: "active",
      createdAt: now,
      updatedAt: now
    });
    return created.id;
  } catch (error) {
    if (!/already exists/i.test(String(error instanceof Error ? error.message : error))) {
      throw error;
    }
    const relisted = await store2.listSessions(stageId, learnerKey);
    const racedActive = relisted.find(
      (session) => session.kind === "pbl" && session.status === "active"
    );
    if (racedActive) return racedActive.id;
    throw error;
  }
}
function subAnchorFor(event) {
  return event.microtaskId ?? event.milestoneId;
}
function subAnchorForEngagement(event) {
  return event.microtaskId;
}
function orderedDrainEvents(runtimeEvents, engagementEvents) {
  return [
    ...runtimeEvents.map((event, index) => ({ ledger: "runtime", event, index })),
    ...engagementEvents.map((event, index) => ({ ledger: "engagement", event, index }))
  ].sort((a, b) => {
    const byTimestamp = a.event.ts.localeCompare(b.event.ts);
    if (byTimestamp !== 0) return byTimestamp;
    if (a.ledger !== b.ledger) return a.ledger === "runtime" ? -1 : 1;
    return a.index - b.index;
  });
}
async function persistWatermark(kv, key2, watermark) {
  await kv.set(key2, watermark, WATERMARK_SCOPE);
}
async function clearStageDrainWatermarks(stageId, kv = getDefaultKv()) {
  const keys = await kv.keys(`runtime.pblDrain.${stageId}.`, WATERMARK_SCOPE);
  await Promise.all(keys.map((key2) => kv.remove(key2, WATERMARK_SCOPE)));
}
async function drainProjectRuntimeWork({
  stageId,
  sceneId,
  project,
  store: injectedStore,
  kv: injectedKv,
  learnerKey: injectedLearnerKey
}, deadline) {
  const kv = injectedKv ?? getDefaultKv();
  const learnerKey = injectedLearnerKey ?? await getLearnerKey(kv);
  const store2 = injectedStore ?? getRuntimeStore();
  const key2 = watermarkKey(stageId, sceneId, learnerKey);
  const watermark = await readWatermark(kv, key2);
  const runtimeEvents = undrainedEvents(project.runtimeEvents ?? [], watermark.lastRuntimeEventId);
  const engagementEvents = undrainedEvents(
    project.engagementEvents ?? [],
    watermark.lastEngagementEventId
  );
  let nextWatermark = { ...watermark };
  if (runtimeEvents.length === 0 && engagementEvents.length === 0) {
    if (isDeadlineExpired(deadline)) return;
    await persistWatermark(kv, key2, nextWatermark);
    return;
  }
  const sessionId = await ensurePBLRuntimeSession(store2, stageId, learnerKey);
  try {
    for (const item of orderedDrainEvents(runtimeEvents, engagementEvents)) {
      if (isDeadlineExpired(deadline)) return;
      if (item.ledger === "runtime") {
        await store2.appendRecord({
          id: item.event.id,
          sessionId,
          sceneId,
          subAnchor: subAnchorFor(item.event),
          createdAt: item.event.ts,
          payload: enrichPBLRuntimeEvent(project, item.event)
        });
        nextWatermark = { ...nextWatermark, lastRuntimeEventId: item.event.id };
      } else {
        await store2.appendRecord({
          id: item.event.id,
          sessionId,
          sceneId,
          subAnchor: subAnchorForEngagement(item.event),
          createdAt: item.event.ts,
          payload: pblEngagementRecordPayload(item.event)
        });
        nextWatermark = { ...nextWatermark, lastEngagementEventId: item.event.id };
      }
    }
  } catch (error) {
    if (!isDeadlineExpired(deadline)) {
      await persistWatermark(kv, key2, nextWatermark);
    }
    throw error;
  }
  if (isDeadlineExpired(deadline)) return;
  await persistWatermark(kv, key2, nextWatermark);
}
async function waitForActiveDrainWork(key2) {
  while (true) {
    const active = [...activePblDrainWork.get(key2) ?? []];
    if (active.length === 0) return;
    await Promise.allSettled(active);
  }
}
async function withDrainedProjectRuntime(args, work, globalLockHeld = false) {
  const run = async () => {
    const kv = args.kv ?? getDefaultKv();
    const learnerKey = args.learnerKey ?? await getLearnerKey(kv);
    const store2 = args.store ?? getRuntimeStore();
    const inFlightKey = `${args.stageId}:${args.sceneId}:${learnerKey}`;
    const previous = inFlightPblDrains.get(inFlightKey) ?? Promise.resolve();
    const deadline = createDrainDeadline(PBL_HYDRATION_DRAIN_BARRIER_TIMEOUT_MS);
    const serialized = previous.catch(() => {
    }).then(async () => {
      await withTimeout2(
        waitForActiveDrainWork(inFlightKey),
        PBL_HYDRATION_DRAIN_BARRIER_TIMEOUT_MS
      );
      await drainProjectRuntimeWork(
        {
          ...args,
          store: store2,
          kv,
          learnerKey
        },
        deadline
      );
      if (isDeadlineExpired(deadline)) {
        throw new Error(`timed out after ${PBL_HYDRATION_DRAIN_BARRIER_TIMEOUT_MS}ms`);
      }
      return work();
    });
    const chain = serialized.then(() => void 0);
    inFlightPblDrains.set(inFlightKey, chain);
    void chain.finally(() => {
      if (inFlightPblDrains.get(inFlightKey) === chain) {
        inFlightPblDrains.delete(inFlightKey);
      }
    }).catch(() => {
    });
    return serialized;
  };
  const operation = globalLockHeld ? run() : withRuntimeStorageSharedLock(run);
  operation.catch(() => {
  });
  return globalLockHeld ? operation : withTimeout2(operation, PBL_HYDRATION_DRAIN_BARRIER_TIMEOUT_MS);
}
var PBL_DRAIN_TIMEOUT_MS, PBL_DRAIN_CHAIN_HARD_CAP_MS, PBL_HYDRATION_DRAIN_BARRIER_TIMEOUT_MS, WATERMARK_SCOPE, defaultKv3, inFlightPblSessions, inFlightPblDrains, activePblDrainWork;
var init_drain = __esm({
  "OpenMAIC/lib/pbl/v2/runtime/drain.ts"() {
    "use strict";
    init_learner_key();
    init_store();
    init_chat_storage_lock();
    init_record_payloads();
    PBL_DRAIN_TIMEOUT_MS = 1e4;
    PBL_DRAIN_CHAIN_HARD_CAP_MS = PBL_DRAIN_TIMEOUT_MS * 2;
    PBL_HYDRATION_DRAIN_BARRIER_TIMEOUT_MS = PBL_DRAIN_CHAIN_HARD_CAP_MS;
    WATERMARK_SCOPE = "device";
    inFlightPblSessions = /* @__PURE__ */ new Map();
    inFlightPblDrains = /* @__PURE__ */ new Map();
    activePblDrainWork = /* @__PURE__ */ new Map();
  }
});

// OpenMAIC/lib/pbl/v2/operations/kernel/engagement.ts
var engagement_exports = {};
import * as generation_star from "@openmaic/generation";
var init_engagement = __esm({
  "OpenMAIC/lib/pbl/v2/operations/kernel/engagement.ts"() {
    "use strict";
    __reExport(engagement_exports, generation_star);
  }
});

// OpenMAIC/lib/pbl/v2/runtime/learner-state.ts
function assignOptional(target, key2, value) {
  if (value === void 0) return;
  target[key2] = clone(value);
}
function usableAssessment(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  if (typeof value.tier !== "string") return void 0;
  if (!Array.isArray(value.transitions)) return void 0;
  return value;
}
function extractLearnerState(project) {
  const state = {
    uiPhase: project.uiPhase,
    status: project.status,
    milestones: project.milestones.map((milestone) => {
      const milestoneState = {
        id: milestone.id,
        status: milestone.status,
        microtasks: milestone.microtasks.map((microtask) => {
          const microtaskState = {
            id: microtask.id,
            status: microtask.status
          };
          assignOptional(microtaskState, "internalAssessment", microtask.internalAssessment);
          assignOptional(microtaskState, "completionReason", microtask.completionReason);
          assignOptional(microtaskState, "engagement", microtask.engagement);
          return microtaskState;
        })
      };
      assignOptional(milestoneState, "internalAssessment", milestone.internalAssessment);
      return milestoneState;
    }),
    submissions: clone(project.submissions),
    evaluations: clone(project.evaluations),
    threads: project.threads.map((thread) => {
      const threadState = {
        agentId: thread.agentId,
        messages: clone(thread.messages)
      };
      assignOptional(threadState, "earlierSummary", thread.earlierSummary);
      return threadState;
    }),
    engagementEvents: clone(project.engagementEvents)
  };
  assignOptional(state, "proficiencyAssessment", usableAssessment(project.proficiencyAssessment));
  assignOptional(state, "pendingHandover", project.pendingHandover);
  assignOptional(state, "pendingTaskCompletion", project.pendingTaskCompletion);
  assignOptional(state, "runtimeResetEpoch", project.runtimeResetEpoch);
  return omitUndefinedObjectMembers(state);
}
function stripToDesignTemplate(project) {
  const template = clone(project);
  const assessment = template.proficiencyAssessment;
  const transitions = assessment && typeof assessment === "object" && !Array.isArray(assessment) ? assessment.transitions : void 0;
  const firstTransition = Array.isArray(transitions) ? transitions[0] : void 0;
  const transitionFrom = firstTransition && typeof firstTransition === "object" && !Array.isArray(firstTransition) ? firstTransition.from : void 0;
  const authoredProficiency = transitionFrom === "beginner" || transitionFrom === "intermediate" || transitionFrom === "advanced" ? transitionFrom : template.proficiency;
  template.uiPhase = "hero";
  template.status = "active";
  template.submissions = [];
  template.evaluations = [];
  template.engagementEvents = [];
  template.proficiencyAssessment = void 0;
  template.proficiency = authoredProficiency;
  template.runtimeEvents = void 0;
  template.runtimeResetEpoch = void 0;
  template.pendingHandover = void 0;
  template.pendingTaskCompletion = void 0;
  template.pendingOpenTaskPriorQuizResults = void 0;
  template.threads = template.threads.map(
    (thread) => ({
      agentId: thread.agentId,
      messages: []
    })
  );
  template.milestones = template.milestones.map((milestone, index) => ({
    ...milestone,
    status: index === 0 ? "active" : "locked",
    internalAssessment: void 0,
    microtasks: milestone.microtasks.map((microtask) => ({
      ...microtask,
      status: "todo",
      internalAssessment: void 0,
      completionReason: void 0,
      engagement: void 0
    }))
  }));
  return template;
}
function applyLearnerState(designTemplate, learnerState) {
  const next = stripToDesignTemplate(designTemplate);
  next.uiPhase = learnerState.uiPhase;
  next.status = learnerState.status;
  next.submissions = clone(learnerState.submissions);
  next.evaluations = clone(learnerState.evaluations);
  next.engagementEvents = clone(learnerState.engagementEvents);
  next.runtimeResetEpoch = learnerState.runtimeResetEpoch;
  next.pendingHandover = clone(learnerState.pendingHandover);
  next.pendingTaskCompletion = clone(learnerState.pendingTaskCompletion);
  const assessment = usableAssessment(learnerState.proficiencyAssessment);
  if (assessment) {
    next.proficiencyAssessment = clone(assessment);
    next.proficiency = assessment.tier;
  }
  const milestonesById = new Map(
    learnerState.milestones.map((milestone) => [milestone.id, milestone])
  );
  next.milestones = next.milestones.map((milestone) => {
    const milestoneState = milestonesById.get(milestone.id);
    if (!milestoneState) return milestone;
    const microtasksById = new Map(
      milestoneState.microtasks.map((microtask) => [microtask.id, microtask])
    );
    return {
      ...milestone,
      status: milestoneState.status,
      internalAssessment: clone(milestoneState.internalAssessment),
      microtasks: milestone.microtasks.map((microtask) => {
        const microtaskState = microtasksById.get(microtask.id);
        if (!microtaskState) return microtask;
        return {
          ...microtask,
          status: microtaskState.status,
          internalAssessment: clone(microtaskState.internalAssessment),
          completionReason: microtaskState.completionReason,
          engagement: clone(microtaskState.engagement)
        };
      })
    };
  });
  const existingThreadIds = new Set(next.threads.map((thread) => thread.agentId));
  const threadsById = new Map(learnerState.threads.map((thread) => [thread.agentId, thread]));
  next.threads = next.threads.map((thread) => {
    const threadState = threadsById.get(thread.agentId);
    if (!threadState) return thread;
    return {
      agentId: thread.agentId,
      messages: clone(threadState.messages),
      earlierSummary: threadState.earlierSummary
    };
  });
  for (const threadState of learnerState.threads) {
    if (existingThreadIds.has(threadState.agentId)) continue;
    next.threads.push({
      agentId: threadState.agentId,
      messages: clone(threadState.messages),
      earlierSummary: threadState.earlierSummary
    });
  }
  return next;
}
var init_learner_state = __esm({
  "OpenMAIC/lib/pbl/v2/runtime/learner-state.ts"() {
    "use strict";
    init_plain_json();
    init_clone();
  }
});

// OpenMAIC/lib/pbl/v2/runtime/fold.ts
function isObject(value) {
  return !!value && typeof value === "object";
}
function isRuntimeEvent(value) {
  return isObject(value) && typeof value.id === "string" && typeof value.kind === "string" && "actorType" in value;
}
function isEngagementEvent(value) {
  return isObject(value) && typeof value.id === "string" && typeof value.kind === "string" && typeof value.ts === "string" && !("actorType" in value);
}
function normalizePayload(payload) {
  if (!isObject(payload)) return void 0;
  if (payload.kind === "pbl_runtime_event" && isRuntimeEvent(payload.event)) {
    return payload;
  }
  if (payload.kind === "pbl_engagement_event" && isEngagementEvent(payload.event)) {
    return payload;
  }
  if (payload.kind === "pbl_snapshot" && isObject(payload.learnerState)) {
    return payload;
  }
  if (isRuntimeEvent(payload)) {
    return {
      kind: "pbl_runtime_event",
      payloadVersion: 1,
      event: payload,
      attachment: null,
      attachmentMissingReason: PBL_RUNTIME_EVENT_KINDS_REQUIRING_ATTACHMENT.has(payload.kind) ? "legacy_raw_record_missing_attachment" : void 0
    };
  }
  if (isEngagementEvent(payload)) {
    return {
      kind: "pbl_engagement_event",
      payloadVersion: 1,
      event: payload
    };
  }
  return void 0;
}
function eventKey(kind, id) {
  return `${kind}:${id}`;
}
function addGap(gaps, record, payload, reason) {
  const event = payload?.event;
  gaps.push({
    recordId: record.id,
    seq: record.seq,
    eventId: event?.id,
    kind: event?.kind ?? payload?.kind ?? "unknown",
    reason
  });
}
function findMilestone(state, milestoneId) {
  return state.milestones.find((milestone) => milestone.id === milestoneId);
}
function findMicrotask(state, microtaskId) {
  for (const milestone of state.milestones) {
    const microtask = milestone.microtasks.find((candidate) => candidate.id === microtaskId);
    if (microtask) return { milestone, microtask };
  }
  return void 0;
}
function upsertThreadMessage(state, threadId, message) {
  let thread = state.threads.find((candidate) => candidate.agentId === threadId);
  if (!thread) {
    thread = { agentId: threadId, messages: [] };
    state.threads.push(thread);
  }
  if (!thread.messages.some((candidate) => candidate.id === message.id)) {
    thread.messages.push(clone(message));
  }
}
function applyRuntimeEvent(state, payload, record, gaps) {
  const event = payload.event;
  switch (event.kind) {
    case "project_reset":
      return "reset";
    case "status_changed": {
      if (event.entityType === "project") {
        state.status = event.to;
        return void 0;
      }
      if (event.entityType === "ui_phase") {
        state.uiPhase = event.to;
        return void 0;
      }
      if (event.entityType === "milestone") {
        const milestone = findMilestone(state, event.entityId);
        if (!milestone) {
          addGap(gaps, record, payload, "milestone_not_found");
          return void 0;
        }
        milestone.status = event.to;
        if (payload.attachment?.kind === "status") {
          milestone.internalAssessment = clone(payload.attachment.milestone?.internalAssessment);
        }
        return void 0;
      }
      const found = findMicrotask(state, event.entityId);
      if (!found) {
        addGap(gaps, record, payload, "microtask_not_found");
        return void 0;
      }
      found.microtask.status = event.to;
      if (payload.attachment?.kind === "status") {
        found.microtask.internalAssessment = clone(
          payload.attachment.microtask?.internalAssessment
        );
        found.microtask.completionReason = payload.attachment.microtask?.completionReason;
        found.microtask.engagement = clone(payload.attachment.microtask?.engagement);
      }
      return void 0;
    }
    case "message_created":
      if (payload.attachment?.kind !== "message") {
        addGap(
          gaps,
          record,
          payload,
          payload.attachmentMissingReason ?? "message_attachment_missing"
        );
        return void 0;
      }
      upsertThreadMessage(state, event.threadId, payload.attachment.message);
      return void 0;
    case "submission_created":
      if (payload.attachment?.kind !== "submission") {
        addGap(
          gaps,
          record,
          payload,
          payload.attachmentMissingReason ?? "submission_attachment_missing"
        );
        return void 0;
      }
      {
        const attachment = payload.attachment;
        if (!state.submissions.some((submission) => submission.id === attachment.submission.id)) {
          state.submissions.push(clone(attachment.submission));
        }
      }
      return void 0;
    case "evaluation_created":
      if (payload.attachment?.kind !== "evaluation") {
        addGap(
          gaps,
          record,
          payload,
          payload.attachmentMissingReason ?? "evaluation_attachment_missing"
        );
        return void 0;
      }
      {
        const attachment = payload.attachment;
        if (!state.evaluations.some((evaluation) => evaluation.id === attachment.evaluation.id)) {
          state.evaluations.push(clone(attachment.evaluation));
        }
      }
      return void 0;
    case "handover_staged":
      if (payload.attachment?.kind !== "handover") {
        addGap(
          gaps,
          record,
          payload,
          payload.attachmentMissingReason ?? "handover_attachment_missing"
        );
        return void 0;
      }
      state.pendingHandover = clone(payload.attachment.handover);
      return void 0;
    case "handover_consumed":
      if (payload.attachment?.kind === "handover") {
        state.pendingHandover = clone(payload.attachment.handover);
      } else if (state.pendingHandover) {
        state.pendingHandover = { ...state.pendingHandover, consumed: true };
      } else {
        addGap(
          gaps,
          record,
          payload,
          payload.attachmentMissingReason ?? "handover_attachment_missing"
        );
      }
      return void 0;
    case "task_completion_staged":
      if (payload.attachment?.kind !== "pending_task_completion") {
        addGap(
          gaps,
          record,
          payload,
          payload.attachmentMissingReason ?? "pending_task_completion_attachment_missing"
        );
        return void 0;
      }
      state.pendingTaskCompletion = clone(payload.attachment.pendingTaskCompletion);
      return void 0;
    case "task_completion_cleared":
      state.pendingTaskCompletion = void 0;
      return void 0;
    case "proficiency_updated":
      if (payload.attachment?.kind !== "proficiency") {
        addGap(
          gaps,
          record,
          payload,
          payload.attachmentMissingReason ?? "proficiency_attachment_missing"
        );
        return void 0;
      }
      state.proficiencyAssessment = clone(payload.attachment.assessment);
      return void 0;
    case "tool_call_started":
    case "tool_call_succeeded":
    case "tool_call_failed":
      return void 0;
    default: {
      const _exhaustive = event;
      void _exhaustive;
      addGap(gaps, record, payload, "unhandled_event_kind");
      return void 0;
    }
  }
}
function applyEngagementEvent(state, payload) {
  if (!state.engagementEvents.some((event) => event.id === payload.event.id)) {
    state.engagementEvents.push(clone(payload.event));
    if (state.engagementEvents.length > engagement_exports.MAX_ENGAGEMENT_EVENTS) {
      state.engagementEvents.splice(0, state.engagementEvents.length - engagement_exports.MAX_ENGAGEMENT_EVENTS);
    }
  }
}
function snapshotIsUsable(snapshot, currentEpoch) {
  return snapshot.epoch >= currentEpoch;
}
function foldPBLRuntime({
  designTemplate,
  records
}) {
  const baselineProject = stripToDesignTemplate(designTemplate);
  const baseline = extractLearnerState(baselineProject);
  let state = clone(baseline);
  let epoch = state.runtimeResetEpoch ?? 0;
  const gaps = [];
  const seen = /* @__PURE__ */ new Set();
  for (const record of [...records].sort((a, b) => a.seq - b.seq)) {
    const payload = normalizePayload(record.payload);
    if (!payload) {
      addGap(gaps, record, void 0, "payload_malformed");
      continue;
    }
    if (payload.kind === "pbl_snapshot") {
      if (!snapshotIsUsable(payload, epoch)) continue;
      epoch = payload.epoch;
      state = clone(payload.learnerState);
      state.runtimeResetEpoch = payload.epoch === 0 ? state.runtimeResetEpoch : payload.epoch;
      gaps.length = 0;
      if (payload.anchor.lastRuntimeEventId) {
        seen.add(eventKey("runtime", payload.anchor.lastRuntimeEventId));
      }
      if (payload.anchor.lastEngagementEventId) {
        seen.add(eventKey("engagement", payload.anchor.lastEngagementEventId));
      }
      continue;
    }
    if (payload.kind === "pbl_engagement_event") {
      const key3 = eventKey("engagement", payload.event.id);
      if (seen.has(key3)) continue;
      seen.add(key3);
      applyEngagementEvent(state, payload);
      continue;
    }
    const key2 = eventKey("runtime", payload.event.id);
    if (seen.has(key2)) continue;
    seen.add(key2);
    const result = applyRuntimeEvent(state, payload, record, gaps);
    if (result === "reset") {
      const proficiencyAssessment = clone(state.proficiencyAssessment);
      epoch += 1;
      state = clone(baseline);
      state.proficiencyAssessment = proficiencyAssessment;
      state.runtimeResetEpoch = epoch;
      gaps.length = 0;
    }
  }
  const normalized = extractLearnerState(applyLearnerState(baselineProject, state));
  return { learnerState: normalized, diagnostics: { gaps } };
}
var init_fold = __esm({
  "OpenMAIC/lib/pbl/v2/runtime/fold.ts"() {
    "use strict";
    init_engagement();
    init_learner_state();
    init_record_payloads();
    init_clone();
  }
});

// OpenMAIC/lib/pbl/v2/runtime/hydration.ts
import { BrowserKVStore as BrowserKVStore6 } from "@openmaic/storage";
import codemateLodash1 from "lodash";
const { isEqual } = codemateLodash1;
function getDefaultKv2() {
  return defaultKv4 ??= new BrowserKVStore6();
}
async function withPBLRuntimeTransaction(store2, key2, work) {
  let storeTransactions = inFlightPblRuntimeTransactions.get(store2);
  if (!storeTransactions) {
    storeTransactions = /* @__PURE__ */ new Map();
    inFlightPblRuntimeTransactions.set(store2, storeTransactions);
  }
  const previous = storeTransactions.get(key2) ?? Promise.resolve();
  const current = previous.catch(() => {
  }).then(work);
  storeTransactions.set(key2, current);
  try {
    return await current;
  } finally {
    if (storeTransactions.get(key2) === current) {
      storeTransactions.delete(key2);
    }
  }
}
function shortValue(value) {
  const text = JSON.stringify(value);
  if (text === void 0) return "undefined";
  return text.length > 80 ? `${text.slice(0, 77)}...` : text;
}
function diffLearnerState(a, b, path6 = "", out = []) {
  if (out.length >= 8) return out;
  if (isEqual(a, b)) return out;
  if (!a || !b || typeof a !== "object" || typeof b !== "object") {
    out.push(`${path6 || "<root>"}: ${shortValue(a)} != ${shortValue(b)}`);
    return out;
  }
  const aObject = a;
  const bObject = b;
  const keys = Array.from(/* @__PURE__ */ new Set([...Object.keys(aObject), ...Object.keys(bObject)])).sort();
  for (const key2 of keys) {
    diffLearnerState(aObject[key2], bObject[key2], path6 ? `${path6}.${key2}` : key2, out);
    if (out.length >= 8) break;
  }
  return out;
}
async function activePBLSessionId(store2, stageId, learnerKey) {
  const sessions = await store2.listSessions(stageId, learnerKey);
  return sessions.find((session) => session.kind === "pbl" && session.status === "active")?.id;
}
async function listPBLRecords(args) {
  const sessionId = await activePBLSessionId(args.store, args.stageId, args.learnerKey);
  if (!sessionId) return [];
  return args.store.listRecords(sessionId, { sceneId: args.sceneId });
}
async function appendPBLRuntimeSnapshotIfChanged(args) {
  const epoch = args.learnerState.runtimeResetEpoch ?? 0;
  const latestPayload = args.records.at(-1)?.payload;
  if (latestPayload?.kind === "pbl_snapshot" && latestPayload.epoch === epoch && isEqual(latestPayload.learnerState, args.learnerState) && (args.reason !== "write_cutover" || latestPayload.reason === "write_cutover")) {
    return false;
  }
  const sessionId = await ensurePBLRuntimeSession(args.store, args.stageId, args.learnerKey);
  const now = (/* @__PURE__ */ new Date()).toISOString();
  await args.store.appendRecord({
    id: `pbl-snapshot-${args.sceneId}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    sessionId,
    sceneId: args.sceneId,
    createdAt: now,
    payload: pblSnapshotRecordPayload({
      epoch: args.learnerState.runtimeResetEpoch ?? 0,
      learnerState: args.learnerState,
      anchor: {
        lastRuntimeEventId: args.project.runtimeEvents?.at(-1)?.id,
        lastEngagementEventId: args.project.engagementEvents.at(-1)?.id
      },
      reason: args.reason
    })
  });
  return true;
}
function preserveDocumentTransients(hydrated, documentProject) {
  return {
    ...hydrated,
    runtimeEvents: documentProject.runtimeEvents ? clone(documentProject.runtimeEvents) : void 0,
    pendingOpenTaskPriorQuizResults: documentProject.pendingOpenTaskPriorQuizResults ? clone(documentProject.pendingOpenTaskPriorQuizResults) : void 0
  };
}
function documentContainsLearnerState(project) {
  if (!hasPBLProjectV2Containers(project)) return false;
  const validProject = project;
  const baseline = stripToDesignTemplate(validProject);
  return !isEqual(extractLearnerState(validProject), extractLearnerState(baseline));
}
function hasWriteCutoverSnapshot(records) {
  return records.some((record) => {
    const payload = record.payload;
    return payload.kind === "pbl_snapshot" && payload.reason === "write_cutover";
  });
}
async function synchronizePBLProjectRuntime(args) {
  await withRuntimeStorageSharedLockUntilSettled(async () => {
    const kv = args.kv ?? getDefaultKv2();
    const learnerKey = args.learnerKey ?? await getLearnerKey(kv);
    const store2 = args.store ?? getRuntimeStore();
    const transactionKey = `${args.stageId}:${args.sceneId}:${learnerKey}`;
    await withPBLRuntimeTransaction(
      store2,
      transactionKey,
      () => withDrainedProjectRuntime(
        {
          stageId: args.stageId,
          sceneId: args.sceneId,
          project: args.project,
          store: store2,
          kv,
          learnerKey
        },
        async () => {
          const records = await listPBLRecords({
            store: store2,
            stageId: args.stageId,
            sceneId: args.sceneId,
            learnerKey
          });
          const learnerState = extractLearnerState(args.project);
          const folded = foldPBLRuntime({
            designTemplate: stripToDesignTemplate(args.project),
            records
          });
          const runtimeIsCurrent = isEqual(folded.learnerState, learnerState) && folded.diagnostics.gaps.length === 0;
          const cutoverStarted = hasWriteCutoverSnapshot(records);
          if (runtimeIsCurrent && cutoverStarted) return;
          await appendPBLRuntimeSnapshotIfChanged({
            store: store2,
            stageId: args.stageId,
            sceneId: args.sceneId,
            learnerKey,
            project: args.project,
            learnerState,
            records,
            reason: cutoverStarted ? "self_heal" : "write_cutover"
          });
        },
        true
      )
    );
  }, PBL_HYDRATION_DRAIN_BARRIER_TIMEOUT_MS);
}
async function hydratePBLProjectFromRuntime(args) {
  return withRuntimeStorageSharedLockUntilSettled(async () => {
    const kv = args.kv ?? getDefaultKv2();
    const learnerKey = args.learnerKey ?? await getLearnerKey(kv);
    const store2 = args.store ?? getRuntimeStore();
    const transactionKey = `${args.stageId}:${args.sceneId}:${learnerKey}`;
    return withPBLRuntimeTransaction(
      store2,
      transactionKey,
      () => withDrainedProjectRuntime(
        {
          stageId: args.stageId,
          sceneId: args.sceneId,
          project: args.project,
          store: store2,
          kv,
          learnerKey
        },
        async () => {
          const records = await listPBLRecords({
            store: store2,
            stageId: args.stageId,
            sceneId: args.sceneId,
            learnerKey
          });
          const designTemplate = stripToDesignTemplate(args.project);
          const folded = foldPBLRuntime({ designTemplate, records });
          const documentState = extractLearnerState(args.project);
          const stateMatchesDocument = isEqual(folded.learnerState, documentState);
          const matchesDocument = stateMatchesDocument && folded.diagnostics.gaps.length === 0;
          if (matchesDocument) {
            return {
              project: preserveDocumentTransients(
                applyLearnerState(designTemplate, folded.learnerState),
                args.project
              ),
              source: "fold",
              diagnostics: folded.diagnostics,
              diff: [],
              selfHealed: false
            };
          }
          const diff = diffLearnerState(folded.learnerState, documentState);
          const hasDocumentLearnerState = documentContainsLearnerState(args.project);
          const cutoverStarted = hasWriteCutoverSnapshot(records);
          if (hasDocumentLearnerState && !cutoverStarted && process.env.NODE_ENV !== "production") {
            console.warn("[PBL runtime] document state remained authoritative during hydration", {
              stageId: args.stageId,
              sceneId: args.sceneId,
              diff,
              gaps: folded.diagnostics.gaps.slice(0, 8)
            });
          }
          if (hasDocumentLearnerState && !cutoverStarted) {
            const selfHealed = await appendPBLRuntimeSnapshotIfChanged({
              store: store2,
              stageId: args.stageId,
              sceneId: args.sceneId,
              learnerKey,
              project: args.project,
              learnerState: documentState,
              records,
              reason: records.length === 0 ? "backfill" : "self_heal"
            });
            return {
              project: args.project,
              source: "document",
              diagnostics: folded.diagnostics,
              diff,
              selfHealed
            };
          }
          return {
            project: preserveDocumentTransients(
              applyLearnerState(designTemplate, folded.learnerState),
              args.project
            ),
            source: "fold",
            diagnostics: folded.diagnostics,
            diff,
            selfHealed: false
          };
        },
        true
      )
    );
  }, PBL_HYDRATION_DRAIN_BARRIER_TIMEOUT_MS);
}
async function hydratePBLScenesFromRuntime(stageId, scenes, options4 = {}) {
  return Promise.all(
    scenes.map(async (scene) => {
      const content = scene.content;
      if (content.type !== "pbl") {
        return scene;
      }
      const resolved = resolvePBLContent(content);
      if (resolved.kind !== "v2") return scene;
      try {
        const result = await hydratePBLProjectFromRuntime({
          stageId,
          sceneId: scene.id,
          project: resolved.projectV2,
          store: options4.store,
          kv: options4.kv,
          learnerKey: options4.learnerKey
        });
        return {
          ...scene,
          content: {
            ...content,
            projectV2: result.project
          }
        };
      } catch (error) {
        if (!documentContainsLearnerState(resolved.projectV2)) {
          throw error;
        }
        if (process.env.NODE_ENV !== "production") {
          console.warn(
            "[PBL runtime] failed to hydrate legacy scene from runtime; using embedded document state",
            {
              stageId,
              sceneId: scene.id,
              error
            }
          );
        }
        return scene;
      }
    })
  );
}
var defaultKv4, inFlightPblRuntimeTransactions;
var init_hydration = __esm({
  "OpenMAIC/lib/pbl/v2/runtime/hydration.ts"() {
    "use strict";
    init_learner_key();
    init_store();
    init_chat_storage_lock();
    init_read();
    init_types3();
    init_drain();
    init_fold();
    init_learner_state();
    init_record_payloads();
    init_clone();
    inFlightPblRuntimeTransactions = /* @__PURE__ */ new WeakMap();
  }
});

// OpenMAIC/lib/pbl/v2/runtime/document-persistence.ts
async function preparePBLScenesForDocumentPersistence(stageId, scenes) {
  await Promise.all(
    scenes.map(async (scene) => {
      const content = scene.content;
      if (content.type !== "pbl") return;
      const resolved = resolvePBLContent(content);
      if (resolved.kind !== "v2") return;
      await synchronizePBLProjectRuntime({
        stageId,
        sceneId: scene.id,
        project: resolved.projectV2
      });
    })
  );
  return scenes.map((scene) => {
    const content = scene.content;
    if (content.type !== "pbl") return scene;
    const resolved = resolvePBLContent(content);
    if (resolved.kind !== "v2") return scene;
    const designTemplate = stripToDesignTemplate(resolved.projectV2);
    return {
      ...scene,
      content: {
        ...content,
        projectV2: designTemplate
      }
    };
  });
}
var init_document_persistence = __esm({
  "OpenMAIC/lib/pbl/v2/runtime/document-persistence.ts"() {
    "use strict";
    init_read();
    init_hydration();
    init_learner_state();
  }
});

// OpenMAIC/lib/document-store/canonicalize.ts
function canonicalizeLegacyStage(record) {
  const { currentSceneId, ...stage } = record;
  return { stage, currentSceneId };
}
function canonicalizeLegacyScene(record) {
  const source = record;
  const { whiteboard, ...canonical } = source;
  if (!Object.prototype.hasOwnProperty.call(canonical, "whiteboards") && whiteboard !== void 0) {
    canonical.whiteboards = whiteboard;
  }
  const content = canonical.content;
  return { ...canonical, type: content.type };
}
function canonicalizeLegacyOutline(record) {
  const { stageId: _stageId, ...outline } = record;
  return outline;
}
var init_canonicalize = __esm({
  "OpenMAIC/lib/document-store/canonicalize.ts"() {
    "use strict";
  }
});

// OpenMAIC/lib/document-store/plain-json-store.ts
function resetPlainJsonDocumentWritesForTests() {
  wrappers = /* @__PURE__ */ new WeakMap();
}
function withPlainJsonDocumentWrites(store2) {
  const existing = wrappers.get(store2);
  if (existing) return existing;
  const methods = {
    saveDocument(document2) {
      return store2.saveDocument(omitUndefinedObjectMembers(document2));
    },
    loadDocument(stageId) {
      return store2.loadDocument(stageId);
    },
    listDocuments() {
      return store2.listDocuments();
    },
    deleteDocument(stageId) {
      return store2.deleteDocument(stageId);
    },
    putStage(stageId, stage) {
      return store2.putStage(stageId, omitUndefinedObjectMembers(stage));
    },
    putScene(stageId, scene) {
      return store2.putScene(stageId, omitUndefinedObjectMembers(scene));
    },
    getScene(stageId, sceneId) {
      return store2.getScene(stageId, sceneId);
    },
    deleteScene(stageId, sceneId) {
      return store2.deleteScene(stageId, sceneId);
    }
  };
  const facade = Object.create(Object.getPrototypeOf(store2));
  Object.defineProperties(facade, Object.getOwnPropertyDescriptors(methods));
  const wrapper = new Proxy(facade, {
    get(target, property, receiver) {
      if (Reflect.has(target, property)) {
        return Reflect.get(target, property, receiver);
      }
      return Reflect.get(store2, property, store2);
    }
  });
  wrappers.set(store2, wrapper);
  wrappers.set(wrapper, wrapper);
  return wrapper;
}
var wrappers;
var init_plain_json_store = __esm({
  "OpenMAIC/lib/document-store/plain-json-store.ts"() {
    "use strict";
    init_plain_json();
    wrappers = /* @__PURE__ */ new WeakMap();
  }
});

// OpenMAIC/lib/document-store/store.ts
import { BrowserDocumentStore } from "@openmaic/storage";
function createBrowserStore(deps) {
  if (!deps.indexedDB && typeof indexedDB === "undefined") {
    throw new Error("Document persistence requires IndexedDB (client-only)");
  }
  return withPlainJsonDocumentWrites(
    new BrowserDocumentStore({
      indexedDB: deps.indexedDB,
      dbName: deps.dbName ?? DOCUMENT_DB_NAME,
      validateScene: validateAppScene,
      validateStage: validateAppStage
    })
  );
}
function getDocumentStore(deps = {}) {
  if (deps.store) return withPlainJsonDocumentWrites(deps.store);
  if (deps.indexedDB || deps.dbName) return createBrowserStore(deps);
  return defaultStore ??= (() => {
    const configured = resolveConfiguredDocumentStore();
    return configured ? withPlainJsonDocumentWrites(configured) : createBrowserStore({});
  })();
}
var DOCUMENT_DB_NAME, defaultStore;
var init_store3 = __esm({
  "OpenMAIC/lib/document-store/store.ts"() {
    "use strict";
    init_bootstrap();
    init_config();
    init_plain_json_store();
    init_validators();
    init_config();
    DOCUMENT_DB_NAME = "maic-documents";
    registerDocumentStorageResetHook(() => {
      defaultStore = void 0;
      resetPlainJsonDocumentWritesForTests();
    });
  }
});

// OpenMAIC/lib/document-store/current-scene.ts
import { BrowserKVStore as BrowserKVStore7 } from "@openmaic/storage";
function key(stageId) {
  return `${KEY_PREFIX}${stageId}`;
}
function resolveKv2(kv) {
  if (kv) return kv;
  if (typeof localStorage === "undefined")
    throw new Error("Current-scene persistence requires localStorage (client-only)");
  return defaultKv5 ??= new BrowserKVStore7();
}
function isCurrentSceneValue(value) {
  if (!value || typeof value !== "object") return false;
  const candidate = value;
  return (candidate.sceneId === null || typeof candidate.sceneId === "string") && typeof candidate.updatedAt === "string" && Number.isFinite(Date.parse(candidate.updatedAt));
}
async function loadCurrentSceneValue(stageId, kv) {
  const value = await kv.get(key(stageId), "device");
  return isCurrentSceneValue(value) ? value : null;
}
function saveCurrentSceneValue(stageId, value, kv) {
  return kv.set(key(stageId), value, "device");
}
function loadCurrentScene(stageId, deps = {}) {
  return loadCurrentSceneValue(stageId, resolveKv2(deps.kv));
}
function saveCurrentScene(stageId, sceneId, deps = {}) {
  return saveCurrentSceneValue(
    stageId,
    { sceneId, updatedAt: (/* @__PURE__ */ new Date()).toISOString() },
    resolveKv2(deps.kv)
  );
}
function clearCurrentScene(stageId, deps = {}) {
  return resolveKv2(deps.kv).remove(key(stageId), "device");
}
var KEY_PREFIX, defaultKv5;
var init_current_scene = __esm({
  "OpenMAIC/lib/document-store/current-scene.ts"() {
    "use strict";
    KEY_PREFIX = "editor-current-scene:";
  }
});

// OpenMAIC/lib/document-store/storage-generation.ts
import { BrowserKVStore as BrowserKVStore8 } from "@openmaic/storage";
function resolveKv3(kv) {
  if (kv) return kv;
  if (typeof localStorage === "undefined") {
    throw new Error("Document storage generation requires localStorage (client-only)");
  }
  return defaultKv6 ??= new BrowserKVStore8();
}
async function readGeneration(kv) {
  const generation = await resolveKv3(kv).get(STORAGE_GENERATION_KEY, "device");
  return typeof generation === "number" && Number.isSafeInteger(generation) && generation >= 0 ? generation : 0;
}
var STORAGE_GENERATION_KEY, defaultKv6;
var init_storage_generation = __esm({
  "OpenMAIC/lib/document-store/storage-generation.ts"() {
    "use strict";
    STORAGE_GENERATION_KEY = "document-storage-generation";
  }
});

// OpenMAIC/lib/document-store/migration.ts
import { DSL_VERSION, migrate as migrate2 } from "@openmaic/dsl";
import { BrowserKVStore as BrowserKVStore9 } from "@openmaic/storage";
import isEqual2 from "lodash/isEqual";
async function convertLoadedDocument(document2, deps, ledger) {
  if (!deps.convertAssetRefs) return document2;
  try {
    return await deps.convertAssetRefs(document2, ledger);
  } catch (error) {
    log8.warn(
      `Legacy asset conversion failed for document ${JSON.stringify(document2.stage.id)}; leaving legacy references for a later open`,
      error
    );
    return document2;
  }
}
async function saveConvertedDocument(store2, stageId, existing, converted, deps, expectedGeneration, ledger) {
  if (converted === existing) return existing;
  let reloaded;
  try {
    if (await readGeneration(deps.kv) !== expectedGeneration) {
      throw new DocumentStorageGenerationChangedError(stageId);
    }
    const latest = await store2.loadDocument(stageId);
    if (!latest) {
      return null;
    }
    reloaded = latest;
    if (!isEqual2(
      omitUndefinedObjectMembers(stripDocument(latest)),
      omitUndefinedObjectMembers(stripDocument(existing))
    )) {
      const reConverted = await convertLoadedDocument(latest, deps, ledger);
      await store2.saveDocument(reConverted);
      return reConverted;
    }
    await store2.saveDocument(converted);
    return converted;
  } catch (error) {
    if (error instanceof DocumentStorageGenerationChangedError) {
      throw error;
    }
    log8.warn(
      `Converted document ${JSON.stringify(stageId)} could not be saved back; rolling back its allocations and retrying on the next open`,
      error
    );
    return reloaded ?? existing;
  }
}
function resolveStore(deps) {
  return deps.store ? getDocumentStore({ store: deps.store }) : getDocumentStore();
}
function resolveKv4(deps) {
  if (deps.kv) return deps.kv;
  if (typeof localStorage === "undefined")
    throw new Error("Document migration KV requires localStorage (client-only)");
  return defaultKv7 ??= new BrowserKVStore9();
}
function resolveLocks(deps) {
  if (deps.lockManager === null) return void 0;
  return deps.lockManager ?? (typeof navigator !== "undefined" ? navigator.locks : void 0);
}
function documentLockName(stageId) {
  return `openmaic:document:${encodeURIComponent(stageId)}`;
}
async function withDocumentLock(stageId, work, deps = {}) {
  const locks2 = resolveLocks(deps);
  if (locks2) {
    return await locks2.request(
      documentLockName(stageId),
      { mode: "exclusive" },
      async () => work()
    );
  }
  throw new DocumentLockUnavailableError(
    `Web Locks are required to mutate document ${JSON.stringify(stageId)}`
  );
}
function defaultLegacyStore() {
  return {
    async read(stageId) {
      if (!db.isOpen()) await db.open();
      return db.transaction("r", [db.stages, db.scenes, db.stageOutlines], async () => {
        const [stage, scenes, outline] = await Promise.all([
          db.stages.get(stageId),
          db.scenes.where("stageId").equals(stageId).sortBy("order"),
          db.stageOutlines.get(stageId)
        ]);
        return stage ? { stage, scenes, outline } : null;
      });
    },
    async listStages() {
      if (!db.isOpen()) await db.open();
      return db.stages.toArray();
    }
  };
}
function getLegacyDocumentStore(deps = {}) {
  return deps.legacyStore ?? defaultLegacyStore();
}
function canonicalize2(snapshot) {
  const { stage } = canonicalizeLegacyStage(snapshot.stage);
  const scenes = snapshot.scenes.map(canonicalizeLegacyScene).sort((a, b) => a.order - b.order);
  const document2 = { stage, scenes };
  if (snapshot.outline) document2.outline = canonicalizeLegacyOutline(snapshot.outline);
  return document2;
}
function assertValidDestination(stageId, document2) {
  if (document2.dslVersion !== DSL_VERSION) {
    throw new Error(
      `Document ${JSON.stringify(stageId)} has unsupported DSL version ${JSON.stringify(document2.dslVersion)}`
    );
  }
  if (document2.stage.id !== stageId)
    throw new Error(`Document ${JSON.stringify(stageId)} has a mismatched stage id`);
  const stageValidation = validateAppStage(document2.stage);
  if (!stageValidation.valid)
    throw new Error(`Document ${JSON.stringify(stageId)} has an invalid stage`);
  const ids = /* @__PURE__ */ new Set();
  for (const scene of document2.scenes) {
    const validation = validateAppScene(scene);
    if (!validation.valid || scene.stageId !== stageId || ids.has(scene.id)) {
      throw new Error(
        `Document ${JSON.stringify(stageId)} has an invalid scene ${JSON.stringify(scene.id)}`
      );
    }
    ids.add(scene.id);
  }
}
function migrateDocumentForVerification(document2, migrateDsl = migrate2) {
  const { outline, ...core } = document2;
  const migrated = migrateDsl(core);
  return outline === void 0 ? migrated : { ...migrated, outline };
}
function stripDocument(document2) {
  return {
    stage: document2.stage,
    scenes: [...document2.scenes].sort((a, b) => a.order - b.order),
    outline: document2.outline
  };
}
function assertMigrationVerified(expected, actual, migrateDsl = migrate2) {
  assertValidDestination(expected.stage.id, actual);
  const migratedExpected = migrateDocumentForVerification(expected, migrateDsl);
  if (!isEqual2(
    omitUndefinedObjectMembers(stripDocument(actual)),
    omitUndefinedObjectMembers(stripDocument(migratedExpected))
  )) {
    throw new Error(
      `Legacy migration verification failed for document ${JSON.stringify(expected.stage.id)}`
    );
  }
}
function sourceHash(snapshot) {
  const text = JSON.stringify(snapshot);
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}
async function migrateCurrentScene(snapshot, kv) {
  if (!snapshot.stage.currentSceneId) return;
  const existing = await loadCurrentSceneValue(snapshot.stage.id, kv);
  const sourceTime = snapshot.stage.updatedAt;
  if (existing && Date.parse(existing.updatedAt) > sourceTime) return;
  const value = {
    sceneId: snapshot.stage.currentSceneId,
    updatedAt: new Date(sourceTime).toISOString()
  };
  await saveCurrentSceneValue(snapshot.stage.id, value, kv);
}
async function finishMigrationMetadata(snapshot, kv) {
  const markerKey = `${MARKER_PREFIX}${snapshot.stage.id}`;
  if (await kv.get(markerKey, "device")) return;
  await migrateCurrentScene(snapshot, kv);
  const marker = {
    sourceUpdatedAt: snapshot.stage.updatedAt,
    sourceHash: sourceHash(snapshot),
    migratedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  await kv.set(markerKey, marker, "device");
}
async function migrateLocked(stageId, deps) {
  const store2 = resolveStore(deps);
  const probe = await withRuntimeStorageSharedLock(async () => {
    let existing = null;
    let snapshot = null;
    try {
      existing = await store2.loadDocument(stageId);
      if (existing) assertValidDestination(stageId, existing);
      snapshot = await getLegacyDocumentStore(deps).read(stageId);
    } catch (error) {
      if (!(error instanceof Error && error.name === "DatabaseClosedError")) throw error;
      return null;
    }
    let metadataPending = false;
    if (existing && snapshot) {
      const kv = resolveKv4(deps);
      const markerKey = `${MARKER_PREFIX}${stageId}`;
      if (await kv.get(markerKey, "device")) {
        metadataPending = true;
      } else {
        try {
          assertMigrationVerified(canonicalize2(snapshot), existing, deps.migrateDsl);
          metadataPending = true;
        } catch (error) {
          log8.warn(
            `Legacy snapshot diverges from authoritative destination for stage ${stageId}; migration marker was not written`,
            error
          );
        }
      }
    }
    return {
      existing,
      snapshot,
      metadataPending,
      generation: await readGeneration(deps.kv)
    };
  });
  if (probe !== null && probe.existing === null && probe.snapshot === null) {
    return { document: null, readOnlyLegacy: false };
  }
  const passLedger = [];
  const converted = probe?.existing ? await convertLoadedDocument(probe.existing, deps, passLedger) : null;
  const expected = probe && !probe.existing && probe.snapshot ? await convertLoadedDocument(canonicalize2(probe.snapshot), deps, passLedger) : null;
  return withRuntimeStorageSharedLock(async () => {
    const cleanup = async (_finalDoc) => void 0;
    const currentGeneration = await readGeneration(deps.kv);
    if (probe === null || currentGeneration !== probe.generation) {
      const current = await store2.loadDocument(stageId);
      if (current) {
        assertValidDestination(stageId, current);
        const fresh = await convertLoadedDocument(current, deps, passLedger);
        const settled = await saveConvertedDocument(
          store2,
          stageId,
          current,
          fresh,
          deps,
          currentGeneration,
          passLedger
        );
        await cleanup(settled);
        return { document: settled, readOnlyLegacy: false };
      }
      const freshSnapshot = await getLegacyDocumentStore(deps).read(stageId);
      if (!freshSnapshot) {
        await cleanup(null);
        return { document: null, readOnlyLegacy: false };
      }
      const freshExpected = await convertLoadedDocument(
        canonicalize2(freshSnapshot),
        deps,
        passLedger
      );
      try {
        await store2.saveDocument(freshExpected);
      } catch (error) {
        await cleanup(null);
        throw error;
      }
      const actual2 = await store2.loadDocument(stageId);
      if (!actual2) {
        await cleanup(null);
        throw new Error(`Legacy migration lost document ${JSON.stringify(stageId)}`);
      }
      assertMigrationVerified(freshExpected, actual2, deps.migrateDsl);
      await finishMigrationMetadata(freshSnapshot, resolveKv4(deps));
      await cleanup(actual2);
      return { document: actual2, readOnlyLegacy: false };
    }
    if (probe.existing && converted) {
      if (probe.snapshot && probe.metadataPending) {
        await finishMigrationMetadata(probe.snapshot, resolveKv4(deps));
      }
      const settled = await saveConvertedDocument(
        store2,
        stageId,
        probe.existing,
        converted,
        deps,
        probe.generation,
        passLedger
      );
      await cleanup(settled);
      return { document: settled, readOnlyLegacy: false };
    }
    if (!probe.snapshot || !expected) {
      await cleanup(null);
      return { document: null, readOnlyLegacy: false };
    }
    try {
      await store2.saveDocument(expected);
    } catch (error) {
      await cleanup(null);
      throw error;
    }
    const actual = await store2.loadDocument(stageId);
    if (!actual) {
      await cleanup(null);
      throw new Error(`Legacy migration lost document ${JSON.stringify(stageId)}`);
    }
    assertMigrationVerified(expected, actual, deps.migrateDsl);
    await finishMigrationMetadata(probe.snapshot, resolveKv4(deps));
    await cleanup(actual);
    return { document: actual, readOnlyLegacy: false };
  });
}
function generationGuardedStore(stageId, expectedGeneration, deps) {
  const store2 = resolveStore(deps);
  const MUTATING_METHODS = /* @__PURE__ */ new Set([
    "saveDocument",
    "putStage",
    "putScene",
    "deleteScene",
    "deleteDocument"
  ]);
  return new Proxy(store2, {
    get(target, property) {
      if (typeof property === "string" && MUTATING_METHODS.has(property)) {
        const method = Reflect.get(target, property, target);
        const guarded = async (...args) => {
          if (await readGeneration(deps.kv) !== expectedGeneration) {
            throw new DocumentStorageGenerationChangedError(stageId);
          }
          return method.apply(target, args);
        };
        return deps.storageSharedLockHeld ? guarded : (...args) => withRuntimeStorageSharedLock(() => guarded(...args));
      }
      const value = Reflect.get(target, property, target);
      return typeof value === "function" ? value.bind(target) : value;
    }
  });
}
async function accessDocument(stageId, deps = {}) {
  try {
    return await withDocumentLock(stageId, async () => migrateLocked(stageId, deps), deps);
  } catch (error) {
    if (!(error instanceof DocumentLockUnavailableError)) throw error;
    const destination = await resolveStore(deps).loadDocument(stageId);
    if (destination) {
      assertValidDestination(stageId, destination);
      return { document: destination, readOnlyLegacy: false };
    }
    const snapshot = await getLegacyDocumentStore(deps).read(stageId);
    if (!snapshot) return { document: null, readOnlyLegacy: false };
    return {
      document: canonicalize2(snapshot),
      legacyCurrentSceneId: snapshot.stage.currentSceneId,
      readOnlyLegacy: true
    };
  }
}
function mutateDocument(stageId, work, deps = {}, options4 = {}) {
  const entryGeneration = readGeneration(deps.kv);
  const mutateLocked = async () => {
    const expectedGeneration = await entryGeneration;
    const document2 = options4.mode === "replace" ? null : (await migrateLocked(stageId, deps)).document;
    return work(document2, generationGuardedStore(stageId, expectedGeneration, deps));
  };
  return withDocumentLock(stageId, mutateLocked, deps).catch(async (error) => {
    if (!(error instanceof DocumentLockUnavailableError)) throw error;
    const expectedGeneration = await entryGeneration;
    if (options4.mode === "replace") {
      return work(null, generationGuardedStore(stageId, expectedGeneration, deps));
    }
    const store2 = resolveStore(deps);
    const destination = await store2.loadDocument(stageId);
    if (destination) {
      assertValidDestination(stageId, destination);
      return work(destination, generationGuardedStore(stageId, expectedGeneration, deps));
    }
    if (await getLegacyDocumentStore(deps).read(stageId)) throw error;
    return work(null, generationGuardedStore(stageId, expectedGeneration, deps));
  });
}
var DocumentLockUnavailableError, DocumentStorageGenerationChangedError, MARKER_PREFIX, defaultKv7, log8;
var init_migration = __esm({
  "OpenMAIC/lib/document-store/migration.ts"() {
    "use strict";
    init_logger();
    init_plain_json();
    init_chat_storage_lock();
    init_database();
    init_canonicalize();
    init_current_scene();
    init_storage_generation();
    init_store3();
    init_validators();
    DocumentLockUnavailableError = class extends Error {
    };
    DocumentStorageGenerationChangedError = class extends Error {
      constructor(stageId) {
        super(
          `Document ${JSON.stringify(stageId)} was not saved because storage was cleared during the mutation`
        );
        this.name = "DocumentStorageGenerationChangedError";
      }
    };
    MARKER_PREFIX = "document-migration:";
    log8 = createLogger("DocumentMigration");
  }
});

// OpenMAIC/lib/document-store/index.ts
var init_document_store = __esm({
  "OpenMAIC/lib/document-store/index.ts"() {
    "use strict";
    init_canonicalize();
    init_store3();
    init_migration();
    init_storage_generation();
    init_current_scene();
    init_validators();
  }
});

// OpenMAIC/lib/media/slide-media-slots.ts
import {
  slideMediaSlotDescriptors
} from "@openmaic/dsl";
function* slideMediaReferenceSlots(slide) {
  for (const descriptor of slideMediaSlotDescriptors(slide)) {
    if (descriptor.elementIndex === void 0) {
      const background = slide.background?.type === "image" ? slide.background.image : void 0;
      if (!background) continue;
      yield {
        kind: descriptor.kind,
        read: () => background.src,
        write: (value) => {
          background.src = value ?? "";
        }
      };
      continue;
    }
    const element = slide.elements[descriptor.elementIndex];
    yield elementSlot(
      descriptor.kind,
      element,
      descriptor.elementIndex,
      descriptor.property
    );
  }
}
function elementSlot(kind, element, elementIndex, key2) {
  const mediaProperties = element;
  return {
    kind,
    element,
    elementIndex,
    read: () => mediaProperties[key2],
    write: (value) => {
      if (value === void 0 && key2 !== "src") delete mediaProperties[key2];
      else mediaProperties[key2] = value ?? "";
    }
  };
}
var init_slide_media_slots = __esm({
  "OpenMAIC/lib/media/slide-media-slots.ts"() {
    "use strict";
  }
});

// OpenMAIC/lib/media/collect-stage-asset-refs.ts
import { enumerateAssetManifest } from "@openmaic/dsl";
function addValue(target, value) {
  if (!value) return false;
  target.add(value);
  return true;
}
function mediaRefFromRow(stageId, rowId) {
  const prefix = `${stageId}:`;
  return rowId.startsWith(prefix) ? rowId.slice(prefix.length) : rowId;
}
function collectStageAssetRefs(document2, {
  mediaRows,
  audioRows
}) {
  const imageSrc = /* @__PURE__ */ new Set();
  const slideAudioSrc = /* @__PURE__ */ new Set();
  const videoSrc = /* @__PURE__ */ new Set();
  const videoMediaRef = /* @__PURE__ */ new Set();
  const poster = /* @__PURE__ */ new Set();
  const backgroundImage = /* @__PURE__ */ new Set();
  const stageWhiteboard = /* @__PURE__ */ new Set();
  const sceneWhiteboard = /* @__PURE__ */ new Set();
  const speechAudioId = /* @__PURE__ */ new Set();
  const videoManifestKey = /* @__PURE__ */ new Set();
  const referenced = /* @__PURE__ */ new Set();
  const visitSlide = (slide, scope) => {
    for (const slot of slideMediaReferenceSlots(slide)) {
      const ref = slot.read();
      if (!ref) continue;
      const whiteboardCategory = scope === "stage-whiteboard" ? stageWhiteboard : scope === "scene-whiteboard" ? sceneWhiteboard : void 0;
      if (slot.kind === "background-image") addValue(backgroundImage, ref);
      else if (slot.kind === "image-src") addValue(imageSrc, ref);
      else if (slot.kind === "audio-src") addValue(slideAudioSrc, ref);
      else if (slot.kind === "video-src") addValue(videoSrc, ref);
      else if (slot.kind === "video-media-ref") addValue(videoMediaRef, ref);
      else addValue(poster, ref);
      referenced.add(ref);
      whiteboardCategory?.add(ref);
    }
  };
  if (document2) {
    for (let index = 0; index < (document2.stage.whiteboard ?? []).length; index += 1) {
      const slide = document2.stage.whiteboard[index];
      visitSlide(slide, "stage-whiteboard");
    }
    for (const scene of document2.scenes) {
      if (scene.content.type === "slide") {
        visitSlide(scene.content.canvas, "scene");
      }
      for (let index = 0; index < (scene.whiteboards ?? []).length; index += 1) {
        const slide = scene.whiteboards[index];
        visitSlide(slide, "scene-whiteboard");
      }
      for (let index = 0; index < (scene.actions ?? []).length; index += 1) {
        const action = scene.actions[index];
        if (action.type !== "speech" || !action.audioId) continue;
        speechAudioId.add(action.audioId);
        referenced.add(action.audioId);
      }
    }
    for (const ref of Object.keys(document2.stage.videoManifest ?? {})) {
      videoManifestKey.add(ref);
    }
  }
  const stageId = document2?.stage.id;
  const mediaRow = new Set(
    mediaRows.filter((row) => !stageId || row.stageId === stageId).map((row) => mediaRefFromRow(row.stageId, row.id))
  );
  const audioRow = new Set(
    audioRows.filter((row) => stageId ? row.stageId === stageId : row.stageId !== void 0).map((row) => row.id)
  );
  const documentRefs = /* @__PURE__ */ new Set([...referenced, ...videoManifestKey]);
  const mediaOrphans = new Set([...mediaRow].filter((ref) => !documentRefs.has(ref)));
  const audioOrphans = new Set([...audioRow].filter((ref) => !documentRefs.has(ref)));
  const all = /* @__PURE__ */ new Set([...documentRefs, ...mediaRow, ...audioRow]);
  const poolOwned = /* @__PURE__ */ new Set([...mediaRow, ...audioRow]);
  const referenceCounts = document2 ? new Map(enumerateAssetManifest(document2).referenceCounts) : /* @__PURE__ */ new Map();
  return {
    imageSrc,
    slideAudioSrc,
    videoSrc,
    videoMediaRef,
    poster,
    backgroundImage,
    stageWhiteboard,
    sceneWhiteboard,
    speechAudioId,
    videoManifestKey,
    mediaRow,
    audioRow,
    mediaOrphans,
    audioOrphans,
    referenced,
    document: documentRefs,
    all,
    poolOwned,
    referenceCounts
  };
}
function collectPersistedDocumentAssetRefs(documents) {
  const referenceCounts = /* @__PURE__ */ new Map();
  const byDocument = /* @__PURE__ */ new Map();
  for (const document2 of documents) {
    const refs = collectStageAssetRefs(document2, { mediaRows: [], audioRows: [] });
    byDocument.set(document2.stage.id, refs);
    for (const [ref, count] of refs.referenceCounts) {
      referenceCounts.set(ref, (referenceCounts.get(ref) ?? 0) + count);
    }
  }
  return { referenceCounts, byDocument };
}
async function loadSurvivingDocumentAssetRefs(excludedDocumentId) {
  try {
    const store2 = getDocumentStore();
    const summaries = await store2.listDocuments();
    const documents = await Promise.all(
      summaries.filter(({ id }) => id !== excludedDocumentId).map(async ({ id }) => {
        const document2 = await store2.loadDocument(id);
        if (!document2) throw new Error(`Listed document ${id} could not be loaded`);
        return document2;
      })
    );
    const liveRefs = /* @__PURE__ */ new Set();
    for (const refs of collectPersistedDocumentAssetRefs(documents).byDocument.values()) {
      for (const ref of refs.document) liveRefs.add(ref);
    }
    return liveRefs;
  } catch (error) {
    log9.warn("Could not enumerate persisted asset liveness:", error);
    return null;
  }
}
var log9;
var init_collect_stage_asset_refs = __esm({
  "OpenMAIC/lib/media/collect-stage-asset-refs.ts"() {
    "use strict";
    init_document_store();
    init_logger();
    init_stage2();
    init_asset_pool_config();
    init_slide_media_slots();
    init_stage_realm_presence();
    log9 = createLogger("PersistedAssetRefs");
  }
});

// OpenMAIC/lib/utils/deleted-stages.ts
function markStageDeleted(stageId) {
  const state = stageDeletionStates.get(stageId);
  stageDeletionStates.set(stageId, {
    epoch: (state?.epoch ?? 0) + 1,
    deleted: true,
    // Not a settlement event: an import-rollback re-mark records a document
    // whose absence is already a settled fact, so it must not touch the count.
    unsettledCascades: state?.unsettledCascades ?? 0
  });
}
function beginStageDeletionCascade(stageId) {
  const state = stageDeletionStates.get(stageId);
  if (!state) return;
  state.unsettledCascades += 1;
  if (!cascadeSettlements.has(stageId)) {
    let resolve;
    const promise = new Promise((res) => {
      resolve = res;
    });
    cascadeSettlements.set(stageId, { promise, resolve });
  }
}
function settleStageDeletionCascade(stageId) {
  const state = stageDeletionStates.get(stageId);
  if (!state || state.unsettledCascades === 0) return;
  state.unsettledCascades -= 1;
  if (state.unsettledCascades === 0) {
    const settlement = cascadeSettlements.get(stageId);
    cascadeSettlements.delete(stageId);
    settlement?.resolve();
  }
}
function isStageDeletionInFlight(stageId) {
  return (stageDeletionStates.get(stageId)?.unsettledCascades ?? 0) > 0;
}
function stageDeletionSettled(stageId) {
  return cascadeSettlements.get(stageId)?.promise ?? Promise.resolve();
}
function unmarkStageDeleted(stageId) {
  const state = stageDeletionStates.get(stageId);
  if (state) state.deleted = false;
}
function isStageDeleted(stageId) {
  return stageDeletionStates.get(stageId)?.deleted ?? false;
}
function stageDeletionEpoch(stageId) {
  return stageDeletionStates.get(stageId)?.epoch ?? 0;
}
function isStageWriteStale(stageId, capturedEpoch) {
  const state = stageDeletionStates.get(stageId);
  if (!state) return capturedEpoch !== 0;
  return state.deleted || state.epoch !== capturedEpoch;
}
var stageDeletionStates, cascadeSettlements;
var init_deleted_stages = __esm({
  "OpenMAIC/lib/utils/deleted-stages.ts"() {
    "use strict";
    stageDeletionStates = /* @__PURE__ */ new Map();
    cascadeSettlements = /* @__PURE__ */ new Map();
  }
});

// OpenMAIC/lib/utils/folder-name-validation.ts
function displayNameWidth(str) {
  let width = 0;
  for (const ch of str) {
    width += FULL_WIDTH_CHARS.test(ch) ? 2 : 1;
  }
  return width;
}
function validateFolderName(name) {
  const trimmed = name.trim();
  if (!trimmed) return { ok: false, kind: "empty", width: 0 };
  const width = displayNameWidth(trimmed);
  if (width > FOLDER_NAME_MAX_WIDTH) {
    return { ok: false, kind: "tooLong", width };
  }
  return { ok: true };
}
var FOLDER_NAME_MAX_WIDTH, FOLDER_COUNT_LIMIT, FolderNameError, FULL_WIDTH_CHARS;
var init_folder_name_validation = __esm({
  "OpenMAIC/lib/utils/folder-name-validation.ts"() {
    "use strict";
    FOLDER_NAME_MAX_WIDTH = 40;
    FOLDER_COUNT_LIMIT = 50;
    FolderNameError = class extends Error {
      constructor(message, kind) {
        super(message);
        this.kind = kind;
        this.name = "FolderNameError";
      }
    };
    FULL_WIDTH_CHARS = /[\u1100-\u115F\u2E80-\uA4CF\uAC00-\uD7A3\uF900-\uFAFF\uFE10-\uFE19\uFE30-\uFE6F\uFF00-\uFF60\uFFE0-\uFFE6\u3000-\u303F\u3040-\u30FF]/;
  }
});

// OpenMAIC/lib/utils/chat-storage-core.ts
import codemateLodash2 from "lodash";
const { isEqual: isEqual3 } = codemateLodash2;
function isLegacyRecord(record) {
  if (typeof record !== "object" || record === null) return false;
  const candidate = record;
  return typeof candidate.id === "string" && (candidate.type === "qa" || candidate.type === "discussion" || candidate.type === "lecture") && typeof candidate.title === "string" && (candidate.status === "idle" || candidate.status === "active" || candidate.status === "soft-closing" || candidate.status === "interrupted" || candidate.status === "completed" || candidate.status === "error") && Array.isArray(candidate.messages) && candidate.messages.every(
    (message) => typeof message === "object" && message !== null && typeof message.id === "string" && Array.isArray(message.parts) && message.parts.every(
      (part) => typeof part === "object" && part !== null
    )
  ) && typeof candidate.config === "object" && candidate.config !== null && Array.isArray(candidate.toolCalls) && typeof candidate.createdAt === "number" && typeof candidate.updatedAt === "number";
}
function legacyTimestamps(record) {
  const validRange = (timestamp) => Number.isFinite(timestamp) && timestamp >= 0 && timestamp <= MAX_FOUR_DIGIT_ISO_TIMESTAMP;
  const createdAt = validRange(record.createdAt) ? record.createdAt : validRange(record.updatedAt) ? record.updatedAt : LEGACY_TIMESTAMP_REPAIR_ANCHOR;
  const updatedAt = validRange(record.updatedAt) ? record.updatedAt : validRange(record.createdAt) ? record.createdAt : LEGACY_TIMESTAMP_REPAIR_ANCHOR;
  return { createdAt, updatedAt: Math.max(createdAt, updatedAt) };
}
function fromLegacyRecord(record) {
  if (!isLegacyRecord(record)) throw new TypeError("invalid legacy chat row shape");
  const { createdAt, updatedAt } = legacyTimestamps(record);
  return {
    id: record.id,
    type: record.type,
    title: record.title,
    status: record.status,
    messages: record.messages,
    config: record.config,
    toolCalls: record.toolCalls,
    pendingToolCalls: Array.isArray(record.pendingToolCalls) ? record.pendingToolCalls : [],
    createdAt,
    updatedAt,
    ...typeof record.sceneId === "string" ? { sceneId: record.sceneId } : {},
    ...Number.isInteger(record.lastActionIndex) ? { lastActionIndex: record.lastActionIndex } : {}
  };
}
function fromLegacyRecords(records) {
  if (!Array.isArray(records)) {
    return {
      sessions: [],
      skippedRows: [{ index: -1, reason: "expected an array payload" }]
    };
  }
  const sessions = [];
  const skippedRows = [];
  records.forEach((record, index) => {
    try {
      sessions.push(normalizeSession(fromLegacyRecord(record)));
    } catch (error) {
      const id = typeof record === "object" && record !== null && typeof record.id === "string" ? record.id : void 0;
      skippedRows.push({
        index,
        ...id === void 0 ? {} : { id },
        reason: error instanceof Error ? error.message : String(error)
      });
    }
  });
  return { sessions, skippedRows };
}
function normalizeSession(session) {
  return {
    ...session,
    status: session.status === "active" || session.status === "soft-closing" ? "interrupted" : session.status,
    messages: session.messages.slice(-MAX_MESSAGES_PER_SESSION),
    pendingToolCalls: []
  };
}
function runtimeSessionId(stageId, learnerKey, chatSessionId) {
  return `chat:${encodeURIComponent(stageId)}:${encodeURIComponent(learnerKey)}:${encodeURIComponent(chatSessionId)}`;
}
function generationRuntimeSessionId(baseRuntimeId, generation, writerToken) {
  return `${baseRuntimeId}${RUNTIME_GENERATION_SEPARATOR}${generation}${writerToken ? `:${writerToken}` : ""}`;
}
function chatRuntimeIdentity(runtimeId, stageId, chatSessionId) {
  const markerIndex = runtimeId.lastIndexOf(RUNTIME_GENERATION_SEPARATOR);
  let baseRuntimeId = runtimeId;
  let generation = 0;
  if (markerIndex >= 0) {
    baseRuntimeId = runtimeId.slice(0, markerIndex);
    const rawIdentity = runtimeId.slice(markerIndex + RUNTIME_GENERATION_SEPARATOR.length);
    const [rawGeneration, writerToken, ...extra] = rawIdentity.split(":");
    if (!/^[1-9]\d*$/.test(rawGeneration)) return void 0;
    if (extra.length > 0 || writerToken !== void 0 && !/^[\w-]+$/.test(writerToken)) {
      return void 0;
    }
    generation = Number(rawGeneration);
    if (!Number.isSafeInteger(generation)) return void 0;
  }
  if (!baseRuntimeId.startsWith(`chat:${encodeURIComponent(stageId)}:`) || !baseRuntimeId.endsWith(`:${encodeURIComponent(chatSessionId)}`)) {
    return void 0;
  }
  return { baseRuntimeId, generation };
}
function iso(epochMs) {
  return new Date(epochMs).toISOString();
}
function messageContent(message) {
  return message.parts.filter(
    (part) => part.type === "text"
  ).map((part) => part.text).join("");
}
function messagePayload(message, sessionUpdatedAt) {
  return {
    kind: "chat_message",
    payloadVersion: CHAT_PAYLOAD_VERSION,
    role: message.role,
    content: messageContent(message),
    message,
    sessionUpdatedAt
  };
}
function statePayload(session) {
  return {
    kind: "chat_session_state",
    payloadVersion: CHAT_PAYLOAD_VERSION,
    role: "system",
    content: session.title,
    chatSessionId: session.id,
    type: session.type,
    title: session.title,
    status: session.status,
    config: session.config,
    toolCalls: session.toolCalls,
    messageIds: session.messages.map((message) => message.id),
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    ...typeof session.sceneId === "string" ? { sceneId: session.sceneId } : {},
    ...Number.isInteger(session.lastActionIndex) ? { lastActionIndex: session.lastActionIndex } : {}
  };
}
function isMessagePayload(payload) {
  const candidate = payload;
  return candidate?.kind === "chat_message" && candidate.payloadVersion === CHAT_PAYLOAD_VERSION && typeof candidate.message?.id === "string" && (candidate.message.role === "user" || candidate.message.role === "assistant" || candidate.message.role === "system") && Array.isArray(candidate.message.parts) && typeof candidate.sessionUpdatedAt === "number" && Number.isFinite(candidate.sessionUpdatedAt);
}
function isStatePayload(payload) {
  const candidate = payload;
  return candidate?.kind === "chat_session_state" && candidate.payloadVersion === CHAT_PAYLOAD_VERSION && typeof candidate.chatSessionId === "string" && (candidate.type === "qa" || candidate.type === "discussion" || candidate.type === "lecture") && typeof candidate.title === "string" && (candidate.status === "idle" || candidate.status === "active" || candidate.status === "soft-closing" || candidate.status === "interrupted" || candidate.status === "completed" || candidate.status === "error") && typeof candidate.config === "object" && candidate.config !== null && Array.isArray(candidate.toolCalls) && Array.isArray(candidate.messageIds) && candidate.messageIds.every((id) => typeof id === "string") && typeof candidate.createdAt === "number" && Number.isFinite(candidate.createdAt) && typeof candidate.updatedAt === "number" && Number.isFinite(candidate.updatedAt) && (candidate.sceneId === void 0 || typeof candidate.sceneId === "string") && (candidate.lastActionIndex === void 0 || Number.isInteger(candidate.lastActionIndex));
}
function foldRecords(records) {
  const messages = /* @__PURE__ */ new Map();
  const messageSeqs = /* @__PURE__ */ new Map();
  let state;
  let stateSeq = -1;
  for (const record of records) {
    if (isMessagePayload(record.payload)) {
      const id = record.payload.message.id;
      const current = messages.get(id);
      if (!current || record.payload.sessionUpdatedAt > current.sessionUpdatedAt || record.payload.sessionUpdatedAt === current.sessionUpdatedAt && record.seq > (messageSeqs.get(id) ?? -1)) {
        messages.set(id, record.payload);
        messageSeqs.set(id, record.seq);
      }
    }
    if (isStatePayload(record.payload) && (!state || record.payload.updatedAt > state.updatedAt || record.payload.updatedAt === state.updatedAt && record.seq > stateSeq)) {
      state = record.payload;
      stateSeq = record.seq;
    }
  }
  if (!state) return { messages };
  return {
    messages,
    state,
    session: {
      id: state.chatSessionId,
      type: state.type,
      title: state.title,
      status: state.status,
      messages: state.messageIds.flatMap((id) => {
        const payload = messages.get(id);
        return payload ? [payload.message] : [];
      }),
      config: state.config,
      toolCalls: state.toolCalls,
      pendingToolCalls: [],
      createdAt: state.createdAt,
      updatedAt: state.updatedAt,
      sceneId: state.sceneId,
      lastActionIndex: state.lastActionIndex
    }
  };
}
function changesForSession(normalized, folded) {
  const nextState = statePayload(normalized);
  return {
    nextState,
    changedMessages: normalized.messages.filter((message) => {
      const current = folded.messages.get(message.id);
      return !current || !isEqual3(current.message, message);
    }),
    stateChanged: !folded.state || !isEqual3(folded.state, nextState)
  };
}
function chatRuntimeCandidates(views, stageId, chatSessionId) {
  return views.flatMap((view) => {
    const identity = chatRuntimeIdentity(view.runtimeSession.id, stageId, chatSessionId);
    return identity ? [{ ...view, ...identity }] : [];
  });
}
function newestRuntimeCandidate(candidates) {
  return [...candidates].sort((left, right) => {
    const leftUpdatedAt = left.folded.state?.updatedAt ?? Number.NEGATIVE_INFINITY;
    const rightUpdatedAt = right.folded.state?.updatedAt ?? Number.NEGATIVE_INFINITY;
    if (leftUpdatedAt !== rightUpdatedAt) return rightUpdatedAt - leftUpdatedAt;
    if (left.generation !== right.generation) return right.generation - left.generation;
    return right.runtimeSession.id.localeCompare(left.runtimeSession.id);
  })[0];
}
function highestGeneration(candidates, baseRuntimeId) {
  return candidates.filter((candidate) => candidate.baseRuntimeId === baseRuntimeId).sort((left, right) => {
    if (left.generation !== right.generation) return right.generation - left.generation;
    const leftUpdatedAt = left.folded.state?.updatedAt ?? Number.NEGATIVE_INFINITY;
    const rightUpdatedAt = right.folded.state?.updatedAt ?? Number.NEGATIVE_INFINITY;
    if (leftUpdatedAt !== rightUpdatedAt) return rightUpdatedAt - leftUpdatedAt;
    return right.runtimeSession.id.localeCompare(left.runtimeSession.id);
  })[0];
}
function buildChatRecordInit(runtimeId, payload, session, suffix) {
  const actionIndex = session.lastActionIndex;
  return {
    id: `${runtimeId}:${suffix}:${session.updatedAt}`,
    sessionId: runtimeId,
    createdAt: iso(session.updatedAt),
    ...typeof session.sceneId === "string" ? { sceneId: session.sceneId } : {},
    ...Number.isInteger(actionIndex) && actionIndex !== void 0 && actionIndex >= 0 ? { actionIndex } : {},
    payload
  };
}
function planChatSync(desired, views) {
  const { session, stageId, learnerKey, isolatedWrites } = desired;
  const candidates = chatRuntimeCandidates(views, stageId, session.id);
  const source = newestRuntimeCandidate(candidates);
  const baseRuntimeId = source?.baseRuntimeId ?? runtimeSessionId(stageId, learnerKey, session.id);
  const destination = highestGeneration(candidates, baseRuntimeId);
  const sessionInit = (id) => ({
    id,
    kind: "chat",
    stageId,
    learnerKey,
    status: "active",
    createdAt: iso(session.createdAt),
    updatedAt: iso(session.updatedAt)
  });
  const appendPlans = (messages, state) => [
    ...messages.map((message) => ({
      payload: messagePayload(message, session.updatedAt),
      suffix: `message:${encodeURIComponent(message.id)}`
    })),
    ...state ? [{ payload: state, suffix: "state" }] : []
  ];
  if (isolatedWrites) {
    const folded = destination?.folded ?? { messages: /* @__PURE__ */ new Map() };
    const changes2 = changesForSession(session, folded);
    const appendCount2 = changes2.changedMessages.length + (changes2.stateChanged ? 1 : 0);
    if (destination && appendCount2 === 0) {
      return {
        kind: "reuse-isolated",
        destination,
        completeDestination: session.status === "completed" && destination.runtimeSession.status !== "completed",
        retired: candidates.filter(
          (candidate) => candidate.runtimeSession.id !== destination.runtimeSession.id
        )
      };
    }
    const generation = Math.max(0, ...candidates.map((candidate) => candidate.generation)) + 1;
    return {
      kind: "replace-isolated",
      baseRuntimeId,
      generation,
      candidates,
      appends: appendPlans(session.messages, statePayload(session)),
      ...session.status === "completed" ? { finalStatus: "completed" } : {}
    };
  }
  if (!destination) {
    return {
      kind: "create-session",
      baseRuntimeId,
      generation: 0,
      init: sessionInit(baseRuntimeId)
    };
  }
  const changes = changesForSession(session, destination.folded);
  const appendCount = changes.changedMessages.length + (changes.stateChanged ? 1 : 0);
  if (destination.folded.state && changes.changedMessages.length > 0 && destination.runtimeSession.status !== "completed") {
    return { kind: "complete-and-refresh", destination };
  }
  const needsRollover = destination.records.length > MAX_RUNTIME_RECORDS_PER_CHAT_SESSION || appendCount > 0 && destination.records.length + appendCount > MAX_RUNTIME_RECORDS_PER_CHAT_SESSION;
  if (destination.runtimeSession.status === "completed" && (appendCount > 0 || destination.records.length > MAX_RUNTIME_RECORDS_PER_CHAT_SESSION)) {
    return {
      kind: "start-generation",
      init: sessionInit(generationRuntimeSessionId(baseRuntimeId, destination.generation + 1))
    };
  }
  if (needsRollover) return { kind: "complete-and-refresh", destination };
  const preStatus = appendCount > 0 && destination.runtimeSession.status !== "active" ? "active" : void 0;
  const effectiveStatus = preStatus ?? destination.runtimeSession.status;
  const desiredStatus = session.status === "completed" ? "completed" : "active";
  const finalStatus = effectiveStatus !== desiredStatus && !(effectiveStatus === "completed" && appendCount === 0) ? desiredStatus : void 0;
  return {
    kind: "write",
    destination,
    appends: appendPlans(
      changes.changedMessages,
      changes.stateChanged ? changes.nextState : void 0
    ),
    ...preStatus ? { preStatus } : {},
    ...finalStatus ? { finalStatus } : {}
  };
}
var MAX_MESSAGES_PER_SESSION, MAX_RUNTIME_RECORDS_PER_CHAT_SESSION, CHAT_PAYLOAD_VERSION, RUNTIME_GENERATION_SEPARATOR, MAX_FOUR_DIGIT_ISO_TIMESTAMP, LEGACY_TIMESTAMP_REPAIR_ANCHOR;
var init_chat_storage_core = __esm({
  "OpenMAIC/lib/utils/chat-storage-core.ts"() {
    "use strict";
    MAX_MESSAGES_PER_SESSION = 200;
    MAX_RUNTIME_RECORDS_PER_CHAT_SESSION = 256;
    CHAT_PAYLOAD_VERSION = 1;
    RUNTIME_GENERATION_SEPARATOR = ":generation:";
    MAX_FOUR_DIGIT_ISO_TIMESTAMP = 253402300799999;
    LEGACY_TIMESTAMP_REPAIR_ANCHOR = Date.UTC(2026, 7, 1);
  }
});

// OpenMAIC/lib/utils/chat-storage.ts
import { HttpRuntimeStoreError } from "@openmaic/storage/runtime/http";
import codemateLodash3 from "lodash";
const { isEqual: isEqual4 } = codemateLodash3;
import { nanoid as nanoid2 } from "nanoid";
function observedIds(store2, key2) {
  return observedChatSessionIds.get(store2)?.get(key2) ?? /* @__PURE__ */ new Set();
}
function rememberObservedIds(store2, key2, ids) {
  let partitions = observedChatSessionIds.get(store2);
  if (!partitions) {
    partitions = /* @__PURE__ */ new Map();
    observedChatSessionIds.set(store2, partitions);
  }
  partitions.set(key2, new Set(ids));
}
function observedSessions(store2, key2) {
  return observedChatSessions.get(store2)?.get(key2);
}
function rememberObservedSessions(store2, key2, sessions) {
  let partitions = observedChatSessions.get(store2);
  if (!partitions) {
    partitions = /* @__PURE__ */ new Map();
    observedChatSessions.set(store2, partitions);
  }
  partitions.set(
    key2,
    new Map(sessions.map((session) => [session.id, structuredClone(normalizeSession(session))]))
  );
}
function skippedLegacyRows(store2, key2) {
  return skippedLegacyRowsByPartition.get(store2)?.get(key2);
}
function rememberSkippedLegacyRows(store2, key2, rows) {
  const partitions = skippedLegacyRowsByPartition.get(store2);
  if (rows.length === 0) {
    partitions?.delete(key2);
    return;
  }
  if (partitions) {
    partitions.set(key2, rows);
    return;
  }
  skippedLegacyRowsByPartition.set(store2, /* @__PURE__ */ new Map([[key2, rows]]));
}
function matchesObservedSessions(store2, key2, sessions) {
  const observed = observedSessions(store2, key2);
  if (!observed) return sessions.length === 0;
  if (observed.size !== sessions.length) return false;
  return sessions.every((session) => isEqual4(observed.get(session.id), normalizeSession(session)));
}
function sessionMap(sessions) {
  return new Map(
    sessions.map((session) => [session.id, structuredClone(normalizeSession(session))])
  );
}
function matchesSnapshot(snapshot, sessions) {
  const baseline = sessionMap(snapshot.sessions);
  if (baseline.size !== sessions.length) return false;
  return sessions.every((session) => isEqual4(baseline.get(session.id), normalizeSession(session)));
}
function reportSnapshot(options4, sessions, restoreMarker) {
  options4.onSnapshot?.({
    sessions: structuredClone([...sessions]),
    restoreMarker
  });
}
function withPartitionLocks(crossRealmKey, key2, requiresCrossRealmLock, work) {
  if (typeof navigator !== "undefined" && navigator.locks) {
    const locks2 = navigator.locks;
    return locks2.request(
      chatStoragePartitionLockName(crossRealmKey),
      () => locks2.request(
        chatStoragePartitionLockName(key2),
        () => work(false)
      )
    );
  }
  if (requiresCrossRealmLock) {
    throw new ChatStorageLockUnavailableError(
      "Chat storage requires the Web Locks API in this browser"
    );
  }
  return work(true);
}
function enqueue(store2, key2, crossRealmKey, requiresCrossRealmLock, work, globalLockHeld = false) {
  const enqueueInGlobalEpoch = () => {
    let queues = storeQueues.get(store2);
    if (!queues) {
      queues = /* @__PURE__ */ new Map();
      storeQueues.set(store2, queues);
    }
    const previous = queues.get(key2) ?? Promise.resolve();
    const run = () => withPartitionLocks(crossRealmKey, key2, requiresCrossRealmLock, work);
    const current = previous.catch(() => void 0).then(run);
    const settled = current.then(
      () => void 0,
      () => void 0
    );
    queues.set(key2, settled);
    void settled.finally(() => {
      if (queues?.get(key2) === settled) queues.delete(key2);
    });
    return current;
  };
  return globalLockHeld ? enqueueInGlobalEpoch() : withChatStorageSharedLock(enqueueInGlobalEpoch);
}
async function context(options4) {
  const legacyStore = options4.legacyStore ?? dexieLegacyStore;
  return {
    store: options4.store ?? getRuntimeStore(),
    learnerKey: options4.learnerKey ?? await getLearnerKey(options4.kv),
    legacyStore,
    sleep: options4.sleep ?? defaultChatSyncSleep,
    requiresCrossRealmLock: legacyStore === dexieLegacyStore
  };
}
function restoreMarkerPrefix(stageId) {
  return `${RESTORE_MARKER_PREFIX}${encodeURIComponent(stageId)}:`;
}
function deletionMarkerPrefix(stageId) {
  return `${DELETION_MARKER_PREFIX}${encodeURIComponent(stageId)}:`;
}
function deletionMarkerId(stageId, learnerKey, chatSessionId) {
  return `${deletionMarkerPrefix(stageId)}${encodeURIComponent(chatSessionId)}:${encodeURIComponent(learnerKey)}`;
}
function deletionMarkerChatId(view, stageId) {
  if (view.runtimeSession.kind !== CHAT_DELETION_KIND) return void 0;
  const prefix = deletionMarkerPrefix(stageId);
  if (!view.runtimeSession.id.startsWith(prefix)) return void 0;
  const encodedChatId = view.runtimeSession.id.slice(prefix.length).split(":", 1)[0];
  if (!encodedChatId) return void 0;
  try {
    return decodeURIComponent(encodedChatId);
  } catch {
    return void 0;
  }
}
function deletionMarkersByChatId(views, stageId) {
  const markers = /* @__PURE__ */ new Map();
  for (const view of views) {
    const chatSessionId = deletionMarkerChatId(view, stageId);
    if (!chatSessionId) continue;
    const current = markers.get(chatSessionId) ?? [];
    current.push(view);
    markers.set(chatSessionId, current);
  }
  return markers;
}
function currentRestoreMarker(views, stageId) {
  const prefix = restoreMarkerPrefix(stageId);
  return views.filter(
    (view) => view.runtimeSession.status === "completed" && view.runtimeSession.id.startsWith(prefix)
  ).sort(
    (left, right) => Date.parse(left.runtimeSession.createdAt) - Date.parse(right.runtimeSession.createdAt) || left.runtimeSession.id.localeCompare(right.runtimeSession.id)
  ).at(-1)?.runtimeSession.id;
}
function restoreMarkerTargets(view) {
  if (!view) return [];
  for (const record of view.records) {
    const payload = record.payload;
    if (payload.kind !== "chat_restore_marker" || !Array.isArray(payload.runtimeSessionIds)) {
      continue;
    }
    return payload.runtimeSessionIds.filter(
      (runtimeSessionId2) => typeof runtimeSessionId2 === "string"
    );
  }
  return [];
}
async function createRestoreMarker(store2, stageId, learnerKey, runtimeSessionIds, afterCreatedAt) {
  const now = new Date(
    Math.max(Date.now(), afterCreatedAt ? Date.parse(afterCreatedAt) + 1 : 0)
  ).toISOString();
  const marker = await store2.createSession({
    id: `${restoreMarkerPrefix(stageId)}${encodeURIComponent(learnerKey)}:${nanoid2()}`,
    kind: "chat",
    stageId,
    learnerKey,
    status: "active",
    createdAt: now,
    updatedAt: now
  });
  try {
    await store2.appendRecord({
      id: `${marker.id}:targets`,
      sessionId: marker.id,
      createdAt: now,
      payload: {
        role: "system",
        content: "",
        kind: "chat_restore_marker",
        runtimeSessionIds: [...runtimeSessionIds]
      }
    });
    await store2.setSessionStatus(marker.id, "completed", now);
    return { ...marker, status: "completed" };
  } catch (error) {
    await store2.deleteSession(marker.id).catch(() => {
    });
    throw error;
  }
}
async function finalizeRestoreMarker(store2, marker) {
  const finalized = await createRestoreMarker(
    store2,
    marker.stageId,
    marker.learnerKey,
    [],
    marker.createdAt
  );
  try {
    await store2.deleteSession(marker.id);
  } catch (error) {
    const persisted = await store2.getSession(finalized.id).catch(() => void 0);
    if (!persisted) throw error;
  }
}
function matchesChatPartition(session, id, stageId, learnerKey) {
  return session.id === id && session.kind === "chat" && session.stageId === stageId && session.learnerKey === learnerKey;
}
async function createOrGetRuntimeSession(store2, init) {
  try {
    return await store2.createSession(init);
  } catch (error) {
    let raced;
    try {
      raced = await store2.getSession(init.id);
    } catch {
      throw error;
    }
    if (!raced || !matchesChatPartition(raced, init.id, init.stageId, init.learnerKey)) {
      throw error;
    }
    return raced;
  }
}
async function ensureDeletionMarker(store2, stageId, learnerKey, chatSessionId, existingMarkers) {
  if (existingMarkers.some((view) => deletionMarkerChatId(view, stageId) === chatSessionId)) {
    return;
  }
  const id = deletionMarkerId(stageId, learnerKey, chatSessionId);
  const now = (/* @__PURE__ */ new Date()).toISOString();
  try {
    await store2.createSession({
      id,
      kind: CHAT_DELETION_KIND,
      stageId,
      learnerKey,
      status: "completed",
      createdAt: now,
      updatedAt: now
    });
  } catch (error) {
    const raced = await store2.getSession(id).catch(() => void 0);
    if (!raced || raced.kind !== CHAT_DELETION_KIND || raced.stageId !== stageId || raced.learnerKey !== learnerKey) {
      throw error;
    }
  }
}
async function runtimeViews(store2, stageId, learnerKey) {
  const sessions = (await store2.listSessions(stageId, learnerKey)).filter(
    (session) => session.kind === "chat" || session.kind === CHAT_DELETION_KIND
  );
  return Promise.all(
    sessions.map(async (runtimeSession) => {
      const records = await store2.listRecords(runtimeSession.id);
      return { runtimeSession, records, folded: foldRecords(records) };
    })
  );
}
async function appendPayload(store2, runtimeId, payload, session, suffix) {
  await store2.appendRecord(buildChatRecordInit(runtimeId, payload, session, suffix));
}
function isInactiveSessionAppendError(error) {
  if (error.code !== "VALIDATION_FAILED") {
    return false;
  }
  return error.message.includes("cannot append to session ") && error.message.includes("records may only be appended to an active session") || error.message.includes(" is no longer active; ") && error.message.includes("its current status is");
}
function isDeterministicChatSyncFailure(error) {
  return error instanceof HttpRuntimeStoreError && !isInactiveSessionAppendError(error) && (error.status === 400 || error.status === 401 || error.status === 403 || error.status === 413 || error.code === "VALIDATION_FAILED" || error.status === 409 && error.code === "FUTURE_VERSION");
}
function normalizeLegacyConversion(records) {
  return fromLegacyRecords(records);
}
function legacyRowLabels(rows) {
  return rows.map((row) => row.id === void 0 ? `index ${row.index}` : JSON.stringify(row.id)).join(", ");
}
function warnSkippedLegacyRows(stageId, rows) {
  if (rows.length === 0) return;
  console.warn(
    `Skipped malformed legacy chat rows for stage ${JSON.stringify(stageId)}; retaining the legacy source: ${legacyRowLabels(rows)}`
  );
}
function chatSyncValidationError(sessionId, error) {
  return new Error(
    `Chat sync rejected for session ${JSON.stringify(sessionId)}: ${error.code} (HTTP ${error.status}): ${error.message}`,
    { cause: error }
  );
}
async function completeRuntimeCandidate(store2, candidate, session) {
  const runtimeId = candidate.runtimeSession.id;
  const runtimeSession = await store2.getSession(runtimeId);
  if (!runtimeSession) return false;
  if (runtimeSession.status !== "completed") {
    try {
      await store2.setSessionStatus(runtimeId, "completed", iso(session.updatedAt));
    } catch (error) {
      let latest;
      try {
        latest = await store2.getSession(runtimeId);
      } catch {
        throw error;
      }
      if (latest) throw error;
      return false;
    }
  }
  return true;
}
async function retireRuntimeCandidates(store2, stageId, learnerKey, candidateIds, successor, successorRuntimeId) {
  const ids = new Set(candidateIds);
  if (ids.size === 0) return;
  const successorIdentity = chatRuntimeIdentity(successorRuntimeId, stageId, successor.id);
  if (!successorIdentity) {
    throw new Error(`Invalid chat runtime successor ${JSON.stringify(successorRuntimeId)}`);
  }
  const currentViews = await runtimeViews(store2, stageId, learnerKey);
  await Promise.all(
    currentViews.flatMap((view) => {
      if (!ids.has(view.runtimeSession.id) || view.runtimeSession.status !== "completed") return [];
      const state = view.folded.state;
      const identity = chatRuntimeIdentity(view.runtimeSession.id, stageId, successor.id);
      if (state && (state.updatedAt > successor.updatedAt || state.updatedAt === successor.updatedAt && (!identity || identity.generation > successorIdentity.generation || identity.generation === successorIdentity.generation && view.runtimeSession.id.localeCompare(successorRuntimeId) > 0))) {
        return [];
      }
      return [store2.deleteSession(view.runtimeSession.id)];
    })
  );
}
async function syncOne(store2, stageId, learnerKey, session, existingViews, isolatedWrites, observed, sleep) {
  let desired = normalizeSession(session);
  let views = existingViews;
  let retryError;
  let backoffBeforeAttempt = false;
  let refreshBeforeAttempt = false;
  retryLoop: for (let attempt = 0; attempt < MAX_CHAT_SYNC_ATTEMPTS; attempt += 1) {
    if (backoffBeforeAttempt) {
      await sleep(Math.min(100 * 2 ** Math.max(0, attempt - 1), MAX_CHAT_RETRY_DELAY_MS));
      backoffBeforeAttempt = false;
    }
    if (refreshBeforeAttempt) {
      views = await runtimeViews(store2, stageId, learnerKey);
      refreshBeforeAttempt = false;
    }
    let reconcileSource = true;
    for (let planStep = 0; planStep < MAX_CHAT_PLAN_STEPS_PER_ATTEMPT; planStep += 1) {
      const candidates = chatRuntimeCandidates(views, stageId, desired.id);
      const source = newestRuntimeCandidate(candidates);
      if (reconcileSource && source?.folded.session && source.folded.session.updatedAt > desired.updatedAt) {
        const localEditAdvanced = observed !== void 0 && desired.updatedAt > observed.updatedAt && !isEqual4(desired, observed);
        desired = localEditAdvanced ? { ...desired, updatedAt: source.folded.session.updatedAt + 1 } : source.folded.session;
      }
      const plan = planChatSync({ session: desired, stageId, learnerKey, isolatedWrites }, views);
      if (plan.kind === "create-session") {
        const runtimeSession = await createOrGetRuntimeSession(store2, plan.init);
        const records = await store2.listRecords(runtimeSession.id);
        views = [
          ...views.filter((view) => view.runtimeSession.id !== runtimeSession.id),
          { runtimeSession, records, folded: foldRecords(records) }
        ];
        reconcileSource = false;
        continue;
      }
      if (plan.kind === "reuse-isolated") {
        const destinationId = plan.destination.runtimeSession.id;
        if (plan.completeDestination && !await completeRuntimeCandidate(store2, plan.destination, desired)) {
          views = await runtimeViews(store2, stageId, learnerKey);
          continue retryLoop;
        }
        const completed = await Promise.all(
          plan.retired.map((candidate) => completeRuntimeCandidate(store2, candidate, desired))
        );
        if (completed.some((candidate) => !candidate)) {
          views = await runtimeViews(store2, stageId, learnerKey);
          continue retryLoop;
        }
        await retireRuntimeCandidates(
          store2,
          stageId,
          learnerKey,
          plan.retired.map((candidate) => candidate.runtimeSession.id),
          desired,
          destinationId
        );
        return destinationId;
      }
      if (plan.kind === "replace-isolated") {
        const runtimeId2 = generationRuntimeSessionId(plan.baseRuntimeId, plan.generation, nanoid2());
        try {
          await Promise.all(
            plan.candidates.map((candidate) => completeRuntimeCandidate(store2, candidate, desired))
          );
          let runtimeSession = await createOrGetRuntimeSession(store2, {
            id: runtimeId2,
            kind: "chat",
            stageId,
            learnerKey,
            status: "active",
            createdAt: iso(desired.createdAt),
            updatedAt: iso(desired.updatedAt)
          });
          for (const append of plan.appends) {
            await appendPayload(store2, runtimeId2, append.payload, desired, append.suffix);
          }
          if (plan.finalStatus) {
            await store2.setSessionStatus(runtimeId2, plan.finalStatus, iso(desired.updatedAt));
            runtimeSession = { ...runtimeSession, status: plan.finalStatus };
          }
          await retireRuntimeCandidates(
            store2,
            stageId,
            learnerKey,
            plan.candidates.map((candidate) => candidate.runtimeSession.id),
            desired,
            runtimeId2
          );
          return runtimeSession.id;
        } catch (error) {
          retryError = error;
          try {
            await store2.deleteSession(runtimeId2);
            views = await runtimeViews(store2, stageId, learnerKey);
          } catch {
            throw error;
          }
          if (isDeterministicChatSyncFailure(error)) {
            throw chatSyncValidationError(desired.id, error);
          }
          backoffBeforeAttempt = true;
          continue retryLoop;
        }
      }
      if (plan.kind === "complete-and-refresh") {
        await completeRuntimeCandidate(store2, plan.destination, desired);
        views = await runtimeViews(store2, stageId, learnerKey);
        continue retryLoop;
      }
      if (plan.kind === "start-generation") {
        await createOrGetRuntimeSession(store2, plan.init);
        views = await runtimeViews(store2, stageId, learnerKey);
        continue retryLoop;
      }
      const destination = plan.destination;
      const runtimeId = destination.runtimeSession.id;
      try {
        if (plan.preStatus) {
          await store2.setSessionStatus(runtimeId, plan.preStatus, iso(desired.updatedAt));
        }
        for (const append of plan.appends) {
          await appendPayload(store2, runtimeId, append.payload, desired, append.suffix);
        }
        if (plan.finalStatus) {
          await store2.setSessionStatus(runtimeId, plan.finalStatus, iso(desired.updatedAt));
        }
        return runtimeId;
      } catch (error) {
        retryError = error;
        const deterministic = isDeterministicChatSyncFailure(error);
        let latest;
        try {
          latest = await store2.getSession(runtimeId);
        } catch {
          throw error;
        }
        if (latest && !matchesChatPartition(latest, runtimeId, stageId, learnerKey)) {
          throw error;
        }
        if (latest?.status === "active") {
          if (!destination.folded.state) {
            let latestFolded;
            try {
              latestFolded = foldRecords(await store2.listRecords(runtimeId));
            } catch {
              throw error;
            }
            if (latestFolded.state) {
              if (deterministic) throw chatSyncValidationError(desired.id, error);
              views = await runtimeViews(store2, stageId, learnerKey);
              backoffBeforeAttempt = true;
              continue retryLoop;
            }
            try {
              await store2.deleteSession(runtimeId);
            } catch {
              throw error;
            }
            if (deterministic) throw chatSyncValidationError(desired.id, error);
            views = await runtimeViews(store2, stageId, learnerKey);
            backoffBeforeAttempt = true;
            continue retryLoop;
          }
          if (deterministic) throw chatSyncValidationError(desired.id, error);
          views = await runtimeViews(store2, stageId, learnerKey);
          backoffBeforeAttempt = true;
          continue retryLoop;
        }
        if (deterministic) throw chatSyncValidationError(desired.id, error);
        views = await runtimeViews(store2, stageId, learnerKey);
        backoffBeforeAttempt = true;
        continue retryLoop;
      }
    }
    retryError ??= new Error(
      `Exceeded chat sync plan-step limit for ${JSON.stringify(desired.id)}`
    );
    backoffBeforeAttempt = true;
    refreshBeforeAttempt = true;
  }
  if (!isolatedWrites) {
    try {
      const unresolved = (await runtimeViews(store2, stageId, learnerKey)).filter(
        (view) => chatRuntimeIdentity(view.runtimeSession.id, stageId, desired.id) !== void 0 && !view.folded.state
      );
      await Promise.all(unresolved.map((view) => store2.deleteSession(view.runtimeSession.id)));
    } catch {
    }
  }
  throw retryError ?? new Error(`Failed to resolve chat generation for ${JSON.stringify(desired.id)}`);
}
async function syncSessions(store2, stageId, learnerKey, sessions, deleteOmitted, isolatedWrites, knownSessionIds = /* @__PURE__ */ new Set(), observed = /* @__PURE__ */ new Map(), existingViews, sleep = defaultChatSyncSleep) {
  const existing = existingViews ?? await runtimeViews(store2, stageId, learnerKey);
  const desiredRuntimeIds = /* @__PURE__ */ new Map();
  for (const session of sessions) {
    desiredRuntimeIds.set(
      session.id,
      await syncOne(
        store2,
        stageId,
        learnerKey,
        session,
        existing,
        isolatedWrites,
        observed.get(session.id),
        sleep
      )
    );
  }
  if (deleteOmitted) {
    const omittedKnownIds = new Set(
      existing.flatMap((view) => {
        const chatSessionId = view.folded.session?.id;
        return chatSessionId && knownSessionIds.has(chatSessionId) && !desiredRuntimeIds.has(chatSessionId) ? [chatSessionId] : [];
      })
    );
    await Promise.all(
      [...omittedKnownIds].map(
        (chatSessionId) => ensureDeletionMarker(store2, stageId, learnerKey, chatSessionId, existing)
      )
    );
    const afterSync = await runtimeViews(store2, stageId, learnerKey);
    const afterSyncById = new Map(afterSync.map((view) => [view.runtimeSession.id, view]));
    await Promise.all(
      existing.flatMap((view) => {
        const chatSessionId = view.folded.session?.id;
        const desiredRuntimeId = chatSessionId ? desiredRuntimeIds.get(chatSessionId) : void 0;
        const current = afterSyncById.get(view.runtimeSession.id);
        if (!chatSessionId) return [];
        if (!desiredRuntimeId) {
          return knownSessionIds.has(chatSessionId) ? [store2.deleteSession(view.runtimeSession.id)] : [];
        }
        if (desiredRuntimeId === view.runtimeSession.id || !current || current.runtimeSession.status !== "completed") {
          return [];
        }
        const successor = afterSyncById.get(desiredRuntimeId);
        const currentIdentity = chatRuntimeIdentity(
          current.runtimeSession.id,
          stageId,
          chatSessionId
        );
        const successorIdentity = successor ? chatRuntimeIdentity(successor.runtimeSession.id, stageId, chatSessionId) : void 0;
        if (current.folded.state && (!successor?.folded.state || successor.folded.state.updatedAt < current.folded.state.updatedAt || successor.folded.state.updatedAt === current.folded.state.updatedAt && (!currentIdentity || !successorIdentity || currentIdentity.generation > successorIdentity.generation || currentIdentity.generation === successorIdentity.generation && current.runtimeSession.id.localeCompare(successor.runtimeSession.id) > 0))) {
          return [];
        }
        return [store2.deleteSession(view.runtimeSession.id)];
      })
    );
  }
  return loadRuntimeSessions(store2, stageId, learnerKey);
}
async function loadRuntimeSessions(store2, stageId, learnerKey) {
  const views = await runtimeViews(store2, stageId, learnerKey);
  const deletedChatSessionIds = new Set(deletionMarkersByChatId(views, stageId).keys());
  const restoreMarker = currentRestoreMarker(views, stageId);
  const supersededRuntimeSessionIds = new Set(
    restoreMarkerTargets(views.find((view) => view.runtimeSession.id === restoreMarker))
  );
  const newestByChatSession = /* @__PURE__ */ new Map();
  for (const view of views) {
    if (supersededRuntimeSessionIds.has(view.runtimeSession.id)) continue;
    const chatSession = view.folded.session;
    if (!chatSession) continue;
    if (deletedChatSessionIds.has(chatSession.id)) continue;
    const identity = chatRuntimeIdentity(view.runtimeSession.id, stageId, chatSession.id);
    if (!identity) continue;
    const current = newestByChatSession.get(chatSession.id);
    const currentGeneration = current ? chatRuntimeIdentity(current.runtimeSession.id, stageId, chatSession.id).generation : -1;
    if (!current || chatSession.updatedAt > current.folded.session.updatedAt || chatSession.updatedAt === current.folded.session.updatedAt && (identity.generation > currentGeneration || identity.generation === currentGeneration && view.runtimeSession.id.localeCompare(current.runtimeSession.id) > 0)) {
      newestByChatSession.set(chatSession.id, view);
    }
  }
  return [...newestByChatSession.values()].map((view) => view.folded.session).sort((left, right) => left.createdAt - right.createdAt || left.id.localeCompare(right.id));
}
async function saveChatSessions(stageId, sessions, options4 = {}) {
  const resolved = await context(options4);
  const queueKey = `${stageId}\0${resolved.learnerKey}`;
  const nextSessions = sessions ?? [];
  try {
    await enqueue(
      resolved.store,
      queueKey,
      stageId,
      resolved.requiresCrossRealmLock,
      async (isolatedWrites) => {
        let beforeSave = await runtimeViews(resolved.store, stageId, resolved.learnerKey);
        const restoreMarker = currentRestoreMarker(beforeSave, stageId) ?? null;
        const callerSnapshot = options4.snapshot;
        if (callerSnapshot && callerSnapshot.restoreMarker !== void 0 && callerSnapshot.restoreMarker !== restoreMarker) {
          if (matchesSnapshot(callerSnapshot, nextSessions)) return;
          throw new ChatStorageSnapshotInvalidatedByRestoreError(
            `Chat snapshot for stage ${JSON.stringify(stageId)} was invalidated by backup restore`
          );
        }
        if (!callerSnapshot && restoreMarker !== null) {
          throw new ChatStorageSnapshotInvalidatedByRestoreError(
            `Chat snapshot for stage ${JSON.stringify(stageId)} must be reloaded after backup restore`
          );
        }
        if (callerSnapshot?.restoreMarker === void 0 && callerSnapshot !== void 0 && matchesSnapshot(callerSnapshot, nextSessions)) {
          return;
        }
        let effectiveNextSessions = nextSessions;
        if (callerSnapshot !== void 0 && callerSnapshot.restoreMarker === void 0 && !matchesSnapshot(callerSnapshot, nextSessions)) {
          const recoveredConversion = normalizeLegacyConversion(
            await resolved.legacyStore.load(stageId)
          );
          rememberSkippedLegacyRows(resolved.store, queueKey, recoveredConversion.skippedRows);
          const recoveredLegacy = recoveredConversion.sessions;
          if (recoveredLegacy.length > 0) {
            const recoveredById = new Map(recoveredLegacy.map((session) => [session.id, session]));
            for (const session of nextSessions) recoveredById.set(session.id, session);
            effectiveNextSessions = [...recoveredById.values()];
          }
        }
        if (callerSnapshot?.restoreMarker === void 0 && restoreMarker !== null) {
          const markerView = beforeSave.find((view) => view.runtimeSession.id === restoreMarker);
          const targets = restoreMarkerTargets(markerView);
          await Promise.all(
            targets.map((runtimeSessionId2) => resolved.store.deleteSession(runtimeSessionId2))
          );
          if (markerView && targets.length > 0) {
            await finalizeRestoreMarker(resolved.store, markerView.runtimeSession);
          }
          beforeSave = await runtimeViews(resolved.store, stageId, resolved.learnerKey);
        }
        const deletionMarkers = deletionMarkersByChatId(beforeSave, stageId);
        const callerBaseline = callerSnapshot ? sessionMap(callerSnapshot.sessions) : void 0;
        const ignoredStaleSessionIds = /* @__PURE__ */ new Set();
        const supersededMarkerViews = [];
        for (const session of nextSessions) {
          const markers = deletionMarkers.get(session.id);
          if (!markers?.length) continue;
          const baseline = callerBaseline?.get(session.id);
          if (baseline) {
            if (isEqual4(baseline, normalizeSession(session))) {
              ignoredStaleSessionIds.add(session.id);
              continue;
            }
            throw new ChatStorageSnapshotInvalidatedByDeletionError(
              `Chat ${JSON.stringify(session.id)} was deleted by another caller`
            );
          }
          if (!callerSnapshot) {
            throw new ChatStorageSnapshotInvalidatedByDeletionError(
              `Chat ${JSON.stringify(session.id)} must be reloaded after deletion`
            );
          }
          supersededMarkerViews.push(...markers);
        }
        if (ignoredStaleSessionIds.size > 0) {
          effectiveNextSessions = effectiveNextSessions.filter(
            (session) => !ignoredStaleSessionIds.has(session.id)
          );
        }
        const knownSessionIds = callerSnapshot ? new Set(callerSnapshot.sessions.map((session) => session.id)) : observedIds(resolved.store, queueKey);
        const priorObservedSessions = callerSnapshot ? sessionMap(callerSnapshot.sessions) : observedSessions(resolved.store, queueKey);
        await syncSessions(
          resolved.store,
          stageId,
          resolved.learnerKey,
          effectiveNextSessions,
          true,
          isolatedWrites,
          knownSessionIds,
          priorObservedSessions,
          beforeSave,
          resolved.sleep
        );
        await Promise.all(
          supersededMarkerViews.map((view) => resolved.store.deleteSession(view.runtimeSession.id))
        );
        rememberObservedIds(
          resolved.store,
          queueKey,
          nextSessions.map((session) => session.id)
        );
        rememberObservedSessions(resolved.store, queueKey, nextSessions);
        const unsafeToClear = skippedLegacyRows(resolved.store, queueKey);
        if (unsafeToClear) {
          warnSkippedLegacyRows(stageId, unsafeToClear);
        } else {
          await resolved.legacyStore.clear(stageId);
        }
      },
      options4.globalLockHeld
    );
  } catch (error) {
    if (error instanceof ChatStorageLockUnavailableError && (options4.snapshot ? matchesSnapshot(options4.snapshot, nextSessions) : matchesObservedSessions(resolved.store, queueKey, nextSessions))) {
      return;
    }
    throw error;
  }
}
async function loadChatSessions(stageId, options4 = {}) {
  const resolved = await context(options4);
  const queueKey = `${stageId}\0${resolved.learnerKey}`;
  let legacy = [];
  let runtimeReadSucceeded = false;
  let readRestoreMarker;
  try {
    return await enqueue(
      resolved.store,
      queueKey,
      stageId,
      resolved.requiresCrossRealmLock,
      async (isolatedWrites) => {
        const rawLegacy = await resolved.legacyStore.load(stageId);
        const conversion = normalizeLegacyConversion(rawLegacy);
        legacy = conversion.sessions;
        if (options4.observe !== false) {
          rememberSkippedLegacyRows(resolved.store, queueKey, conversion.skippedRows);
        }
        warnSkippedLegacyRows(stageId, conversion.skippedRows);
        let beforeLoad = await runtimeViews(resolved.store, stageId, resolved.learnerKey);
        let restoreMarker = currentRestoreMarker(beforeLoad, stageId) ?? null;
        readRestoreMarker = restoreMarker;
        if (restoreMarker !== null) {
          const markerView = beforeLoad.find((view) => view.runtimeSession.id === restoreMarker);
          const targets = restoreMarkerTargets(markerView);
          if (markerView && targets.length > 0) {
            await Promise.all(
              targets.map((runtimeSessionId2) => resolved.store.deleteSession(runtimeSessionId2))
            );
            await finalizeRestoreMarker(resolved.store, markerView.runtimeSession);
            beforeLoad = await runtimeViews(resolved.store, stageId, resolved.learnerKey);
            restoreMarker = currentRestoreMarker(beforeLoad, stageId) ?? null;
            readRestoreMarker = restoreMarker;
          }
        }
        if (legacy.length === 0) {
          const loaded = await loadRuntimeSessions(resolved.store, stageId, resolved.learnerKey);
          runtimeReadSucceeded = true;
          if (options4.observe !== false) {
            rememberObservedIds(
              resolved.store,
              queueKey,
              loaded.map((session) => session.id)
            );
            rememberObservedSessions(resolved.store, queueKey, loaded);
          }
          reportSnapshot(options4, loaded, restoreMarker);
          return loaded;
        }
        const migrated = await syncSessions(
          resolved.store,
          stageId,
          resolved.learnerKey,
          legacy,
          false,
          isolatedWrites,
          void 0,
          void 0,
          beforeLoad,
          resolved.sleep
        );
        runtimeReadSucceeded = true;
        if (options4.observe !== false) {
          rememberObservedIds(
            resolved.store,
            queueKey,
            migrated.map((session) => session.id)
          );
          rememberObservedSessions(resolved.store, queueKey, migrated);
        }
        if (conversion.skippedRows.length === 0) await resolved.legacyStore.clear(stageId);
        reportSnapshot(options4, migrated, restoreMarker);
        return migrated;
      }
    );
  } catch (error) {
    if (error instanceof ChatStorageLockUnavailableError) {
      if (options4.fallbackToLegacyOnError === false) throw error;
      const conversion = normalizeLegacyConversion(await resolved.legacyStore.load(stageId));
      const readOnlyLegacy = conversion.sessions;
      rememberSkippedLegacyRows(resolved.store, queueKey, conversion.skippedRows);
      warnSkippedLegacyRows(stageId, conversion.skippedRows);
      if (readOnlyLegacy.length === 0) throw error;
      if (options4.observe !== false) {
        rememberObservedIds(
          resolved.store,
          queueKey,
          readOnlyLegacy.map((session) => session.id)
        );
        rememberObservedSessions(resolved.store, queueKey, readOnlyLegacy);
      }
      reportSnapshot(options4, readOnlyLegacy, void 0);
      console.warn(`Loaded legacy chat sessions without migration for stage ${stageId}:`, error);
      return readOnlyLegacy;
    }
    if (options4.observe !== false && !runtimeReadSucceeded) {
      rememberObservedIds(resolved.store, queueKey, []);
      rememberObservedSessions(resolved.store, queueKey, []);
    } else if (options4.observe !== false) {
      rememberObservedIds(
        resolved.store,
        queueKey,
        legacy.map((session) => session.id)
      );
      rememberObservedSessions(resolved.store, queueKey, legacy);
    }
    if (options4.fallbackToLegacyOnError === false) throw error;
    if (legacy.length === 0) throw error;
    reportSnapshot(options4, legacy, runtimeReadSucceeded ? readRestoreMarker : void 0);
    console.warn(`Failed to migrate chat sessions for stage ${stageId}:`, error);
    return legacy;
  }
}
async function deleteChatSessions(stageId) {
  await dexieLegacyStore.clear(stageId);
}
var RESTORE_MARKER_PREFIX, DELETION_MARKER_PREFIX, CHAT_DELETION_KIND, MAX_CHAT_SYNC_ATTEMPTS, MAX_CHAT_PLAN_STEPS_PER_ATTEMPT, MAX_CHAT_RETRY_DELAY_MS, defaultChatSyncSleep, dexieLegacyStore, storeQueues, observedChatSessionIds, observedChatSessions, skippedLegacyRowsByPartition, ChatStorageLockUnavailableError, ChatStorageSnapshotInvalidatedByRestoreError, ChatStorageSnapshotInvalidatedByDeletionError;
var init_chat_storage = __esm({
  "OpenMAIC/lib/utils/chat-storage.ts"() {
    "use strict";
    init_learner_key();
    init_store();
    init_database();
    init_chat_storage_core();
    init_chat_storage_lock();
    init_chat_storage_core();
    RESTORE_MARKER_PREFIX = "chat-restore-marker:";
    DELETION_MARKER_PREFIX = "chat-deletion:";
    CHAT_DELETION_KIND = "chat-deletion";
    MAX_CHAT_SYNC_ATTEMPTS = 8;
    MAX_CHAT_PLAN_STEPS_PER_ATTEMPT = 8;
    MAX_CHAT_RETRY_DELAY_MS = 500;
    defaultChatSyncSleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
    dexieLegacyStore = {
      async load(stageId) {
        const staged = await db.chatRestoreStaging.where("stageId").equals(stageId).sortBy("createdAt");
        const records = staged.length > 0 ? staged : await db.chatSessions.where("stageId").equals(stageId).sortBy("createdAt");
        return records;
      },
      async clear(stageId) {
        await db.transaction("rw", [db.chatSessions, db.chatRestoreStaging], async () => {
          await db.chatSessions.where("stageId").equals(stageId).delete();
          await db.chatRestoreStaging.where("stageId").equals(stageId).delete();
        });
      }
    };
    storeQueues = /* @__PURE__ */ new WeakMap();
    observedChatSessionIds = /* @__PURE__ */ new WeakMap();
    observedChatSessions = /* @__PURE__ */ new WeakMap();
    skippedLegacyRowsByPartition = /* @__PURE__ */ new WeakMap();
    ChatStorageLockUnavailableError = class extends Error {
    };
    ChatStorageSnapshotInvalidatedByRestoreError = class extends Error {
    };
    ChatStorageSnapshotInvalidatedByDeletionError = class extends Error {
    };
  }
});

// OpenMAIC/lib/playback/cursor.ts
import { BrowserKVStore as BrowserKVStore10 } from "@openmaic/storage";
function cursorKey(stageId) {
  return `${CURSOR_KEY_PREFIX}${stageId}`;
}
function resolveKv5(kv) {
  if (kv) return kv;
  if (typeof window === "undefined") {
    throw new Error("Playback cursor persistence is client-only");
  }
  return defaultKv8 ??= new BrowserKVStore10();
}
async function clearCursor(stageId, deps = {}) {
  await resolveKv5(deps.kv).remove(cursorKey(stageId), "device");
}
var CURSOR_KEY_PREFIX, defaultKv8;
var init_cursor = __esm({
  "OpenMAIC/lib/playback/cursor.ts"() {
    "use strict";
    CURSOR_KEY_PREFIX = "playback-cursor:";
  }
});

// OpenMAIC/lib/quiz/persistence.ts
function safeRemove(key2) {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(key2);
  } catch {
  }
}
function clearAllForScene(sceneId) {
  safeRemove(DRAFT_KEY_PREFIX + sceneId);
  safeRemove(ANSWERS_KEY_PREFIX + sceneId);
  safeRemove(RESULTS_KEY_PREFIX + sceneId);
  safeRemove(ATTEMPT_ID_KEY_PREFIX + sceneId);
}
var DRAFT_KEY_PREFIX, ANSWERS_KEY_PREFIX, RESULTS_KEY_PREFIX, ATTEMPT_ID_KEY_PREFIX;
var init_persistence = __esm({
  "OpenMAIC/lib/quiz/persistence.ts"() {
    "use strict";
    DRAFT_KEY_PREFIX = "quizDraft:";
    ANSWERS_KEY_PREFIX = "quizAnswers:";
    RESULTS_KEY_PREFIX = "quizResults:";
    ATTEMPT_ID_KEY_PREFIX = "quizAttemptId:";
  }
});

// OpenMAIC/lib/media/media-ref.ts
function isGeneratedMediaPlaceholder(value) {
  return !!value && /^gen_(img|vid)_[\w-]+$/i.test(value);
}
var init_media_ref = __esm({
  "OpenMAIC/lib/media/media-ref.ts"() {
    "use strict";
  }
});

// OpenMAIC/lib/media/resolve-media-ref.ts
function isConcreteMediaAddress(value) {
  const candidate = value?.trimStart();
  if (!candidate || /\s/.test(candidate)) return false;
  if (/^(https?:|data:|blob:|\/|\.\.?\/)/i.test(candidate)) return true;
  return /^(?:[^:?#]+\/)+[^?#]*(?:[?#].*)?$/.test(candidate) || /^[^:?#]+[?#].*$/.test(candidate) || /^(?:[^:?#]+\/)?[^/:?#]+\.[a-z0-9]{1,12}(?:[?#].*)?$/i.test(candidate);
}
function isRetryableFailure(task) {
  return task.errorCode !== "CONTENT_SENSITIVE" && task.errorCode !== "GENERATION_DISABLED";
}
function resolveMediaRef(ref, task, lease = MISSING_ASSET_LEASE, mediaGenerationDisabled = false) {
  const value = ref ?? "";
  const leaseUrl = lease.status === "resolved" ? lease.url : void 0;
  if (task?.status === "pending" || task?.status === "generating") {
    return mediaGenerationDisabled ? { kind: "disabled" } : { kind: "pending" };
  }
  if (task?.status === "failed") {
    const lastUrl = leaseUrl ?? task.objectUrl;
    if (lastUrl) return { kind: "url", url: lastUrl, retryable: isRetryableFailure(task) };
    if (task.errorCode === "GENERATION_DISABLED") return { kind: "disabled" };
    return { kind: "failed", retryable: isRetryableFailure(task) };
  }
  if (leaseUrl) return { kind: "url", url: leaseUrl };
  if (task?.status === "done" && task.objectUrl) return { kind: "url", url: task.objectUrl };
  if (task) return mediaGenerationDisabled ? { kind: "disabled" } : { kind: "pending" };
  if (lease.status === "pending") return { kind: "pending" };
  if (isGeneratedMediaPlaceholder(value)) {
    return mediaGenerationDisabled ? { kind: "disabled" } : { kind: "placeholder" };
  }
  return isConcreteMediaAddress(value) ? { kind: "raw", value } : { kind: "placeholder" };
}
function renderableMediaUrl(state) {
  const candidate = state.kind === "url" ? state.url : state.kind === "raw" ? state.value : void 0;
  return isConcreteMediaAddress(candidate) ? candidate?.trimStart() : void 0;
}
var MISSING_ASSET_LEASE;
var init_resolve_media_ref = __esm({
  "OpenMAIC/lib/media/resolve-media-ref.ts"() {
    "use strict";
    "use client";
    init_use_asset_url();
    init_media_ref();
    MISSING_ASSET_LEASE = Object.freeze({ status: "missing" });
  }
});

// OpenMAIC/lib/media/reclaim-stage-assets.ts
async function loadStageAssetInventory(document2) {
  const stageId = document2.stage.id;
  const mediaRows = await db.mediaFiles.where("stageId").equals(stageId).toArray();
  const audioRows = await db.audioFiles.where("stageId").equals(stageId).toArray();
  return {
    refs: collectStageAssetRefs(document2, { mediaRows, audioRows }),
    mediaRows,
    audioRows
  };
}
function buildStageAssetReclamationPlan(stageId, before, mediaRows, audioRows) {
  const candidates = new Set(before.all);
  const poolRefs = [...candidates].filter((ref) => before.poolOwned.has(ref));
  const mediaRowIds = mediaRows.filter((row) => row.stageId === stageId).filter((row) => {
    const prefix = `${stageId}:`;
    const ref = row.id.startsWith(prefix) ? row.id.slice(prefix.length) : row.id;
    return candidates.has(ref);
  }).map((row) => row.id);
  const audioRowIds = audioRows.filter((row) => row.stageId === stageId).filter((row) => candidates.has(row.id)).map((row) => row.id);
  return {
    stageId,
    poolRefs: [...new Set(poolRefs)],
    mediaRowIds: [...new Set(mediaRowIds)],
    audioRowIds: [...new Set(audioRowIds)]
  };
}
async function executeStageAssetReclamation(plan, deletedDocument) {
  void deletedDocument;
  const liveRefs = await loadSurvivingDocumentAssetRefs();
  if (plan.mediaRowIds.length > 0) {
    await db.mediaFiles.bulkDelete([...plan.mediaRowIds]);
  }
  if (plan.audioRowIds.length > 0 && liveRefs !== null) {
    const removableAudioRowIds = plan.audioRowIds.filter((id) => !liveRefs.has(id));
    if (removableAudioRowIds.length > 0) {
      await db.audioFiles.bulkDelete(removableAudioRowIds);
    }
  }
  return plan;
}
var init_reclaim_stage_assets = __esm({
  "OpenMAIC/lib/media/reclaim-stage-assets.ts"() {
    "use strict";
    init_collect_stage_asset_refs();
    init_database();
  }
});

// OpenMAIC/lib/store/media-generation.ts
import { create as create5 } from "zustand";
function isMediaPlaceholder(src) {
  return !!src && !CONCRETE_URL.test(src);
}
var log10, CONCRETE_URL, useMediaGenerationStore;
var init_media_generation = __esm({
  "OpenMAIC/lib/store/media-generation.ts"() {
    "use strict";
    init_database();
    init_logger();
    log10 = createLogger("MediaGenerationStore");
    CONCRETE_URL = /^(https?:|data:|blob:|\/|\.\.?\/)/i;
    useMediaGenerationStore = create5()((set, get) => ({
      tasks: {},
      enqueueTasks: (stageId, requests) => {
        const newTasks = {};
        for (const req of requests) {
          if (get().tasks[req.elementId]) continue;
          newTasks[req.elementId] = {
            elementId: req.elementId,
            type: req.type,
            status: "pending",
            prompt: req.prompt,
            params: {
              aspectRatio: req.aspectRatio,
              style: req.style
            },
            retryCount: 0,
            stageId
          };
        }
        if (Object.keys(newTasks).length > 0) {
          set((s) => ({ tasks: { ...s.tasks, ...newTasks } }));
        }
      },
      markGenerating: (elementId) => set((s) => {
        const task = s.tasks[elementId];
        if (!task) return s;
        return {
          tasks: { ...s.tasks, [elementId]: { ...task, status: "generating" } }
        };
      }),
      markDone: (elementId, objectUrl, poster) => set((s) => {
        const task = s.tasks[elementId];
        if (!task) return s;
        return {
          tasks: {
            ...s.tasks,
            [elementId]: {
              ...task,
              status: "done",
              objectUrl,
              poster,
              error: void 0
            }
          }
        };
      }),
      rekeyDone: (oldRef, newRef, objectUrl, poster, posterAssetId) => set((s) => {
        const task = s.tasks[oldRef];
        if (!task) return s;
        const tasks = { ...s.tasks };
        delete tasks[oldRef];
        tasks[newRef] = {
          ...task,
          elementId: newRef,
          placeholderRef: task.placeholderRef ?? oldRef,
          status: "done",
          objectUrl,
          poster,
          posterAssetId,
          error: void 0,
          errorCode: void 0
        };
        return { tasks };
      }),
      markFailed: (elementId, error, errorCode) => set((s) => {
        const task = s.tasks[elementId];
        if (!task) return s;
        return {
          tasks: {
            ...s.tasks,
            [elementId]: { ...task, status: "failed", error, errorCode }
          }
        };
      }),
      markPendingForRetry: (elementId) => set((s) => {
        const task = s.tasks[elementId];
        if (!task) return s;
        return {
          tasks: {
            ...s.tasks,
            [elementId]: {
              ...task,
              status: "pending",
              error: void 0,
              errorCode: void 0,
              retryCount: task.retryCount + 1
            }
          }
        };
      }),
      getTask: (elementId) => get().tasks[elementId],
      isReady: (elementId) => get().tasks[elementId]?.status === "done",
      restoreFromDB: async (stageId) => {
        try {
          const records = await db.mediaFiles.where("stageId").equals(stageId).toArray();
          const restored = {};
          for (const rec of records) {
            const elementId = rec.id.includes(":") ? rec.id.split(":").slice(1).join(":") : rec.id;
            const params = JSON.parse(rec.params || "{}");
            if (rec.error) {
              restored[elementId] = {
                elementId,
                placeholderRef: rec.placeholderRef,
                type: rec.type,
                status: "failed",
                prompt: rec.prompt,
                params,
                error: rec.error,
                errorCode: rec.errorCode,
                retryCount: 0,
                stageId
              };
            } else {
              const objectUrl = rec.ossKey ? rec.ossKey : URL.createObjectURL(
                rec.blob.type ? rec.blob : new Blob([rec.blob], { type: rec.mimeType })
              );
              const poster = rec.posterOssKey ? rec.posterOssKey : rec.poster ? URL.createObjectURL(rec.poster) : void 0;
              restored[elementId] = {
                elementId,
                placeholderRef: rec.placeholderRef,
                type: rec.type,
                status: "done",
                prompt: rec.prompt,
                params,
                objectUrl,
                poster,
                retryCount: 0,
                stageId
              };
            }
          }
          if (Object.keys(restored).length > 0) {
            set((s) => ({ tasks: { ...s.tasks, ...restored } }));
          }
        } catch (err) {
          log10.error("Failed to restore from DB:", err);
        }
      },
      clearStage: (stageId) => set((s) => {
        const remaining = {};
        for (const [id, task] of Object.entries(s.tasks)) {
          if (task.stageId !== stageId) {
            remaining[id] = task;
          } else if (task.objectUrl) {
            URL.revokeObjectURL(task.objectUrl);
            if (task.poster) URL.revokeObjectURL(task.poster);
          }
        }
        return { tasks: remaining };
      }),
      revokeObjectUrls: () => {
        const tasks = get().tasks;
        for (const task of Object.values(tasks)) {
          if (task.objectUrl) URL.revokeObjectURL(task.objectUrl);
          if (task.poster) URL.revokeObjectURL(task.poster);
        }
      }
    }));
  }
});

// OpenMAIC/lib/media/video-manifest.ts
function buildVideoManifestFromOutlines(outlines) {
  const manifest = {};
  for (const outline of outlines) {
    for (const request of outline.mediaGenerations ?? []) {
      if (request.type !== "video") continue;
      manifest[request.elementId] = {
        type: "video",
        prompt: request.prompt,
        aspectRatio: request.aspectRatio
      };
    }
  }
  return manifest;
}
function getVideoMediaRefForElement(element) {
  if (element.mediaRef) return element.mediaRef;
  if (element.src && isMediaPlaceholder(element.src)) return element.src;
  return void 0;
}
var init_video_manifest = __esm({
  "OpenMAIC/lib/media/video-manifest.ts"() {
    "use strict";
    init_media_generation();
  }
});

// OpenMAIC/lib/media/media-task-resolution.ts
function lookupMediaTask(tasks, ref, stageId, placeholderFallback = true) {
  if (!ref) return void 0;
  const direct = Object.hasOwn(tasks, ref) ? tasks[ref] : void 0;
  const task = direct ?? (placeholderFallback ? Object.values(tasks).find(
    (candidate) => candidate.placeholderRef === ref && (!stageId || candidate.stageId === stageId)
  ) : void 0);
  return task && (!stageId || task.stageId === stageId) ? task : void 0;
}
function mediaTaskRefForElement(element) {
  if (element.type === "video") {
    return getVideoMediaRefForElement(element) ?? (element.src && !isConcreteMediaAddress(element.src) ? element.src : void 0);
  }
  if (element.type === "image" && element.src && !isConcreteMediaAddress(element.src)) {
    return element.src;
  }
  return void 0;
}
function matchMediaTaskForElement(tasks, element, stageId) {
  const ref = mediaTaskRefForElement(element);
  if (!ref || !stageId) return void 0;
  const targeted = lookupMediaTask(tasks, element.id, stageId, false);
  if (targeted) return [element.id, targeted];
  const task = lookupMediaTask(tasks, ref, stageId);
  if (!task) return void 0;
  if (Object.hasOwn(tasks, ref) && tasks[ref] === task) return [ref, task];
  const fallbackKey = Object.entries(tasks).find(([, candidate]) => candidate === task)?.[0];
  return fallbackKey ? [fallbackKey, task] : void 0;
}
function resolveMediaTaskForElement(tasks, element, stageId) {
  return matchMediaTaskForElement(tasks, element, stageId)?.[1];
}
function resolveVideoMediaForElement(tasks, element, stageId, documentElements) {
  const effectiveTasks = stageId && documentElements ? withDocumentLegacyVideoRecovery(tasks, documentElements, stageId) : tasks;
  const mediaRef = mediaTaskRefForElement(element);
  const concreteSrc = element.src && isConcreteMediaAddress(element.src) ? element.src : void 0;
  const sourceRef = concreteSrc ?? mediaRef ?? element.src;
  const task = concreteSrc ? void 0 : resolveMediaTaskForElement(effectiveTasks, element, stageId);
  const posterRef = element.poster ?? task?.poster;
  const posterTask = task?.poster && (!element.poster || !isConcreteMediaAddress(element.poster)) ? { ...task, objectUrl: task.poster } : void 0;
  return { sourceRef, mediaRef, task, posterRef, posterTask };
}
function isLegacySequentialVideoElement(element) {
  return element.type === "video" && /^gen_vid_\d+$/i.test(mediaTaskRefForElement(element) ?? "");
}
function collectDocumentMediaElements(stage, scenes) {
  const elements = [];
  const addSlide = (slide) => {
    const seen = /* @__PURE__ */ new Set();
    for (const slot of slideMediaReferenceSlots(slide)) {
      if (slot.element && !seen.has(slot.element)) {
        seen.add(slot.element);
        elements.push(slot.element);
      }
    }
  };
  for (const slide of stage?.whiteboard ?? []) addSlide(slide);
  for (const scene of scenes) {
    if (scene.content.type === "slide") addSlide(scene.content.canvas);
    for (const slide of scene.whiteboards ?? []) addSlide(slide);
  }
  return elements;
}
function withDocumentLegacyVideoRecovery(tasks, documentElements, stageId) {
  const videoElements = documentElements.filter((element) => element.type === "video");
  const matchedElements = /* @__PURE__ */ new Set();
  const consumedTaskKeys = /* @__PURE__ */ new Set();
  for (const element of videoElements) {
    const match = matchMediaTaskForElement(tasks, element, stageId);
    if (!match) continue;
    matchedElements.add(element);
    consumedTaskKeys.add(match[0]);
  }
  const candidates = Object.entries(tasks).filter(
    ([taskKey2, candidate]) => candidate.stageId === stageId && candidate.type === "video" && candidate.status === "done" && !consumedTaskKeys.has(taskKey2)
  );
  const unmatchedLegacyVideos = videoElements.filter(
    (element) => isLegacySequentialVideoElement(element) && !matchedElements.has(element)
  );
  if (unmatchedLegacyVideos.length !== 1 || candidates.length !== 1) {
    return { ...tasks };
  }
  const ref = mediaTaskRefForElement(unmatchedLegacyVideos[0]);
  const [taskKey, task] = candidates[0];
  if (!ref) return { ...tasks };
  return {
    ...tasks,
    [taskKey]: { ...task, placeholderRef: ref }
  };
}
var init_media_task_resolution = __esm({
  "OpenMAIC/lib/media/media-task-resolution.ts"() {
    "use strict";
    init_video_manifest();
    init_resolve_media_ref();
    init_slide_media_slots();
  }
});

// OpenMAIC/lib/utils/stage-storage.ts
var stage_storage_exports = {};
__export(stage_storage_exports, {
  FolderNameError: () => FolderNameError,
  createFolder: () => createFolder,
  deleteFolder: () => deleteFolder,
  deleteStageData: () => deleteStageData,
  getFirstSlideByStages: () => getFirstSlideByStages,
  listFolders: () => listFolders,
  listStages: () => listStages,
  loadStageData: () => loadStageData,
  renameFolder: () => renameFolder,
  renameStage: () => renameStage,
  resolveThumbnailMediaValue: () => resolveThumbnailMediaValue,
  revokeThumbnailSlideMediaUrls: () => revokeThumbnailSlideMediaUrls,
  saveStageData: () => saveStageData,
  saveStageDataIncremental: () => saveStageDataIncremental,
  setStageFolder: () => setStageFolder,
  stageExists: () => stageExists
});
import { nanoid as nanoid3 } from "nanoid";
import isEqual5 from "lodash/isEqual";
import { DocumentVersionError } from "@openmaic/storage";
function stampStage(stageId, stage, now) {
  return {
    ...stage,
    id: stageId,
    name: stage.name || "Untitled Stage",
    createdAt: stage.createdAt || now,
    updatedAt: now
  };
}
function stampScene(stageId, scene, index, now) {
  return {
    ...scene,
    stageId,
    order: scene.order ?? index,
    createdAt: scene.createdAt || now,
    updatedAt: scene.updatedAt || now
  };
}
function documentSnapshot(stageId, data, existingOutline, now) {
  const outline = data.outline ?? existingOutline ?? {
    outlines: [],
    createdAt: now,
    updatedAt: now
  };
  return {
    stage: stampStage(stageId, data.stage, now),
    scenes: data.scenes.map((scene, index) => stampScene(stageId, scene, index, now)),
    outline: {
      ...outline,
      createdAt: existingOutline?.createdAt ?? outline.createdAt
    }
  };
}
async function saveStageChats(stageId, data, globalLockHeld = false) {
  try {
    await saveChatSessions(stageId, data.chats, {
      ...globalLockHeld ? { globalLockHeld: true } : {},
      snapshot: data.chatSnapshot
    });
    return true;
  } catch (error) {
    const unchangedSnapshot = isEqual5(data.chatSnapshot?.sessions ?? [], data.chats);
    if (error instanceof ChatStorageLockUnavailableError && !unchangedSnapshot) throw error;
    log11.warn(`Chat sessions failed to save for stage ${stageId}:`, error);
    return false;
  }
}
async function saveStageData(stageId, data, capturedEpoch) {
  if (isStageWriteStale(stageId, capturedEpoch)) {
    log11.info(`Dropping save for deleted/stale stage: ${stageId}`);
    return "stale-dropped";
  }
  try {
    const now = Date.now();
    const failedChanges = [];
    let dropped = false;
    await mutateDocument(
      stageId,
      async (existing, store2) => {
        if (isStageWriteStale(stageId, capturedEpoch)) {
          dropped = true;
          return;
        }
        await withRuntimeStorageSharedLock(async () => {
          const existingOutline = existing?.outline;
          if (isStageWriteStale(stageId, capturedEpoch)) {
            dropped = true;
            return;
          }
          await store2.saveDocument(documentSnapshot(stageId, data, existingOutline, now));
          if (isStageWriteStale(stageId, capturedEpoch)) {
            dropped = true;
            return;
          }
          await saveCurrentScene(stageId, data.currentSceneId);
          if (isStageWriteStale(stageId, capturedEpoch)) {
            dropped = true;
            return;
          }
          if (data.chats && !await saveStageChats(stageId, data, true)) {
            failedChanges.push({ kind: "chats" });
          }
        });
      },
      { storageSharedLockHeld: true }
    );
    if (dropped) {
      log11.info(`Dropped save mid-write for deleted/stale stage: ${stageId}`);
      return "stale-dropped";
    }
    log11.info(`Saved stage: ${stageId}`);
    return failedChanges.length > 0 ? { failedChanges } : void 0;
  } catch (error) {
    log11.error("Failed to save stage:", error);
    throw error;
  }
}
async function saveStageDataIncremental(stageId, dirty, data, capturedEpoch) {
  if (isStageWriteStale(stageId, capturedEpoch)) {
    log11.info(`Dropping incremental save for deleted/stale stage: ${stageId}`);
    return "stale-dropped";
  }
  const has = (kind) => dirty.some((change) => change.kind === kind);
  const dirtySceneIds = new Set(
    dirty.flatMap((change) => change.kind === "scene" ? [change.sceneId] : [])
  );
  const needsDocumentWrite = dirtySceneIds.size > 0 || has("structure") || has("stage") || has("outline");
  const documentCategories = new Set(
    dirty.flatMap(
      (change) => change.kind === "scene" || change.kind === "structure" || change.kind === "stage" || change.kind === "outline" ? [change.kind] : []
    )
  );
  let dropped = false;
  if (needsDocumentWrite) {
    await mutateDocument(
      stageId,
      async (existing, store2) => {
        if (isStageWriteStale(stageId, capturedEpoch)) {
          dropped = true;
          return;
        }
        await withRuntimeStorageSharedLock(async () => {
          const now = Date.now();
          const fullSave = async () => {
            if (isStageWriteStale(stageId, capturedEpoch)) {
              dropped = true;
              return;
            }
            const persistedScenes = await preparePBLScenesForDocumentPersistence(
              stageId,
              data.scenes
            );
            if (isStageWriteStale(stageId, capturedEpoch)) {
              dropped = true;
              return;
            }
            await store2.saveDocument(
              documentSnapshot(
                stageId,
                { ...data, scenes: persistedScenes },
                existing?.outline,
                now
              )
            );
          };
          if (!existing || has("structure") || has("outline") || documentCategories.size > 1) {
            await fullSave();
            return;
          }
          try {
            if (dirtySceneIds.size > 0) {
              const dirtyScenes = data.scenes.filter((scene) => dirtySceneIds.has(scene.id));
              const persistedScenes = await preparePBLScenesForDocumentPersistence(
                stageId,
                dirtyScenes
              );
              for (const scene of persistedScenes) {
                const index = data.scenes.findIndex((candidate) => candidate.id === scene.id);
                if (isStageWriteStale(stageId, capturedEpoch)) {
                  dropped = true;
                  return;
                }
                await store2.putScene(stageId, stampScene(stageId, scene, index, now));
              }
            }
            if (has("stage")) {
              if (isStageWriteStale(stageId, capturedEpoch)) {
                dropped = true;
                return;
              }
              await store2.putStage(stageId, stampStage(stageId, data.stage, now));
            }
          } catch (error) {
            if (error instanceof DocumentVersionError && error.kind === "not-current") {
              await fullSave();
              return;
            }
            throw error;
          }
        });
      },
      { storageSharedLockHeld: true }
    );
  }
  if (dropped) {
    log11.info(`Dropped incremental save mid-write for deleted/stale stage: ${stageId}`);
    return "stale-dropped";
  }
  if (isStageWriteStale(stageId, capturedEpoch)) {
    log11.info(`Dropping incremental save tail for deleted/stale stage: ${stageId}`);
    return "stale-dropped";
  }
  if (has("currentScene")) await saveCurrentScene(stageId, data.currentSceneId);
  if (isStageWriteStale(stageId, capturedEpoch)) {
    log11.info(`Dropping incremental chat tail for deleted/stale stage: ${stageId}`);
    return "stale-dropped";
  }
  const failedChanges = [];
  if (has("chats") && !await saveStageChats(stageId, data)) {
    failedChanges.push({ kind: "chats" });
  }
  return { failedChanges };
}
async function loadStageData(stageId) {
  try {
    const access = await accessDocument(stageId);
    const document2 = access.document;
    if (!document2) {
      log11.info(`Stage not found: ${stageId}`);
      return null;
    }
    const currentScene = await loadCurrentScene(stageId);
    let chats = [];
    let chatSnapshot = { sessions: [], restoreMarker: void 0 };
    try {
      chats = await loadChatSessions(stageId, {
        onSnapshot: (snapshot) => {
          chatSnapshot = snapshot;
        }
      });
    } catch (error) {
      log11.warn(`Failed to load chat sessions for stage ${stageId}:`, error);
    }
    log11.info(`Loaded stage: ${stageId}, scenes: ${document2.scenes.length}, chats: ${chats.length}`);
    const storedCursor = currentScene?.sceneId ?? access.legacyCurrentSceneId;
    const currentSceneId = storedCursor && document2.scenes.some((scene) => scene.id === storedCursor) ? storedCursor : document2.scenes[0]?.id ?? null;
    return {
      stage: document2.stage,
      scenes: document2.scenes,
      currentSceneId,
      chats,
      chatSnapshot,
      outline: document2.outline
    };
  } catch (error) {
    log11.error("Failed to load stage:", error);
    throw error;
  }
}
function deleteStageData(stageId) {
  const existing = inFlightStageDeletions.get(stageId);
  if (!existing) return runSingleFlightStageDeletion(stageId);
  return existing.then(() => {
    if (isStageDeleted(stageId)) return;
    return runSingleFlightStageDeletion(stageId);
  });
}
function runSingleFlightStageDeletion(stageId) {
  const existing = inFlightStageDeletions.get(stageId);
  if (existing) return existing;
  const run = performStageDeletion(stageId).finally(() => {
    inFlightStageDeletions.delete(stageId);
  });
  inFlightStageDeletions.set(stageId, run);
  return run;
}
async function performStageDeletion(stageId) {
  const {
    clearStoreForDeletedStage: clearStoreForDeletedStage2,
    discardPendingStageChanges: discardPendingStageChanges2,
    restorePendingStageChanges: restorePendingStageChanges2,
    snapshotPendingStageChangesForDeletion: snapshotPendingStageChangesForDeletion2
  } = await Promise.resolve().then(() => (init_stage2(), stage_exports));
  const discardedChanges = snapshotPendingStageChangesForDeletion2(stageId);
  markStageDeleted(stageId);
  beginStageDeletionCascade(stageId);
  discardPendingStageChanges2(stageId);
  let documentDeleted = false;
  try {
    await mutateDocument(
      stageId,
      async (document2, store2) => (
        // Lock order: per-stage document lock, then the exclusive runtime epoch.
        withRuntimeStorageExclusiveLockUntilSettled(async (releaseCaller) => {
          try {
            const deletionDocument = document2 ?? {
              stage: { id: stageId, name: "", createdAt: 0, updatedAt: 0 },
              scenes: []
            };
            const assetInventory = await loadStageAssetInventory(deletionDocument);
            const assetPlan = buildStageAssetReclamationPlan(
              stageId,
              assetInventory.refs,
              assetInventory.mediaRows,
              assetInventory.audioRows
            );
            const legacyScenes = await db.scenes.where("stageId").equals(stageId).toArray();
            const sceneIds = [
              .../* @__PURE__ */ new Set([
                ...document2?.scenes.map((s) => s.id) ?? [],
                ...legacyScenes.map((s) => s.id)
              ])
            ];
            await store2.deleteDocument(stageId);
            documentDeleted = true;
            await executeStageAssetReclamation(assetPlan, null);
            await deleteChatSessions(stageId);
            await db.playbackState.delete(stageId);
            try {
              await clearCursor(stageId);
            } catch (error) {
              log11.warn(`Failed to clear playback cursor for stage ${stageId}:`, error);
            }
            try {
              await clearCurrentScene(stageId);
            } catch (error) {
              log11.warn(`Failed to clear editor current scene for stage ${stageId}:`, error);
            }
            for (const sceneId of sceneIds) {
              clearAllForScene(sceneId);
            }
            await db.transaction(
              "rw",
              [db.stages, db.scenes, db.stageOutlines, db.stageFolders],
              async () => {
                await db.stages.delete(stageId);
                await db.scenes.where("stageId").equals(stageId).delete();
                await db.stageOutlines.delete(stageId);
                await db.stageFolders.delete(stageId);
              }
            );
            try {
              await db.generatedAgents.where("stageId").equals(stageId).delete();
            } catch (error) {
              log11.warn(`Failed to clear legacy agent mirror rows for stage ${stageId}:`, error);
            }
            const runtimeDeletion = beginStageRuntimeDeletionSafely(stageId);
            await runtimeDeletion.completion;
            try {
              await clearStageDrainWatermarks(stageId);
            } catch (error) {
              log11.warn(`Failed to clear PBL drain watermarks for stage ${stageId}:`, error);
            }
            log11.info(`Deleted stage: ${stageId}`);
            releaseCaller(void 0);
            await runtimeDeletion.settlement;
          } catch (error) {
            log11.error("Failed to delete stage:", error);
            throw error;
          }
        })
      ),
      { storageSharedLockHeld: true }
    );
  } catch (error) {
    if (!documentDeleted) {
      unmarkStageDeleted(stageId);
      restorePendingStageChanges2(stageId, discardedChanges);
    }
    throw error;
  } finally {
    settleStageDeletionCascade(stageId);
  }
  clearStoreForDeletedStage2(stageId);
}
async function listOwnerStagesFromServer() {
  const res = await fetch("/api/stages", { credentials: "include" });
  if (!res.ok) {
    throw new Error(`Failed to list owner stages: HTTP ${res.status}`);
  }
  const body = await res.json().catch(() => null);
  if (!body || !Array.isArray(body.stages)) {
    throw new Error("Malformed /api/stages response: expected { stages: [...] }");
  }
  const memberships = await db.stageFolders.toArray();
  const folderByStage = new Map(memberships.map((m) => [m.stageId, m.folderId]));
  return body.stages.map((item) => {
    const base = {
      id: item.id,
      name: item.name,
      sceneCount: item.sceneCount,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      ...item.description !== void 0 ? { description: item.description } : {},
      ...item.interactiveMode !== void 0 ? { interactiveMode: item.interactiveMode } : {},
      ...item.taskEngineMode !== void 0 ? { taskEngineMode: item.taskEngineMode } : {}
    };
    const folderId = folderByStage.get(item.id) ?? item.folderId;
    return folderId ? { ...base, folderId } : base;
  }).sort((a, b) => b.updatedAt - a.updatedAt);
}
async function listStages() {
  try {
    if (isBrowserPersistenceEnabled()) {
      return await listOwnerStagesFromServer();
    }
    const summaries = await getDocumentStore().listDocuments();
    const ids = new Set(summaries.map((summary) => summary.id));
    const legacy = await getLegacyDocumentStore().listStages();
    const legacyOnly = await Promise.all(
      legacy.filter((stage) => !ids.has(stage.id)).map(async (stage) => {
        const snapshot = await getLegacyDocumentStore().read(stage.id);
        return snapshot ? { ...stage, sceneCount: snapshot.scenes.length } : null;
      })
    );
    const memberships = await db.stageFolders.toArray();
    const folderByStage = new Map(memberships.map((m) => [m.stageId, m.folderId]));
    return [
      ...summaries,
      ...legacyOnly.filter((stage) => stage !== null).map((stage) => ({
        id: stage.id,
        name: stage.name,
        description: stage.description,
        sceneCount: stage.sceneCount,
        createdAt: stage.createdAt,
        updatedAt: stage.updatedAt,
        interactiveMode: stage.interactiveMode,
        taskEngineMode: stage.taskEngineMode
      }))
    ].map(
      (item) => folderByStage.get(item.id) ? { ...item, folderId: folderByStage.get(item.id) } : item
    ).sort((a, b) => b.updatedAt - a.updatedAt);
  } catch (error) {
    log11.error("Failed to list stages:", error);
    throw error;
  }
}
function isResolvableThumbnailMediaRef(value) {
  return typeof value === "string" && !!value && !isConcreteMediaAddress(value);
}
function getThumbnailMediaRef(element) {
  if (element.type === "image" && isResolvableThumbnailMediaRef(element.src)) {
    return element.src;
  }
  return void 0;
}
function getMediaRecordElementId(recordId) {
  return recordId.includes(":") ? recordId.split(":").slice(1).join(":") : recordId;
}
function blobWithType(blob, mimeType) {
  return blob.type ? blob : new Blob([blob], { type: mimeType });
}
async function resolveThumbnailMediaValue(ref, task, storedBlob, mimeType, mediaGenerationDisabled = false) {
  if (isConcreteMediaAddress(ref)) {
    return renderableMediaUrl(resolveMediaRef(ref, void 0, MISSING_ASSET_LEASE));
  }
  let blob;
  try {
    blob = await withAssetUrl(ref, async (url) => {
      if (!url) return void 0;
      const response = await fetch(url);
      const fetched = response.ok ? await response.blob() : void 0;
      return fetched && fetched.size > 0 ? fetched : void 0;
    });
  } catch {
  }
  blob ??= storedBlob && storedBlob.size > 0 ? blobWithType(storedBlob, mimeType) : void 0;
  if (blob) {
    const url = URL.createObjectURL(blobWithType(blob, mimeType));
    return renderableMediaUrl(
      resolveMediaRef(ref, task, { status: "resolved", url }, mediaGenerationDisabled)
    );
  }
  return renderableMediaUrl(
    resolveMediaRef(ref, task, MISSING_ASSET_LEASE, mediaGenerationDisabled)
  );
}
function revokeObjectUrl(url) {
  if (url?.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
}
function revokeThumbnailSlideMediaUrls(slides) {
  for (const slide of Object.values(slides)) {
    for (const slot of slideMediaReferenceSlots(slide)) {
      if (slot.kind !== "video-media-ref") revokeObjectUrl(slot.read());
    }
  }
}
async function getFirstSlideByStages(stageIds) {
  const result = {};
  try {
    await Promise.all(
      stageIds.map(async (stageId) => {
        const document2 = (await accessDocument(stageId)).document;
        const firstSlide = document2?.scenes.find((s) => s.content?.type === "slide");
        if (firstSlide && firstSlide.content.type === "slide") {
          const slide = structuredClone(firstSlide.content.canvas);
          const mediaSlots = [...slideMediaReferenceSlots(slide)];
          const mediaElements = /* @__PURE__ */ new Set();
          for (const slot of mediaSlots) {
            if (slot.element && (slot.element.type === "video" || !!getThumbnailMediaRef(slot.element))) {
              mediaElements.add(slot.element);
            }
          }
          const backgroundSlot = mediaSlots.find((slot) => slot.kind === "background-image");
          const backgroundRef = backgroundSlot?.read();
          if (mediaElements.size > 0 || backgroundRef && isResolvableThumbnailMediaRef(backgroundRef)) {
            const settings = useSettingsStore.getState();
            const mediaRecords = await db.mediaFiles.where("stageId").equals(stageId).toArray();
            const mediaMap = new Map(
              mediaRecords.map((record) => [getMediaRecordElementId(record.id), record])
            );
            const taskEntries = Object.fromEntries(
              mediaRecords.map((record) => [
                getMediaRecordElementId(record.id),
                {
                  stageId: record.stageId,
                  type: record.type,
                  status: record.error ? "failed" : "done",
                  placeholderRef: record.placeholderRef,
                  poster: record.poster ? `${record.id}:poster` : void 0,
                  record
                }
              ])
            );
            const documentElements = collectDocumentMediaElements(
              document2?.stage,
              document2?.scenes ?? []
            );
            if (backgroundSlot && backgroundRef && isResolvableThumbnailMediaRef(backgroundRef)) {
              const selectedRecord = mediaMap.get(backgroundRef);
              const task = selectedRecord?.error ? {
                status: "failed",
                errorCode: selectedRecord.errorCode,
                retryCount: 0
              } : void 0;
              const record = selectedRecord && !selectedRecord.error ? selectedRecord : void 0;
              backgroundSlot.write(
                await resolveThumbnailMediaValue(
                  backgroundRef,
                  task,
                  record?.type === "image" ? record.blob : void 0,
                  record?.mimeType || "image/png",
                  !settings.imageGenerationEnabled
                ) ?? ""
              );
            }
            for (const el of mediaElements) {
              const videoBinding = el.type === "video" ? resolveVideoMediaForElement(
                taskEntries,
                el,
                stageId,
                documentElements
              ) : void 0;
              const mediaRef = videoBinding?.sourceRef ?? getThumbnailMediaRef(el);
              if (!mediaRef) continue;
              const selected = el.type === "video" ? videoBinding?.task : resolveMediaTaskForElement(
                taskEntries,
                el,
                stageId
              );
              const selectedRecord = selected?.record;
              const task = selectedRecord?.error ? {
                status: "failed",
                errorCode: selectedRecord.errorCode,
                retryCount: 0
              } : void 0;
              const record = selectedRecord && !selectedRecord.error ? selectedRecord : void 0;
              if (el.type === "image") {
                el.src = await resolveThumbnailMediaValue(
                  mediaRef,
                  task,
                  record?.type === "image" ? record.blob : void 0,
                  record?.mimeType || "image/png",
                  !settings.imageGenerationEnabled
                ) ?? "";
              } else if (el.type === "video") {
                el.src = await resolveThumbnailMediaValue(
                  mediaRef,
                  task,
                  record?.type === "video" ? record.blob : void 0,
                  record?.mimeType || "video/mp4",
                  !settings.videoGenerationEnabled
                ) ?? "";
                const posterRef = videoBinding?.posterRef;
                const posterRecord = posterRef && isResolvableThumbnailMediaRef(posterRef) ? mediaMap.get(posterRef) : void 0;
                const posterBlob = posterRecord && !posterRecord.error && posterRecord.type === "image" ? blobWithType(posterRecord.blob, posterRecord.mimeType) : record?.poster ? blobWithType(record.poster, "image/jpeg") : void 0;
                if (posterRef) {
                  const posterTask = posterRecord?.error ? {
                    status: "failed",
                    errorCode: posterRecord.errorCode,
                    retryCount: 0
                  } : void 0;
                  el.poster = await resolveThumbnailMediaValue(
                    posterRef,
                    posterTask,
                    posterBlob,
                    posterRecord?.mimeType || "image/jpeg"
                  );
                } else if (posterBlob) {
                  el.poster = URL.createObjectURL(posterBlob);
                }
              }
            }
          }
          result[stageId] = slide;
        }
      })
    );
  } catch (error) {
    log11.error("Failed to load thumbnails:", error);
  }
  return result;
}
async function renameStage(stageId, newName) {
  try {
    await mutateDocument(stageId, async (document2, store2) => {
      if (!document2) throw new Error(`Stage not found: ${stageId}`);
      await store2.putStage(stageId, { ...document2.stage, name: newName, updatedAt: Date.now() });
    });
    log11.info(`Renamed stage ${stageId} to "${newName}"`);
  } catch (error) {
    log11.error("Failed to rename stage:", error);
    throw error;
  }
}
async function stageExists(stageId) {
  try {
    const summaries = await getDocumentStore().listDocuments();
    if (summaries.some((stage) => stage.id === stageId)) return true;
    return await getLegacyDocumentStore().read(stageId) !== null;
  } catch (error) {
    log11.error("Failed to check stage existence:", error);
    return false;
  }
}
function folderRouteError(body) {
  const code = body?.error?.code;
  const message = typeof body?.error?.message === "string" ? body.error.message : void 0;
  if (code === "FOLDER_NAME_DUPLICATE") {
    return new FolderNameError(message ?? "A folder with this name already exists", "duplicate");
  }
  if (code === "FOLDER_NAME_TOO_LONG") {
    return new FolderNameError(message ?? "Folder name is too long", "tooLong");
  }
  if (code === "FOLDER_NAME_EMPTY") {
    return new FolderNameError(message ?? "Folder name must not be empty", "empty");
  }
  if (code === "FOLDER_LIMIT_REACHED") {
    return new FolderNameError(message ?? "Folder count limit reached", "limit");
  }
  return new Error(message ?? "folder request failed");
}
function toFolderRecord(folder) {
  return {
    id: folder.id,
    name: folder.name,
    order: folder.order,
    createdAt: folder.createdAt,
    updatedAt: folder.updatedAt
  };
}
async function listOwnerFoldersFromServer() {
  const res = await fetch("/api/folders", { credentials: "include" });
  if (!res.ok) {
    throw new Error(`Failed to list owner folders: HTTP ${res.status}`);
  }
  const body = await res.json().catch(() => null);
  if (!body || !Array.isArray(body.folders)) {
    throw new Error("Malformed /api/folders response: expected { folders: [...] }");
  }
  return body.folders.map(toFolderRecord);
}
async function listFolders() {
  if (isBrowserPersistenceEnabled()) {
    return await listOwnerFoldersFromServer();
  }
  const folders = await db.folders.toArray();
  return folders.sort((a, b) => a.order - b.order);
}
function assertFolderName(name, existing, currentId) {
  const result = validateFolderName(name);
  if (!result.ok) {
    throw new FolderNameError(
      result.kind === "empty" ? "Folder name must not be empty" : "Folder name is too long",
      result.kind
    );
  }
  const trimmed = name.trim();
  const clash = existing.some(
    (f) => f.name.toLowerCase() === trimmed.toLowerCase() && f.id !== currentId
  );
  if (clash) throw new FolderNameError("A folder with this name already exists", "duplicate");
}
async function createOwnerFolderFromServer(name) {
  const res = await fetch("/api/folders", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name })
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) throw folderRouteError(body);
  if (!body?.folder) {
    throw new Error("Malformed /api/folders response: expected { folder: { ... } }");
  }
  return toFolderRecord(body.folder);
}
async function createFolder(name) {
  if (isBrowserPersistenceEnabled()) {
    return await createOwnerFolderFromServer(name);
  }
  const now = Date.now();
  return db.transaction("rw", db.folders, async () => {
    const existing = await db.folders.toArray();
    if (existing.length >= FOLDER_COUNT_LIMIT) {
      throw new FolderNameError("Folder count limit reached", "limit");
    }
    assertFolderName(name, existing);
    const order = existing.reduce((max, folder2) => Math.max(max, folder2.order), -1) + 1;
    const folder = {
      id: nanoid3(),
      name: name.trim(),
      order,
      createdAt: now,
      updatedAt: now
    };
    await db.folders.put(folder);
    log11.info(`Created folder "${name}" (${folder.id})`);
    return folder;
  });
}
async function renameOwnerFolderFromServer(id, name) {
  const res = await fetch(`/api/folders/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name })
  });
  if (!res.ok) {
    throw folderRouteError(await res.json().catch(() => null));
  }
}
async function renameFolder(id, name) {
  if (isBrowserPersistenceEnabled()) {
    await renameOwnerFolderFromServer(id, name);
    return;
  }
  const now = Date.now();
  await db.transaction("rw", db.folders, async () => {
    const existing = await db.folders.toArray();
    assertFolderName(name, existing, id);
    const folder = existing.find((f) => f.id === id);
    if (!folder) throw new Error(`Folder not found: ${id}`);
    await db.folders.put({ ...folder, name: name.trim(), updatedAt: now });
    log11.info(`Renamed folder ${id} to "${name}"`);
  });
}
async function deleteOwnerFolderFromServer(id, mode) {
  const res = await fetch(`/api/folders/${encodeURIComponent(id)}?mode=${mode}`, {
    method: "DELETE"
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) throw folderRouteError(body);
  if (mode === "remove") {
    const removedStageIds = body?.removedStageIds ?? [];
    await Promise.all(removedStageIds.map((stageId) => deleteStageData(stageId)));
  }
}
async function deleteFolder(id, mode = "ungroup") {
  if (isBrowserPersistenceEnabled()) {
    await deleteOwnerFolderFromServer(id, mode);
    return;
  }
  const members = await db.transaction("rw", [db.folders, db.stageFolders], async () => {
    const rows = await db.stageFolders.where("folderId").equals(id).toArray();
    await db.folders.delete(id);
    for (const row of rows) {
      await db.stageFolders.delete(row.stageId);
    }
    return rows;
  });
  if (mode === "remove") {
    for (const member of members) {
      if (member.stageId) await deleteStageData(member.stageId);
    }
  }
  log11.info(`Deleted folder ${id} (mode=${mode})`);
}
async function setStageFolder(stageId, folderId) {
  const now = Date.now();
  if (folderId !== void 0) {
    await db.transaction("rw", [db.folders, db.stageFolders], async () => {
      if (!isBrowserPersistenceEnabled()) {
        const folder = await db.folders.get(folderId);
        if (!folder) throw new Error(`Folder not found: ${folderId}`);
      }
      await db.stageFolders.put({ stageId, folderId, updatedAt: now });
    });
  } else {
    await db.stageFolders.put({ stageId, folderId: void 0, updatedAt: now });
  }
  log11.info(`Set stage ${stageId} folder -> ${folderId ?? "(unfiled)"}`);
}
var log11, inFlightStageDeletions;
var init_stage_storage = __esm({
  "OpenMAIC/lib/utils/stage-storage.ts"() {
    "use strict";
    init_database();
    init_folder_name_validation();
    init_folder_name_validation();
    init_chat_storage();
    init_cursor();
    init_document_store();
    init_persistence();
    init_store();
    init_drain();
    init_logger();
    init_chat_storage_lock();
    init_bootstrap();
    init_document_persistence();
    init_resolve_media_ref();
    init_use_asset_url();
    init_settings();
    init_deleted_stages();
    init_reclaim_stage_assets();
    init_media_task_resolution();
    init_slide_media_slots();
    log11 = createLogger("StageStorage");
    inFlightStageDeletions = /* @__PURE__ */ new Map();
  }
});

// OpenMAIC/lib/store/stage.ts
var stage_exports = {};
__export(stage_exports, {
  PENDING_SCENE_ID: () => PENDING_SCENE_ID,
  claimStageSceneLoadToken: () => claimStageSceneLoadToken,
  clearStoreForDeletedStage: () => clearStoreForDeletedStage,
  discardPendingStageChanges: () => discardPendingStageChanges,
  flushStageSave: () => flushStageSave,
  isCurrentStageSceneLoadToken: () => isCurrentStageSceneLoadToken,
  markStagePersistenceDirty: () => markStagePersistenceDirty,
  restorePendingStageChanges: () => restorePendingStageChanges,
  snapshotPendingStageChangesForDeletion: () => snapshotPendingStageChangesForDeletion,
  useStageStore: () => useStageStore
});
import { create as create6 } from "zustand";
function nextSaveDelayMs() {
  if (consecutiveFlushFailures === 0) return SAVE_DEBOUNCE_MS;
  return Math.min(SAVE_DEBOUNCE_MS * 2 ** consecutiveFlushFailures, SAVE_BACKOFF_MAX_MS);
}
function recordFlushOutcome(failed) {
  consecutiveFlushFailures = failed ? consecutiveFlushFailures + 1 : 0;
}
function pendingChangeKey(change) {
  return change.kind === "scene" ? `scene:${change.sceneId}` : change.kind;
}
function cancelScheduledSave() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = null;
}
function resetPendingChanges(stageId = null) {
  cancelScheduledSave();
  pendingChanges.clear();
  pendingStageId = stageId;
  consecutiveFlushFailures = 0;
}
function schedulePendingSave() {
  if (consecutiveFlushFailures > 0 && saveTimer) return;
  cancelScheduledSave();
  saveTimer = setTimeout(() => {
    saveTimer = null;
    void flushStageSave().catch(() => {
    });
  }, nextSaveDelayMs());
}
function markPendingChanges(stageId, ...changes) {
  if (!stageId || isStageDeleted(stageId)) return;
  if (pendingStageId !== stageId) resetPendingChanges(stageId);
  for (const change of changes) {
    pendingRevision += 1;
    pendingChanges.set(pendingChangeKey(change), { change, revision: pendingRevision });
  }
  schedulePendingSave();
}
function markStagePersistenceDirty(changes) {
  markPendingChanges(useStageStore.getState().stage?.id, ...changes);
}
function discardPendingStageChanges(stageId) {
  if (pendingStageId === stageId) resetPendingChanges();
}
function snapshotPendingStageChangesForDeletion(stageId) {
  const byKey = /* @__PURE__ */ new Map();
  if (flushInFlight?.stageId === stageId) {
    for (const { change } of flushInFlight.dirtySnapshot.values()) {
      byKey.set(pendingChangeKey(change), change);
    }
  }
  if (pendingStageId === stageId) {
    for (const { change } of pendingChanges.values()) {
      byKey.set(pendingChangeKey(change), change);
    }
  }
  return [...byKey.values()];
}
function restorePendingStageChanges(stageId, changes) {
  const state = useStageStore.getState();
  if (state.stage?.id !== stageId) return;
  const fullAggregateRemark = [
    { kind: "structure" },
    { kind: "stage" },
    { kind: "outline" },
    { kind: "currentScene" },
    { kind: "chats" },
    ...state.scenes.map((scene) => ({ kind: "scene", sceneId: scene.id }))
  ];
  markPendingChanges(stageId, ...changes, ...fullAggregateRemark);
}
function clearedStageState(state) {
  return {
    stage: null,
    scenes: [],
    currentSceneId: null,
    chats: [],
    chatSnapshot: { sessions: [], restoreMarker: null },
    outlines: [],
    generationComplete: false,
    generationEpoch: state.generationEpoch + 1,
    generationStatus: "idle",
    currentGeneratingOrder: -1,
    failedOutlines: [],
    generatingOutlines: []
  };
}
function clearStoreForDeletedStage(stageId) {
  if (useStageStore.getState().stage?.id !== stageId) return;
  if (!isStageDeleted(stageId)) return;
  resetPendingChanges();
  useStageStore.setState((state) => clearedStageState(state));
  log12.info("Evicted deleted stage from the store:", stageId);
}
function claimStageSceneLoadToken() {
  latestStageSceneLoadToken += 1;
  return latestStageSceneLoadToken;
}
function isCurrentStageSceneLoadToken(token) {
  return token === latestStageSceneLoadToken;
}
function mergeSceneContentForUpdate(current, incoming) {
  if (!incoming) return incoming;
  if (current.type !== "pbl" || incoming.type !== "pbl") return incoming;
  const currentPBL = current;
  const incomingPBL = incoming;
  return {
    ...currentPBL,
    ...incomingPBL,
    ...incomingPBL.projectV2 || !currentPBL.projectV2 ? {} : { projectV2: currentPBL.projectV2 }
  };
}
function isDeckComplete({
  outlines,
  scenes,
  failedOutlines
}) {
  return outlines.length > 0 && failedOutlines.length === 0 && outlines.every((o) => scenes.some((s) => s.order === o.order));
}
function persistenceSnapshot(state) {
  const { stage, scenes, currentSceneId, chats, chatSnapshot, outlines, generationComplete } = state;
  return { stage, scenes, currentSceneId, chats, chatSnapshot, outlines, generationComplete };
}
function delay2(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function persistDirtySnapshot(stageId, dirtySnapshot, snapshot, capturedEpoch) {
  if (!snapshot.stage) return /* @__PURE__ */ new Set();
  if (isStageWriteStale(stageId, capturedEpoch)) return "stale-dropped";
  stageStorageModulePromise ??= Promise.resolve().then(() => (init_stage_storage(), stage_storage_exports));
  const { saveStageDataIncremental: saveStageDataIncremental2 } = await stageStorageModulePromise;
  const result = await saveStageDataIncremental2(
    stageId,
    [...dirtySnapshot.values()].map(({ change }) => change),
    {
      stage: snapshot.stage,
      scenes: snapshot.scenes,
      currentSceneId: snapshot.currentSceneId,
      chats: snapshot.chats,
      chatSnapshot: snapshot.chatSnapshot,
      outline: {
        outlines: snapshot.outlines,
        generationComplete: snapshot.generationComplete,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    },
    capturedEpoch
  );
  if (result === "stale-dropped") return "stale-dropped";
  return new Set((result?.failedChanges ?? []).map(pendingChangeKey));
}
function startFlushRound() {
  if (flushInFlight) return flushInFlight;
  if (!pendingStageId || pendingChanges.size === 0) return null;
  const stageId = pendingStageId;
  const dirtySnapshot = new Map(pendingChanges);
  const state = useStageStore.getState();
  if (state.stage?.id !== stageId) {
    resetPendingChanges(state.stage?.id ?? null);
    return null;
  }
  const snapshot = persistenceSnapshot(state);
  const capturedEpoch = stageDeletionEpoch(stageId);
  const run = (async () => {
    try {
      const result = await persistDirtySnapshot(stageId, dirtySnapshot, snapshot, capturedEpoch);
      const staleDropped = result === "stale-dropped";
      const failedKeys = result === "stale-dropped" ? /* @__PURE__ */ new Set() : result;
      if (pendingStageId === stageId) {
        for (const [key2, entry] of dirtySnapshot) {
          if (!failedKeys.has(key2) && pendingChanges.get(key2)?.revision === entry.revision) {
            pendingChanges.delete(key2);
          }
        }
      }
      if (!staleDropped && dirtySnapshot.has("chats") && !failedKeys.has("chats") && useStageStore.getState().stage?.id === stageId && useStageStore.getState().chats === snapshot.chats) {
        useStageStore.setState({
          chatSnapshot: {
            sessions: structuredClone(snapshot.chats),
            restoreMarker: snapshot.chatSnapshot.restoreMarker
          }
        });
      }
      recordFlushOutcome(failedKeys.size > 0);
      return failedKeys;
    } catch (error) {
      log12.error(`Failed to flush pending stage changes for ${stageId}:`, error);
      recordFlushOutcome(true);
      throw error;
    } finally {
      flushInFlight = null;
      if (pendingChanges.size > 0 && pendingStageId) schedulePendingSave();
    }
  })();
  const round = { stageId, dirtySnapshot, promise: run };
  flushInFlight = round;
  return round;
}
function roundCoversEntry(round, entrySnapshot) {
  for (const [key2, entry] of entrySnapshot) {
    const pending2 = pendingChanges.get(key2);
    if (!pending2 || pending2.revision < entry.revision) continue;
    const attempted = round.dirtySnapshot.get(key2);
    if (!attempted || attempted.revision < entry.revision) return false;
  }
  return true;
}
async function flushStageSave() {
  const entryStageId = pendingStageId;
  const entryRevision = pendingRevision;
  const entrySnapshot = new Map(
    [...pendingChanges].filter(([, entry]) => entry.revision <= entryRevision)
  );
  for (let round = 0; round < MAX_FLUSH_DRAIN_ROUNDS; round += 1) {
    cancelScheduledSave();
    const stillPendingAtEntry = [...entrySnapshot].some(([key2, entry]) => {
      const pending2 = pendingChanges.get(key2);
      return pendingStageId === entryStageId && pending2 !== void 0 && pending2.revision >= entry.revision;
    });
    if (!entryStageId || entrySnapshot.size === 0 || !stillPendingAtEntry) return;
    const flushRound = startFlushRound();
    if (!flushRound) return;
    const coversEntry = roundCoversEntry(flushRound, entrySnapshot);
    try {
      const failedKeys = await flushRound.promise;
      if (coversEntry && failedKeys.size > 0) return;
    } catch (error) {
      if (coversEntry) throw error;
    }
  }
  throw new Error(`Stage persistence did not quiesce after ${MAX_FLUSH_DRAIN_ROUNDS} flush rounds`);
}
var log12, PENDING_SCENE_ID, latestStageSceneLoadToken, pendingStageId, pendingRevision, pendingChanges, saveTimer, flushInFlight, stageStorageModulePromise, DEPARTING_STAGE_RETRY_DELAY_MS, SAVE_DEBOUNCE_MS, SAVE_BACKOFF_MAX_MS, consecutiveFlushFailures, useStageStoreBase, useStageStore, MAX_FLUSH_DRAIN_ROUNDS;
var init_stage2 = __esm({
  "OpenMAIC/lib/store/stage.ts"() {
    "use strict";
    init_stage();
    init_create_selectors();
    init_logger();
    init_canvas();
    init_settings();
    init_store2();
    init_slide_schema();
    init_document_persistence();
    init_hydration();
    init_collect_stage_asset_refs();
    init_deleted_stages();
    log12 = createLogger("StageStore");
    PENDING_SCENE_ID = "__pending__";
    latestStageSceneLoadToken = 0;
    pendingStageId = null;
    pendingRevision = 0;
    pendingChanges = /* @__PURE__ */ new Map();
    saveTimer = null;
    flushInFlight = null;
    stageStorageModulePromise = null;
    DEPARTING_STAGE_RETRY_DELAY_MS = 100;
    SAVE_DEBOUNCE_MS = 500;
    SAVE_BACKOFF_MAX_MS = 3e4;
    consecutiveFlushFailures = 0;
    useStageStoreBase = create6()((set, get) => ({
      // Initial state
      stage: null,
      scenes: [],
      currentSceneId: null,
      chats: [],
      chatSnapshot: { sessions: [], restoreMarker: null },
      mode: "playback",
      toolbarState: "ai",
      generatingOutlines: [],
      outlines: [],
      generationComplete: false,
      outlineProducer: null,
      isOwner: true,
      readOnly: false,
      generationEpoch: 0,
      generationStatus: "idle",
      currentGeneratingOrder: -1,
      failedOutlines: [],
      serverManifestByStage: {},
      stageSyncRequest: 0,
      // Actions
      setStage: (stage) => {
        claimStageSceneLoadToken();
        const departingState = get();
        if (departingState.stage?.id && pendingStageId === departingState.stage.id && pendingChanges.size > 0) {
          const departingStageId = departingState.stage.id;
          const departingDirty = new Map(pendingChanges);
          const departingSnapshot = persistenceSnapshot(departingState);
          const departingEpoch = stageDeletionEpoch(departingStageId);
          void (async () => {
            let lastFailedKeys = /* @__PURE__ */ new Set();
            for (let attempt = 0; attempt < 2; attempt += 1) {
              try {
                const result = await persistDirtySnapshot(
                  departingStageId,
                  departingDirty,
                  departingSnapshot,
                  departingEpoch
                );
                if (result === "stale-dropped") return;
                lastFailedKeys = result;
                if (lastFailedKeys.size === 0) return;
              } catch (error) {
                if (attempt === 1) throw error;
              }
              await delay2(DEPARTING_STAGE_RETRY_DELAY_MS);
            }
            log12.warn(
              `Departing stage ${departingStageId} dropped failed changes after one retry: ${[...lastFailedKeys].join(", ")}`
            );
          })().catch((error) => {
            log12.error(
              `Failed to flush departing stage ${departingStageId} after one retry; changes were dropped:`,
              error
            );
          });
        }
        resetPendingChanges(stage.id);
        set((s) => ({
          stage,
          scenes: [],
          currentSceneId: null,
          chats: [],
          chatSnapshot: { sessions: [], restoreMarker: null },
          generationComplete: false,
          generationEpoch: s.generationEpoch + 1
        }));
        markPendingChanges(stage.id, { kind: "structure" }, { kind: "stage" });
      },
      setScenes: (scenes) => {
        const migrated = scenes.map(migrateScene);
        const previousCurrentSceneId = get().currentSceneId;
        const currentSceneId = !previousCurrentSceneId && migrated.length > 0 ? migrated[0].id : previousCurrentSceneId;
        set({ scenes: migrated, currentSceneId });
        markPendingChanges(
          get().stage?.id,
          { kind: "structure" },
          ...currentSceneId !== previousCurrentSceneId ? [{ kind: "currentScene" }] : []
        );
      },
      addScene: (scene) => {
        const currentStage = get().stage;
        if (!currentStage || scene.stageId !== currentStage.id) {
          log12.warn(
            `Ignoring scene "${scene.title}" - stageId mismatch (scene: ${scene.stageId}, current: ${currentStage?.id})`
          );
          return;
        }
        const scenes = [...get().scenes, migrateScene(scene)];
        const generatingOutlines = get().generatingOutlines.filter((o) => o.order !== scene.order);
        const shouldSwitch = get().currentSceneId === PENDING_SCENE_ID;
        set({
          scenes,
          generatingOutlines,
          ...shouldSwitch ? { currentSceneId: scene.id } : {}
        });
        markPendingChanges(
          currentStage.id,
          { kind: "structure" },
          ...shouldSwitch ? [{ kind: "currentScene" }] : []
        );
      },
      insertSceneAfter: (anchorSceneId, scene) => {
        const currentStage = get().stage;
        if (!currentStage || scene.stageId !== currentStage.id) {
          log12.warn(
            `insertSceneAfter ignored "${scene.title}" - stageId mismatch (scene: ${scene.stageId}, current: ${currentStage?.id})`
          );
          return;
        }
        const current = get().scenes;
        const anchorIndex = current.findIndex((s) => s.id === anchorSceneId);
        const insertIndex = anchorIndex < 0 ? current.length : anchorIndex + 1;
        const migrated = migrateScene(scene);
        const next = [...current.slice(0, insertIndex), migrated, ...current.slice(insertIndex)];
        const rebalanced = next.map((s, i) => s.order === i + 1 ? s : { ...s, order: i + 1 });
        set({ scenes: rebalanced });
        markPendingChanges(currentStage.id, { kind: "structure" });
      },
      updateScene: (sceneId, updates) => {
        const scenes = get().scenes.map((scene) => {
          if (scene.id !== sceneId) return scene;
          const content = mergeSceneContentForUpdate(scene.content, updates.content) ?? scene.content;
          return makeScene({ ...scene, ...updates }, content);
        });
        set({ scenes });
        markPendingChanges(get().stage?.id, { kind: "scene", sceneId });
      },
      deleteScene: (sceneId) => {
        const state = get();
        const wasComplete = !state.generationComplete && isDeckComplete(state);
        const scenes = state.scenes.filter((scene) => scene.id !== sceneId);
        const currentSceneId = get().currentSceneId;
        const provisionalAfter = state.stage ? { stage: state.stage, scenes } : null;
        const beforeRefs = collectStageAssetRefs(
          state.stage ? { stage: state.stage, scenes: state.scenes } : null,
          { mediaRows: [], audioRows: [] }
        );
        const afterRefs = collectStageAssetRefs(provisionalAfter, { mediaRows: [], audioRows: [] });
        const detachedRefs = new Set(
          [...beforeRefs.referenced].filter((ref) => !afterRefs.referenced.has(ref))
        );
        let nextStage = state.stage;
        if (nextStage?.videoManifest && detachedRefs.size > 0) {
          const nextManifest = Object.fromEntries(
            Object.entries(nextStage.videoManifest).filter(([ref]) => !detachedRefs.has(ref))
          );
          if (Object.keys(nextManifest).length !== Object.keys(nextStage.videoManifest).length) {
            nextStage = { ...nextStage, videoManifest: nextManifest };
          }
        }
        if (currentSceneId === sceneId) {
          const index = get().getSceneIndex(sceneId);
          const newIndex = index < scenes.length ? index : scenes.length - 1;
          set({
            stage: nextStage,
            scenes,
            currentSceneId: scenes[newIndex]?.id || null
          });
        } else {
          set({ stage: nextStage, scenes });
        }
        if (wasComplete) get().setGenerationComplete(true);
        markPendingChanges(
          get().stage?.id,
          { kind: "structure" },
          ...nextStage !== state.stage ? [{ kind: "stage" }] : [],
          ...currentSceneId === sceneId ? [{ kind: "currentScene" }] : []
        );
      },
      setCurrentSceneId: (sceneId) => {
        set({ currentSceneId: sceneId });
        markPendingChanges(get().stage?.id, { kind: "currentScene" });
      },
      setChats: (chats) => {
        set({ chats });
        markPendingChanges(get().stage?.id, { kind: "chats" });
      },
      setMode: (mode) => {
        const previousMode = get().mode;
        set({ mode });
        if (previousMode === "edit" && mode !== "edit") {
          useCanvasStore.getState().resetCanvasState();
        }
      },
      setToolbarState: (toolbarState) => set({ toolbarState }),
      setStageAgents: (configs) => {
        const stage = get().stage;
        if (!stage) return;
        set({ stage: { ...stage, generatedAgentConfigs: configs } });
        markPendingChanges(stage.id, { kind: "stage" });
        applyGeneratedAgentsToRegistry(stage.id, configs);
        const settings = useSettingsStore.getState();
        const nextRosterIds = configs.map((a) => a.id);
        if (!settings.agentSelectionIsUserSet) {
          settings.setSelectedAgentIds(nextRosterIds);
        } else if (settings.agentMode === "auto") {
          const previousRosterIds = new Set((stage.generatedAgentConfigs ?? []).map((a) => a.id));
          const selectionWasFullRoster = settings.selectedAgentIds.length > 0 && settings.selectedAgentIds.length === previousRosterIds.size && settings.selectedAgentIds.every((id) => previousRosterIds.has(id));
          const rosterIds = new Set(nextRosterIds);
          const retained = selectionWasFullRoster ? nextRosterIds : settings.selectedAgentIds.filter((id) => rosterIds.has(id));
          if (retained.length === 0) {
            settings.setSelectedAgentIds(nextRosterIds);
            settings.setAgentSelectionIsUserSet(false);
          } else if (retained.length !== settings.selectedAgentIds.length || retained.some((id, index) => id !== settings.selectedAgentIds[index])) {
            settings.setSelectedAgentIds(retained);
          }
        }
      },
      setGeneratingOutlines: (generatingOutlines) => set({ generatingOutlines }),
      setOutlines: (outlines) => {
        set({ outlines });
        markPendingChanges(get().stage?.id, { kind: "outline" });
      },
      setGenerationComplete: (generationComplete) => {
        set({ generationComplete });
        void get().saveToStorage();
      },
      markGenerationCompleteIfDone: () => {
        const { outlines, scenes, failedOutlines, generationComplete } = get();
        if (generationComplete) return;
        if (isDeckComplete({ outlines, scenes, failedOutlines })) get().setGenerationComplete(true);
      },
      setViewerAccess: ({ isOwner }) => {
        set({ isOwner, readOnly: !isOwner });
      },
      setGenerationStatus: (generationStatus) => set({ generationStatus }),
      setCurrentGeneratingOrder: (currentGeneratingOrder) => set({ currentGeneratingOrder }),
      bumpGenerationEpoch: () => set((s) => ({ generationEpoch: s.generationEpoch + 1 })),
      addFailedOutline: (outline) => {
        const existed = get().failedOutlines.some((o) => o.id === outline.id);
        if (existed) return;
        set({ failedOutlines: [...get().failedOutlines, outline] });
      },
      clearFailedOutlines: () => set({ failedOutlines: [] }),
      retryFailedOutline: (outlineId) => {
        set({
          failedOutlines: get().failedOutlines.filter((o) => o.id !== outlineId)
        });
      },
      // Getters
      getCurrentScene: () => {
        const { scenes, currentSceneId } = get();
        if (!currentSceneId) return null;
        return scenes.find((s) => s.id === currentSceneId) || null;
      },
      getSceneById: (sceneId) => {
        return get().scenes.find((s) => s.id === sceneId) || null;
      },
      getSceneIndex: (sceneId) => {
        return get().scenes.findIndex((s) => s.id === sceneId);
      },
      // Storage methods. Returns true on a verified write so callers that gate on
      // durability (e.g. setGenerationComplete) can avoid recording state that
      // outruns the scene data.
      saveToStorage: async () => {
        const { stage, scenes, currentSceneId, chats, chatSnapshot, outlines, generationComplete } = get();
        if (!stage?.id) {
          log12.warn("Cannot save: stage.id is required");
          return false;
        }
        const capturedEpoch = stageDeletionEpoch(stage.id);
        const pendingAtStart = new Map(pendingChanges);
        try {
          const persistedScenes = await preparePBLScenesForDocumentPersistence(stage.id, scenes);
          const { saveStageData: saveStageData2 } = await Promise.resolve().then(() => (init_stage_storage(), stage_storage_exports));
          const result = await saveStageData2(
            stage.id,
            {
              stage,
              scenes: persistedScenes,
              currentSceneId,
              chats,
              chatSnapshot,
              outline: {
                outlines,
                generationComplete,
                createdAt: Date.now(),
                updatedAt: Date.now()
              }
            },
            capturedEpoch
          );
          if (result === "stale-dropped") {
            log12.info(`Save dropped by deletion fence for stage ${stage.id}; nothing persisted`);
            return false;
          }
          const failedKeys = new Set((result?.failedChanges ?? []).map(pendingChangeKey));
          if (failedKeys.has("chats") && pendingStageId === stage.id && !pendingChanges.has("chats") && get().stage?.id === stage.id && get().chats === chats) {
            markPendingChanges(stage.id, { kind: "chats" });
          }
          if (!failedKeys.has("chats") && get().stage?.id === stage.id && get().chats === chats) {
            set({
              chatSnapshot: {
                sessions: structuredClone(chats),
                restoreMarker: chatSnapshot.restoreMarker
              }
            });
          }
          if (pendingStageId === stage.id) {
            for (const [key2, entry] of pendingAtStart) {
              if (!failedKeys.has(key2) && pendingChanges.get(key2)?.revision === entry.revision) {
                pendingChanges.delete(key2);
              }
            }
            if (pendingChanges.size === 0) cancelScheduledSave();
            else schedulePendingSave();
          }
          return true;
        } catch (error) {
          log12.error("Failed to save to storage:", error);
          return false;
        }
      },
      loadFromStorage: async (stageId, loadToken) => {
        try {
          const token = loadToken ?? claimStageSceneLoadToken();
          const currentState = get();
          if (currentState.stage?.id === stageId) {
            if (!isStageDeleted(stageId)) {
              if (currentState.scenes.length > 0) {
                log12.info("Stage already loaded in memory, skipping IndexedDB load:", stageId);
                return;
              }
            } else {
              if (isStageDeletionInFlight(stageId)) {
                log12.info("Warm stage is mid-deletion; waiting for the cascade to settle:", stageId);
                await stageDeletionSettled(stageId);
                if (!isCurrentStageSceneLoadToken(token)) {
                  log12.info("Newer stage load started during deletion settlement, skipping:", stageId);
                  return;
                }
                if (!isStageDeleted(stageId)) {
                  if (get().stage?.id === stageId) {
                    log12.info("Deletion failed; keeping warm stage state:", stageId);
                    return;
                  }
                  log12.info(
                    "Deletion failed but the store no longer holds the parked stage; reloading:",
                    stageId
                  );
                }
              }
              if (isStageDeleted(stageId)) {
                log12.info("Warm stage is deleted; discarding ghost and reloading:", stageId);
                if (get().stage?.id === stageId) {
                  resetPendingChanges();
                  set((s) => clearedStageState(s));
                }
              }
            }
          }
          const { loadStageData: loadStageData2 } = await Promise.resolve().then(() => (init_stage_storage(), stage_storage_exports));
          const data = await loadStageData2(stageId);
          const outlinesRecord = data?.outline;
          const outlines = outlinesRecord?.outlines || [];
          const persistedComplete = outlinesRecord?.generationComplete ?? false;
          if (data) {
            const migrated = await hydratePBLScenesFromRuntime(stageId, data.scenes.map(migrateScene));
            if (!isCurrentStageSceneLoadToken(token)) {
              log12.info("Newer stage load started during IndexedDB hydration, skipping load:", stageId);
              return;
            }
            const latestState = get();
            if (latestState.stage?.id === stageId && latestState.scenes.length > 0) {
              log12.info("Stage appeared in memory during IndexedDB hydration, skipping load:", stageId);
              return;
            }
            if (isStageDeleted(stageId)) {
              log12.info("Stage was deleted during hydration, skipping load:", stageId);
              return;
            }
            const inMemoryState = get();
            const failedOutlines = inMemoryState.stage?.id === stageId ? inMemoryState.failedOutlines : [];
            const generationComplete = persistedComplete || isDeckComplete({
              outlines,
              scenes: migrated,
              failedOutlines
            });
            set({
              stage: data.stage,
              scenes: migrated,
              currentSceneId: data.currentSceneId,
              chats: data.chats,
              chatSnapshot: data.chatSnapshot ?? { sessions: [], restoreMarker: void 0 },
              outlines,
              generationComplete,
              // Compute generatingOutlines from persisted outlines minus completed
              // scenes. Once generation is complete the deck is frozen for editing,
              // so an orphaned outline (e.g. from a deleted slide) must NOT surface
              // as a pending placeholder or drive resume regeneration.
              generatingOutlines: generationComplete ? [] : outlines.filter((o) => !migrated.some((s) => s.order === o.order)),
              // `mode` is transient UI state, not persisted with the stage.
              // Reset to 'playback' on every load so SPA navigation between
              // classrooms doesn't carry Pro-mode state across — e.g. user
              // enters edit in A, navigates to B → B was inheriting
              // mode='edit'. Refresh already reset via initial store value;
              // this normalises the SPA path to match.
              mode: "playback"
            });
            resetPendingChanges(stageId);
            if (generationComplete && !persistedComplete) void get().saveToStorage();
            log12.info("Loaded from storage:", stageId);
          } else {
            log12.warn("No data found for stage:", stageId);
          }
        } catch (error) {
          log12.error("Failed to load from storage:", error);
          throw error;
        }
      },
      clearStore: () => {
        claimStageSceneLoadToken();
        resetPendingChanges();
        set((s) => clearedStageState(s));
        log12.info("Store cleared");
      }
    }));
    useStageStore = createSelectors(useStageStoreBase);
    MAX_FLUSH_DRAIN_ROUNDS = 20;
    if (typeof window !== "undefined") {
      const kickPendingSave = () => {
        void flushStageSave().catch(() => {
        });
      };
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") kickPendingSave();
      });
      window.addEventListener("beforeunload", kickPendingSave);
    }
  }
});

// OpenMAIC/lib/api/stage-api.ts
function persistenceChangesForSetState(before, after) {
  const changes = [];
  if (before.stage !== after.stage) changes.push({ kind: "stage" });
  if (before.currentSceneId !== after.currentSceneId) changes.push({ kind: "currentScene" });
  if (before.scenes !== after.scenes) {
    const beforeStructure = before.scenes.map(({ id, order }) => [id, order]);
    const afterStructure = after.scenes.map(({ id, order }) => [id, order]);
    const structureChanged = beforeStructure.length !== afterStructure.length || beforeStructure.some(
      ([id, order], index) => afterStructure[index]?.[0] !== id || afterStructure[index]?.[1] !== order
    );
    if (structureChanged) {
      changes.push({ kind: "structure" });
    } else {
      before.scenes.forEach((scene, index) => {
        if (scene !== after.scenes[index]) changes.push({ kind: "scene", sceneId: scene.id });
      });
    }
  }
  return changes;
}
function withProductionPersistence(store2) {
  if (store2 !== useStageStore) return store2;
  return {
    ...store2,
    setState(partial) {
      const before = store2.getState();
      store2.setState(partial);
      const changes = persistenceChangesForSetState(before, store2.getState());
      if (changes.length > 0) markStagePersistenceDirty(changes);
    }
  };
}
function createStageAPI(store2) {
  const persistenceStore = withProductionPersistence(store2);
  return {
    scene: createSceneAPI(persistenceStore),
    navigation: createNavigationAPI(persistenceStore),
    element: createElementAPI(persistenceStore),
    canvas: createCanvasAPI(persistenceStore),
    whiteboard: createWhiteboardAPI(persistenceStore),
    mode: createModeAPI(persistenceStore),
    stage: createStageMetaAPI(persistenceStore)
  };
}
var init_stage_api = __esm({
  "OpenMAIC/lib/api/stage-api.ts"() {
    "use strict";
    init_stage_api_defaults();
    init_stage_api_scene();
    init_stage_api_element();
    init_stage_api_canvas();
    init_stage_api_navigation();
    init_stage_api_whiteboard();
    init_stage_api_mode();
    init_stage2();
  }
});

// OpenMAIC/lib/pbl/v2/agents/planner.ts
import { tool, stepCountIs } from "ai";
import { z } from "zod";
import { normalizeProjectRuntime, normalizeScenario } from "@openmaic/generation";
import {
  SCENARIO_SCHEMA_VERSION,
  PlannerV2Error,
  emptyProject,
  buildPlannerSystemPrompt,
  newId,
  instructorProjectAnchor,
  applyPlannerProficiency,
  normalizeSynthesisChecks,
  plannerCompletionGaps
} from "@openmaic/generation";
async function generatePBLV2Project(input, model, callLLM2, callbacks, thinkingConfig) {
  const pblConfig = input.outline.pblConfig;
  if (!pblConfig) {
    throw new PlannerV2Error(
      "Planner v2 invoked on an outline without pblConfig \u2014 this is a generation pipeline bug.",
      emptyProject(input)
    );
  }
  const project = emptyProject(input);
  const scenarioRoleplay = pblConfig.scenarioRoleplay === true;
  const contentLanguage = project.languageDirective || "Match the language of the outline content above.";
  const systemPrompt = await buildPlannerSystemPrompt(
    input,
    project.proficiency,
    contentLanguage,
    scenarioRoleplay
  );
  const tools = buildTools(project, input, scenarioRoleplay, callbacks);
  log13.info(
    `Starting Planner v2: topic="${pblConfig.projectTopic}", proficiency="${input.outline.pblConfig?.issueCount ?? "?"} milestones suggested"`
  );
  await callLLM2(
    {
      model,
      system: systemPrompt,
      prompt: "Design the PBL project now. Call the tools in the documented order; do not write narrative text.",
      tools,
      stopWhen: [plannerDesignAccepted(), stepCountIs(MAX_PLANNER_STEPS)],
      onStepFinish: ({ toolCalls }) => {
        if (toolCalls?.length) {
          for (const tc of toolCalls) {
            log13.debug(`tool call: ${tc.toolName}`);
          }
        }
      }
    },
    "pbl-v2-planner",
    void 0,
    thinkingConfig
  );
  normalizeProjectRuntime(project);
  normalizeSynthesisChecks(project);
  validateProject(project, scenarioRoleplay);
  normalizeScenario(project);
  log13.info(
    `Planner v2 done: ${project.milestones.length} milestones, ${project.milestones.reduce(
      (acc, m) => acc + m.microtasks.length,
      0
    )} microtasks, ${project.roles.length} roles.`
  );
  return project;
}
function buildTools(project, input, scenarioRoleplay, callbacks) {
  let projectInfoSet = false;
  let instructorRoleAdded = false;
  let milestoneIndex = 0;
  let scenarioSet = false;
  const milestoneScenarioStageField = scenarioRoleplay ? {
    scenarioStage: z.enum(["prep", "roleplay", "wrapup"]).optional().describe(
      "SCENARIO ONLY. The milestone's role in the fixed three-stage skeleton: 'prep' = FIRST milestone (Instructor introduces the premise + cast, no assessment); 'roleplay' = an immersive role-play stage (one or more, in the middle); 'wrapup' = LAST milestone (Instructor light feedback). Order MUST be prep \u2192 roleplay(s) \u2192 wrapup."
    )
  } : {};
  const microtaskSceneFields = scenarioRoleplay ? {
    completionCriteria: z.string().optional().describe(
      "SCENARIO ONLY (scene beats). A concrete, observable condition that advances this beat. Only for microtasks under a `scenarioStage:'roleplay'` milestone."
    ),
    successWhen: z.string().optional().describe(
      `SCENARIO ONLY (scene beats). The CONCRETE, OBSERVABLE in-scene action the learner must SAY or DO for this beat to count as done \u2014 the scenario's "deliverable" (e.g. "\u4E0B\u6CE8\u3001\u52A0\u6CE8\u6216\u5F03\u724C" / "\u5BF9\u5BF9\u65B9\u7684\u611F\u53D7\u505A\u51FA\u5171\u60C5\u56DE\u5E94\uFF0C\u5E76\u95EE\u4E00\u4E2A\u8DDF\u8FDB\u95EE\u9898"). Plain scene terms, NOT a teaching goal. This is what the advance detector watches, so small-talk / off-topic turns do NOT advance. Author one for EVERY roleplay beat.`
    ),
    characterObjective: z.string().optional().describe(
      'SCENARIO ONLY (scene beats). What the character PRIVATELY wants this beat \u2014 their in-scene drive (e.g. "\u8BD5\u63A2\u5BF9\u65B9\u662F\u5426\u5728\u865A\u5F20\u58F0\u52BF" / "\u60F3\u77E5\u9053\u4F60\u662F\u5426\u771F\u7684\u5728\u4E4E"). Gives the character a goal to pursue in character. NEVER narrated, evaluated, or coached. Recommended for every roleplay beat.'
    ),
    skillFocus: z.string().optional().describe(
      'SCENARIO ONLY (scene beats). The single skill this beat practises (e.g. "\u5E95\u6C60\u8D54\u7387\u5224\u65AD" / "\u79EF\u6781\u503E\u542C"). Surfaced to the learner (current-task panel + end-of-project per-act review); never spoken by the character.'
    ),
    narration: z.string().optional().describe(
      'SCENARIO ONLY (scene beats). Neutral system narration shown when this beat opens (e.g. "you walk into a quiet caf\xE9"). Not spoken by a character or the Instructor. Omit if no narration.'
    )
  } : {};
  const baseTools = {
    /** Set the top-level project info. Must be called exactly once
     *  before any other tool. */
    set_project_info: tool({
      description: `Set the project title, description, learning objective, learner gains, and proficiency tier. Call this exactly once, before any other tool. ALL TEXT FIELDS must be written in the project language declared in the system prompt (Hard rule 1), and title/description/learningObjective/gains must derive directly from the outline's project topic \u2014 do NOT substitute a different "common teaching project" from your training data.`,
      inputSchema: z.object({
        title: z.string().min(1).describe(
          "Concise, memorable project title \u2014 IN THE PROJECT LANGUAGE; must match the outline.pblConfig.projectTopic theme exactly (no topic substitution)."
        ),
        description: z.string().min(1).describe(
          "2-4 sentence description of what the student will build \u2014 IN THE PROJECT LANGUAGE; must be about the outline.pblConfig.projectTopic, not a different example project."
        ),
        learningObjective: z.string().describe(
          "The specific verb/skill the student will master, IN THE PROJECT LANGUAGE. Distinct from `description` (which is what they BUILD)."
        ),
        gains: z.array(z.string().min(1)).min(3).max(5).describe(
          'A SHORT list (3-5) of learner-facing "what you\'ll gain" statements shown on the project Hero, IN THE PROJECT LANGUAGE. Each names ONE ability, awareness, or piece of knowledge the learner BUILDS by working through the project \u2014 what they take away and can do afterwards \u2014 NOT the final deliverable/result the project produces (that is `description`). Write each as a readable competency phrase, typically by expanding one terse outline targetSkill into plain language (e.g. for \u535A\u5F08\u8BBA: "\u7406\u89E3\u7EB3\u4EC0\u5747\u8861\u7684\u542B\u4E49\u5E76\u80FD\u5728\u5177\u4F53\u573A\u666F\u4E2D\u6C42\u89E3", "\u5B66\u4F1A\u7528\u6536\u76CA\u77E9\u9635\u523B\u753B\u53CC\u65B9\u7B56\u7565\u4E0E\u6536\u76CA", "\u57F9\u517B\u628A\u73B0\u5B9E\u51B2\u7A81\u62BD\u8C61\u6210\u535A\u5F08\u6A21\u578B\u7684\u5EFA\u6A21\u610F\u8BC6"). NOT a task title, NOT a single terse keyword, NOT the project\'s end product. They must match THIS project.'
        ),
        proficiency: z.enum(["beginner", "intermediate", "advanced"]).describe("Inferred from outline context: how much prior knowledge to assume.")
      }),
      execute: async ({ title, description, learningObjective, gains, proficiency }) => {
        if (projectInfoSet) {
          return {
            ok: false,
            error: "set_project_info was already called; it must only fire once."
          };
        }
        project.title = title;
        project.description = description;
        project.learningObjective = learningObjective;
        project.gains = gains;
        const explicitTierLocked = project.proficiencyAssessment?.signals[0]?.kind === "user_level_explicit";
        if (explicitTierLocked && proficiency !== project.proficiencyAssessment.tier) {
          return {
            ok: false,
            error: `The learner explicitly stated their level as ${project.proficiencyAssessment.tier}. Call set_project_info again with proficiency="${project.proficiencyAssessment.tier}".`
          };
        }
        applyPlannerProficiency(project, proficiency);
        project.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
        projectInfoSet = true;
        callbacks?.onProgress?.({ kind: "project_info", title });
        return { ok: true, title };
      }
    }),
    /** Add a role. The product currently ships a single Instructor.
     *  The tool refuses any other role type at the boundary so the v2
     *  project never gets half-populated with un-wired roles. */
    add_role: tool({
      description: "Add a role for the project. Call exactly once with type=instructor. Do not create any other role type.",
      inputSchema: z.object({
        type: z.enum(["instructor", "user"]),
        name: z.string().min(1),
        description: z.string().optional().describe(
          "SHORT learner-facing intro shown as a hover tooltip on the instructor's avatar. 2-3 short sentences MAX, in the project language, written TO the learner: who the guide is (use the name), that they accompany you through the whole project and each task, that you can ask them anything anytime, and that they give feedback / check your understanding along the way. Keep it warm and specific to THIS project. Do NOT expose internal mechanics (reading history, tool calls, evaluation / scoring, advancing tasks) \u2014 only what is meaningful and reassuring to a learner."
        ),
        systemPrompt: z.string().optional()
      }),
      execute: async ({ type, name, description, systemPrompt }) => {
        if (!projectInfoSet) {
          return {
            ok: false,
            error: "Call set_project_info first."
          };
        }
        if (type === "instructor" && instructorRoleAdded) {
          return {
            ok: false,
            error: "Instructor role already exists; only one Instructor allowed."
          };
        }
        if (type !== "instructor") {
          return {
            ok: false,
            error: `Role type "${type}" is not supported. Only type=instructor is accepted.`
          };
        }
        const anchoredSystemPrompt = [systemPrompt, instructorProjectAnchor(project)].filter(Boolean).join("\n\n");
        const role = {
          id: newId("role"),
          type,
          name,
          description,
          systemPrompt: anchoredSystemPrompt
        };
        project.roles.push(role);
        project.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
        instructorRoleAdded = true;
        callbacks?.onProgress?.({ kind: "role", roleType: type, name });
        return { ok: true, roleId: role.id };
      }
    }),
    /** Add a milestone. Returns its ID for use in add_microtask.
     *  The first milestone added becomes ACTIVE so the
     *  student lands in a runnable state. */
    add_milestone: tool({
      description: "Add a milestone (major phase). Provide a title, short description, and the three Instructor scripts: briefing, completionCriteria, debrief.",
      inputSchema: z.object({
        title: z.string().min(1),
        description: z.string().min(1),
        briefing: z.string().min(1).describe(
          "Written in Instructor voice, second person \u2014 what the Instructor will say at the start of this milestone."
        ),
        completionCriteria: z.string().min(1).describe("How the Instructor will know the student is done with this milestone."),
        debrief: z.string().min(1).describe(
          "Written in Instructor voice \u2014 what the Instructor will say at the end of this milestone."
        ),
        coreConcept: z.string().optional().describe(
          `Set this ONLY for the 1-2 stages that carry the project's CORE knowledge point. A short description (in the project language) of the central concept this stage teaches \u2014 e.g. "\u4E3A\u4EC0\u4E48\u5FAA\u73AF\u80FD\u907F\u514D\u91CD\u590D\u4EE3\u7801". When set, the Instructor runs ONE integrative reverse-question about this concept at the end of the stage. Leave UNSET for ordinary / setup / polish stages so learners are not over-questioned. (For SCENARIO projects, never set this \u2014 see scenario mode.)`
        ),
        ...milestoneScenarioStageField
      }),
      execute: async (args) => {
        if (!instructorRoleAdded) {
          return {
            ok: false,
            error: "Call add_role for the Instructor before adding milestones."
          };
        }
        const coreConcept = args.coreConcept?.trim();
        const scenarioStage = scenarioRoleplay ? args.scenarioStage : void 0;
        const milestone = {
          id: newId("ms"),
          title: args.title,
          description: args.description,
          status: project.milestones.length === 0 ? "active" : "locked",
          order: milestoneIndex++,
          microtasks: [],
          briefing: args.briefing,
          completionCriteria: args.completionCriteria,
          debrief: args.debrief,
          ...coreConcept ? { synthesisCheck: { coreConcept } } : {},
          ...scenarioStage ? { scenarioStage } : {}
        };
        project.milestones.push(milestone);
        project.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
        callbacks?.onProgress?.({
          kind: "milestone",
          title: args.title,
          index: milestone.order
        });
        return { ok: true, milestoneId: milestone.id };
      }
    }),
    /** Add a microtask under a milestone. Order is auto-assigned
     *  unless `order` is given. */
    add_microtask: tool({
      description: "Add a microtask under a milestone. Each microtask must be specific and actionable.",
      inputSchema: z.object({
        milestoneId: z.string().min(1),
        title: z.string().min(1),
        description: z.string().optional(),
        hints: z.array(z.string()).max(5).optional().describe("1-3 concrete hints the Instructor can offer."),
        order: z.number().int().nonnegative().optional().describe("Position within the milestone. Auto-assigned if absent."),
        ...microtaskSceneFields
      }),
      execute: async (args) => {
        const milestone = project.milestones.find((m) => m.id === args.milestoneId);
        if (!milestone) {
          return {
            ok: false,
            error: `Milestone "${args.milestoneId}" not found. Call add_milestone first.`
          };
        }
        const order = args.order ?? milestone.microtasks.length;
        const sceneArgs = args;
        const beatCriteria = scenarioRoleplay ? sceneArgs.completionCriteria?.trim() : void 0;
        const beatSuccessWhen = scenarioRoleplay ? sceneArgs.successWhen?.trim() : void 0;
        const beatObjective = scenarioRoleplay ? sceneArgs.characterObjective?.trim() : void 0;
        const beatSkill = scenarioRoleplay ? sceneArgs.skillFocus?.trim() : void 0;
        const beatNarration = scenarioRoleplay ? sceneArgs.narration?.trim() : void 0;
        const microtask = {
          id: newId("mt"),
          title: args.title,
          description: args.description,
          status: "todo",
          // Collaborator was removed from the product — every microtask
          // is learner-owned.
          assignee: "user",
          hints: args.hints ?? [],
          order,
          ...beatCriteria ? { completionCriteria: beatCriteria } : {},
          ...beatSuccessWhen ? { successWhen: beatSuccessWhen } : {},
          ...beatObjective ? { characterObjective: beatObjective } : {},
          ...beatSkill ? { skillFocus: beatSkill } : {},
          ...beatNarration ? { narration: beatNarration } : {}
        };
        milestone.microtasks.push(microtask);
        project.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
        callbacks?.onProgress?.({
          kind: "microtask",
          milestoneTitle: milestone.title,
          title: args.title,
          index: order
        });
        return { ok: true, microtaskId: microtask.id };
      }
    }),
    /** Signal that design is complete. The Planner *must* call this
     *  at the very end. We validate here before the SDK loop is
     *  allowed to stop, so an early / partial completion attempt is
     *  rejected and fed back to the model as concrete gaps instead of
     *  falling out to the v1 generator. */
    mark_design_complete: tool({
      description: "Call this exactly once at the very end, after every milestone, microtask, and role has been added. Signals the design is complete.",
      inputSchema: z.object({}),
      execute: async () => {
        const gaps = plannerCompletionGaps(project, { scenarioRoleplay });
        if (gaps.length > 0) {
          return {
            ok: false,
            gaps,
            nextAction: plannerCompletionNextAction(project, { scenarioRoleplay })
          };
        }
        const instructor = project.roles.find((r) => r.type === "instructor");
        if (instructor && !project.threads.some((t) => t.agentId === instructor.id)) {
          project.threads.push({
            agentId: instructor.id,
            messages: []
          });
        }
        project.status = "active";
        project.uiPhase = "hero";
        project.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
        const microtaskCount = project.milestones.reduce((acc, m) => acc + m.microtasks.length, 0);
        callbacks?.onProgress?.({
          kind: "complete",
          milestoneCount: project.milestones.length,
          microtaskCount
        });
        return { ok: true };
      }
    })
  };
  if (!scenarioRoleplay) return baseTools;
  const set_scenario = tool({
    description: "SCENARIO ONLY. Define the role-play scenario: the concrete premise (setting), optional learning goal, optional rules + learner role, and the cast. Call exactly once, right after set_project_info and before any add_milestone. Required for scenario projects.",
    inputSchema: z.object({
      setting: z.string().min(1).describe("The concrete overall premise / what is going on, in the project language."),
      goal: z.string().optional().describe("What the learner is practising (used by wrapup / completion page)."),
      rules: z.string().optional().describe(
        "Rules / structure the learner must be told before the scene (games / interviews / debates). Omit for free emotional scenarios."
      ),
      learnerRole: z.string().optional().describe(
        `The learner's OWN role / position (e.g. "you are their close friend" / "you are the 5th player, on the button").`
      ),
      characters: z.array(
        z.object({
          name: z.string().min(1).describe("Character name, in the project language."),
          persona: z.string().min(1).describe(
            "Stable identity / relationship to the learner / personality / speaking style. In the project language."
          ),
          situation: z.string().min(1).describe(
            `This character's CONCRETE current circumstance the learner faces (e.g. "just broke up, low mood, says they're fine but aren't"; game: "sits under-the-gun, plays tight"). In the project language. Required \u2014 it is the premise the Instructor introduces and is shown to the learner up front. Include ONLY what the learner knows/sees at the start; never put in here a fact a later roleplay beat is meant to make them discover (put that in that beat's characterObjective).`
          ),
          boundaries: z.string().optional().describe(
            "Hard safety rails: what the character must never say or do. Strongly recommended."
          ),
          openingLine: z.string().optional().describe("The character's first line when the scene opens (optional).")
        })
      ).min(1).describe(
        "The cast \u2014 EXACTLY ONE character (this version voices a single counterpart throughout)."
      )
    }),
    execute: async (args) => {
      if (!projectInfoSet) {
        return { ok: false, error: "Call set_project_info first." };
      }
      if (scenarioSet) {
        return {
          ok: false,
          error: "set_scenario was already called; it must only fire once."
        };
      }
      const scenario = {
        setting: args.setting,
        ...args.goal?.trim() ? { goal: args.goal.trim() } : {},
        ...args.rules?.trim() ? { rules: args.rules.trim() } : {},
        ...args.learnerRole?.trim() ? { learnerRole: args.learnerRole.trim() } : {},
        // HARD CONSTRAINT: single character only (runtime voices characters[0]).
        // Deterministically keep the first even if the model produced more.
        characters: args.characters.slice(0, 1).map((c) => ({
          id: newId("char"),
          name: c.name,
          persona: c.persona,
          ...c.situation?.trim() ? { situation: c.situation.trim() } : {},
          ...c.boundaries?.trim() ? { boundaries: c.boundaries.trim() } : {},
          ...c.openingLine?.trim() ? { openingLine: c.openingLine.trim() } : {}
        }))
      };
      project.scenario = scenario;
      project.schemaVersion = SCENARIO_SCHEMA_VERSION;
      project.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
      scenarioSet = true;
      return { ok: true, characterCount: scenario.characters.length };
    }
  });
  const set_scene_visual = tool({
    description: "SCENARIO ONLY. Define ONE project-wide scene VISUAL for the role-play entrance animation + banner. Call ONCE, AFTER you have authored every roleplay milestone/beat, basing it on an understanding of ALL of them so it fits the WHOLE project \u2014 a single shared place/atmosphere that suits every roleplay stage (never just one stage). Purely cosmetic.",
    inputSchema: z.object({
      caption: z.string().min(1).describe(
        'A short scene phrase IN THE PROJECT LANGUAGE that fits ALL roleplay stages \u2014 the shared place/atmosphere (e.g. "\u6DF1\u591C\uFF0C\u5404\u81EA\u623F\u95F4\u9694\u7740\u624B\u673A\u804A\u5230\u5929\u4EAE" / "\u51B3\u8D5B\u8FA9\u8BBA\u8D5B\u573A" / "\u724C\u684C\u73B0\u91D1\u5C40"). Keep it under ~16 words. Derive it from the actual stages/tasks, not a guessed category.'
      ),
      bg1: z.string().describe('Background gradient TOP colour as a hex code (e.g. "#3a2740").'),
      bg2: z.string().describe("Background gradient BOTTOM colour as a hex code."),
      accent: z.string().describe("Accent colour (hex) for glows / motifs; must read clearly on the background."),
      motifs: z.array(z.string()).min(1).max(4).describe(
        '2\u20134 EMOJI that evoke THIS exact scene (e.g. ["\u{1F4F1}","\u{1F319}","\u{1F6CF}\uFE0F"] for a late-night phone chat; ["\u{1F0CF}","\u2660\uFE0F","\u{1FA99}"] for poker; ["\u{1F3A4}","\u{1F4E3}"] for a debate). Choose the ones that best fit this project, not a generic set.'
      )
    }),
    execute: async (args) => {
      if (!project.scenario) {
        return { ok: false, error: "Call set_scenario before set_scene_visual." };
      }
      const hex = (s) => s && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(s.trim()) ? s.trim() : void 0;
      const motifs = (args.motifs ?? []).map((m) => m.trim()).filter(Boolean).slice(0, 4);
      project.scenario.sceneVisual = {
        ...args.caption?.trim() ? { caption: args.caption.trim() } : {},
        ...hex(args.bg1) ? { bg1: hex(args.bg1) } : {},
        ...hex(args.bg2) ? { bg2: hex(args.bg2) } : {},
        ...hex(args.accent) ? { accent: hex(args.accent) } : {},
        ...motifs.length ? { motifs } : {}
      };
      project.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
      return { ok: true };
    }
  });
  return { ...baseTools, set_scenario, set_scene_visual };
}
function plannerCompletionNextAction(project, opts) {
  if (!project.title || !project.description) {
    return "Call set_project_info with the requested project topic, description, and learning objective.";
  }
  if (opts?.scenarioRoleplay && !project.scenario) {
    return "Call set_scenario with the setting and at least one character (name + persona + situation) before adding milestones.";
  }
  if (!project.roles.some((r) => r.type === "instructor")) {
    return 'Call add_role with type="instructor" before adding milestones.';
  }
  if (project.milestones.length === 0) {
    return "Call add_milestone to create the first project phase.";
  }
  const milestoneWithoutTasks = project.milestones.find((m) => m.microtasks.length === 0);
  if (milestoneWithoutTasks) {
    return `Call add_microtask for milestoneId="${milestoneWithoutTasks.id}" before trying mark_design_complete again.`;
  }
  if (opts?.scenarioRoleplay) {
    const stages = project.milestones.map((m) => m.scenarioStage);
    if (stages[0] !== "prep") {
      return 'Make the FIRST milestone scenarioStage:"prep" (Instructor introduces the premise + cast, one light microtask, no assessment).';
    }
    if (!stages.includes("roleplay")) {
      return 'Add at least one scenarioStage:"roleplay" milestone (the immersive role-play) before the wrapup.';
    }
    if (stages[stages.length - 1] !== "wrapup") {
      return 'Make the LAST milestone scenarioStage:"wrapup" (Instructor light feedback, one light microtask).';
    }
  }
  return "Fix the reported gaps, then call mark_design_complete again.";
}
function isAcceptedPlannerCompletion(output) {
  return typeof output === "object" && output !== null && "ok" in output && output.ok === true;
}
function plannerStepHasAcceptedCompletion(step) {
  return step.toolResults.some(
    (result) => result.toolName === "mark_design_complete" && isAcceptedPlannerCompletion(result.output)
  );
}
function plannerDesignAccepted() {
  return ({ steps }) => steps.some(plannerStepHasAcceptedCompletion);
}
function validateProject(project, scenarioRoleplay = false) {
  const errors = plannerCompletionGaps(project, { scenarioRoleplay });
  if (errors.length > 0) {
    throw new PlannerV2Error(`Planner v2 output failed validation: ${errors.join("; ")}`, project);
  }
}
var log13, MAX_PLANNER_STEPS;
var init_planner = __esm({
  "OpenMAIC/lib/pbl/v2/agents/planner.ts"() {
    "use strict";
    init_logger();
    log13 = createLogger("PBL v2 Planner");
    MAX_PLANNER_STEPS = 80;
  }
});

// OpenMAIC/lib/server/scene-generation.ts
import {
  applyOutlineFallbacks,
  buildCompleteScene,
  buildLanguageText,
  generateSceneActions,
  generateSceneContent
} from "@openmaic/generation";
function createSceneWithActions(outline, content, actions, api) {
  const scene = buildCompleteScene(outline, content, actions, "");
  if (!scene) return null;
  const result = api.scene.create({
    type: scene.type,
    title: scene.title,
    order: scene.order,
    // The package's PBL contract is runtime-compatible with the app overlay;
    // the app type retains stronger learner-state field types.
    content: scene.content,
    actions: scene.actions,
    outlineId: scene.outlineId
  });
  return result.success ? result.data ?? null : null;
}
var log14;
var init_scene_generation = __esm({
  "OpenMAIC/lib/server/scene-generation.ts"() {
    "use strict";
    init_llm();
    init_logger();
    init_planner();
    log14 = createLogger("Generation");
  }
});

// OpenMAIC/lib/server/provider-config.ts
import fs2 from "fs";
import path2 from "path";
import yaml from "js-yaml";
function loadYamlFile(filename) {
  try {
    const filePath = path2.join(process.cwd(), filename);
    if (!fs2.existsSync(filePath)) return {};
    const raw = fs2.readFileSync(filePath, "utf-8");
    const parsed = yaml.load(raw);
    if (!parsed || typeof parsed !== "object") return {};
    return parsed;
  } catch (e) {
    log15.warn(`[ServerProviderConfig] Failed to load ${filename}:`, e);
    return {};
  }
}
function normalizeModelList(models) {
  const parsed = models?.map((model) => model.trim()).filter(Boolean);
  return parsed && parsed.length > 0 ? parsed : void 0;
}
function loadEnvSection(envMap, yamlSection, {
  requiresBaseUrl = false,
  keylessProviders = /* @__PURE__ */ new Set(),
  baseUrlOptionalProviders = /* @__PURE__ */ new Set()
} = {}) {
  const result = {};
  const requiresBaseUrlForProvider = (providerId) => requiresBaseUrl && !baseUrlOptionalProviders.has(providerId);
  if (yamlSection) {
    for (const [id, entry] of Object.entries(yamlSection)) {
      if (requiresBaseUrlForProvider(id) ? !!entry?.baseUrl : entry?.apiKey || entry?.baseUrl && keylessProviders.has(id)) {
        result[id] = {
          apiKey: entry.apiKey || "",
          baseUrl: entry.baseUrl,
          models: normalizeModelList(entry.models),
          proxy: entry.proxy
        };
      }
    }
  }
  for (const [prefix, providerId] of Object.entries(envMap)) {
    const envApiKey = process.env[`${prefix}_API_KEY`] || void 0;
    const envBaseUrl = process.env[`${prefix}_BASE_URL`] || void 0;
    const envModelsStr = process.env[`${prefix}_MODELS`];
    const envModels = envModelsStr ? envModelsStr.split(",").map((m) => m.trim()).filter(Boolean) : void 0;
    if (result[providerId]) {
      if (envApiKey) result[providerId].apiKey = envApiKey;
      if (envBaseUrl) result[providerId].baseUrl = envBaseUrl;
      if (envModels) result[providerId].models = envModels;
      continue;
    }
    if (requiresBaseUrlForProvider(providerId) ? !envBaseUrl : !(envApiKey || envBaseUrl && keylessProviders.has(providerId)))
      continue;
    result[providerId] = {
      apiKey: envApiKey || "",
      baseUrl: envBaseUrl,
      models: envModels
    };
  }
  return result;
}
function parseBooleanEnv(raw) {
  return !/^(false|0|no|off)$/i.test(raw.trim());
}
function collectDisabledProviders(yamlData) {
  const disabled = {
    tts: /* @__PURE__ */ new Set(),
    asr: /* @__PURE__ */ new Set(),
    image: /* @__PURE__ */ new Set(),
    video: /* @__PURE__ */ new Set(),
    webSearch: /* @__PURE__ */ new Set()
  };
  for (const section of Object.keys(DISABLE_ENV_MAPS)) {
    const yamlSection = yamlData[YAML_SECTION_KEY[section]];
    if (yamlSection) {
      for (const [id, entry] of Object.entries(yamlSection)) {
        if (entry?.enabled === false) disabled[section].add(id);
      }
    }
    for (const [prefix, providerId] of Object.entries(DISABLE_ENV_MAPS[section])) {
      const raw = process.env[`${prefix}_ENABLED`];
      if (raw === void 0 || raw.trim() === "") continue;
      if (parseBooleanEnv(raw)) disabled[section].delete(providerId);
      else disabled[section].add(providerId);
    }
  }
  return disabled;
}
function applyAliDocMindFallback(pdfConfig, yamlPdfSection) {
  const yamlEntry = yamlPdfSection?.[ALIDOCMIND_PROVIDER_ID];
  const accessKeyId = process.env.ALIDOCMIND_ACCESS_KEY_ID || yamlEntry?.accessKeyId;
  const accessKeySecret = process.env.ALIDOCMIND_ACCESS_KEY_SECRET || yamlEntry?.accessKeySecret;
  if (!accessKeyId || !accessKeySecret) {
    delete pdfConfig[ALIDOCMIND_PROVIDER_ID];
    return pdfConfig;
  }
  const existing = pdfConfig[ALIDOCMIND_PROVIDER_ID];
  pdfConfig[ALIDOCMIND_PROVIDER_ID] = {
    apiKey: existing?.apiKey ?? "",
    accessKeyId,
    accessKeySecret,
    baseUrl: existing?.baseUrl || yamlEntry?.baseUrl || process.env.ALIDOCMIND_BASE_URL || void 0,
    models: existing?.models,
    proxy: existing?.proxy
  };
  return pdfConfig;
}
function applyOpenAIImageFallback(imageConfig, yamlImageSection) {
  if (imageConfig[OPENAI_IMAGE_PROVIDER_ID]) return imageConfig;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return imageConfig;
  const yamlOpenAIImage = yamlImageSection?.[OPENAI_IMAGE_PROVIDER_ID];
  imageConfig[OPENAI_IMAGE_PROVIDER_ID] = {
    apiKey,
    baseUrl: yamlOpenAIImage?.baseUrl || process.env.IMAGE_OPENAI_BASE_URL || process.env.OPENAI_BASE_URL,
    models: yamlOpenAIImage?.models,
    proxy: yamlOpenAIImage?.proxy
  };
  return imageConfig;
}
function splitModels(models) {
  const parsed = models?.split(",").map((model) => model.trim()).filter(Boolean);
  return parsed && parsed.length > 0 ? parsed : void 0;
}
function applyBedrockProviderConfig(providers, yamlProviders) {
  const yamlBedrock = yamlProviders?.[BEDROCK_PROVIDER_ID];
  const envApiKey = process.env.BEDROCK_API_KEY || void 0;
  const envBaseUrl = process.env.BEDROCK_BASE_URL || void 0;
  const envRegion = process.env.BEDROCK_REGION?.trim() || void 0;
  const envModels = splitModels(process.env.BEDROCK_MODELS);
  const hasExplicitBedrockEnv = !!envRegion || !!envModels || !!envApiKey || !!envBaseUrl || !!process.env.AWS_BEARER_TOKEN_BEDROCK;
  const hasYamlBedrock = Object.prototype.hasOwnProperty.call(
    yamlProviders ?? {},
    BEDROCK_PROVIDER_ID
  );
  if (!providers[BEDROCK_PROVIDER_ID] && !hasExplicitBedrockEnv && !hasYamlBedrock) {
    return providers;
  }
  providers[BEDROCK_PROVIDER_ID] = {
    apiKey: envApiKey || yamlBedrock?.apiKey || providers[BEDROCK_PROVIDER_ID]?.apiKey || "",
    baseUrl: envBaseUrl || yamlBedrock?.baseUrl || providers[BEDROCK_PROVIDER_ID]?.baseUrl,
    models: envModels || yamlBedrock?.models || providers[BEDROCK_PROVIDER_ID]?.models,
    proxy: yamlBedrock?.proxy || providers[BEDROCK_PROVIDER_ID]?.proxy
  };
  return providers;
}
function buildConfig(yamlData) {
  const image = applyOpenAIImageFallback(
    loadEnvSection(IMAGE_ENV_MAP, yamlData.image, {
      keylessProviders: /* @__PURE__ */ new Set(["lemonade"])
    }),
    yamlData.image
  );
  const providers = applyBedrockProviderConfig(
    loadEnvSection(LLM_ENV_MAP, yamlData.providers, {
      keylessProviders: /* @__PURE__ */ new Set(["ollama", "lemonade", BEDROCK_PROVIDER_ID])
    }),
    yamlData.providers
  );
  return {
    providers,
    tts: loadEnvSection(TTS_ENV_MAP, yamlData.tts, {
      keylessProviders: /* @__PURE__ */ new Set(["voxcpm-tts", "lemonade-tts"])
    }),
    asr: loadEnvSection(ASR_ENV_MAP, yamlData.asr, {
      keylessProviders: /* @__PURE__ */ new Set(["funasr-asr", "lemonade-asr"])
    }),
    pdf: applyAliDocMindFallback(
      loadEnvSection(PDF_ENV_MAP, yamlData.pdf, {
        requiresBaseUrl: true,
        baseUrlOptionalProviders: /* @__PURE__ */ new Set(["mineru-cloud"])
      }),
      yamlData.pdf
    ),
    image,
    video: loadEnvSection(VIDEO_ENV_MAP, yamlData.video),
    webSearch: loadEnvSection(WEB_SEARCH_ENV_MAP, yamlData["web-search"], {
      keylessProviders: /* @__PURE__ */ new Set(["brave", "searxng"])
    }),
    disabled: collectDisabledProviders(yamlData)
  };
}
function logConfig(config, label) {
  const counts = [
    Object.keys(config.providers).length,
    Object.keys(config.tts).length,
    Object.keys(config.asr).length,
    Object.keys(config.pdf).length,
    Object.keys(config.image).length,
    Object.keys(config.video).length,
    Object.keys(config.webSearch).length
  ];
  if (counts.some((c) => c > 0)) {
    log15.info(
      `[ServerProviderConfig] Loaded (${label}): ${counts[0]} LLM, ${counts[1]} TTS, ${counts[2]} ASR, ${counts[3]} PDF, ${counts[4]} Image, ${counts[5]} Video, ${counts[6]} WebSearch providers`
    );
  }
}
function getConfig() {
  const cached = _configs.get("");
  if (cached) return cached;
  const yamlData = loadYamlFile(DEFAULT_FILENAME);
  const config = buildConfig(yamlData);
  logConfig(config, DEFAULT_FILENAME);
  _configs.set("", config);
  return config;
}
function isServerConfiguredProvider(section, providerId) {
  return !!getConfig()[section][providerId];
}
function isServerProviderDisabled(section, providerId) {
  return getConfig().disabled[section].has(providerId);
}
function resolveSectionApiKey(section, providerId, clientKey) {
  const entry = getConfig()[section][providerId];
  if (entry) return entry.apiKey || "";
  return clientKey || "";
}
function resolveSectionBaseUrl(section, providerId, clientBaseUrl) {
  const entry = getConfig()[section][providerId];
  if (entry) return entry.baseUrl;
  return clientBaseUrl;
}
function resolveApiKey(providerId, clientKey) {
  return resolveSectionApiKey("providers", providerId, clientKey);
}
function resolveBaseUrl(providerId, clientBaseUrl) {
  return resolveSectionBaseUrl("providers", providerId, clientBaseUrl);
}
function resolveProxy(providerId) {
  return getConfig().providers[providerId]?.proxy;
}
function getServerTTSProviders() {
  const cfg = getConfig();
  const result = {};
  for (const id of Object.keys(cfg.tts)) result[id] = {};
  for (const id of cfg.disabled.tts) result[id] = { disabled: true };
  return result;
}
function resolveTTSApiKey(providerId, clientKey) {
  return resolveSectionApiKey("tts", providerId, clientKey);
}
function resolveTTSBaseUrl(providerId, clientBaseUrl) {
  return resolveSectionBaseUrl("tts", providerId, clientBaseUrl) || TTS_PROVIDERS[providerId]?.defaultBaseUrl;
}
function getServerImageProviders() {
  const cfg = getConfig();
  const result = {};
  for (const [id, entry] of Object.entries(cfg.image)) {
    result[id] = {};
    if (entry.models && entry.models.length > 0) result[id].models = entry.models;
  }
  for (const id of cfg.disabled.image) result[id] = { disabled: true };
  return result;
}
function resolveImageApiKey(providerId, clientKey) {
  return resolveSectionApiKey("image", providerId, clientKey);
}
function resolveImageBaseUrl(providerId, clientBaseUrl) {
  return resolveSectionBaseUrl("image", providerId, clientBaseUrl);
}
function resolveImageModel(providerId, clientModel) {
  const serverModels = getConfig().image[providerId]?.models;
  if (serverModels?.length) {
    if (clientModel && serverModels.includes(clientModel)) return clientModel;
    return serverModels[0];
  }
  return clientModel;
}
function getServerVideoProviders() {
  const cfg = getConfig();
  const result = {};
  for (const [id, entry] of Object.entries(cfg.video)) {
    result[id] = {};
    if (entry.models && entry.models.length > 0) result[id].models = entry.models;
  }
  for (const id of cfg.disabled.video) result[id] = { disabled: true };
  return result;
}
function resolveVideoApiKey(providerId, clientKey) {
  return resolveSectionApiKey("video", providerId, clientKey);
}
function resolveVideoBaseUrl(providerId, clientBaseUrl) {
  return resolveSectionBaseUrl("video", providerId, clientBaseUrl);
}
function resolveVideoModel(providerId, clientModel) {
  const serverModels = getConfig().video[providerId]?.models;
  if (serverModels?.length) {
    if (clientModel && serverModels.includes(clientModel)) return clientModel;
    return serverModels[0];
  }
  return clientModel;
}
function resolveWebSearchApiKey(providerIdOrClientKey, clientKey) {
  const hasProviderId2 = arguments.length >= 2;
  const providerId = hasProviderId2 ? providerIdOrClientKey || "tavily" : "tavily";
  const effectiveClientKey = hasProviderId2 ? clientKey : providerIdOrClientKey;
  return resolveSectionApiKey("webSearch", providerId, effectiveClientKey);
}
function resolveWebSearchBaseUrl(providerId, clientBaseUrl) {
  return resolveSectionBaseUrl("webSearch", providerId, clientBaseUrl);
}
function resolveWebSearchModel(providerId, clientModel) {
  const entry = getConfig().webSearch[providerId];
  if (entry?.models && entry.models.length > 0) return entry.models[0];
  return clientModel;
}
function resolveServerWebSearchProviderId(preferredProviderId) {
  const webSearch = getConfig().webSearch;
  const disabled = getConfig().disabled.webSearch;
  const enabled = (id) => !disabled.has(id);
  if (preferredProviderId && enabled(preferredProviderId) && webSearch[preferredProviderId]?.apiKey) {
    return preferredProviderId;
  }
  if (enabled("tavily") && webSearch.tavily?.apiKey) return "tavily";
  if (enabled("exa") && webSearch.exa?.apiKey) return "exa";
  if (enabled("bocha") && webSearch.bocha?.apiKey) return "bocha";
  if (enabled("baidu") && webSearch.baidu?.apiKey) return "baidu";
  if (enabled("minimax") && webSearch.minimax?.apiKey) return "minimax";
  if (enabled("claude") && webSearch.claude?.apiKey) return "claude";
  return Object.keys(webSearch).find(enabled);
}
var log15, LLM_ENV_MAP, TTS_ENV_MAP, ASR_ENV_MAP, PDF_ENV_MAP, IMAGE_ENV_MAP, VIDEO_ENV_MAP, WEB_SEARCH_ENV_MAP, DISABLE_ENV_MAPS, YAML_SECTION_KEY, DEFAULT_FILENAME, OPENAI_IMAGE_PROVIDER_ID, ALIDOCMIND_PROVIDER_ID, BEDROCK_PROVIDER_ID, _configs;
var init_provider_config = __esm({
  "OpenMAIC/lib/server/provider-config.ts"() {
    "use strict";
    init_logger();
    init_constants();
    log15 = createLogger("ServerProviderConfig");
    LLM_ENV_MAP = {
      OPENAI: "openai",
      AZURE_OPENAI: "azure",
      ATLASCLOUD: "atlascloud",
      ANTHROPIC: "anthropic",
      GOOGLE: "google",
      DEEPSEEK: "deepseek",
      QWEN: "qwen",
      KIMI: "kimi",
      MINIMAX: "minimax",
      GLM: "glm",
      SILICONFLOW: "siliconflow",
      DOUBAO: "doubao",
      OPENROUTER: "openrouter",
      GROK: "grok",
      TENCENT: "tencent-hunyuan",
      TENCENT_HUNYUAN: "tencent-hunyuan",
      XIAOMI: "xiaomi",
      MIMO: "xiaomi",
      OLLAMA: "ollama",
      LEMONADE: "lemonade",
      BEDROCK: "bedrock"
    };
    TTS_ENV_MAP = {
      TTS_OPENAI: "openai-tts",
      TTS_AZURE: "azure-tts",
      TTS_GLM: "glm-tts",
      TTS_QWEN: "qwen-tts",
      TTS_VOXCPM: "voxcpm-tts",
      TTS_DOUBAO: "doubao-tts",
      TTS_ELEVENLABS: "elevenlabs-tts",
      TTS_MINIMAX: "minimax-tts",
      TTS_LEMONADE: "lemonade-tts"
    };
    ASR_ENV_MAP = {
      ASR_OPENAI: "openai-whisper",
      ASR_QWEN: "qwen-asr",
      ASR_AZURE: "azure-asr",
      ASR_FUNASR: "funasr-asr",
      ASR_LEMONADE: "lemonade-asr"
    };
    PDF_ENV_MAP = {
      PDF_UNPDF: "unpdf",
      PDF_MINERU: "mineru",
      PDF_MINERU_CLOUD: "mineru-cloud"
    };
    IMAGE_ENV_MAP = {
      IMAGE_OPENAI: "openai-image",
      IMAGE_SEEDREAM: "seedream",
      IMAGE_QWEN_IMAGE: "qwen-image",
      IMAGE_NANO_BANANA: "nano-banana",
      IMAGE_MINIMAX: "minimax-image",
      IMAGE_GROK: "grok-image",
      IMAGE_LEMONADE: "lemonade"
    };
    VIDEO_ENV_MAP = {
      VIDEO_SEEDANCE: "seedance",
      VIDEO_KLING: "kling",
      VIDEO_VEO: "veo",
      VIDEO_MINIMAX: "minimax-video",
      VIDEO_GROK: "grok-video",
      VIDEO_HAPPYHORSE: "happyhorse"
    };
    WEB_SEARCH_ENV_MAP = {
      TAVILY: "tavily",
      EXA: "exa",
      BOCHA: "bocha",
      BRAVE: "brave",
      BAIDU: "baidu",
      // WEB_SEARCH_ prefix avoids colliding with ANTHROPIC_* LLM provider vars.
      WEB_SEARCH_CLAUDE: "claude",
      WEB_SEARCH_MINIMAX: "minimax",
      // Dedicated prefix avoids colliding with the Doubao LLM provider vars.
      WEB_SEARCH_DOUBAO: "doubao",
      SEARXNG: "searxng"
    };
    DISABLE_ENV_MAPS = {
      tts: {
        ...TTS_ENV_MAP,
        TTS_BROWSER_NATIVE: "browser-native-tts"
      },
      asr: {
        ...ASR_ENV_MAP,
        ASR_BROWSER_NATIVE: "browser-native"
      },
      image: {
        ...IMAGE_ENV_MAP,
        // comfyui-image lives in the client-side catalog only (no credential env),
        // but operators may still want to force it off fleet-wide.
        IMAGE_COMFYUI: "comfyui-image"
      },
      video: { ...VIDEO_ENV_MAP },
      webSearch: { ...WEB_SEARCH_ENV_MAP }
    };
    YAML_SECTION_KEY = {
      tts: "tts",
      asr: "asr",
      image: "image",
      video: "video",
      webSearch: "web-search"
    };
    DEFAULT_FILENAME = "server-providers.yml";
    OPENAI_IMAGE_PROVIDER_ID = "openai-image";
    ALIDOCMIND_PROVIDER_ID = "alidocmind";
    BEDROCK_PROVIDER_ID = "bedrock";
    _configs = /* @__PURE__ */ new Map();
  }
});

// OpenMAIC/lib/server/web-search-config.ts
function normalizeBaseUrl4(value) {
  return value.replace(/\/+$/, "");
}
function assertWebSearchProviderId(providerId) {
  return !!providerId && providerId in WEB_SEARCH_PROVIDERS;
}
function resolveSafeClientWebSearchBaseUrl(providerId, clientBaseUrl) {
  const trimmed = clientBaseUrl?.trim();
  if (!trimmed) return void 0;
  let normalized;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new Error("Invalid protocol");
    }
    normalized = normalizeBaseUrl4(parsed.toString());
  } catch {
    throw new Error(`Unsupported ${WEB_SEARCH_PROVIDERS[providerId].name} base URL`);
  }
  const allowed = OFFICIAL_CLIENT_BASE_URLS[providerId].map(normalizeBaseUrl4);
  if (!allowed.includes(normalized)) {
    throw new Error(`Unsupported ${WEB_SEARCH_PROVIDERS[providerId].name} base URL`);
  }
  return normalized;
}
function resolveWebSearchRouteBaseUrl(providerId, clientBaseUrl) {
  const safeClientBaseUrl = resolveSafeClientWebSearchBaseUrl(providerId, clientBaseUrl);
  return resolveWebSearchBaseUrl(providerId, safeClientBaseUrl);
}
function resolveClassroomWebSearchConfig(input) {
  const requestedProviderId = assertWebSearchProviderId(input.webSearchProviderId) ? input.webSearchProviderId : void 0;
  const providerId = (requestedProviderId && !isServerProviderDisabled("webSearch", requestedProviderId) ? requestedProviderId : void 0) ?? resolveServerWebSearchProviderId();
  if (!providerId) return void 0;
  const provider = WEB_SEARCH_PROVIDERS[providerId];
  const apiKey = resolveWebSearchApiKey(providerId, input.webSearchApiKey);
  if (provider.requiresApiKey && !apiKey) return void 0;
  const managed = isServerConfiguredProvider("webSearch", providerId);
  const clientBaseUrl = managed || providerId === "searxng" ? void 0 : input.webSearchBaseUrl;
  const baseUrl = resolveWebSearchRouteBaseUrl(providerId, clientBaseUrl);
  if (provider.requiresBaseUrl && !baseUrl) return void 0;
  return {
    providerId,
    apiKey,
    baseUrl,
    ...providerId === "baidu" && input.baiduSubSources ? { baiduSubSources: input.baiduSubSources } : {},
    ...providerId === "claude" ? { claudeModelId: resolveWebSearchModel("claude", input.webSearchModelId) } : {}
  };
}
var OFFICIAL_CLIENT_BASE_URLS;
var init_web_search_config = __esm({
  "OpenMAIC/lib/server/web-search-config.ts"() {
    "use strict";
    init_provider_config();
    init_constants3();
    OFFICIAL_CLIENT_BASE_URLS = {
      tavily: ["https://api.tavily.com", "https://api.tavily.com/search"],
      exa: ["https://api.exa.ai", "https://api.exa.ai/search"],
      bocha: [
        "https://api.bocha.cn",
        "https://api.bocha.cn/v1",
        "https://api.bocha.cn/v1/web-search",
        "https://api.bochaai.com",
        "https://api.bochaai.com/v1",
        "https://api.bochaai.com/v1/web-search"
      ],
      brave: [
        "https://search.brave.com",
        "https://search.brave.com/search",
        "https://api.search.brave.com"
      ],
      baidu: ["https://qianfan.baidubce.com"],
      // The bare root is accepted for convenience; the Claude adapter normalizes it
      // to the /v1 root, since the AI SDK appends "/messages" to the base URL.
      claude: ["https://api.anthropic.com", "https://api.anthropic.com/v1"],
      minimax: [
        "https://api.minimaxi.com",
        "https://api.minimaxi.com/v1",
        "https://api.minimaxi.com/v1/coding_plan",
        "https://api.minimaxi.com/v1/coding_plan/search",
        "https://api.minimax.io",
        "https://api.minimax.io/v1",
        "https://api.minimax.io/v1/coding_plan",
        "https://api.minimax.io/v1/coding_plan/search"
      ],
      doubao: ["https://open.feedcoopapi.com", "https://open.feedcoopapi.com/search_api/web_search"],
      searxng: []
    };
  }
});

// OpenMAIC/lib/server/ssrf-guard.ts
import { promises as dns } from "node:dns";
import { isIP } from "node:net";
import ipaddr from "ipaddr.js";
function normalizeAddress(value) {
  let normalized = value.trim().toLowerCase();
  if (normalized.startsWith("[") && normalized.endsWith("]")) {
    normalized = normalized.slice(1, -1);
  }
  return normalized.replace(/\.+$/, "");
}
function parseIPv4(ip) {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  const octets = parts.map((part) => {
    if (!/^\d+$/.test(part)) {
      return Number.NaN;
    }
    return Number.parseInt(part, 10);
  });
  if (octets.some((octet) => Number.isNaN(octet) || octet < 0 || octet > 255)) {
    return null;
  }
  return octets;
}
function extractMappedIPv4(ip) {
  const normalized = normalizeAddress(ip);
  if (!normalized.startsWith("::ffff:")) {
    return null;
  }
  const suffix = normalized.slice("::ffff:".length);
  const dottedIPv4 = parseIPv4(suffix);
  if (dottedIPv4) {
    return dottedIPv4.join(".");
  }
  const parts = suffix.split(":");
  if (parts.length !== 2 || parts.some((part) => !/^[0-9a-f]{1,4}$/.test(part))) {
    return null;
  }
  const [high, low] = parts.map((part) => Number.parseInt(part, 16));
  return [high >> 8, high & 255, low >> 8, low & 255].join(".");
}
function getFirstIPv6Hextet(ip) {
  const normalized = normalizeAddress(ip);
  if (!normalized.includes(":")) {
    return null;
  }
  if (normalized.startsWith("::")) {
    return 0;
  }
  const [firstHextet] = normalized.split(":");
  if (!firstHextet || !/^[0-9a-f]{1,4}$/.test(firstHextet)) {
    return null;
  }
  return Number.parseInt(firstHextet, 16);
}
function expandIPv6(ip) {
  let normalized = normalizeAddress(ip);
  if (!normalized.includes(":")) return null;
  const lastPart = normalized.split(":").pop() || "";
  if (lastPart.includes(".")) {
    const dottedIPv4 = parseIPv4(lastPart);
    if (!dottedIPv4) return null;
    const [first, second, third, fourth] = dottedIPv4;
    const high = (first << 8 | second).toString(16);
    const low = (third << 8 | fourth).toString(16);
    normalized = `${normalized.slice(0, -lastPart.length)}${high}:${low}`;
  }
  const sides = normalized.split("::");
  if (sides.length > 2) return null;
  let parts;
  if (sides.length === 2) {
    const left = sides[0] ? sides[0].split(":") : [];
    const right = sides[1] ? sides[1].split(":") : [];
    const missing = 8 - left.length - right.length;
    if (missing <= 0) return null;
    parts = [...left, ...Array(missing).fill("0"), ...right];
  } else {
    parts = normalized.split(":");
  }
  if (parts.length !== 8) return null;
  if (parts.some((p) => !/^[0-9a-f]{1,4}$/.test(p))) return null;
  return parts.map((p) => Number.parseInt(p, 16));
}
function isPrivateIP(ip) {
  const normalized = normalizeAddress(ip);
  const mappedIPv4 = extractMappedIPv4(normalized);
  if (mappedIPv4) {
    return isPrivateIP(mappedIPv4);
  }
  const ipv4 = parseIPv4(normalized);
  if (ipv4) {
    const [first, second, third, fourth] = ipv4;
    return first === 0 || first === 10 || first === 127 || first === 169 && second === 254 || first === 172 && second >= 16 && second <= 31 || first === 192 && second === 168 || first === 0 && second === 0 && third === 0 && fourth === 0;
  }
  const ipv6FirstHextet = getFirstIPv6Hextet(normalized);
  if (ipv6FirstHextet === null) {
    return false;
  }
  if (normalized === "::" || normalized === "::1") {
    return true;
  }
  if ((ipv6FirstHextet & 65024) === 64512 || // fc00::/7 unique local
  (ipv6FirstHextet & 65472) === 65152 || // fe80::/10 link-local
  (ipv6FirstHextet & 65472) === 65216) {
    return true;
  }
  if (ipv6FirstHextet === 8194) {
    const hextets2 = expandIPv6(normalized);
    if (hextets2) {
      const embedded = `${hextets2[1] >> 8}.${hextets2[1] & 255}.${hextets2[2] >> 8}.${hextets2[2] & 255}`;
      if (isPrivateIP(embedded)) return true;
    }
  }
  if (ipv6FirstHextet === 8193) {
    const hextets2 = expandIPv6(normalized);
    if (hextets2 && hextets2[1] === 0) {
      const high = hextets2[6] ^ 65535;
      const low = hextets2[7] ^ 65535;
      const embedded = `${high >> 8}.${high & 255}.${low >> 8}.${low & 255}`;
      if (isPrivateIP(embedded)) return true;
    }
  }
  const hextets = expandIPv6(normalized);
  if (hextets && (hextets[4] === 0 || hextets[4] === 512) && hextets[5] === 24318) {
    const embedded = `${hextets[6] >> 8}.${hextets[6] & 255}.${hextets[7] >> 8}.${hextets[7] & 255}`;
    if (isPrivateIP(embedded)) return true;
  }
  return false;
}
async function validateUrlForSSRF(url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return "Invalid URL";
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return "Only HTTP(S) URLs are allowed";
  }
  const allowLocal = process.env.ALLOW_LOCAL_NETWORKS;
  if (allowLocal === "true" || allowLocal === "1") {
    return null;
  }
  const hostname = normalizeAddress(parsed.hostname);
  if (hostname === "localhost" || hostname.endsWith(".local") || hostname === "0.0.0.0" || hostname === "::1" || isPrivateIP(hostname)) {
    return LOCAL_NETWORK_BLOCK_MESSAGE;
  }
  if (isIP(hostname)) {
    return null;
  }
  let resolvedAddresses;
  try {
    resolvedAddresses = await dns.lookup(hostname, { all: true, verbatim: true });
  } catch {
    return "Unable to verify hostname safety";
  }
  if (resolvedAddresses.length === 0) {
    return "Unable to verify hostname safety";
  }
  if (resolvedAddresses.some(({ address }) => isPrivateIP(address))) {
    return LOCAL_NETWORK_BLOCK_MESSAGE;
  }
  return null;
}
var LOCAL_NETWORK_BLOCK_MESSAGE;
var init_ssrf_guard = __esm({
  "OpenMAIC/lib/server/ssrf-guard.ts"() {
    "use strict";
    LOCAL_NETWORK_BLOCK_MESSAGE = "Local/private network URLs are not allowed. If this is a self-hosted deployment or internal gateway (including split-horizon DNS), set ALLOW_LOCAL_NETWORKS=true to allow local network targets.";
  }
});

// OpenMAIC/lib/server/model-routes.ts
function parseThinking(key2, raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    log16.warn(`"thinking" for stage "${key2}" must be an object in MODEL_ROUTES; ignored.`);
    return void 0;
  }
  const o = raw;
  const out = {};
  const checkEnum = (field, val, valid) => {
    if (val === void 0) return void 0;
    if (typeof val === "string" && valid.includes(val)) return val;
    log16.warn(
      `Invalid ${field} "${String(val)}" for stage "${key2}" ignored. Valid: ${valid.join(", ")}`
    );
    return void 0;
  };
  const mode = checkEnum("mode", o.mode, VALID_MODES);
  if (mode) out.mode = mode;
  const effort = checkEnum("effort", o.effort, VALID_EFFORTS);
  if (effort) out.effort = effort;
  const level = checkEnum("level", o.level, VALID_LEVELS);
  if (level) out.level = level;
  if (o.enabled !== void 0) {
    if (typeof o.enabled === "boolean") out.enabled = o.enabled;
    else
      log16.warn(
        `Invalid enabled "${String(o.enabled)}" for stage "${key2}" ignored (must be boolean).`
      );
  }
  if (o.budgetTokens !== void 0) {
    if (typeof o.budgetTokens === "number") out.budgetTokens = o.budgetTokens;
    else
      log16.warn(
        `Invalid budgetTokens "${String(o.budgetTokens)}" for stage "${key2}" ignored (must be number).`
      );
  }
  if (o.excludeReasoningOutput !== void 0) {
    if (typeof o.excludeReasoningOutput === "boolean")
      out.excludeReasoningOutput = o.excludeReasoningOutput;
    else log16.warn(`Invalid excludeReasoningOutput for stage "${key2}" ignored (must be boolean).`);
  }
  return Object.keys(out).length ? out : void 0;
}
function parseRouteValue(key2, value) {
  if (typeof value === "string") {
    return value.trim() ? { model: value.trim() } : void 0;
  }
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const obj = value;
    const model = typeof obj.model === "string" ? obj.model.trim() : "";
    if (!model) {
      log16.warn(`Route for stage "${key2}" has no model string in MODEL_ROUTES; ignored.`);
      return void 0;
    }
    const route = { model };
    const api = typeof obj.api === "string" ? obj.api.trim() : "";
    const dialect = typeof obj.dialect === "string" ? obj.dialect.trim() : "";
    if (api || dialect) route.api = api || dialect;
    if (obj.api !== void 0 && !api) {
      log16.warn(
        dialect ? `Invalid api for stage "${key2}" in MODEL_ROUTES; using dialect "${dialect}" instead.` : `Invalid api for stage "${key2}" in MODEL_ROUTES; ignored.`
      );
    }
    if (obj.dialect !== void 0 && !dialect) {
      log16.warn(
        api ? `Invalid dialect for stage "${key2}" in MODEL_ROUTES; using api "${api}" instead.` : `Invalid dialect for stage "${key2}" in MODEL_ROUTES; ignored.`
      );
    }
    if (api && dialect && api !== dialect) {
      log16.warn(`Both api and dialect are set for stage "${key2}"; api wins.`);
    }
    if (obj.thinking !== void 0) {
      const thinking = parseThinking(key2, obj.thinking);
      if (thinking) route.thinking = thinking;
    }
    if (obj.contextWindow !== void 0) {
      const contextWindow = obj.contextWindow;
      if (typeof contextWindow === "number" && Number.isFinite(contextWindow) && Math.floor(contextWindow) >= 1) {
        route.contextWindow = Math.floor(contextWindow);
      } else {
        log16.warn(`Invalid contextWindow for stage "${key2}" in MODEL_ROUTES; ignored.`);
      }
    }
    return route;
  }
  log16.warn(`Invalid route value for stage "${key2}" in MODEL_ROUTES ignored.`);
  return void 0;
}
function loadRoutes() {
  if (_routes) return _routes;
  const routes = {};
  const raw = process.env.MODEL_ROUTES?.trim();
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        for (const [key2, value] of Object.entries(parsed)) {
          if (!LLM_STAGES.includes(key2)) {
            log16.warn(
              `Unknown stage "${key2}" in MODEL_ROUTES ignored. Valid stages: ${LLM_STAGES.join(", ")}`
            );
            continue;
          }
          const route = parseRouteValue(key2, value);
          if (route) routes[key2] = route;
        }
      } else {
        log16.error("MODEL_ROUTES must be a JSON object of stage -> model; ignoring.");
      }
    } catch (err) {
      log16.error("Invalid MODEL_ROUTES JSON, ignoring; callers apply their own fallback.", err);
    }
  }
  _routes = routes;
  return _routes;
}
function getStageRoute(stage) {
  if (!stage) return void 0;
  const routes = loadRoutes();
  let key2 = stage;
  while (key2) {
    const route = routes[key2];
    if (route) return route;
    const lastColon = key2.lastIndexOf(":");
    key2 = lastColon > 0 ? key2.slice(0, lastColon) : void 0;
  }
  return void 0;
}
function getStageModel(stage) {
  return getStageRoute(stage)?.model;
}
var log16, VALID_MODES, VALID_EFFORTS, VALID_LEVELS, LLM_STAGES, _routes;
var init_model_routes = __esm({
  "OpenMAIC/lib/server/model-routes.ts"() {
    "use strict";
    init_logger();
    log16 = createLogger("model-routes");
    VALID_MODES = ["default", "disabled", "enabled", "auto"];
    VALID_EFFORTS = [
      "none",
      "minimal",
      "low",
      "medium",
      "high",
      "xhigh",
      "max"
    ];
    VALID_LEVELS = ["minimal", "low", "medium", "high"];
    LLM_STAGES = [
      "scene-outlines-stream",
      "scene-content",
      "scene-content:slide",
      "scene-content:quiz",
      "scene-content:interactive",
      "scene-content:pbl",
      "scene-actions",
      "agent-profiles",
      "quiz-grade",
      "pbl-chat",
      "pbl-v2-runtime",
      "pbl-v2-runtime:instructor",
      "pbl-v2-runtime:open-task",
      "pbl-v2-runtime:evaluate",
      "pbl-v2-runtime:simulator",
      "chat-adapter",
      "generate-classroom",
      "web-search-query-rewrite",
      "maic-agent",
      "maic-agent-driver",
      "conversation-title"
    ];
    _routes = null;
  }
});

// OpenMAIC/lib/server/resolve-model.ts
async function resolveModel(params) {
  const stageRoute = getStageRoute(params.stage);
  const stageModel = stageRoute?.model;
  const modelString = stageModel || params.modelString || process.env.DEFAULT_MODEL;
  if (!modelString) {
    throw new Error(
      "No model could be resolved. Configure DEFAULT_MODEL (and/or a MODEL_ROUTES entry for this stage), or send a model via x-model."
    );
  }
  const { providerId, modelId } = parseModelString(modelString);
  const routed = Boolean(stageModel);
  const clientApiKey = routed ? void 0 : params.apiKey;
  const clientProviderType = routed ? void 0 : params.providerType;
  const clientBaseUrlParam = routed ? void 0 : params.baseUrl;
  const managed = isServerConfiguredProvider("providers", providerId);
  const registeredProviderType = getProvider(providerId)?.type;
  if (clientProviderType && registeredProviderType && clientProviderType !== registeredProviderType) {
    throw new Error(
      `Provider type mismatch for ${providerId}: expected ${registeredProviderType}, received ${clientProviderType}.`
    );
  }
  const effectiveProviderType = clientProviderType || registeredProviderType;
  if (effectiveProviderType === "bedrock" && (providerId !== "bedrock" || !managed)) {
    throw new Error("Amazon Bedrock must be enabled by the server operator before it can be used.");
  }
  const clientBaseUrl = managed ? void 0 : clientBaseUrlParam || void 0;
  if (clientBaseUrl && process.env.NODE_ENV === "production") {
    const ssrfError = await validateUrlForSSRF(clientBaseUrl);
    if (ssrfError) {
      throw new Error(ssrfError);
    }
  }
  const apiKey = resolveApiKey(providerId, clientApiKey || "");
  const baseUrl = resolveBaseUrl(providerId, clientBaseUrl);
  const proxy = resolveProxy(providerId);
  const { model, modelInfo } = getModel({
    providerId,
    modelId,
    apiKey,
    baseUrl,
    proxy,
    providerType: clientProviderType
  });
  const thinkingConfig = routed ? stageRoute?.thinking : params.thinkingConfig;
  return {
    model,
    modelInfo,
    modelString,
    providerId,
    modelId,
    apiKey,
    baseUrl,
    thinkingConfig
  };
}
var init_resolve_model = __esm({
  "OpenMAIC/lib/server/resolve-model.ts"() {
    "use strict";
    init_providers();
    init_provider_config();
    init_ssrf_guard();
    init_model_routes();
  }
});

// OpenMAIC/lib/config/feature-flags.ts
function readBoolean(envValue) {
  return envValue === "true" || envValue === "1";
}
function isVocationalTaskEngineEnabled() {
  return readBoolean(process.env.OPENMAIC_ENABLE_VOCATIONAL);
}
function resolveVocationalActive(requirements) {
  return Boolean(requirements?.taskEngineMode) && isVocationalTaskEngineEnabled();
}
var init_feature_flags = __esm({
  "OpenMAIC/lib/config/feature-flags.ts"() {
    "use strict";
  }
});

// OpenMAIC/lib/prompts/loader.ts
import fs3 from "fs";
import path3 from "path";
import {
  loadSnippet as loadGenerationSnippet
} from "@openmaic/generation";
function getPromptsDir() {
  return path3.join(process.cwd(), "lib", "prompts");
}
function loadSnippet(snippetId) {
  const snippetPath = path3.join(getPromptsDir(), "snippets", `${snippetId}.md`);
  try {
    return fs3.readFileSync(snippetPath, "utf-8").trim();
  } catch {
    return loadGenerationSnippet(snippetId);
  }
}
function processSnippets(template) {
  return template.replace(/\{\{snippet:(\w[\w-]*)\}\}/g, (_, snippetId) => {
    return loadSnippet(snippetId);
  });
}
function processConditionalBlocks(template, conditions) {
  return template.replace(
    /\{\{#if (\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g,
    (_, conditionName, content) => {
      return conditions[conditionName] ? content : "";
    }
  );
}
function loadPrompt(promptId) {
  const promptDir = path3.join(getPromptsDir(), "templates", promptId);
  try {
    const systemPath = path3.join(promptDir, "system.md");
    let systemPrompt = fs3.readFileSync(systemPath, "utf-8").trim();
    systemPrompt = processSnippets(systemPrompt);
    const userPath = path3.join(promptDir, "user.md");
    let userPromptTemplate = "";
    try {
      userPromptTemplate = fs3.readFileSync(userPath, "utf-8").trim();
      userPromptTemplate = processSnippets(userPromptTemplate);
    } catch {
    }
    return {
      id: promptId,
      systemPrompt,
      userPromptTemplate
    };
  } catch (error) {
    log17.error(`Failed to load prompt ${promptId}:`, error);
    return null;
  }
}
function interpolateVariables(template, variables) {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key2) => {
    const value = variables[key2];
    if (value === void 0) return match;
    if (typeof value === "object") return JSON.stringify(value, null, 2);
    return String(value);
  });
}
function applyPromptVariableDefaults(_promptId, variables) {
  return variables;
}
function buildPrompt(promptId, variables) {
  const prompt = loadPrompt(promptId);
  if (!prompt) return null;
  const resolvedVariables = applyPromptVariableDefaults(promptId, variables);
  return {
    system: interpolateVariables(
      processConditionalBlocks(prompt.systemPrompt, resolvedVariables),
      resolvedVariables
    ),
    user: interpolateVariables(
      processConditionalBlocks(prompt.userPromptTemplate, resolvedVariables),
      resolvedVariables
    )
  };
}
var log17;
var init_loader = __esm({
  "OpenMAIC/lib/prompts/loader.ts"() {
    "use strict";
    init_logger();
    log17 = createLogger("PromptLoader");
  }
});

// OpenMAIC/lib/prompts/index.ts
var PROMPT_IDS;
var init_prompts = __esm({
  "OpenMAIC/lib/prompts/index.ts"() {
    "use strict";
    init_loader();
    PROMPT_IDS = {
      INTERACTIVE_OUTLINES: "interactive-outlines",
      TASK_ENGINE_OUTLINES: "task-engine-outlines",
      WEB_SEARCH_QUERY_REWRITE: "web-search-query-rewrite",
      AGENT_SYSTEM: "agent-system",
      AGENT_SYSTEM_WB_TEACHER: "agent-system-wb-teacher",
      AGENT_SYSTEM_WB_ASSISTANT: "agent-system-wb-assistant",
      AGENT_SYSTEM_WB_STUDENT: "agent-system-wb-student",
      DIRECTOR: "director"
    };
  }
});

// OpenMAIC/lib/server/search-query-builder.ts
import { parseJsonResponse } from "@openmaic/generation";
function normalizeSearchRequirement(requirement) {
  return requirement.replace(/\s+/g, " ").trim();
}
function normalizePdfExcerpt(pdfText) {
  if (!pdfText) {
    return "";
  }
  return pdfText.replace(/\s+/g, " ").trim().slice(0, SEARCH_QUERY_REWRITE_EXCERPT_LENGTH);
}
function shouldRewriteSearchQuery(normalizedRequirement, normalizedPdfExcerpt) {
  return normalizedRequirement.length > 400 || Boolean(normalizedPdfExcerpt);
}
async function buildSearchQuery(requirement, pdfText, aiCall) {
  const normalizedRequirement = normalizeSearchRequirement(requirement);
  const pdfExcerpt = normalizePdfExcerpt(pdfText);
  const hasPdfContext = Boolean(pdfExcerpt);
  const rewriteAttempted = shouldRewriteSearchQuery(normalizedRequirement, pdfExcerpt);
  const fallback = {
    query: normalizedRequirement,
    rewriteAttempted,
    rawRequirementLength: normalizedRequirement.length,
    finalQueryLength: normalizedRequirement.length,
    hasPdfContext
  };
  if (!normalizedRequirement || !rewriteAttempted) {
    return fallback;
  }
  if (!aiCall) {
    log18.warn("Query rewrite AI call unavailable, falling back to raw requirement");
    return fallback;
  }
  const prompts = buildPrompt(PROMPT_IDS.WEB_SEARCH_QUERY_REWRITE, {
    requirement: normalizedRequirement,
    pdfExcerpt: pdfExcerpt || "None"
  });
  if (!prompts) {
    log18.warn("Query rewrite prompt not found, falling back to raw requirement");
    return fallback;
  }
  try {
    const response = await aiCall(prompts.system, prompts.user);
    const parsed = parseJsonResponse(response);
    const rewrittenQuery = normalizeSearchRequirement(parsed?.query || "").slice(
      0,
      TAVILY_SOFT_MAX_QUERY_LENGTH
    );
    if (!rewrittenQuery) {
      log18.warn("Query rewrite returned empty output, falling back to raw requirement");
      return fallback;
    }
    return {
      ...fallback,
      query: rewrittenQuery,
      finalQueryLength: rewrittenQuery.length
    };
  } catch (error) {
    log18.warn("Query rewrite failed, falling back to raw requirement:", error);
    return fallback;
  }
}
var log18, TAVILY_SOFT_MAX_QUERY_LENGTH, SEARCH_QUERY_REWRITE_EXCERPT_LENGTH;
var init_search_query_builder = __esm({
  "OpenMAIC/lib/server/search-query-builder.ts"() {
    "use strict";
    init_prompts();
    init_logger();
    log18 = createLogger("SearchQueryBuilder");
    TAVILY_SOFT_MAX_QUERY_LENGTH = 350;
    SEARCH_QUERY_REWRITE_EXCERPT_LENGTH = 7e3;
  }
});

// OpenMAIC/lib/server/proxy-fetch.ts
import { ProxyAgent, fetch as undiciFetch } from "undici";
function getProxyUrl() {
  return process.env.https_proxy || process.env.HTTPS_PROXY || process.env.http_proxy || process.env.HTTP_PROXY || void 0;
}
function getNoProxyEntries() {
  const raw = process.env.no_proxy || process.env.NO_PROXY || "";
  return raw.split(",").map((entry) => entry.trim().toLowerCase()).filter(Boolean);
}
function isLoopbackHost(hostname) {
  const host = hostname.toLowerCase();
  if (host === "localhost" || host.endsWith(".localhost")) return true;
  if (host === "::1" || host === "[::1]") return true;
  return /^127(\.\d{1,3}){3}$/.test(host);
}
function matchesNoProxyEntry(hostname, port, entry) {
  if (entry === "*") return true;
  let entryHost = entry;
  let entryPort = "";
  const colonIndex = entry.lastIndexOf(":");
  if (colonIndex !== -1 && entry.indexOf(":") === colonIndex) {
    entryHost = entry.slice(0, colonIndex);
    entryPort = entry.slice(colonIndex + 1);
  }
  if (entryPort && entryPort !== port) return false;
  entryHost = entryHost.replace(/^\./, "");
  if (!entryHost) return false;
  return hostname === entryHost || hostname.endsWith(`.${entryHost}`);
}
function shouldBypassProxy(url) {
  const hostname = url.hostname.toLowerCase();
  if (isLoopbackHost(hostname)) return true;
  const entries = getNoProxyEntries();
  if (entries.length === 0) return false;
  const port = url.port || (url.protocol === "https:" ? "443" : "80");
  return entries.some((entry) => matchesNoProxyEntry(hostname, port, entry));
}
function getProxyAgent() {
  const proxyUrl = getProxyUrl();
  if (!proxyUrl) return void 0;
  if (cachedAgent && cachedProxyUrl === proxyUrl) {
    return cachedAgent;
  }
  cachedAgent = new ProxyAgent(proxyUrl);
  cachedProxyUrl = proxyUrl;
  return cachedAgent;
}
async function proxyFetch(input, init) {
  const agent = getProxyAgent();
  const url = typeof input === "string" ? input : input.toString();
  if (!agent) {
    log19.info("No proxy configured, using direct fetch for:", url.slice(0, 80));
    return fetch(input, init);
  }
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
  }
  if (parsed && shouldBypassProxy(parsed)) {
    log19.info("Bypassing proxy (loopback/NO_PROXY) for:", url.slice(0, 80));
    return fetch(input, init);
  }
  log19.info("Using proxy", cachedProxyUrl, "for:", url.slice(0, 80));
  const res = await undiciFetch(input, {
    ...init,
    dispatcher: agent
  });
  return res;
}
var log19, cachedAgent, cachedProxyUrl;
var init_proxy_fetch = __esm({
  "OpenMAIC/lib/server/proxy-fetch.ts"() {
    "use strict";
    init_logger();
    log19 = createLogger("ProxyFetch");
    cachedAgent = null;
  }
});

// OpenMAIC/lib/web-search/utils.ts
function normalizeWebSearchQuery(query) {
  return query.trim().slice(0, MAX_WEB_SEARCH_QUERY_LENGTH);
}
var MAX_WEB_SEARCH_QUERY_LENGTH;
var init_utils2 = __esm({
  "OpenMAIC/lib/web-search/utils.ts"() {
    "use strict";
    MAX_WEB_SEARCH_QUERY_LENGTH = 400;
  }
});

// OpenMAIC/lib/web-search/baidu.ts
function baiduHeaders(apiKey) {
  return {
    Authorization: `Bearer ${apiKey}`,
    "X-Appbuilder-From": "openmaic",
    "Content-Type": "application/json"
  };
}
function buildQianfanUrl(path6, baseUrl) {
  return `${(baseUrl || BAIDU_QIANFAN_BASE_URL).replace(/\/+$/, "")}${path6}`;
}
function buildBaikeUrl(query) {
  const url = new URL(`${BAIDU_BAIKE_BASE_URL}${BAIDU_BAIKE_PATH}`);
  url.searchParams.set("search_type", "lemmaTitle");
  url.searchParams.set("search_key", query);
  return url.toString();
}
function buildScholarUrl(query, baseUrl) {
  const url = new URL(buildQianfanUrl(BAIDU_SCHOLAR_PATH, baseUrl));
  url.searchParams.set("wd", query);
  url.searchParams.set("pageNum", "0");
  url.searchParams.set("enable_ai_abstract", "true");
  return url.toString();
}
function normalizeSubSources(subSources) {
  return {
    webSearch: subSources?.webSearch ?? true,
    baike: subSources?.baike ?? true,
    scholar: subSources?.scholar ?? true
  };
}
async function fetchWebSearch(query, apiKey, maxResults, baseUrl, signal) {
  try {
    const res = await proxyFetch(buildQianfanUrl(BAIDU_WEB_SEARCH_PATH, baseUrl), {
      method: "POST",
      headers: baiduHeaders(apiKey),
      body: JSON.stringify({
        messages: [{ content: query, role: "user" }],
        search_source: "baidu_search_v2",
        resource_type_filter: [{ type: "web", top_k: maxResults }]
      }),
      ...signal ? { signal } : {}
    });
    if (!res.ok) {
      const errorText = await res.text().catch(() => "");
      log20.warn(`[Baidu Web] HTTP ${res.status}: ${errorText || res.statusText}`);
      return [];
    }
    const data = await res.json();
    if (data.code && data.code !== 0) {
      log20.warn(`[Baidu Web] API error ${data.code}: ${data.message || "Request failed"}`);
      return [];
    }
    return (data.references || []).filter((ref) => ref.url).slice(0, maxResults).map((ref, index) => ({
      title: ref.title || ref.site_name || ref.url || "",
      url: ref.url || "",
      content: ref.content || "",
      score: Number((0.9 - index * 0.05).toFixed(2))
    }));
  } catch (error) {
    if (signal?.aborted) throw signal.reason ?? error;
    log20.warn("[Baidu Web] Failed:", error);
    return [];
  }
}
async function fetchBaike(query, apiKey, signal) {
  try {
    const res = await proxyFetch(buildBaikeUrl(query), {
      method: "GET",
      headers: baiduHeaders(apiKey),
      ...signal ? { signal } : {}
    });
    if (!res.ok) {
      const errorText = await res.text().catch(() => "");
      log20.warn(`[Baidu Baike] HTTP ${res.status}: ${errorText || res.statusText}`);
      return [];
    }
    const data = await res.json();
    if (data.errno !== void 0 && data.errno !== 0 || !data.result) return [];
    const result = data.result;
    const title = result.lemma_title || query;
    return [
      {
        title: `${title} - Baidu Baike`,
        url: result.lemma_url || `https://baike.baidu.com/item/${encodeURIComponent(query)}`,
        content: result.abstract_text || result.lemma_desc || "",
        score: 0.95
      }
    ];
  } catch (error) {
    if (signal?.aborted) throw signal.reason ?? error;
    log20.warn("[Baidu Baike] Failed:", error);
    return [];
  }
}
async function fetchScholar(query, apiKey, maxResults, baseUrl, signal) {
  try {
    const res = await proxyFetch(buildScholarUrl(query, baseUrl), {
      method: "GET",
      headers: baiduHeaders(apiKey),
      ...signal ? { signal } : {}
    });
    if (!res.ok) {
      const errorText = await res.text().catch(() => "");
      log20.warn(`[Baidu Scholar] HTTP ${res.status}: ${errorText || res.statusText}`);
      return [];
    }
    const data = await res.json();
    if (data.code && data.code !== "0") return [];
    return (data.data || []).filter((paper) => paper.url).slice(0, maxResults).map((paper, index) => ({
      title: paper.title || paper.url || "",
      url: paper.url || "",
      content: [
        paper.abstract,
        paper.aiAbstract,
        paper.publishYear ? `(${paper.publishYear})` : "",
        paper.keyword
      ].filter(Boolean).join(" "),
      score: Number((0.85 - index * 0.05).toFixed(2))
    }));
  } catch (error) {
    if (signal?.aborted) throw signal.reason ?? error;
    log20.warn("[Baidu Scholar] Failed:", error);
    return [];
  }
}
async function searchWithBaidu(params) {
  const { query: rawQuery, apiKey, maxResults = 10, baseUrl, signal } = params;
  if (!apiKey) throw new Error("Baidu API key is required");
  const query = normalizeWebSearchQuery(rawQuery);
  const subSources = normalizeSubSources(params.subSources);
  const startedAt = Date.now();
  const [webResults, baikeResults, scholarResults] = await Promise.all([
    subSources.webSearch ? fetchWebSearch(query, apiKey, maxResults, baseUrl, signal) : Promise.resolve([]),
    subSources.baike ? fetchBaike(query, apiKey, signal) : Promise.resolve([]),
    subSources.scholar ? fetchScholar(query, apiKey, 3, baseUrl, signal) : Promise.resolve([])
  ]);
  const seen = /* @__PURE__ */ new Set();
  const sources = [...baikeResults, ...webResults, ...scholarResults].filter((source) => {
    if (!source.url || seen.has(source.url)) return false;
    seen.add(source.url);
    return true;
  });
  return {
    answer: "",
    sources,
    query,
    responseTime: (Date.now() - startedAt) / 1e3
  };
}
var log20, BAIDU_QIANFAN_BASE_URL, BAIDU_BAIKE_BASE_URL, BAIDU_WEB_SEARCH_PATH, BAIDU_BAIKE_PATH, BAIDU_SCHOLAR_PATH;
var init_baidu = __esm({
  "OpenMAIC/lib/web-search/baidu.ts"() {
    "use strict";
    init_proxy_fetch();
    init_logger();
    init_utils2();
    log20 = createLogger("BaiduSearch");
    BAIDU_QIANFAN_BASE_URL = "https://qianfan.baidubce.com";
    BAIDU_BAIKE_BASE_URL = "https://appbuilder.baidu.com";
    BAIDU_WEB_SEARCH_PATH = "/v2/ai_search/web_search";
    BAIDU_BAIKE_PATH = "/v2/baike/lemma/get_content";
    BAIDU_SCHOLAR_PATH = "/v2/tools/baidu_scholar/search";
  }
});

// OpenMAIC/lib/web-search/bocha.ts
function buildBochaWebSearchUrl(baseUrl) {
  const trimmed = (baseUrl || BOCHA_DEFAULT_BASE_URL).replace(/\/$/, "");
  if (trimmed.endsWith("/v1/web-search")) return trimmed;
  if (trimmed.endsWith("/v1")) return `${trimmed}/web-search`;
  return `${trimmed}/v1/web-search`;
}
function clampCount(maxResults) {
  return Math.min(Math.max(Math.floor(maxResults), 1), BOCHA_MAX_RESULTS);
}
function formatBochaError(status, statusText, errorText) {
  if (!errorText) return `Bocha API error (${status}): ${statusText}`;
  try {
    const parsed = JSON.parse(errorText);
    const code = parsed.code ?? status;
    const message = parsed.message || parsed.msg || statusText;
    const logId = parsed.log_id ? `, log_id: ${parsed.log_id}` : "";
    return `Bocha API error (${code}): ${message}${logId}`;
  } catch {
    return `Bocha API error (${status}): ${errorText}`;
  }
}
async function searchWithBocha(params) {
  const { query, apiKey, maxResults = 10, baseUrl, signal } = params;
  const startedAt = Date.now();
  const res = await proxyFetch(buildBochaWebSearchUrl(baseUrl), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      query,
      freshness: "noLimit",
      summary: true,
      count: clampCount(maxResults)
    }),
    ...signal ? { signal } : {}
  });
  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(formatBochaError(res.status, res.statusText, errorText));
  }
  const raw = await res.json();
  if (raw.code !== void 0 && String(raw.code) !== "200") {
    const message = raw.message || raw.msg || "Request failed";
    const logId = raw.log_id ? `, log_id: ${raw.log_id}` : "";
    throw new Error(`Bocha API error (${raw.code}): ${message}${logId}`);
  }
  const data = raw.data || raw;
  const pages = data.webPages?.value || [];
  const sources = pages.filter((page) => page.url).map((page) => ({
    title: page.name || page.url,
    url: page.url,
    content: page.summary || page.snippet || "",
    score: 0
  }));
  return {
    answer: "",
    sources,
    query: data.queryContext?.originalQuery || query,
    responseTime: (Date.now() - startedAt) / 1e3
  };
}
var BOCHA_DEFAULT_BASE_URL, BOCHA_MAX_RESULTS;
var init_bocha = __esm({
  "OpenMAIC/lib/web-search/bocha.ts"() {
    "use strict";
    init_proxy_fetch();
    BOCHA_DEFAULT_BASE_URL = "https://api.bocha.cn";
    BOCHA_MAX_RESULTS = 50;
  }
});

// OpenMAIC/lib/web-search/brave.ts
function buildBraveSearchUrl(query, baseUrl) {
  const trimmed = (baseUrl || BRAVE_DEFAULT_BASE_URL).replace(/\/+$/, "");
  const endpoint2 = trimmed.endsWith("/search") ? trimmed : `${trimmed}/search`;
  const url = new URL(endpoint2);
  url.searchParams.set("q", query);
  return url.toString();
}
function decodeHtml(value) {
  return value.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code))).replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16))).replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
}
function stripHtml(value) {
  return decodeHtml(value.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
}
function isBraveOwnedUrl(value) {
  try {
    const host = new URL(value).hostname.toLowerCase();
    return host === "brave.com" || host.endsWith(".brave.com");
  } catch {
    return true;
  }
}
function parseBraveSearchHtml(html, maxResults) {
  const results = [];
  const snippetRegex = /<div[^>]*class="[^"]*\bsnippet\b[^"]*"[^>]*data-type="web"[^>]*>([\s\S]*?)(?=<div[^>]*class="[^"]*\bsnippet\b[^"]*"[^>]*data-type="web"|<footer|$)/gi;
  let snippetMatch;
  while ((snippetMatch = snippetRegex.exec(html)) !== null && results.length < maxResults) {
    const block = snippetMatch[1];
    const linkMatch = block.match(/<a[^>]*href="([^"]+)"[^>]*>/i);
    if (!linkMatch) continue;
    const url = decodeHtml(linkMatch[1].trim());
    if (!url || isBraveOwnedUrl(url)) continue;
    const titleMatch = block.match(
      /<(span|div)[^>]*class="[^"]*search-snippet-title[^"]*"[^>]*>([\s\S]*?)<\/\1>/i
    );
    const title = titleMatch ? stripHtml(titleMatch[2]) : "";
    if (!title) continue;
    const genericMatch = block.match(
      /<div[^>]*class="[^"]*generic-snippet[^"]*"[^>]*>([\s\S]*?)<\/div>/i
    );
    const descMatch = block.match(
      /<p[^>]*class="[^"]*snippet-description[^"]*"[^>]*>([\s\S]*?)<\/p>/i
    );
    const rawContent = genericMatch?.[1] || descMatch?.[1] || "";
    const content = stripHtml(rawContent).replace(/^\d+ \w+ ago\s*-\s*/, "").replace(/^[A-Z][a-z]+ \d+, \d{4}\s*-\s*/, "");
    results.push({
      title,
      url,
      content,
      score: Number((1 - results.length * 0.1).toFixed(2))
    });
  }
  return results;
}
async function searchWithBraveApi(query, apiKey, maxResults, signal) {
  const url = new URL("/res/v1/web/search", BRAVE_API_BASE_URL);
  url.searchParams.set("q", query);
  url.searchParams.set("count", String(Math.min(maxResults, 20)));
  const res = await proxyFetch(url.toString(), {
    method: "GET",
    headers: {
      "X-Subscription-Token": apiKey,
      Accept: "application/json"
    },
    ...signal ? { signal } : {}
  });
  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`Brave API error (${res.status}): ${errorText || res.statusText}`);
  }
  const data = await res.json();
  return (data.web?.results || []).filter((r) => r.url).slice(0, maxResults).map((r, i) => ({
    title: r.title || "",
    url: r.url || "",
    content: stripHtml(r.description || ""),
    score: Number((1 - i * 0.05).toFixed(2))
  }));
}
async function searchWithBraveScrape(query, maxResults, baseUrl, signal) {
  const res = await proxyFetch(buildBraveSearchUrl(query, baseUrl), {
    method: "GET",
    headers: BRAVE_HEADERS,
    ...signal ? { signal } : {}
  });
  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`Brave Search error (${res.status}): ${errorText || res.statusText}`);
  }
  const html = await res.text();
  return parseBraveSearchHtml(html, maxResults);
}
async function searchWithBrave(params) {
  const { query: rawQuery, apiKey, maxResults = 5, baseUrl, signal } = params;
  const query = normalizeWebSearchQuery(rawQuery);
  const startedAt = Date.now();
  const sources = apiKey ? await searchWithBraveApi(query, apiKey, maxResults, signal) : await searchWithBraveScrape(query, maxResults, baseUrl, signal);
  return {
    answer: "",
    sources,
    query,
    responseTime: (Date.now() - startedAt) / 1e3
  };
}
var BRAVE_DEFAULT_BASE_URL, BRAVE_HEADERS, BRAVE_API_BASE_URL;
var init_brave = __esm({
  "OpenMAIC/lib/web-search/brave.ts"() {
    "use strict";
    init_proxy_fetch();
    init_utils2();
    BRAVE_DEFAULT_BASE_URL = "https://search.brave.com";
    BRAVE_HEADERS = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9"
    };
    BRAVE_API_BASE_URL = "https://api.search.brave.com";
  }
});

// OpenMAIC/lib/web-search/claude.ts
import { createAnthropic as createAnthropic2 } from "@ai-sdk/anthropic";
function usesBasicWebSearchTool(modelId) {
  return !DYNAMIC_WEB_SEARCH_MODEL.test(modelId);
}
async function fetchWithAllowedCallers(url, init) {
  if (init?.method === "POST" && typeof init.body === "string") {
    try {
      const body = JSON.parse(init.body);
      if (Array.isArray(body?.tools)) {
        let patched = false;
        body.tools = body.tools.map((tool2) => {
          if (tool2.type !== BASIC_WEB_SEARCH_TOOL_TYPE || tool2.allowed_callers) return tool2;
          patched = true;
          return { ...tool2, allowed_callers: ["direct"] };
        });
        if (patched) init = { ...init, body: JSON.stringify(body) };
      }
    } catch {
    }
  }
  return proxyFetch(url, init);
}
function resolveClaudeBaseUrl(baseUrl) {
  const normalized = (baseUrl || CLAUDE_DEFAULT_BASE_URL).replace(/\/+$/, "");
  if (!normalized) return "";
  try {
    const parsed = new URL(normalized);
    const official = new URL(CLAUDE_DEFAULT_BASE_URL);
    if (parsed.origin === official.origin && parsed.pathname === "/") {
      return CLAUDE_DEFAULT_BASE_URL;
    }
  } catch {
  }
  return normalized;
}
function isHttpUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}
async function searchWithClaude(params) {
  const { query, maxResults } = params;
  const modelId = params.modelId?.trim() || CLAUDE_WEB_SEARCH_DEFAULT_MODEL;
  const apiKey = params.apiKey.trim();
  const baseUrl = params.baseUrl?.trim();
  const provider = createAnthropic2({
    apiKey,
    baseURL: resolveClaudeBaseUrl(baseUrl),
    fetch: fetchWithAllowedCallers
  });
  const toolArgs = maxResults && maxResults > 0 ? { maxUses: maxResults } : {};
  const webSearch = usesBasicWebSearchTool(modelId) ? provider.tools.webSearch_20250305(toolArgs) : provider.tools.webSearch_20260209(toolArgs);
  const startTime = Date.now();
  try {
    const result = await callLLM(
      {
        model: provider(modelId),
        messages: [
          {
            role: "user",
            content: `Search for the following and provide a comprehensive summary with source links: ${query}.`
          }
        ],
        maxOutputTokens: CLAUDE_MAX_OUTPUT_TOKENS,
        tools: { web_search: webSearch },
        ...params.signal ? { abortSignal: params.signal } : {}
      },
      "web-search-claude"
    );
    const sources = /* @__PURE__ */ new Map();
    for (const source of result.sources) {
      if (source.sourceType !== "url") continue;
      if (!isHttpUrl(source.url) || sources.has(source.url)) continue;
      sources.set(source.url, {
        title: source.title?.trim() || new URL(source.url).hostname,
        url: source.url,
        content: "Referenced by the Claude web-search answer.",
        score: 1
      });
    }
    return {
      answer: result.text,
      sources: [...sources.values()],
      query,
      // Seconds, matching every sibling adapter's WebSearchResult contract.
      responseTime: (Date.now() - startTime) / 1e3
    };
  } catch (e) {
    log21.error(`Claude web search failed [model="${modelId}"]:`, e);
    throw e;
  }
}
var CLAUDE_MAX_OUTPUT_TOKENS, BASIC_WEB_SEARCH_TOOL_TYPE, CLAUDE_DEFAULT_BASE_URL, log21, DYNAMIC_WEB_SEARCH_MODEL;
var init_claude = __esm({
  "OpenMAIC/lib/web-search/claude.ts"() {
    "use strict";
    init_llm();
    init_proxy_fetch();
    init_logger();
    init_constants3();
    CLAUDE_MAX_OUTPUT_TOKENS = 4096;
    BASIC_WEB_SEARCH_TOOL_TYPE = "web_search_20250305";
    CLAUDE_DEFAULT_BASE_URL = WEB_SEARCH_PROVIDERS.claude.defaultBaseUrl ?? "";
    log21 = createLogger("ClaudeSearch");
    DYNAMIC_WEB_SEARCH_MODEL = /^claude-(?:opus|sonnet)-4-[6-9](?:-|$)|^claude-(?:opus|sonnet|fable|mythos)-[5-9](?:-|$)/;
  }
});

// OpenMAIC/lib/web-search/doubao.ts
function buildDoubaoSearchUrl(baseUrl) {
  const trimmed = (baseUrl || DOUBAO_DEFAULT_BASE_URL).replace(/\/$/, "");
  return trimmed.endsWith(DOUBAO_SEARCH_PATH) ? trimmed : `${trimmed}${DOUBAO_SEARCH_PATH}`;
}
function formatDoubaoError(err, status, statusText) {
  const code = err?.Code ?? err?.CodeN ?? status;
  const message = err?.Message || statusText || "Request failed";
  return `Doubao Web Search API error (${code}): ${message}`;
}
async function searchWithDoubao(params) {
  const { query, apiKey, maxResults = 10, baseUrl, signal } = params;
  const startedAt = Date.now();
  const limit = Math.max(Math.floor(maxResults), 1);
  const res = await proxyFetch(buildDoubaoSearchUrl(baseUrl), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      Query: query.slice(0, DOUBAO_MAX_QUERY_LENGTH),
      SearchType: "web",
      Count: Math.min(limit, 50),
      NeedSummary: true
    }),
    ...signal ? { signal } : {}
  });
  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`Doubao Web Search API error (${res.status}): ${errorText || res.statusText}`);
  }
  const raw = await res.json();
  const err = raw.ResponseMetadata?.Error;
  if (err && (err.Code || err.CodeN || err.Message)) {
    throw new Error(formatDoubaoError(err, res.status, res.statusText));
  }
  const sources = (raw.Result?.WebResults || []).map((item) => ({
    title: item.Title || item.Url || "",
    url: item.Url || "",
    content: item.Summary || item.Content || item.Snippet || "",
    score: typeof item.RankScore === "number" ? item.RankScore : 0
  })).filter((source) => source.url).slice(0, limit);
  return {
    answer: "",
    sources,
    query,
    responseTime: (Date.now() - startedAt) / 1e3
  };
}
var DOUBAO_DEFAULT_BASE_URL, DOUBAO_SEARCH_PATH, DOUBAO_MAX_QUERY_LENGTH;
var init_doubao = __esm({
  "OpenMAIC/lib/web-search/doubao.ts"() {
    "use strict";
    init_proxy_fetch();
    DOUBAO_DEFAULT_BASE_URL = "https://open.feedcoopapi.com";
    DOUBAO_SEARCH_PATH = "/search_api/web_search";
    DOUBAO_MAX_QUERY_LENGTH = 100;
  }
});

// OpenMAIC/lib/web-search/exa.ts
function buildExaSearchUrl(baseUrl) {
  const trimmed = (baseUrl || EXA_DEFAULT_BASE_URL).replace(/\/+$/, "");
  return trimmed.endsWith("/search") ? trimmed : `${trimmed}/search`;
}
function mapExaResult(result, index) {
  const url = (result.url || result.id || "").trim();
  if (!url) return void 0;
  const highlights = Array.isArray(result.highlights) ? result.highlights.map((highlight) => highlight.trim()).filter(Boolean).join("\n\n") : "";
  return {
    title: result.title?.trim() || url,
    url,
    content: highlights || result.summary?.trim() || result.text?.trim() || "",
    score: typeof result.score === "number" ? result.score : Number((1 - index * 0.05).toFixed(2))
  };
}
async function searchWithExa(params) {
  const { query: rawQuery, apiKey, maxResults = 5, baseUrl, signal } = params;
  const query = normalizeWebSearchQuery(rawQuery);
  const numResults = Math.max(1, Math.min(maxResults, 100));
  const startedAt = Date.now();
  const res = await proxyFetch(buildExaSearchUrl(baseUrl), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      query,
      type: "auto",
      numResults,
      contents: { highlights: true }
    }),
    ...signal ? { signal } : {}
  });
  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`Exa API error (${res.status}): ${errorText || res.statusText}`);
  }
  const data = await res.json();
  const rawResults = Array.isArray(data.results) ? data.results : [];
  const sources = rawResults.map((result, index) => mapExaResult(result, index)).filter((source) => !!source).slice(0, numResults);
  return {
    answer: "",
    sources,
    query,
    responseTime: (Date.now() - startedAt) / 1e3
  };
}
var EXA_DEFAULT_BASE_URL;
var init_exa = __esm({
  "OpenMAIC/lib/web-search/exa.ts"() {
    "use strict";
    init_proxy_fetch();
    init_utils2();
    EXA_DEFAULT_BASE_URL = "https://api.exa.ai";
  }
});

// OpenMAIC/lib/web-search/minimax.ts
function buildMiniMaxWebSearchUrl(baseUrl) {
  const trimmed = (baseUrl || MINIMAX_DEFAULT_BASE_URL).replace(/\/$/, "");
  if (trimmed.endsWith("/v1/coding_plan/search")) return trimmed;
  if (trimmed.endsWith("/v1/coding_plan")) return `${trimmed}/search`;
  if (trimmed.endsWith("/v1")) return `${trimmed}/coding_plan/search`;
  return `${trimmed}/v1/coding_plan/search`;
}
function getMiniMaxBaseResp(raw) {
  if (!raw || typeof raw !== "object") return void 0;
  const value = raw.base_resp || raw.baseResp;
  if (!value || typeof value !== "object") return void 0;
  return value;
}
function formatMiniMaxError(status, statusText, errorText) {
  if (!errorText) return `MiniMax Web Search API error (${status}): ${statusText}`;
  try {
    const parsed = JSON.parse(errorText);
    const baseResp = getMiniMaxBaseResp(parsed);
    const code = baseResp?.status_code ?? parsed.code ?? status;
    const message = baseResp?.status_msg || parsed.message || parsed.error?.message || statusText;
    return `MiniMax Web Search API error (${code}): ${message}`;
  } catch {
    return `MiniMax Web Search API error (${status}): ${errorText}`;
  }
}
function getOrganicResults(raw) {
  return raw.organic || raw.data?.organic || raw.results || [];
}
async function searchWithMiniMax(params) {
  const { query, apiKey, maxResults = 10, baseUrl, signal } = params;
  const startedAt = Date.now();
  const res = await proxyFetch(buildMiniMaxWebSearchUrl(baseUrl), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "MM-API-Source": "OpenMAIC"
    },
    body: JSON.stringify({ q: query }),
    ...signal ? { signal } : {}
  });
  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(formatMiniMaxError(res.status, res.statusText, errorText));
  }
  const raw = await res.json();
  const baseResp = getMiniMaxBaseResp(raw);
  if (baseResp?.status_code !== void 0 && String(baseResp.status_code) !== "0") {
    throw new Error(
      `MiniMax Web Search API error (${baseResp.status_code}): ${baseResp.status_msg || "Request failed"}`
    );
  }
  const limit = Math.max(Math.floor(maxResults), 1);
  const sources = getOrganicResults(raw).map((item) => {
    const url = item.link || item.url || "";
    return {
      title: item.title || url,
      url,
      content: item.snippet || item.summary || item.content || item.date || "",
      score: 0
    };
  }).filter((source) => source.url).slice(0, limit);
  return {
    answer: "",
    sources,
    query,
    responseTime: (Date.now() - startedAt) / 1e3
  };
}
var MINIMAX_DEFAULT_BASE_URL;
var init_minimax = __esm({
  "OpenMAIC/lib/web-search/minimax.ts"() {
    "use strict";
    init_proxy_fetch();
    MINIMAX_DEFAULT_BASE_URL = "https://api.minimaxi.com";
  }
});

// OpenMAIC/lib/web-search/searxng.ts
function buildSearxngSearchUrl(baseUrl, query) {
  const trimmed = baseUrl.replace(/\/+$/, "");
  const root = trimmed.endsWith("/search") ? trimmed.slice(0, -"/search".length) : trimmed;
  const url = new URL(`${root}/search`);
  url.searchParams.set("q", query);
  url.searchParams.set("format", "json");
  return url.toString();
}
function mapSearxngResult(result, index) {
  const url = (result.url || result.link || "").trim();
  if (!url) return void 0;
  const title = (result.title || "").trim() || url;
  return {
    title,
    url,
    content: (result.content || "").trim(),
    score: typeof result.score === "number" ? result.score : Number((1 - index * 0.05).toFixed(2))
  };
}
async function searchWithSearxng(params) {
  const { query: rawQuery, maxResults = 5, baseUrl, signal } = params;
  const query = normalizeWebSearchQuery(rawQuery);
  if (!baseUrl?.trim()) {
    throw new Error("SearXNG base URL is not configured. Set SEARXNG_BASE_URL on the server.");
  }
  const startedAt = Date.now();
  const requestUrl = buildSearxngSearchUrl(baseUrl, query);
  const res = await proxyFetch(requestUrl, {
    method: "GET",
    headers: SEARXNG_HEADERS,
    ...signal ? { signal } : {}
  });
  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`SearXNG error (${res.status}): ${errorText || res.statusText}`);
  }
  const rawText = await res.text();
  let data;
  try {
    data = JSON.parse(rawText);
  } catch {
    throw new Error(
      `SearXNG returned non-JSON response. Ensure "json" is enabled in SearXNG search formats.`
    );
  }
  const rawResults = Array.isArray(data.results) ? data.results : [];
  const sources = rawResults.map((result, index) => mapSearxngResult(result, index)).filter((source) => !!source).slice(0, maxResults);
  if (sources.length === 0 && (data.number_of_results ?? rawResults.length) > 0) {
    log22.warn("SearXNG reported results but none could be mapped", {
      numberOfResults: data.number_of_results,
      rawResultCount: rawResults.length,
      requestUrl
    });
  }
  return {
    answer: "",
    sources,
    query: data.query || query,
    responseTime: (Date.now() - startedAt) / 1e3
  };
}
var log22, SEARXNG_HEADERS;
var init_searxng = __esm({
  "OpenMAIC/lib/web-search/searxng.ts"() {
    "use strict";
    init_logger();
    init_proxy_fetch();
    init_utils2();
    log22 = createLogger("SearXNG");
    SEARXNG_HEADERS = {
      Accept: "application/json",
      "User-Agent": "Mozilla/5.0 (compatible; OpenMAIC/1.0; +https://github.com/THU-MAIC/OpenMAIC)"
    };
  }
});

// OpenMAIC/lib/web-search/format.ts
function formatSearchResultsAsContext(result) {
  if (!result.answer && result.sources.length === 0) {
    return "";
  }
  const lines = [];
  if (result.answer) {
    lines.push(result.answer);
    lines.push("");
  }
  if (result.sources.length > 0) {
    lines.push("Sources:");
    for (const src of result.sources) {
      lines.push(`- [${src.title}](${src.url}): ${src.content.slice(0, 200)}`);
    }
  }
  return lines.join("\n");
}
var init_format = __esm({
  "OpenMAIC/lib/web-search/format.ts"() {
    "use strict";
  }
});

// OpenMAIC/lib/web-search/tavily.ts
function buildTavilySearchUrl(baseUrl) {
  const trimmed = (baseUrl || TAVILY_DEFAULT_BASE_URL).replace(/\/$/, "");
  return trimmed.endsWith("/search") ? trimmed : `${trimmed}/search`;
}
async function searchWithTavily(params) {
  const { query, apiKey, maxResults = 5, baseUrl, signal } = params;
  const truncatedQuery = query.slice(0, TAVILY_MAX_QUERY_LENGTH);
  const res = await proxyFetch(buildTavilySearchUrl(baseUrl), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      query: truncatedQuery,
      search_depth: "basic",
      max_results: maxResults,
      include_answer: "basic"
    }),
    ...signal ? { signal } : {}
  });
  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`Tavily API error (${res.status}): ${errorText || res.statusText}`);
  }
  const data = await res.json();
  const sources = (data.results || []).map((r) => ({
    title: r.title,
    url: r.url,
    content: r.content,
    score: r.score
  }));
  return {
    answer: data.answer || "",
    sources,
    query: data.query,
    responseTime: data.response_time
  };
}
var TAVILY_DEFAULT_BASE_URL, TAVILY_MAX_QUERY_LENGTH;
var init_tavily = __esm({
  "OpenMAIC/lib/web-search/tavily.ts"() {
    "use strict";
    init_proxy_fetch();
    init_format();
    TAVILY_DEFAULT_BASE_URL = "https://api.tavily.com";
    TAVILY_MAX_QUERY_LENGTH = 400;
  }
});

// OpenMAIC/lib/web-search/index.ts
async function searchWeb(params) {
  const {
    providerId,
    query,
    apiKey = "",
    maxResults,
    baseUrl,
    baiduSubSources,
    claudeModelId,
    signal
  } = params;
  const abortOptions = signal ? { signal } : {};
  switch (providerId) {
    case "baidu":
      return searchWithBaidu({
        query,
        apiKey,
        maxResults,
        baseUrl,
        subSources: baiduSubSources,
        ...abortOptions
      });
    case "bocha":
      return searchWithBocha({ query, apiKey, maxResults, baseUrl, ...abortOptions });
    case "brave":
      return searchWithBrave({
        query,
        apiKey: apiKey || void 0,
        maxResults,
        baseUrl,
        ...abortOptions
      });
    case "claude":
      return searchWithClaude({
        query,
        apiKey,
        modelId: claudeModelId,
        baseUrl,
        maxResults,
        ...abortOptions
      });
    case "doubao":
      return searchWithDoubao({ query, apiKey, maxResults, baseUrl, ...abortOptions });
    case "exa":
      return searchWithExa({ query, apiKey, maxResults, baseUrl, ...abortOptions });
    case "minimax":
      return searchWithMiniMax({ query, apiKey, maxResults, baseUrl, ...abortOptions });
    case "searxng":
      return searchWithSearxng({ query, maxResults, baseUrl, ...abortOptions });
    case "tavily":
      return searchWithTavily({ query, apiKey, maxResults, baseUrl, ...abortOptions });
    default: {
      const exhaustive = providerId;
      throw new Error(`Unsupported web search provider: ${exhaustive}`);
    }
  }
}
var init_web_search = __esm({
  "OpenMAIC/lib/web-search/index.ts"() {
    "use strict";
    init_baidu();
    init_bocha();
    init_brave();
    init_claude();
    init_doubao();
    init_exa();
    init_minimax();
    init_searxng();
    init_tavily();
    init_format();
  }
});

// OpenMAIC/lib/server/classroom-storage.ts
import { promises as fs4 } from "fs";
import path4 from "path";
async function ensureDir(dir) {
  await fs4.mkdir(dir, { recursive: true });
}
async function ensureClassroomsDir() {
  await ensureDir(CLASSROOMS_DIR);
}
async function writeJsonFileAtomic(filePath, data) {
  const dir = path4.dirname(filePath);
  await ensureDir(dir);
  const tempFilePath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  const content = JSON.stringify(data, null, 2);
  await fs4.writeFile(tempFilePath, content, "utf-8");
  await fs4.rename(tempFilePath, filePath);
}
async function persistClassroom(data, baseUrl) {
  const classroomData = {
    id: data.id,
    stage: data.stage,
    scenes: data.scenes,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  await ensureClassroomsDir();
  const filePath = path4.join(CLASSROOMS_DIR, `${data.id}.json`);
  await writeJsonFileAtomic(filePath, classroomData);
  return {
    ...classroomData,
    url: `${baseUrl}/classroom/${data.id}`
  };
}
var CLASSROOMS_DIR, CLASSROOM_JOBS_DIR;
var init_classroom_storage = __esm({
  "OpenMAIC/lib/server/classroom-storage.ts"() {
    "use strict";
    CLASSROOMS_DIR = path4.join(process.cwd(), "data", "classrooms");
    CLASSROOM_JOBS_DIR = path4.join(process.cwd(), "data", "classroom-jobs");
  }
});

// OpenMAIC/lib/audio/qwen-voice-clone.ts
function isUnknownVoiceResponse(body) {
  const code = typeof body.code === "string" ? body.code : "";
  const message = typeof body.message === "string" ? body.message : "";
  return /^(?:voice[_-]?(?:not[_-]?found|not[_-]?exist|invalid)|invalid[_-]?voice)$/iu.test(code) || /voice.{0,40}(?:not found|not exist|does not exist|invalid)/iu.test(message);
}
function resolveConfig(config) {
  const apiKey = config.apiKey?.trim() || "";
  const targetModel = config.targetModel?.trim() || "";
  if (!apiKey || !targetModel) throw new QwenVoiceCloneError("QWEN_VC_CONFIG_MISSING", 400);
  let baseUrl;
  try {
    baseUrl = new URL(config.baseUrl?.trim() || DEFAULT_QWEN_BASE_URL);
  } catch {
    throw new QwenVoiceCloneError("QWEN_VC_ENDPOINT_INVALID", 400);
  }
  if (baseUrl.protocol !== "https:" && baseUrl.hostname !== "localhost") {
    throw new QwenVoiceCloneError("QWEN_VC_ENDPOINT_INVALID", 400);
  }
  return { apiKey, baseUrl, targetModel };
}
function endpoint(baseUrl, path6) {
  const normalized = new URL(baseUrl);
  const basePath = normalized.pathname.replace(/\/$/u, "");
  const suffix = basePath.endsWith("/api/v1") && path6.startsWith("/api/v1/") ? path6.slice("/api/v1".length) : path6;
  normalized.pathname = `${basePath}${suffix}`;
  normalized.search = "";
  normalized.hash = "";
  return normalized;
}
function timeoutSignal(parent, timeoutMs) {
  const controller = new AbortController();
  let timeoutReached = false;
  const abortFromParent = () => controller.abort(parent?.reason);
  if (parent?.aborted) abortFromParent();
  else parent?.addEventListener("abort", abortFromParent, { once: true });
  const timer = setTimeout(() => {
    timeoutReached = true;
    controller.abort();
  }, timeoutMs);
  return {
    signal: controller.signal,
    timedOut: () => timeoutReached,
    cleanup: () => {
      clearTimeout(timer);
      parent?.removeEventListener("abort", abortFromParent);
    }
  };
}
async function postJson(url, apiKey, body, signal) {
  const timeout = timeoutSignal(signal, REQUEST_TIMEOUT_MS);
  try {
    let response;
    try {
      response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json; charset=utf-8"
        },
        body: JSON.stringify(body),
        signal: timeout.signal
      });
    } catch (error) {
      if (signal?.aborted) throw error;
      throw new QwenVoiceCloneError(
        timeout.timedOut() ? "QWEN_VC_TIMEOUT" : "QWEN_VC_TRANSPORT_ERROR",
        timeout.timedOut() ? 504 : 502
      );
    }
    let parsed;
    try {
      parsed = await response.json();
    } catch {
      if (!response.ok) throw new QwenVoiceCloneError("QWEN_VC_HTTP_ERROR", response.status);
      throw new QwenVoiceCloneError("QWEN_VC_RESPONSE_JSON_INVALID", 502);
    }
    if (!response.ok) {
      const vendorCode = typeof parsed.code === "string" ? parsed.code : void 0;
      throw new QwenVoiceCloneError(
        isUnknownVoiceResponse(parsed) ? "QWEN_VC_VOICE_NOT_FOUND" : "QWEN_VC_HTTP_ERROR",
        response.status,
        vendorCode
      );
    }
    return parsed;
  } finally {
    timeout.cleanup();
  }
}
function audioFormat(contentType, vendorFormat, url) {
  if (typeof vendorFormat === "string" && /^[a-z0-9]+$/iu.test(vendorFormat)) {
    return vendorFormat.toLowerCase();
  }
  const normalizedType = contentType?.split(";", 1)[0]?.trim().toLowerCase();
  if (normalizedType === "audio/mpeg" || normalizedType === "audio/mp3") return "mp3";
  if (normalizedType === "audio/wav" || normalizedType === "audio/x-wav") return "wav";
  if (normalizedType?.startsWith("audio/")) return normalizedType.slice("audio/".length);
  return url.pathname.match(/\.([a-z0-9]{2,5})$/iu)?.[1]?.toLowerCase() || "wav";
}
async function downloadAudio(rawUrl, signal, effectiveBaseUrl) {
  let url;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new QwenVoiceCloneError("QWEN_VC_AUDIO_URL_INVALID", 502);
  }
  const trustedHost = /^dashscope-result-[a-z0-9-]+\.oss-[a-z]{2}-[a-z0-9-]+\.aliyuncs\.com$/u.test(
    url.hostname
  );
  let trustedCustomEndpoint = false;
  if (effectiveBaseUrl) {
    try {
      const configured = new URL(effectiveBaseUrl);
      const defaultEndpoint = new URL(DEFAULT_QWEN_BASE_URL);
      trustedCustomEndpoint = configured.origin !== defaultEndpoint.origin && url.host === configured.host && url.protocol === configured.protocol;
    } catch {
      throw new QwenVoiceCloneError("QWEN_VC_ENDPOINT_INVALID", 400);
    }
  }
  if (!trustedHost && !trustedCustomEndpoint || url.protocol !== "https:" && url.protocol !== "http:" || trustedHost && url.port && url.port !== "80" && url.port !== "443") {
    throw new QwenVoiceCloneError("QWEN_VC_AUDIO_URL_INVALID", 502);
  }
  if (trustedHost && url.protocol === "http:") url.protocol = "https:";
  const timeout = timeoutSignal(signal, AUDIO_DOWNLOAD_TIMEOUT_MS);
  try {
    let response;
    try {
      response = await fetch(url, { signal: timeout.signal, redirect: "error" });
    } catch (error) {
      if (signal?.aborted) throw error;
      throw new QwenVoiceCloneError(
        timeout.timedOut() ? "QWEN_VC_TIMEOUT" : "QWEN_VC_AUDIO_DOWNLOAD_FAILED",
        timeout.timedOut() ? 504 : 502
      );
    }
    if (!response.ok) {
      throw new QwenVoiceCloneError("QWEN_VC_AUDIO_DOWNLOAD_FAILED", response.status);
    }
    const declaredLength = Number(response.headers.get("content-length"));
    if (Number.isFinite(declaredLength) && declaredLength > MAX_AUDIO_RESPONSE_BYTES) {
      throw new QwenVoiceCloneError("QWEN_VC_AUDIO_TOO_LARGE", 502);
    }
    if (!response.body) throw new QwenVoiceCloneError("QWEN_VC_AUDIO_EMPTY", 502);
    const reader = response.body.getReader();
    const chunks = [];
    let totalBytes = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      totalBytes += value.byteLength;
      if (totalBytes > MAX_AUDIO_RESPONSE_BYTES) {
        await reader.cancel();
        throw new QwenVoiceCloneError("QWEN_VC_AUDIO_TOO_LARGE", 502);
      }
      chunks.push(value);
    }
    if (!totalBytes) throw new QwenVoiceCloneError("QWEN_VC_AUDIO_EMPTY", 502);
    const bytes = new Uint8Array(totalBytes);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return { bytes, contentType: response.headers.get("content-type"), url };
  } finally {
    timeout.cleanup();
  }
}
async function synthesizeQwenVoiceClone(config, text, voiceId, speed = 1, signal) {
  const resolved = resolveConfig(config);
  const voice = voiceId.trim();
  if (!voice) throw new QwenVoiceCloneError("QWEN_VC_CONFIG_MISSING", 400);
  if ((!Number.isFinite(speed) || speed !== 1) && !loggedSpeedNormalization) {
    loggedSpeedNormalization = true;
    log23.debug("Qwen VC does not support rate control; normalizing synthesis speed to 1x");
  }
  const deadline = timeoutSignal(signal, SYNTHESIS_DEADLINE_MS);
  try {
    const body = await postJson(
      endpoint(resolved.baseUrl, SYNTHESIS_PATH),
      resolved.apiKey,
      { model: resolved.targetModel, input: { text, voice } },
      deadline.signal
    );
    const rawAudioUrl = typeof body.output?.audio?.url === "string" ? body.output.audio.url.trim() : "";
    if (!rawAudioUrl) {
      throw new QwenVoiceCloneError("QWEN_VC_RESPONSE_AUDIO_URL_MISSING", 502);
    }
    const downloaded = await downloadAudio(rawAudioUrl, deadline.signal, resolved.baseUrl);
    return {
      audio: downloaded.bytes,
      format: audioFormat(downloaded.contentType, body.output?.audio?.format, downloaded.url)
    };
  } catch (error) {
    if (deadline.timedOut()) throw new QwenVoiceCloneError("QWEN_VC_TIMEOUT", 504);
    throw error;
  } finally {
    deadline.cleanup();
  }
}
var DEFAULT_QWEN_BASE_URL, SYNTHESIS_PATH, REQUEST_TIMEOUT_MS, AUDIO_DOWNLOAD_TIMEOUT_MS, SYNTHESIS_DEADLINE_MS, MAX_AUDIO_RESPONSE_BYTES, QwenVoiceCloneError, log23, loggedSpeedNormalization;
var init_qwen_voice_clone = __esm({
  "OpenMAIC/lib/audio/qwen-voice-clone.ts"() {
    "use strict";
    init_logger();
    DEFAULT_QWEN_BASE_URL = "https://dashscope.aliyuncs.com/api/v1";
    SYNTHESIS_PATH = "/api/v1/services/aigc/multimodal-generation/generation";
    REQUEST_TIMEOUT_MS = 3e4;
    AUDIO_DOWNLOAD_TIMEOUT_MS = 3e4;
    SYNTHESIS_DEADLINE_MS = 24e3;
    MAX_AUDIO_RESPONSE_BYTES = 50 * 1024 * 1024;
    QwenVoiceCloneError = class extends Error {
      constructor(code, httpStatus, vendorCode) {
        super(code);
        this.code = code;
        this.httpStatus = httpStatus;
        this.vendorCode = vendorCode;
        this.name = "QwenVoiceCloneError";
      }
    };
    log23 = createLogger("QwenVoiceClone");
    loggedSpeedNormalization = false;
  }
});

// OpenMAIC/lib/audio/qwen-voice-clone-registration.ts
function evictQwenVoiceRegistrationMemo(voiceId) {
  const keys = registrationKeysByVoice.get(voiceId);
  if (!keys) return;
  for (const key2 of keys) registrations.delete(key2);
  registrationKeysByVoice.delete(voiceId);
}
var REGISTRATION_MEMO_TTL_MS, registrations, registrationKeysByVoice;
var init_qwen_voice_clone_registration = __esm({
  "OpenMAIC/lib/audio/qwen-voice-clone-registration.ts"() {
    "use strict";
    init_qwen_voice_clone();
    init_constants();
    init_provider_config();
    init_wav_validate();
    REGISTRATION_MEMO_TTL_MS = 60 * 60 * 1e3;
    registrations = /* @__PURE__ */ new Map();
    registrationKeysByVoice = /* @__PURE__ */ new Map();
  }
});

// OpenMAIC/lib/audio/json-stream.ts
function splitConcatenatedJsonObjects(text) {
  const objects = [];
  let depth = 0;
  let start = -1;
  let inString = false;
  let escaped = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === '"') inString = false;
      continue;
    }
    if (char === '"') {
      inString = true;
    } else if (char === "{") {
      if (depth === 0) start = i;
      depth += 1;
    } else if (char === "}" && depth > 0) {
      depth -= 1;
      if (depth === 0 && start >= 0) {
        objects.push(text.slice(start, i + 1));
        start = -1;
      }
    }
  }
  return objects;
}
var init_json_stream = __esm({
  "OpenMAIC/lib/audio/json-stream.ts"() {
    "use strict";
  }
});

// OpenMAIC/lib/audio/tts-providers.ts
function ttsRequestTimeoutMs() {
  const raw = process.env.TTS_REQUEST_TIMEOUT_MS?.trim();
  const parsed = raw ? Number(raw) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_TTS_REQUEST_TIMEOUT_MS;
}
function ttsRequestSignal(callerSignal) {
  const timeout = AbortSignal.timeout(ttsRequestTimeoutMs());
  return callerSignal ? AbortSignal.any([callerSignal, timeout]) : timeout;
}
function isTimeoutSignal(signal) {
  return signal.aborted && signal.reason instanceof DOMException && signal.reason.name === "TimeoutError";
}
function throwIfTtsRateLimited(provider, status) {
  if (status === 429) {
    throw new TTSRateLimitError(provider, `${provider} TTS rate limit exceeded (HTTP 429)`);
  }
}
async function generateTTS(config, text) {
  const provider = TTS_PROVIDERS[config.providerId];
  if (provider?.requiresApiKey && !config.apiKey) {
    throw new Error(`API key required for TTS provider: ${config.providerId}`);
  }
  const signal = ttsRequestSignal(config.signal);
  try {
    switch (config.providerId) {
      case "openai-tts":
        return await generateOpenAITTS(config, text, signal);
      case "azure-tts":
        return await generateAzureTTS(config, text, signal);
      case "glm-tts":
        return await generateGLMTTS(config, text, signal);
      case "qwen-tts":
        return await generateQwenTTS(config, text, signal);
      case "voxcpm-tts":
        return await generateVoxCPMTTS(config, text, signal);
      case "minimax-tts":
        return await generateMiniMaxTTS(config, text, signal);
      case "doubao-tts":
        return await generateDoubaoTTS(config, text, signal);
      case "elevenlabs-tts":
        return await generateElevenLabsTTS(config, text, signal);
      case "lemonade-tts":
        return await generateLemonadeTTS(config, text, signal);
      case "browser-native-tts":
        throw new Error(
          "Browser Native TTS must be handled client-side using Web Speech API. This provider cannot be used on the server."
        );
      default:
        if (isCustomTTSProvider(config.providerId)) {
          return await generateOpenAITTS(config, text, signal);
        }
        throw new Error(`Unsupported TTS provider: ${config.providerId}`);
    }
  } catch (error) {
    if (config.signal?.aborted) throw error;
    if (isTimeoutSignal(signal)) {
      throw new TTSRequestTimeoutError(
        config.providerId,
        `TTS request timed out after ${ttsRequestTimeoutMs()}ms (provider ${config.providerId}) \u2014 the provider did not respond. Retry the tool call.`
      );
    }
    throw error;
  }
}
async function generateOpenAITTS(config, text, signal) {
  const baseUrl = config.baseUrl || TTS_PROVIDERS["openai-tts"].defaultBaseUrl;
  const response = await fetch(`${baseUrl}/audio/speech`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json; charset=utf-8"
    },
    body: JSON.stringify({
      model: config.modelId || "gpt-4o-mini-tts",
      input: text,
      voice: config.voice,
      speed: config.speed || 1
    }),
    signal
  });
  if (!response.ok) {
    throwIfTtsRateLimited("OpenAI", response.status);
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(`OpenAI TTS API error: ${error.error?.message || response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  const contentType = response.headers.get("content-type") || "";
  const format = getAudioResponseFormat(contentType);
  return {
    audio: new Uint8Array(arrayBuffer),
    format
  };
}
async function generateLemonadeTTS(config, text, signal) {
  const baseUrl = (config.baseUrl || TTS_PROVIDERS["lemonade-tts"].defaultBaseUrl || "").replace(
    /\/$/,
    ""
  );
  const modelId = config.modelId || TTS_PROVIDERS["lemonade-tts"].defaultModelId;
  const voice = config.voice || "af_heart";
  const response = await fetch(`${baseUrl}/audio/speech`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...getBackendAuthHeaders(config.apiKey)
    },
    body: JSON.stringify({
      model: modelId,
      input: text,
      voice,
      speed: config.speed || 1,
      response_format: config.format || "wav"
    }),
    signal
  });
  if (!response.ok) {
    throwIfTtsRateLimited("Lemonade", response.status);
    throw new Error(`Lemonade TTS API error: ${await readTTSApiError(response)}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  const contentType = response.headers.get("content-type") || "";
  return {
    audio: new Uint8Array(arrayBuffer),
    format: getAudioResponseFormat(contentType)
  };
}
async function generateVoxCPMTTS(config, text, signal) {
  const baseUrl = (config.baseUrl || TTS_PROVIDERS["voxcpm-tts"].defaultBaseUrl || "").replace(
    /\/$/,
    ""
  );
  if (!baseUrl) {
    throw new Error("VoxCPM base URL is required");
  }
  const options4 = config.providerOptions || {};
  const backend = normalizeVoxCPMBackend(options4.backend);
  const voicePrompt = options4.voicePrompt || (config.voice && config.voice !== "default" && config.voice !== VOXCPM_AUTO_VOICE_ID ? config.voice : void 0);
  const registeredVoiceId = options4.registeredVoiceId?.trim() || void 0;
  if (config.voice === VOXCPM_AUTO_VOICE_ID && !voicePrompt && !registeredVoiceId) {
    throw new Error("VoxCPM Auto Voice requires agent context");
  }
  const cfgValue = options4.cfgValue ?? 2;
  const inferenceTimesteps = options4.inferenceTimesteps ?? 10;
  const normalize = options4.normalize ?? false;
  const denoise = options4.denoise ?? false;
  const usePromptContinuation = Boolean(options4.promptText?.trim() && options4.referenceAudioBase64);
  const request = {
    targetText: usePromptContinuation ? text : buildVoxCPMTargetText(text, voicePrompt),
    rawText: text,
    registeredVoiceId,
    voicePrompt,
    promptText: options4.promptText,
    cfgValue,
    inferenceTimesteps,
    normalize,
    denoise,
    referenceAudioBase64: options4.referenceAudioBase64,
    referenceAudioMimeType: options4.referenceAudioMimeType,
    referenceAudioName: options4.referenceAudioName
  };
  const response = backend === "nano-vllm" ? await postVoxCPMNanoVLLM(baseUrl, request, config.apiKey, signal) : backend === "python-api" ? await postVoxCPMPythonAPI(baseUrl, request, config.apiKey, signal) : await postVoxCPMVLLMOmni(baseUrl, request, config, signal);
  if (!response.ok) {
    throwIfTtsRateLimited("VoxCPM", response.status);
    throw new Error(`VoxCPM TTS API error: ${await readTTSApiError(response)}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  const contentType = response.headers.get("content-type") || "";
  const format = getAudioResponseFormat(contentType);
  return {
    audio: new Uint8Array(arrayBuffer),
    format
  };
}
function buildVoxCPMTargetText(text, voicePrompt) {
  const prompt = voicePrompt?.replace(/[\p{C}]+/gu, " ").replace(/[()（）]/gu, "").replace(/\s+/gu, " ").trim();
  return prompt ? `(${prompt})${text}` : text;
}
function getAudioResponseFormat(contentType) {
  if (contentType.includes("audio/wav") || contentType.includes("audio/x-wav")) return "wav";
  if (contentType.includes("audio/mpeg") || contentType.includes("audio/mp3")) return "mp3";
  if (contentType.includes("audio/flac")) return "flac";
  if (contentType.includes("audio/ogg")) return "ogg";
  if (contentType.includes("audio/webm")) return "webm";
  return "mp3";
}
function getVoxCPMAudioFormat(mimeType, fileName) {
  const lowerName = fileName?.toLowerCase() || "";
  if (mimeType?.includes("wav") || lowerName.endsWith(".wav")) return "wav";
  if (mimeType?.includes("mpeg") || mimeType?.includes("mp3") || lowerName.endsWith(".mp3")) {
    return "mp3";
  }
  if (mimeType?.includes("flac") || lowerName.endsWith(".flac")) return "flac";
  if (mimeType?.includes("ogg") || lowerName.endsWith(".ogg")) return "ogg";
  if (mimeType?.includes("webm") || lowerName.endsWith(".webm")) return "webm";
  return "wav";
}
function getVLLMOmniSpeechUrl(baseUrl) {
  return baseUrl.endsWith("/v1") ? `${baseUrl}/audio/speech` : `${baseUrl}/v1/audio/speech`;
}
function getVLLMOmniModelId(config) {
  const modelId = config.modelId?.trim();
  if (!modelId || modelId === "VoxCPM2") return VOXCPM_VLLM_MODEL_ID;
  return modelId;
}
function getBackendAuthHeaders(apiKey) {
  return apiKey?.trim() ? { Authorization: `Bearer ${apiKey.trim()}` } : {};
}
async function postVoxCPMVLLMOmni(baseUrl, params, config, signal) {
  const payload = {
    model: getVLLMOmniModelId(config),
    input: params.targetText,
    voice: "default",
    response_format: "wav",
    stream: false
  };
  if (params.registeredVoiceId) {
    payload.voice = params.registeredVoiceId;
    payload.input = params.rawText ?? params.targetText;
  } else if (params.referenceAudioBase64) {
    const referenceAudio = getVoxCPMDataAudioUrl(
      params.referenceAudioBase64,
      params.referenceAudioMimeType,
      params.referenceAudioName
    );
    payload.ref_audio = referenceAudio;
    if (params.promptText?.trim()) {
      payload.prompt_audio = referenceAudio;
      payload.prompt_text = params.promptText.trim();
    }
  }
  return fetch(getVLLMOmniSpeechUrl(baseUrl), {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...getBackendAuthHeaders(config.apiKey)
    },
    body: JSON.stringify(payload),
    signal
  });
}
function getVoxCPMDataAudioUrl(base64, mimeType, fileName) {
  const format = getVoxCPMAudioFormat(mimeType, fileName);
  const mediaType = mimeType?.trim() || (format === "mp3" ? "audio/mpeg" : format === "flac" ? "audio/flac" : format === "ogg" ? "audio/ogg" : format === "webm" ? "audio/webm" : "audio/wav");
  return `data:${mediaType};base64,${base64}`;
}
function base64ToBlob2(base64, mimeType) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index++) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new Blob([bytes], { type: mimeType || "audio/wav" });
}
async function postVoxCPMPythonAPI(baseUrl, params, apiKey, signal) {
  const formData = new FormData();
  formData.set("text", params.targetText);
  formData.set("cfg_value", String(params.cfgValue));
  formData.set("inference_timesteps", String(params.inferenceTimesteps));
  formData.set("normalize", String(params.normalize));
  formData.set("denoise", String(params.denoise));
  if (params.referenceAudioBase64) {
    const audioBlob = base64ToBlob2(params.referenceAudioBase64, params.referenceAudioMimeType);
    const audioName = params.referenceAudioName || "reference.wav";
    formData.set("reference_audio", audioBlob, audioName);
    if (params.promptText?.trim()) {
      formData.set("prompt_audio", audioBlob, audioName);
      formData.set("prompt_text", params.promptText.trim());
    }
  }
  return fetch(`${baseUrl}/tts/upload`, {
    method: "POST",
    headers: getBackendAuthHeaders(apiKey),
    body: formData,
    signal
  });
}
async function postVoxCPMNanoVLLM(baseUrl, params, apiKey, signal) {
  const payload = {
    target_text: params.targetText,
    cfg_value: params.cfgValue
  };
  if (params.referenceAudioBase64) {
    const format = getVoxCPMAudioFormat(params.referenceAudioMimeType, params.referenceAudioName);
    payload.ref_audio_wav_base64 = params.referenceAudioBase64;
    payload.ref_audio_wav_format = format;
    if (params.promptText?.trim()) {
      payload.prompt_wav_base64 = params.referenceAudioBase64;
      payload.prompt_wav_format = format;
      payload.prompt_text = params.promptText.trim();
    }
  }
  return fetch(`${baseUrl}/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...getBackendAuthHeaders(apiKey)
    },
    body: JSON.stringify(payload),
    signal
  });
}
async function readTTSApiError(response) {
  const text = await response.text().catch(() => response.statusText);
  if (!text) return response.statusText;
  try {
    const json = JSON.parse(text);
    if (typeof json.detail === "string") return json.detail;
    if (typeof json.error === "string") return json.error;
    if (json.error?.message) return json.error.message;
  } catch {
  }
  return text;
}
async function generateAzureTTS(config, text, signal) {
  const baseUrl = config.baseUrl || TTS_PROVIDERS["azure-tts"].defaultBaseUrl;
  const rate = config.speed ? `${((config.speed - 1) * 100).toFixed(0)}%` : "0%";
  const ssml = `
    <speak version='1.0' xml:lang='zh-CN'>
      <voice xml:lang='zh-CN' name='${config.voice}'>
        <prosody rate='${rate}'>${escapeXml(text)}</prosody>
      </voice>
    </speak>
  `.trim();
  const response = await fetch(`${baseUrl}/cognitiveservices/v1`, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": config.apiKey,
      "Content-Type": "application/ssml+xml; charset=utf-8",
      "X-Microsoft-OutputFormat": "audio-16khz-128kbitrate-mono-mp3"
    },
    body: ssml,
    signal
  });
  if (!response.ok) {
    throwIfTtsRateLimited("Azure", response.status);
    throw new Error(`Azure TTS API error: ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return {
    audio: new Uint8Array(arrayBuffer),
    format: "mp3"
  };
}
async function generateGLMTTS(config, text, signal) {
  const baseUrl = config.baseUrl || TTS_PROVIDERS["glm-tts"].defaultBaseUrl;
  const response = await fetch(`${baseUrl}/audio/speech`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json; charset=utf-8"
    },
    body: JSON.stringify({
      model: config.modelId || "glm-tts",
      input: text,
      voice: config.voice,
      speed: config.speed || 1,
      volume: 1,
      response_format: "wav"
    }),
    signal
  });
  if (!response.ok) {
    throwIfTtsRateLimited("GLM", response.status);
    const errorText = await response.text().catch(() => response.statusText);
    let errorMessage = `GLM TTS API error: ${errorText}`;
    try {
      const errorJson = JSON.parse(errorText);
      if (errorJson.error?.message) {
        errorMessage = `GLM TTS API error: ${errorJson.error.message} (code: ${errorJson.error.code})`;
      }
    } catch {
    }
    throw new Error(errorMessage);
  }
  const arrayBuffer = await response.arrayBuffer();
  return {
    audio: new Uint8Array(arrayBuffer),
    format: "wav"
  };
}
async function generateQwenTTS(config, text, signal) {
  const baseUrl = config.baseUrl || TTS_PROVIDERS["qwen-tts"].defaultBaseUrl;
  const cloneVoice = isQwenCloneVoice(config.voice);
  if (cloneVoice) {
    const targetModel = config.providerOptions?.qwenVoiceClone === true ? config.modelId : resolveTTSModelForVoice("qwen-tts", config.voice, config.modelId);
    try {
      return await synthesizeQwenVoiceClone(
        { apiKey: config.apiKey, baseUrl, targetModel },
        text,
        config.voice,
        config.speed,
        signal
      );
    } catch (error) {
      if (error instanceof QwenVoiceCloneError && error.code === "QWEN_VC_VOICE_NOT_FOUND") {
        evictQwenVoiceRegistrationMemo(config.voice);
      }
      throw error;
    }
  }
  const rate = Math.round(((config.speed || 1) - 1) * 500);
  const modelId = resolveTTSModelForVoice("qwen-tts", config.voice, config.modelId);
  const response = await fetch(`${baseUrl}/services/aigc/multimodal-generation/generation`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json; charset=utf-8"
    },
    body: JSON.stringify({
      model: modelId || "qwen3-tts-flash",
      input: {
        text,
        voice: config.voice,
        language_type: "Chinese"
        // Default to Chinese, can be made configurable
      },
      parameters: {
        rate
        // Speech rate from -500 to 500
      }
    }),
    signal
  });
  if (!response.ok) {
    throwIfTtsRateLimited("Qwen", response.status);
    const errorText = await response.text().catch(() => response.statusText);
    throw new QwenTTSError(`Qwen TTS request failed: ${errorText}`, response.status);
  }
  const data = await response.json();
  if (!data.output?.audio?.url) {
    throw new QwenTTSError("Qwen TTS returned no audio URL.");
  }
  let downloaded;
  try {
    downloaded = await downloadAudio(data.output.audio.url, signal, baseUrl);
  } catch (error) {
    if (error instanceof QwenVoiceCloneError) {
      const host = (() => {
        try {
          return new URL(String(data.output.audio.url)).hostname || "unknown";
        } catch {
          return "invalid";
        }
      })();
      throw new QwenTTSError(
        error.code === "QWEN_VC_AUDIO_URL_INVALID" ? `The generated Qwen audio URL host "${host}" is not allowed.` : "The generated Qwen audio could not be downloaded.",
        error.httpStatus
      );
    }
    throw error;
  }
  return {
    audio: downloaded.bytes,
    format: "wav"
    // Qwen3 TTS returns WAV format
  };
}
async function generateMiniMaxTTS(config, text, signal) {
  const baseUrl = (config.baseUrl || TTS_PROVIDERS["minimax-tts"].defaultBaseUrl || "").replace(
    /\/$/,
    ""
  );
  const response = await fetch(`${baseUrl}/v1/t2a_v2`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json; charset=utf-8"
    },
    body: JSON.stringify({
      model: config.modelId || "speech-2.8-hd",
      text,
      stream: false,
      output_format: "hex",
      voice_setting: {
        voice_id: config.voice,
        speed: config.speed || 1,
        vol: 1,
        pitch: 0
      },
      audio_setting: {
        sample_rate: 32e3,
        bitrate: 128e3,
        format: config.format || "mp3",
        channel: 1
      },
      language_boost: "auto"
    }),
    signal
  });
  if (!response.ok) {
    throwIfTtsRateLimited("MiniMax", response.status);
    const errorText = await response.text().catch(() => response.statusText);
    throw new Error(`MiniMax TTS API error: ${errorText}`);
  }
  const data = await response.json();
  const hexAudio = data?.data?.audio;
  if (!hexAudio || typeof hexAudio !== "string") {
    throw new Error(`MiniMax TTS error: No audio returned. Response: ${JSON.stringify(data)}`);
  }
  const cleanedHex = hexAudio.trim();
  if (cleanedHex.length % 2 !== 0) {
    throw new Error("MiniMax TTS error: invalid hex audio payload length");
  }
  const audio = new Uint8Array(
    cleanedHex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []
  );
  return {
    audio,
    format: data?.extra_info?.audio_format || config.format || "mp3"
  };
}
async function generateElevenLabsTTS(config, text, signal) {
  const baseUrl = config.baseUrl || TTS_PROVIDERS["elevenlabs-tts"].defaultBaseUrl;
  const requestedFormat = config.format || "mp3";
  const clampedSpeed = Math.min(1.2, Math.max(0.7, config.speed || 1));
  const outputFormatMap = {
    mp3: "mp3_44100_128",
    opus: "opus_48000_96",
    pcm: "pcm_44100",
    wav: "wav_44100",
    ulaw: "ulaw_8000",
    alaw: "alaw_8000"
  };
  const outputFormat = outputFormatMap[requestedFormat] || outputFormatMap.mp3;
  const response = await fetch(
    `${baseUrl}/text-to-speech/${encodeURIComponent(config.voice)}?output_format=${outputFormat}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": config.apiKey,
        "Content-Type": "application/json; charset=utf-8"
      },
      body: JSON.stringify({
        text,
        model_id: config.modelId || "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          speed: clampedSpeed
        }
      }),
      signal
    }
  );
  if (!response.ok) {
    throwIfTtsRateLimited("ElevenLabs", response.status);
    const errorText = await response.text().catch(() => response.statusText);
    throw new Error(`ElevenLabs TTS API error: ${errorText || response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return {
    audio: new Uint8Array(arrayBuffer),
    format: requestedFormat
  };
}
async function generateDoubaoTTS(config, text, signal) {
  const rawKey = config.apiKey || "";
  if (!rawKey) {
    throw new Error(
      'Doubao TTS requires an API key: an Agent Plan key, or "appId:accessKey" from the Volcengine speech console.'
    );
  }
  const colonIdx = rawKey.indexOf(":");
  const isPlanKey = colonIdx < 0;
  const appId = isPlanKey ? "" : rawKey.slice(0, colonIdx);
  const accessKey = isPlanKey ? "" : rawKey.slice(colonIdx + 1);
  if (!isPlanKey && (!appId || !accessKey)) {
    throw new Error(
      "Doubao TTS appId:accessKey is malformed \u2014 both halves are required (or use an Agent Plan key)."
    );
  }
  const baseUrl = config.baseUrl || TTS_PROVIDERS["doubao-tts"].defaultBaseUrl;
  const speechRate = Math.round(((config.speed || 1) - 1) * 100);
  const authHeaders3 = isPlanKey ? { "X-Api-Key": rawKey } : { "X-Api-App-Id": appId, "X-Api-Access-Key": accessKey };
  const response = await fetch(`${baseUrl}/unidirectional`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders3,
      "X-Api-Resource-Id": "seed-tts-2.0"
    },
    body: JSON.stringify({
      user: { uid: "openmaic" },
      req_params: {
        text,
        speaker: config.voice,
        audio_params: { format: "mp3", sample_rate: 24e3, speech_rate: speechRate }
      }
    }),
    signal
  });
  if (!response.ok) {
    throwIfTtsRateLimited("Doubao", response.status);
    const errorText = await response.text().catch(() => response.statusText);
    throw new Error(`Doubao TTS API error (${response.status}): ${errorText}`);
  }
  const responseText = await response.text();
  const audioChunks = [];
  for (const objectText of splitConcatenatedJsonObjects(responseText)) {
    let chunk;
    try {
      chunk = JSON.parse(objectText);
    } catch {
      continue;
    }
    if (chunk.code === 0 && chunk.data) {
      audioChunks.push(new Uint8Array(Buffer.from(chunk.data, "base64")));
    } else if (chunk.code === 2e7) {
      break;
    } else if (chunk.code && chunk.code !== 0) {
      if (chunk.code === 45e6 || chunk.code === 45000292) {
        throw new TTSRateLimitError("doubao-tts", chunk.message || "concurrency quota exceeded");
      }
      throw new Error(`Doubao TTS error: ${chunk.message || "unknown"} (code: ${chunk.code})`);
    }
  }
  if (audioChunks.length === 0) {
    throw new Error("Doubao TTS: no audio data received");
  }
  const totalLength = audioChunks.reduce((sum, c) => sum + c.length, 0);
  const combined = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of audioChunks) {
    combined.set(chunk, offset);
    offset += chunk.length;
  }
  return { audio: combined, format: "mp3" };
}
function escapeXml(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
var TTSRateLimitError, QwenTTSError, DEFAULT_TTS_REQUEST_TIMEOUT_MS, TTSRequestTimeoutError;
var init_tts_providers = __esm({
  "OpenMAIC/lib/audio/tts-providers.ts"() {
    "use strict";
    init_types();
    init_constants();
    init_qwen_voice_clone();
    init_qwen_voice_clone_registration();
    init_json_stream();
    init_voxcpm();
    init_constants();
    TTSRateLimitError = class extends Error {
      constructor(provider, message) {
        super(message);
        this.provider = provider;
        this.name = "TTSRateLimitError";
      }
    };
    QwenTTSError = class extends Error {
      constructor(message, httpStatus = 502) {
        super(message);
        this.code = "QWEN_TTS_ERROR";
        this.name = "QwenTTSError";
        this.httpStatus = httpStatus;
      }
    };
    DEFAULT_TTS_REQUEST_TIMEOUT_MS = 3e4;
    TTSRequestTimeoutError = class extends Error {
      constructor(provider, message) {
        super(message);
        this.provider = provider;
        this.name = "TTSRequestTimeoutError";
      }
    };
  }
});

// OpenMAIC/lib/audio/tts-utils.ts
function splitLongSpeechText(text, maxLength) {
  const normalized = text.trim();
  if (!normalized || normalized.length <= maxLength) return [normalized];
  const units = normalized.split(/(?<=[。！？!?；;：:\n])/u).map((part) => part.trim()).filter(Boolean);
  const chunks = [];
  let current = "";
  const pushChunk = (value) => {
    const trimmed = value.trim();
    if (trimmed) chunks.push(trimmed);
  };
  const appendUnit = (unit) => {
    if (!current) {
      current = unit;
      return;
    }
    if ((current + unit).length <= maxLength) {
      current += unit;
      return;
    }
    pushChunk(current);
    current = unit;
  };
  const hardSplitUnit = (unit) => {
    const parts = unit.split(/(?<=[，,、])/u).filter(Boolean);
    if (parts.length > 1) {
      for (const part of parts) {
        if (part.length <= maxLength) appendUnit(part);
        else hardSplitUnit(part);
      }
      return;
    }
    let start = 0;
    while (start < unit.length) {
      appendUnit(unit.slice(start, start + maxLength));
      start += maxLength;
    }
  };
  for (const unit of units.length > 0 ? units : [normalized]) {
    if (unit.length <= maxLength) appendUnit(unit);
    else hardSplitUnit(unit);
  }
  pushChunk(current);
  return chunks;
}
function splitLongSpeechActions(actions, providerId) {
  const maxLength = TTS_MAX_TEXT_LENGTH[providerId];
  if (!maxLength) return actions;
  let didSplit = false;
  const nextActions = actions.flatMap((action) => {
    if (action.type !== "speech" || !action.text || action.text.length <= maxLength)
      return [action];
    const chunks = splitLongSpeechText(action.text, maxLength);
    if (chunks.length <= 1) return [action];
    didSplit = true;
    const { audioId: _audioId, ...baseAction } = action;
    log24.info(
      `Split speech for ${providerId}: action=${action.id}, len=${action.text.length}, chunks=${chunks.length}`
    );
    return chunks.map((chunk, i) => ({
      ...baseAction,
      id: `${action.id}_tts_${i + 1}`,
      text: chunk
    }));
  });
  return didSplit ? nextActions : actions;
}
var log24, TTS_MAX_TEXT_LENGTH;
var init_tts_utils = __esm({
  "OpenMAIC/lib/audio/tts-utils.ts"() {
    "use strict";
    init_logger();
    log24 = createLogger("TTS");
    TTS_MAX_TEXT_LENGTH = {
      "glm-tts": 1024
    };
  }
});

// OpenMAIC/lib/server/image-sizing.ts
function resolveGPTImage2Size(width, height) {
  if (width > height) return GPT_IMAGE_2_LANDSCAPE;
  if (height > width) return GPT_IMAGE_2_PORTRAIT;
  return GPT_IMAGE_2_SQUARE;
}
function resolveImageSize(options4, constraints) {
  const resolved = { ...options4 };
  if (!resolved.width && !resolved.height && resolved.aspectRatio) {
    const dims = aspectRatioToDimensions(resolved.aspectRatio);
    resolved.width = dims.width;
    resolved.height = dims.height;
  }
  const minPixels = Number(process.env.IMAGE_MIN_PIXELS || 0);
  if (minPixels > 0) {
    const width = resolved.width || DEFAULT_IMAGE_EDGE;
    const height = resolved.height || DEFAULT_IMAGE_EDGE;
    const scaled = applyMinPixelFloor(width, height, minPixels);
    if (scaled.width !== width || scaled.height !== height) {
      resolved.width = scaled.width;
      resolved.height = scaled.height;
      log25.info(
        `Image size ${width}x${height} below IMAGE_MIN_PIXELS=${minPixels}; scaled to ${resolved.width}x${resolved.height}`
      );
    }
  }
  if (constraints?.providerId === "openai-image" && constraints.modelId?.startsWith("gpt-image-2")) {
    const requestedWidth = resolved.width || DEFAULT_IMAGE_EDGE;
    const requestedHeight = resolved.height || DEFAULT_IMAGE_EDGE;
    const normalized = resolveGPTImage2Size(requestedWidth, requestedHeight);
    if (normalized.width !== requestedWidth || normalized.height !== requestedHeight) {
      resolved.width = normalized.width;
      resolved.height = normalized.height;
      log25.info(
        `GPT Image 2 normalized ${requestedWidth}x${requestedHeight} to ${normalized.width}x${normalized.height}`
      );
    }
  }
  return resolved;
}
var log25, DEFAULT_IMAGE_EDGE, GPT_IMAGE_2_SQUARE, GPT_IMAGE_2_LANDSCAPE, GPT_IMAGE_2_PORTRAIT;
var init_image_sizing = __esm({
  "OpenMAIC/lib/server/image-sizing.ts"() {
    "use strict";
    init_image_providers();
    init_logger();
    log25 = createLogger("ImageSizing");
    DEFAULT_IMAGE_EDGE = 1024;
    GPT_IMAGE_2_SQUARE = { width: 1024, height: 1024 };
    GPT_IMAGE_2_LANDSCAPE = { width: 1536, height: 1024 };
    GPT_IMAGE_2_PORTRAIT = { width: 1024, height: 1536 };
  }
});

// OpenMAIC/lib/server/classroom-media-generation.ts
import { promises as fs5 } from "fs";
import path5 from "path";
async function ensureDir2(dir) {
  await fs5.mkdir(dir, { recursive: true });
}
async function downloadToBuffer(url) {
  const resp = await fetch(url, { signal: AbortSignal.timeout(DOWNLOAD_TIMEOUT_MS) });
  if (!resp.ok) throw new Error(`Download failed: ${resp.status} ${resp.statusText}`);
  const contentLength = Number(resp.headers.get("content-length") || 0);
  if (contentLength > DOWNLOAD_MAX_SIZE) {
    throw new Error(`File too large: ${contentLength} bytes (max ${DOWNLOAD_MAX_SIZE})`);
  }
  return Buffer.from(await resp.arrayBuffer());
}
function mediaServingUrl(baseUrl, classroomId, subPath) {
  return `${baseUrl}/api/classroom-media/${classroomId}/${subPath}`;
}
async function generateMediaForClassroom(outlines, classroomId, baseUrl) {
  const mediaDir = path5.join(CLASSROOMS_DIR, classroomId, "media");
  await ensureDir2(mediaDir);
  const requests = outlines.flatMap((o) => o.mediaGenerations ?? []);
  if (requests.length === 0) return {};
  const imageProviderIds = Object.entries(getServerImageProviders()).filter(([, info]) => !info.disabled).map(([id]) => id);
  const videoProviderIds = Object.entries(getServerVideoProviders()).filter(([, info]) => !info.disabled).map(([id]) => id);
  const mediaMap = {};
  const imageRequests = requests.filter((r) => r.type === "image" && imageProviderIds.length > 0);
  const videoRequests = requests.filter((r) => r.type === "video" && videoProviderIds.length > 0);
  const generateImages = async () => {
    for (const req of imageRequests) {
      try {
        const providerId = imageProviderIds[0];
        const apiKey = resolveImageApiKey(providerId);
        const providerConfig = IMAGE_PROVIDERS[providerId];
        if (providerConfig?.requiresApiKey && !apiKey) {
          log26.warn(`No API key for image provider "${providerId}", skipping ${req.elementId}`);
          continue;
        }
        const model = resolveImageModel(providerId) ?? providerConfig?.models?.[0]?.id;
        const result = await generateImage(
          { providerId, apiKey, baseUrl: resolveImageBaseUrl(providerId), model },
          resolveImageSize(
            { prompt: req.prompt, aspectRatio: req.aspectRatio || "16:9" },
            { providerId, modelId: model }
          )
        );
        let buf;
        let ext;
        if (result.base64) {
          buf = Buffer.from(result.base64, "base64");
          ext = "png";
        } else if (result.url) {
          buf = await downloadToBuffer(result.url);
          const urlExt = path5.extname(new URL(result.url).pathname).replace(".", "");
          ext = ["png", "jpg", "jpeg", "webp"].includes(urlExt) ? urlExt : "png";
        } else {
          log26.warn(`Image generation returned no data for ${req.elementId}`);
          continue;
        }
        const filename = `${req.elementId}.${ext}`;
        await fs5.writeFile(path5.join(mediaDir, filename), buf);
        mediaMap[req.elementId] = mediaServingUrl(baseUrl, classroomId, `media/${filename}`);
        log26.info(`Generated image: ${filename}`);
      } catch (err) {
        log26.warn(`Image generation failed for ${req.elementId}:`, err);
      }
    }
  };
  const generateVideos = async () => {
    for (const req of videoRequests) {
      try {
        const providerId = videoProviderIds[0];
        const apiKey = resolveVideoApiKey(providerId);
        if (!apiKey) {
          log26.warn(`No API key for video provider "${providerId}", skipping ${req.elementId}`);
          continue;
        }
        const providerConfig = VIDEO_PROVIDERS[providerId];
        const model = resolveVideoModel(providerId) ?? providerConfig?.models?.[0]?.id;
        const normalized = normalizeVideoOptions(providerId, {
          prompt: req.prompt,
          aspectRatio: req.aspectRatio || "16:9"
        });
        const result = await generateVideo(
          { providerId, apiKey, baseUrl: resolveVideoBaseUrl(providerId), model },
          normalized
        );
        const buf = await downloadToBuffer(result.url);
        const filename = `${req.elementId}.mp4`;
        await fs5.writeFile(path5.join(mediaDir, filename), buf);
        mediaMap[req.elementId] = mediaServingUrl(baseUrl, classroomId, `media/${filename}`);
        log26.info(`Generated video: ${filename}`);
      } catch (err) {
        log26.warn(`Video generation failed for ${req.elementId}:`, err);
      }
    }
  };
  await Promise.all([generateImages(), generateVideos()]);
  return mediaMap;
}
function replaceMediaPlaceholders(scenes, mediaMap) {
  if (Object.keys(mediaMap).length === 0) return;
  for (const scene of scenes) {
    if (scene.type !== "slide") continue;
    const canvas = scene.content?.canvas;
    if (!canvas?.elements) continue;
    for (const el of canvas.elements) {
      if (el.type === "video" && typeof el.mediaRef === "string" && mediaMap[el.mediaRef] && (!el.src || /^gen_vid_[\w-]+$/i.test(el.src))) {
        el.src = mediaMap[el.mediaRef];
        continue;
      }
      if ((el.type === "image" || el.type === "video") && typeof el.src === "string" && isGeneratedMediaPlaceholder(el.src) && mediaMap[el.src]) {
        el.src = mediaMap[el.src];
      }
    }
  }
}
async function generateTTSForClassroom(scenes, classroomId, baseUrl) {
  const audioDir = path5.join(CLASSROOMS_DIR, classroomId, "audio");
  await ensureDir2(audioDir);
  const ttsProviderIds = Object.entries(getServerTTSProviders()).filter(([id, info]) => id !== "browser-native-tts" && !info.disabled).map(([id]) => id);
  if (ttsProviderIds.length === 0) {
    log26.warn("No server TTS provider configured, skipping TTS generation");
    return;
  }
  const providerId = ttsProviderIds[0];
  const apiKey = resolveTTSApiKey(providerId);
  const ttsProvider = TTS_PROVIDERS[providerId];
  if (ttsProvider?.requiresApiKey && !apiKey) {
    log26.warn(`No API key for TTS provider "${providerId}", skipping TTS generation`);
    return;
  }
  const ttsBaseUrl = resolveTTSBaseUrl(providerId) || ttsProvider?.defaultBaseUrl;
  const voice = DEFAULT_TTS_VOICES[providerId] || "default";
  const format = ttsProvider?.supportedFormats?.[0] || "mp3";
  if (providerId === VOXCPM_TTS_PROVIDER_ID && voice === VOXCPM_AUTO_VOICE_ID) {
    log26.warn("VoxCPM Auto Voice requires agent context; skipping server-side TTS generation");
    return;
  }
  for (const scene of scenes) {
    if (!scene.actions) continue;
    scene.actions = splitLongSpeechActions(scene.actions, providerId);
    const sceneOrder = scene.order;
    for (const action of scene.actions) {
      if (action.type !== "speech" || !action.text) continue;
      const speechAction = action;
      const audioId = `tts_s${sceneOrder}_${action.id}`;
      try {
        const result = await generateTTS(
          {
            providerId,
            modelId: DEFAULT_TTS_MODELS[providerId] || "",
            apiKey,
            baseUrl: ttsBaseUrl,
            voice,
            speed: speechAction.speed
          },
          speechAction.text
        );
        const filename = `${audioId}.${result.format || format}`;
        await fs5.writeFile(path5.join(audioDir, filename), result.audio);
        speechAction.audioId = audioId;
        speechAction.audioUrl = mediaServingUrl(baseUrl, classroomId, `audio/${filename}`);
        log26.info(`Generated TTS: ${filename} (${result.audio.length} bytes)`);
      } catch (err) {
        log26.warn(`TTS generation failed for action ${action.id}:`, err);
      }
    }
  }
}
var log26, DOWNLOAD_TIMEOUT_MS, DOWNLOAD_MAX_SIZE;
var init_classroom_media_generation = __esm({
  "OpenMAIC/lib/server/classroom-media-generation.ts"() {
    "use strict";
    init_logger();
    init_classroom_storage();
    init_image_providers();
    init_video_providers();
    init_tts_providers();
    init_constants();
    init_image_providers();
    init_video_providers();
    init_provider_config();
    init_tts_utils();
    init_media_ref();
    init_image_sizing();
    init_voxcpm();
    log26 = createLogger("ClassroomMedia");
    DOWNLOAD_TIMEOUT_MS = 12e4;
    DOWNLOAD_MAX_SIZE = 100 * 1024 * 1024;
  }
});

// OpenMAIC/lib/constants/agent-defaults.ts
var AGENT_COLOR_PALETTE, AGENT_DEFAULT_AVATARS;
var init_agent_defaults = __esm({
  "OpenMAIC/lib/constants/agent-defaults.ts"() {
    "use strict";
    AGENT_COLOR_PALETTE = [
      "#3b82f6",
      "#10b981",
      "#f59e0b",
      "#ec4899",
      "#06b6d4",
      "#8b5cf6",
      "#f97316",
      "#14b8a6",
      "#e11d48",
      "#6366f1",
      "#84cc16",
      "#a855f7"
    ];
    AGENT_DEFAULT_AVATARS = [
      "/avatars/teacher.png",
      "/avatars/assist.png",
      "/avatars/curious.png",
      "/avatars/thinker.png",
      "/avatars/note-taker.png",
      "/avatars/teacher-2.png",
      "/avatars/assist-2.png",
      "/avatars/curious-2.png",
      "/avatars/thinker-2.png",
      "/avatars/note-taker-2.png"
    ];
  }
});

// OpenMAIC/lib/server/classroom-generation.ts
var classroom_generation_exports = {};
__export(classroom_generation_exports, {
  containPBLGenerationError: () => containPBLGenerationError,
  generateClassroom: () => generateClassroom
});
import { nanoid as nanoid4 } from "nanoid";
import {
  applyOutlineFallbacks as applyOutlineFallbacks2,
  generateSceneOutlinesFromRequirements,
  generateSceneActions as generateSceneActions2,
  generateSceneContent as generateSceneContent2,
  PBLGenerationError,
  withGenerationRetry
} from "@openmaic/generation";
function containPBLGenerationError(error, sceneTitle) {
  if (!(error instanceof PBLGenerationError)) throw error;
  log27.warn(`PBL generation failed for scene "${sceneTitle}": ${error.message}`);
  return null;
}
function createInMemoryStore(stage) {
  let state = {
    stage,
    scenes: [],
    currentSceneId: null,
    mode: "playback"
  };
  const listeners2 = [];
  return {
    getState: () => state,
    setState: (partial) => {
      const prev = state;
      state = { ...state, ...partial };
      listeners2.forEach((fn) => fn(state, prev));
    },
    subscribe: (listener) => {
      listeners2.push(listener);
      return () => {
        const idx = listeners2.indexOf(listener);
        if (idx >= 0) listeners2.splice(idx, 1);
      };
    }
  };
}
function stripCodeFences(text) {
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
  }
  return cleaned.trim();
}
async function generateAgentProfiles(requirement, languageDirective, aiCall) {
  const systemPrompt = "You are an expert instructional designer. Generate agent profiles for a multi-agent classroom simulation. Return ONLY valid JSON, no markdown or explanation.";
  const userPrompt = `Generate agent profiles for a course with this requirement:
${requirement}

Requirements:
- Decide the appropriate number of agents based on the course content (typically 3-5)
- Exactly 1 agent must have role "teacher", the rest can be "assistant" or "student"
- Each agent needs: name, role, persona (2-3 sentences describing personality and teaching/learning style)
- Language directive for this course: ${languageDirective}
  Agent names and personas must follow this language directive.

Return a JSON object with this exact structure:
{
  "agents": [
    {
      "name": "string",
      "role": "teacher" | "assistant" | "student",
      "persona": "string (2-3 sentences)"
    }
  ]
}`;
  const response = await aiCall(systemPrompt, userPrompt);
  const rawText = stripCodeFences(response);
  const parsed = JSON.parse(rawText);
  if (!parsed.agents || !Array.isArray(parsed.agents) || parsed.agents.length < 2) {
    throw new Error(`Expected at least 2 agents, got ${parsed.agents?.length ?? 0}`);
  }
  const teacherCount = parsed.agents.filter((a) => a.role === "teacher").length;
  if (teacherCount !== 1) {
    throw new Error(`Expected exactly 1 teacher, got ${teacherCount}`);
  }
  return parsed.agents.map((a, i) => ({
    id: `gen-server-${i}`,
    name: a.name,
    role: a.role,
    persona: a.persona
  }));
}
async function generateClassroom(input, options4) {
  const { requirement, pdfContent } = input;
  await options4.onProgress?.({
    step: "initializing",
    progress: 5,
    message: "Initializing classroom generation",
    scenesGenerated: 0
  });
  const {
    model: languageModel,
    modelInfo,
    modelString,
    providerId,
    apiKey,
    thinkingConfig: classroomThinking
  } = await resolveModel({ stage: "generate-classroom" });
  log27.info(`Using server-configured model: ${modelString}`);
  if (isProviderKeyRequired(providerId) && !apiKey) {
    throw new Error(
      `No API key configured for provider "${providerId}". Set the appropriate key in .env.local or server-providers.yml (e.g. ${providerId.toUpperCase()}_API_KEY).`
    );
  }
  let searchQueryModel = languageModel;
  let searchQueryThinking = classroomThinking;
  const aiCall = async (systemPrompt, userPrompt, _images) => {
    const result = await callLLM(
      {
        model: languageModel,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        maxOutputTokens: modelInfo?.outputWindow
      },
      "generate-classroom",
      void 0,
      classroomThinking
    );
    return result.text;
  };
  const stageModelCache = /* @__PURE__ */ new Map();
  const resolveStageModel = async (stage2) => {
    const cached = stageModelCache.get(stage2);
    if (cached) return cached;
    if (!getStageModel(stage2)) {
      const fallback = {
        model: languageModel,
        outputWindow: modelInfo?.outputWindow,
        thinking: classroomThinking
      };
      stageModelCache.set(stage2, fallback);
      return fallback;
    }
    try {
      const resolved = await resolveModel({ stage: stage2 });
      const entry = {
        model: resolved.model,
        outputWindow: resolved.modelInfo?.outputWindow,
        thinking: resolved.thinkingConfig
      };
      log27.info(`Stage "${stage2}" routed to model: ${resolved.modelString}`);
      stageModelCache.set(stage2, entry);
      return entry;
    } catch (err) {
      log27.warn(
        `Stage "${stage2}" route "${getStageModel(stage2)}" could not be resolved; falling back to the generate-classroom model.`,
        err
      );
      const fallback = {
        model: languageModel,
        outputWindow: modelInfo?.outputWindow,
        thinking: classroomThinking
      };
      stageModelCache.set(stage2, fallback);
      return fallback;
    }
  };
  const resolveSceneContentCall = async (outlineType) => {
    const stage2 = outlineType ? `scene-content:${outlineType}` : "scene-content";
    const { model, outputWindow, thinking } = await resolveStageModel(stage2);
    const aiCall2 = async (systemPrompt, userPrompt, _images) => {
      const result = await callLLM(
        {
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          maxOutputTokens: outputWindow,
          maxRetries: 0
        },
        "generate-classroom-scene",
        void 0,
        thinking
      );
      return result.text;
    };
    return { aiCall: aiCall2, model, thinking };
  };
  let agentProfilesAiCall;
  const getAgentProfilesAiCall = async () => {
    if (agentProfilesAiCall) return agentProfilesAiCall;
    const { model, outputWindow, thinking } = await resolveStageModel("agent-profiles");
    agentProfilesAiCall = async (systemPrompt, userPrompt, _images) => {
      const result = await callLLM(
        {
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          maxOutputTokens: outputWindow
        },
        "generate-classroom",
        void 0,
        thinking
      );
      return result.text;
    };
    return agentProfilesAiCall;
  };
  let sceneActionsAiCall;
  const getSceneActionsAiCall = async () => {
    if (sceneActionsAiCall) return sceneActionsAiCall;
    const { model, outputWindow, thinking } = await resolveStageModel("scene-actions");
    sceneActionsAiCall = async (systemPrompt, userPrompt, _images) => {
      const result = await callLLM(
        {
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          maxOutputTokens: outputWindow,
          maxRetries: 0
        },
        "generate-classroom-scene",
        void 0,
        thinking
      );
      return result.text;
    };
    return sceneActionsAiCall;
  };
  const searchQueryAiCall = async (systemPrompt, userPrompt, _images) => {
    const result = await callLLM(
      {
        model: searchQueryModel,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        maxOutputTokens: 256
      },
      "web-search-query-rewrite",
      void 0,
      searchQueryThinking
    );
    return result.text;
  };
  const requirements = {
    requirement
  };
  const vocationalActive = resolveVocationalActive(requirements);
  const pdfText = pdfContent?.text || void 0;
  await options4.onProgress?.({
    step: "researching",
    progress: 10,
    message: "Researching topic",
    scenesGenerated: 0
  });
  let researchContext;
  if (input.enableWebSearch) {
    const webSearchConfig = resolveClassroomWebSearchConfig(input);
    if (webSearchConfig) {
      const rewriteRoute = getStageModel("web-search-query-rewrite");
      if (rewriteRoute) {
        try {
          const rewriteResolved = await resolveModel({ stage: "web-search-query-rewrite" });
          searchQueryModel = rewriteResolved.model;
          searchQueryThinking = rewriteResolved.thinkingConfig;
        } catch (err) {
          log27.warn(
            `web-search-query-rewrite route "${rewriteRoute}" unavailable; using classroom model for query rewrite`,
            err
          );
        }
      }
      try {
        const searchQuery = await buildSearchQuery(requirement, pdfText, searchQueryAiCall);
        log27.info("Running web search for classroom generation", {
          hasPdfContext: searchQuery.hasPdfContext,
          rawRequirementLength: searchQuery.rawRequirementLength,
          rewriteAttempted: searchQuery.rewriteAttempted,
          finalQueryLength: searchQuery.finalQueryLength
        });
        const searchResult = await searchWeb({
          providerId: webSearchConfig.providerId,
          query: searchQuery.query,
          apiKey: webSearchConfig.apiKey,
          baseUrl: webSearchConfig.baseUrl,
          baiduSubSources: webSearchConfig.baiduSubSources,
          claudeModelId: webSearchConfig.claudeModelId
        });
        researchContext = formatSearchResultsAsContext(searchResult);
        if (researchContext) {
          log27.info(`Web search returned ${searchResult.sources.length} sources`);
        }
      } catch (e) {
        log27.warn("Web search failed, continuing without search context:", e);
      }
    } else {
      log27.warn("enableWebSearch is true but no web search API key configured, skipping web search");
    }
  }
  await options4.onProgress?.({
    step: "generating_outlines",
    progress: 15,
    message: "Generating scene outlines",
    scenesGenerated: 0
  });
  const outlinesResult = await generateSceneOutlinesFromRequirements(
    requirements,
    pdfText,
    void 0,
    aiCall,
    {
      imageGenerationEnabled: input.enableImageGeneration,
      videoGenerationEnabled: input.enableVideoGeneration,
      researchContext
      // NO teacherContext — agents haven't been generated yet
    }
  );
  if (!outlinesResult.success || !outlinesResult.data) {
    log27.error("Failed to generate outlines:", outlinesResult.error);
    throw new Error(outlinesResult.error || "Failed to generate scene outlines");
  }
  const { languageDirective, courseTitle, outlines } = outlinesResult.data;
  log27.info(
    `Generated ${outlines.length} scene outlines (languageDirective: ${languageDirective}, courseTitle: ${courseTitle ?? "n/a"})`
  );
  await options4.onProgress?.({
    step: "generating_outlines",
    progress: 30,
    message: `Generated ${outlines.length} scene outlines`,
    scenesGenerated: 0,
    totalScenes: outlines.length
  });
  let agents;
  const agentMode = input.agentMode || "default";
  if (agentMode === "generate") {
    log27.info("Generating custom agent profiles via LLM...");
    try {
      const agentProfilesCall = await getAgentProfilesAiCall();
      agents = await generateAgentProfiles(requirement, languageDirective, agentProfilesCall);
      log27.info(`Generated ${agents.length} agent profiles`);
    } catch (e) {
      log27.warn("Agent profile generation failed, falling back to defaults:", e);
      agents = getDefaultAgents();
    }
  } else {
    agents = getDefaultAgents();
  }
  const stageId = nanoid4(10);
  const stage = {
    id: stageId,
    name: courseTitle || outlines[0]?.title || requirement.slice(0, 50),
    description: void 0,
    languageDirective,
    videoManifest: buildVideoManifestFromOutlines(outlines),
    style: "interactive",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    // For LLM-generated agents, embed full configs so the client can
    // hydrate the agent registry without prior IndexedDB data.
    // For default agents, just record IDs — the client already has them.
    ...agentMode === "generate" ? {
      generatedAgentConfigs: agents.map((a, i) => ({
        id: a.id,
        name: a.name,
        role: a.role,
        persona: a.persona || "",
        avatar: AGENT_DEFAULT_AVATARS[i % AGENT_DEFAULT_AVATARS.length],
        color: AGENT_COLOR_PALETTE[i % AGENT_COLOR_PALETTE.length],
        priority: a.role === "teacher" ? 10 : a.role === "assistant" ? 7 : 5
      }))
    } : {
      agentIds: agents.map((a) => a.id)
    }
  };
  const store2 = createInMemoryStore(stage);
  const api = createStageAPI(store2);
  log27.info("Stage 2: Generating scene content and actions...");
  let generatedScenes = 0;
  for (const [index, outline] of outlines.entries()) {
    const safeOutline = applyOutlineFallbacks2(outline, true, {
      allowProceduralSkill: vocationalActive
    });
    const progressStart = 30 + Math.floor(index / Math.max(outlines.length, 1) * 60);
    await options4.onProgress?.({
      step: "generating_scenes",
      progress: Math.max(progressStart, 31),
      message: `Generating scene ${index + 1}/${outlines.length}: ${safeOutline.title}`,
      scenesGenerated: generatedScenes,
      totalScenes: outlines.length
    });
    const reportSceneRetry = async (phase, event) => {
      const nextAttempt = Math.min(event.attempt + 1, event.maxAttempts);
      const message = `Retrying scene ${index + 1}/${outlines.length} ${phase} (${nextAttempt}/${event.maxAttempts}): ${safeOutline.title}`;
      log27.warn(`${message} \u2014 ${event.reason}`);
      await options4.onProgress?.({
        step: "generating_scenes",
        progress: Math.max(progressStart, 31),
        message,
        scenesGenerated: generatedScenes,
        totalScenes: outlines.length
      });
    };
    const contentCall = await resolveSceneContentCall(safeOutline.type);
    const content = await (async () => {
      try {
        return await withGenerationRetry(
          () => generateSceneContent2(safeOutline, contentCall.aiCall, {
            agents,
            languageDirective,
            allowProceduralSkill: vocationalActive,
            ...safeOutline.type === "pbl" ? {
              pblLoopFallback: (input2) => generatePBLV2Project(
                input2,
                contentCall.model,
                callLLM,
                { logger: log27 },
                contentCall.thinking
              )
            } : {}
          }),
          {
            label: `scene ${index + 1}/${outlines.length} content`,
            shouldRetryResult: (result) => result === null,
            onRetry: (event) => reportSceneRetry("content", event)
          }
        );
      } catch (error) {
        return containPBLGenerationError(error, safeOutline.title);
      }
    })();
    if (!content) {
      log27.warn(`Skipping scene "${safeOutline.title}" \u2014 content generation failed`);
      continue;
    }
    const actionsAiCall = await getSceneActionsAiCall();
    const actions = await withGenerationRetry(
      () => generateSceneActions2(safeOutline, content, actionsAiCall, {
        agents,
        languageDirective
      }),
      {
        label: `scene ${index + 1}/${outlines.length} actions`,
        onRetry: (event) => reportSceneRetry("actions", event)
      }
    );
    log27.info(`Scene "${safeOutline.title}": ${actions.length} actions`);
    const sceneId = createSceneWithActions(safeOutline, content, actions, api);
    if (!sceneId) {
      log27.warn(`Skipping scene "${safeOutline.title}" \u2014 scene creation failed`);
      continue;
    }
    generatedScenes += 1;
    const progressEnd = 30 + Math.floor((index + 1) / Math.max(outlines.length, 1) * 60);
    await options4.onProgress?.({
      step: "generating_scenes",
      progress: Math.min(progressEnd, 90),
      message: `Generated ${generatedScenes}/${outlines.length} scenes`,
      scenesGenerated: generatedScenes,
      totalScenes: outlines.length
    });
  }
  const scenes = store2.getState().scenes;
  log27.info(`Pipeline complete: ${scenes.length} scenes generated`);
  if (scenes.length === 0) {
    throw new Error("No scenes were generated");
  }
  if (input.enableImageGeneration || input.enableVideoGeneration) {
    await options4.onProgress?.({
      step: "generating_media",
      progress: 90,
      message: "Generating media files",
      scenesGenerated: scenes.length,
      totalScenes: outlines.length
    });
    try {
      const mediaMap = await generateMediaForClassroom(outlines, stageId, options4.baseUrl);
      replaceMediaPlaceholders(scenes, mediaMap);
      log27.info(`Media generation complete: ${Object.keys(mediaMap).length} files`);
    } catch (err) {
      log27.warn("Media generation phase failed, continuing:", err);
    }
  }
  if (input.enableTTS) {
    await options4.onProgress?.({
      step: "generating_tts",
      progress: 94,
      message: "Generating TTS audio",
      scenesGenerated: scenes.length,
      totalScenes: outlines.length
    });
    try {
      await generateTTSForClassroom(scenes, stageId, options4.baseUrl);
      log27.info("TTS generation complete");
    } catch (err) {
      log27.warn("TTS generation phase failed, continuing:", err);
    }
  }
  await options4.onProgress?.({
    step: "persisting",
    progress: 98,
    message: "Persisting classroom data",
    scenesGenerated: scenes.length,
    totalScenes: outlines.length
  });
  const persisted = await persistClassroom(
    {
      id: stageId,
      stage,
      scenes
    },
    options4.baseUrl
  );
  log27.info(`Classroom persisted: ${persisted.id}, URL: ${persisted.url}`);
  await options4.onProgress?.({
    step: "completed",
    progress: 100,
    message: "Classroom generation completed",
    scenesGenerated: scenes.length,
    totalScenes: outlines.length
  });
  return {
    id: persisted.id,
    url: persisted.url,
    stage,
    scenes,
    scenesCount: scenes.length,
    createdAt: persisted.createdAt
  };
}
var log27;
var init_classroom_generation = __esm({
  "OpenMAIC/lib/server/classroom-generation.ts"() {
    "use strict";
    init_llm();
    init_stage_api();
    init_scene_generation();
    init_planner();
    init_store2();
    init_logger();
    init_providers();
    init_web_search_config();
    init_resolve_model();
    init_model_routes();
    init_feature_flags();
    init_search_query_builder();
    init_web_search();
    init_classroom_storage();
    init_classroom_media_generation();
    init_video_manifest();
    init_agent_defaults();
    log27 = createLogger("Classroom");
  }
});

// work/openmaic-integration/generate-demo.cjs
var require_generate_demo = __commonJS({
  "work/openmaic-integration/generate-demo.cjs"() {
    var fs6 = __require("node:fs");
    require_main().config({ path: ".env.local" });
    async function main() {
      const { generateClassroom: generateClassroom2 } = (init_classroom_generation(), __toCommonJS(classroom_generation_exports));
      const result = await generateClassroom2({ requirement: "\u8BF7\u7528\u7B80\u4F53\u4E2D\u6587\u751F\u6210\u4E00\u4E2A\u7CBE\u7B80\u7684\u5C11\u513F\u7F16\u7A0B\u53EF\u89C6\u5316\u7EA0\u9519\u8BFE\u5802\uFF0C\u53EA\u9700\u4E09\u4E2A\u573A\u666F\uFF1A\u4E00\u4E2A\u7B80\u77EDslide\u3001\u4E00\u4E2A\u539F\u751Finteractive\u3001\u4E00\u4E2Aquiz\u3002\u4F8B\u5B50\uFF1A\u6570\u7EC4a=[2,4,6]\uFF0C\u5FAA\u73AFfor(i=0;i<=3;i++)\u6C42\u548C\u5BFC\u81F4\u4E0B\u68073\u8D8A\u754C\uFF1B\u6B63\u786E\u8FB9\u754C\u4E3Ai<3\u3002interactive\u5FC5\u987BwidgetType=simulation\uFF0Ccontent.html\u662F\u5B8C\u6574\u53EF\u8FD0\u884CHTML/CSS/JS\uFF0C\u63D0\u4F9B\u9010\u6B65\u6267\u884C\u3001\u91CD\u7F6E\u3001\u4FEE\u6539\u5FAA\u73AF\u8FB9\u754C\u7684\u63A7\u5236\uFF0C\u753B\u51FA\u6570\u7EC4\u683C\u5B50\u548C\u5F53\u524D\u4E0B\u6807\u7BAD\u5934\uFF0C\u52A8\u6001\u5C55\u793Ai\u548Csum\uFF0C\u8D8A\u754C\u65F6\u660E\u663E\u6807\u7EA2\u3002\u4E0D\u8981\u53EA\u7528\u6587\u5B57\u63CF\u8FF0\u4EA4\u4E92\u3002quiz\u8BA9\u5B66\u751F\u9009\u62E9\u6B63\u786E\u5FAA\u73AF\u8FB9\u754C\u5E76\u89E3\u91CA\u3002\u4EC5\u4F7F\u7528\u6B64\u7B80\u5355\u793A\u4F8B\uFF0C\u4E0D\u7F16\u9020\u5B66\u751F\u4E2A\u4EBA\u4FE1\u606F\u3002", enableImageGeneration: false, enableVideoGeneration: false, enableTTS: false, agentMode: "default" }, { baseUrl: process.env.CODEMATE_OPENMAIC_PUBLIC_URL, onProgress: (p) => console.log("PROGRESS", p.step, p.scenesGenerated, p.totalScenes || "") });
      const summary = { id: result.id, url: result.url, scenes: result.scenesCount, interactiveHtml: result.scenes.filter((s) => s.content?.type === "interactive" && s.content.html?.trim()).length };
      fs6.writeFileSync("../work/openmaic-integration/demo-result.json", JSON.stringify(summary, null, 2));
      console.log("OFFICIAL_GENERATOR_RESULT", JSON.stringify(summary));
    }
    main().catch((e) => {
      console.error("DEMO_FAILED", e.name, e.message);
      process.exitCode = 1;
    });
  }
});
export default require_generate_demo();
