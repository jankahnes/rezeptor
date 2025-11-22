<template>
  <div :class="widthClass" class="relative aspect-square">
    <svg
      class="absolute inset-0 w-full h-full -rotate-90"
      viewBox="0 0 100 100"
    >
      <!-- Background ring -->
      <circle
        cx="50"
        cy="50"
        :r="radius"
        fill="none"
        :stroke="ringBackground"
        :stroke-width="strokeWidth"
        stroke-linecap="round"
      />

      <!-- Segment rings -->
      <circle
        v-for="(segment, index) in segments"
        :key="index"
        cx="50"
        cy="50"
        :r="radius"
        fill="none"
        :stroke="segment.color"
        :stroke-width="strokeWidth"
        :stroke-dasharray="segment.dashArray"
        :stroke-dashoffset="segment.dashOffset"
        stroke-linecap="round"
        class="transition-all duration-300"
        :style="{
          transform: `rotate(${segment.rotation}deg)`,
          transformOrigin: '50% 50%',
        }"
      />
    </svg>

    <div
      class="absolute inset-0 flex items-center justify-center"
      :style="{ padding: `${strokeWidth}px` }"
    >
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  segments: { value: number; color: string }[];
  widthClass?: string;
  strokeWidth?: number;
  ringBackground?: string;
}

const props = withDefaults(defineProps<Props>(), {
  widthClass: 'w-40',
  strokeWidth: 8,
  ringBackground: '#e5e5e5',
});

const radius = computed(() => {
  return (100 - props.strokeWidth) / 2;
});

const circumference = computed(() => {
  return 2 * Math.PI * radius.value;
});

const segments = computed(() => {
  const firstHalves: any[] = [];
  const secondHalves: any[] = [];
  let currentRotation = 0;

  props.segments.forEach((segment, index) => {
    const clampedValue = Math.max(0, Math.min(1, segment.value));
    const segmentLength = circumference.value * clampedValue;
    const halfLength = segmentLength / 2;
    const fullCircle = circumference.value;

    firstHalves.push({
      color: segment.color,
      dashArray: `${halfLength} ${fullCircle - halfLength}`,
      dashOffset: 0,
      rotation: currentRotation,
    });

    secondHalves.push({
      color: segment.color,
      dashArray: `${halfLength} ${fullCircle - halfLength}`,
      dashOffset: -halfLength,
      rotation: currentRotation,
    });

    currentRotation += clampedValue * 360;
  });

  return [...firstHalves, ...secondHalves];
});
</script>

<style scoped>
svg circle {
  filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.1));
}
</style>
