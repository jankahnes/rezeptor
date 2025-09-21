<template>
  <div class="relative">
    <div class="relative">
      <div
        v-if="canScrollLeft"
        class="absolute top-0 -left-[1px] h-full w-8 bg-gradient-to-r from-white to-transparent pointer-events-none z-20"
      ></div>
      <div
        v-if="canScrollRight"
        class="absolute top-0 -right-[1px] h-full w-8 bg-gradient-to-l from-white to-transparent pointer-events-none z-20"
      ></div>
      <div ref="desktopContainer" class="overflow-hidden">
        <div
          ref="desktopSlider"
          class="flex items-center select-none cursor-grab active:cursor-grabbing w-max"
          :class="[
            {
              'transition-transform duration-300 ease-in-out':
                !isDragging && !isDecelerating,
            },
            flexClass,
          ]"
          :style="{ transform: `translateX(${-currentOffset}px)` }"
          @mousedown="startDrag"
          @touchstart="startDrag"
          @mousemove="onDrag"
          @touchmove="onDrag"
          @mouseup="endDrag"
          @mouseleave="endDrag"
          @touchend="endDrag"
          @touchcancel="endDrag"
        >
          <slot />
        </div>
      </div>
    </div>

    <div v-if="showProgress" class="mt-3 flex justify-center">
      <div class="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
        <div
          class="h-full bg-gray-500 rounded-full transition-all duration-300 ease-out"
          :style="{ width: `${progressPercentage}%` }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue';

const props = defineProps({
  showProgress: {
    type: Boolean,
    default: false,
  },
  flexClass: {
    type: String,
    default: '',
  },
});

const desktopContainer = ref(null);
const desktopSlider = ref(null);
const currentOffset = ref(0);
const itemWidth = ref(0);
const canScrollLeft = ref(false);
const canScrollRight = ref(false);

const isDragging = ref(false);
const dragStartX = ref(0);
const dragStartY = ref(0);
const dragStartOffset = ref(0);
const hasDragged = ref(false);
const isHorizontalGesture = ref(false);
const dragThreshold = 5;

const velocity = ref(0);
const isDecelerating = ref(false);
const lastTouchTime = ref(0);
const lastTouchX = ref(0);
const animationFrame = ref(null);

const FRICTION = 0.95;
const MIN_VELOCITY = 0.1;
const VELOCITY_MULTIPLIER = 1.2;

const progressPercentage = computed(() => {
  if (!desktopContainer.value || !desktopSlider.value) return 0;

  const container = desktopContainer.value;
  const slider = desktopSlider.value;
  const maxOffset = Math.max(0, slider.scrollWidth - container.clientWidth);

  if (maxOffset === 0) return 0;

  return Math.min(100, (currentOffset.value / maxOffset) * 100);
});

const updateDesktopState = () => {
  if (!desktopContainer.value || !desktopSlider.value) return;

  const container = desktopContainer.value;
  const slider = desktopSlider.value;
  const containerWidth = container.clientWidth;
  const sliderWidth = slider.scrollWidth;

  const firstChild = slider.firstElementChild;
  if (firstChild) {
    const rect = firstChild.getBoundingClientRect();
    const gap = 8;
    itemWidth.value = rect.width + gap;
  }

  // Only allow scrolling if content is wider than container
  const needsScrolling = sliderWidth > containerWidth;
  canScrollLeft.value = needsScrolling && currentOffset.value > 0;
  canScrollRight.value =
    needsScrolling && currentOffset.value < sliderWidth - containerWidth;
};

const handleResize = () => {
  // Reset offset if content now fits in container
  if (desktopContainer.value && desktopSlider.value) {
    const container = desktopContainer.value;
    const slider = desktopSlider.value;
    const needsScrolling = slider.scrollWidth > container.clientWidth;
    if (!needsScrolling) {
      currentOffset.value = 0;
    }
  }
  updateDesktopState();
};

const animate = () => {
  if (!isDecelerating.value || Math.abs(velocity.value) < MIN_VELOCITY) {
    isDecelerating.value = false;
    velocity.value = 0;
    if (animationFrame.value) {
      cancelAnimationFrame(animationFrame.value);
      animationFrame.value = null;
    }
    return;
  }

  currentOffset.value += velocity.value;

  if (!desktopContainer.value || !desktopSlider.value) return;

  const container = desktopContainer.value;
  const slider = desktopSlider.value;
  const maxOffset = slider.scrollWidth - container.clientWidth;

  if (currentOffset.value < 0) {
    currentOffset.value = 0;
    velocity.value = 0;
  } else if (currentOffset.value > maxOffset) {
    currentOffset.value = maxOffset;
    velocity.value = 0;
  }

  velocity.value *= FRICTION;

  updateDesktopState();
  animationFrame.value = requestAnimationFrame(animate);
};

const stopAnimation = () => {
  isDecelerating.value = false;
  velocity.value = 0;
  if (animationFrame.value) {
    cancelAnimationFrame(animationFrame.value);
    animationFrame.value = null;
  }
};

const getEventX = (event) => {
  return event.type.includes('touch')
    ? event.touches[0]?.clientX || event.changedTouches[0]?.clientX
    : event.clientX;
};

const getEventY = (event) => {
  return event.type.includes('touch')
    ? event.touches[0]?.clientY || event.changedTouches[0]?.clientY
    : event.clientY;
};

const startDrag = (event) => {
  if (event.target.closest('button')) return;

  // Check if scrolling is needed - if content fits in container, don't allow dragging
  if (desktopContainer.value && desktopSlider.value) {
    const container = desktopContainer.value;
    const slider = desktopSlider.value;
    const needsScrolling = slider.scrollWidth > container.clientWidth;
    if (!needsScrolling) return;
  }

  const x = getEventX(event);
  const y = getEventY(event);
  if (x === undefined || y === undefined) return;

  const isTouchEvent = event.type.includes('touch');

  stopAnimation();

  isDragging.value = true;
  dragStartX.value = x;
  dragStartY.value = y;
  dragStartOffset.value = currentOffset.value;
  lastTouchX.value = x;
  lastTouchTime.value = performance.now();
  hasDragged.value = false;
  isHorizontalGesture.value = !isTouchEvent;
  velocity.value = 0;

  if (!isTouchEvent) {
    event.preventDefault();
  }
};

const onDrag = (event) => {
  if (!isDragging.value) return;

  const x = getEventX(event);
  const y = getEventY(event);
  if (x === undefined || y === undefined) return;

  const deltaX = dragStartX.value - x;
  const deltaY = dragStartY.value - y;

  const isTouchEvent = event.type.includes('touch');

  if (
    isTouchEvent &&
    !isHorizontalGesture.value &&
    (Math.abs(deltaX) > dragThreshold || Math.abs(deltaY) > dragThreshold)
  ) {
    isHorizontalGesture.value = Math.abs(deltaX) > Math.abs(deltaY);

    if (!isHorizontalGesture.value) {
      isDragging.value = false;
      return;
    }
  }

  if (!isHorizontalGesture.value) return;

  const newOffset = dragStartOffset.value + deltaX;

  if (Math.abs(deltaX) > dragThreshold) {
    hasDragged.value = true;
  }

  const now = performance.now();
  const timeDelta = now - lastTouchTime.value;

  if (timeDelta > 0) {
    const distanceDelta = lastTouchX.value - x;
    velocity.value = (distanceDelta / timeDelta) * 16;
  }

  lastTouchX.value = x;
  lastTouchTime.value = now;

  if (!desktopContainer.value || !desktopSlider.value) return;

  const container = desktopContainer.value;
  const slider = desktopSlider.value;
  const maxOffset = slider.scrollWidth - container.clientWidth;

  let constrainedOffset = newOffset;
  if (newOffset < 0) {
    constrainedOffset = newOffset * 0.3;
  } else if (newOffset > maxOffset) {
    constrainedOffset = maxOffset + (newOffset - maxOffset) * 0.3;
  }

  currentOffset.value = constrainedOffset;
  updateDesktopState();

  event.preventDefault();
};

const endDrag = (event) => {
  if (!isDragging.value) return;

  const wasHorizontalGesture = isHorizontalGesture.value;

  isDragging.value = false;
  isHorizontalGesture.value = false;

  if (!wasHorizontalGesture) return;

  if (!desktopContainer.value || !desktopSlider.value) return;

  const container = desktopContainer.value;
  const slider = desktopSlider.value;
  const maxOffset = slider.scrollWidth - container.clientWidth;

  if (currentOffset.value < 0) {
    currentOffset.value = 0;
    velocity.value = 0;
  } else if (currentOffset.value > maxOffset) {
    currentOffset.value = maxOffset;
    velocity.value = 0;
  }

  if (Math.abs(velocity.value) > MIN_VELOCITY) {
    velocity.value *= VELOCITY_MULTIPLIER;
    isDecelerating.value = true;
    animationFrame.value = requestAnimationFrame(animate);
  }

  setTimeout(() => {
    hasDragged.value = false;
  }, 50);

  if (!event.type.includes('touch') || wasHorizontalGesture) {
    event.preventDefault();
  }
};

const globalClickHandler = (event) => {
  if (hasDragged.value && desktopSlider.value?.contains(event.target)) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
  }
};

onMounted(() => {
  nextTick(() => {
    // Reset offset to 0 when component mounts to ensure proper initial state
    currentOffset.value = 0;
    updateDesktopState();
  });

  window.addEventListener('resize', handleResize);
  document.addEventListener('click', globalClickHandler, true);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  document.removeEventListener('click', globalClickHandler, true);
  stopAnimation();
});

defineExpose({
  updateState: () => {
    updateDesktopState();
  },
});
</script>
