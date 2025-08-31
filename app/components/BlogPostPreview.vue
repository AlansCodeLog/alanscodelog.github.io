<template>
	<UBlogPost
		variant="ghost"
		orientation="horizontal"
		:to="post.path"
		v-bind="post"
		:ui="{
			body: '!p-2',
			root: (post.image ? '' :'lg:grid-cols-1') + (post.published ? '' : ' border border-red-500/50'),
			image: 'object-contain p-2',
		}"
	>
		<template #description>
			<div>
				<p
					v-for="line in post.description.split('\n')"
					:key="line"
				>
					{{ line }}
				</p>
			</div>
		</template>
	</UBlogPost>
</template>

<script setup lang="ts">
import type { BlogCollectionItem } from "@nuxt/content"

defineProps<{
	post: BlogCollectionItem
}>()
</script>
