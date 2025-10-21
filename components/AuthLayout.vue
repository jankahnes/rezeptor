<template>
  <div class="h-200 flex items-center justify-center p-4 pb-8">
    <div class="w-full max-w-md">
      <!-- Card Container -->
      <div
        class="bg-main sm:border-2 border-black rounded-xl sm:shadow-[6px_6px_0_0_rgba(0,0,0,1)] p-8 space-y-6"
      >
        <!-- Header Section -->
        <div class="text-center space-y-2">
          <div
            class="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4"
          >
            <span class="material-symbols-outlined text-2xl text-white">{{
              icon
            }}</span>
          </div>
          <h1 class="text-3xl font-bold text-gray-900">{{ title }}</h1>
          <p class="text-sm text-gray-600">{{ subtitle }}</p>
        </div>

        <!-- Main Content Slot -->
        <div class="space-y-4">
          <slot name="form"></slot>
        </div>

        <!-- Divider -->
        <div class="relative" v-if="$slots['google-auth']">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-300"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="bg-main px-2 text-gray-500">OR</span>
          </div>
        </div>

        <!-- Google Sign In -->
        <slot name="google-auth"></slot>

        <!-- Footer Section -->
        <div class="text-center pt-4">
          <slot name="footer"></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string;
  subtitle: string;
  icon: string;
}
defineProps<Props>();
</script>

<style scoped>
/* Additional styles if needed */
</style>
