<script setup lang="ts">
import type { NuxtError } from "#app"

const props = defineProps({
	error: {
		type: Object as PropType<NuxtError>,
		required: true,
	},
})
console.log(props.error.stack)

useHead({
	htmlAttrs: {
		lang: "en",
	},
})

useSeoMeta({
	title: "Page not found",
	description: "We are sorry but this page could not be found.",
})

const [{ data: navigation }, { data: files }] = await Promise.all([
	useAsyncData("navigation", () => {
		return Promise.all([
			queryCollectionNavigation("blog"),
		])
	}, {
		transform: data => data.flat(),
	}),
	useLazyAsyncData("search", () => {
		return Promise.all([
			queryCollectionSearchSections("blog"),
		])
	}, {
		server: false,
		transform: data => data.flat(),
	}),
])
</script>

<template>
	<div>
		<AppHeader
			:links="navLinks"
		/>
		<UMain class="flex flex-col items-center justify-center">
			<UPage :ui="{ root: 'h-full items-center justify-center flex-1' }">
				<UError
					:ui="
						{
							root:
								'min-h-auto',
						}"
					:error="error"
				/>
				<div
					class="p-6 min-h-500px w-[500px] overflow-auto"
				>
					<pre>{{ error.stack }}</pre>
				</div>
			</UPage>
		</UMain>

		<AppFooter />

		<ClientOnly>
			<LazyUContentSearch
				:files="files"
				shortcut="meta_k"
				:navigation="navigation"
				:links="navLinks"
				:fuse="{ resultLimit: 42 }"
			/>
		</ClientOnly>

		<UToaster />
	</div>
</template>
