<template></template>

<script setup>
const route = useRoute();
const router = useRouter();

const rawUrl = Array.isArray(route.params.url)
  ? route.params.url.join('/')
  : route.params.url;

router.replace(`/recipe/import/${encodeURIComponent(rawUrl)}`);
</script>
