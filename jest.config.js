module.exports = {
  preset: "ts-jest", // Use ts-jest preset
  testEnvironment: "jsdom", // Set the environment to JSDOM for browser-like testing
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"], // Specify module file extensions
  testMatch: ["**/src/**/*.test.(ts)"], // Specify test file patterns
  collectCoverage: true, // Collect coverage information
  coverageDirectory: ".temp/coverage", // Output coverage information to the coverage directory
  coverageReporters: ["text", "lcov"], // Report coverage in text and lcov formats
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};
