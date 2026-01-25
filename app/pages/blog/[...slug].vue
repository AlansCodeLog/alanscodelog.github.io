<script setup lang="ts">
import type { ContentNavigationItem } from "@nuxt/content"
import { mapContentNavigation } from "#ui/utils/content"
import { findPageBreadcrumb } from "@nuxt/content/utils"

const route = useRoute()

const { data: page } = await useAsyncData(route.path, () =>
	queryCollection("blog").path(route.path).first(),
)
if (!page.value) throw createError({ statusCode: 404, statusMessage: "Page not found", fatal: true })
const { data: surround } = await useAsyncData(`${route.path}-surround`, () =>
	queryCollectionItemSurroundings("blog", route.path, {
		fields: ["description"],
	}),
)

const navigation = inject<Ref<ContentNavigationItem[]>>("navigation", ref([]))
const blogNavigation = computed(() => navigation.value.find(item => item.path === "/blog")?.children || [])

const breadcrumb = computed(() => mapContentNavigation(findPageBreadcrumb(blogNavigation?.value, page.value?.path)).map(({ icon, ...link }) => link))

if (page.value.image) {
	defineOgImage({ url: page.value.image })
}
else {
	defineOgImageComponent("Blog", {
		headline: breadcrumb.value.map(item => item.label).join(" > "),
	}, {
		fonts: ["Geist:400", "Geist:600"],
	})
}

const title = page.value?.seo?.title || page.value?.title
const description = page.value?.seo?.description || page.value?.description

useSeoMeta({
	title,
	description,
	ogDescription: description,
	ogTitle: title,
})

const articleLink = computed(() => `${window?.location}`)

const formatDate = (dateString: string) => {
	return new Date(dateString).toLocaleDateString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
	})
}
</script>

<template>
	<UMain
		class="mt-20 px-2"
		:style="{ '--toc-sticky-width': '1300px' }"
	>
		<UContentToc
			title="Table of Contents"
			:ui="{
				root: `
					fixed
					bottom-20
					top-45
					left-[unset]!
					right-0
					h-[unset]!
					w-[calc((100cqw-var(--ui-container))/2-10px)]
					overflow-y-auto
					backdrop-filter-none
					@max-6xl/main:hidden!
					px-4!
					mx-[unset]!
				`,
			}"
			:links="page?.body?.toc?.links"
		/>
		<USlideover
			:ui="{
			}"
		>
			<div
				class="
				sticky
				z-10
				top-10
				right-0
				bottom-[unset]
				@min-6xl/main:hidden
				flex items-center justify-end
			"
			>
				<div class="p-3">
					<UButton
						label="TOC"
						color="neutral"
						variant="subtle"
					/>
				</div>
			</div>

			<template #content>
				<UContentToc
					title="Table of Contents"
					:expanded="true"
					:ui="{
						root: `
							mx-[unset]!
							px-4!
						`,
					}"
					:links="page?.body?.toc?.links"
				/>
			</template>
		</USlideover>
		<UContainer class="relative min-h-screen">
			<UPage v-if="page">
				<ULink
					to="/blog"
					class="text-sm flex items-center gap-1"
				>
					<UIcon name="lucide:chevron-left" />
					Blog
				</ULink>
				<div class="flex flex-col gap-3 mt-8">
					<div class="flex text-xs text-muted items-center justify-center gap-2">
						<span v-if="page.date">
							{{ formatDate(page.date) }}
						</span>
					</div>
					<NuxtImg
						v-if="page.image"
						:src="page.image"
						:alt="page.title"
						class="rounded-lg w-full h-[300px] object-contain object-center"
					/>
					<h1 class="text-4xl text-center font-medium max-w-3xl mx-auto mt-4">
						{{ page.title }}
					</h1>
					<p class="text-muted text-center max-w-2xl mx-auto">
						{{ page.description }}
					</p>
				</div>
				<UPageBody class="max-w-3xl mx-auto">
					<ContentRenderer
						v-if="page.body"
						:value="page"
					/>

					<div class="flex items-center justify-end gap-2 text-sm text-muted">
						<UButton
							size="sm"
							variant="link"
							color="neutral"
							label="Copy link"
							@click="copyToClipboard(articleLink, 'Post link copied to clipboard')"
						/>
					</div>
					<UContentSurround :surround />
				</UPageBody>
			</UPage>
		</UContainer>
	</UMain>
</template>
