<template>
  <nav class="bg-[#91e996] fixed w-full z-10">
    <div
      class="flex justify-between items-center px-10 max-w-[2100px] mx-auto h-22"
    >
      <!-- Logo -->
      <NuxtLink to="/">
        <div class="relative">
          <div
            class="bg-white border-[3px] border-black px-3 py-1 text-2xl font-bold shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
          >
            Rezeptor
          </div>
        </div>
      </NuxtLink>
      <!-- Search -->
      <div class="flex items-center relative">
        <div
          class="bg-white border-[2px] border-black px-2 h-11 flex items-center min-w-md shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
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
      <div class="flex gap-2">
        <NuxtLink
          to="/login"
          class="bg-white border-[2px] border-black px-3 py-1 font-bold shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
        >
          Login
        </NuxtLink>
        <NuxtLink
          to="/register"
          class="bg-black text-white border-[2px] border-black px-3 py-1 font-bold shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
        >
          Sign Up
        </NuxtLink>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts"></script>

<style scoped></style>
