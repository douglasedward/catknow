import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import eslintPluginImport from 'eslint-plugin-import';
import prettier from 'eslint-config-prettier';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    plugins: {
      import: eslintPluginImport,
    },
    rules: {
      'import/order': 'off',
    },
  },
  {
    rules: {
      ...prettier.rules,
    },
  },
];

export default eslintConfig;
