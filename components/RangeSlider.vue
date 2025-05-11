<template>
  <div
    ref="slider"
    class="relative w-full h-4 rounded"
    @mousedown="startDrag"
    @touchstart.prevent="startDrag"
  >
    <div
      class="absolute top-1/2 left-0 w-full border-t-2 border-dashed border-black -translate-y-1/2"
    ></div>

    <div
      ref="leftHandle"
      class="absolute top-1/2 -translate-y-1/2 min-w-8 h-8 bg-white boder-black border-2 cursor-grab flex items-center justify-center shadow-[2px_2px_0_0_rgba(0,0,0,1)] font-bold text-lg px-1"
      :style="{ left: `calc(${minPercent}% - 0.75rem)` }"
      @mousedown.stop="startHandleDrag('min', $event)"
      @touchstart.stop.prevent="startHandleDrag('min', $event)"
    >
      {{ displayMap(currentMin) }}
    </div>

    <div
      ref="rightHandle"
      class="absolute top-1/2 -translate-y-1/2 min-w-8 h-8 bg-white boder-black border-2 cursor-grab flex items-center justify-center shadow-[2px_2px_0_0_rgba(0,0,0,1)] font-bold text-lg px-1"
      :style="{ left: `calc(${maxPercent}% - 0.75rem)` }"
      @mousedown.stop="startHandleDrag('max', $event)"
      @touchstart.stop.prevent="startHandleDrag('max', $event)"
    >
      {{ displayMap(currentMax) }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';

const props = defineProps<{
  min?: number;
  max?: number;
  modelValue: [number, number];
  displayMap: Function;
  update: Function;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: [number, number]): void;
}>();

const min = props.min ?? 0;
const max = props.max ?? 100;

const slider = ref<HTMLElement | null>(null);
const dragging = ref<'min' | 'max' | null>(null);
const leftHandle = ref<HTMLElement | null>(null);
const rightHandle = ref<HTMLElement | null>(null);

const currentMin = ref(props.modelValue[0]);
const currentMax = ref(props.modelValue[1]);

watch(
  () => props.modelValue,
  ([newMin, newMax]) => {
    currentMin.value = newMin;
    currentMax.value = newMax;
  }
);

const minPercent = computed(
  () => ((currentMin.value - min) / (max - min)) * 100
);
const maxPercent = computed(
  () => ((currentMax.value - min) / (max - min)) * 100
);

function startDrag(e: MouseEvent | TouchEvent) {
  const rect = slider.value!.getBoundingClientRect();
  const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
  const percent = ((x - rect.left) / rect.width) * 100;
  const value = min + ((max - min) * percent) / 100;
  const mid = (currentMin.value + currentMax.value) / 2;
  if (value < mid) startHandleDrag('min', e);
  else startHandleDrag('max', e);
}

function startHandleDrag(which: 'min' | 'max', e: MouseEvent | TouchEvent) {
  dragging.value = which;
  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', stopDrag);
  window.addEventListener('touchmove', onMove, { passive: false });
  window.addEventListener('touchend', stopDrag);
  onMove(e);
}

function onMove(e: MouseEvent | TouchEvent) {
  if (!dragging.value || !slider.value) return;
  const rect = slider.value.getBoundingClientRect();
  const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
  const percent = ((x - rect.left) / rect.width) * 100;
  let value = Math.round(min + ((max - min) * percent) / 100);
  value = Math.max(min, Math.min(max, value));

  if (dragging.value === 'min') {
    currentMin.value = Math.min(value, currentMax.value - 1);
  } else {
    currentMax.value = Math.max(value, currentMin.value + 1);
  }

  props.update(currentMin.value, currentMax.value);
  emit('update:modelValue', [currentMin.value, currentMax.value]);
}

function stopDrag() {
  dragging.value = null;
  window.removeEventListener('mousemove', onMove);
  window.removeEventListener('mouseup', stopDrag);
  window.removeEventListener('touchmove', onMove);
  window.removeEventListener('touchend', stopDrag);
}
</script>
