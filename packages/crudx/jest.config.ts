/* eslint-disable */
export default {
  displayName: "crudx-tests",
  preset: "../../jest.preset.js",
  testEnvironment: "node",
  transform: {
    "^.+\\.[tj]s$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.spec.json" }],
  },
  moduleFileExtensions: ["ts", "js", "html"],
  coverageReporters: ["json", "clover"],
  coverageDirectory: "../../coverage/packages/crudx",
};
