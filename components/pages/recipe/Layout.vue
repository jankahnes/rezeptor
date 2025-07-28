<template>
  <div class="lg:mt-8 max-w-7xl mx-auto">
    <div class="rounded-2xl shadow-sm px-10">
      <div class="px-4 sm:px-6 lg:px-8 py-8">
        <div class="grid grid-cols-1 lg:grid-cols-[3fr_4fr] items-center gap-6">
          <div class="relative">
            <figure
              class="relative aspect-square max-w-md shadow-lg overflow-hidden rounded-2xl"
            >
              <slot name="image" />
            </figure>
            <div
              class="absolute -top-3 left-1/4 w-18 h-8 transform -rotate-12 tape shadow-sm hidden lg:block"
            ></div>
            <div
              class="absolute -top-3 right-1/4 w-18 h-8 transform rotate-12 tape shadow-sm hidden lg:block"
            ></div>
          </div>
          <div
            class="gap-4 h-full py-6 flex flex-col justify-between mx-auto lg:mx-0"
          >
            <div class="flex flex-col gap-3 items-start">
              <slot name="title" />

              <slot name="user-row" />
              <div class="flex items-center gap-2">
                <slot name="rating" />
              </div>
              <div
                class="text-center lg:text-left text-gray-600 leading-relaxed"
              >
                <slot name="description" />
              </div>
            </div>
            <div class="flex flex-col gap-6 items-start">
              <div class="flex flex-wrap gap-2">
                <slot name="tags" />
              </div>
              <div class="flex flex-wrap gap-4 sm:gap-10">
                <slot name="metadata" />
              </div>

              <div class="flex flex-wrap gap-3">
                <slot name="actions" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-12 mb-16">
        <div
          class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <slot name="ingredients" />
        </div>

        <div
          class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <slot name="instructions">
            <div class="p-8 text-center text-gray-500">
              <div
                class="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center"
              >
                <span class="material-symbols-outlined text-2xl text-gray-400"
                  >cooking</span
                >
              </div>
              <h3 class="text-lg font-medium text-gray-700 mb-2">
                No Instructions Available
              </h3>
              <p class="text-sm">
                Instructions for this recipe haven't been added yet.
              </p>
            </div>
          </slot>
        </div>
      </div>

      <slot name="nutrition" />

      <div class="text-center mb-16">
        <slot name="ai-buttons" />
      </div>

      <slot name="comments" />
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.tape {
  background: linear-gradient(
    45deg,
    rgb(255, 244, 204) 0%,
    rgb(255, 231, 136) 100%
  );
  border-radius: 2px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1),
    inset 0 1px 2px rgba(255, 255, 255, 0.3);
}
</style>
