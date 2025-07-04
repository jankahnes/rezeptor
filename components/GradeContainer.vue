<template>
  <div
    class="font-bold w-[2em] aspect-square text-center flex items-center justify-center"
    :class="getGradeClass()"
  >
    {{ getGrade(props.score, props.type) }}
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  score: number;
  type: 'hidx' | 'score';
}>();

function getGradeClass() {
  const grade = getGrade(props.score, props.type);
  let positiveHalo = '';
  if (grade.startsWith('A')) {
    positiveHalo =
      ' shadow-[0_0_12px_4px] shadow-[#e8fcf2] filter brightness-102';
  } else if (grade.startsWith('S')) {
    positiveHalo =
      ' shadow-[0_0_16px_6px] shadow-[#edf5ff] filter brightness-102';
  } else {
    positiveHalo = 'shadow-sm';
  }
  return gradeColors[getGrade(props.score, props.type)] + ' ' + positiveHalo;
}
</script>

<style scoped></style>
