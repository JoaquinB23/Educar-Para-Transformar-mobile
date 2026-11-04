import { defineConfig, globalIgnores } from 'eslint/config';
import expoConfig from 'eslint-config-expo/flat.js';
import prettierConfig from 'eslint-config-prettier/flat';

export default defineConfig([
  globalIgnores(['dist/*', '.expo/*', 'eslint.config.mjs']),
  expoConfig,
  prettierConfig,
]);
