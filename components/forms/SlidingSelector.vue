<template>
  <div
    class="relative w-full overflow-hidden touch-pan-x py-1 select-none"
    @touchstart="onTouchStart"
    @touchmove="onTouchMove"
    @touchend="onTouchEnd"
  >
    <div
      class="flex transition-transform duration-300 ease-out"
      :style="{
        transform: `translateX(calc(${translateX}% + ${dragOffset}px))`,
        transition: dragging ? 'none' : 'transform 0.3s ease-out',
      }"
    >
      <div
        v-for="(choice, index) in choices"
        :key="index"
        class="flex-shrink-0 p-[2px]"
        :style="itemStyle(index)"
        @click="selectChoice(index)"
      >
        <div
          class="text-center cursor-pointer text-xl font-bold p-1 bg-primary-50 text-primary rounded-lg transition-all duration-300 ease-out"
        >
          {{ choice }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: [String, Number],
    required: true,
  },
  choices: {
    type: Array,
    required: true,
  },
  expanded: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue']);

// Touch interaction
const dragOffset = ref(0);
const dragging = ref(false);
const lastSelectedIndex = ref(props.choices.indexOf(props.modelValue));

const centerIndex = ref(props.choices.indexOf(props.modelValue));

watch(
  () => props.modelValue,
  (newVal) => {
    centerIndex.value = props.choices.indexOf(newVal);
  }
);

const visibleRange = computed(() => (props.expanded ? 2 : 1));
const totalVisibleItems = computed(() => visibleRange.value * 2 + 1);
const itemWidth = computed(() => 100 / totalVisibleItems.value);

const translateX = computed(() => {
  return 100 / totalVisibleItems.value - centerIndex.value * itemWidth.value;
});

function itemStyle(index) {
  const distance = Math.abs(index - centerIndex.value);
  const isVisible = distance <= visibleRange.value;

  return {
    opacity: isVisible ? 1 - distance * 0.4 : 0,
    transform: `scale(${isVisible ? 1 - distance * 0.1 : 0.8})`,
    transition: dragging.value ? 'none' : 'all 0.3s ease',
    width: `${itemWidth.value}%`,
  };
}

function selectChoice(index) {
  emit('update:modelValue', props.choices[index]);
}

function onTouchStart(e) {
  dragging.value = true;
  lastSelectedIndex.value = centerIndex.value;
}

function onTouchMove(e) {
  const dx = e.touches[0].clientX - startX;
  dragOffset.value = dx;

  const itemPixelWidth = window.innerWidth / totalVisibleItems.value;
  const dragThreshold = itemPixelWidth * 0.3; // 30% of item width threshold

  // Only update if we've dragged past the threshold
  if (Math.abs(dx) > dragThreshold) {
    const direction = dx > 0 ? -1 : 1;
    const newIndex = lastSelectedIndex.value + direction;

    // Clamp the new index
    const clampedIndex = Math.max(
      0,
      Math.min(props.choices.length - 1, newIndex)
    );

    if (clampedIndex !== centerIndex.value) {
      emit('update:modelValue', props.choices[clampedIndex]);
      // Reset the drag state to prevent cascading updates
      startX = e.touches[0].clientX;
      dragOffset.value = 0;
      lastSelectedIndex.value = clampedIndex;
    }
  }
}

function onTouchEnd() {
  dragOffset.value = 0;
  dragging.value = false;
}
</script>

<style scoped>
.flex > div > div {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
</style>
