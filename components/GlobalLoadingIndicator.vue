<template>
  <Transition name="fade">
    <div v-if="globalLoading" class="fixed inset-0 bg-black opacity-20 z-9999 w-full h-full"></div>
  </Transition>
</template>

<script setup lang="ts">
const loadingStore = useLoadingStore();
const globalLoading = computed(() => loadingStore.globalLoading);
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
