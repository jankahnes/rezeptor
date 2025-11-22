<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="loadingStore.globalLoading"
        class="fixed inset-0 bg-main z-9999 w-full h-full"
        :class="left"
      ></div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const loadingStore = useLoadingStore();
const props = defineProps<{
  left: string;
}>();
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
