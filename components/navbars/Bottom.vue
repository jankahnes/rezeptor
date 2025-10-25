<template>
  <nav
    class="fixed bottom-5 left-1/2 -translate-x-1/2 w-[80%] z-10 p-3 shadow-md h-14 flex justify-center rounded-4xl bg-primary-20"
  >
    <div class="flex justify-between items-center w-full mx-5 xs:mx-12 text-gray-700">
      <NuxtLink to="/" class="flex" active-class="!text-primary">
        <span class="material-symbols-outlined !text-3xl"> home </span>
      </NuxtLink>
      <NuxtLink to="/recipes" class="flex" active-class="!text-primary">
        <span class="material-symbols-outlined !text-3xl"> search </span>
      </NuxtLink>
      <NuxtLink to="/recipe/new?view=form" class="flex" active-class="!text-primary">
        <span class="material-symbols-outlined !text-3xl"> add </span>
      </NuxtLink>
      <NuxtLink v-if="!auth.isUser()" to="/login" class="flex" active-class="!text-primary">
        <span class="material-symbols-outlined !text-3xl"> login </span>
      </NuxtLink>
      <NuxtLink :to="'/profile/' + auth.user?.id" class="flex" v-else active-class="!text-primary">
        <span class="material-symbols-outlined !text-3xl"> person </span>
      </NuxtLink>
      <NuxtLink to="/foods/scan" class="flex" active-class="!text-primary">
        <span class="material-symbols-outlined !text-3xl"> flip </span>
      </NuxtLink>
    </div>
  </nav>
</template>

<script setup lang="ts">
const auth = useAuthStore();
</script>

<style scoped></style>
