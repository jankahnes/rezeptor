<template>
  <div
    class="font-bold w-[2em] aspect-square text-center flex items-center justify-center rounded-[0.4em] shadow-sm"
    :class="gradeColors[getGrade(props.score, props.type)]"
  >
    {{ getGrade(props.score, props.type) }}
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  score: number;
  type: 'hidx' | 'score';
}>();
</script>

<style scoped></style>
