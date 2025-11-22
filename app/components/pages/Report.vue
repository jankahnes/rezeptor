<template>
  <div class="my-6 mx-auto sm:ml-20 sm:mr-10 space-y-6">
    <!-- Loading skeleton -->
    <div v-if="loading" class="space-y-10 mx-4">
      <Skeleton class="w-full h-142 shadow-sm rounded-2xl" />
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
      <div class="p-6 card overview self-center sm:px-10 w-full md:w-auto">
        <div class="flex gap-8 items-start">
          <div class="flex-1">
            <h1 class="text-2xl lg:text-4xl font-bold text-gray-800 mb-2">
              {{
                recipeComputed?.title ||
                recipeStore.recipe?.title ||
                'New Recipe'
              }}
            </h1>
            <p class="text-lg text-gray-600 mb-4">Nutritional Analysis 🔎</p>

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

          <div class="hidden md:flex flex-col items-end gap-4">
            <GradeContainer
              :score="report.overall.hidx"
              :type="'ovr'"
              class="font-bold text-5xl p-4 rounded-xl shadow-sm"
            />
            <div
              class="percentile-badge !py-2"
              v-if="report.percentiles.hidx"
              :class="report.percentiles.hidx.color"
            >
              <span class="material-symbols-outlined text-lg">{{
                report.percentiles.hidx.icon
              }}</span>
              <span>{{ report.percentiles.hidx.description }}</span>
            </div>
            <Skeleton v-else class="w-52 h-10 rounded-xl" />
          </div>
        </div>
      </div>

      <div
        class="flex md:hidden gap-4 card overview items-center justify-between pl-4"
      >
        <div class="">
          <h2 class="text-lg font-bold text-gray-800 flex-1">Overall Grade</h2>

          <div
            class="percentile-badge !py-1 px-1"
            :class="report.percentiles.hidx.color"
            v-if="report.percentiles.hidx"
          >
            <span class="material-symbols-outlined text-lg">{{
              report.percentiles.hidx.icon
            }}</span>
            <span>{{ report.percentiles.hidx.description }}</span>
          </div>
          <Skeleton v-else class="w-52 h-8 rounded-xl" />
        </div>
        <GradeContainer
          :score="report.overall.hidx"
          :type="'ovr'"
          class="font-bold text-3xl p-4 rounded-xl shadow-sm"
        />
      </div>

      <!-- Readable Summary Cards -->
      <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-10">
        <div
          class="card p-5 space-y-4 flex flex-col"
          v-for="card in readableSummaryCards"
          :key="card.title"
          :class="card.class"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="">
              <h3 class="text-xl font-bold text-gray-800 mb-2">
                {{ card.title }}
              </h3>
              <div
                class="percentile-badge"
                :class="card.percentile.color"
                v-if="card.percentile"
              >
                <span class="material-symbols-outlined !text-lg">
                  {{ card.percentile.icon }}
                </span>
                <span>{{ card.percentile.description }}</span>
              </div>
              <Skeleton v-else class="w-52 h-8 rounded-xl" />
            </div>
            <GradeContainer
              :score="card.score"
              :type="'single'"
              class="rounded-lg text-2xl"
            />
          </div>
          <div
            v-for="nutrient in card.humanReadable"
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
          <button
            class="button flex items-center gap-2 px-2 py-1 font-medium !bg-primary-20 text-primary text-xs will-change-transform self-start ml-8"
            v-if="
              card.name == 'micronutrients' &&
              report.humanReadable.micronutrients.length > 5
            "
            @click="toggleMicronutrientOverview"
          >
            {{ micronutrientOverviewExpanded ? 'Show less' : 'Show more' }}
          </button>
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
              v-show="!vitaminsExpanded"
              @click="vitaminsExpanded = true"
            >
              Show {{ vitaminsRest.length }} more vitamins
            </button>
            <div
              v-for="nutrient in vitaminsRest"
              :key="nutrient.displayName"
              class="flex justify-between items-center py-1 text-gray-600"
              v-show="vitaminsExpanded"
            >
              <span class="text-sm">{{ nutrient.displayName }}</span>
              <span class="font-medium text-sm bg-gray-50 px-2 py-1 rounded"
                >{{ nutrient.rdaPerServing }}% RDA</span
              >
            </div>
            <button
              class="text-sm text-blue-600 hover:text-blue-800 underline mt-2"
              v-show="vitaminsExpanded"
              @click="vitaminsExpanded = false"
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
              v-show="!mineralsExpanded"
              @click="mineralsExpanded = true"
            >
              Show {{ mineralsRest.length }} more minerals
            </button>
            <div
              v-for="nutrient in mineralsRest"
              :key="nutrient.displayName"
              class="flex justify-between items-center py-1 text-gray-600"
              v-show="mineralsExpanded"
            >
              <span class="text-sm">{{ nutrient.displayName }}</span>
              <span class="font-medium text-sm bg-gray-50 px-2 py-1 rounded"
                >{{ nutrient.rdaPerServing }}% RDA</span
              >
            </div>
            <button
              class="text-sm text-blue-600 hover:text-blue-800 underline mt-2"
              v-show="mineralsExpanded"
              @click="mineralsExpanded = false"
            >
              Show fewer minerals
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { VITAMINS, MINERALS } from '~/utils/constants/recipeFields';
import convertUploadableToComputable from '~~/server/utils/convertUploadableToComputable';

const props = defineProps<{
  id: string;
  isFood: boolean;
}>();

const id = isNaN(Number(props.id)) ? props.id : Number(props.id);
const recipeStore = useRecipeStore();
const vitaminsExpanded = ref(false);
const mineralsExpanded = ref(false);
const loading = ref(true);
const recipeComputed = ref<any>(null);
const supabase = useSupabaseClient();
const report = computed(() => recipeComputed.value?.report);
const readableSummaryCards = ref<any[]>([
  {
    title: '🧪 Micronutrients',
    baseRelevancy: 9,
    col: 'mnidx',
    name: 'micronutrients',
  },
  {
    title: '🥑 Fat Profile',
    baseRelevancy: 8,
    col: 'fat_profile_score',
    name: 'fatProfile',
  },
  {
    title: '🏭 Processing Level',
    baseRelevancy: 8,
    col: props.isFood ? 'nova' : 'processing_level_score',
    name: 'processingLevel',
  },
  {
    title: '💪 Protein',
    baseRelevancy: 6,
    col: 'protein_score',
    name: 'protein',
  },
  {
    title: '🍬 Sugar',
    baseRelevancy: 6,
    col: 'sugar_score',
    name: 'sugar',
  },
  {
    title: '🧂 Sodium',
    baseRelevancy: 6,
    col: 'salt_score',
    name: 'salt',
  },
  {
    title: '🌾 Fiber',
    baseRelevancy: 4,
    col: 'fiber_score',
    name: 'fiber',
  },
  {
    title: '😋 Satiety',
    baseRelevancy: 4,
    col: 'sidx',
    name: 'satiety',
  },
  {
    title: '🛡️ Protective Compounds',
    baseRelevancy: 0,
    col: 'protective_score',
    name: 'protectiveCompounds',
  },
]);

// Set up head early with basic info
useHead({
  title: 'Nutritional Report | Rezeptor',
});

const micronutrientOverviewExpanded = ref(false);

function toggleMicronutrientOverview() {
  micronutrientOverviewExpanded.value = !micronutrientOverviewExpanded.value;
  if (micronutrientOverviewExpanded.value) {
    readableSummaryCards.value.find(
      (card) => card.name == 'micronutrients'
    )!.humanReadable = report.value?.humanReadable.micronutrients;
  } else {
    readableSummaryCards.value.find(
      (card) => card.name == 'micronutrients'
    )!.humanReadable = report.value?.humanReadable.micronutrients.slice(0, 5);
  }
}

function fillReadableSummaryCards() {
  for (const card of readableSummaryCards.value) {
    const percentile = report.value?.percentiles?.[card.col];
    const humanReadable = report.value?.humanReadable[card.name];
    const score = report.value?.overall[card.col];
    const roundedGrade = getGrade(score, 'single')[0];
    const relevancy =
      card.baseRelevancy +
      gradeValues[roundedGrade as keyof typeof gradeValues] * 2;
    card.percentile = percentile;
    card.humanReadable = humanReadable;
    card.score = score;
    card.relevancy = relevancy;
    card.class = '';
  }
  if (props.isFood) {
    readableSummaryCards.value.find(
      (card) => card.name == 'processingLevel'
    ).score = report.value?.overall.processing_level_score;
  }
  readableSummaryCards.value.sort((a, b) => b.relevancy - a.relevancy);
  micronutrientOverviewExpanded.value = true;
  toggleMicronutrientOverview();
  // Set the first three cards to have the "highlight" class
  for (let i = 0; i < 3 && i < readableSummaryCards.value.length; i++) {
    readableSummaryCards.value[i].class = 'highlight';
  }
  for (let i = 3; i < 6 && i < readableSummaryCards.value.length; i++) {
    readableSummaryCards.value[i].class = 'highlight-light';
  }
}

function addPercentilesToSummaryCards() {
  for (const card of readableSummaryCards.value) {
    card.percentile = report.value?.percentiles[card.col];
  }
}

// Load everything on client side
onMounted(async () => {
  try {
    if (props.isFood) {
      // Case 1: Food
      const food = await getFoodName(supabase, {
        eq: { id: id },
      });

      // Check if report is preloaded in DB
      if (food.food.report && food.food.report.humanReadable) {
        recipeComputed.value = food.food;
      } else {
        // Calculate nutrition using endpoint
        const response = (await $fetch('/api/calculate/nutrition', {
          method: 'POST',
          body: {
            nutritionEngineArgs: {
              food: food,
              useGpt: false,
              logToReport: true,
              considerProcessing: false,
            },
          },
        })) as { nutritionComputed: InsertableRecipe; nutrition: any };
        recipeComputed.value = response.nutritionComputed;
      }

      useHead({
        title: 'Nutritional Report for ' + food.name + ' | Rezeptor',
      });
    } else if (props.id === 'new') {
      // Case 3: User is editing a new recipe - use calculate without convert
      const response = (await $fetch('/api/calculate/recipe', {
        method: 'POST',
        body: {
          nutritionEngineArgs: {
            recipe: recipeStore.editingRecipe,
            useGpt: false,
            logToReport: true,
            considerProcessing: false,
          },
        },
      })) as { recipeRow: InsertableRecipe };
      recipeComputed.value = response.recipeRow;

      useHead({
        title:
          'Nutritional Report for ' +
          recipeStore.editingRecipe?.title +
          ' | Rezeptor',
      });
    } else {
      // Case 2: Recipe with ID
      // Fetch recipe if not already in store
      if (!recipeStore.recipe || recipeStore.recipe.id != id) {
        const data = await getRecipe(supabase, {
          eq: { id: id },
        });
        recipeStore.setRecipe(data as Recipe);
      }

      // Check if report is preloaded in DB
      // @ts-ignore
      if (recipeStore.recipe?.report) {
        recipeComputed.value = recipeStore.recipe;
      } else {
        // Convert and calculate using endpoint
        const convertedRecipe = await convertUploadableToComputable(
          recipeStore.recipe!,
          supabase,
          false
        );
        const response = (await $fetch('/api/calculate/recipe', {
          method: 'POST',
          body: {
            nutritionEngineArgs: {
              recipe: convertedRecipe,
              useGpt: false,
              logToReport: true,
              considerProcessing: false,
            },
          },
        })) as { recipeRow: InsertableRecipe };
        recipeComputed.value = response.recipeRow;
      }

      useHead({
        title:
          'Nutritional Report for ' + recipeStore.recipe?.title + ' | Rezeptor',
      });
    }
  } catch (error) {
    console.error('Error loading recipe report:', error);
  } finally {
    fillReadableSummaryCards();
    loading.value = false;
    await fillReportPercentiles(supabase, report.value, props.isFood);
    addPercentilesToSummaryCards();
  }
});

const sortedMicros = computed(() => {
  if (!report.value?.micronutrients?.details) return [];
  return report.value.micronutrients.details.sort(
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
  background: var(--color-primary-5);
  border-radius: 1rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  transition: box-shadow 0.3s ease;
}

.card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.card.overview {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  background-color: var(--color-primary-20);
}

.card.highlight {
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.13), 0 1px 2px 0 rgba(0, 0, 0, 0.09);
  background-color: var(--color-primary-15);
}

.card.highlight-light {
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.11), 0 1px 2px 0 rgba(0, 0, 0, 0.07);
  background-color: var(--color-primary-10);
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
