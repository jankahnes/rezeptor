<template>
  <nav class="fixed w-full z-30 bg-main mask-fade-bottom">
    <div
      class="w-[clamp(75vw,1550px,100%)] mx-auto flex justify-between items-center px-10 h-18 xm:h-22"
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
          to="/recipe/new"
          class="button text-primary shadow font-bold flex items-center justify-center px-2 py-1 gap-1"
          active-class="!bg-primary !text-white"
        >
          <span class="material-symbols-outlined !text-2xl"> add </span>
          <span class="text-base">Create a Recipe</span>
        </NuxtLink>
      </div>

      <!-- User Buttons -->
      <div class="flex gap-2">
        <NuxtLink
          v-if="auth.user"
          :to="'/profile/' + auth.user.id"
          class="button text-primary shadow font-bold flex items-center justify-center gap-1"
        >
          <Avatar
            :user="auth.user"
            class="w-10 h-10"
          />
        </NuxtLink>
        <button
          v-if="auth.user"
          @click="auth.signOut"
          class="button text-primary shadow font-bold flex items-center justify-center px-2 py-1 gap-1"
        >
          <span class="material-symbols-outlined !text-2xl"> logout </span>
        </button>
        <NuxtLink
          v-if="!auth.user"
          to="/login"
          class="button text-primary shadow font-bold flex items-center justify-center px-3 py-2 gap-1"
        >
          Login
        </NuxtLink>
        <NuxtLink
          v-if="!auth.user"
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
</script>
