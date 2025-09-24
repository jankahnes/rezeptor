<template>
  <Transition name="fade">
    <div
      v-if="loadingStore.globalLoading"
      class="fixed inset-0 bg-white z-9999 w-full h-full"
    ></div>
  </Transition>
</template>

<script setup lang="ts">
const loadingStore = useLoadingStore();
</script>

<style scoped>
.fade-enter-active {
  transition: opacity 0.35s ease-out;
}
.fade-leave-active {
  transition: opacity 0.15s ease-in;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}
</style>
