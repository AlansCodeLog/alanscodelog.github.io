export default defineAppConfig({
	global: {
		// picture: {
		// 	dark: "https://images.unsplash.com/photo-1701615004837-40d8573b6652?q=80&w=1480&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
		// 	light: "https://images.unsplash.com/photo-1701615004837-40d8573b6652?q=80&w=1480&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
		// 	alt: "My profile picture",
		// },
		email: "alanscodelog@gmail.com",
		available: true,
	},
	ui: {
		colors: {
			primary: "blue",
			neutral: "neutral",
		},
		pageHero: {
			slots: {
				container: "py-18 sm:py-24 lg:py-32",
				title: "mx-auto max-w-xl text-pretty text-3xl sm:text-4xl lg:text-5xl",
				description: "mt-2 text-md mx-auto max-w-2xl text-pretty sm:text-md text-muted",
			},
		},
		pageSection: {
			slots: {
				container: "gap-4 sm:gap-4",
			},
		},
		pageCard: {
			slots: {
				container: "p-4 sm:p-2",
				title: "text-[15px]",
				description: "text-[12px]",
				leading: "inline-flex items-center mb-1",
			},
		},
	},
	footer: {
		credits: `Copyright © ${new Date().getFullYear()}`,
		colorMode: false,
		links: [
			{
				"icon": "i-simple-icons-x",
				"to": "https://x.com/alanscodelog",
				"target": "_blank",
				"aria-label": "X",
			},
			{
				"icon": "i-simple-icons-github",
				"to": "https://github.com/alanscodelog",
				"target": "_blank",
				"aria-label": "GitHub",
			},
		],
	},
})
