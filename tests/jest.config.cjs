module.exports = {
  roots: ["<rootDir>/tests"],
  testMatch: ["**/?(*.)+(unit|integration).test.ts"],
  transform: { "^.+\\.(ts|tsx)$": "ts-jest" },
  setupFilesAfterEnv: ["<rootDir>/tests/setupTests.ts"],
  testEnvironment: "node",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  reporters: ["default", ["jest-junit", { outputDirectory: "test-results", outputName: "junit.xml" }]],
  testTimeout: 30000,
};
