import path from "path"
import { run } from "@alanscodelog/utils/node"
import { existsSync, readdirSync } from "fs"
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	modules: [
		"@nuxt/eslint",
		"@nuxt/image",
		"@nuxt/ui",
		"@nuxt/content",
		"@vueuse/nuxt",
		"nuxt-og-image",
		"motion-v/nuxt",
		"@nuxt/scripts",
		"@nuxt/fonts",
		"nuxt-studio",
		"@nuxtjs/seo",
	],

	devtools: {
		enabled: true,
	},
	css: ["~/assets/css/main.css"],
	site: {
		url: "https://alanscodelog.github.io",
		name: "Alan's Code Log",
		trailingSlash: true,
	},
	experimental: {
		defaults: {
			nuxtLink: {
				trailingSlash: "append", // 'append' or 'remove'
			},
		},
	},
	compatibilityDate: "2024-11-01",

	nitro: {
		prerender: {
			routes: [
				"/",
			],
			crawlLinks: true,
		},
	},
	hooks: {
		"components:extend": (components) => {
			const globals = components.filter(c => c.pascalName.startsWith("md"))

			globals.forEach(c => c.global = true)
		},
		"build:before": async () => {
			const dirPath = path.join(process.cwd(), "public", "posts")
			const thumbDirPath = path.join(process.cwd(), "public", "thumbs")

			if (!existsSync(dirPath)) {
				throw new Error("Posts directory not found")
			}
			if (!existsSync(thumbDirPath)) {
				throw new Error("Thumbs directory not found")
			}

			const files = [
				...readdirSync(dirPath).map(file => `${dirPath}/${file}`),
				...readdirSync(thumbDirPath).map(file => `${thumbDirPath}/${file}`),
			]

			for (const file of files) {
				if (!file.endsWith(".mp4")) continue

				const inputPath = file
				// const outputPath = inputPath.replace(".mp4", ".webp")
				const outputPath = inputPath.replace(".mp4", ".gif")

				if (existsSync(outputPath)) continue
				try {
					const result = await run([
						"ffprobe",
						"-v",
						"error",
						"-show_entries",
						"format=duration",
						"-of",
						"default=noprint_wrappers=1:nokey=1",
						inputPath,
					]).promise
					if (!result) throw new Error(`ffprobe failed for ${file}`)
					const dur = parseFloat(result)
					if (dur > 30) console.warn(`⚠️  ${file} is ${dur.toFixed(1)}s. Cap of 500 frames will apply.`)
				} catch {
					console.warn(`⚠️  ffprobe failed for ${file}`)
				}

				console.log(`Processing: ${file}`)

				try {
					await run(
						// [
						// 	"-i", inputPath,
						// 	// scale to 720px width, maintain aspect ratio
						// 	"-vf", "fps=15,scale=720:-1:flags=lanczos", // Framerate limit
						// 	"-frames:v", "500", // Frame count limit
						// 	"-vcodec", "libwebp",
						// 	// infinite loop
						// 	"-lossless", "0",
						// 	"-compression_level", "4",
						// 	"-loop", "0",
						// 	// remove audio
						// 	"-an",
						// 	"-y",
						// 	outputPath,
						// ],
						[
							"ffmpeg",
							"-i", inputPath,
							"-vf", "fps=15,scale=480:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse",
							"-frames:v", "500",
							"-loop", "0",
							"-y",
							outputPath,
						],
					).promise.catch(_ => undefined)
					console.log(`Finished: ${file}`)
				} catch (e) {
					console.error(`Error with ${file}:`, e)
				}
			}
		},
	},
	eslint: {
		config: {
			stylistic: {
				indent: "tab",
				quotes: "double",
				semi: false,
				jsx: true,
				braceStyle: "1tbs",
			},
		},
	},

	fonts: {
		provider: "google",
		families: [
			{ name: "Roboto", weights: [400, 700], global: true, provider: "google" },
		],
	},

	linkChecker: {
		skipInspections: ["no-underscores"],
		excludeLinks: [
			// unpublished blog posts
			"/blog/_**",
		],
	},
	ogImage: {
		fonts: [
			"Roboto:400",
			"Roboto:700",
		],
	},
})
