import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs/config";

const nextConfig: NextConfig = {
  /* config options here */
};

export default withSentryConfig(nextConfig, {
  org: "department-of-fisheries-thaila",
  project: "trainingreport",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,
});
