<template>
  <link
    href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Merriweather:ital,opsz,wght@0,18..144,300..900;1,18..144,300..900&display=swap"
    rel="stylesheet"
  />

  <div class="bg-main font-main">
    <NavbarsTop />
    <div
      class="pt-18 xm:pt-22 pb-18 xm:pb-0 w-[clamp(75vw,1550px,100%)] mx-auto min-h-[calc(100svh_-_144px)] xm:min-h-[calc(100svh_-_88px)]"
    >
      <GlobalLoadingIndicator />
      <NuxtPage />
    </div>
    <NavbarsBottom class="block xm:hidden" />
  </div>
</template>

<script setup>
const auth = useAuthStore();
onBeforeMount(() => {
  auth.fetchUser();
  auth.listenToAuthChanges();
});
</script>

<style>

</style>
