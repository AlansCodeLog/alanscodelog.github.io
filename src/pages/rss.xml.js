import rss from "@astrojs/rss"
import { getCollection } from "astro:content"

import { SITE_DESCRIPTION, SITE_TITLE } from "../consts"


export async function get(context) {
	const posts = await getCollection("blog")
	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		// items: [{

		// }]
		items: posts.map(post => ({
			title: post.data.title,
			link: `/posts/${post.slug}/`,
			description: post.data.description,
			pubDate: post.data.pubDate,
		})),
	})
}
2
