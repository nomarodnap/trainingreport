import * as Sentry from "@sentry/nextjs";
import { CLIENT_DATA_COLLECTION, createBeforeSendLog } from "./lib/sentryConfig";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Enables Tracing.
  // Capture 100% in dev, 10% in production
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
  integrations: [
    Sentry.replayIntegration(),
    Sentry.feedbackIntegration({
      colorScheme: "system",
    }),
    Sentry.consoleLoggingIntegration({ levels: ["warn", "error"] }),
  ],

  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  beforeSendLog: createBeforeSendLog(),
  dataCollection: CLIENT_DATA_COLLECTION,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
