<template>
  <div
    class="flex flex-col h-[calc(100svh_-_160px)] xm:h-[calc(100svh_-_200px)]"
  >
    <div class="w-full sm:px-12 px-2 py-5 space-y-4">
      <div class="flex items-center gap-4">
        <div
          class="flex bg-white border-2 border-black px-2 text-2xl font-extrabold shadow-[2px_2px_0_0_rgba(0,0,0,1)] select-none"
        >
          RDB
        </div>
        <h1 class="hidden sm:block text-xl font-bold">
          Foods & Products Database
        </h1>
        <h1 class="sm:hidden text-xl font-bold">Foods Database</h1>
      </div>
      <div class="flex gap-4 w-full">
        <div
          class="flex w-full border-2 gap-2 px-2 items-center shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
        >
          <span class="select-none material-symbols-outlined"> grocery </span
          ><input
            class="py-2 flex-grow focus:outline-none"
            placeholder="Search in Database"
            v-model="searchQuery"
          />
        </div>
        <button
          class="border-2 w-15 shadow-[2px_2px_0_0_rgba(0,0,0,1)] flex items-center justify-center border-black"
          :class="{ 'bg-black text-white': currentView == 2 }"
          @click="currentView == 2 ? (currentView = 0) : (currentView = 2)"
        >
          <span class="select-none material-symbols-outlined"> barcode </span>
        </button>
        <button
          class="border-2 w-15 shadow-[2px_2px_0_0_rgba(0,0,0,1)] flex items-center justify-center border-black"
          :class="{ 'bg-black text-white': currentView == 3 }"
          @click="currentView == 3 ? (currentView = 0) : (currentView = 3)"
        >
          <span class="select-none material-symbols-outlined"> add </span>
        </button>
      </div>
    </div>
    <div class="sm:mx-12 mx-2 flex-1 border-4 border-double p-3">
      <div v-if="currentView != 0" class="flex justify-between">
        <button
          class="border-2 w-10 h-10 shadow-[2px_2px_0_0_rgba(0,0,0,1)] flex items-center justify-center"
          @click="currentView = 0"
        >
          <span class="select-none material-symbols-outlined">
            arrow_back
          </span>
        </button>
        <div class="mx-auto flex items-center">
          <h2 v-if="currentView == 1" class="flex gap-2 items-center">
            <span class="select-none material-symbols-outlined"> info </span>
            <span>NutriView</span>
          </h2>
          <h2 v-else-if="currentView == 2" class="flex gap-2 items-center">
            <span class="select-none material-symbols-outlined"> flip </span>
            <span>Barcode Scanner</span>
          </h2>
          <h2 v-else-if="currentView == 3" class="flex gap-2 items-center">
            <span class="select-none material-symbols-outlined"> edit </span>
            <span>Ingredient Creator</span>
          </h2>
        </div>
      </div>
      <PagesIngredientsListView
        v-if="currentView == 0"
        :foodList="searchResults"
        :onClick="onClickFood"
      />
      <PagesIngredientsSingleView
        v-if="currentView == 1"
        :food="selectedIngredient"
      />
      <PagesIngredientsScannerView
        v-if="currentView == 2"
        :onDecode="onDecode"
      />
      <PagesIngredientsCreateView v-if="currentView == 3" />
    </div>
  </div>
</template>

<script setup lang="ts">
const currentView = ref(0);
const selectedIngredient = ref({});
const searchQuery = ref('');
const searchResults = ref([]);

function onClickFood(food: Object) {
  selectedIngredient.value = food;
  currentView.value = 1;
}

function onDecode(code: String) {
  selectedIngredient.value = { name: code };
  currentView.value = 1;
}

async function searchFoods(query) {
  if (!query) return;
  if (query.length <= 2) return;
  const supabase = useSupabase();
  const { data, error } = await supabase.rpc('search_foods', {
    search_text: query,
  });
  if (error) {
    console.error(error);
  } else {
    searchResults.value = data;
  }
}

const debouncedSearch = debounce(searchFoods, 1000);

watch(searchQuery, (newQuery) => {
  debouncedSearch(newQuery.trim());
});
</script>

<style scoped></style>
