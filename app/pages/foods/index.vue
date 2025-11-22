<template>
  <div class="sm:mx-10 mx-4 space-y-4 max-w-screen-lg m-4 p-10">
    <h1 class="text-2xl font-bold">Foods Database</h1>
    <div class="flex gap-2 w-full">
      <div
        class="flex ring-1 ring-primary focus-within:ring-2 transition-all rounded-xl px-4 items-center gap-2 text-gray-600 bg-primary-10 shrink-1 min-w-0!"
      >
        <input
          type="text"
          placeholder="Search for a food"
          v-model="foodResultsStore.searchQuery"
          @keyup.enter="search"
          class="flex-grow focus:outline-none py-2 min-w-0!"
        />
      </div>
      <button class="button p-2 flex flex-shrink-0" @click="search">
        <span class="material-symbols-outlined"> search </span>
      </button>
      <button
        class="button p-2 flex flex-shrink-0"
        @click="navigateTo('/foods/new')"
      >
        <span class="material-symbols-outlined"> add </span>
      </button>
      <button
        class="button p-2 flex flex-shrink-0"
        @click="navigateTo('/foods/scan')"
      >
        <span class="material-symbols-outlined"> flip </span>
      </button>
    </div>
    <div class="flex flex-col gap-4 w-full mb-10">
      <NuxtLink
        class="flex gap-2 w-full bg-primary-10 pl-4 py-0 rounded-lg select-none cursor-pointer items-center"
        v-for="food in foodResultsStore.foodResults"
        :to="`/foods/${food.id}`"
      >
        <div class="flex-grow">
          <h2>{{ food.name }}</h2>
        </div>
        <GradeContainer
          :score="food.food.hidx ?? 0"
          :type="'ovr'"
          class="text-xl !h-14 !w-12 rounded-r-lg"
        />
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const supabase = useSupabaseClient<Database>();
const foodResultsStore = useFoodResultsStore();

const urlSearch = route.query.search as string;
if (urlSearch) {
  foodResultsStore.searchQuery = urlSearch;
  if (!foodResultsStore.foodResults.length) {
    search();
  }
} else if (foodResultsStore.searchQuery) {
  navigateTo(
    `/foods?search=${encodeURIComponent(foodResultsStore.searchQuery)}`,
    {
      replace: true,
    }
  );
} else {
  foodResultsStore.reset();
}

async function search() {
  if (!foodResultsStore.searchQuery) {
    foodResultsStore.reset();
    navigateTo('/foods', { replace: true });
    return;
  }
  const { data, error } = (await supabase.rpc('search_foods_deduplicated', {
    query: foodResultsStore.searchQuery,
    max: 10,
  })) as unknown as { data: Food[]; error: Error | null };
  //returned data: {food: food, matched_alias: string} -> map to {...food, name: matched_alias ?? food.name}
  if (error) {
    console.error(error);
  } else {
    foodResultsStore.setFoodResults(data, foodResultsStore.searchQuery);
    navigateTo(
      `/foods?search=${encodeURIComponent(foodResultsStore.searchQuery)}`,
      {
        replace: true,
      }
    );
  }
}
</script>

<style scoped></style>
