<template>
  <div class="m-4 mt-10 sm:m-10">
    <div
      class="grid grid-cols-1 xl:grid-cols-[3fr_7fr] grid-rows-[auto_auto] gap-4 items-start"
    >
      <figure
        class="mx-auto aspect-square w-full max-h-[500px] max-w-[500px] p-4 shadow-[0_0_50px_-12px_rgba(146,64,14,0.3)] transform rotate-1 hover:rotate-0 transition-transform duration-500 relative group rounded-2xl bg-[#fdf5ea]"
      >
        <slot name="image" />
        <div
          class="absolute -top-3 left-1/4 w-[15%] h-[8%] transform -rotate-12 tape"
        ></div>
        <div
          class="absolute -top-3 right-1/4 w-[15%] h-[8%] transform rotate-12 tape"
        ></div>
      </figure>
      <div class="grid grid-cols-1 md:grid-cols-[8fr_1fr] gap-4 p-7 h-full">
        <div
          class="flex flex-col justify-between h-full gap-4 text-center md:text-left items-center md:items-start"
        >
          <div
            class="flex flex-col gap-3 items-center md:items-start justify-between w-full"
          >
            <div
              class="flex justify-center md:justify-start gap-6 items-center w-full"
            >
              <slot name="title" />
            </div>
            <div class="flex items-center gap-3">
              <slot name="rating" />
            </div>
            <div
              class="flex flex-wrap gap-2 items-center gap-y-1 justify-center md:justify-start"
            >
              <slot name="tags" />
            </div>
            <div
              v-if="$slots.description"
              class="bg-amber-50 border-2 border-amber-200 rounded-lg p-4 w-full lg:w-[80%] shadow-lg transform relative font-[Gloria_Hallelujah] text-sm text-[#7B3306]"
            >
              <slot name="description" />
            </div>
          </div>
          <div
            class="flex gap-4 gap-y-1 items-center flex-wrap justify-center md:justify-start"
          >
            <slot name="metadata" />
          </div>
        </div>
        <div class="flex justify-center md:justify-start md:flex-col gap-3 flex-wrap">
          <slot name="actions" />
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
</template>

<script setup lang="ts">
interface Recipe {
  id?: number;
  title?: string;
  rating?: number;
  tags?: any[];
  image_url?: string;
  effort?: string;
  difficulty?: string;
  price?: number;
  ingredients?: any[];
  instructions?: any[];
  comments?: any[];
}
</script>

<style scoped>
.tape {
  background: linear-gradient(
    45deg,
    rgb(254, 243, 199) 0%,
    rgb(253, 230, 138) 100%
  );
  border-radius: 2px;
  box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 2px inset;
}
</style>
