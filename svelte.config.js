import { vitePreprocess } from "@astrojs/svelte"


export default {
  preprocess: vitePreprocess(),
vite: {
    ssr: {
      external: ["svgo"],
    },
  },
}
