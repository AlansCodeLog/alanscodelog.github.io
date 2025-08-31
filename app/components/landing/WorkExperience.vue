<script setup lang="ts">
import type { IndexCollectionItem } from "@nuxt/content"

defineProps<{
	page: IndexCollectionItem
}>()
const uLinkComponent = resolveComponent("ULink")
</script>

<template>
	<UPageSection
		:title="page.experience.title"
		:ui="{
			container: '!p-0 gap-4 sm:gap-4 max-w-[600px]',
			title: 'text-left text-xl sm:text-xl lg:text-2xl font-medium',
			description: 'mt-2',
		}"
	>
		<template #description>
			<div class="flex flex-col gap-2">
				<Motion
					v-for="(experience, index) in page.experience.items"
					:key="index"
					:initial="{ opacity: 0, transform: 'translateY(20px)' }"
					:while-in-view="{ opacity: 1, transform: 'translateY(0)' }"
					:transition="{ delay: 0.4 + 0.2 * index }"
					:in-view-options="{ once: true }"
					class="text-muted flex items-center text-nowrap gap-2"
				>
					<p class="text-sm font-mono">
						{{ experience.date }}
					</p>
					<USeparator />

					<component
						:is="experience.company?.url ? uLinkComponent : 'div'"
						:disabled="!experience?.company?.url"
						class="flex items-center gap-1"
						:to="experience?.company?.url ?? '#'"
						target="_blank"
					>
						<LandingWorkExperienceLink :experience="experience" />
					</component>
				</Motion>
			</div>
		</template>
	</UPageSection>
</template>

<style scoped>

</style>
