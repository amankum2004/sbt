const { defineConfig } = require("vitest/config");

module.exports = defineConfig({
  test: {
    include: ["tests/unit/**/*.test.js", "tests/integration/**/*.test.js"],
    environment: "node",
    globals: true,
  },
});
