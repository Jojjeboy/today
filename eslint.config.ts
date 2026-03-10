import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";

export default tseslint.config(
  {
    ignores: [
        "dist", 
        "build", 
        "coverage", 
        "scripts", 
        "**/*.json", 
        "**/*.js", 
        "**/*.cjs", 
        "vite.config.ts",
        "tailwind.config.js",
        "postcss.config.js"
    ],
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      react: pluginReact,
    },
    rules: {
       ...pluginReact.configs.flat.recommended.rules,
       "react/react-in-jsx-scope": "off",
       "@typescript-eslint/no-explicit-any": "warn",
       "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
       "no-undef": "off" // TypeScript handles this
    },
    settings: {
        react: {
            version: "detect"
        }
    }
  }
);
