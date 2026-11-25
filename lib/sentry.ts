import * as Sentry from "@sentry/nextjs";
import { parse as parseCookies } from "cookie";
import type { IncomingMessage } from "http";
import type { Span, SpanAttributes } from "@sentry/core";
import { sanitizeLogMessage, scrubSensitiveAttributes } from "./sentryConfig";

export interface SessionCookiePayload {
  username?: string;
  status?: string;
  name?: string;
}

export interface UserContextOverride {
  id?: string | number | null;
  username?: string | null;
  status?: string | null;
  department?: string | null;
  group_name?: string | null;
  type?: string | null;
}

/**
 * Runs a business operation inside a Sentry child span with low-cardinality naming
 * and safe attribute scrubbing.
 */
export async function withBusinessSpan<T>(
  name: string,
  op: string,
  attributes: SpanAttributes | undefined,
  fn: (span: Span) => Promise<T> | T
): Promise<T> {
  const safeAttributes = scrubSensitiveAttributes(
    attributes as Record<string, unknown> | undefined
  ) as SpanAttributes | undefined;

  return Sentry.startSpan(
    {
      name,
      op,
      attributes: safeAttributes,
    },
    async (span) => {
      try {
        return await fn(span);
      } catch (error) {
        if (span.isRecording()) {
          span.setStatus({ code: 2, message: "internal_error" });
        }
        throw error;
      }
    }
  );
}

/** Safely parses the JSON-encoded `session` cookie from an incoming Pages API request. */
export function parseSessionCookie(
  req?: Pick<IncomingMessage, "headers"> | { headers?: { cookie?: string } }
): SessionCookiePayload | null {
  const cookieHeader = req?.headers?.cookie;
  if (!cookieHeader) {
    return null;
  }

  const cookies = parseCookies(cookieHeader);
  if (!cookies.session) {
    return null;
  }

  try {
    const parsed = JSON.parse(cookies.session) as SessionCookiePayload;
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Binds user identity and non-sensitive department/role attributes to the current
 * request isolation scope so both streamed spans and Sentry logs share the context.
 */
export function attachSessionUserContext(
  req?: Pick<IncomingMessage, "headers"> | { headers?: { cookie?: string } },
  userOverride?: UserContextOverride
): SessionCookiePayload | null {
  const session = parseSessionCookie(req);
  const username = userOverride?.username ?? session?.username ?? undefined;
  const userId = userOverride?.id ?? username;
  const role = userOverride?.status ?? session?.status ?? undefined;

  if (userId || username) {
    Sentry.setUser({
      ...(userId ? { id: String(userId) } : {}),
      ...(username ? { username: String(username) } : {}),
    });
  }

  const scopeAttributes: Record<string, string> = {};
  if (role) {
    scopeAttributes["user.role"] = String(role);
  }
  if (userOverride?.department) {
    scopeAttributes["user.department"] = String(userOverride.department);
  }
  if (userOverride?.group_name) {
    scopeAttributes["user.group_name"] = String(userOverride.group_name);
  }
  if (userOverride?.type) {
    scopeAttributes["user.type"] = String(userOverride.type);
  }

  if (Object.keys(scopeAttributes).length > 0) {
    Sentry.setAttributes(scopeAttributes);
  }

  return session;
}

/** Extracts safe, secret-free error metadata for Sentry structured logs. */
export function sanitizeErrorForLog(error: unknown): {
  error_name: string;
  error_message: string;
  http_status?: number;
  error_code?: string;
} {
  if (error && typeof error === "object") {
    const err = error as {
      name?: unknown;
      message?: unknown;
      code?: unknown;
      response?: { status?: unknown };
    };
    const httpStatus =
      typeof err.response?.status === "number" ? err.response.status : undefined;
    const errorCode =
      typeof err.code === "string" ? err.code : undefined;

    return {
      error_name: typeof err.name === "string" ? err.name : "Error",
      error_message: sanitizeLogMessage(
        typeof err.message === "string" ? err.message : "Unknown error"
      ),
      ...(httpStatus !== undefined ? { http_status: httpStatus } : {}),
      ...(errorCode ? { error_code: errorCode } : {}),
    };
  }

  return {
    error_name: "Error",
    error_message: sanitizeLogMessage(String(error ?? "Unknown error")),
  };
}
