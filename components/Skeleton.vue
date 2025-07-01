<template>
  <div class="relative overflow-hidden bg-gray-100 flex-1">
    <div
      class="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/50 to-transparent p-4"
    />
  </div>
</template>

<script setup></script>

<style>
@keyframes shimmer {
  0% {
    transform: translateX(0%);
  }
  100% {
    transform: translateX(200%);
  }
}

.animate-shimmer {
  animation: shimmer 1.5s linear infinite;
}
</style>
