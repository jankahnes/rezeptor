<template>
  <div class="w-full flex flex-col gap-2">
    <!-- Scanner Modal -->
    <Teleport to="body">
      <BarcodeScanner
        v-if="showScanner"
        @detected="handleBarcodeDetected"
        @close="showScanner = false"
      />
    </Teleport>

    <!-- Branded Food Completion Modal: Desktop -->
    <BlocksModal v-model="showCompletionModal" responsive>
      <BrandedFoodCompletionModal
        :barcode="currentBarcode"
        :branded-food="modelValue.brandedFood"
        :state="completionModalState"
        @close="showCompletionModal = false"
        @saved="handleBrandedFoodSaved"
      />
    </BlocksModal>

    <!-- Branded Food Completion Modal: Mobile -->
    <BlocksBottomSheet v-model="showCompletionModal" class="md:hidden">
      <BrandedFoodCompletionModal
        :barcode="currentBarcode"
        :branded-food="modelValue.brandedFood"
        :state="completionModalState"
        @close="showCompletionModal = false"
        @saved="handleBrandedFoodSaved"
      />
    </BlocksBottomSheet>

    <!-- Text Selection Popup for Request -->
    <Teleport to="body">
      <Transition name="popup">
        <div
          v-if="showRequestPopup && selectedText"
          :style="{
            position: 'fixed',
            top: `${popupPosition.y}px`,
            left: `${popupPosition.x}px`,
            transform: 'translate(-50%, -100%)',
            zIndex: 9999,
          }"
          class="mb-2"
        >
          <button
            @mousedown.prevent
            @click="handleRequestFood(selectedText)"
            class="bg-primary-50 text-primary px-2 rounded-xl shadow-lg hover:bg-primary-dark transition-all duration-150 flex items-center gap-2 font-medium text-xs whitespace-nowrap animate-scale-in"
          >
            <span class="material-symbols-outlined text-base!"
              >database_search</span
            >
            Request "{{ capitalize(selectedText.slice(0, 20))
            }}{{ selectedText.length > 20 ? '...' : '' }}"
          </button>
        </div>
      </Transition>
    </Teleport>

    <div
      v-show="isEditing"
      class="relative flex items-center gap-2 rounded-md p-2 border border-gray-300 focus:border-gray-300 transition-colors"
    >
      <input
        ref="inputRef"
        v-model="modelValue.rawText"
        @blur="handleLeave()"
        @input="handleInput"
        @keydown.enter="handleEnter"
        @select="handleTextSelection"
        @mouseup="handleTextSelection"
        class="flex-1 focus:outline-none"
        :placeholder="placeholder"
      />
      <!--
      <button
        @mousedown.prevent
        @click="handleBarcodeDetected('5056329505493')"
      >
        <span>test</span>
      </button>
      -->
      <button
        @mousedown.prevent
        @click="showScanner = true"
        class="text-gray-500 hover:text-gray-700 transition-colors flex items-center justify-center"
        type="button"
      >
        <span class="material-symbols-outlined">barcode_scanner</span>
      </button>
    </div>

    <!-- Parsed preview while editing -->
    <div
      v-if="isEditing && modelValue.parsed && modelValue.parsed.length > 0"
      class="px-3 py-1 bg-gray-50 rounded-md text-sm space-x-1"
    >
      <span
        v-for="(part, partIndex) in modelValue.parsed"
        :key="partIndex"
        :class="part.styling"
      >
        {{ part.text }}
      </span>
    </div>

    <!-- Parsed preview (not editing) -->
    <div
      v-if="!isEditing"
      class="rounded-md p-2 border border-transparent hover:border-blue-300 transition-colors flex gap-1 justify-between"
      :class="{
        'cursor-pointer': !isLocked,
        'border-gray-300!': !modelValue.parsed.length,
      }"
      @click="isLocked ? null : handlePreviewClick()"
    >
      <span v-if="!modelValue.parsed.length" class="text-gray-500">{{
        placeholder
      }}</span>
      <div class="space-x-1">
        <span
          v-for="(part, partIndex) in modelValue.parsed"
          :key="partIndex"
          :class="[
            part.styling,
            {
              'cursor-pointer': part.type === 'product' && needsUserAction,
            },
          ]"
          @click.stop="
            part.type === 'product'
              ? handleProductPartClick()
              : handlePreviewClick(part.text)
          "
        >
          <!-- Visual indicator for product state -->
          <span
            v-if="
              part.type === 'product' &&
              modelValue.brandedFoodState &&
              modelValue.brandedFoodState !== 'complete'
            "
            class="mr-1"
          >
            <span
              v-if="
                modelValue.brandedFoodState === 'needs_basic_info' ||
                modelValue.brandedFoodState === 'needs_nutrition'
              "
              class="animate-pulse"
              title="Click to complete product info"
            >
              ⚠️
            </span>
            <img
              v-else-if="modelValue.brandedFoodState === 'matching'"
              title="Matching to generic food..."
              src="/loading.png"
              class="w-4 h-4 inline-block"
            />
            <span
              v-else-if="modelValue.brandedFoodState === 'error'"
              class="text-red-500"
              title="Error processing product"
            >
              ❌
            </span>
          </span>
          <img
            v-else-if="part.type === 'request'"
            src="/loading.png"
            class="w-4 h-4 inline-block"
          />
          {{ part.text }}
        </span>
      </div>
      <button
        @click.stop="emit('deleteIngredient')"
        class="material-symbols-outlined text-gray-500 hover:text-gray-700 transition-colors"
        :disabled="modelValue.brandedFoodState === 'matching'"
        :class="{
          'opacity-50 cursor-not-allowed':
            modelValue.brandedFoodState === 'matching',
        }"
      >
        close
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const placeholders = [
  '100g of flour',
  '2 tbsp of olive oil',
  '1 cup of milk',
  '1 egg',
  '200g of sugar',
  '1 tsp of salt',
  '3 cloves of garlic',
  '250ml of water',
  '50g of butter',
  '1 tbsp of honey',
  '2 cups of rice',
  '150g of shredded cheese',
  '1 tsp of black pepper',
  '4 slices of bread',
  '1 tbsp of soy sauce',
  '300g of chicken breast',
  '1 cup of chopped onions',
  '2 tbsp of lemon juice',
  '1 handful of basil leaves',
  '500ml of vegetable broth',
];

const placeholder = computed(() => {
  return placeholders[Math.floor(Math.random() * placeholders.length)];
});

const props = defineProps<{
  modelValue: EditableTrackingItem;
}>();

const emit = defineEmits<{
  focusNext: [];
  deleteIngredient: [];
}>();

const supabase = useSupabaseClient<Database>();

const isEditing = ref(false);
const isLocked = ref(false);

const inputRef = ref<HTMLInputElement | null>(null);
const showScanner = ref(false);
const showCompletionModal = ref(false);
const currentBarcode = ref('');
const completionModalState = ref<'needs_basic_info' | 'needs_nutrition'>(
  'needs_basic_info'
);

// Text selection for request popup
const showRequestPopup = ref(false);
const selectedText = ref('');
const popupPosition = ref({ x: 0, y: 0 });

const needsUserAction = computed(() => {
  return (
    props.modelValue.brandedFoodState === 'needs_basic_info' ||
    props.modelValue.brandedFoodState === 'needs_nutrition'
  );
});

async function parse(force: boolean = false) {
  if (!props.modelValue || isLocked.value) return;
  if (!props.modelValue.rawText.trim()) {
    props.modelValue.parsed = [];
  }
  //if (props.modelValue.rawText.endsWith(' ') || force) {
  const result = await parseIngredientString(
    supabase,
    props.modelValue.rawText
  );
  Object.assign(props.modelValue, result);
  Object.assign(props.modelValue, result.ingredient);
  //}
}

async function handleInput(event: InputEvent) {
  await nextTick();
  parse();
}

async function handleLeave() {
  if (props.modelValue.parsed && props.modelValue.parsed.length > 0) {
    isEditing.value = false;
  }
  parse(true);
}

async function handleEnter() {
  await handleLeave();
  emit('focusNext');
}

async function handlePreviewClick(substring?: string) {
  if (isLocked.value) return;
  isEditing.value = true;
  await nextTick();
  inputRef.value?.focus();
  if (substring) {
    moveCaretAfterSubstring(substring);
  }
}

async function handleProductPartClick() {
  console.log(props.modelValue.brandedFoodState);
  if (
    props.modelValue.brandedFoodState === 'needs_basic_info' ||
    props.modelValue.brandedFoodState === 'needs_nutrition'
  ) {
    completionModalState.value = props.modelValue.brandedFoodState;
    showCompletionModal.value = true;
  } else {
    if (isLocked.value) return;
    isEditing.value = true;
    await nextTick();
    inputRef.value?.focus();
    moveCaretToBeforeProductCode();
  }
}

function moveCaretToBeforeProductCode() {
  if (inputRef.value) {
    const productCodeMatch = props.modelValue.rawText.match(/\[(\d+)\]/);
    if (productCodeMatch && productCodeMatch.index !== undefined) {
      inputRef.value.setSelectionRange(
        productCodeMatch.index,
        productCodeMatch.index
      );
    }
  }
}

function moveCaretAfterSubstring(substring: string) {
  if (inputRef.value) {
    const position = props.modelValue.rawText
      .toLowerCase()
      .indexOf(substring.toLowerCase());
    if (position !== -1) {
      inputRef.value.focus();
      inputRef.value.setSelectionRange(
        position + substring.length,
        position + substring.length
      );
    }
  }
}

async function handleBarcodeDetected(barcode: string) {
  showScanner.value = false;
  currentBarcode.value = barcode;

  const currentText = props.modelValue.rawText.trim();
  const prefix = currentText ? currentText + ' ' : '';
  props.modelValue.rawText = `${prefix}[${barcode}]`;

  await parse(true);

  if (!props.modelValue.amount) {
    moveCaretToBeforeProductCode();
  }

  // Check the state and handle accordingly
  const state = props.modelValue.brandedFoodState;

  if (state === 'needs_basic_info' || state === 'needs_nutrition') {
    // Lock input and show completion modal
    isEditing.value = false;
    isLocked.value = true;
    completionModalState.value = state;
    showCompletionModal.value = true;
  } else if (state === 'matching') {
    // Lock input and start background matching
    isEditing.value = false;
    isLocked.value = true;
    startBackgroundMatching(barcode);
  }
}

async function handleBrandedFoodSaved(brandedFood: BrandedFood) {
  // Update the local state
  props.modelValue.brandedFood = brandedFood;

  // Check requirements again
  const requirements = getBrandedFoodRequirements(brandedFood);

  if (!requirements.hasFullNutritionLabel) {
    // Still needs nutrition, keep modal open but change state
    completionModalState.value = 'needs_nutrition';
  } else {
    // Nutrition is complete, close modal and start matching
    showCompletionModal.value = false;
    props.modelValue.brandedFoodState = 'matching';

    // Re-parse to update the display
    await parse(true);

    // Start background matching
    startBackgroundMatching(currentBarcode.value);
  }
}

async function startBackgroundMatching(barcode: string) {
  try {
    props.modelValue.brandedFoodState = 'matching';

    // Call the match endpoint
    const result = await $fetch('/api/db/match-branded-food', {
      method: 'POST',
      body: { barcode },
    });

    if (result.status === 'ok') {
      // Update state to complete
      props.modelValue.brandedFoodState = 'complete';

      // Re-fetch the branded food to get the matched_food_name_id
      const updatedBrandedFood = await getBrandedFood(supabase, barcode);
      if (updatedBrandedFood) {
        props.modelValue.brandedFood = updatedBrandedFood;
      }

      // Re-parse to update
      await parse(true);

      // Unlock the input now that everything is complete
      isLocked.value = false;
    }
  } catch (error) {
    console.error('Error matching branded food:', error);
    props.modelValue.brandedFoodState = 'error';
  }
}

function handleTextSelection(event: Event) {
  const input = event.target as HTMLInputElement;
  const selection = input.value.substring(
    input.selectionStart || 0,
    input.selectionEnd || 0
  );

  if (selection && selection.trim().length > 0) {
    selectedText.value = selection.trim();

    // Calculate popup position based on input position and selection
    const inputRect = input.getBoundingClientRect();
    const selectionStart = input.selectionStart || 0;

    // Estimate horizontal position (rough approximation)
    const charWidth = 8; // approximate character width
    const selectionX = inputRect.left + selectionStart * charWidth;

    popupPosition.value = {
      x: Math.min(
        Math.max(
          selectionX + (selection.length * charWidth) / 2,
          inputRect.left + 50
        ),
        inputRect.right - 50
      ),
      y: inputRect.top - 8,
    };

    showRequestPopup.value = true;
  } else {
    showRequestPopup.value = false;
    selectedText.value = '';
  }
}

async function handleRequestFood(query: string) {
  showRequestPopup.value = false;
  selectedText.value = '';

  const position = props.modelValue.rawText.indexOf(query);
  if (!query.trim() || position === -1) return;

  isEditing.value = false;
  isLocked.value = true;

  const [before, after] = props.modelValue.rawText.split(query, 2);
  props.modelValue.parsed = [
    {
      text: before,
      styling: ignoredStyling,
      type: 'ignored',
    },
    {
      text: query,
      styling: ingredientStyling,
      type: 'request',
    },
    {
      text: after,
      styling: ignoredStyling,
      type: 'ignored',
    },
  ];

  const response = await $fetch('/api/db/request-food', {
    method: 'POST',
    body: {
      query,
      from_user: true,
    },
  });

  if (response.status === 'ok') {
    isLocked.value = false;
    await parse(true);
  } else {
    alert('Error requesting food. Please try again.');
    isLocked.value = false;
  }
}

// Hide popup when clicking outside or pressing escape
const handleDocumentClick = (event: MouseEvent) => {
  if (showRequestPopup.value) {
    const target = event.target as HTMLElement;
    if (!target.closest('.animate-scale-in') && target !== inputRef.value) {
      showRequestPopup.value = false;
      selectedText.value = '';
    }
  }
};

const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && showRequestPopup.value) {
    showRequestPopup.value = false;
    selectedText.value = '';
  }
};

const setIsEditing = () => {
  isEditing.value = !props.modelValue.parsed.length;
};

onMounted(() => {
  setIsEditing();

  document.addEventListener('click', handleDocumentClick);
  document.addEventListener('keydown', handleEscape);
});

onUnmounted(() => {
  document.removeEventListener('click', handleDocumentClick);
  document.removeEventListener('keydown', handleEscape);
});

defineExpose({
  focus: () => inputRef.value?.focus(),
  setIsEditing: () => setIsEditing(),
});
</script>

<style scoped>
.popup-enter-active {
  transition: all 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.popup-leave-active {
  transition: all 0.1s ease-out;
}

.popup-enter-from {
  opacity: 0;
  transform: translate(-50%, -100%) scale(0.9);
}

.popup-leave-to {
  opacity: 0;
  transform: translate(-50%, -100%) scale(0.95);
}

.animate-scale-in {
  animation: scale-in 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes scale-in {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
