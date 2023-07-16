import { defineCollection, z } from 'astro:content';
const blog = defineCollection({
	// Type-check frontmatter using a schema
	schema:  ({image}) =>  z.object({
		title: z.string(),
		description: z.string().optional(),
		// Transform string to Date object
		pubDate: z
			.string()
			.or(z.date())
			.transform((val) => new Date(val)),
		updatedDate: z
			.string()
			.optional()
			.transform((str) => (str ? new Date(str) : undefined)),
		published: z.boolean().optional(),
			tags: z.array(z.string()).optional(),
		langs: z.array(z.string()).optional(),
	})
	.and(
		z.union([
			z.object({
				cover: image(),
				coverAlt: z.string(),
			}),
			z.object({
				svgCover: z.string(),
			}),
			z.object({})
		])
	)
})

export const collections = { blog }

