module.exports = {
  env: { browser: true, es2020: true, node: true, commonjs: true, jest: true },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime",
    "plugin:react-hooks/recommended",
    "plugin:testing-library/recommended",
    "plugin:testing-library/react",
    "plugin:jest-dom/recommended",
  ],
  parserOptions: { ecmaVersion: "latest", sourceType: "module" },
  settings: { react: { version: "18.2" } },
  plugins: ["react-refresh", "testing-library", "jest-dom"],
  rules: {
    "react-refresh/only-export-components": "warn",
  },
  globals: {
    process: true,
    module: true,
  },
};
