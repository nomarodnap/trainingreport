import * as Sentry from "@sentry/nextjs";
import { createBeforeSendLog, SERVER_DATA_COLLECTION } from "./lib/sentryConfig";

Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Enables Tracing.
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,

  integrations: [
    Sentry.consoleLoggingIntegration({ levels: ["warn", "error"] }),
  ],

  beforeSendLog: createBeforeSendLog(),
  dataCollection: SERVER_DATA_COLLECTION,
});
