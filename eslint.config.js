import { allFileTypes, tsEslintConfig, vueConfig } from "@alanscodelog/eslint-config"
import eslintPluginAstro from "eslint-plugin-astro"
export default tsEslintConfig( // this is just a re-export of tsEslint.config
	// https://github.com/AlansCodeLog/eslint-config
	...eslintPluginAstro.configs.recommended,
	...vueConfig,
	{
		files: [`**/*.{${allFileTypes.join(",")}}`],
		ignores: [
			// ...
		],
	},
	// RULE LINKS
	// Eslint: https://eslint.org/docs/rules/
	// Typescript: https://typescript-eslint.io/rules/
	// Vue: https://eslint.vuejs.org/rules/
)
