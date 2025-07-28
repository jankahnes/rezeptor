<template>
  <div class="mt-6 mx-auto max-w-screen-xl space-y-6">
    <div v-if="!editableRecipe && !loading">
      <span>Couldn't load recipe</span>
    </div>

    <!-- Loading skeleton -->
    <div v-else-if="loading" class="space-y-10 mx-4">
      <Skeleton class="w-full h-19 shadow-sm rounded-2xl" />
      <div class="flex flex-wrap gap-10 items-start w-full">
        <Skeleton
          v-for="i in 9"
          :key="i"
          class="min-w-80 max-w-120 h-80 shadow-sm rounded-2xl flex-1"
        />
      </div>
    </div>

    <div v-else class="mx-4 flex flex-col gap-10">
      <!-- Hero Card -->
      <div class="w-full p-6 card highlight">
        <div
          class="flex flex-col lg:flex-row gap-8 items-start lg:items-center"
        >
          <div class="flex-1">
            <h1 class="text-2xl lg:text-4xl font-bold text-gray-800 mb-2">
              {{ recipeStore.recipe?.title }}
            </h1>
            <p class="text-lg text-gray-600 mb-4">Nutritional Analysis</p>

            <div class="space-y-3">
              <div
                v-for="grade of report.humanReadable.overall"
                :key="grade.description"
                class="flex gap-3 items-center"
                :class="grade.color"
              >
                <span class="material-symbols-outlined !text-2xl">{{
                  grade.icon
                }}</span>
                <div class="flex flex-col">
                  <span class="font-semibold">{{ grade.description }}</span>
                  <span class="text-xs font-light" v-if="grade.subtitle">{{
                    grade.subtitle
                  }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="flex flex-col items-center gap-4">
            <h2 class="text-xl font-bold text-gray-700 mb-2">Health Score</h2>
            <GradeContainer
              :score="editableRecipe?.hidx ?? 0"
              :type="'hidx'"
              class="font-bold text-5xl p-4 rounded-xl shadow-sm"
            />
            <div
              class="percentile-badge !py-2"
              :class="report.percentiles.hidx.color"
            >
              <span class="material-symbols-outlined text-lg">{{
                report.percentiles.hidx.icon
              }}</span>
              <span>{{ report.percentiles.hidx.description }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-10">
        <!-- Readable Summary Card: Micronutrients -->
        <div class="card p-5 space-y-4 flex flex-col">
          <div class="flex items-start justify-between mb-4">
            <div class="">
              <h3 class="text-xl font-bold text-gray-800 mb-2">
                Micronutrients
              </h3>
              <div
                class="percentile-badge"
                :class="report.percentiles.mnidx.color"
              >
                <span class="material-symbols-outlined !text-lg">
                  {{ report.percentiles.mnidx.icon }}
                </span>
                <span>{{ report.percentiles.mnidx.description }}</span>
              </div>
            </div>
            <GradeContainer
              :score="report.overall.mnidx"
              :type="'score'"
              class="rounded-lg text-2xl"
            />
          </div>
          <div
            v-for="nutrient in report.humanReadable.micronutrients"
            :key="nutrient.description"
          >
            <div class="flex gap-2" :class="nutrient.color">
              <span class="material-symbols-outlined text-2xl">{{
                nutrient.icon
              }}</span>
              <div class="flex flex-col">
                <span class="font-semibold">{{ nutrient.description }}</span>
                <span class="text-xs font-light" v-if="nutrient.subtitle">{{
                  nutrient.subtitle
                }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Readable Summary Card: Fat Profile -->
        <div class="card p-5 space-y-4 flex flex-col">
          <div class="flex items-start justify-between mb-4">
            <div class="">
              <h3 class="text-xl font-bold text-gray-800 mb-2">Fat Profile</h3>
              <div
                class="percentile-badge"
                :class="report.percentiles.fat_profile_score.color"
              >
                <span class="material-symbols-outlined !text-lg">
                  {{ report.percentiles.fat_profile_score.icon }}
                </span>
                <span>{{
                  report.percentiles.fat_profile_score.description
                }}</span>
              </div>
            </div>
            <GradeContainer
              :score="report.overall.fat_profile_score"
              :type="'score'"
              class="rounded-lg text-2xl"
            />
          </div>
          <div
            v-for="item in report.humanReadable.fatProfile"
            :key="item.description"
          >
            <div class="flex gap-2" :class="item.color">
              <span class="material-symbols-outlined text-2xl">{{
                item.icon
              }}</span>
              <span>{{ item.description }}</span>
            </div>
          </div>
        </div>

        <!-- Readable Summary Card: Processing Level -->
        <div class="card p-5 space-y-4 flex flex-col">
          <div class="flex items-start justify-between mb-4">
            <div class="">
              <h3 class="text-xl font-bold text-gray-800 mb-2">
                Processing Level
              </h3>
              <div
                class="percentile-badge"
                :class="report.percentiles.processing_level_score.color"
              >
                <span class="material-symbols-outlined !text-lg">
                  {{ report.percentiles.processing_level_score.icon }}
                </span>
                <span>{{
                  report.percentiles.processing_level_score.description
                }}</span>
              </div>
            </div>
            <GradeContainer
              :score="report.overall.processing_level_score"
              :type="'score'"
              class="rounded-lg text-2xl"
            />
          </div>
          <div
            v-for="item in report.humanReadable.processingLevel"
            :key="item.description"
          >
            <div class="flex gap-2" :class="item.color">
              <span class="material-symbols-outlined text-2xl">{{
                item.icon
              }}</span>
              <span>{{ item.description }}</span>
            </div>
          </div>
        </div>

        <!-- Readable Summary Card: Protein -->
        <div class="card p-5 space-y-4 flex flex-col">
          <div class="flex items-start justify-between mb-4">
            <div class="">
              <h3 class="text-xl font-bold text-gray-800 mb-2">Protein</h3>
              <div
                class="percentile-badge"
                :class="report.percentiles.protein_score.color"
              >
                <span class="material-symbols-outlined !text-lg">
                  {{ report.percentiles.protein_score.icon }}
                </span>
                <span>{{ report.percentiles.protein_score.description }}</span>
              </div>
            </div>
            <GradeContainer
              :score="report.overall.protein_score"
              :type="'score'"
              class="rounded-lg text-2xl"
            />
          </div>
          <div
            v-for="item in report.humanReadable.protein"
            :key="item.description"
          >
            <div class="flex gap-2" :class="item.color">
              <span class="material-symbols-outlined text-2xl">{{
                item.icon
              }}</span>
              <span>{{ item.description }}</span>
            </div>
          </div>
        </div>

        <!-- Readable Summary Card: Sugar -->
        <div class="card p-5 space-y-4 flex flex-col">
          <div class="flex items-start justify-between mb-4">
            <div class="">
              <h3 class="text-xl font-bold text-gray-800 mb-2">Sugar</h3>
              <div
                class="percentile-badge"
                :class="report.percentiles.sugar_score.color"
              >
                <span class="material-symbols-outlined !text-lg">
                  {{ report.percentiles.sugar_score.icon }}
                </span>
                <span>{{ report.percentiles.sugar_score.description }}</span>
              </div>
            </div>
            <GradeContainer
              :score="report.overall.sugar_score"
              :type="'score'"
              class="rounded-lg text-2xl"
            />
          </div>
          <div
            v-for="item in report.humanReadable.sugar"
            :key="item.description"
          >
            <div class="flex gap-2" :class="item.color">
              <span class="material-symbols-outlined text-2xl">{{
                item.icon
              }}</span>
              <span>{{ item.description }}</span>
            </div>
          </div>
        </div>

        <!-- Readable Summary Card: Salt -->
        <div class="card p-5 space-y-4 flex flex-col">
          <div class="flex items-start justify-between mb-4">
            <div class="">
              <h3 class="text-xl font-bold text-gray-800 mb-2">Salt</h3>
              <div
                class="percentile-badge"
                :class="report.percentiles.salt_score.color"
              >
                <span class="material-symbols-outlined !text-lg">
                  {{ report.percentiles.salt_score.icon }}
                </span>
                <span>{{ report.percentiles.salt_score.description }}</span>
              </div>
            </div>
            <GradeContainer
              :score="report.overall.salt_score"
              :type="'score'"
              class="rounded-lg text-2xl"
            />
          </div>
          <div
            v-for="item in report.humanReadable.salt"
            :key="item.description"
          >
            <div class="flex gap-2" :class="item.color">
              <span class="material-symbols-outlined text-2xl">{{
                item.icon
              }}</span>
              <span>{{ item.description }}</span>
            </div>
          </div>
        </div>

        <!-- Readable Summary Card: Fiber -->
        <div class="card p-5 space-y-4 flex flex-col">
          <div class="flex items-start justify-between mb-4">
            <div class="">
              <h3 class="text-xl font-bold text-gray-800 mb-2">Fiber</h3>
              <div
                class="percentile-badge"
                :class="report.percentiles.fiber_score.color"
              >
                <span class="material-symbols-outlined !text-lg">
                  {{ report.percentiles.fiber_score.icon }}
                </span>
                <span>{{ report.percentiles.fiber_score.description }}</span>
              </div>
            </div>
            <GradeContainer
              :score="report.overall.fiber_score"
              :type="'score'"
              class="rounded-lg text-2xl"
            />
          </div>
          <div
            v-for="item in report.humanReadable.fiber"
            :key="item.description"
          >
            <div class="flex gap-2" :class="item.color">
              <span class="material-symbols-outlined text-2xl">{{
                item.icon
              }}</span>
              <span>{{ item.description }}</span>
            </div>
          </div>
        </div>

        <!-- Readable Summary Card: Satiety -->
        <div class="card p-5 space-y-4 flex flex-col">
          <div class="flex items-start justify-between mb-4">
            <div class="">
              <h3 class="text-xl font-bold text-gray-800 mb-2">Satiety</h3>
              <div
                class="percentile-badge"
                :class="report.percentiles.sidx.color"
              >
                <span class="material-symbols-outlined !text-lg">
                  {{ report.percentiles.sidx.icon }}
                </span>
                <span>{{ report.percentiles.sidx.description }}</span>
              </div>
            </div>
            <GradeContainer
              :score="report.overall.satiety"
              :type="'score'"
              class="rounded-lg text-2xl"
            />
          </div>
          <div
            v-for="item in report.humanReadable.satiety"
            :key="item.description"
          >
            <div class="flex gap-2" :class="item.color">
              <span class="material-symbols-outlined text-2xl">{{
                item.icon
              }}</span>
              <span>{{ item.description }}</span>
            </div>
          </div>
        </div>

        <!-- Readable Summary Card: Protective Compounds -->
        <div class="card p-5 space-y-4 flex flex-col">
          <div class="flex items-start justify-between mb-4">
            <div class="">
              <h3 class="text-xl font-bold text-gray-800 mb-2">
                Protective Compounds
              </h3>
              <div
                class="percentile-badge"
                :class="report.percentiles.protective_score?.color"
              >
                <span class="material-symbols-outlined !text-lg">
                  {{ report.percentiles.protective_score?.icon || 'info' }}
                </span>
                <span>{{
                  report.percentiles.protective_score?.description || 'No data'
                }}</span>
              </div>
            </div>
            <GradeContainer
              :score="report.overall.protective_score"
              :type="'score'"
              class="rounded-lg text-2xl"
            />
          </div>
          <div
            v-for="item in report.humanReadable.protectiveCompounds"
            :key="item.description"
          >
            <div class="flex gap-2" :class="item.color">
              <span class="material-symbols-outlined text-2xl">{{
                item.icon
              }}</span>
              <span>{{ item.description }}</span>
            </div>
          </div>
        </div>

        <!-- Detail Card: Total Vitamins -->
        <div class="card p-5 space-y-4 flex flex-col">
          <h3 class="text-xl font-bold text-gray-800">Total Vitamins</h3>
          <p class="text-sm text-gray-600 mb-3">Per Serving:</p>
          <div class="space-y-2">
            <div
              v-for="nutrient in vitaminsShort"
              :key="nutrient.displayName"
              class="flex justify-between items-center py-1"
            >
              <span class="text-sm">{{ nutrient.displayName }}</span>
              <span class="font-semibold text-sm bg-gray-100 px-2 py-1 rounded"
                >{{ nutrient.rdaPerServing }}% RDA</span
              >
            </div>
            <button
              class="text-sm text-blue-600 hover:text-blue-800 underline mt-2"
              v-show="!micronutrientsExpanded"
              @click="micronutrientsExpanded = true"
            >
              Show {{ vitaminsRest.length }} more vitamins
            </button>
            <div
              v-for="nutrient in vitaminsRest"
              :key="nutrient.displayName"
              class="flex justify-between items-center py-1 text-gray-600"
              v-show="micronutrientsExpanded"
            >
              <span class="text-sm">{{ nutrient.displayName }}</span>
              <span class="font-medium text-sm bg-gray-50 px-2 py-1 rounded"
                >{{ nutrient.rdaPerServing }}% RDA</span
              >
            </div>
            <button
              class="text-sm text-blue-600 hover:text-blue-800 underline mt-2"
              v-show="micronutrientsExpanded"
              @click="micronutrientsExpanded = false"
            >
              Show fewer vitamins
            </button>
          </div>
        </div>

        <!-- Detail Card: Total Minerals -->
        <div class="card p-5 space-y-4 flex flex-col">
          <h3 class="text-xl font-bold text-gray-800">Total Minerals</h3>
          <p class="text-sm text-gray-600 mb-3">Per Serving:</p>
          <div class="space-y-2">
            <div
              v-for="nutrient in mineralsShort"
              :key="nutrient.displayName"
              class="flex justify-between items-center py-1"
            >
              <span class="text-sm">{{ nutrient.displayName }}</span>
              <span class="font-semibold text-sm bg-gray-100 px-2 py-1 rounded"
                >{{ nutrient.rdaPerServing }}% RDA</span
              >
            </div>
            <button
              class="text-sm text-blue-600 hover:text-blue-800 underline mt-2"
              v-show="!micronutrientsExpanded"
              @click="micronutrientsExpanded = true"
            >
              Show {{ mineralsRest.length }} more minerals
            </button>
            <div
              v-for="nutrient in mineralsRest"
              :key="nutrient.displayName"
              class="flex justify-between items-center py-1 text-gray-600"
              v-show="micronutrientsExpanded"
            >
              <span class="text-sm">{{ nutrient.displayName }}</span>
              <span class="font-medium text-sm bg-gray-50 px-2 py-1 rounded"
                >{{ nutrient.rdaPerServing }}% RDA</span
              >
            </div>
            <button
              class="text-sm text-blue-600 hover:text-blue-800 underline mt-2"
              v-show="micronutrientsExpanded"
              @click="micronutrientsExpanded = false"
            >
              Show fewer minerals
            </button>
          </div>
        </div>
      </div>
      <!---
      <div class="flex">
        <div class="card p-5 space-y-2 w-full">
          <pre>{{ JSON.stringify(report, null, 2) }}</pre>
        </div>
      </div>
      -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { VITAMINS, MINERALS } from '~/utils/constants/recipeFields';

const route = useRoute();
const id = Number(route.params.id);
const recipeStore = useRecipeStore();
const editableRecipe = ref<RecipeProcessed | null>(null);
const micronutrientsExpanded = ref(false);
const loading = ref(true);
const calculator = ref<any>(null);
const report = computed(() => calculator.value?.report);
const supabase = useSupabaseClient();

function overwrite(objA: any, objB: any) {
  for (const key in objB) {
    if (objA.hasOwnProperty(key)) {
      objA[key] = objB[key];
    }
  }
}

// Set up head early with basic info
useHead({
  title: 'Nutritional Report | Rezeptor',
});

// Load everything on client side
onMounted(async () => {
  try {
    // Load recipe data
    if (route.params.id === 'new') {
      editableRecipe.value = recipeStore.recipe;
    } else if (!recipeStore.recipe || recipeStore.recipe.id != id) {
      const data = await getRecipe(supabase, {
        eq: { id: Number(route.params.id) },
      });
      recipeStore.setRecipe(data as RecipeProcessed);
      editableRecipe.value = await recipeStore.convertToEditable();
    } else {
      editableRecipe.value = await recipeStore.convertToEditable();
    }

    // Update head with recipe title
    useHead({
      title:
        'Nutritional Report for ' + recipeStore.recipe?.title + ' | Rezeptor',
    });

    // Compute recipe calculations
    if (editableRecipe.value) {
      calculator.value = new RecipeCalculator(
        editableRecipe.value,
        false,
        true
      );
      await calculator.value.computeRecipe();
      overwrite(editableRecipe.value, calculator.value.recipeComputed);
      await fillReportPercentiles(supabase, calculator.value.report);
    }
  } catch (error) {
    console.error('Error loading recipe report:', error);
  } finally {
    loading.value = false;
  }
});

const sortedMicros = computed(() => {
  if (!calculator.value?.report?.micronutrients?.details) return [];
  return calculator.value.report.micronutrients.details.sort(
    (a: any, b: any) => b.rdaPerServing - a.rdaPerServing
  );
});

const sortedVitamins = computed(() =>
  sortedMicros.value.filter((nutrient: any) => VITAMINS.includes(nutrient.name))
);
const sortedMinerals = computed(() =>
  sortedMicros.value.filter((nutrient: any) => MINERALS.includes(nutrient.name))
);
const vitaminsShort = computed(() => sortedVitamins.value.slice(0, 5));
const vitaminsRest = computed(() => sortedVitamins.value.slice(5));
const mineralsShort = computed(() => sortedMinerals.value.slice(0, 5));
const mineralsRest = computed(() => sortedMinerals.value.slice(5));
</script>

<style scoped>
.card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  transition: box-shadow 0.3s ease;
}

.card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.card.highlight {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  background-color: #f7fafc;
}

/* Ensure grid items have consistent heights in their rows */
@media (min-width: 1024px) {
  .grid > .card {
    min-height: 280px;
  }
}

@media (min-width: 1280px) {
  .grid > .card {
    min-height: 320px;
  }
}

.percentile-badge {
  font-size: 0.825rem !important;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-radius: 0.75rem;
  padding: 0.1rem 0.5rem;
  background-color: color-mix(in srgb, currentColor 5%, white);
}
</style>
