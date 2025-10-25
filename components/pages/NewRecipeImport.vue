<template>
  <div class="w-full mt-10 md:px-10 max-w-screen-md">
    <h1 class="text-3xl font-bold text-gray-900">
      Import your recipe from a link
    </h1>
    <div class="flex gap-4 flex-col md:flex-row mt-6">
      <div class="flex-1">
        <div class="relative">
          <span
            class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 material-symbols-outlined"
          >
            link
          </span>
          <input
            v-model="link"
            type="text"
            placeholder="www.yourrecipe.com"
            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none transition-colors"
          />
        </div>
      </div>
      <button
        @click="submit(link)"
        :disabled="!link"
        class="px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center text-white bg-primary rounded-lg font-bold"
      >
        Import
      </button>
    </div>
    <h3 class="text-lg font-bold text-gray-900 mt-4">Recipe Websites</h3>
    <span
      class="bg-primary-20 text-sm px-3 py-1.5 rounded-xl inline-flex gap-2 items-center mt-2"
    >
      <span class="material-symbols-outlined text-xs !text-green-800"
        >language</span
      >
      Most Recipe Websites: Supported
      <span class="material-symbols-outlined text-xs">check</span></span
    >
    <h3 class="text-lg font-bold text-gray-900 mt-6 flex items-center gap-2">
      Video Platforms
      <span
        class="ml-1 text-[10px] text-white bg-primary px-1.5 py-0.5 rounded-md"
        >NEW</span
      >
    </h3>
    <div class="flex gap-2 flex-wrap mt-2">
      <span
        class="bg-primary-20 text-sm px-3 py-1 rounded-xl flex gap-2 items-center"
      >
        <img src="/youtube.webp" class="w-5 h-3.5" /> YouTube: Supported
        <span class="material-symbols-outlined text-xs">check</span></span
      >
      <span
        class="bg-primary-20 text-sm px-3 py-1 rounded-xl flex gap-2 items-center"
      >
        <img src="/tiktok.webp" class="w-7 h-7" /> Tiktok: Supported
        <span class="material-symbols-outlined text-xs">check</span></span
      >
      <span
        class="bg-primary-20 text-sm px-3 py-1 rounded-xl flex gap-2 items-center"
      >
        <img src="/instagram.webp" class="w-6 h-6" /> Instagram: Supported
        <span class="material-symbols-outlined text-xs">check</span></span
      >
      <!--<div class="basis-full w-full"></div> -->
      <span
        class="bg-primary-20 text-sm px-3 py-1.5 rounded-xl inline-flex gap-2 items-center"
      >
        <span class="material-symbols-outlined !text-base">ear_sound</span>
        Audio Analysis of Videos: Supported
        <span class="material-symbols-outlined text-xs">check</span></span
      >
      <span
        class="bg-primary-20 text-sm px-3 py-1.5 rounded-xl inline-flex gap-2 items-center opacity-50"
      >
        <span class="material-symbols-outlined !text-base">visibility</span>
        Visual Analysis of Videos: Not Supported Yet
        <span class="material-symbols-outlined text-xs">close</span></span
      >
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  submit: (link: string) => void;
}>();
const link = ref('');
</script>

<style scoped></style>
