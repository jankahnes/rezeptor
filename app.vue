<template>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />

  <link
    rel="preload"
    href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
    as="style"
    onload="this.onload=null;this.rel='stylesheet'"
  />

  <link
    href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
    rel="stylesheet"
    media="print"
    onload="this.media='all'"
  />

  <link
    href="https://fonts.googleapis.com/icon?family=Material+Icons&display=swap"
    rel="stylesheet"
    media="print"
    onload="this.media='all'"
  />

  <link
    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
    rel="stylesheet"
    media="print"
    onload="this.media='all'"
  />

  <noscript>
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
      rel="stylesheet"
    />
    <link
      href="https://fonts.googleapis.com/icon?family=Material+Icons&display=swap"
      rel="stylesheet"
    />
    <link
      href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
      rel="stylesheet"
    />
  </noscript>

  <div class="bg-main font-main" v-if="$route.path !== '/onboarding'">
    <NavbarsTop />
    <div
      class="pt-18 xm:pt-22 pb-18 xm:pb-0 w-[clamp(75vw,1550px,100%)] mx-auto min-h-[calc(100svh_-_144px)] xm:min-h-[calc(100svh_-_88px)]"
    >
      <GlobalLoadingIndicator />
      <NuxtPage />
    </div>
    <NavbarsBottom class="block xm:hidden" />
    <footer class="w-full h-10 bg-transparent mb-44 lg:mb-0">
      <div
        class="w-full h-full flex flex-col sm:flex-row items-center justify-between px-10 gap-10 text-center sm:text-left"
      >
        <p class="text-black/30 text-sm">
          This website is a non-commercial student project and in active
          development.
        </p>
        <p class="text-black/30 text-sm">
          <a href="https://github.com/jankahnes/rezeptor" target="_blank"
            >Developed by Jan Kahnes @GitHub</a
          >
        </p>
      </div>
    </footer>
  </div>
  <div v-else class="w-screen h-screen metallic-gradient">
    <GlobalLoadingIndicator />
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
