<template>
  <div>
    <Transition name="backdrop">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-40 backdrop-blur-sm bg-black/30"
        @click="close"
      />
    </Transition>

    <Transition name="sheet">
      <div
        v-if="isOpen"
        ref="sheetRef"
        class="fixed left-0 right-0 bottom-0 bg-white rounded-t-3xl z-50 flex flex-col will-change-transform sheet-content"
        :style="sheetStyle"
        style="touch-action: none"
        @touchstart.passive="onDragStart"
        @touchmove.prevent="onDragMove"
        @touchend.passive="onDragEnd"
        @mousedown="onDragStart"
      >
        <div class="flex justify-center pt-3 pb-2 select-none">
          <div class="w-10 h-1.5 bg-gray-300 rounded-full" />
        </div>

        <div class="px-6">
          <slot />
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';

const sheetRef = ref<HTMLElement | null>(null);
const dragOffset = ref(0);
const isDragging = ref(false);
const startY = ref(0);
const currentY = ref(0);

const CLOSE_THRESHOLD = 50; // wie viele px man nach unten ziehen muss, um Sheet zu schließen

const sheetStyle = computed(() => {
  if (isDragging.value && dragOffset.value > 0) {
    return {
      transform: `translateY(${dragOffset.value}px)`,
      transition: 'none',
    };
  }
  return {};
});

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();

const isOpen = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v),
});

const open = () => {
  isOpen.value = true;
};
const close = () => {
  isOpen.value = false;
};

defineExpose({ open, close });

const onDragStart = (e: TouchEvent | MouseEvent) => {
  isDragging.value = true;

  if (e instanceof TouchEvent) {
    startY.value = e.touches[0]?.clientY ?? 0;
  } else {
    startY.value = e.clientY;
    document.addEventListener('mousemove', onDragMove as any);
    document.addEventListener('mouseup', onDragEnd as any);
  }
};

const onDragMove = (e: TouchEvent | MouseEvent) => {
  if (!isDragging.value) return;

  if (e instanceof TouchEvent) {
    e.preventDefault();
    currentY.value = e.touches[0]?.clientY ?? 0;
  } else {
    e.preventDefault();
    currentY.value = e.clientY;
  }

  const diff = currentY.value - startY.value;

  dragOffset.value = diff > 0 ? diff : 0;
};

const onDragEnd = () => {
  if (!isDragging.value) return;

  isDragging.value = false;

  document.removeEventListener('mousemove', onDragMove as any);
  document.removeEventListener('mouseup', onDragEnd as any);

  const dragDistance = dragOffset.value;

  if (dragDistance > CLOSE_THRESHOLD) {
    close();
  }

  dragOffset.value = 0;
};

watch(isOpen, (open) => {
  if (!open) {
    dragOffset.value = 0;
    isDragging.value = false;
  }
});
</script>

<style scoped>
.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.3s ease-out;
}

.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

.sheet-enter-active {
  transition: transform 0.35s cubic-bezier(0.32, 0.72, 0, 1);
}

.sheet-leave-active {
  transition: transform 0.25s cubic-bezier(0.32, 0.72, 0, 1) !important;
}

.sheet-enter-from {
  transform: translateY(100%) !important;
}

.sheet-leave-to {
  transform: translateY(100%) !important;
}

.touch-none {
  touch-action: none;
  -webkit-user-drag: none;
}
</style>
