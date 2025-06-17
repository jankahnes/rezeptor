<template>
  <span
    class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none w-[100%] aspect-square"
  >
    <span class="gradient-border w-full h-full" :class="{ spinning }"></span>
  </span>
</template>

<script setup lang="ts">
defineProps({ spinning: Boolean });
</script>

<style scoped>
.gradient-border {
  background: conic-gradient(
    #ff0000,
    #ff9900,
    #33ff00,
    #01afaf,
    #3159fa,
    #cc00ff,
    #ff0000
  );
  border-radius: inherit;
  transform-origin: center;
  display: block; /* Makes aspect-ratio behave reliably */
}

.spinning {
  animation: spin 1.5s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
