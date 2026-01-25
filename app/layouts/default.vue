<script setup lang="ts">
</script>

<template>
	<div class="@container/main">
		<UContainer class="sm:border-x border-default pt-10 relative ">
			<AppHeader :links="navLinks" />
			<slot />
			<AppFooter />
		</UContainer>
	</div>
</template>
