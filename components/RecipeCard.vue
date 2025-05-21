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
        <div class="stars flex justify-center text-xl pb-2">
          <span class="text-[#91e996] material-icons">star</span>
          <span class="text-[#91e996] material-icons">star</span>
          <span class="text-[#91e996] material-icons">star</span>
          <span class="text-[#91e996] material-icons">star</span>
          <span class="text-[#91e996] material-icons">star_half</span>
        </div>
        <div
          class="tag-field items-center justify-center h-[25%] flex gap-x-2 gap-y-1 flex-wrap"
        >
          <Tag
            class="text-xs border rounded-xl px-1 py-[1px] bg-white"
            v-for="tag in recipe.tags"
            :id="tag"
          />
        </div>
        <div
          class="w-[70%] sm:w-[90%] flex justify-between items-center text-sm h-full my-3 sm:mt-6"
        >
          <Difficulty1 class="w-7 h-7" v-if="recipe?.difficulty === 'EASY'" />
          <Difficulty2 class="w-9 h-7" v-if="recipe?.difficulty === 'MEDIUM'" />
          <Difficulty3 class="w-10 h-7" v-if="recipe?.difficulty === 'HARD'" />
          <Effort1 class="w-7 h-7" v-if="recipe?.effort === 'LIGHT'" />
          <Effort2 class="w-7 h-7" v-if="recipe?.effort === 'MODERATE'" />
          <Effort3 class="w-8 h-7" v-if="recipe?.effort === 'HEAVY'" />

          <Badge class="w-8 h-8" />
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import Difficulty1 from '@/assets/icons/difficulty1.svg';
import Difficulty2 from '@/assets/icons/difficulty2.svg';
import Difficulty3 from '@/assets/icons/difficulty3.svg';
import Effort1 from '@/assets/icons/effort1.svg';
import Effort2 from '@/assets/icons/effort2.svg';
import Effort3 from '@/assets/icons/effort3.svg';
import Badge from '@/assets/icons/badge.svg';

const props = defineProps({recipe: Object})

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
