import mdx from "@astrojs/mdx"
// https://astro.build/config
import node from "@astrojs/node"
import sitemap from "@astrojs/sitemap"
// https://astro.build/config
import svelte from "@astrojs/svelte"
// https://astro.build/config
import tailwind from "@astrojs/tailwind"
import vue from "@astrojs/vue"
import { defineConfig, sharpImageService } from "astro/config"
import icon from "astro-icon"

// https://astro.build/config
export default defineConfig({
  output: "static",
  site: "https://alanscodelog.com",
  integrations: [
	mdx(),
	sitemap(),
	vue({ appEntrypoint: "/src/components/App.ts" }),
	tailwind({ configFile: "tailwind.config.js" }),
	svelte(),
	icon({
      include: {
        devicon: ["*"],
      },
    }),
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
  experimental: {
    assets: true,
  },
})
