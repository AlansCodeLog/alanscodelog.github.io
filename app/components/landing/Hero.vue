<script setup lang="ts">
import type { IndexCollectionItem } from "@nuxt/content"

const { footer, global } = useAppConfig()

defineProps<{
	page: IndexCollectionItem
}>()
</script>

<template>
	<UPageHero
		:ui="{
			headline: 'flex items-center justify-center',
			title: 'text-shadow-md max-w-lg mx-auto',
			links: 'mt-4 flex-col justify-center items-center',
			container: '!py-10 !pb-15',
		}"
	>
		<template #title>
			<Motion
				:initial="{
					scale: 1.1,
					opacity: 0,
					filter: 'blur(20px)',
				}"
				:animate="{
					scale: 1,
					opacity: 1,
					filter: 'blur(0px)',
				}"
				:transition="{
					duration: 0.6,
					delay: 0.1,
				}"
			>
				{{ page.title }}
			</Motion>
		</template>

		<template #description>
			<Motion
				:initial="{
					scale: 1.1,
					opacity: 0,
					filter: 'blur(20px)',
				}"
				:animate="{
					scale: 1,
					opacity: 1,
					filter: 'blur(0px)',
				}"
				:transition="{
					duration: 0.6,
					delay: 0.3,
				}"
			>
				{{ page.description }}
			</Motion>
		</template>

		<template #links>
			<Motion
				:initial="{
					scale: 1.1,
					opacity: 0,
					filter: 'blur(20px)',
				}"
				:animate="{
					scale: 1,
					opacity: 1,
					filter: 'blur(0px)',
				}"
				:transition="{
					duration: 0.6,
					delay: 0.5,
				}"
			>
				<div
					v-if="page.hero.links"
					class="flex items-center gap-2"
				>
					<UButton
						:color="global.available ? 'success' : 'error'"
						variant="ghost"
						class="gap-2"
						:to="global.available ? 'mailto:' + global.email : ''"
						:label="global.available ? 'Available for new projects' : 'Not available at the moment'"
					>
						<template #leading>
							<span class="relative flex size-2">
								<span
									class="absolute inline-flex size-full rounded-full opacity-75"
									:class="global.available ? 'bg-success animate-ping' : 'bg-error'"
								/>
								<span
									class="relative inline-flex size-2 scale-90 rounded-full"
									:class="global.available ? 'bg-success' : 'bg-error'"
								/>
							</span>
						</template>
					</UButton>
				</div>
			</Motion>

			<div class="gap-x-4 inline-flex mt-4">
				<Motion
					v-for="(link, index) of footer?.links"
					:key="index"

					:initial="{
						scale: 1.1,
						opacity: 0,
						filter: 'blur(20px)',
					}"
					:animate="{
						scale: 1,
						opacity: 1,
						filter: 'blur(0px)',
					}"
					:transition="{
						duration: 0.6,
						delay: 0.5 + index * 0.1,
					}"
				>
					<UButton
						v-bind="{ size: 'md', color: 'neutral', variant: 'ghost', ...link }"
					/>
				</Motion>
			</div>
		</template>

		<UCarousel
			v-slot="{ item: img }"
			loop
			dots
			arrows
			:autoplay="{ delay: 3000 }"
			wheel-gestures
			:items="page.hero.images"
			:ui="{
				item: 'basis-1/3',
				viewport: 'py-4',
			}"
		>
			<UModal
				color="neutral"
				variant="subtle"
				:description="img.description"
				:title="img.alt"
				:ui="{
					content: 'w-[800px] max-w-[80vw]',
				}"
			>
				<picture>
					<source
						v-if="img.src?.endsWith('webp')"
						:srcset="img.src"
						type="image/webp"
					>
					<NuxtImg
						width="234"
						height="234"
						class="
						cursor-pointer
						hover:scale-110
						transition-transform
						aspect-square
						rounded-md
						object-cover
						border
						dark:border-neutral-800
						border-neutral-200
						shadow-md
						shadow-black/30
					"
						:title="img.alt"
						:src="img.src.endsWith('webp') ? img.src!.replace('.webp', '.png') : img.src"
						:alt="img.alt"
					/>
					<!-- :class="index % 2 === 0 ? '-rotate-3' : 'rotate-3'" -->
				</picture>
				<template #header>
					<div class="flex flex-col gap-4">
						<div class="flex items-center gap-4">
							<div class="text-lg font-bold">
								{{ img.alt }}
							</div>
							<a
								v-if="img.url"
								:href="img.url"
								target="_blank"
								class="text-sm text-muted"
							>
								(Link)
							</a>
						</div>
						<div class="text-sm text-toned">
							{{ img.description }}
						</div>
					</div>
				</template>
				<USeparator />
				<template #body>
					<div class="w-800px max-w-80vw flex flex-col gap-4">
						<ScriptYouTubePlayer
							v-if="img.popupType === 'youtube'"
							ref="video"
							:video-id="img.popup!"
						>
							<template #awaitingLoad>
								<div class="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 h-[48px] w-[68px]">
									<svg
										height="100%"
										version="1.1"
										viewBox="0 0 68 48"
										width="100%"
									><path
										d="M66.52,7.74c-0.78-2.93-2.49-5.41-5.42-6.19C55.79,.13,34,0,34,0S12.21,.13,6.9,1.55 C3.97,2.33,2.27,4.81,1.48,7.74C0.06,13.05,0,24,0,24s0.06,10.95,1.48,16.26c0.78,2.93,2.49,5.41,5.42,6.19 C12.21,47.87,34,48,34,48s21.79-0.13,27.1-1.55c2.93-0.78,4.64-3.26,5.42-6.19C67.94,34.95,68,24,68,24S67.94,13.05,66.52,7.74z"
										fill="#f00"
									/><path
										d="M 45,24 27,14 27,34"
										fill="#fff"
									/></svg>
								</div>
							</template>
						</ScriptYouTubePlayer>
						<img
							v-else-if="img.popupType === 'image'"
							width="800"
							class="rounded-lg w-full"
							v-bind="{ src: img.popup, alt: img.alt }"
						>
						<video
							v-else-if="img.popupType === 'video'"
							width="800"
							class="rounded-lg w-full"
							:src="img.popup"
							controls
							autoplay
						/>
						<img
							v-else
							width="800"
							class="rounded-lg w-full"
							v-bind="img"
						>
					</div>
				</template>
			</UModal>
		</UCarousel>
	</UPageHero>
</template>
