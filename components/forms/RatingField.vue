<template>
  <svg
    :width="totalWidth"
    :height="starHeight"
    :viewBox="`0 0 ${totalWidth} ${starHeight}`"
    @mousemove="onMouseMove"
    @mouseleave="onMouseLeave"
    @click="onClick"
  >
    <defs>
      <mask
        :id="maskId"
        maskUnits="userSpaceOnUse"
        maskContentUnits="userSpaceOnUse"
      >
        <g v-for="i in 5" :key="i">
          <g
            :transform="`translate(${
              (i - 1) * (starWidth + spacing)
            }, 0) scale(${starWidth / 24}, ${starHeight / 24})`"
          >
            <path :d="starPath" fill="white" />
          </g>
        </g>
      </mask>
    </defs>

    <!-- draw the empty outlines -->
    <g v-for="i in 5" :key="`outline-${i}`">
      <g
        :transform="`translate(${(i - 1) * (starWidth + spacing)}, 0) scale(${
          starWidth / 24
        }, ${starHeight / 24})`"
      >
        <path :d="starPath" fill="none" stroke="black" />
      </g>
    </g>

    <!-- fill rectangle using *this* instance’s mask -->
    <rect
      x="0"
      y="0"
      :width="fillWidth"
      :height="starHeight"
      fill="black"
      :mask="`url(#${maskId})`"
    />
  </svg>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Number,
    default: 0,
  },
  select: {
    type: Boolean,
    default: false,
  },
  starWidth: {
    type: Number,
    default: 22,
  },
  starHeight: {
    type: Number,
    default: 22,
  },
  spacing: {
    type: Number,
    default: -2,
  },
});

const maskId = `star-mask-${Math.random().toString(36).slice(2, 10)}`;

const emit = defineEmits(['update:modelValue']);

const hoverRating = ref(null);

const starPath =
  'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z';

const totalWidth = computed(() => 5 * props.starWidth + 4 * props.spacing);

const displayRating = computed(() =>
  hoverRating.value !== null ? hoverRating.value : props.modelValue
);

const fillWidth = computed(() => (displayRating.value / 5) * totalWidth.value);

const onMouseMove = (event) => {
  if (!props.select) return;
  const rect = event.currentTarget.getBoundingClientRect();
  const x = event.clientX - rect.left;
  let rating = (x / totalWidth.value) * 5;
  rating = Math.max(0, Math.min(5, rating));
  hoverRating.value = Math.round(rating * 2) / 2;
};

const onMouseLeave = () => {
  if (!props.select) return;
  hoverRating.value = null;
};

const onClick = (event) => {
  if (!props.select) return;
  const rect = event.currentTarget.getBoundingClientRect();
  const x = event.clientX - rect.left;
  let rating = (x / totalWidth.value) * 5;
  rating = Math.max(0, Math.min(5, rating));
  const newRating = Math.round(rating * 2) / 2;
  emit('update:modelValue', newRating);
};
</script>
