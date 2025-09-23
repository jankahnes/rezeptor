<template>
  <div class="mt-10 max-w-screen-lg mx-auto">
    <div class="flex justify-center px-2">
      <div class="space-y-5">
        <button
          @click="router.back()"
          class="button flex items-center justify-center p-2 text-2xl font-bold ml-2 md:ml-6 !bg-primary/10"
        >
          <span class="material-symbols-outlined"> arrow_back </span>
        </button>
        <div class="space-y-2">
          <div
            class="mx-2 px-3 py-2 ml-2 md:ml-6 bg-main text-primary border-4 border-primary rounded-lg inline-flex"
          >
            <h1 class="text-4xl font-bold">{{ foodName }}</h1>
          </div>
          <p v-if="refencingName" class="text-sm text-gray-500 mx-2 md:ml-6">
            ↪ Inherited from {{ refencingName }}
          </p>
        </div>
        <div class="flex justify-center gap-y-10 flex-col md:flex-row">
          <NutritionLabel :recipe="food" class="flex-1" />
          <HealthFacts :recipe="food" isFood class="flex-1" />
        </div>

        <p
          class="text-sm mx-auto select-none cursor-pointer flex items-center justify-center"
          @click="expanded = !expanded"
        >
          <span>ADVANCED</span>

          <span class="material-symbols-outlined"> keyboard_arrow_down </span>
        </p>
        <transition name="swish-fade">
          <section v-if="expanded" class="max-w-200 space-y-4 mx-auto mb-10">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <!-- Physical Properties -->
              <div class="space-y-2">
                <h3 class="font-semibold text-lg border-b border-gray-300 pb-1">
                  Physical Properties
                </h3>
                <div v-if="food?.density" class="flex justify-between">
                  <span>Density</span>
                  <span>{{ food.density.toFixed(2) }} g/ml</span>
                </div>
              </div>

              <!-- Dietary Information -->
              <div class="space-y-2">
                <h3 class="font-semibold text-lg border-b border-gray-300 pb-1">
                  Dietary Information
                </h3>
                <div v-if="food?.vegan !== null" class="flex justify-between">
                  <span>Vegan</span>
                  <span
                    class="font-semibold"
                    :class="food?.vegan ? 'text-green-600' : 'text-red-600'"
                  >
                    {{ food?.vegan ? 'Yes' : 'No' }}
                  </span>
                </div>
                <div
                  v-if="food?.vegetarian !== null"
                  class="flex justify-between"
                >
                  <span>Vegetarian</span>
                  <span
                    class="font-semibold"
                    :class="
                      food?.vegetarian ? 'text-green-600' : 'text-red-600'
                    "
                  >
                    {{ food?.vegetarian ? 'Yes' : 'No' }}
                  </span>
                </div>
                <div
                  v-if="food?.gluten_free !== null"
                  class="flex justify-between"
                >
                  <span>Gluten Free</span>
                  <span
                    class="font-semibold"
                    :class="
                      food?.gluten_free ? 'text-green-600' : 'text-red-600'
                    "
                  >
                    {{ food?.gluten_free ? 'Yes' : 'No' }}
                  </span>
                </div>
                <div v-if="food?.price" class="flex justify-between">
                  <span>Estimated price per 100g</span>
                  <span>€{{ food.price.toFixed(2) }}</span>
                </div>
              </div>

              <!-- Minerals -->
              <div class="space-y-2">
                <h3 class="font-semibold text-lg border-b border-gray-300 pb-1">
                  Minerals
                </h3>
                <div class="flex justify-between">
                  <span>Iron</span>
                  <span>{{ food.iron_mg?.toFixed(1) ?? '0' }} mg</span>
                </div>
                <div class="flex justify-between">
                  <span>Magnesium</span>
                  <span>{{ food.magnesium_mg?.toFixed(1) ?? '0' }} mg</span>
                </div>
                <div class="flex justify-between">
                  <span>Zinc</span>
                  <span>{{ food.zinc_mg?.toFixed(1) ?? '0' }} mg</span>
                </div>
                <div class="flex justify-between">
                  <span>Calcium</span>
                  <span>{{ food.calcium_mg?.toFixed(1) ?? '0' }} mg</span>
                </div>
                <div class="flex justify-between">
                  <span>Potassium</span>
                  <span>{{ food.potassium_mg?.toFixed(1) ?? '0' }} mg</span>
                </div>
                <div class="flex justify-between">
                  <span>Selenium</span>
                  <span>{{ food.selenium_ug?.toFixed(1) ?? '0' }} µg</span>
                </div>
                <div class="flex justify-between">
                  <span>Iodine</span>
                  <span>{{ food.iodine_ug?.toFixed(1) ?? '0' }} µg</span>
                </div>
                <div class="flex justify-between">
                  <span>Copper</span>
                  <span>{{ food.copper_mg?.toFixed(1) ?? '0' }} mg</span>
                </div>
                <div class="flex justify-between">
                  <span>Manganese</span>
                  <span>{{ food.manganese_mg?.toFixed(1) ?? '0' }} mg</span>
                </div>
              </div>

              <!-- Vitamins -->
              <div class="space-y-2">
                <h3 class="font-semibold text-lg border-b border-gray-300 pb-1">
                  Vitamins
                </h3>
                <div class="flex justify-between">
                  <span>Vitamin A</span>
                  <span
                    >{{ food.vitamin_a_ug_rae?.toFixed(1) ?? '0' }} µg RAE</span
                  >
                </div>
                <div class="flex justify-between">
                  <span>Vitamin C</span>
                  <span>{{ food.vitamin_c_mg?.toFixed(1) ?? '0' }} mg</span>
                </div>
                <div class="flex justify-between">
                  <span>Vitamin D</span>
                  <span>{{ food.vitamin_d_ug?.toFixed(1) ?? '0' }} µg</span>
                </div>
                <div class="flex justify-between">
                  <span>Vitamin E</span>
                  <span
                    >{{ food.vitamin_e_mg_alpha_te?.toFixed(1) ?? '0' }} mg
                    α-TE</span
                  >
                </div>
                <div class="flex justify-between">
                  <span>Vitamin K</span>
                  <span>{{ food.vitamin_k_ug?.toFixed(1) ?? '0' }} µg</span>
                </div>
                <div class="flex justify-between">
                  <span>Thiamine (B1)</span>
                  <span>{{ food.thiamine_b1_mg?.toFixed(2) ?? '0' }} mg</span>
                </div>
                <div class="flex justify-between">
                  <span>Riboflavin (B2)</span>
                  <span>{{ food.riboflavin_b2_mg?.toFixed(2) ?? '0' }} mg</span>
                </div>
                <div class="flex justify-between">
                  <span>Niacin (B3)</span>
                  <span>{{ food.niacin_b3_mg?.toFixed(1) ?? '0' }} mg</span>
                </div>
                <div class="flex justify-between">
                  <span>Vitamin B6</span>
                  <span>{{ food.vitamin_b6_mg?.toFixed(2) ?? '0' }} mg</span>
                </div>
                <div class="flex justify-between">
                  <span>Folate</span>
                  <span
                    >{{ food.folate_ug_dfe?.toFixed(1) ?? '0' }} µg DFE</span
                  >
                </div>
                <div class="flex justify-between">
                  <span>Vitamin B12</span>
                  <span>{{ food.vitamin_b12_ug?.toFixed(2) ?? '0' }} µg</span>
                </div>
              </div>

              <!-- Fats & Other Nutrients -->
              <div class="space-y-2">
                <h3 class="font-semibold text-lg border-b border-gray-300 pb-1">
                  Fats & Other Nutrients
                </h3>
                <div class="flex justify-between">
                  <span>Trans Fats</span>
                  <span>{{ food.trans_fats_mg?.toFixed(1) ?? '0' }} mg</span>
                </div>
                <div class="flex justify-between">
                  <span>Monounsaturated Fats</span>
                  <span>{{ food.mufas_total_mg?.toFixed(1) ?? '0' }} mg</span>
                </div>
                <div class="flex justify-between">
                  <span>Polyphenols</span>
                  <span
                    >{{ food.polyphenols_total_mg?.toFixed(1) ?? '0' }} mg</span
                  >
                </div>
                <div class="flex justify-between">
                  <span>Choline</span>
                  <span>{{ food.choline_mg?.toFixed(1) ?? '0' }} mg</span>
                </div>
                <div class="flex justify-between">
                  <span>Omega-6</span>
                  <span>{{ food.omega6_total_mg?.toFixed(1) ?? '0' }} mg</span>
                </div>
                <div class="flex justify-between">
                  <span>Omega-3</span>
                  <span>{{ food.omega3_total_mg?.toFixed(1) ?? '0' }} mg</span>
                </div>
              </div>
            </div>
          </section>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const router = useRouter();
const route = useRoute();
const id = route.params.id as string;
const food = ref<Food>();
const expanded = ref(false);
const foodName = ref('');
const refencingName = ref<string | null>(null);

if (id.startsWith('barcode-')) {
  const barcode = id.split('-')[1];
  food.value = {
    name: `TBI ${barcode}`,
    id: 0,
    created_at: new Date().toISOString(),
    kcal: null,
    protein: null,
    carbohydrates: null,
    fat: null,
    saturated_fat: null,
    sugar: null,
    fiber: null,
    salt: null,
    price: null,
    density: null,
    unit_weight: null,
    unit_name: null,
    measurements: [],
    vegan: null,
    vegetarian: null,
    gluten_free: null,
    processing_level: null,
    hidx: null,
    sidx: null,
    mnidx: null,
    ed: null,
    fat_profile_score: null,
    fiber_score: null,
    protein_score: null,
    salt_score: null,
    sugar_score: null,
    iron_mg: null,
    magnesium_mg: null,
    zinc_mg: null,
    calcium_mg: null,
    potassium_mg: null,
    selenium_ug: null,
    iodine_ug: null,
    copper_mg: null,
    manganese_mg: null,
    vitamin_a_ug_rae: null,
    vitamin_c_mg: null,
    vitamin_d_ug: null,
    vitamin_e_mg_alpha_te: null,
    vitamin_k_ug: null,
    thiamine_b1_mg: null,
    riboflavin_b2_mg: null,
    niacin_b3_mg: null,
    vitamin_b6_mg: null,
    folate_ug_dfe: null,
    vitamin_b12_ug: null,
    trans_fats_mg: null,
    mufas_total_mg: null,
    polyphenols_total_mg: null,
    choline_mg: null,
    omega6_total_mg: null,
    omega3_total_mg: null,
  };
} else {
  const { data } = await useFoodName({ eq: { id: Number(id) } });
  foodName.value = data.value?.name ?? data.value?.food?.primary_name ?? '';
  if (!data.value?.is_primary) {
    refencingName.value = data.value?.food?.primary_name ?? '';
  }
  food.value = data.value?.food as Food;
  food.value.processing_level_score = 100 - 17 * food.value.processing_level;
}

useHead({
  title: foodName.value + ' | Rezeptor',
});
</script>
