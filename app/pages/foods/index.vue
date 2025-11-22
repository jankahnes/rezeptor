<template>
  <div class="mx-auto space-y-4 max-w-screen-md m-4 px-4">
    <h1 class="text-2xl font-bold">Foods Database</h1>
    <div class="flex gap-2 w-full">
      <input
        type="text"
        class="flex-grow px-2 py-1 rounded-lg items-center outline outline-gray-100 hover:outline-gray-200 min-w-0"
        v-model="foodResultsStore.searchQuery"
        @keyup.enter="search"
        placeholder="Search for a food"
      />
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
        class="flex gap-2 w-full outline outline-gray-100 hover:outline-gray-200 pl-4 py-0 rounded-lg select-none cursor-pointer items-center"
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
