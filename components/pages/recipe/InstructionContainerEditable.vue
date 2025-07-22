<template>
  <div>
    <div class="relative mx-auto w-full flex justify-center">
      <div
        class="header flex items-center text-center px-10 xl:px-14 mx-auto justify-center rounded-lg p-2 overflow-visible"
      >
        <h1 class="text-3xl font-bold">Instructions</h1>
      </div>
    </div>
    <ol class="p-3 space-y-1.5 mt-4">
      <li v-for="i in modelValue.length + 1" :key="i">
        <div class="flex gap-2 items-center">
          <div class="flex-1 flex flex-col rounded-lg shadow-sm">
            <div
              class="relative min-h-20 flex items-center justify-center w-full h-full"
            >
              <div
                class="flex gap-2 rounded-lg p-4 w-full h-full text-xl justify-center"
              >
                <span v-if="i <= modelValue.length" class="">{{ i }}.</span>

                <div class="w-full h-full">
                  <textarea
                    v-if="i <= modelValue.length"
                    v-model="modelValue[i - 1]"
                    v-auto-resize
                    class="w-full h-full bg-transparent border-none outline-none resize-none overflow-hidden break-words scrollbar-hide flex-1"
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
defineProps({ modelValue: Array<String> });
</script>

<style scoped></style>
