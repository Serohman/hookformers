// @ts-check
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.strict,
  {
    files: ["**/*.{js,jsx,ts,tsx"],
    rules: {
      "no-require-imports": "off", // Because this https://tigeroakes.com/posts/jest-mock-and-import-statements/
    },
  },
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      globals: {
        module: "writable",
        exports: "writable",
      },
    },
    rules: {
      "no-unused-vars": "warn",
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "warn",
    },
  }
);
