<template>
  <div class="pt-10">
    <div
      class="mx-3 md:mx-auto md:max-w-2xl xl:max-w-[85%] min-h-[80vh] sm:p-10 sm:border-4 sm:shadow-[6px_6px_0_0_rgba(0,0,0,1)] card"
    >
      <div class="grid xl:grid-cols-[3fr_7fr] grid-rows-[auto_auto] gap-4">
        <div class="flex items-center justify-center">
          <img src="/placeholder-dish.jpg" class="w-full h-full" />
        </div>
        <div class="p-7 flex flex-col justify-between">
          <div class="">
            <div class="flex align-center w-full justify-between">
              <h1 class="font-extrabold text-4xl">Chicken Parmesan</h1>
              <div class="flex gap-2 items-center">
                <button
                  class="bg-white text-white border-2 p-1 flex align-center justify-center shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
                >
                  <span class="text-black material-icons !text-[20px]"
                    >bookmark</span
                  >
                </button>
                <button
                  class="bg-white text-white border-2 p-1 flex align-center justify-center shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
                >
                  <span class="text-black material-icons !text-[20px]"
                    >share</span
                  >
                </button>
              </div>
            </div>

            <div class="stars flex text-xl mt-1 items-center">
              <span class="text-[#91e996] material-icons">star</span>
              <span class="text-[#91e996] material-icons">star</span>
              <span class="text-[#91e996] material-icons">star</span>
              <span class="text-[#91e996] material-icons">star</span>
              <span class="text-[#91e996] material-icons">star_half</span>
              <span class="ml-2 text-base">4.5</span>
            </div>
            <div
              class="tag-field gap-x-2 gap-y-2 xl:mt-6 mt-10 xl:w-[70%] items-center flex flex-wrap justify-start"
            >
              <Tag v-for="tag in tags" :key="tag" class="tag" :big="true" />
            </div>
          </div>

          <div class="hidden [@media(min-width:600px)]:block">
            <div class="flex justify-between xl:pt-0 pt-8">
              <div class="flex gap-4 align-center">
                <div
                  class="h-10 w-10 bg-white border-black border-1 flex items-center justify-center"
                >
                  <span class="material-icons text-black !text-2xl"
                    >schedule</span
                  >
                </div>
                <div class="">
                  <p class="text-sm">Total Time</p>
                  <p
                    class="text-base font-bold -mt-[3px] whitespace-nowrap overflow-visible"
                  >
                    30 Minutes
                  </p>
                </div>
              </div>
              <div class="flex gap-4 align-center">
                <div
                  class="h-10 w-10 bg-white border-black border-1 flex items-center justify-center"
                >
                  <span class="material-icons text-black !text-2xl">speed</span>
                </div>
                <div>
                  <p class="text-sm">Difficulty</p>
                  <p class="text-base font-bold -mt-[3px]">Medium</p>
                </div>
              </div>
              <div class="flex gap-4 align-center">
                <div
                  class="h-10 w-10 bg-white border-black border-1 flex items-center justify-center"
                >
                  <span class="material-icons text-black !text-2xl"
                    >attach_money</span
                  >
                </div>
                <div>
                  <p class="text-sm whitespace-nowrap overflow-visible">
                    Estimated Cost
                  </p>
                  <p class="text-base font-bold -mt-[3px]">7€ - 9€</p>
                </div>
              </div>
            </div>
          </div>
          <div class="hidden [@media(max-width:599px)]:block mt-6">
            <div class="flex justify-between w-full">
              <div class="flex items-center gap-2">
                <span class="material-icons text-black !text-2xl"
                  >schedule</span
                >
                <span>30 min</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="material-icons text-black !text-2xl">speed</span>
                <span>Medium</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="material-icons text-black !text-2xl"
                  >attach_money</span
                >
                <span>7€ - 9€</span>
              </div>
            </div>
          </div>
        </div>
        <div class="">
          <PagesRecipeIngredientList />
        </div>
        <div class="px-2 sm:px-7 space-y-10">
          <PagesRecipeInstructionContainer />
          <PagesRecipeNutriCard />
        </div>
      </div>
      <PagesRecipeCommentSection />
    </div>
  </div>
</template>

<script setup lang="ts">
const tags = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
</script>

<style scoped>
@media (min-width: 640px) {
  .card {
    background: radial-gradient(
      ellipse at center,
      #f0ece477 0%,
      #f5efe17c 80%,
      #ece4ce7e  100%
    );
  }
}
</style>
