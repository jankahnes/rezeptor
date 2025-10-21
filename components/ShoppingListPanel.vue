<template>
  <div
    class="flex flex-col shadow-lg bg-white text-primary sm:rounded-2xl h-full"
  >
    <div class="px-6 py-3 flex justify-between items-center">
      <h2 class="text-xl font-bold">Shopping List</h2>
      <button
        @click="$emit('close')"
        class="p-2 hover:bg-gray-100 rounded-full transition-colors"
      >
        <span class="material-symbols-outlined">close</span>
      </button>
    </div>

    <div class="h-full overflow-hidden flex flex-col">
      <div class="flex flex-col gap-8 p-4 overflow-y-auto">
        <div
          v-for="(items, aisle) in groupedByAisle"
          :key="aisle"
          class="space-y-4"
        >
          <div class="flex items-center gap-2 mb-2">
            <span class="text-xl">{{ getAisleEmoji(aisle) }}</span>
            <h3 class="text-lg font-bold">{{ aisle }}</h3>
          </div>
          <div class="h-[1px] bg-primary-100"></div>

          <ul class="flex flex-col gap-2">
            <li
              v-for="item in items"
              :key="item.ingredientId"
              class="flex items-center gap-2 p-2 bg-primary-50/20 rounded-lg transition-colors hover:bg-primary-20"
            >
              <button
                @click="removeItem(item.ingredientId)"
                class="hover:bg-primary-50 rounded-full transition-colors w-6 h-6 flex items-center justify-center flex-shrink-0"
              >
                <span class="material-symbols-outlined !text-base text-primary"
                  >close</span
                >
              </button>
              <div class="flex items-center gap-2">
                <span class="font-bold">{{
                  getStringFromAmountInfo([item.amount, item.unit], 1)
                }}</span>
                <span class="">{{ item.name }}</span>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <div class="space-y-2 py-2 px-6" v-if="contributingRecipes.length > 0">
        <p class="text-xs text-gray-500 mb-2">From recipes:</p>
        <div class="flex gap-2">
          <NuxtLink
            v-for="recipe in contributingRecipes"
            :key="recipe.id"
            :to="`/recipe/${recipe.id}`"
            class="w-12 h-12 rounded-lg overflow-hidden hover:scale-107 transition-all duration-400"
          >
            <img
              v-if="recipe.picture"
              :src="recipe.picture"
              :alt="recipe.title"
              class="w-12 h-12 object-cover rounded-lg"
            />
            <div
              v-else
              class="w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center"
            >
              <span class="material-symbols-outlined !text-base text-primary"
                >restaurant</span
              >
            </div>
          </NuxtLink>
        </div>
      </div>

      <div
        class="space-y-2 mt-2 py-4 px-6 border-t border-primary-100 border-dashed"
      >
        <div class="flex justify-between items-center">
          <span class="text-sm text-gray-500">Estimated Total:</span>
          <span class="text-lg">{{ formatMoney(estimatedTotal ?? 0) }}</span>
        </div>
        <button
          @click="clearList"
          class="w-full py-2 bg-primary-50/20 rounded-lg text-primary hover:bg-primary-50 transition-all duration-200"
        >
          Clear All
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const authStore = useAuthStore();
const supabase = useSupabaseClient();

defineEmits(['close']);

const contributingRecipes = ref<any[]>([]);

// Group items by aisle
const groupedByAisle = computed(() => {
  const groups: Record<string, ShoppingListItem[]> = {};

  for (const item of authStore.shoppingList) {
    const aisle = item.aisle || 'Other';
    if (!groups[aisle]) {
      groups[aisle] = [];
    }
    groups[aisle].push(item);
  }

  return groups;
});

// Calculate estimated total price
const estimatedTotal = computed(() => {
  return authStore.shoppingList.reduce((total, item) => {
    if (item.price) {
      const pricePerGram = item.price / 100;
      const grams = convertToGrams(item.amount, item.unit, item.density, item.unit_weight ?? 0);
      return total + pricePerGram * grams;
    }
    return total;
  }, 0);
});

// Fetch contributing recipes
watchEffect(async () => {
  const recipeIds = new Set<number>();
  for (const item of authStore.shoppingList) {
    item.recipeIds.forEach((id) => recipeIds.add(id));
  }

  if (recipeIds.size > 0) {
    const { data } = await supabase
      .from('recipes')
      .select('id, title, picture')
      .in('id', Array.from(recipeIds));

    if (data) {
      contributingRecipes.value = data;
    }
  } else {
    contributingRecipes.value = [];
  }
});

function getAisleEmoji(aisle: string): string {
  const aisleEmojis: Record<string, string> = {
    Produce: '🥬',
    Bakery: '🍞',
    Dairy: '🥛',
    Meat: '🥩',
    Seafood: '🦞',
    'Deli / Prepared Foods & Cheeses': '🍔',
    'Other Refrigerated': '🧊',
    'Condiments & Sauces': '🧂',
    'Canned Goods': '🥫',
    Spices: '🌶️',
    Baking: '🍞',
    'Pasta, Rice & Grains': '🌾',
    'Cereal & Breakfast': '🥤',
    'Candy & Snacks': '🍬',
    'Other Dry Goods & Pantry': '🍜',
    Frozen: '🥶',
    International: '🌎',
    'Special Diets/Health': '🍎',
    Beverages: '🥤',
    Other: '🛒',
  };
  return aisleEmojis[aisle] || '🛒';
}

async function removeItem(ingredientId: number) {
  await authStore.removeFromShoppingList(ingredientId);
}

async function clearList() {
  await authStore.clearShoppingList();
}
</script>
