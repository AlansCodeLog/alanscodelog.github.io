<template>
	<details class="md-details rounded-lg bg-primary-500/10 p-2">
		<summary class="border rounded-md border-primary-500/30 bg-primary-500/20 p-3 focus:outline-none focus:border-primary-500 text-center">
			<slot name="label">
				{{ label }}
			</slot>
		</summary>
		<slot />
	</details>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
	label?: string
}>(), {
	label: "Click to Show",
})
</script>
