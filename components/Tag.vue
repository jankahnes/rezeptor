<template>
  <NuxtLink
    v-if="big"
    class="max-h-8 text-center flex justify-center border-2 border-white text-[14px] py-[1px] px-[3px] text-[#000000ce] shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
    to="/search/tag/vegan"
  >
    Vegan
  </NuxtLink>

  <button
    v-else
    class="max-h-5 text-center flex justify-center border-1 border-gray-300 text-[10px] py-[1px] px-[2px] text-[#000000ce] shadow-[1px_1px_0_0_rgba(0,0,0,1)]"
    to="/search/tag/vegan"
    @click.stop
  >
    Vegan
  </button>
</template>

<script setup lang="ts">
const props = defineProps({
  big: {
    type: Boolean,
    default: false,
  },
});
</script>

<style scoped></style>
