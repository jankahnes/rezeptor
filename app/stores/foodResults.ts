export const useFoodResultsStore = defineStore('foodResults', () => {
  const foodResults = ref<Food[]>([]);
  const searchQuery = ref<string>('');

  async function setFoodResults(results: Food[], search: string) {
    foodResults.value = results;
    searchQuery.value = search;
  }

  async function reset() {
    foodResults.value = defaultFoods as Food[];
    searchQuery.value = '';
  }

  return { foodResults, setFoodResults, reset, searchQuery };
});
