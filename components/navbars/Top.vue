<template>
  <nav class="fixed w-full z-30">
    <div
      class="flex justify-between items-center px-10 max-w-[2100px] mx-auto h-18 xm:h-22"
    >
      <!-- Logo -->
      <NuxtLink to="/">
        <div class="relative">
          <div
            class="flex bg-white border-3 border-black px-3 py-1 text-2xl font-extrabold shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
          >
            Rezeptor
          </div>
        </div>
      </NuxtLink>
      <!-- Search -->
      <div
        class="hidden xm:flex items-center relative min-w-[300px] max-w-[600px] flex-grow mx-10"
      >
        <div
          class="bg-white border-2 border-black px-2 h-11 flex items-center w-full shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
        >
          <Sparkle />
          <input
            type="text"
            placeholder="Chicken Parmesan"
            class="text-sm placeholder-gray-500 h-full w-full bg-transparent focus:outline-none"
          />
        </div>
      </div>

      <!-- User Buttons -->
      <div class="hidden xm:flex items-center gap-2">
        <NuxtLink
          to="/recipes"
          class="bg-white border-2 flex items-center justify-center border-black font-bold h-9 w-9 shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
        >
          <span class="material-symbols-outlined !text-3xl"> book </span>
        </NuxtLink>
        <NuxtLink
          to="/ingredients"
          class="bg-white border-2 flex items-center justify-center border-black font-bold h-9 w-9 shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
        >
          <span class="material-symbols-outlined !text-3xl"> grocery </span>
        </NuxtLink>

        <NuxtLink
          v-if="auth.user"
          :to="'/profile/' + auth.user.id"
          class="bg-white border-2 flex items-center justify-center border-black font-bold h-9 w-9 shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
        >
          <span class="material-symbols-outlined !text-3xl">
            account_circle
          </span>
        </NuxtLink>
        <button
          v-if="auth.user"
          @click="auth.signOut"
          class="bg-white border-2 border-black px-2 py-1 font-bold shadow-[2px_2px_0_0_rgba(0,0,0,1)] font-light"
        >
          Sign Out
        </button>
        <NuxtLink
          v-if="!auth.user"
          to="/login"
          class="bg-white border-2 border-black px-3 py-1 font-bold shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
        >
          Login
        </NuxtLink>
        <NuxtLink
          v-if="!auth.user"
          to="/register"
          class="bg-black text-white border-2 border-black px-3 py-1 font-bold shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
        >
          Sign Up
        </NuxtLink>
      </div>
      <NuxtLink
        to="/login"
        class="flex xm:hidden bg-white border-2 border-black px-3 py-1 font-bold shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
      >
        <span class="material-symbols-outlined"> login </span>
      </NuxtLink>
    </div>
  </nav>
</template>

<script setup lang="ts">
const auth = useAuthStore();
</script>

<style scoped>
nav {
  background: linear-gradient(
    135deg,
    #ebe3d4 0%,
    #f0eade 10%,
    #f5efe2 15%,
    #f0e8d8 30%,
    #f3ebd7 37%,
    #eee9e0 45%,
    #f4edde 60%,
    #ece8df 75%,
    #f1ece1 90%,
    #f0ebe0 100%
  );
}
</style>
