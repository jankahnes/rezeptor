<template>
  <div
    class="p-2 md:p-6 h-full flex flex-col flex-[1_1_22rem] ml-1 items-start"
  >
    <div class="flex justify-between items-center w-full mb-2">
      <div class="px-4 py-1 mb-2 bg-primary text-white rounded-lg flex">
        <h2 class="text-lg font-bold">METHOD</h2>
      </div>
      <button
        class="button flex items-center gap-2 px-2 py-1 font-medium !bg-primary/10 text-primary text-xs will-change-transform"
        @click="pasteInstructions"
      >
        <span class="material-symbols-outlined !text-sm"> content_copy </span>
        <span>Paste</span>
      </button>
    </div>
    <ol class="w-full">
      <li v-for="i in modelValue.length + 1" :key="i">
        <div class="flex gap-2 items-center w-full">
          <div class="flex-1 flex flex-col rounded-lg w-full">
            <div
              class="relative min-h-20 flex items-center justify-start w-full h-full"
            >
              <div
                class="flex gap-4 rounded-lg p-3 w-full h-full justify-start"
              >
                <span v-if="i <= modelValue.length" class="text-xl font-bold"
                  >{{ i }}.</span
                >

                <div class="w-full h-full">
                  <textarea
                    v-if="i <= modelValue.length"
                    v-model="modelValue[i - 1]"
                    v-auto-resize
                    class="w-full h-full bg-transparent border-none outline-none resize-none overflow-hidden break-words scrollbar-hide flex-1 text-gray-800 leading-relaxed"
                  />
                  <button
                    v-else
                    @click="modelValue.push('')"
                    class="rounded-lg p-2 w-full h-full cursor-pointer"
                  >
                    <span class="material-symbols-outlined !text-4xl">add</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </li>
    </ol>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  modelValue: {
    type: Object as PropType<string[]>,
    default: () => [],
  },
});

const emit = defineEmits(['update:modelValue']);

const pasteInstructions = async () => {
  const text = await navigator.clipboard.readText();
  emit(
    'update:modelValue',
    text.split('\n').filter((line) => line.trim() !== '')
  );
};
</script>

<style scoped></style>
