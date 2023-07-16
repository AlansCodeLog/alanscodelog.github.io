module.exports = {
	extends: [
		"plugin:astro/recommended",
		"@alanscodelog/eslint-config/typescript" //todo typescript not working
	],
	rules: {
		"@typescript-eslint/lines-between-class-members":"off"
	},

	overrides: [
		{
			files: ["*.astro"],
			parser: "astro-eslint-parser",
			parserOptions: {
				parser: "@typescript-eslint/parser",
				extraFileExtensions: [".astro"],
				"sourceType": "module",
			},
			rules: {
				"semi":["warn", "never"],
			},
		},
	],
}
