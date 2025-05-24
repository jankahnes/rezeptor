<template>
  <div class="p-10 space-y-10 text-2xl">
    <h1 class="text-4xl font-bold">
      Welcome back, {{ auth?.user?.email.split('@')[0] }}
    </h1>
    <div class="text-">Own Recipes ></div>
    <div class="flex gap-4"></div>
    <div class="text-">Saved Recipes ></div>
    <div class="flex gap-4"></div>
    <div class="text-">Recommendations ></div>
    <div class="flex gap-4"></div>
    <div class="text-">Feed ></div>
    <div class="flex gap-4"></div>
    <div class="text-">
      Don't know what to cook? Tell us what you have at home:
    </div>
    <div class="flex gap-4"></div>
  </div>
</template>

<script setup lang="ts">
const auth = useAuthStore();

watchEffect(() => {
  if (!auth.user && auth.userFetched) navigateTo('/');
});
</script>

<style scoped></style>
