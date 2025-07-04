<template>
  <div
    class="relative flex w-full overflow-hidden"
    :class="vertical ? 'flex-col' : 'flex-row'"
  >
    <!-- highlight bar -->
    <div
      class="absolute top-0 left-0 rounded-lg bg-tertiary transition-all duration-300 z-0"
      :style="backgroundStyle"
    ></div>

    <button
      v-for="(choice, idx) in choices"
      :key="idx"
      ref="btnRefs"
      class="relative z-10 flex-1 flex items-center justify-center text-lg transition-colors duration-300"
      :class="[buttonStyle]"
      @click="updateValue(choice[0])"
    >
      <span
        class="material-symbols-outlined mx-[2px]"
        :class="{ hidden: hideIcon }"
        >{{ choice[1] }}</span
      >
      <span class="mx-[2px]" :class="{ hidden: hideLabel }">{{
        choice[0]
      }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  choices: [string, string][];
  modelValue: string;
  vertical?: boolean;
  buttonStyle?: string;
  hideLabel?: boolean;
  hideIcon?: boolean;
}>();
const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>();

defineOptions({ name: 'FormsChoiceSlider' });

const btnRefs = ref<Array<HTMLElement | null>>([]);

const segmentSizes = ref<number[]>([]);
const segmentOffsets = ref<number[]>([]);

function measureSegments() {
  nextTick(() => {
    if (props.vertical) {
      segmentSizes.value = btnRefs.value.map((btn) => btn?.offsetHeight || 0);
      segmentOffsets.value = btnRefs.value.map((btn) => btn?.offsetTop || 0);
    } else {
      segmentSizes.value = btnRefs.value.map(
        (btn) => btn?.offsetWidth + 1 || 0
      );
      segmentOffsets.value = btnRefs.value.map((btn) => btn?.offsetLeft || 0);
    }
  });
}

onMounted(measureSegments);

const currentIndex = computed(() =>
  props.choices.findIndex(([label]) => label === props.modelValue)
);

const backgroundStyle = computed(() => {
  if (
    segmentSizes.value.length !== props.choices.length ||
    segmentOffsets.value.length !== props.choices.length ||
    currentIndex.value < 0
  )
    return { opacity: 0 };

  if (props.vertical) {
    return {
      left: 0,
      width: '100%',
      top: segmentOffsets.value[currentIndex.value] + 'px',
      height: segmentSizes.value[currentIndex.value] + 'px',
      opacity: 0.5,
    };
  } else {
    return {
      top: 0,
      height: '100%',
      left: segmentOffsets.value[currentIndex.value] + 'px',
      width: segmentSizes.value[currentIndex.value] + 'px',
      opacity: 0.5,
    };
  }
});

function updateValue(val: string) {
  emit('update:modelValue', val);
}
</script>
