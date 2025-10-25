<template>
  <nav class="fixed w-full z-30 bg-main mask-fade-bottom">
    <div
      class="w-[clamp(70vw,1550px,100%)] mx-auto flex justify-between items-center px-4 h-18 xm:h-22"
    >
      <!-- Logo -->
      <Logo />

      <!-- Primary Links -->
      <div class="xm:flex hidden items-center gap-2">
        <NuxtLink
          to="/recipes"
          class="button text-primary shadow font-bold flex items-center justify-center px-2 py-1 gap-1"
          active-class="!bg-primary !text-white"
        >
          <span class="material-symbols-outlined !text-2xl"> book </span>
          <span class="text-base">Recipes</span>
        </NuxtLink>
        <NuxtLink
          to="/foods"
          class="button text-primary shadow font-bold flex items-center justify-center px-2 py-1 gap-1"
          active-class="!bg-primary !text-white"
        >
          <span class="material-symbols-outlined !text-2xl"> grocery </span>
          <span class="text-base">Foods</span>
        </NuxtLink>
        <NuxtLink
          to="/recipe/new?view=form"
          class="button text-primary shadow font-bold flex items-center justify-center px-2 py-1 gap-1"
          active-class="!bg-primary !text-white"
        >
          <span class="material-symbols-outlined !text-2xl"> add </span>
          <span class="text-base">Create a Recipe</span>
        </NuxtLink>
      </div>

      <!-- User Buttons -->
      <div v-if="auth.isUser()" class="flex gap-2">
        <NuxtLink
          :to="'/profile/' + auth.user?.id"
          class="button text-primary shadow font-bold flex items-center justify-center gap-1"
        >
          <Avatar :user="auth.user!" class="w-10 h-10" />
        </NuxtLink>
        <button
          @click="auth.signOut"
          class="button text-primary shadow font-bold flex items-center justify-center px-2 py-1 gap-1"
        >
          <span class="material-symbols-outlined !text-2xl"> logout </span>
        </button>
      </div>
      <div v-else class="flex gap-2">
        <NuxtLink
          to="/login"
          class="button text-primary shadow font-bold flex items-center justify-center px-3 py-2 gap-1"
        >
          Login
        </NuxtLink>
        <NuxtLink
          to="/onboarding"
          class="button !bg-primary text-white shadow font-bold flex items-center justify-center px-3 py-2 gap-1"
        >
          Sign Up
        </NuxtLink>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
const auth = useAuthStore();

function debug() {}
</script>
