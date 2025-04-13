import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import globals from "globals";

export default defineConfig([
	{
		files: ["**/*.{js,mjs,cjs}"],
		plugins: { js },
		rules: {
			"quotes": ["error", "double"],
			"semi": ["error", "always"]
		},
		languageOptions: { globals: globals.browser },
	},
]);