<template>
  <nav class="bg-[#91e996] fixed w-full z-10">
    <div class="flex justify-between items-center px-4 max-w-7xl mx-auto h-20">
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
          class="bg-white border-[2px] border-black px-2 py-2 flex items-center min-w-sm"
        >
          <Sparkle />
          <input
            type="text"
            placeholder="Chicken Parmesan"
            class="text-sm placeholder-gray-500 bg-transparent focus:outline-none"
          />
        </div>
      </div>

      <!-- User Buttons -->
      <div class="flex gap-2">
        <NuxtLink to="/login"
          class="bg-white border-[2px] border-black px-3 py-1
           font-bold" > Login
        </NuxtLink>
        <NuxtLink to="/register"
          class="bg-black text-white border-[2px] border-black px-3 py-1
           font-bold" > Sign Up
        </NuxtLink>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts"></script>

<style scoped></style>
