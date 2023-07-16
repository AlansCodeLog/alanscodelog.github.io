import {getCollection, type CollectionEntry} from "astro:content";
import {type ExtractByValue, dedupe}from "@alanscodelog/utils"
export const getListOfTagLike = async (key:ExtractByValue<CollectionEntry<"blog">["data"], string[]> = "tags"):Promise<string[]> => {
	const posts = (
		await getCollection(
			"blog",
			(post) => post.data.published && post.data[key] !== undefined
		)
	)
		.sort((a, b) => a.data.pubDate.valueOf() - b.data.pubDate.valueOf())
		.reverse();
	const value = dedupe(posts.map((post) => post.data[key]).flat()).sort()

	return value as string[]
}
