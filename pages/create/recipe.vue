<template>
  <div
    class="px-10 pt-10 m-auto flex flex-col items-center lg:w-[1000px] w-full"
  >
    <div class="flex gap-2 items-center">
      <span class="material-symbols-outlined mt-1"> stars_2 </span>
      <h1 class="font-bold !text-2xl">Create a new recipe</h1>
    </div>
    <div
      class="w-full min-h-[50vh] shadow-[4px_4px_0_0_rgba(0,0,0,1)] border-3 px-3 py-10 m-5"
    >
      <div
        class="flex flex-col items-center gap-4 pt-25 h-full"
        v-if="step === 1"
      >
        <!-- Step 1: Title -->
        <h2 class="text-xl font-bold">Choose a title:</h2>
        <input
          v-bind="title"
          class="bg-white shadow-[2px_2px_0_0_rgba(0,0,0,1)] border-2 w-[80%] lg:text-2xl text-xl font-bold"
          placeholder=""
          @keydown.enter="next"
        />
        <button
          class="bg-white border-2 p-1 !text-lg shadow-[3px_3px_0_0_rgba(0,0,0,1)] mt-43 w-20"
          @click="next"
          :disabled="step === 5"
        >
          Submit
        </button>
      </div>
      <div class="flex-col flex items-center" v-if="step === 2">
        <div class="grid lg:grid-cols-[1fr_1fr] p-3 gap-3 h-full">
          <!-- Step 2: Ingredients -->
          <div class="flex flex-col gap-3 h-full">
            <h2 class="text-xl font-bold text-center">Add ingredients</h2>
            <div class="w-full flex-col flex gap-2 p-2">
              <FormsIngredientListing />
              <FormsIngredientListing />
              <FormsIngredientListing />
              <div class="w-full grid grid-cols-[1fr_1fr_1fr] gap-2">
                <div class="border-2 p-[2px]">
                  <button class="bg-white p-2 border w-full h-full">
                    <span class="material-symbols-outlined"> search </span>
                  </button>
                </div>
                <div class="border-2 p-[2px]">
                  <button class="bg-white p-2 border w-full h-full">
                    <span class="material-symbols-outlined"> add </span>
                  </button>
                </div>
                <div class="border-2 p-[2px]">
                  <button class="bg-white p-2 border w-full h-full">
                    <span class="material-symbols-outlined"> barcode </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div class="flex flex-col gap-3 h-full items-center">
            <div class="flex items-end gap-1 w-full justify-center">
              <h2 class="text-xl font-bold">Add instructions</h2>
              <span class="font-light text-sm mb-[2px]">(Optional)</span>
            </div>

            <div class="w-full flex-col flex gap-2 p-2">
              <div
                v-for="(instruction, index) in instructions"
                :key="index"
                class="flex items-start min-h-6 gap-2"
              >
                <button
                  @click="removeInstruction(index)"
                  class="h-10 w-10 bg-white aspect-square p-2 text-2xl font-bold border-2 shadow-[2px_2px_0_0_rgba(0,0,0,1)] flex items-center justify-center group transition-colors duration-200 hover:bg-black"
                >
                  <span
                    class="absolute transition-opacity duration-200 group-hover:opacity-0"
                  >
                    {{ index + 1 }}
                  </span>

                  <span
                    class="absolute opacity-0 group-hover:opacity-100 duration-200 text-white material-symbols-outlined"
                  >
                    remove
                  </span>
                </button>
                <textarea
                  v-model="instructions[index]"
                  class="bg-white h-10 flex-grow p-1 border flex-wrap resize-none overflow-hidden leading-snug"
                  rows="1"
                  @input="autoResize($event)"
                />
              </div>

              <button
                @click="addInstruction"
                class="bg-white h-10 w-10 p-2 text-2xl font-bold border-2 shadow-[2px_2px_0_0_rgba(0,0,0,1)] flex items-center justify-center"
              >
                <span class="material-symbols-outlined"> add </span>
              </button>
            </div>
          </div>
        </div>
        <button
          class="bg-white border-2 p-1 w-20 !text-lg shadow-[3px_3px_0_0_rgba(0,0,0,1)] mt-[81px]"
          @click="next"
          :disabled="step === 5"
        >
          Submit
        </button>
      </div>
      <div class="flex flex-col gap-2 md:mx-15 items-center" v-if="step === 3">
        <!-- Step 3: Tags, options -->
        <div class="flex w-full justify-between items-center">
          <div>
            <h2 class="text-lg">Add fitting tags</h2>
            <p class="text-sm font-light">
              Cuisine, type, cooking method, flavor profile...
            </p>
          </div>
          <span class="material-symbols-outlined"> info </span>
        </div>
        <textarea
          class="bg-white h-10 border-3 border-double p-2 flex-wrap resize-none overflow-hidden leading-snug w-full"
          rows="1"
          @input="autoResize($event)"
        />
        <div class="flex w-full justify-center mt-8 gap-x-20 gap-y-5 flex-wrap">
          <div class="flex flex-col items-center">
            <h3 class="text-lg">Difficulty</h3>
            <div class="flex gap-2">
              <button
                @click="difficulty = 1"
                :class="{
                  'shadow-[2px_2px_0_0_rgba(0,0,0,1)]': difficulty == 1,
                }"
                class="bg-white p-2 h-13 border flex items-center justify-center"
              >
                <img class="w-6 h-6" src="/knife.png" />
              </button>
              <button
                @click="difficulty = 2"
                :class="{
                  'shadow-[2px_2px_0_0_rgba(0,0,0,1)]': difficulty == 2,
                }"
                class="bg-white p-2 h-13 border flex items-center justify-center"
              >
                <img class="w-6 h-6" src="/knife.png" />
                <img class="w-6 h-6" src="/knife.png" />
              </button>
              <button
                @click="difficulty = 3"
                :class="{
                  'shadow-[2px_2px_0_0_rgba(0,0,0,1)]': difficulty == 3,
                }"
                class="bg-white p-2 h-13 border flex items-center justify-center"
              >
                <img class="w-6 h-6" src="/knife.png" />
                <img class="w-6 h-6" src="/knife.png" />
                <img class="w-6 h-6" src="/knife.png" />
              </button>
            </div>
          </div>
          <div class="flex flex-col items-center">
            <h3 class="text-lg">Effort</h3>
            <div class="flex gap-2">
              <button
                @click="effort = 1"
                :class="{ 'shadow-[2px_2px_0_0_rgba(0,0,0,1)]': effort == 1 }"
                class="bg-white p-2 h-13 border flex items-center justify-center"
              >
                <img class="w-6 h-6" src="/hourglass.png" />
              </button>
              <button
                @click="effort = 2"
                :class="{ 'shadow-[2px_2px_0_0_rgba(0,0,0,1)]': effort == 2 }"
                class="bg-white p-2 h-13 border flex items-center justify-center"
              >
                <img class="w-6 h-6" src="/hourglass.png" />
                <img class="w-6 h-6" src="/hourglass.png" />
              </button>
              <button
                @click="effort = 3"
                :class="{ 'shadow-[2px_2px_0_0_rgba(0,0,0,1)]': effort == 3 }"
                class="bg-white p-2 h-13 border flex items-center justify-center"
              >
                <img class="w-6 h-6" src="/hourglass.png" />
                <img class="w-6 h-6" src="/hourglass.png" />
                <img class="w-6 h-6" src="/hourglass.png" />
              </button>
            </div>
          </div>
        </div>
        <div class="flex flex-col items-center mt-6">
          <h3 class="text-lg">Visibility</h3>
          <div class="flex gap-4">
            <button
              @click="visibility = 'private'"
              :class="{
                'shadow-[2px_2px_0_0_rgba(0,0,0,1)]': visibility == 'private',
              }"
              class="bg-white p-2 h-13 text-lg border flex items-center justify-center"
            >
              Private
            </button>
            <button
              @click="visibility = 'unlisted'"
              :class="{
                'shadow-[2px_2px_0_0_rgba(0,0,0,1)]': visibility == 'unlisted',
              }"
              class="bg-white p-2 h-13 text-lg border flex items-center justify-center"
            >
              Unlisted
            </button>
            <button
              @click="visibility = 'public'"
              :class="{
                'shadow-[2px_2px_0_0_rgba(0,0,0,1)]': visibility == 'public',
              }"
              class="bg-white p-2 h-13 text-lg border flex items-center justify-center"
            >
              Public
            </button>
          </div>
        </div>
        <button
          class="bg-white border-2 p-1 w-20 !text-lg shadow-[3px_3px_0_0_rgba(0,0,0,1)] mt-8"
          @click="next"
          :disabled="step === 5"
        >
          Submit
        </button>
      </div>
      <div class="flex flex-col items-center gap-4" v-if="step === 4">
        <!-- Step 4: Upload an Image -->
        <h2 class="text-xl font-bold">Upload an Image</h2>
        <div class="h-50 w-50 border flex items-center justify-center">
          Image Upload Field
        </div>
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined"> info </span>
          <span class="font-light"
            >If no image is provided, your recipe will not appear in
            searches.</span
          >
        </div>
        <button
          class="bg-white border-2 p-1 !text-lg shadow-[3px_3px_0_0_rgba(0,0,0,1)] mt-17 w-20"
          @click="next"
          :disabled="step === 5"
        >
          Submit
        </button>
      </div>
    </div>
    <div class="relative flex w-full sm:px-30 px-10 -mt-11 justify-between">
      <button
        class="bg-white w-12 h-12 border-[3px] p-2 !text-2xl shadow-[4px_4px_0_0_rgba(0,0,0,1)] flex items-center justify-center"
        @click="back"
        :disabled="step === 1"
      >
        <span class="ml-2 material-symbols-outlined">arrow_back_ios</span>
      </button>

      <button
        class="bg-white w-12 h-12 border-3 p-2 !text-2xl shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
        @click="next"
        :disabled="step === 5"
      >
        <span class="material-symbols-outlined"> arrow_forward_ios </span>
      </button>
    </div>
  </div>
</template>

<script setup>
const step = ref(1);
const instructions = ref([]);

const difficulty = ref(2);
const effort = ref(2);
const visibility = ref('public');

function addInstruction() {
  instructions.value.push('');
}

function removeInstruction(index) {
  instructions.value.splice(index, 1);
}

function next() {
  if (step.value < 4) step.value++;
}

function back() {
  if (step.value > 1) step.value--;
}
function autoResize(event) {
  const textarea = event.target;
  textarea.style.height = 'auto'; // Reset height
  if (textarea.scrollHeight > 40) {
    textarea.style.height = textarea.scrollHeight + 'px'; // Set to scroll height
  } else {
    textarea.style.height = 40 + 'px';
  }
}
</script>

<style scoped></style>
