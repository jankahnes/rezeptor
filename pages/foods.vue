<template>
  <div class="mx-auto space-y-4 max-w-screen-lg mt-4">
    <h1 class="text-2xl font-bold">Foods Database</h1>
    <div class="flex gap-2 w-full">
      <input
        type="text"
        class="flex-grow px-2 py-1 rounded-lg items-center shadow-main hover:shadow-main-hover"
        v-model="searchQuery"
        @keyup.enter="search"
        placeholder="Search for a food"
      />
      <button class="button p-2 flex" @click="search">
        <span class="material-symbols-outlined"> search </span>
      </button>
      <button class="button p-2 flex" @click="addFood">
        <span class="material-symbols-outlined"> add </span>
      </button>
      <button class="button p-2 flex" @click="scanBarcode">
        <span class="material-symbols-outlined"> flip </span>
      </button>
    </div>
    <div class="flex flex-col gap-4 w-full">
      <div
        class="flex gap-2 w-full shadow-main hover:shadow-main-hover p-4 rounded-lg"
        v-for="food in results"
      >
        <div class="flex-grow">
          <h2>{{ food.name }}</h2>
        </div>
        <span>{{ getGrade(food.hidx ?? 0, 'hidx') }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient();
const searchQuery = ref('');
const results = ref<Food[]>([]);

async function search() {
  if (!searchQuery.value) return;
  if (searchQuery.value.length <= 2) return;
  const { data, error } = await supabase.rpc('search_foods', {
    search_text: searchQuery.value,
  });
  if (error) {
    console.error(error);
  } else {
    results.value = data;
  }
}
</script>

<style scoped></style>
