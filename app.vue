<template>
  <div class="bg-main font-main" v-if="$route.path !== '/onboarding'">
    <NavbarsTop class="hidden xm:block" />
    <div
      class="xm:pt-22 pb-18 xm:pb-0 w-[clamp(70vw,1550px,100%)] mx-auto min-h-[100svh] xm:min-h-[calc(100svh_-_88px)]"
    >
      <NuxtPage />
      <GlobalLoadingIndicator />
    </div>
    <NavbarsBottom class="block xm:hidden" />
    <footer class="hidden md:block w-full bg-transparent my-4">
      <div
        class="w-full h-full flex flex-col sm:flex-row items-center justify-between px-10 gap-10 text-center sm:text-left"
      >
        <p class="text-sm">
          <a href="https://github.com/jankahnes/rezeptor" target="_blank"
            >Jan Kahnes @GitHub</a
          >
        </p>
      </div>
    </footer>
  </div>
  <div v-else class="w-screen h-screen metallic-gradient">
    <NuxtPage />
  </div>
</template>

<script setup>
const auth = useAuthStore();

useHead({
  title: 'Rezeptor',
  meta: [
    {
      name: 'description',
      content: 'Rezeptor is a recipe sharing platform.',
    },
  ],
});

onBeforeMount(() => {
  auth.fetchUser();
  auth.listenToAuthChanges();
});
</script>

<style></style>
