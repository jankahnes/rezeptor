<template>
  <div
    v-if="ingredientList?.length == 0"
    class="flex items-center justify-center h-[55vh]"
  >
    <div class="flex flex-col items-center">
      <span class="material-symbols-outlined !font-bold !text-6xl">
        menu_book
      </span>
      <span>Start a search or scan a code to see results</span>
    </div>
  </div>
  <div v-else class="h-[60vh]">
    <ul class="hidden sm:block w-full overflow-auto h-full">
      <li class="flex gap-4 py-2 min-w-max sticky top-0 bg-white z-30">
        <span class="flex-[5] w-[15rem] shrink-0 sticky left-0 bg-white z-40">
          Name
        </span>
        <span class="flex-1 min-w-[4rem] shrink-0">Kcal</span>
        <span class="flex-1 min-w-[4rem] shrink-0">Carbs</span>
        <span class="flex-1 min-w-[4rem] shrink-0">Protein</span>
        <span class="flex-1 min-w-[4rem] shrink-0">Fat</span>
        <span class="flex-1 min-w-[4rem] shrink-0">Sugar</span>
        <span class="flex-1 min-w-[4rem] shrink-0">Fiber</span>
        <span class="flex-1 min-w-[4rem] shrink-0">Salt</span>
        <span class="flex-1 min-w-[4rem] shrink-0">Cost</span>
      </li>
      <li v-for="(food, index) in ingredientList" :key="index">
        <div
          class="flex gap-4 py-3 min-w-max group"
          :class="
            index % 2 === 0
              ? 'bg-slate-100 hover:!bg-slate-200'
              : 'bg-gray-50 hover:bg-gray-100'
          "
          @click="onClick(food)"
        >
          <span
            class="flex-[5] w-[15rem] shrink-0 overflow-hidden whitespace-nowrap relative sticky left-0 z-10"
            :class="
              index % 2 === 0
                ? 'bg-slate-100 group-hover:!bg-slate-200'
                : 'bg-gray-50 group-hover:bg-gray-100'
            "
          >
            <span class="block pr-6">{{ food.name }}</span>
            <span
              class="absolute right-0 top-0 h-full w-6 pointer-events-none bg-gradient-to-l to-transparent z-20"
              :class="
                index % 2 === 0
                  ? 'from-slate-100 group-hover:from-slate-200'
                  : 'from-gray-50 group-hover:from-gray-100'
              "
            ></span>
          </span>

          <span class="flex-1 min-w-[4rem] shrink-0">{{ food.kcal }}</span>
          <span class="flex-1 min-w-[4rem] shrink-0">{{ food.carbs }}</span>
          <span class="flex-1 min-w-[4rem] shrink-0">{{ food.protein }}</span>
          <span class="flex-1 min-w-[4rem] shrink-0">{{ food.fat }}</span>
          <span class="flex-1 min-w-[4rem] shrink-0">{{ food.sugar }}</span>
          <span class="flex-1 min-w-[4rem] shrink-0">{{ food.fiber }}</span>
          <span class="flex-1 min-w-[4rem] shrink-0">{{ food.salt }}</span>
          <span class="flex-1 min-w-[4rem] shrink-0">{{ food.price }}</span>
        </div>
      </li>
    </ul>
    <ul class="sm:hidden w-full overflow-auto h-full">
      <li class="flex gap-4 py-2 min-w-max sticky top-0 bg-white z-30">
        <span class="flex-[3] w-[10rem] shrink-0 sticky left-0 bg-white z-40">
          Name
        </span>
        <span class="flex-1 min-w-[4rem] shrink-0">Details</span>
      </li>
      <li v-for="(food, index) in ingredientList" :key="index">
        <div
          class="flex gap-4 py-3 min-w-max group"
          :class="
            index % 2 === 0
              ? 'bg-slate-100 hover:!bg-slate-200'
              : 'bg-gray-50 hover:bg-gray-100'
          "
          @click="onClick(food)"
        >
          <span
            class="flex-[3] w-[10rem] shrink-0 overflow-hidden whitespace-nowrap relative sticky left-0 z-10"
            :class="
              index % 2 === 0
                ? 'bg-slate-100 group-hover:!bg-slate-200'
                : 'bg-gray-50 group-hover:bg-gray-100'
            "
          >
            <span class="block pr-6">{{ food.name }}</span>
            <span
              class="absolute right-0 top-0 h-full w-6 pointer-events-none bg-gradient-to-l to-transparent z-20"
              :class="
                index % 2 === 0
                  ? 'from-slate-100 group-hover:from-slate-200'
                  : 'from-gray-50 group-hover:from-gray-100'
              "
            ></span>
          </span>
          <span class="flex-1 min-w-[4rem] shrink-0 select-none flex ml-3">
            <div
              class="flex bg-none w-6 h-6 font-bold gap-1 items-center justify-center"
            >
              <span class="material-symbols-outlined"> open_in_new </span>
            </div>
          </span>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({ ingredientList: Array<Object>, onClick: Function });
</script>

<style scoped></style>
