<template>
  <div
    class="relative flex w-full border border-black overflow-hidden"
    :class="vertical ? 'flex-col' : 'flex-row'"
  >
    <div
      class="absolute bg-black transition-all duration-300 z-0"
      :style="backgroundStyle"
    ></div>

    <button
      v-for="(choice, idx) in choices"
      :key="idx"
      ref="buttonRefs"
      class="relative z-10 flex items-center justify-center gap-2 text-lg transition-colors duration-300"
      :class="[buttonStyle, currentIndex === idx ? 'text-white' : 'text-black']"
      @click="updateValue(choice[0])"
    >
      <span class="material-symbols-outlined" :class="{ hidden: hideIcon }">{{
        choice[1]
      }}</span>
      <span :class="{ hidden: hideLabel }">{{ choice[0] }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue';

const props = defineProps<{
  choices: [string, string][];
  modelValue: string;
  vertical?: boolean;
  buttonStyle?: string;
  hideLabel?: boolean;
  hideIcon?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

defineOptions({ name: 'FormsChoiceSlider' });

const currentIndex = computed(() =>
  props.choices.findIndex(([label]) => label === props.modelValue)
);

const buttonRefs = ref([]);
const selectedButtonRect = reactive({ position: 0, size: 0 });

watch(
  currentIndex,
  (newIndex) => {
    nextTick(() => {
      const button = buttonRefs.value[newIndex];
      if (button) {
        if (props.vertical) {
          selectedButtonRect.position = button.offsetTop;
          selectedButtonRect.size = button.offsetHeight;
        } else {
          selectedButtonRect.position = button.offsetLeft;
          selectedButtonRect.size = button.offsetWidth;
        }
      }
    });
  },
  { immediate: true }
);

const backgroundStyle = computed(() => {
  if (props.vertical) {
    return {
      left: '0',
      top: `${selectedButtonRect.position}px`,
      height: `${selectedButtonRect.size}px`,
      width: '100%',
    };
  } else {
    return {
      top: '0',
      left: `${selectedButtonRect.position}px`,
      width: `${selectedButtonRect.size}px`,
      height: '100%',
    };
  }
});

function updateValue(val: string) {
  emit('update:modelValue', val);
}
</script>
