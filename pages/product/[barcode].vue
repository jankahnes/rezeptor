<template>
  <div class="mt-10 max-w-screen-lg mx-auto">
    <div class="flex justify-center px-2">
      <div class="space-y-5" v-if="product">
        <button
          @click="router.back()"
          class="button flex items-center justify-center p-2 text-2xl font-bold ml-2 md:ml-6 !bg-primary/10"
        >
          <span class="material-symbols-outlined"> arrow_back </span>
        </button>
        <div class="space-y-2">
          <p class="text-xl text-primary font-bold mx-2 md:ml-8">
            {{ product?.brand }}
          </p>
          <div
            class="mx-2 px-3 py-2 ml-2 md:ml-6 bg-main text-primary border-4 border-primary rounded-lg inline-flex"
          >
            <h1 class="text-4xl font-bold">{{ product?.product_name }}</h1>
          </div>
          <p
            v-if="hasAllNutritionFields && isMatchedToGenericFood"
            class="text-sm text-gray-500 mx-2 md:ml-8"
          >
            ↪ Complete nutritional info from {{ product?.food_name?.name }}
          </p>
        </div>
        <div class="flex justify-center gap-y-10 flex-col md:flex-row">
          <NutritionLabel :nutritionData="product && product?.kcal !== null && product?.kcal !== undefined ? product : product?.food_name?.food ?? product" class="flex-1" />
          <div
            class="flex flex-col gap-4 p2 md:p-6"
            v-if="!hasAllNutritionFields || !isMatchedToGenericFood"
          >
            <div
              class="self-start py-1 px-4 bg-primary text-white rounded-lg flex"
            >
              <h2 class="text-lg font-bold">INFO COMPLETENESS</h2>
            </div>
            <div
              v-if="!hasSomeNutritionFields"
              class="flex gap-3 items-center flex-wrap justify-between"
            >
              <span class="material-symbols-outlined !text-2xl">
                arrow_forward
              </span>
              <span class="text-lg flex-1 flex-shrink-0 text-nowrap"
                >No Nutrition Label yet</span
              >
              <div class="flex gap-2 items-center">
                <button
                  class="button px-2 py-[5px] flex gap-2 items-center !text-primary"
                >
                  <span class="material-symbols-outlined"> edit </span>
                  <span>Edit</span>
                </button>
                <button
                  class="button px-2 py-[5px] flex gap-2 items-center !text-white !bg-primary"
                >
                  <span class="material-symbols-outlined"> visibility </span>
                  <span>Scan</span>
                </button>
              </div>
            </div>
            <div
              v-else-if="!hasAllNutritionFields"
              class="flex gap-2 items-center"
            >
              <span class="material-symbols-outlined !text-2xl">
                arrow_forward
              </span>
              <span class="text-lg flex-1">Incomplete Nutrition Label</span>
              <button
                class="button px-2 py-[5px] flex gap-2 items-center !text-white !bg-primary"
              >
                <span class="material-symbols-outlined"> edit </span>
                <span>Fill in missing information</span>
              </button>
            </div>
            <div v-else class="flex gap-2 items-center opacity-60">
              <span class="material-symbols-outlined !text-2xl"> check </span>
              <span class="text-lg flex-1">Complete Nutrition Label</span>
            </div>
            <div
              v-if="!isMatchedToGenericFood"
              class="flex gap-3 items-center flex-wrap justify-between"
            >
              <span class="material-symbols-outlined !text-2xl">
                arrow_forward
              </span>
              <span class="text-lg flex-1 flex-shrink-0 text-nowrap"
                >No matched generic food yet</span
              >
              <div class="flex gap-2 items-center">
                <button
                  class="button px-2 py-[5px] flex gap-2 items-center !text-white !bg-primary"
                  @click="requestMatching()"
                  :disabled="matchingIsLoading"
                >
                  <img
                    v-if="matchingIsLoading"
                    src="/loading.png"
                    class="h-6 w-6"
                  />
                  <span v-else class="material-symbols-outlined">
                    more_up
                  </span>
                  <span>Request </span>
                </button>
              </div>
            </div>
            <div v-else class="flex gap-2 items-center opacity-60">
              <span class="material-symbols-outlined !text-2xl"> check </span>
              <span class="text-lg flex-1"
                >Matched to {{ product?.food_name?.name }}</span
              >
            </div>
          </div>
          <HealthFacts
            v-else-if="product?.food_name?.food"
            :recipe="product.food_name?.food"
            isFood
            class="flex-1"
          />
        </div>
        <p class="text-sm text-gray-500 mx-2 md:ml-8">
          Nutri Score: {{ product?.nutri_score.toUpperCase() ?? 'N/A' }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const router = useRouter();
const route = useRoute();
const barcode = route.params.barcode as string;
const product = ref<BrandedFood>();
const supabase = useSupabaseClient<Database>();

const matchingIsLoading = ref(false);

const nutritionalFields: (keyof BrandedFood)[] = [
  'kcal',
  'protein',
  'fat',
  'carbohydrates',
  'fiber',
  'sugar',
  'saturated_fat',
  'salt',
];

const { data } = await useAsyncData('brandedFood', () => {
  return getBrandedFood(supabase, barcode);
});
if (data.value) {
  product.value = data.value;
}
const requestMatching = async () => {
  matchingIsLoading.value = true;
  const response = await $fetch('/api/db/match-branded-food', {
    method: 'POST',
    body: { barcode },
  });
  matchingIsLoading.value = false;
  if (response.status === 'ok') {
    product.value = await getBrandedFood(supabase, barcode);
  } else {
    console.error('Something went wrong while requesting matching');
  }
};
const hasSomeNutritionFields = computed(
  () =>
    product.value &&
    nutritionalFields.some(
      (field) =>
        product.value![field] !== null && product.value![field] !== undefined
    )
);
const hasAllNutritionFields = computed(
  () =>
    product.value &&
    nutritionalFields.every(
      (field) =>
        product.value![field] !== null && product.value![field] !== undefined
    )
);
const isMatchedToGenericFood = computed(
  () => 
    product.value &&
    product.value?.matched_food_name_id !== null &&
    product.value?.matched_food_name_id !== undefined
);


useHead({
  title: product.value?.product_name + ' | Rezeptor',
});
</script>
