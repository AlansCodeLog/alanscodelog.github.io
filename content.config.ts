import { defineCollection, defineContentConfig, z } from "@nuxt/content"

const createBaseSchema = () => z.object({
	title: z.string(),
	description: z.string(),
})
const zCard = z.object({
	title: z.string(),
	description: z.string().optional(),
	url: z.string().optional(),
	icon: z.string().optional(),
})

const createButtonSchema = () => z.object({
	label: z.string(),
	icon: z.string().optional(),
	to: z.string().optional(),
	color: z.enum(["primary", "neutral", "success", "warning", "error", "info"]).optional(),
	size: z.enum(["xs", "sm", "md", "lg", "xl"]).optional(),
	variant: z.enum(["solid", "outline", "subtle", "soft", "ghost", "link"]).optional(),
	target: z.enum(["_blank", "_self"]).optional(),
})

const createImageSchema = () => z.object({
	src: z.string().editor({ input: "media" }),
	alt: z.string(),
})

export default defineContentConfig({
	collections: {
		index: defineCollection({
			type: "page",
			source: "index.yml",
			schema: z.object({
				hero: z.object({
					links: z.array(createButtonSchema()),
					images: z.array(createImageSchema().extend({
						url: z.string().optional(),
						description: z.string().optional(),

						popupType: z.enum(["video", "youtube", "image"]).optional(),
						popup: z.string().optional(),
					})),
				}),
				about: createBaseSchema().extend({
					details: z.array(zCard),
				}),
				experience: createBaseSchema().extend({
					items: z.array(z.object({
						date: z.date(),
						position: z.string(),
						company: z.object({
							name: z.string(),
							url: z.string().optional(),
							logo: z.string().editor({ input: "icon" }).optional(),
							color: z.string().optional(),
						}).optional(),
					})),
				}),
				hobbies: createBaseSchema().extend({
					items: z.array(zCard),
				}),
				blog: createBaseSchema(),
				faq: createBaseSchema().extend({
					categories: z.array(
						z.object({
							title: z.string().nonempty(),
							questions: z.array(
								z.object({
									label: z.string().nonempty(),
									content: z.string().nonempty(),
								}),
							),
						})),
				}),
			}),
		}),
		projects: defineCollection({
			type: "data",
			source: "projects/*.yml",
			schema: z.object({
				title: z.string().nonempty(),
				description: z.string().nonempty(),
				image: z.string().nonempty().editor({ input: "media" }),
				url: z.string().nonempty(),
				tags: z.array(z.string()),
				date: z.date(),
			}),
		}),
		blog: defineCollection({
			type: "page",
			source: {
				include: "blog/*.md",
				exclude: ["_*"],
			},
			schema: z.object({
				date: z.date(),
				image: z.string().nonempty().editor({ input: "media" }),
				video_image: z.string().nonempty().editor({ input: "media" }).optional(),
				published: z.boolean().optional(),
				tags: z.array(z.string()).optional(),
				langs: z.array(z.string()).optional(),
				rawbody: z.string(),
			}),
		}),
		pages: defineCollection({
			type: "page",
			source: [
				{ include: "projects.yml" },
				{ include: "blog.yml" },
			],
			schema: z.object({
				links: z.array(createButtonSchema()),
			}),
		}),
		about: defineCollection({
			type: "page",
			source: "about.yml",
			schema: z.object({
				content: z.object({}),
				images: z.array(createImageSchema()),
			}),
		}),
	},
})
