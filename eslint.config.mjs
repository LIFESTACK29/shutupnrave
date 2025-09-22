import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Allow explicit any usage across the project
      '@typescript-eslint/no-explicit-any': 'off',
      // Optionally allow ts-ignore/expect-error comments if needed
      '@typescript-eslint/ban-ts-comment': 'off'
    }
  }
];

export default eslintConfig;
