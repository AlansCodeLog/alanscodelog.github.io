<script setup lang="ts">
import type { IndexCollectionItem } from "@nuxt/content"

defineProps<{
	experience: IndexCollectionItem["experience"]["items"][0]
}>()
</script>

<template>
	<span class="text-sm">
		{{ experience.position }}
	</span>
	<div
		v-if="experience.company"
		class="inline-flex items-center gap-1"
		:style="{ color: experience.company?.color }"
	>
		<span class="font-medium">{{ experience.company.name }}</span>
		<UIcon
			v-if="experience.company?.logo"
			:name="experience.company.logo"
		/>
	</div>
</template>

<style scoped>

</style>
