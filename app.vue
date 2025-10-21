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

    <!-- Shopping List Toggle Button -->
    <button
      v-if="auth.shoppingList.length > 0"
      @click="auth.shoppingListOpen = !auth.shoppingListOpen"
      class="hidden sm:flex fixed bottom-5 right-5 w-14 h-14 bg-primary-600 text-white rounded-full items-center justify-center z-50 transition-all duration-200 hover:scale-105"
      :class="{
        'bg-white !text-primary border-2 border-primary-600':
          auth.shoppingListOpen,
      }"
    >
      <span v-if="!auth.shoppingListOpen" class="material-symbols-outlined">shopping_cart</span>
      <span v-else class="material-symbols-outlined">close</span>
      <span
        class="w-6 h-6 absolute top-[-4px] right-[-4px] bg-white border-primary-600 border-2 text-primary font-bold rounded-full flex items-center justify-center"
        >{{ auth.shoppingList.length }}</span
      >
    </button>
    <button
      v-if="auth.shoppingList.length > 0 && !auth.shoppingListOpen"
      @click="auth.shoppingListOpen = true"
      class="flex sm:hidden fixed top-1/2 left-0 translate-x-[-50%] -translate-y-1/2 w-14 h-14 bg-primary-600 text-white rounded-full items-center justify-center z-50 transition-all duration-200 hover:scale-105"
    >
      <span class="material-symbols-outlined !text-lg -mr-6 mt-1"
        >shopping_cart</span
      >
    </button>

    <!-- Shopping List Panel -->
    <div
      v-if="auth.shoppingListOpen"
      class="fixed top-0 right-0 z-40 w-full sm:w-[20%] sm:max-w-[450px] h-full sm:h-[80%] sm:top-1/2 sm:translate-y-[-50%] sm:right-4"
    >
      <ShoppingListPanel @close="auth.shoppingListOpen = false" />
    </div>
  </div>
  <div v-else class="w-screen h-screen">
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
