module.exports = {
  preset: "ts-jest", // Use ts-jest preset
  testEnvironment: "node", // Set the environment to Node.js
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"], // Specify module file extensions
  testMatch: ["**/src/**/*.test.(ts)"], // Specify test file patterns
  collectCoverage: true, // Collect coverage information
  coverageDirectory: ".temp/coverage", // Output coverage information to the coverage directory
  coverageReporters: ["text", "lcov"], // Report coverage in text and lcov formats
};
