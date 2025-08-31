<script setup lang="ts">
import type { IndexCollectionItem } from "@nuxt/content"

defineProps<{
	page: IndexCollectionItem
}>()
// const uLinkComponent = resolveComponent("ULink")
</script>

<template>
	<UPageSection
		:title="page.about.title"
		:description="page.about.description"
		:orientation="'vertical'"
		:ui="{
			container: '!p-0 !gap-8',
			title: 'text-left text-xl sm:text-xl lg:text-2xl font-medium',
			description: 'text-left mt-3 text-sm sm:text-md lg:text-sm text-muted',
		}"
	>
		<UPageList
			class="gap-4 grid md:grid-cols-2 grid-rows-2 grid-cols-1"
		>
			<Motion
				v-for="(entry, index) in page.about.details"
				:key="entry.title"
				:initiak="{ opacity: 0, transform: 'translateY(20px)' }"
				:while-in-view="{ opacity: 1, transform: 'translateY(0)' }"
				:transition="{ delay: 0.4 + 0.2 * index }"
				:in-view-options="{ once: true }"
				class="
					text-muted
					text-nowrap
					col-span-1 row-span-1
				"
			>
				<UPageCard
					v-bind="entry"
					:key="entry.title"
					variant="subtle"
					spotlight
					spotlight-color="primary"
					:leading="true"
					class="h-full w-full"
					:ui="{
						container: '!py-3 !px-4',
					}"
				/>
			</Motion>
		</UPageList>
	</UPageSection>
</template>

<style scoped>

</style>
