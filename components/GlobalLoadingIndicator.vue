<template>
  <div
    v-show="loadingStore.globalLoading"
    class="fixed inset-0 bg-black opacity-10 z-9999 w-full h-full pulse-overlay fade-transition"
  ></div>
</template>

<script setup lang="ts">
const loadingStore = useLoadingStore();
</script>

<style scoped>
.fade-transition {
  transition: opacity 1s ease-in-out;
}

.pulse-overlay {
  animation: pulse 1s ease-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.03;
  }
  50% {
    opacity: 0.1;
  }
}
</style>
