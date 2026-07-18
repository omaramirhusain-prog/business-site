import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
      "server-only": resolve(__dirname, "node_modules/server-only/empty.js"),
    },
  },
  test: {
    environment: "node",
    env: {
      AUTH_USE_LOCAL_DB: "true",
      AUTH_LOCAL_DB_PATH: "/tmp/business-site-auth-test.sqlite",
    },
    fileParallelism: false,
  },
});
