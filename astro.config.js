import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

import image from "@astrojs/image";

// https://astro.build/config
import vue from "@astrojs/vue";

// https://astro.build/config
import node from "@astrojs/node";

// https://astro.build/config
import tailwind from "@astrojs/tailwind";


// https://astro.build/config
export default defineConfig({
	output: "server",
	site:"https://alanscodelog.com",
	integrations: [
		mdx(),
		sitemap(),
		image({
			serviceEntryPoint: '@astrojs/image/sharp'
		}),
		vue({
			appEntrypoint: '/src/components/App.ts'
		}),
		tailwind()
	],
	adapter: node({
		mode: "standalone"
	})
});
