import type { init } from "@sentry/nextjs";

type SentryInitOptions = NonNullable<Parameters<typeof init>[0]>;
type BeforeSendLog = NonNullable<SentryInitOptions["beforeSendLog"]>;
type LogEvent = Parameters<BeforeSendLog>[0];
type DataCollectionOptions = NonNullable<SentryInitOptions["dataCollection"]>;

const SENSITIVE_SUBSTRINGS = [
  "password",
  "passwd",
  "pwd",
  "api_pass",
  "token",
  "secret",
  "cookie",
  "authorization",
  "bearer",
  "jwt",
  "session_id",
  "sessionid",
  "api_key",
  "apikey",
  "private_key",
];

const SENSITIVE_EXACT_KEYS = new Set([
  "auth",
  "authen_password",
  "dpis_api_pass",
  "encryption_secret",
  "nextauth_secret",
  "thaid_client_secret",
  "set-cookie",
  "x-api-key",
]);

/** Returns true if an attribute key represents credentials, tokens, cookies, or secrets. */
export function isSensitiveKey(key: string): boolean {
  const lower = key.toLowerCase();
  if (SENSITIVE_EXACT_KEYS.has(lower)) {
    return true;
  }
  return SENSITIVE_SUBSTRINGS.some((snippet) => lower.includes(snippet));
}

function scrubValue(value: unknown, depth = 0): unknown {
  if (depth > 3 || value === null || value === undefined) {
    return value;
  }
  if (typeof value === "string") {
    return sanitizeLogMessage(value);
  }
  if (Array.isArray(value)) {
    return value.map((item) => scrubValue(item, depth + 1));
  }
  if (typeof value === "object") {
    const cleaned: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (!isSensitiveKey(k)) {
        cleaned[k] = scrubValue(v, depth + 1);
      }
    }
    return cleaned;
  }
  return value;
}

/** Removes sensitive secret/credential keys from a log attributes object. */
export function scrubSensitiveAttributes(
  attributes?: Record<string, unknown>
): Record<string, unknown> | undefined {
  if (!attributes) {
    return attributes;
  }
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(attributes)) {
    if (!isSensitiveKey(key)) {
      cleaned[key] = scrubValue(value);
    }
  }
  return cleaned;
}

/** Redacts inline bearer tokens and password/secret query/key-value fragments from log text. */
export function sanitizeLogMessage(message: string): string {
  return message
    .replace(/\bBearer\s+[A-Za-z0-9._~+/=-]+/gi, "Bearer [Filtered]")
    .replace(
      /\b(password|passwd|pwd|authen_password|token|access_token|id_token|secret|client_secret|cookie)=([^\s&;,]+)/gi,
      "$1=[Filtered]"
    )
    .replace(
      /"(password|passwd|pwd|authen_password|accessToken|id_token|secret|client_secret)"\s*:\s*"[^"]*"/gi,
      '"$1":"[Filtered]"'
    );
}

/** Creates the shared beforeSendLog hook for server, edge, and client Sentry.init(). */
export function createBeforeSendLog(): BeforeSendLog {
  return (log: LogEvent): LogEvent | null => {
    if (
      process.env.NODE_ENV === "production" &&
      (log.level === "debug" || log.level === "trace")
    ) {
      return null;
    }

    const sanitizedAttributes = scrubSensitiveAttributes(log.attributes);
    const sanitizedMessage =
      typeof log.message === "string"
        ? sanitizeLogMessage(log.message)
        : log.message;

    return {
      ...log,
      message: sanitizedMessage,
      attributes: sanitizedAttributes,
    };
  };
}

export const SERVER_DATA_COLLECTION: DataCollectionOptions = {
  userInfo: true,
  cookies: false,
  httpHeaders: {
    request: { deny: ["cookie", "authorization", "x-csrf-token"] },
    response: { deny: ["set-cookie"] },
  },
  httpBodies: [],
  urlQueryParams: {
    deny: ["code", "token", "access_token", "id_token", "password", "secret"],
  },
  databaseQueryData: false,
  stackFrameVariables: false,
};

export const CLIENT_DATA_COLLECTION: DataCollectionOptions = {
  userInfo: true,
  cookies: false,
  httpBodies: [],
  urlQueryParams: {
    deny: ["code", "token", "access_token", "id_token", "password", "secret"],
  },
};
