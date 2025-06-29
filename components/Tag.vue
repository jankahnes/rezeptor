<template>
  <div class="py-[2px] overflow-visible">
    <div
      class="rounded-2xl border-2"
      :class="
        tag?.category === 'GENERAL' && tag?.name?.toLowerCase() !== 'sweet'
          ? 'border-orange-300'
          : tag?.category === 'CUISINE'
          ? 'border-blue-300'
          : tag?.category === 'COURSE'
          ? 'border-green-300'
          : ' border-red-300'
      "
    >
      <div
        class="flex items-center justify-center gap-2 whitespace-nowrap select-none px-4 py-1 text-[#47362f] text-base"
      >
        <span>{{ tag?.name }}</span>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
const props = defineProps({
  id: Number,
});

const tag = getTagByID(props?.id);
</script>

<style scoped></style>
