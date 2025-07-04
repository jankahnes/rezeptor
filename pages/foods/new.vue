<template>
  <div class="mx-auto max-w-screen-md p-6">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Create New Food</h1>
      <p class="text-gray-600 mt-2">Contribute to the database</p>
    </div>

    <div class="bg-white rounded-2xl shadow-main p-8 space-y-8">
      <div class="space-y-6">
        <div class="flex flex-col sm:flex-row gap-4 items-end">
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Food Name
            </label>
            <div class="relative">
              <span
                class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 material-symbols-outlined"
              >
                restaurant
              </span>
              <input
                v-model="food.name"
                type="text"
                placeholder="Enter food name..."
                class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>
          </div>
          <button
            @click="autocomplete()"
            :disabled="!food.name || loading"
            class="relative px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ai-gradient"
          >
            <span class="material-symbols-outlined">auto_awesome</span>
            AI Fill
          </button>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Food Type
          </label>
          <FormsChoiceSlider v-model="type" :choices="choices" />
        </div>

        <div v-if="type === 'Branded'" class="space-y-4">
          <div class="flex gap-3">
            <button
              class="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span class="material-symbols-outlined">qr_code</span>
              <span>Add Barcode</span>
            </button>
            <input
              v-model="brandName"
              type="text"
              placeholder="Brand name"
              class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div class="space-y-6">
        <h2 class="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <span class="material-symbols-outlined">nutrition</span>
          Nutritional Information
          <span class="text-sm font-normal text-gray-500">(per 100g)</span>
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700"
              >Calories (kcal)</label
            >
            <input
              v-model="food.kcal"
              type="number"
              step="0.1"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700"
              >Carbohydrates (g)</label
            >
            <input
              v-model="food.carbohydrates"
              type="number"
              step="0.1"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700"
              >Protein (g)</label
            >
            <input
              v-model="food.protein"
              type="number"
              step="0.1"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700"
              >Fat (g)</label
            >
            <input
              v-model="food.fat"
              type="number"
              step="0.1"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700"
              >Saturated Fat (g)</label
            >
            <input
              v-model="food.saturated_fat"
              type="number"
              step="0.1"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700"
              >Sugar (g)</label
            >
            <input
              v-model="food.sugar"
              type="number"
              step="0.1"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700"
              >Fiber (g)</label
            >
            <input
              v-model="food.fiber"
              type="number"
              step="0.1"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700"
              >Salt (g)</label
            >
            <input
              v-model="food.salt"
              type="number"
              step="0.1"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div class="space-y-6">
        <h2 class="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <span class="material-symbols-outlined">euro</span>
          Pricing
        </h2>

        <div class="flex flex-wrap gap-4 items-end">
          <div class="flex-1 min-w-32">
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >Price (€)</label
            >
            <input
              v-model="priceValue"
              type="number"
              step="0.01"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div class="flex-1 min-w-32">
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >Amount</label
            >
            <input
              v-model="priceAmount"
              type="number"
              step="0.1"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div class="min-w-24 relative">
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >Unit</label
            >
            <FormsDropdown
              v-model="priceSelectedUnit"
              :choices="units"
              class="w-full"
            />
          </div>
        </div>
      </div>

      <div class="space-y-6">
        <h2 class="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <span class="material-symbols-outlined">eco</span>
          Dietary Properties
        </h2>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <label class="flex items-center gap-3 cursor-pointer">
            <input
              v-model="food.vegan"
              type="checkbox"
              class="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <span class="text-sm font-medium text-gray-700">Vegan</span>
          </label>

          <label class="flex items-center gap-3 cursor-pointer">
            <input
              v-model="food.vegetarian"
              type="checkbox"
              class="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <span class="text-sm font-medium text-gray-700">Vegetarian</span>
          </label>

          <label class="flex items-center gap-3 cursor-pointer">
            <input
              v-model="food.gluten_free"
              type="checkbox"
              class="w-5 h-5 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
            />
            <span class="text-sm font-medium text-gray-700">Gluten-Free</span>
          </label>
        </div>
      </div>

      <div class="space-y-6 relative">
        <h2 class="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <span class="material-symbols-outlined">straighten</span>
          Measurement Units
          <span
            class="material-symbols-outlined text-gray-400 text-lg cursor-help"
            title="Select how this food can be measured"
          >
            info
          </span>
        </h2>

        <FormsMultiChoiceDropdown
          v-model="food.measurements"
          :choices="unitClasses"
          class="max-w-md"
        />
      </div>

      <div class="flex justify-center pt-6">
        <button
          @click="submit"
          :disabled="!canSubmit"
          class="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium transition-all hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-lg"
        >
          <span class="material-symbols-outlined">add</span>
          Create Food
        </button>
      </div>
    </div>

    <div
      v-if="showSuccess"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-2xl p-8 max-w-md mx-4 text-center">
        <div
          class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <span class="material-symbols-outlined text-green-600 text-2xl"
            >check_circle</span
          >
        </div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">Food Created!</h3>
        <p class="text-gray-600">
          Your food has been successfully added to the database.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { startLoading, stopLoading } = useLoadingStore();

interface Food {
  name: string;
  kcal: number | null;
  protein: number | null;
  carbohydrates: number | null;
  salt: number | null;
  fiber: number | null;
  saturated_fat: number | null;
  fat: number | null;
  sugar: number | null;
  vegan: boolean;
  vegetarian: boolean;
  gluten_free: boolean;
  measurements: string[];
  price: number | null;
  density: number | null;
  unit_weight: number | null;
}

const emptyFood: Food = {
  name: '',
  kcal: null,
  protein: null,
  carbohydrates: null,
  salt: null,
  fiber: null,
  saturated_fat: null,
  fat: null,
  sugar: null,
  vegan: false,
  vegetarian: false,
  gluten_free: false,
  measurements: ['Weight'],
  price: null,
  density: null,
  unit_weight: null,
};

const food = ref<Food>(structuredClone(emptyFood));
const brandName = ref('');
const type = ref('Generic');
const loading = ref(false);
const showSuccess = ref(false);

const choices: [string, string][] = [
  ['Generic', 'grocery'],
  ['Branded', 'storefront'],
];

const units = ['g', 'pcs', 'kg', 'l', 'ml'];
const unitClasses = ['Weight', 'Volume', 'Pieces'];

const priceValue = ref<number | null>(null);
const priceAmount = ref<number | null>(null);
const priceSelectedUnit = ref('g');

const canSubmit = computed(() => {
  return (
    food.value.name &&
    food.value.kcal !== null &&
    food.value.protein !== null &&
    food.value.carbohydrates !== null &&
    food.value.fat !== null &&
    food.value.saturated_fat !== null &&
    food.value.sugar !== null &&
    food.value.fiber !== null &&
    food.value.salt !== null &&
    food.value.measurements.length > 0 &&
    priceValue.value !== null &&
    priceAmount.value !== null
  );
});

async function autocomplete() {
  if (!food.value.name) return;

  loading.value = true;
  startLoading();

  try {
    const gptResponse = await gptIngredientAutocomplete(food.value.name);

    for (const key in gptResponse) {
      const typedKey = key as keyof Food;
      if (
        food.value[typedKey] === null ||
        food.value[typedKey] === '' ||
        (Array.isArray(food.value[typedKey]) &&
          food.value[typedKey].length === 0) ||
        food.value[typedKey] === false
      ) {
        (food.value as any)[typedKey] = gptResponse[key];
      }
    }

    if (gptResponse.price) {
      priceValue.value = gptResponse.price;
      priceAmount.value = 100;
      priceSelectedUnit.value = 'g';
    }
  } catch (error) {
    console.error('Autocomplete failed:', error);
  } finally {
    loading.value = false;
    stopLoading();
  }
}

async function submit() {
  if (!canSubmit.value) return;

  startLoading();

  try {
    const hiddenAttrsResponse = await gptGetHiddenAttrs(food.value.name);
    for (const key in hiddenAttrsResponse) {
      const typedKey = key as keyof Food;
      (food.value as any)[typedKey] = hiddenAttrsResponse[key];
    }

    food.value.price = getPricePer100(
      {
        density: food.value.density ?? undefined,
        unit_weight: food.value.unit_weight ?? undefined,
      },
      priceValue.value!,
      priceAmount.value!,
      priceSelectedUnit.value
    );

    food.value.measurements = food.value.measurements.map((str: string) =>
      str.toLowerCase()
    );

    const supabase = useSupabaseClient();
    const { error } = await supabase.from('foods').insert(food.value as any);

    if (error) {
      console.error('Upload failed:', error);
      throw error;
    }

    showSuccess.value = true;

    setTimeout(() => {
      showSuccess.value = false;
      food.value = structuredClone(emptyFood);
      brandName.value = '';
      priceValue.value = null;
      priceAmount.value = null;
      priceSelectedUnit.value = 'g';
      type.value = 'Generic';
    }, 2000);
  } catch (error) {
    console.error('Submit failed:', error);
  } finally {
    stopLoading();
  }
}
</script>

<style scoped>
input:focus,
select:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

* {
  transition: all 0.2s ease;
}
</style>
