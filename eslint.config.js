import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import globals from "globals";

export default defineConfig([
	{
		files: ["**/*.{js,mjs,cjs}"],
		plugins: {
			js,
			"simple-import-sort": simpleImportSort,
		},
		ignores: [
			"public/jsMinified/**/*",
			"public/cssMinified/**/*"
		],
		// extends: ["js/recommended"],
		rules: {
			"indent": ["error", "tab"],
			"linebreak-style": ["error", "unix"],
			"no-dupe-keys": "error",
			"no-duplicate-imports": "error",
			"quotes": ["error", "double"],
			"semi": ["error", "always"],
			"simple-import-sort/exports": "error",
			"simple-import-sort/imports": "error"
		},
		languageOptions: { globals: globals.browser },
	},
]);