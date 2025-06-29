<template>
  <nav class="fixed w-full z-30 bg-main">
    <div
      class="w-[clamp(75vw,1550px,100vw)] mx-auto flex justify-between items-center px-10 max-w-screen-2xl h-18 xm:h-22"
    >
      <!-- Logo -->
      <NuxtLink to="/">
        <div class="relative">
          <div
            class="flex bg-white border-3 border-black px-3 py-1 text-xl font-bold shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
          >
            Rezeptor
          </div>
        </div>
      </NuxtLink>

      <!-- Primary Links -->
      <div class="flex items-center gap-2">
        <NuxtLink
          to="/recipes"
          class="button bg-main text-primary shadow font-bold flex items-center justify-center px-2 py-1 gap-1"
          active-class="bg-primary text-white"
        >
          <span class="material-symbols-outlined !text-2xl"> book </span>
          <span class="text-base">All Recipes</span>
        </NuxtLink>
        <NuxtLink
          to="/ingredients"
          class="button bg-main text-primary shadow font-bold flex items-center justify-center px-2 py-1 gap-1"
          active-class="bg-primary text-white"
        >
          <span class="material-symbols-outlined !text-2xl"> grocery </span>
          <span class="text-base">Ingredients</span>
        </NuxtLink>
        <NuxtLink
          to="/recipe/new"
          class="button bg-main text-primary shadow font-bold flex items-center justify-center px-2 py-1 gap-1"
          active-class="bg-primary text-white"
        >
          <span class="material-symbols-outlined !text-2xl"> add </span>
          <span class="text-base">Create a Recipe</span>
        </NuxtLink>
      </div>

      <!-- User Buttons -->
      <div class="hidden xm:flex items-center gap-2">
        <NuxtLink
          v-if="auth.user"
          :to="'/profile/' + auth.user.id"
          class="button bg-main text-primary shadow font-bold flex items-center justify-center px-2 py-1 gap-1"
          active-class="bg-primary text-white"
        >
          <span class="material-symbols-outlined !text-2xl">
            account_circle
          </span>
        </NuxtLink>
        <button
          v-if="auth.user"
          @click="auth.signOut"
          class="button bg-main text-primary shadow font-bold flex items-center justify-center px-2 py-1 gap-1"
          active-class="bg-primary text-white"
        >
          <span class="material-symbols-outlined !text-2xl"> logout </span>
        </button>
        <NuxtLink
          v-if="!auth.user"
          to="/login"
          class="button bg-primary text-white px-3 py-1 font-bold"
        >
          Login
        </NuxtLink>
        <NuxtLink
          v-if="!auth.user"
          to="/register"
          class="button bg-primary text-white px-3 py-1 font-bold"
        >
          Sign Up
        </NuxtLink>
      </div>
      <NuxtLink
        to="/login"
        class="flex xm:hidden button bg-primary text-white px-3 py-1 font-bold"
      >
        <span class="material-symbols-outlined"> login </span>
      </NuxtLink>
    </div>
  </nav>
</template>

<script setup lang="ts">
const auth = useAuthStore();
</script>
