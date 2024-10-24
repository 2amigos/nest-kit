/* eslint-disable */
export default {
  displayName: "packages-crudx-swagger-demo-crudx-swagger-demo",
  preset: "../../../../jest.preset.js",
  testEnvironment: "node",
  transform: {
    "^.+\\.[tj]s$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.spec.json" }],
  },
  moduleFileExtensions: ["ts", "js", "html"],
  coverageDirectory:
    "../../../../../coverage/packages/packages/crudx-swagger/demo/crudx-swagger-demo",
};
