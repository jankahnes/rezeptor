<template>
  <div
    class="sticky top-18 xm:top-22 bg-white w-full h-[10%] sm:px-12 px-2 py-5 space-y-4 z-10"
  >
    <h1 class="hidden md:block text-2xl font-bold text-center sm:text-start">
      All Recipes
    </h1>
    <div
      class="flex justify-center sm:justify-between items-center flex-wrap gap-2"
    >
      <div class="filters flex items-center gap-2">
        <button
          @click="onSelect('tags')"
          :class="{
            '!bg-black !text-white !border-black': selectedFilter === 'tags',
          }"
          class="flex bg-white border-2 p-2 font-bold shadow-[2px_2px_0_0_rgba(0,0,0,1)] gap-1 items-center"
        >
          <span class="material-symbols-outlined"> sell </span>
          <span class="hidden lg:block">Tags</span>
        </button>
        <button
          @click="onSelect('effort')"
          :class="{
            '!bg-black !text-white !border-black': selectedFilter === 'effort',
          }"
          class="flex bg-white border-2 p-2 font-bold shadow-[2px_2px_0_0_rgba(0,0,0,1)] gap-1 items-center"
        >
          <img class="h-6 w-6" src="/hourglass.png" />
          <span class="hidden lg:block">Effort</span>
        </button>
        <button
          @click="onSelect('difficulty')"
          :class="{
            '!bg-black !text-white !border-black':
              selectedFilter === 'difficulty',
          }"
          class="flex bg-white border-2 p-2 font-bold shadow-[2px_2px_0_0_rgba(0,0,0,1)] gap-1 items-center"
        >
          <img class="h-6 w-6" src="/knife.png" />
          <span class="hidden lg:block">Difficulty</span>
        </button>
        <button
          @click="onSelect('health')"
          :class="{
            '!bg-black !text-white !border-black': selectedFilter === 'health',
          }"
          class="flex bg-white border-2 p-2 font-bold shadow-[2px_2px_0_0_rgba(0,0,0,1)] gap-1 items-center"
        >
          <img class="h-6 w-6" src="/badge-a.png" />
          <span class="hidden lg:block">Health Score</span>
        </button>
        <button
          @click="onSelect('kcal')"
          :class="{
            '!bg-black !text-white !border-black': selectedFilter === 'kcal',
          }"
          class="flex bg-white border-2 p-2 font-bold shadow-[2px_2px_0_0_rgba(0,0,0,1)] gap-1 items-center"
        >
          <span class="material-symbols-outlined"> bolt </span>
          <span class="hidden lg:block">Kcal</span>
        </button>
        <button
          @click="onSelect('cost')"
          :class="{
            '!bg-black !text-white !border-black': selectedFilter === 'cost',
          }"
          class="flex bg-white border-2 p-2 font-bold shadow-[2px_2px_0_0_rgba(0,0,0,1)] gap-1 items-center"
        >
          <span class="material-symbols-outlined"> euro </span>
          <span class="hidden lg:block">Cost (Serving)</span>
        </button>
      </div>
      <div class="flex items-center gap-4">
        <span class="hidden xl:block">Sort by:</span>
        <div class="relative inline-block min-w-45">
          <FormsDropdown
            v-model="selectedSorting"
            :choices="sorts"
            :thin="false"
          ></FormsDropdown>
        </div>
      </div>
    </div>
    <div v-if="selectedFilter">
      <div class="relative select-none py-1" v-if="selectedFilter == 'tags'">
        <!-- Fade on left -->
        <div
          v-if="canScrollLeft"
          class="absolute left-0 top-0 h-full w-30 bg-gradient-to-r from-white to-transparent pointer-events-none z-10"
        ></div>

        <!-- Fade on right -->
        <div
          v-if="canScrollRight"
          class="absolute right-0 top-0 h-full w-30 bg-gradient-to-l from-white to-transparent pointer-events-none z-10"
        ></div>

        <!-- Scroll buttons -->
        <button
          v-if="canScrollLeft"
          @click="scrollLeft"
          class="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-none shadow p-1 rounded"
        >
          <span class="material-symbols-outlined !text-base">
            arrow_back_ios
          </span>
        </button>
        <button
          v-if="canScrollRight"
          @click="scrollRight"
          class="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-none shadow p-1 rounded"
        >
          <span class="material-symbols-outlined !text-base">
            arrow_forward_ios
          </span>
        </button>

        <div
          class="flex gap-2 items-center overflow-x-auto scroll-smooth scrollbar-hide"
          ref="scrollContainer"
          @scroll="checkScroll"
        >
          <div
            class="px-3 rounded-xl border-4 border-double flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <span class="material-symbols-outlined"> psychiatry </span>
            <span class="hidden lg:block">Nutritional</span>
          </div>
          <button
            v-for="tag in sampleTags['nutritional']"
            class="px-3 h-7 rounded-xl border flex items-center justify-center gap-2 group hover:outline whitespace-nowrap"
            :key="tag"
            @click="addTag(tag)"
          >
            {{ tag }}
          </button>
          <div
            class="px-3 rounded-xl border-4 border-double flex items-center justify-center gap-2 ml-2 whitespace-nowrap"
          >
            <span class="material-symbols-outlined"> room_service </span>
            <span class="hidden lg:block">Course</span>
          </div>
          <button
            v-for="tag in sampleTags['type']"
            class="px-3 rounded-xl border flex items-center justify-center gap-2 group hover:outline whitespace-nowrap"
            :key="tag"
            @click="addTag(tag)"
          >
            {{ tag }}
          </button>
          <div
            class="px-3 rounded-xl border-4 border-double flex items-center justify-center gap-2 ml-2 whitespace-nowrap"
          >
            <span class="material-symbols-outlined"> public </span>
            <span class="hidden lg:block">Cuisine</span>
          </div>
          <button
            v-for="tag in sampleTags['cuisine']"
            class="px-3 rounded-xl border flex items-center justify-center gap-2 group hover:outline whitespace-nowrap"
            :key="tag"
            @click="addTag(tag)"
          >
            {{ tag }}
          </button>
          <div
            class="px-3 rounded-xl border-4 border-double flex items-center justify-center gap-2 ml-2 whitespace-nowrap"
          >
            <span class="material-symbols-outlined"> grain </span>
            <span class="hidden lg:block">Flavor Profile</span>
          </div>
          <button
            v-for="tag in sampleTags['flavor']"
            class="px-3 rounded-xl border flex items-center justify-center gap-2 group hover:outline whitespace-nowrap"
            :key="tag"
            @click="addTag(tag)"
          >
            {{ tag }}
          </button>
        </div>
      </div>
      <div
        class="relative select-none flex gap-2 justify-center sm:justify-start py-[3px]"
        v-if="selectedFilter == 'effort'"
      >
        <button
          v-for="(effort, index) in effortLevels"
          class="px-4 py-1 rounded-xl border flex items-center justify-center gap-2 group hover:outline whitespace-nowrap"
          :key="effort"
          @click="addTag('Effort: ' + effort)"
        >
          <img v-for="_ in index + 1" class="h-6 w-6" src="/hourglass.png" />
          <span class="hidden sm:block">{{ effort }}</span>
        </button>
      </div>
      <div
        class="relative select-none flex gap-2 justify-center sm:justify-start py-[3px]"
        v-if="selectedFilter == 'difficulty'"
      >
        <button
          v-for="(difficulty, index) in difficulties"
          class="px-4 py-1 rounded-xl border flex items-center justify-center gap-2 group hover:outline whitespace-nowrap"
          :key="difficulty"
          @click="addTag('Difficulty: ' + difficulty)"
        >
          <img v-for="_ in index + 1" class="h-6 w-6" src="/knife.png" />
          <span class="hidden sm:block">{{ difficulty }}</span>
        </button>
      </div>
      <div
        class="relative py-3 select-none ml-3 mr-5 lg:mx-3"
        v-if="selectedFilter == 'health'"
      >
        <FormsRangeSlider
          v-model="healthScoreRange"
          :min="0"
          :max="12"
          class="max-w-lg"
          :display-map="getGradeFormat"
          :update="updateGradeTag"
        />
      </div>
      <div
        class="relative py-3 select-none ml-3 mr-10 lg:mx-3"
        v-if="selectedFilter == 'kcal'"
      >
        <FormsRangeSlider
          v-model="kcalRange"
          :min="10"
          :max="2500"
          class="max-w-lg"
          :display-map="(value: number) => value"
          :update="updateKcalTag"
        />
      </div>
      <div
        class="relative py-3 select-none ml-3 mr-15 lg:mx-3"
        v-if="selectedFilter == 'cost'"
      >
        <FormsRangeSlider
          v-model="costRange"
          :min="1"
          :max="200"
          class="max-w-lg"
          :display-map="getEuroFormat"
          :update="updateCostTag"
        />
      </div>
    </div>
    <div v-if="tags.length > 0" class="flex gap-2 flex-wrap">
      <button
        v-for="(tag, index) in tags"
        class="px-3 rounded-xl border flex items-center justify-center gap-2 group"
        @click="removeTag(index)"
      >
        <span
          class="material-symbols-outlined !text-base group-hover:!font-bold"
        >
          close
        </span>
        <span>{{ tag }}</span>
      </button>
    </div>
  </div>
  <div
    class="mx-auto mt-6 sm:m-6 sm:mt-0 grid gap-6 sm:grid-cols-[repeat(auto-fit,minmax(30rem,1fr))] grid-cols-[repeat(auto-fit,minmax(20rem,1fr))]"
  >
    <div class="flex flex-col justify-center items-center">
      <RecipeCard />
      <div class="xs:hidden mt-2 w-[90%] h-[1px] bg-black"></div>
    </div>

    <div class="flex justify-center items-center"><RecipeCard /></div>
    <div class="flex justify-center items-center"><RecipeCard /></div>
    <div class="flex justify-center items-center"><RecipeCard /></div>
    <div class="flex justify-center items-center"><RecipeCard /></div>
    <div class="flex justify-center items-center"><RecipeCard /></div>
    <div class="flex justify-center items-center"><RecipeCard /></div>
    <div class="flex justify-center items-center"><RecipeCard /></div>
    <div class="flex justify-center items-center"><RecipeCard /></div>
    <div class="flex justify-center items-center"><RecipeCard /></div>
    <div class="flex justify-center items-center"><RecipeCard /></div>
  </div>
</template>

<script setup lang="ts">
const scrollContainer = ref<HTMLDivElement | null>(null);

const tags = ref([]);
const sampleTags = {
  nutritional: [
    'vegan',
    'low carb',
    'low kcal',
    'satiating',
    'high protein',
    'gluten free',
  ],
  type: ['dinner', 'dessert', 'side', 'breakfast', 'snack'],
  cuisine: ['italian', 'french', 'chinese', 'american'],
  flavor: ['sweet', 'spicy', 'hearty'],
};
const difficulties = ['Easy', 'Medium', 'Hard'];
const effortLevels = ['Quick', 'Average', 'Demanding'];
const selectedFilter = ref('');
const canScrollLeft = ref(false);
const canScrollRight = ref(false);
const healthScoreRange = ref<[number, number]>([0, 12]);
const kcalRange = ref<[number, number]>([10, 2500]);
const costRange = ref<[number, number]>([1, 200]);
const selectedSorting = ref('Popularity');
const sorts = ref([
  'Popularity',
  'Rating',
  'Cost',
  'Kcal',
  'Ingredients (#)',
  'Newest',
  'Alphabetical',
]);

function getGradeFormat(index: number): string {
  const grades = [
    'F',
    'D-',
    'D',
    'D+',
    'C-',
    'C',
    'C+',
    'B-',
    'B',
    'B+',
    'A-',
    'A',
    'A+',
  ];

  if (index < 0 || index >= grades.length) {
    throw new RangeError('Index must be between 0 and 12.');
  }
  return grades[index];
}

function getEuroFormat(num: number): string {
  if (num < 10) {
    return num * 10 + 'ct';
  } else {
    if (num % 10 != 0) {
      return num / 10 + '0€';
    }
    return num / 10 + '.00€';
  }
}

onBeforeUnmount(() => {
  scrollContainer.value?.removeEventListener('wheel', onWheel);
});

function scrollLeft() {
  scrollContainer.value?.scrollBy({ left: -300 });
}

function scrollRight() {
  scrollContainer.value?.scrollBy({ left: 300 });
}

function checkScroll() {
  const el = scrollContainer.value;
  if (!el) return;
  canScrollLeft.value = el.scrollLeft > 0;
  canScrollRight.value = el.scrollLeft + el.clientWidth < el.scrollWidth;

  el.addEventListener('wheel', onWheel, { passive: false });
}

function removeTag(index: number) {
  if (tags.value[index].startsWith('Health Score')) {
    healthScoreRange.value = [0, 12];
  } else if (tags.value[index].startsWith('Kcal')) {
    kcalRange.value = [10, 2500];
  } else if (tags.value[index].startsWith('Cost')) {
    costRange.value = [1, 200];
  }
  tags.value.splice(index, 1);
}

function addTag(tag: string) {
  if (!tags.value.includes(tag)) {
    tags.value.push(tag);
  }
}

function updateGradeTag(min: number, max: number) {
  const filtered = tags.value.filter(
    (item) => !item.startsWith('Health Score')
  );
  if (min != 0 || max != 12) {
    filtered.push(
      'Health Score: ' + getGradeFormat(min) + ' → ' + getGradeFormat(max)
    );
  }
  tags.value = filtered;
}

function updateKcalTag(min: number, max: number) {
  const filtered = tags.value.filter((item) => !item.startsWith('Kcal'));
  if (min != 10 || max != 2500) {
    filtered.push('Kcal: ' + min + ' → ' + max);
  }
  tags.value = filtered;
}

function updateCostTag(min: number, max: number) {
  const filtered = tags.value.filter((item) => !item.startsWith('Cost'));
  if (min != 10 || max != 2000) {
    filtered.push('Cost: ' + getEuroFormat(min) + ' → ' + getEuroFormat(max));
  }
  tags.value = filtered;
}

async function onSelect(button: string) {
  if (button == selectedFilter.value) {
    selectedFilter.value = '';
  } else {
    selectedFilter.value = button;
    if (button == 'tags') {
      await nextTick();
      checkScroll();
    }
  }
}

function onWheel(e: WheelEvent) {
  const el = scrollContainer.value;
  if (!el || !e.deltaY) return;
  e.preventDefault();
  el.scrollLeft += e.deltaY;
}
</script>

<style scoped></style>
