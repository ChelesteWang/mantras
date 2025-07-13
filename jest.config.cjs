/** @type {import("jest").Config} **/
module.exports = {
  testMatch: [
    "**/src/**/*.test.ts",
    "**/test/**/*.test.ts"
  ],
  testPathIgnorePatterns: [
    "/dist/",
    "/node_modules/"
  ],
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { useESM: true }]
  },
  preset: "ts-jest/presets/js-with-ts-esm"
};