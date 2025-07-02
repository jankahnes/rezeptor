<template>
  <div class="p-1 flex flex-col gap-6 z-10">
    <div class="relative mx-auto w-full flex justify-center">
      <HandDrawnBorder
        class="header flex items-center text-center px-10 xl:px-14 mx-auto justify-center rounded-lg p-2 overflow-visible"
        :stroke-color="'#77f77b'"
        :stroke-width="1"
        :bg-color="'#fdf5ea'"
        :roughness="1"
        :blur="0.2"
      >
        <div
          class="tape absolute -top-3 -right-12 w-8 h-4 bg-gray-200 opacity-90 transform -rotate-6"
        ></div>
        <div
          class="tape absolute -top-3 -left-12 w-8 h-4 bg-gray-200 opacity-90 transform rotate-6"
        ></div>
        <h1 class="text-2xl font-bold">Ingredients</h1>
      </HandDrawnBorder>
    </div>

    <!-- Ingredients List -->
    <div
      class="flex flex-col rounded-lg px-2 py-6 z-15 sm:border-2 border-gray-300 border-dashed"
    >
      <div class="pt-4 w-55 items-center mx-auto">
        <FormsSlidingSelector
          v-model="modelValue.servingSize"
          :choices="[0.5, 1, 2, 3, 4, 5, 6, 7, 8]"
          :expanded="false"
        />
        <p class="text-xs text-center">Servings</p>
      </div>
      <div class="space-y-3 md:px-8 sm:px-4 py-8">
        <div
          v-for="category in props.modelValue.ingredients"
          :key="category.categoryName"
          class="flex flex-col gap-2 shadow-md rounded-lg p-2 relative min-h-12"
        >
          <div
            class="flex justify-between items-center"
            v-if="category.categoryName !== 'uncategorized'"
          >
            <h3 class="py-2 font-semibold flex items-center gap-2">
              <span class="material-symbols-outlined"> topic </span>
              {{ category.categoryName }}
            </h3>
            <button
              @click="removeCategory(category)"
              class="material-symbols-outlined !text-lg cursor-pointer text-red-500 hover:text-red-700"
            >
              close
            </button>
          </div>
          <div class="relative mb-2">
            <input
              v-model="category.searchQuery"
              @input="debouncedSearchFoods(category.searchQuery, category)"
              type="text"
              placeholder="Search for ingredients..."
              class="w-full p-1 border-1 border-gray-300 border-dashed rounded-lg"
            />
            <div
              v-if="category.searchResults.length > 0 && category.searchQuery"
              class="absolute top-full left-0 right-0 bg-white border-2 border-gray-300 rounded-b z-50 max-h-60 overflow-y-auto"
            >
              <div
                v-for="food in category.searchResults"
                :key="food.id"
                @click="addIngredient(food, category)"
                class="p-2 hover:bg-gray-100 cursor-pointer border-b border-gray-200 last:border-b-0"
              >
                <div class="font-semibold">{{ food.name }}</div>
              </div>
            </div>
          </div>
          <draggable
            class="flex-1 min-h-6 flex flex-col gap-2"
            v-model="category.ingredients"
            :group="'ingredients'"
            :handle="'.drag-handle'"
            item-key="id"
            :animation="100"
          >
            <template #item="{ element: ingredient }">
              <li class="flex items-center justify-between px-1 gap-2">
                <button
                  class="flex items-center justify-center opacity-50 cursor-move drag-handle"
                >
                  <span class="material-symbols-outlined">drag_handle</span>
                </button>
                <div class="flex-1 font-semibold">{{ ingredient?.name }}</div>
                <input
                  v-model="ingredient.amount"
                  class="p-1 border border-dashed border-gray-400 rounded-xl text-center"
                  :size="
                    ingredient.amount != null
                      ? String(ingredient.amount).length
                      : 1
                  "
                  style="width: auto; min-width: 4ch; max-width: 10ch"
                  placeholder="0"
                />
                <div class="relative">
                  <FormsDropdown
                    v-model="ingredient.unit"
                    :choices="ingredient.possibleUnits"
                    :style="'border border-dashed border-gray-400 rounded-xl p-1 bg-[#fffefc]'"
                  />
                </div>
                <button @click="removeIngredient(ingredient)" class="">
                  <span class="material-symbols-outlined !text-lg">delete</span>
                </button>
              </li>
            </template>
          </draggable>
        </div>
        <div
          v-if="addingCategory"
          class="flex items-center justify-between gap-2 w-full px-4 border-1 border-gray-300 border-dashed rounded-lg"
        >
          <input
            v-model="newCategoryName"
            class="w-full focus:outline-none"
            placeholder="For the sauce..."
          />
          <button
            @click="
              addingCategory = false;
              newCategoryName = '';
            "
          >
            <span class="material-symbols-outlined !text-lg">close</span>
          </button>
          <button
            @click="
              modelValue.ingredients.push({
                categoryName: newCategoryName,
                ingredients: [],
                searchQuery: '',
                searchResults: [],
              });
              addingCategory = false;
              newCategoryName = '';
            "
          >
            <span class="material-symbols-outlined !text-lg">check</span>
          </button>
        </div>
        <button
          class="flex items-center gap-2 opacity-70 cursor-pointer select-none"
          v-else
          @click="
            addingCategory = true;
            newCategoryName = '';
          "
        >
          <span class="material-symbols-outlined !text-lg">add</span>
          <span class="text-base">Add Category</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import draggable from 'vuedraggable';

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
});
const emit = defineEmits(['update:modelValue']);

const supabase = useSupabaseClient();
const addingCategory = ref(false);
const newCategoryName = ref('');

async function searchFoods(query, category) {
  if (!query) return;
  if (query.length <= 2) return;

  const { data, error } = await supabase.rpc('search_foods', {
    search_text: query,
  });

  if (error) {
    console.error(error);
  } else {
    category.searchResults = data || [];
  }
  for (const otherCategory of props.modelValue.ingredients) {
    if (otherCategory.categoryName !== category.categoryName) {
      otherCategory.searchResults = [];
    }
  }
}

const debouncedSearchFoods = debounce(searchFoods, 1000);

function addIngredient(food, category) {
  let possibleUnits = getPossibleUnits(food.measurements);
  possibleUnits = possibleUnits.map((item) =>
    item === 'UNITS'
      ? pluralize(food.unit_name, 2).toLowerCase()
      : item.toLowerCase()
  );
  const newIngredient = {
    ...food,
    amount: null,
    unit: possibleUnits[0],
    possibleUnits: possibleUnits,
  };

  category.ingredients.push(newIngredient);

  category.searchQuery = '';
  category.searchResults = [];
}

function removeIngredient(ingredient) {
  const categoryIndex = props.modelValue.ingredients.findIndex((cat) =>
    cat.ingredients.some((ing) => ing.id === ingredient.id)
  );
  if (categoryIndex !== -1) {
    const ingredientIndex = props.modelValue.ingredients[
      categoryIndex
    ].ingredients.findIndex((ing) => ing.id === ingredient.id);
    if (ingredientIndex !== -1) {
      props.modelValue.ingredients[categoryIndex].ingredients.splice(
        ingredientIndex,
        1
      );
    }
  }
}

function removeCategory(category) {
  const uncategorized = props.modelValue.ingredients.find(
    (cat) => cat.categoryName === 'uncategorized'
  );
  if (uncategorized) {
    uncategorized.ingredients.push(...category.ingredients);
  }
  const idx = props.modelValue.ingredients.findIndex(
    (cat) => cat.categoryName === category.categoryName
  );
  if (idx !== -1) {
    props.modelValue.ingredients.splice(idx, 1);
  }
}

let handleClick;

onMounted(() => {
  handleClick = (e) => {
    const target = e.target;
    if (!target.closest('.relative')) {
      props.modelValue.ingredients.forEach((category) => {
        category.searchResults = [];
      });
    }
  };
  document.addEventListener('click', handleClick);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClick);
});
</script>

<style scoped>
.header {
  filter: drop-shadow(3px 4px 8px rgba(0, 0, 0, 0.1));
}
.tape {
  background: linear-gradient(
    45deg,
    rgb(229, 231, 235) 0%,
    rgb(209, 213, 219) 50%,
    rgb(229, 231, 235) 100%
  );
  border-radius: 1px;
  filter: drop-shadow(rgba(0, 0, 0, 0.1) 1px 1px 2px);
}
</style>
