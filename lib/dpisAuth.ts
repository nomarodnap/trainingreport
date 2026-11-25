import axios from "axios";
import * as Sentry from "@sentry/nextjs";
import pool from "./db";
import { sanitizeErrorForLog, withBusinessSpan } from "./sentry";

const DPIS_SLOW_THRESHOLD_MS = 3000;

export interface DpisTokenResponse {
  accessToken?: string;
  [key: string]: unknown;
}

export interface DpisUserData {
  per_cardno?: string;
  pn_name?: string;
  per_name?: string;
  per_surname?: string;
  pertype_name?: string;
  pl_name?: string;
  per_level_name?: string;
  org_name?: string;
  org_name1?: string;
  org_name2?: string;
  [key: string]: unknown;
}

export interface DpisAuthCheckResult {
  httpStatus: number;
  hasPayload: boolean;
  userData: DpisUserData | null;
  parseError?: unknown;
}

/** Requests an OAPI access token from DPIS inside a dedicated Sentry child span. */
export async function requestDpisToken(
  provider: "dpis" | "thaid" = "dpis"
): Promise<DpisTokenResponse> {
  const domain = process.env.DPIS_DOMAIN;
  const username = process.env.DPIS_API_USER;
  const password = process.env.DPIS_API_PASS;

  return withBusinessSpan(
    "auth.dpis_get_token",
    "http.client.dpis",
    { "auth.provider": provider, "dpis.endpoint": "oapi/login" },
    async (span) => {
      const startedAt = Date.now();
      try {
        const response = await axios.post(`${domain}oapi/login`, {
          username,
          password,
        });
        const durationMs = Date.now() - startedAt;
        const hasToken = Boolean(response.data?.accessToken);

        span.setAttributes({
          "dpis.http_status": response.status,
          "dpis.has_access_token": hasToken,
          "dpis.duration_ms": durationMs,
        });

        if (durationMs >= DPIS_SLOW_THRESHOLD_MS) {
          Sentry.logger.warn("DPIS OAPI token endpoint responded slowly", {
            auth_provider: provider,
            dpis_endpoint: "oapi/login",
            http_status: response.status,
            duration_ms: durationMs,
          });
        }

        return response.data as DpisTokenResponse;
      } catch (error) {
        const durationMs = Date.now() - startedAt;
        const safeErr = sanitizeErrorForLog(error);
        if (safeErr.http_status !== undefined) {
          span.setAttribute("dpis.http_status", safeErr.http_status);
        }
        span.setAttribute("dpis.duration_ms", durationMs);

        Sentry.logger.warn("DPIS OAPI token request failed", {
          auth_provider: provider,
          dpis_endpoint: "oapi/login",
          duration_ms: durationMs,
          ...safeErr,
        });
        throw error;
      }
    }
  );
}

/** Verifies user credentials against DPIS authcheck inside a Sentry child span. */
export async function checkDpisAuth(
  username: string,
  password: string,
  accessToken: string,
  provider: "dpis" | "thaid" = "dpis"
): Promise<DpisAuthCheckResult> {
  const domain = process.env.DPIS_DOMAIN;

  return withBusinessSpan(
    "auth.dpis_authcheck",
    "http.client.dpis",
    { "auth.provider": provider, "dpis.endpoint": "api/authuser/authcheck" },
    async (span) => {
      const startedAt = Date.now();
      try {
        const apiResponse = await axios.post(
          `${domain}api/authuser/authcheck`,
          new URLSearchParams({
            authen_user: username,
            authen_password: password,
          }).toString(),
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              Authorization: accessToken,
            },
          }
        );

        const durationMs = Date.now() - startedAt;
        span.setAttributes({
          "dpis.http_status": apiResponse.status,
          "dpis.duration_ms": durationMs,
        });

        if (durationMs >= DPIS_SLOW_THRESHOLD_MS) {
          Sentry.logger.warn("DPIS authcheck endpoint responded slowly", {
            auth_provider: provider,
            dpis_endpoint: "api/authuser/authcheck",
            http_status: apiResponse.status,
            duration_ms: durationMs,
          });
        }

        if (!apiResponse.data?.data) {
          span.setAttribute("auth.authenticated", false);
          return {
            httpStatus: apiResponse.status,
            hasPayload: false,
            userData: null,
          };
        }

        let userData: DpisUserData;
        try {
          userData =
            typeof apiResponse.data.data === "string"
              ? (JSON.parse(apiResponse.data.data) as DpisUserData)
              : (apiResponse.data.data as DpisUserData);
        } catch (parseError) {
          span.setAttribute("auth.authenticated", false);
          return {
            httpStatus: apiResponse.status,
            hasPayload: true,
            userData: null,
            parseError,
          };
        }

        span.setAttribute("auth.authenticated", Boolean(userData?.per_cardno));
        return {
          httpStatus: apiResponse.status,
          hasPayload: true,
          userData,
        };
      } catch (error) {
        const durationMs = Date.now() - startedAt;
        const safeErr = sanitizeErrorForLog(error);
        if (safeErr.http_status !== undefined) {
          span.setAttribute("dpis.http_status", safeErr.http_status);
        }
        span.setAttributes({
          "auth.authenticated": false,
          "dpis.duration_ms": durationMs,
        });

        Sentry.logger.warn("DPIS authcheck request failed", {
          auth_provider: provider,
          dpis_endpoint: "api/authuser/authcheck",
          duration_ms: durationMs,
          ...safeErr,
        });
        throw error;
      }
    }
  );
}

/** Upserts a DPIS-authenticated user via the shared MySQL pool and returns their role status. */
export async function upsertDpisUser(
  userId: string,
  userData: DpisUserData,
  encryptedPassword: string,
  provider: "dpis" | "thaid" = "dpis"
): Promise<string | null> {
  return withBusinessSpan(
    "auth.sync_user",
    "db.sync",
    { "auth.provider": provider },
    async (span) => {
      await pool.execute(
        `INSERT INTO users (id, username, title, first_name, last_name, type, position, level, department, group_name, under_department1, password, last_login)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
         ON DUPLICATE KEY UPDATE
           title = VALUES(title),
           first_name = VALUES(first_name),
           last_name = VALUES(last_name),
           type = VALUES(type),
           position = VALUES(position),
           level = VALUES(level),
           department = VALUES(department),
           group_name = VALUES(group_name),
           under_department1 = VALUES(under_department1),
           password = VALUES(password),
           updated_at = CURRENT_TIMESTAMP,
           last_login = CURRENT_TIMESTAMP`,
        [
          userId,
          userData.per_cardno,
          userData.pn_name,
          userData.per_name,
          userData.per_surname,
          userData.pertype_name,
          userData.pl_name,
          userData.per_level_name,
          userData.org_name,
          userData.org_name1,
          userData.org_name2,
          encryptedPassword,
        ]
      );

      const [rows] = (await pool.execute(
        "SELECT status FROM users WHERE username = ?",
        [userData.per_cardno]
      )) as unknown as [Array<{ status?: string | null }>, unknown];

      const status = rows.length > 0 ? (rows[0].status ?? null) : null;
      if (status) {
        span.setAttribute("user.role", status);
      }
      if (userData.org_name) {
        span.setAttribute("user.department", userData.org_name);
      }
      return status;
    }
  );
}
