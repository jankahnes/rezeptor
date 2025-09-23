<template></template>

<script setup>
const route = useRoute();
const router = useRouter();

const rawUrl = Array.isArray(route.params.url)
  ? route.params.url.join('/')
  : route.params.url;

router.replace(`/recipe/new?link=${encodeURIComponent(rawUrl)}&view=loading`);
</script>
