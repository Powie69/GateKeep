import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import globals from "globals";

export default defineConfig([
	{
		files: ["**/*.{js,mjs,cjs}"],
		plugins: { js },
		rules: {
			"indent": ["error", "tab"],
			"quotes": ["error", "double"],
			"semi": ["error", "always"]
		},
		languageOptions: { globals: globals.browser },
	},
]);