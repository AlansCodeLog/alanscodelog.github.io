/* Note, esm tailwind not working. And typescript version works but changes to theme don't get applied. */
// const plugin = require("tailwindcss/plugin")
// const {fontFamily} = require('tailwindcss/defaultTheme')
// const textFillStroke = require('tailwindcss-text-fill-stroke')
import { fontFamily } from "tailwindcss/defaultTheme"
import plugin from "tailwindcss/plugin"
import textFillStroke from "tailwindcss-text-fill-stroke"

/** import("tailwindcss").Config; */
export default {
	content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
	theme: {

		fontFamily: {
			// "display": [`"Oxanium Variable"`/* ,...fontFamily.sans */],
			// 'display': [`"Grenze Gotisch Variable"`,...fontFamily.sans],
			// 'display': [`"Cinzel Decorative"`,...fontFamily.sans],
			display: [`"Megrim"`, ...fontFamily.sans],
			body: [...fontFamily.sans],
			mono: [`"Hack"`, ...fontFamily.mono],
			title: [`"Share Tech Mono"`, ...fontFamily.mono],
		},
		extend: {
			fontSize: {
				// xs: ["0.75rem", "0.75rem"],
			},
			screens: {
				"not-print": { raw: "not print" },
			},
			"text-shadow": {
				sm: "0 1px 2px var(--tw-shadow-color)",
				DEFAULT: "0 2px 4px var(--tw-shadow-color)",
				md: "0 2px 4px var(--tw-shadow-color)",
				lg: "0 6px 8px var(--tw-shadow-color)",
			},
			gridTemplateColumns: theme => {
				const spacing = theme("spacing")
				return {
					...Object.fromEntries(Object.keys(spacing).map(key =>
						[`fill-${key}`, `repeat(auto-fill, minmax(${spacing[key]}, 1fr))`],
					)),
					...Object.fromEntries(Object.keys(spacing).map(key =>
						[`fit-${key}`, `repeat(auto-fit, minmax(${spacing[key]}, 1fr))`],
					)),
				}
			},
		},
	},
	plugins: [
		textFillStroke,
		plugin(function({ matchUtilities, theme }) {
			matchUtilities(
				{ "text-shadow": value => ({ "text-shadow": value }) },
				{ values: theme("text-shadow") },
			)
			matchUtilities(
				{ "grid-cols-fit": value => ({ "grid-template-columns": `repeat(auto-fit, minmax(${value}, 1fr))` }) },
			)
			matchUtilities(
				{ "grid-cols-fill": value => ({ "grid-template-columns": `repeat(auto-fill, minmax(${value}, 1fr))` }) },
			)
		}),
	],
}
