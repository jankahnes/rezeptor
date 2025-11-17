<template>
  <!-- Header -->
  <div
    class="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-3xl sm:rounded-t-3xl"
  >
    <h2 class="text-xl font-semibold">Complete Product Info</h2>
    <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700">
      <span class="material-symbols-outlined">close</span>
    </button>
  </div>

  <!-- Content -->
  <div class="p-6 space-y-6">
    <!-- Case 1: Missing basic info -->
    <div v-if="needsBasicInfo" class="space-y-4">
      <div class="bg-blue-50 p-4 rounded-lg">
        <p class="text-sm text-blue-800">
          <span class="font-semibold">Step 1 of 2:</span> Please provide basic
          product information
        </p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Product Name <span class="text-red-500">*</span>
        </label>
        <input
          v-model="formData.product_name"
          type="text"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="e.g., Organic Whole Wheat Pasta"
          required
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Brand
        </label>
        <input
          v-model="formData.brand"
          type="text"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="e.g., Barilla (optional)"
        />
      </div>

      <button
        @click="saveBasicInfo"
        :disabled="!formData.product_name"
        class="w-full bg-primary text-white py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-dark transition-colors"
      >
        Continue to Nutrition →
      </button>
    </div>

    <!-- Case 2: Missing nutrition -->
    <div v-else-if="needsNutrition" class="space-y-4">
      <div class="bg-yellow-50 p-4 rounded-lg">
        <p class="text-sm text-yellow-800">
          <span class="font-semibold">Step 2 of 2:</span> Add nutrition
          information for this product
        </p>
      </div>

      <!-- Camera capture option -->
      <div class="space-y-2">
        <button
          @click="captureNutritionLabel"
          :disabled="isProcessingImage"
          class="w-full bg-gray-100 hover:bg-gray-200 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span
            v-if="isProcessingImage"
            class="material-symbols-outlined animate-spin"
            >progress_activity</span
          >
          <span v-else class="material-symbols-outlined">photo_camera</span>
          {{ isProcessingImage ? 'Processing...' : 'Scan Nutrition Label' }}
        </button>
        <p class="text-xs text-gray-500 text-center">
          Or enter values manually below
        </p>
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          capture="environment"
          class="hidden"
          @change="handleImageCapture"
        />
      </div>

      <!-- Manual entry fields -->
      <div class="grid grid-cols-2 gap-4">
        <div class="">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Calories (kcal)
          </label>
          <input
            v-model.number="formData.kcal"
            type="number"
            step="0.1"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="0"
            required
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Fat (g)
          </label>
          <input
            v-model.number="formData.fat"
            type="number"
            step="0.1"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="0"
            required
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Saturated Fat (g)
          </label>
          <input
            v-model.number="formData.saturated_fat"
            type="number"
            step="0.1"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="0"
            required
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Carbs (g)
          </label>
          <input
            v-model.number="formData.carbohydrates"
            type="number"
            step="0.1"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="0"
            required
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Sugar (g)
          </label>
          <input
            v-model.number="formData.sugar"
            type="number"
            step="0.1"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="0"
            required
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Fiber (g)
          </label>
          <input
            v-model.number="formData.fiber"
            type="number"
            step="0.1"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="0"
            required
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Protein (g)
          </label>
          <input
            v-model.number="formData.protein"
            type="number"
            step="0.1"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="0"
            required
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Salt (g)
          </label>
          <input
            v-model.number="formData.salt"
            type="number"
            step="0.1"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="0"
            required
          />
        </div>
      </div>

      <button
        @click="saveNutrition"
        :disabled="!isNutritionComplete"
        class="w-full bg-primary text-white py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-dark transition-colors"
      >
        Save & Match Food →
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  barcode: string;
  brandedFood?: BrandedFood | null;
  state: 'needs_basic_info' | 'needs_nutrition';
}>();

const emit = defineEmits<{
  close: [];
  saved: [brandedFood: BrandedFood];
}>();

const supabase = useSupabaseClient<Database>();

const formData = ref<Partial<BrandedFood>>({
  barcode: props.barcode,
  product_name: props.brandedFood?.product_name || '',
  brand: props.brandedFood?.brand || '',
  kcal: props.brandedFood?.kcal || null,
  protein: props.brandedFood?.protein || null,
  carbohydrates: props.brandedFood?.carbohydrates || null,
  fat: props.brandedFood?.fat || null,
  fiber: props.brandedFood?.fiber || null,
  sugar: props.brandedFood?.sugar || null,
  saturated_fat: props.brandedFood?.saturated_fat || null,
  salt: props.brandedFood?.salt || null,
});

const fileInput = ref<HTMLInputElement | null>(null);
const isProcessingImage = ref(false);

const needsBasicInfo = computed(() => props.state === 'needs_basic_info');
const needsNutrition = computed(() => props.state === 'needs_nutrition');

const isNutritionComplete = computed(() => {
  return (
    formData.value.kcal != null &&
    formData.value.protein != null &&
    formData.value.carbohydrates != null &&
    formData.value.fat != null &&
    formData.value.fiber != null &&
    formData.value.sugar != null &&
    formData.value.saturated_fat != null &&
    formData.value.salt != null
  );
});

watch(
  () => props.brandedFood,
  (newBrandedFood) => {
    if (newBrandedFood) {
      formData.value.product_name =
        newBrandedFood.product_name || formData.value.product_name;
      formData.value.brand = newBrandedFood.brand || formData.value.brand;
      formData.value.kcal = newBrandedFood.kcal ?? formData.value.kcal;
      formData.value.protein = newBrandedFood.protein ?? formData.value.protein;
      formData.value.carbohydrates =
        newBrandedFood.carbohydrates ?? formData.value.carbohydrates;
      formData.value.fat = newBrandedFood.fat ?? formData.value.fat;
      formData.value.fiber = newBrandedFood.fiber ?? formData.value.fiber;
      formData.value.sugar = newBrandedFood.sugar ?? formData.value.sugar;
      formData.value.saturated_fat =
        newBrandedFood.saturated_fat ?? formData.value.saturated_fat;
      formData.value.salt = newBrandedFood.salt ?? formData.value.salt;
    }
  }
);

async function saveBasicInfo() {
  try {
    if (!formData.value.product_name) return;

    // Upsert branded food with basic info
    const { data, error } = await supabase
      .from('branded_foods')
      .upsert({
        barcode: props.barcode,
        product_name: formData.value.product_name,
        brand: formData.value.brand || null,
      })
      .select()
      .single();

    if (error) throw error;

    // Emit the updated branded food
    emit('saved', data as BrandedFood);
  } catch (error) {
    console.error('Error saving basic info:', error);
    alert('Failed to save product info. Please try again.');
  }
}

async function saveNutrition() {
  try {
    if (!isNutritionComplete.value) return;

    // Upsert branded food with nutrition info
    const { data, error } = await supabase
      .from('branded_foods')
      .upsert({
        barcode: props.barcode,
        product_name: formData.value.product_name,
        brand: formData.value.brand || null,
        kcal: formData.value.kcal,
        protein: formData.value.protein,
        carbohydrates: formData.value.carbohydrates,
        fat: formData.value.fat,
        fiber: formData.value.fiber,
        sugar: formData.value.sugar,
        saturated_fat: formData.value.saturated_fat,
        salt: formData.value.salt,
      })
      .select()
      .single();

    if (error) throw error;

    // Emit the updated branded food
    emit('saved', data as BrandedFood);
  } catch (error) {
    console.error('Error saving nutrition:', error);
    alert('Failed to save nutrition info. Please try again.');
  }
}

function captureNutritionLabel() {
  fileInput.value?.click();
}

async function handleImageCapture(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  try {
    isProcessingImage.value = true;

    // Create FormData and append the image
    const formDataPayload = new FormData();
    formDataPayload.append('image', file);
    formDataPayload.append('barcode', props.barcode);

    // Call the nutrition extraction endpoint
    const response = (await $fetch('/api/db/update-nutrition-from-picture', {
      method: 'POST',
      body: formDataPayload,
    })) as {
      status: string;
      data: {
        kcal?: number | null;
        protein?: number | null;
        carbohydrates?: number | null;
        fat?: number | null;
        fiber?: number | null;
        sugar?: number | null;
        saturated_fat?: number | null;
        salt?: number | null;
      };
    };

    if (response.status === 'ok' && response.data) {
      // Update form data with extracted values
      formData.value.kcal = response.data.kcal ?? formData.value.kcal;
      formData.value.protein = response.data.protein ?? formData.value.protein;
      formData.value.carbohydrates =
        response.data.carbohydrates ?? formData.value.carbohydrates;
      formData.value.fat = response.data.fat ?? formData.value.fat;
      formData.value.fiber = response.data.fiber ?? formData.value.fiber;
      formData.value.sugar = response.data.sugar ?? formData.value.sugar;
      formData.value.saturated_fat =
        response.data.saturated_fat ?? formData.value.saturated_fat;
      formData.value.salt = response.data.salt ?? formData.value.salt;
      if (Object.values(response.data).every((value) => value != null)) {
        await saveNutrition();
      } else {
        alert('Not all values could be extracted. Please confirm manually.');
      }
    }
  } catch (error) {
    console.error('Error processing nutrition label:', error);
    alert('Failed to extract nutrition values. Please enter them manually.');
  } finally {
    isProcessingImage.value = false;
    // Reset file input
    if (target) target.value = '';
  }
}
</script>

<style scoped>
/* Ensure modal appears above everything */
</style>
