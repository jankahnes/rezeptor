<template>
  <PagesRecipeLayout>
    <template #image>
      <img
        :src="recipeStore.recipe?.picture_url"
        class="aspect-square object-cover transition-transform duration-700 group-hover:scale-105 rounded-xl"
      />
    </template>

    <template #title>
      <h1 class="font-bold text-5xl">{{ recipeStore.recipe?.title }}</h1>
    </template>

    <template #rating>
      <FormsRatingField
        v-if="recipeStore.recipe?.rating"
        v-model="recipeStore.recipe.rating"
        :select="false"
        :star-width="26"
        :star-height="26"
        :spacing="-2"
        :id="250"
      ></FormsRatingField>
      <span class="text-lg">{{ recipeStore.recipe?.rating }}</span>
    </template>

    <template #tags>
      <Tag class="" v-for="tag in recipeStore.recipe?.tags" :id="tag" />
    </template>

    <template v-if="recipeStore.recipe?.description" #description>
      {{ recipeStore.recipe?.description }}
    </template>

    <template #metadata>
      <div
        class="flex gap-2 items-center justify-center bg-[#DBFCE7] border-[#98E9AF] text-[#008236] border-3 rounded-xl p-2 font-bold shadow-lg"
      >
        <span class="material-symbols-outlined"> flash_on </span>
        <span class="text-base"
          >Effort: {{ capitalize(recipeStore.recipe?.effort) }}</span
        >
      </div>
      <div
        class="flex gap-2 items-center justify-center bg-[#DBFCE7] border-[#98E9AF] text-[#008236] border-3 rounded-xl p-2 font-bold shadow-lg"
      >
        <span class="material-symbols-outlined"> target </span>
        <span class="text-base"
          >Difficulty: {{ capitalize(recipeStore.recipe?.difficulty) }}</span
        >
      </div>
      <div
        class="flex gap-2 items-center justify-center bg-[#DBFCE7] border-[#98E9AF] text-[#008236] border-3 rounded-xl p-2 font-bold shadow-lg"
      >
        <span class="material-symbols-outlined"> attach_money </span>
        <span class="text-base"
          >Estimated Price: {{ formatMoney(recipeStore.recipe?.price) }}</span
        >
      </div>
    </template>

    <template #actions>
      <button
        class="select-none text-[#FF6900] border-2 border-[#FF6900] rounded-xl px-4 py-2 flex items-center gap-3 bg-white hover:bg-[#fcf8f5] md:rotate-1 transform hover:rotate-0 transition-all duration-100 focus:ring-2 focus:ring-orange-300 focus:ring-offset-2 shadow-lg shadow-orange-300/30"
      >
        <span class="material-icons !text-[20px]">share</span>
        <span class="">Share</span>
      </button>
      <button
        class="select-none text-[#FF6900] border-2 border-[#FF6900] rounded-xl px-4 py-2 flex items-center gap-3 bg-white hover:bg-[#fcf8f5] md:rotate-1 transform hover:rotate-0 transition-all duration-100 focus:ring-2 focus:ring-orange-300 focus:ring-offset-2 shadow-lg shadow-orange-300/30"
      >
        <span class="material-icons !text-[20px]">print</span>
        <span class="">Print</span>
      </button>
      <NuxtLink
        :to="{ path: '/recipe/new', query: { editCurrent: 'true' } }"
        class="select-none text-[#FF6900] border-2 border-[#FF6900] rounded-xl px-4 py-2 flex items-center gap-3 bg-white hover:bg-[#fcf8f5] md:rotate-1 transform hover:rotate-0 transition-all duration-100 focus:ring-2 focus:ring-orange-300 focus:ring-offset-2 shadow-lg shadow-orange-300/30"
      >
        <span class="material-icons !text-[20px]">edit</span>
        <span class="">Edit</span>
      </NuxtLink>
      <button
        class="select-none text-[#FF6900] border-2 border-[#FF6900] rounded-xl px-4 py-2 flex items-center gap-3 bg-white hover:bg-[#fcf8f5] md:rotate-1 transform hover:rotate-0 transition-all duration-100 focus:ring-2 focus:ring-orange-300 focus:ring-offset-2 shadow-lg shadow-orange-300/30"
      >
        <span class="material-icons !text-[20px]">delete</span>
        <span class="">Delete</span>
      </button>
    </template>

    <template #ingredients>
      <PagesRecipeIngredientList
        v-if="!recipeStore.isLoading && recipeStore.recipe?.ingredients"
        :ingredients="recipeStore.recipe.ingredients"
      ></PagesRecipeIngredientList>
    </template>

    <template #instructions>
      <PagesRecipeInstructionContainer
        v-if="!recipeStore.isLoading && recipeStore.recipe?.instructions"
        :instructions="recipeStore.recipe.instructions"
      ></PagesRecipeInstructionContainer>
    </template>

    <template #nutrition>
      <PagesRecipeNutriCard
        v-if="!recipeStore.isLoading"
        :recipe="recipeStore.recipe"
      />
    </template>

    <template #ai-buttons>
      <div class="flex gap-2 items-start justify-center flex-wrap">
        <button
          v-for="button in buttons"
          class="relative rounded-xl p-[3px] overflow-hidden inline-flex items-center w-max"
          @click="button.function()"
        >
          <FormsAIBorder class="rounded-xl" :spinning="button.loading" />
          <span
            class="relative flex bg-[#fffefc] rounded-[9px] w-full items-center justify-center gap-2 px-4 py-2 font-bold"
          >
            <span
              v-if="button.label === 'Chat'"
              class="material-symbols-outlined"
              >chat</span
            >
            <span v-else class="material-symbols-outlined">wand_stars</span>
            <textarea
              class="resize-none h-6 items-center focus:outline-none"
              v-if="button.label === 'User'"
              placeholder="Do this!"
              @input="autoResize($event, 10)"
            ></textarea>
            <textarea
              class="resize-none h-6 focus:outline-none"
              v-else-if="button.label === 'Chat'"
              placeholder="Ask anything"
              @input="autoResize($event, 10)"
            ></textarea>
            <span class="" v-else>{{ button.label }}</span>
          </span>
        </button>
      </div>
    </template>

    <template #comments>
      <div class="flex flex-col items-center w-full gap-2">
        <div class="h-[2px] bg-black w-3/5 mx-auto"></div>
        <h2 class="text-5xl mt-4">What others say</h2>
        <div class="">{{ recipeStore.recipe?.comments?.length }} comments</div>
        <PagesRecipeCommentSection
          v-if="!recipeStore.isLoading"
        ></PagesRecipeCommentSection>
      </div>
    </template>
  </PagesRecipeLayout>
</template>

<script setup lang="ts">
const supabase = useSupabase();
const auth = useAuthStore();
const recipeStore = useCurrentRecipeStore();

const handleMissingIngredients = () => {
  // TODO: Implement missing ingredients functionality
  console.log('Handling missing ingredients');
};

const handleAdaptDiet = () => {
  // TODO: Implement diet adaptation functionality
  console.log('Adapting to diet');
};

const handleMakeHealthier = () => {
  // TODO: Implement make healthier functionality
  console.log('Making recipe healthier');
};

const handleMakeCheaper = () => {
  // TODO: Implement make cheaper functionality
  console.log('Making recipe cheaper');
};

const handleMakeFlavorful = () => {
  // TODO: Implement make flavorful functionality
  console.log('Making recipe more flavorful');
};

const doWhatever = () => {
  // TODO: Implement make flavorful functionality
  console.log('Making recipe more flavorful');
};

const askWhatever = () => {
  // TODO: Implement make flavorful functionality
  console.log('Making recipe more flavorful');
};

const buttons = ref([
  {
    label: 'I am missing ingredients',
    function: handleMissingIngredients,
    loading: false,
  },
  { label: 'Adapt this to my Diet', function: handleAdaptDiet, loading: false },
  {
    label: 'Make this healthier',
    function: handleMakeHealthier,
    loading: false,
  },
  { label: 'Make this cheaper', function: handleMakeCheaper, loading: false },
  {
    label: 'Make this more flavorful',
    function: handleMakeFlavorful,
    loading: false,
  },
  { label: 'User', function: doWhatever, loading: false },
  { label: 'Chat', function: askWhatever, loading: false },
]);

onMounted(async () => {
  const route = useRoute();
  const recipeId = route.params.id;
  recipeStore.loadRecipe(Number(recipeId));
});
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
