<template>
  <PagesRecipeLayout>
    <template #image>
      <div
        @click="triggerFileInput"
        class="relative cursor-pointer w-full aspect-square rounded-xl overflow-hidden border-2 border-dashed border-gray-400 flex items-center justify-center bg-gray-100 group hover:border-gray-600"
      >
        <input
          ref="imgUpload"
          type="file"
          accept="image/*"
          class="hidden"
          @change="onFileChange"
        />

        <span
          v-if="!imageUrl"
          class="material-symbols-outlined !text-8xl text-gray-400 select-none pointer-events-none"
        >
          photo_camera
        </span>

        <img
          v-else
          :src="imageUrl"
          alt="Uploaded photo preview"
          class="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
        />
      </div>
    </template>

    <template #title>
      <textarea
        v-model="recipe.title"
        v-auto-resize
        rows="1"
        placeholder="New Recipe"
        class="min-w-0 font-bold text-5xl border-box bg-transparent border-2 border-dashed border-gray-400 rounded-xl p-2 outline-none resize-none overflow-hidden h-auto break-words scrollbar-hide flex-1"
      />
    </template>

    <template #tags>
      <div class="flex gap-5 flex-wrap justify-center relative text-xl">
        <FormsMultiChoiceDropdown
          class="min-w-30"
          v-model="chosenFlavorTags"
          :choices="TAGS.FLAVOR.map((tag) => tag.name)"
          placeholder="Flavors"
          :style="'border-2 border-dashed border-gray-400 rounded-xl p-2 bg-[#fffefc]'"
        />
        <FormsMultiChoiceDropdown
          class="min-w-30"
          v-model="chosenCourseTags"
          :choices="TAGS.COURSE.map((tag) => tag.name)"
          placeholder="Course"
          :style="'border-2 border-dashed border-gray-400 rounded-xl p-2 bg-[#fffefc]'"
        />
        <FormsMultiChoiceDropdown
          class="min-w-30"
          v-model="chosenCuisineTags"
          :choices="TAGS.CUISINE.map((tag) => tag.name)"
          placeholder="Cuisine"
          :style="'border-2 border-dashed border-gray-400 rounded-xl p-2 bg-[#fffefc]'"
        />
      </div>
    </template>

    <template #description>
      <textarea
        v-model="recipe.description"
        v-auto-resize
        rows="1"
        placeholder="Description"
        class="w-full bg-transparent border-2 border-dashed border-gray-400 rounded-xl p-2 outline-none resize-none overflow-hidden h-auto break-words scrollbar-hide flex-1"
      ></textarea>
    </template>

    <template #metadata>
      <div
        class="flex gap-2 items-center justify-center bg-[#DBFCE7] border-[#98E9AF] text-[#008236] border-3 border-dashed rounded-xl p-2 font-bold shadow-lg select-none cursor-pointer"
        @click="onClickEffort"
      >
        <span class="material-symbols-outlined"> flash_on </span>
        <span class="text-base">Effort: {{ capitalize(recipe?.effort) }}</span>
        <span class="material-symbols-outlined" v-if="recipe.effort === null">
          touch_app
        </span>
      </div>
      <div
        class="flex gap-2 items-center justify-center bg-[#DBFCE7] border-[#98E9AF] text-[#008236] border-3 border-dashed rounded-xl p-2 font-bold shadow-lg select-none cursor-pointer"
        @click="onClickDifficulty"
      >
        <span class="material-symbols-outlined"> target </span>
        <span class="text-base"
          >Difficulty: {{ capitalize(recipe?.difficulty) }}</span
        >
        <span
          class="material-symbols-outlined"
          v-if="recipe.difficulty === null"
        >
          touch_app
        </span>
      </div>
      <div
        class="flex gap-2 items-center justify-center bg-[#DBFCE7] border-[#98E9AF] text-[#008236] border-3 border-dashed rounded-xl p-2 font-bold shadow-lg select-none cursor-pointer"
        @click="onClickVisibility"
      >
        <span class="material-symbols-outlined"> visibility </span>
        <span class="text-base"
          >Visibility: {{ capitalize(recipe?.visibility) }}</span
        >
        <span
          class="material-symbols-outlined"
          v-if="recipe.visibility === null"
        >
          touch_app
        </span>
      </div>
      <div
        class="flex gap-2 items-center justify-center bg-[#DBFCE7] border-[#98E9AF] text-[#008236] border-3 rounded-xl p-2 font-bold shadow-lg"
      >
        <span class="material-symbols-outlined"> attach_money </span>
        <span class="text-base"
          >Estimated Price: {{ formatMoney(recipeComputed?.price) }}</span
        >
      </div>
    </template>

    <template #ingredients>
      <PagesRecipeIngredientListEditable
        v-model="recipe.ingredients_pre"
      ></PagesRecipeIngredientListEditable>
    </template>

    <template #instructions>
      <PagesRecipeInstructionContainerEditable
        v-model="recipe.instructions"
      ></PagesRecipeInstructionContainerEditable>
    </template>

    <template #nutrition>
      <PagesRecipeNutriCard :recipe="recipeComputed" />
    </template>
  </PagesRecipeLayout>
  <div class="my-22"></div>
  <div
    class="fixed bottom-22 xm:bottom-6 xm:right-6 z-100 flex gap-2 w-full justify-center xm:w-auto xm:justify-end"
  >
    <button
      class="flex gap-2 items-center justify-center bg-[#DBFCE7] border-[#98E9AF] text-[#008236] border-3 rounded-xl p-2 font-bold shadow-lg"
      @click=""
    >
      <span class="material-symbols-outlined"> visibility </span>
      Preview
    </button>
    <button
      class="flex gap-2 items-center justify-center bg-[#DBFCE7] border-[#98E9AF] text-[#008236] border-3 rounded-xl p-2 font-bold shadow-lg"
      @click="submit()"
    >
      <span v-if="!loadingStep" class="material-symbols-outlined">
        arrow_right_alt
      </span>
      <ClientOnly v-else>
        <Vue3Lottie animationLink="/loading.json" :height="24" :width="24" />
      </ClientOnly>
      Submit
    </button>
  </div>
</template>

<script setup>
const efforts = ['LIGHT', 'MODERATE', 'HEAVY'];
const difficulties = ['EASY', 'MEDIUM', 'HARD'];
const visibilities = ['PUBLIC', 'UNLISTED', 'PRIVATE'];
const chosenFlavorTags = ref([]);
const chosenCourseTags = ref([]);
const chosenCuisineTags = ref([]);

const imageUrl = ref(null);
const imgUpload = ref(null);
const loadingStep = ref(0);

const auth = useAuthStore();
const supabase = useSupabase();
const route = useRoute();

const recipe = ref({
  title: '',
  description: '',
  ingredients_pre: {
    servingSize: 1,
    ingredients: [
      {
        categoryName: 'uncategorized',
        ingredients: [],
        searchQuery: '',
        searchResults: [],
      },
    ],
  },
  instructions: [],
  tags: [],
  effort: null,
  difficulty: null,
  visibility: null,
});

const recipeComputed = ref({});

onMounted(async () => {
  const editing = route.query.editCurrent === 'true';
  if (editing && useCurrentRecipeStore().recipe) {
    recipe.value = await useCurrentRecipeStore().convertToEditable();
    imageUrl.value = recipe.value.picture_url;
  }
});

const getTagIdByName = (category, name) => {
  const tag = TAGS[category].find((t) => t.name === name);
  return tag ? tag.id : null;
};

function onClickEffort() {
  if (recipe.value.effort === null) {
    recipe.value.effort = efforts[0];
  } else {
    recipe.value.effort =
      efforts[(efforts.indexOf(recipe.value.effort) + 1) % efforts.length];
  }
}
function onClickDifficulty() {
  if (recipe.value.difficulty === null) {
    recipe.value.difficulty = difficulties[0];
  } else {
    recipe.value.difficulty =
      difficulties[
        (difficulties.indexOf(recipe.value.difficulty) + 1) %
          difficulties.length
      ];
  }
}
function onClickVisibility() {
  if (recipe.value.visibility === null) {
    recipe.value.visibility = visibilities[0];
  } else {
    recipe.value.visibility =
      visibilities[
        (visibilities.indexOf(recipe.value.visibility) + 1) %
          visibilities.length
      ];
  }
}

const getTags = () => {
  return [
    ...chosenFlavorTags.value.map((name) => getTagIdByName('FLAVOR', name)),
    ...chosenCourseTags.value.map((name) => getTagIdByName('COURSE', name)),
    ...chosenCuisineTags.value.map((name) => getTagIdByName('CUISINE', name)),
  ].filter((id) => id !== null);
};

async function compute() {
  recipeComputed.value = (
    await computeRecipe(JSON.parse(JSON.stringify(recipe.value)))
  ).recipeComputed;
}

const computeDebounced = debounce(compute, 3000);

watch(recipe, computeDebounced, { deep: true });

const uploadImage = async (id, file) => {
  if (!file) return;

  const fileExt = file.name.split('.').pop();
  const fileName = `${id}.${fileExt}`;

  const { error } = await supabase.storage
    .from('recipe')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Upload error:', error.message);
  } else {
    console.log('Upload successful:', filePath);
  }
};

async function submit() {
  loadingStep.value = 1;
  recipe.value.tags = getTags();
  const { recipeComputed, recipeFoods, recipeTags } = await computeRecipe(
    structuredClone(recipe.value)
  );
  loadingStep.value = 2;
  let fileExt = null;
  let imgFile = null;
  if (imgUpload.value.files && imgUpload.value.files[0]) {
    imgFile = imgUpload.value.files[0];
    fileExt = imgFile.name.split('.').pop();
  }
  const { data, error } = await supabase
    .from('recipes')
    .insert({
      ...recipeComputed,
      picture_ext: fileExt,
      user_id: auth?.user?.id ?? null,
    })
    .select('id')
    .single();
  if (error) {
    throw error;
  }
  loadingStep.value = 3;
  const id = data.id;
  if (recipeFoods.length) {
    const { error } = await supabase
      .from('recipe_foods')
      .insert(recipeFoods.map((obj) => ({ ...obj, recipe_id: id })));
    if (error) {
      throw error;
    }
  }
  loadingStep.value = 4;
  if (recipeTags.length) {
    const { error } = await supabase
      .from('recipe_tags')
      .insert(recipeTags.map((obj) => ({ ...obj, recipe_id: id })));
    if (error) {
      throw error;
    }
  }
  loadingStep.value = 5;
  if (imgFile) {
    await uploadImage(id, imgFile);
  }
  loadingStep.value = 6;
  navigateTo(`/recipe/${id}`);
}

function triggerFileInput() {
  imgUpload.value?.click();
}

function onFileChange(event) {
  const file = event.target.files[0];
  if (!file) return;
  imageUrl.value = URL.createObjectURL(file);
}
</script>

<style scoped></style>
