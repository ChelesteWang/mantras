const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testMatch: ["**/src/**/*.test.ts"],
  testPathIgnorePatterns: ["/dist/"],
  transform: {
    "^.+\\.tsx?$": "ts-jest"
  }
};