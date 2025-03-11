import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["scripts/**/*.test.{ts,js}", "src/**/*.test.{ts,js}"],
    exclude: ["**/node_modules/**", "packages/**"],
  },
});
