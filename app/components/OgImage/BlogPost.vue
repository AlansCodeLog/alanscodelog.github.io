<script setup>
import { useSiteConfig } from "#site-config/app/composables"

const props = defineProps({
	title: { type: String, required: false },
	icon: { type: String, required: false },
	siteName: { type: String, required: false },
	theme: { type: String, required: false, default: "#6366f1" },
	description: { type: String, required: false },
	image: { type: String, required: false },
})
const siteConfig = useSiteConfig()
const title = props.title || siteConfig.title || "Build something amazing"
const siteName = props.siteName || siteConfig.name || "Acme"
</script>

<template>
	<div
		class="w-full h-full flex flex-col p-6"
		:style="{ background: theme }"
	>
		<div class="flex flex-col justify-between items-center h-full flex-2 gap-6">
			<!-- Title -->
			<h1
				class="
					font-black
					tracking-wide
					text-white
					m-1
					text-[56px]
					line-clamp-2
					text-center
					block
				"
				style="text-shadow: 0 2px 10px rgba(0,0,0,0.2);"
			>
				{{ title }}
			</h1>
			<div class="flex-1 flex flex-row gap-6 items-center w-full">
				<div
					v-if="image"
					class="
					w-1/3
					h-full
					flex
					rounded-xl
					overflow-hidden
					shadow-2xl
				"
				>
					<img
						:src="image"
						class="w-full h-full object-cover"
					>
				</div>
				<div
					v-if="description"
					class="
						text-neutral-200
						text-[45px]
						line-clamp-4
						overflow-hidden
						flex-1
						max-h-[300px]
					"
				>
					{{ description.slice(0, 140) + "..." }}
				</div>
			</div>

			<!-- Logo / Site name -->
			<div class="flex flex-row justify-center items-center gap-4 pt-2">
				<div
					v-if="icon"
					class="
						flex
						items-center
						justify-center
						rounded-full
						bg-white/20
						w-14
						h-14
						overflow-hidden
					"
				>
					<img
						class="h-full w-full"
						:src="icon"
					>
				</div>
				<span
					class="
					font-black
					text-blue-400
					text-[40px]
				"
				>{{ siteName }}</span>
			</div>
		</div>
	</div>
</template>
