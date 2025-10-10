<template>
  <ClientOnly>
    <Transition name="fade" mode="out-in" appear>
      <div
        key="onboarding-container"
        class="min-h-screen onboarding-gradient flex items-center justify-center p-4 pb-10"
      >
        <div class="p-2 sm:p-8 max-w-2xl w-full">
          <NuxtLink to="/" class="text-white opacity-70 ml-2">
            <span class="material-symbols-outlined !text-lg">
              arrow_back_ios
            </span>
          </NuxtLink>
          <!-- Progress Bar -->
          <div class="mb-8 mt-8">
            <div class="w-full bg-white/20 rounded-full h-2">
              <div
                class="bg-gradient-to-r from-primary-400 to-primary-600 h-2 rounded-full transition-all duration-500 ease-out"
                :style="{
                  width: `${((currentStepIndex + 1) / steps.length) * 100}%`,
                }"
              ></div>
            </div>
          </div>

          <div class="min-h-[400px]">
            <!-- Diet Step -->
            <div
              v-if="currentStep === 'diet'"
              class="space-y-6 animate-slide-in"
            >
              <div class="text-center">
                <h2 class="text-3xl font-bold text-white mb-2">
                  Let's get you started!
                </h2>
                <p class="text-white/80 text-lg">
                  What diet do you currently follow?
                </p>
              </div>
              <div class="flex flex-wrap gap-3 justify-center sm:mx-10">
                <div
                  v-for="diet in dietOptions"
                  :key="diet.id"
                  @click="selectDiet(diet)"
                  class="cell"
                  :class="{ selected: selectedDiet?.id === diet.id }"
                >
                  {{ diet.label }}
                </div>
              </div>
            </div>

            <!-- Sorting Step -->
            <div
              v-if="currentStep === 'sorting'"
              class="space-y-6 animate-slide-in"
            >
              <div class="text-center">
                <h2 class="text-3xl font-bold text-white mb-2">
                  What matters most?
                </h2>
                <p class="text-white/80 text-lg">
                  What is most important to you for recipes?
                </p>
              </div>
              <div class="flex flex-wrap gap-3 justify-center overflow-y-auto">
                <div
                  v-for="sorting in sortingOptions"
                  :key="sorting.column"
                  @click="selectSorting(sorting)"
                  class="cell"
                  :class="{
                    selected: selectedSorting?.column === sorting.column,
                  }"
                >
                  {{ sorting.label }}
                </div>
              </div>
            </div>

            <!-- Cuisines Step -->
            <div
              v-if="currentStep === 'cuisines'"
              class="space-y-6 animate-slide-in"
            >
              <div class="text-center">
                <h2 class="text-3xl font-bold text-white mb-2">
                  Explore cuisines
                </h2>
                <p class="text-white/80 text-lg">
                  Which cuisines interest you?
                </p>
              </div>
              <div class="flex flex-wrap gap-3 justify-center mx-10">
                <div
                  v-for="cuisine in cuisineOptions"
                  :key="cuisine.id"
                  @click="toggleCuisine(cuisine)"
                  class="cell"
                  :class="{
                    selected: selectedCuisines.some((c) => c.id === cuisine.id),
                  }"
                >
                  {{ cuisine.label }}
                </div>
              </div>
            </div>

            <!-- Foods Step -->
            <div
              v-if="currentStep === 'foods'"
              class="space-y-6 animate-slide-in"
            >
              <div class="text-center">
                <h2 class="text-3xl font-bold text-white mb-2">
                  Favorite foods
                </h2>
                <p class="text-white/80 text-lg">
                  Select some foods that you like
                </p>
              </div>
              <div class="flex flex-wrap gap-3 justify-center">
                <div
                  v-for="food in foodOptions"
                  :key="food.label"
                  @click="toggleFood(food)"
                  class="cell"
                  :class="{
                    selected: selectedFoods.some((f) => f.label === food.label),
                  }"
                >
                  {{ food.label }}
                </div>
              </div>
            </div>

            <!-- Username Step -->
            <div
              v-if="currentStep === 'username'"
              class="space-y-6 animate-slide-in"
            >
              <div class="text-center">
                <h2 class="text-3xl font-bold text-white mb-2">
                  Choose your username
                </h2>
                <p class="text-white/80 text-lg">What should we call you?</p>
              </div>
              <div class="space-y-4 mx-2">
                <div>
                  <input
                    v-model="username"
                    type="text"
                    placeholder="Enter your username"
                    class="w-full px-6 py-4 bg-white/10 border border-white/30 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 text-lg"
                  />
                </div>
              </div>
            </div>

            <!-- Register Form Step -->
            <div
              v-if="currentStep === 'registerForm'"
              class="space-y-6 animate-slide-in"
            >
              <div class="text-center">
                <h2 class="text-3xl font-bold text-white mb-2">
                  Create your account
                </h2>
                <p class="text-white/80 text-lg">
                  Just a few more details to get started
                </p>
              </div>
              <div v-if="!error" class="mx-2 flex flex-col gap-4 items-center">
                <div class="w-full">
                  <input
                    v-model="email"
                    type="email"
                    placeholder="Email address"
                    class="w-full px-6 py-4 bg-white/10 border border-white/30 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                </div>
                <div class="w-full">
                  <input
                    v-model="password"
                    type="password"
                    placeholder="Password"
                    class="w-full px-6 py-4 bg-white/10 border border-white/30 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                </div>
                <div class="w-full">
                  <input
                    v-model="confirm_password"
                    type="password"
                    placeholder="Confirm password"
                    class="w-full px-6 py-4 bg-white/10 border border-white/30 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                </div>
                <span class="text-white/80 text-sm">OR</span>
                <button
                  class="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white/40 hover:bg-white/90 border border-white/30 rounded-2xl text-gray-700 transition-all duration-200"
                >
                  <img :src="'/google.webp'" class="w-5 h-5" alt="Google" />
                  <span class="font-medium">Sign up with Google</span>
                </button>
              </div>
              <div v-else class="mx-2 flex flex-col gap-4 items-center">
                <p class="text-red-500 text-lg">
                  {{ error }}
                </p>
              </div>
            </div>

            <!-- Optional Step -->
            <div
              v-if="currentStep === 'optional'"
              class="space-y-6 animate-slide-in"
            >
              <div class="text-center">
                <h2 class="text-3xl font-bold text-white mb-2">
                  Complete your profile
                </h2>
                <p class="text-white/80 text-lg">
                  Add a profile picture (Optional)
                </p>
              </div>
              <div
                @click="triggerFileInput"
                class="relative cursor-pointer w-full aspect-square rounded-xl overflow-hidden border-2 border-dashed border-gray-400 flex items-center justify-center bg-gray-100 group hover:border-gray-600"
              >
                <span
                  class="material-symbols-outlined !text-8xl text-gray-400 select-none pointer-events-none"
                >
                  photo_camera
                </span>
                <input
                  ref="imgUpload"
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="uploadProfilePicture"
                />
              </div>
            </div>
          </div>

          <!-- Navigation Buttons -->
          <div class="flex justify-between items-center mt-8">
            <button
              @click="previousStep"
              :disabled="currentStepIndex === 0"
              class="px-6 py-3 bg-white/10 hover:bg-white/30 disabled:bg-white/10 disabled:opacity-50 rounded-full text-white font-medium transition-all duration-200 border border-white/30"
              :class="{ 'cursor-not-allowed': currentStepIndex === 0 }"
            >
              Previous
            </button>
            <button
              @click="skipToRegister"
              class="px-4 py-2 text-white transition-all duration-200 underline"
            >
              Skip ahead
            </button>
            <button
              @click="nextStep"
              :disabled="!canProceed"
              class="px-8 py-3 bg-white/20 hover:bg-white/30 disabled:opacity-50 rounded-full text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              :class="{ 'cursor-not-allowed': !canProceed }"
            >
              {{ getButtonText() }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </ClientOnly>
</template>

<script setup lang="ts">
const auth = useAuthStore();
const imgUpload = ref(null as any);

const selectedDiet = ref(null as any);
const selectedSorting = ref(null as any);
const selectedCuisines = ref([] as any[]);
const selectedFoods = ref([] as any[]);
const supabase = useSupabaseClient<Database>();

const username = ref('');
const email = ref('');
const password = ref('');
const confirm_password = ref('');
const error = ref<string | null>(null);

const dietOptions = [
  { label: 'Vegan', id: 62 },
  { label: 'Vegetarian', id: 63 },
  { label: 'Keto', id: 64 },
  { label: 'High Protein', id: 67 },
  { label: 'Carnivore', id: 99 },
  { label: 'Gluten Free', id: 68 },
];

const sortingOptions = [
  {
    label: '😋 I want recipes that are delicious!',
    column: 'popularity',
  },
  { label: '🥗 I want recipes that are healthy!', column: 'hidx' },
  { label: '💰 I want recipes that are cheap!', column: 'price' },
  { label: '🍳 I want recipes that are quick and easy!', column: 'effort' },
  {
    label: '🌍 I want recipes that expand my culinary horizons!',
    column: 'exotic_index',
  },
];

const cuisineOptions = [
  { id: 82, label: 'Italian' },
  { id: 83, label: 'German' },
  { id: 84, label: 'American' },
  { id: 85, label: 'Vietnamese' },
  { id: 86, label: 'Chinese' },
  { id: 87, label: 'Japanese' },
  { id: 88, label: 'French' },
  { id: 89, label: 'British' },
  { id: 90, label: 'Mexican' },
  { id: 91, label: 'Indian' },
  { id: 92, label: 'Spanish' },
  { id: 93, label: 'Middle Eastern' },
  { id: 94, label: 'Thai' },
];

const foodOptions = [
  { label: '🍕 Pizza', id: '' },
  { label: '🍣 Sushi', id: 451 },
  { label: '🍫 Chocolate', id: 944 },
  { label: '🥗 Salad', id: '' },
  { label: '🍔 Burger', id: '' },
  { label: '🥩 Steak', id: '' },
  { label: '🍝 Pasta', id: '' },
  { label: '🍛 Curry', id: '' },
  { label: '🍞 Bread', id: '' },
  { label: '🍜 Ramen', id: '' },
  { label: '🧀 Cheese', id: '' },
  { label: '🥑 Avocado', id: 298 },
  { label: '🌮 Tacos', id: '' },
  { label: '🍓 Strawberries', id: '' },
  { label: '🍳 Eggs', id: '' },
  { label: '🍗 Fried Chicken', id: '' },
  { label: '🥔 Potatoes', id: 284 },
  { label: '🍤 Shrimp', id: '' },
  { label: '🥬 Kale', id: '' },
  { label: '🍉 Watermelon', id: '' },
];

const steps = [
  'diet',
  'sorting',
  'cuisines',
  'foods',
  'username',
  'registerForm',
  'optional',
];

const getButtonText = () => {
  switch (currentStep.value) {
    case 'registerForm':
      return 'Confirm';
    case 'optional':
      return 'Skip';
    default:
      return 'Next';
  }
};

const currentStepIndex = ref(0);
const currentStep = computed(() => steps[currentStepIndex.value]);

const canProceed = computed(() => {
  switch (currentStep.value) {
    case 'username':
      return username.value.trim().length > 0;
    case 'registerForm':
      return (
        email.value.trim().length > 0 &&
        password.value.length > 0 &&
        confirm_password.value === password.value
      );
    default:
      return true;
  }
});

const triggerFileInput = () => {
  imgUpload.value.click();
};

async function register() {
  const { data, error } = await supabase.auth.updateUser({
    email: email.value,
    password: password.value,
  });
  if (error || !data.user?.id) return;

  if (!username.value) username.value = email.value.split('@')[0];
  await addProfile(
    supabase,
    {
      id: data.user.id,
      username: username.value,
      preferred_sorting: selectedSorting.value.column,
    },
    [selectedDiet.value.id, ...selectedCuisines.value.map((c) => c.id)],
    [...selectedFoods.value.map((f) => f.id)]
  );
}

async function uploadProfilePicture(e: any) {
  const file = e.target.files[0];
  const id = auth.user?.id;
  if (!id || !file) navigateTo('/');
  const { data: imageData } = await useImageUpload(file, 'profile', id!, false);
  const url = imageData.value?.publicUrl;
  if (!url) return;
  await updateProfile(supabase, { picture: url, id });
  navigateTo('/');
}

const selectDiet = (diet: any) => {
  selectedDiet.value = diet;
  nextStepDelay();
};

const selectSorting = (sorting: any) => {
  selectedSorting.value = sorting;
  nextStepDelay();
};

const toggleCuisine = (cuisine: any) => {
  const index = selectedCuisines.value.findIndex((c) => c.id === cuisine.id);
  if (index > -1) {
    selectedCuisines.value.splice(index, 1);
  } else {
    selectedCuisines.value.push(cuisine);
  }
};

const toggleFood = (food: any) => {
  const index = selectedFoods.value.findIndex((f) => f.label === food.label);
  if (index > -1) {
    selectedFoods.value.splice(index, 1);
  } else {
    selectedFoods.value.push(food);
  }
};

const nextStep = async () => {
  if (currentStep.value === 'registerForm') {
    try {
      await register();
    } catch (err) {
      error.value = err as string;
      setTimeout(() => {
        navigateTo('/');
      }, 3000);
      return;
    }
  } else if (currentStep.value === 'optional') {
    navigateTo('/');
    return;
  }
  currentStepIndex.value++;
};

const nextStepDelay = () => {
  setTimeout(() => {
    nextStep();
  }, 200);
};

const previousStep = () => {
  if (currentStepIndex.value > 0) {
    currentStepIndex.value--;
  }
};

const skipToRegister = () => {
  const registerIndex = steps.findIndex((step) => step === 'registerForm');
  if (registerIndex > -1) {
    currentStepIndex.value = registerIndex;
  }
};
</script>

<style scoped>
.animate-slide-in {
  animation: slideIn 0.4s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateX(30%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.fade-enter-active {
  transition: opacity 1s ease;
}
.fade-enter-from {
  opacity: 0;
}
.fade-enter-to {
  opacity: 1;
}
</style>
