# Sentry-Managed OpenTelemetry (`@opentelemetry/api`) Design

**Date:** 2026-11-25
**Status:** Approved in chat, pending spec review
**Base Repository State:** Local `main` (`1a2a306`) syncing with `origin/main` (`65298f8`)

---

## 1. Goal & Scope

Enable standard OpenTelemetry tracing via `@opentelemetry/api` in this Next.js (`^15.4.6`) application while letting `@sentry/nextjs` (`^11.17.0`) manage the OpenTelemetry pipeline internally—without deploying a separate OpenTelemetry Collector or configuring a standalone `OTLPTraceExporter`.

### In Scope
1. Restore local uncommitted `package-lock.json` drift and merge `origin/main` (`65298f8`: `feat: setup Sentry error monitoring and optimize PM2 ecosystem config`) into `main`.
2. Install `@opentelemetry/api` (`^1.9.1`, matching `@sentry/nextjs` `11.17.0` and resolving to `1.10.0`) as a direct dependency in `package.json`.
3. Explicitly configure `enableOpenTelemetrySetup: true` inside `Sentry.init(...)` in `sentry.server.config.ts`.
4. Verify package deduplication, TypeScript type-checking, Next.js production build, and runtime `@opentelemetry/api` recording span behavior.

### Out of Scope
- Deploying or configuring an OpenTelemetry Collector (`otelcol-contrib`) or separate OTLP exporters (`NodeSDK` / `NodeTracerProvider` / `OTLPTraceExporter`).
- Modifying `server.js`, `ecosystem.config.js`, `instrumentation.ts`, `sentry.edge.config.ts`, `instrumentation-client.ts`, `next.config.ts`, or existing API route/page files.
- Adding wrapper/helper modules around `@opentelemetry/api` or instrumenting individual business API routes.

---

## 2. Architecture & Data Flow

```
Next.js Server Boot (Node.js runtime)
  └─ instrumentation.ts :: register()
       └─ sentry.server.config.ts :: Sentry.init({ enableOpenTelemetrySetup: true, ... })
            ├─ Registers Sentry OTel TracerProvider, SentryContextManager, SentryPropagator
            └─ Registers global API via @opentelemetry/api (Symbol.for('opentelemetry.js.api.1'))

Application Code / Auto-Instrumented Libraries (future or existing)
  ├─ Next.js / HTTP / MySQL2 (auto-instrumented by @sentry/nextjs)
  └─ trace.getTracer(...).startActiveSpan(...) via @opentelemetry/api
       └─ Creates native Sentry child spans attached to active trace
            └─ Sampled by tracesSampleRate & sent via Sentry native transport (no Collector)
```

### Key Architectural Decisions
- **Single Global `@opentelemetry/api` Instance:** Declaring `@opentelemetry/api@^1.9.1` in `package.json` ensures `npm` dedupes the direct dependency with `@sentry/nextjs` `11.17.0` (`@opentelemetry/api@^1.9.1` -> `1.10.0`). This prevents split global registries where `trace.getTracer()` would return a `NoopTracer`.
- **Server-Only `enableOpenTelemetrySetup`:** Per `@sentry/nextjs` v11 configuration rules, `enableOpenTelemetrySetup` is only supported on the server runtime (`sentry.server.config.ts`). Edge (`sentry.edge.config.ts`) and Browser (`instrumentation-client.ts`) configurations remain unchanged.
- **Custom Server Trade-off (`server.js`):** Per project constraint, `server.js` (`node server.js` in `package.json` and `ecosystem.config.js`) is left unchanged. Next.js invokes `instrumentation.ts` during `app.prepare()`, which covers Next.js SSR, API routes, `mysql2` queries, and `@opentelemetry/api` spans inside routes, while the outer `http.createServer` call in `server.js` runs before `app.prepare()`.

---

## 3. Component Changes

| File | Action | Details |
| --- | --- | --- |
| `package-lock.json` | Restore then update | Discard pre-existing local lockfile diff (`1a2a306` drift), merge `origin/main` (`65298f8`), and update via `npm install` + `npm install @opentelemetry/api@^1.9.1`. |
| `package.json` | Merge + modify | Bring in `@sentry/nextjs` (`^11.17.0`) from `65298f8` and add `@opentelemetry/api` (`^1.9.1`) to `dependencies`. |
| `sentry.server.config.ts` | Merge + modify | Bring in from `65298f8` and add `enableOpenTelemetrySetup: true` inside `Sentry.init(...)`, preserving `dsn` (`process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN`) and `tracesSampleRate` (`process.env.NODE_ENV === "development" ? 1.0 : 0.1`). |
| `instrumentation.ts`, `sentry.edge.config.ts`, `instrumentation-client.ts`, `next.config.ts`, `ecosystem.config.js`, `app/global-error.tsx`, `pages/_error.tsx`, `pages/signin.js` | Merge unchanged | Brought in as-is from `origin/main` (`65298f8`). |

---

## 4. Error Handling & Resilience

- **Missing/Invalid DSN:** If `SENTRY_DSN` and `NEXT_PUBLIC_SENTRY_DSN` are unset at runtime, `@sentry/nextjs` disables transport without crashing the server, and `@opentelemetry/api` falls back to its built-in no-op tracer (`NoopSpan`).
- **Unhandled Request Errors:** `instrumentation.ts` continues to export `onRequestError = Sentry.captureRequestError`, preserving error capture and trace correlation across active spans.
- **Sampling Control:** Tracing volume remains governed by `tracesSampleRate` (`1.0` in development, `0.1` in production) on `Sentry.init(...)`.

---

## 5. Verification Strategy

Implementation is complete only when all of the following pass cleanly on the final committed files:

1. **Git State Check:** `git status -sb` shows clean working tree with `origin/main` (`65298f8`) merged and no leftover temporary files.
2. **Single `@opentelemetry/api` Resolution:** `npm ls @opentelemetry/api` confirms a single deduped version (`1.10.0` / matching `@sentry/nextjs` `^1.9.1`) across the dependency tree.
3. **Type & Build Checks:**
   - `npx tsc --noEmit` exits `0`.
   - `npm run build` (`next build` + `postbuild` `next-sitemap`) exits `0`.
4. **Runtime OTel Span Verification (Throwaway Check):**
   - Execute a one-off `node -e` check (leaving no files in the repo) that loads `.env.local`, transpiles `sentry.server.config.ts` in memory with the already-installed `typescript` package (`ts.transpileModule`), runs it under `NODE_ENV=development`, and asserts that `trace.getTracer('verify').startActiveSpan(...)` from `@opentelemetry/api` produces a recording span (`span.isRecording() === true`) with a non-zero `traceId`.
