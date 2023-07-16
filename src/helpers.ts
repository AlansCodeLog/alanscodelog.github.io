import type { AstroGlobal } from "astro"
import fs from "fs/promises"
import { parse } from "jsonc-parser"
import path from "path"


export const getFromRoot = (rawFilepath: string): string => {
	const root = path.dirname(import.meta.url)
	return new URL(rawFilepath, root).pathname
}

export const getJsoncFile = async (rawFilepath: string): Promise<any> => {
	const filepath = getFromRoot(rawFilepath)
	const rawContent = (await fs.readFile(filepath)).toString()

	const parsed = parse(rawContent)
	return parsed
}
export const createJsonResponse = (content: string): Response => {
	const headers = new Headers({
		"Content-Type": "application/json; charset=utf-8",
	})
	const resp = new Response(JSON.stringify(content, null, "\t"), { headers })
	return resp
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const relativeFetch = async (relativeUrl: string, Astro: AstroGlobal): Promise<Response> => {
	const url = new URL(relativeUrl, Astro.url.origin).href
	return fetch(url)
}
