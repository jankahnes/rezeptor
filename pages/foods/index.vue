<template>
  <div class="mx-auto space-y-4 max-w-screen-md m-4 px-4">
    <h1 class="text-2xl font-bold">Foods Database</h1>
    <div class="flex gap-2 w-full">
      <input
        type="text"
        class="flex-grow px-2 py-1 rounded-lg items-center shadow-main hover:shadow-main-hover"
        v-model="foodResultsStore.searchQuery"
        @keyup.enter="search"
        placeholder="Search for a food"
      />
      <button class="button p-2 flex" @click="search">
        <span class="material-symbols-outlined"> search </span>
      </button>
      <button class="button p-2 flex" @click="navigateTo('/foods/new')">
        <span class="material-symbols-outlined"> add </span>
      </button>
      <button class="button p-2 flex" @click="navigateTo('/foods/scan')">
        <span class="material-symbols-outlined"> flip </span>
      </button>
    </div>
    <div class="flex flex-col gap-4 w-full mb-10">
      <div
        class="flex gap-2 w-full shadow-main hover:shadow-main-hover pl-4 py-0 rounded-lg select-none cursor-pointer items-center"
        v-for="food in foodResultsStore.foodResults"
        @click="navigateTo(`/foods/${food.id}`)"
      >
        <div class="flex-grow">
          <h2>{{ food.name }}</h2>
        </div>
        <GradeContainer
          :score="food.hidx ?? 0"
          :type="'hidx'"
          class="text-lg !h-14 rounded-r-lg"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const supabase = useSupabaseClient();
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
  const { data, error } = await supabase.rpc('search_foods', {
    search_text: foodResultsStore.searchQuery,
  });
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
