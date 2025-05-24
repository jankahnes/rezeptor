<template>
  <NuxtLink :to="'/recipe/' + recipe?.id">
    <div
      class="w-full xs:w-80 sm:w-120 min-h-100 sm:min-h-60 xs:border-3 font-bold xs:shadow-[4px_4px_0_0_rgba(0,0,0,1)] grid grid-cols-1 sm:grid-cols-2 papyrus-gradient"
    >
      <div class="p-5">
        <img class="rounded-md" :src="recipe?.imageUrl" />
      </div>
      <div
        class="w-full h-full sm:pt-5 pl-1 sm:pr-5 px-4 flex flex-col items-center gap-2"
      >
        <h1
          class="text-center font-extrabold leading-none tracking-tight text-[24px]"
        >
          {{ recipe.title }}
        </h1>
        <FormsRatingField class="h-16" v-if="recipe?.rating" v-model="recipe.rating" :select="false"/>
        <div
          class="tag-field items-center justify-center h-[25%] flex gap-x-2 gap-y-1 flex-wrap mt-3"
        >
          <Tag
            class="text-xs border rounded-xl px-1 py-[1px] "
            v-for="tag in recipe.tags"
            :id="tag"
          />
        </div>
        <div
          class="w-[70%] sm:w-[90%] flex justify-between items-center text-sm h-full my-3 sm:mt-6"
        >
          <img
            class="w-6 h-6"
            v-if="recipe?.difficulty === 'EASY'"
            src="/difficulty1.png"
          />
          <img
            class="w-7 h-6"
            v-if="recipe?.difficulty === 'MEDIUM'"
            src="/difficulty2.png"
          />
          <img
            class="w-[34px] h-6"
            v-if="recipe?.difficulty === 'HARD'"
            src="/difficulty3.png"
          />
          <img
            class="w-[18px] h-6"
            v-if="recipe?.effort === 'LIGHT'"
            src="/effort1.png"
          />
          <img
            class="w-6 h-6"
            v-if="recipe?.effort === 'MODERATE'"
            src="/effort2.png"
          />
          <img
            class="w-[30px] h-6"
            v-if="recipe?.effort === 'HEAVY'"
            src="/effort3.png"
          />

          <img
            class="w-[22px] h-[25px]"
            src="/badge.png"
          />
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import Badge from '@/assets/icons/badge.svg';

const props = defineProps({ recipe: Object });
</script>

<style scoped>
@media (min-width: 640px) {
  .papyrus-gradient {
    background: radial-gradient(
      ellipse at center,
      #f0ece477 0%,
      #f5efe17c 80%,
      #ece4ce7e 100%
    );
  }
}
</style>
