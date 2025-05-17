<template>
  <div
    class="relative flex w-full border border-black overflow-hidden"
    :class="vertical ? 'flex-col' : 'flex-row'"
  >
    <div
      class="absolute top-0 left-0 bg-black transition-transform duration-300 z-0"
      :style="backgroundStyle"
    ></div>

    <button
      v-for="(choice, idx) in choices"
      :key="idx"
      class="relative z-10 flex-1 flex items-center justify-center gap-2 text-lg transition-colors duration-300"
      :class="[buttonStyle, currentIndex === idx ? 'text-white' : 'text-black']"
      @click="updateValue(choice[0])"
    >
      <span class="material-symbols-outlined">{{ choice[1] }}</span>
      <span :class="{ hidden: hideLabel }">{{ choice[0] }}</span>
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
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

defineOptions({ name: 'FormsChoiceSlider' });

const currentIndex = computed(() =>
  props.choices.findIndex(([label]) => label === props.modelValue)
);

const segmentSize = computed(() => 100 / props.choices.length);

const backgroundStyle = computed(() => {
  const offset = `${currentIndex.value * 100}%`;
  if (props.vertical) {
    return {
      width: '100%',
      height: `${segmentSize.value}%`,
      transform: `translateY(${offset})`,
    };
  } else {
    return {
      height: '100%',
      width: `${segmentSize.value}%`,
      transform: `translateX(${offset})`,
    };
  }
});

function updateValue(val: string) {
  emit('update:modelValue', val);
}
</script>
