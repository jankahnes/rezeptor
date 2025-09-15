<template>
  <div class="mt-6 mx-auto max-w-screen-xl space-y-6">
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
      <div class="p-6 card overview self-center">
        <div class="flex flex-col md:flex-row gap-8 items-start">
          <div class="flex-1">
            <h1 class="text-2xl lg:text-4xl font-bold text-gray-800 mb-2">
              {{
                calculator.recipeComputed?.title ||
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

          <div class="flex flex-col items-start md:items-end gap-4">
            <GradeContainer
              :score="report.overall.hidx"
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
              <div class="percentile-badge" :class="card.percentile.color">
                <span class="material-symbols-outlined !text-lg">
                  {{ card.percentile.icon }}
                </span>
                <span>{{ card.percentile.description }}</span>
              </div>
            </div>
            <GradeContainer
              :score="card.score"
              :type="'score'"
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
      <!--
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

const props = defineProps<{
  id: number;
  isFood: boolean;
}>();

const recipeStore = useRecipeStore();
const editableRecipe = ref<RecipeProcessed | null>(null);
const micronutrientsExpanded = ref(false);
const loading = ref(true);
const calculator = ref<any>(null);
const report = computed(() => calculator.value?.report);
const supabase = useSupabaseClient();
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
    const percentile = report.value?.percentiles[card.col];
    const humanReadable = report.value?.humanReadable[card.name];
    const score = report.value?.overall[card.col];
    const roundedGrade = getGrade(score, 'score')[0];
    const relevancy =
      card.baseRelevancy +
      gradeValues[roundedGrade as keyof typeof gradeValues] * 2;
    if (percentile) {
      card.percentile = percentile;
      card.humanReadable = humanReadable;
      card.score = score;
      card.relevancy = relevancy;
      card.class = '';
    }
    readableSummaryCards.value.sort((a, b) => b.relevancy - a.relevancy);
  }
  if (props.isFood) {
    readableSummaryCards.value.find(
      (card) => card.name == 'processingLevel'
    ).score = report.value?.processingLevel.final_score;
  }
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

// Load everything on client side
onMounted(async () => {
  try {
    if (props.isFood) {
      const data = await getFoodName(supabase, {
        eq: { id: Number(props.id) },
      });
      calculator.value = new RecipeCalculator(data, false, true, true, false);
      useHead({
        title: 'Nutritional Report for ' + data.name + ' | Rezeptor',
      });
      const scores = await calculator.value.getScoring();
      Object.assign(calculator.value.recipeComputed, scores);
      await calculator.value.generateReport();
      await fillReportPercentiles(supabase, calculator.value.report, true);
      fillReadableSummaryCards();
    } else {
      if (props.id === 'new') {
        editableRecipe.value = recipeStore.recipe;
      } else if (!recipeStore.recipe || recipeStore.recipe.id != props.id) {
        const data = await getRecipe(supabase, {
          eq: { id: Number(props.id) },
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
          true,
          props.isFood,
          false
        );
        await calculator.value.computeRecipe();
        overwrite(editableRecipe.value, calculator.value.recipeComputed);
        await fillReportPercentiles(supabase, calculator.value.report, false);
        fillReadableSummaryCards();
      }
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

.card.overview {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  background-color: #f7fafc;
}

.card.highlight {
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.13), 0 1px 2px 0 rgba(0, 0, 0, 0.09);
  background-color: #fafbfc;
}

.card.highlight-light {
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.11), 0 1px 2px 0 rgba(0, 0, 0, 0.07);
  background-color: #fcfcfc;
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
