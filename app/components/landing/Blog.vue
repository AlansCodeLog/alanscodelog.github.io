<script setup lang="ts">
import type { IndexCollectionItem } from "@nuxt/content"

defineProps<{
	page: IndexCollectionItem
}>()

const { data: posts } = await useAsyncData("index-blogs", () =>
	queryCollection("blog").order("date", "DESC").limit(3)
		.where("published", "=", true)
		.all(),
)
if (!posts.value) {
	throw createError({ statusCode: 404, statusMessage: "blogs posts not found", fatal: true })
}
</script>

<template>
	<UPageSection
		:title="page.blog.title"
		:description="page.blog.description"
		:ui="{
			container: 'px-0 !pt-0 sm:gap-6 lg:gap-8',
			title: 'text-center text-xl sm:text-xl lg:text-2xl font-medium',
			description: 'text-left mt-2 text-sm sm:text-md lg:text-sm text-muted',
		}"
	>
		<UBlogPosts
			orientation="vertical"
			class="!gap-2"
		>
			<BlogPostPreview
				v-for="(post, index) in posts"
				:key="index"
				:post="post"
			/>
		</UBlogPosts>
		<UButton
			to="/blog"
			label="View all posts"
			variant="outline"
			:ui="{
				label: 'w-full text-center font-bold text-lg',
			}"
		/>
	</UPageSection>
</template>
