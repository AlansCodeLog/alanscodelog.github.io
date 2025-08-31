<script setup lang="ts">
const { data: page } = await useAsyncData("blog-page", () => {
	return queryCollection("pages").path("/blog")
		.first()
})
if (!page.value) {
	throw createError({
		statusCode: 404,
		statusMessage: "Page not found",
		fatal: true,
	})
}
const { data: posts } = await useAsyncData("blogs", () => {
	const query = queryCollection("blog").order("date", "DESC")
	return import.meta.dev
		? query.all()
		: query
				.where("published", "=", true)
				.all()
})
if (!posts.value) {
	throw createError({
		statusCode: 404,
		statusMessage: "blogs posts not found",
		fatal: true,
	})
}

useSeoMeta({
	title: page.value?.seo?.title || page.value?.title,
	ogTitle: page.value?.seo?.title || page.value?.title,
	description: page.value?.seo?.description || page.value?.description,
	ogDescription: page.value?.seo?.description || page.value?.description,
})
</script>

<template>
	<UPage v-if="page">
		<UPageHero
			:title="page.title"
			:description="page.description"
			:links="page.links"
			:ui="{
				title: '!mx-0 text-left',
				description: '!mx-0 text-left',
				container: '!py-10',
				links: 'justify-start',
			}"
		/>
		<UPageSection
			:ui="{
				container: '!pt-0',
			}"
		>
			<UBlogPosts
				orientation="vertical"
				class="!gap-6"
			>
				<BlogPostPreview
					v-for="(post, index) in posts"
					:key="index"
					:post="post"
				/>
			</UBlogPosts>
		</UPageSection>
	</UPage>
</template>
