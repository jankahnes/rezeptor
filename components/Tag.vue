<template>
  <NuxtLink
    v-if="big"
    class="max-h-8 text-center flex justify-center border-2 border-black text-[14px] py-[1px] px-[3px] text-[#000000ce] shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
    to="/search/tag/vegan"
  >
    Vegan
  </NuxtLink>

  <NuxtLink
    v-else
    class="max-h-5 text-center flex justify-center border-1 border-black text-[10px] py-[1px] px-[2px] text-[#000000ce] shadow-[1px_1px_0_0_rgba(0,0,0,1)]"
    to="/search/tag/vegan"
    @click.stop
  >
    Vegan
  </NuxtLink>
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
