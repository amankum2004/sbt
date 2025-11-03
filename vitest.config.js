import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom", // or "jsdom"
    globals: true,            // allows using `expect`/`describe` without import
    setupFiles: "./test/setupTests.js",
    coverage: {
      reporter: ["text", "html"],
      exclude: ["node_modules/", "test/"],
    },
  },
  resolve: {
  alias: {
    react: path.resolve('./node_modules/react'),
    'react-dom': path.resolve('./node_modules/react-dom'),
  },
},
});
