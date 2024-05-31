import "dotenv/config"

import mdx from "@astrojs/mdx"
// https://astro.build/config
import sitemap from "@astrojs/sitemap"
// https://astro.build/config
import svelte from "@astrojs/svelte"
// https://astro.build/config
import tailwind from "@astrojs/tailwind"
import vue from "@astrojs/vue"
import { defineConfig, sharpImageService } from "astro/config"
import icon from "astro-icon"
import robotsTxt from "astro-robots-txt"

// https://astro.build/config
export default defineConfig({
	output: "static",
	site: process.env.SITE_URL,
	integrations: [
		mdx(),
		sitemap({
			filter: page => !page.includes(".private"),
		}),
		vue({ appEntrypoint: "/src/components/App.ts" }),
		tailwind({ configFile: "tailwind.config.js" }),
		svelte(),
		icon({
			include: {
				devicon: ["*"],
				"fa6-solid": ["*"],
			},
		}),
		robotsTxt(),
	],
	image: {
		service: sharpImageService(),
	},
	markdown: {
		shikiConfig: {
			// theme: 'one-dark-pro',
			theme: "dark-plus",
			wrap: true,
		},
		smartypants: false,
	},
	// adapter: node({
	// 	mode: "standalone"
	// }),
})
