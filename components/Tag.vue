<template>
  <div class="py-[2px] overflow-visible">
    <HandDrawnBorder
      :strokeColor="
        tag?.category === 'GENERAL' && tag?.name?.toLowerCase() !== 'sweet'
          ? 'orange'
          : tag?.category === 'CUISINE'
          ? 'blue'
          : tag?.category === 'COURSE'
          ? 'green'
          : 'red'
      "
      :strokeWidth="2"
      :bgColor="
        tag?.category === 'GENERAL' && tag?.name?.toLowerCase() !== 'sweet'
          ? 'rgb(255, 237, 213)'
          : tag?.category === 'CUISINE'
          ? 'rgb(219, 234, 254)'
          : tag?.category === 'COURSE'
          ? 'rgb(220, 252, 231)'
          : 'rgb(254, 226, 226)'
      "
      :roughness="1"
      :blur="2.5"
    >
      <div
        class="flex items-center justify-center gap-2 whitespace-nowrap select-none px-4 py-1 font-[Gloria_Hallelujah] font-bold text-[#47362f] text-base"
      >
        <span>{{ tag?.name }}</span>
      </div>
    </HandDrawnBorder>
  </div>
</template>
<script setup lang="ts">
const props = defineProps({
  id: Number,
});

const tag = getTagByID(props?.id);
</script>

<style scoped></style>
