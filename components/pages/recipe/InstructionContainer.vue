<template>
  <div
    class="h-full flex flex-col min-w-92 relative overflow-hidden rounded-xl"
    :class="{ '!bg-primary-20/80': formalizationLoading }"
  >
    <div class="p-2 md:p-6 !pb-3" v-if="!hideHeader">
      <div class="flex justify-between items-center w-full mb-2">
        <div
          class="px-4 py-1 bg-primary text-white rounded-lg"
          v-if="!hideHeader"
        >
          <h2 class="text-lg font-bold">METHOD</h2>
        </div>
        <button
          v-if="displayFormalize"
          class="button flex items-center gap-2 px-2 py-1 font-medium !bg-primary/10 text-primary text-xs will-change-transform"
          @click="formalize()"
        >
          <span class="material-symbols-outlined !text-sm">auto_awesome</span>
          <span>Analyze</span>
        </button>
      </div>
    </div>
    <div class="flex-1 px-2" v-if="instructions && instructions.length > 0">
      <div class="max-w-2xl">
        <div
          v-for="(instruction, index) in instructions"
          :key="index"
          class="flex gap-5 px-2 md:px-5 py-5 items-start"
        >
          <div
            class="min-w-9 h-9 p-1 rounded-lg flex items-center text-xl font-bold border-2 justify-center bg-primary text-white flex-shrink-0 mt-1"
          >
            {{ index + 1 }}
          </div>

          <div class="flex-1 min-w-0 relative">
            <p
              class="leading-relaxed"
              v-html="renderInstructionWithLinks(instruction)"
            ></p>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="flex-1 flex items-center justify-center p-6 pb-32">
      <div class="text-center max-w-sm">
        <div
          class="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center"
        >
          <span class="material-symbols-outlined text-2xl text-gray-400"
            >menu_book</span
          >
        </div>
        <h3 class="text-lg font-medium text-gray-700 mb-2">
          No Instructions Available
        </h3>
        <p class="text-sm text-gray-500">
          Step-by-step instructions for this recipe haven't been added yet.
        </p>
      </div>
    </div>

    <!-- Dynamic Tooltip -->
    <transition name="fade" mode="out-in">
      <Teleport to="body" v-if="activeTooltip">
        <div
          class="fixed z-50 pointer-events-none transition-all duration-200"
          :style="{
            left: activeTooltip.x + 'px',
            top: activeTooltip.y + 'px',
            transform: 'translate(-50%, -100%)',
          }"
        >
          <div
            class="bg-white text-primary px-3 py-1 rounded-lg shadow-lg text-sm font-medium text-center border border-primary-20"
          >
            {{ activeTooltip.amount }}
            <div
              class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-primary-20"
            ></div>
          </div>
        </div>
      </Teleport>
    </transition>
    <div
      class="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/70 to-transparent p-4 pointer-events-none"
      v-if="formalizationLoading"
    />
  </div>
</template>

<script setup lang="ts">
interface Props {
  instructions: string[] | null | undefined;
  hideHeader: Boolean;
  ingredients?: any[];
  servingSize?: number;
  formalizationLoading: Boolean;
  displayFormalize: Boolean;
  formalize: Function;
}

const props = defineProps<Props>();

// Tooltip state
const activeTooltip = ref<{
  amount: string;
  x: number;
  y: number;
} | null>(null);

// Function to render instructions with clickable ingredient links
function renderInstructionWithLinks(instruction: string): string {
  if (!instruction) return '';

  // Escape HTML to prevent XSS
  const escaped = instruction
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');

  // Replace [ingredient](id) with clickable spans
  return escaped.replace(
    /\[([^\]]+)\]\((\d+)\)/g,
    (match, ingredient, ingredientId) => {
      return `<span 
      class="cursor-pointer relative ingredient-link px-0.5 bg-primary-50 rounded-md hover:bg-primary-20 transition-colors duration-400" 
      data-ingredient="${ingredient}"
      data-ingredient-id="${ingredientId}"
      role="button"
      tabindex="0"
    >${ingredient}</span>`;
    }
  );
}

// Handle ingredient click
function handleIngredientClick(event: Event) {
  const target = event.target as HTMLElement;
  if (!target.classList.contains('ingredient-link')) return;

  const ingredient = target.dataset.ingredient;
  const ingredientIdStr = target.dataset.ingredientId;
  if (
    !ingredient ||
    !ingredientIdStr ||
    !props.ingredients ||
    !props.servingSize
  )
    return;

  // Find the ingredient and calculate amount
  const ingredientId = parseInt(ingredientIdStr, 10);
  const ingredientData = props.ingredients.find(
    (ing) => ing.id === ingredientId
  );
  if (!ingredientData) return;

  const calculatedAmount = getStringFromAmountInfo(
    ingredientData?.amountInfo?.[ingredientData?.currentUnit],
    props.servingSize
  );
  // Get click position
  const rect = target.getBoundingClientRect();

  // Show tooltip with just the calculated amount
  activeTooltip.value = {
    amount: calculatedAmount,
    x: rect.left + rect.width / 2,
    y: rect.top - 10,
  };

  // Auto-hide after 2 seconds
  setTimeout(() => {
    activeTooltip.value = null;
  }, 2000);
}

// Add click listener when component mounts
onMounted(() => {
  document.addEventListener('click', handleIngredientClick);
});

// Cleanup listener on unmount
onUnmounted(() => {
  document.removeEventListener('click', handleIngredientClick);
});

// Close tooltip when clicking outside
function closeTooltip() {
  activeTooltip.value = null;
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
