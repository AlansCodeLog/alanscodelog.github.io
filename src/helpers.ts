import path from "path"
import {parse} from "jsonc-parser"
import fs from "fs/promises"
import type { AstroGlobal } from "astro"
export const getFromRoot = (rawFilepath: string) => {
	const root = path.dirname(import.meta.url)
	return new URL(rawFilepath, root).pathname
}

export const getJsoncFile = async (rawFilepath:string) => {
	const filepath  = getFromRoot("./src/jsonc/resume.jsonc")
	const rawContent = ( await fs.readFile(filepath) ).toString()

	const parsed = parse(rawContent)
	return parsed
}
export const createJsonResponce = (content:string) => {
	const headers = new Headers({
		'Content-Type': 'application/json; charset=utf-8',
	});
	const resp = new Response(JSON.stringify(content, null, "\t"), { headers });
	return resp;
}

export const relativeFetch = (relativeUrl:string, Astro: AstroGlobal) => {
	return fetch(new URL(relativeUrl, Astro.url.origin).href)
}
