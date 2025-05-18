<template>
  <span class="absolute gradient-border"> </span>
</template>

<script setup lang="ts">
defineProps({ spinning: Boolean });
</script>

<style scoped>
.gradient-border {
  position: absolute;
  top: -75%;
  left: -75%;
  width: 250%;
  height: 250%;
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
}

/* only when loading do we spin that huge gradient layer */
.loading .gradient-border {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
