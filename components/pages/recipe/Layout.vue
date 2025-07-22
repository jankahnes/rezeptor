<template>
  <div class="m-4 sm:m-10">
    <div class="mt-10 max-w-[1350px] mx-auto">
      <div
        class="grid grid-cols-1 xl:grid-cols-[4fr_7fr] grid-rows-[auto_auto] gap-4 items-start"
      >
        <figure
          class="mx-auto aspect-square w-full max-h-[500px] max-w-[500px] p-4 shadow-md transform transition-transform duration-500 relative group rounded-2xl"
        >
          <slot name="image" />
          <div
            class="absolute -top-2 left-1/4 w-[15%] h-[7%] transform -rotate-12 tape"
          ></div>
          <div
            class="absolute -top-2 right-1/4 w-[15%] h-[7%] transform rotate-12 tape"
          ></div>
        </figure>
        <div
          class="p-7 flex flex-col justify-between h-full gap-4 text-center md:text-left items-center md:items-start"
        >
          <div
            class="flex flex-col gap-3 items-center md:items-start justify-between w-full"
          >
            <div
              class="flex justify-center md:justify-start gap-6 items-center w-full"
            >
              <slot name="title" />
            </div>
            <slot name="user-row" />
            <div class="flex items-center gap-3">
              <slot name="rating" />
            </div>
            <div
              class="flex flex-wrap gap-2 items-center gap-y-1 justify-center md:justify-start"
            >
              <slot name="tags" />
            </div>
            <slot name="description" />
          </div>
          <div class="flex-col gap-4 flex">
            <div
              class="flex gap-4 gap-y-1 items-center flex-wrap justify-center md:justify-start"
            >
              <slot name="metadata" />
            </div>
            <div
              class="flex gap-4 gap-y-1 items-center flex-wrap justify-center md:justify-start"
            >
              <slot name="actions" />
            </div>
          </div>
        </div>
      </div>
      <div class="mt-10">
        <div class="grid grid-cols-1 xl:grid-cols-[2fr_3fr] gap-12">
          <slot name="ingredients" />
          <slot name="instructions" />
        </div>
        <div class="flex flex-col items-center mt-10 gap-10">
          <slot name="nutrition" />
          <slot name="ai-buttons" />
          <slot name="comments" />
        </div>
      </div>
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
  box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 2px inset;
}
</style>
