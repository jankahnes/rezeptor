<template>
  <div
    class="transition-all duration-300 ml-4 md:ml-0 flex"
    :class="{ '-ml-10!': recipe?.picture }"
  >
    <div class="flex flex-row items-center w-full">
      <!-- circular -->
      <NuxtImg
        v-if="recipe?.picture"
        class="h-74 aspect-square object-cover bg-transparent shadow-[#00000044] [filter:drop-shadow(36px_45px_40px_var(--tw-shadow-color))_drop-shadow(0_0_10px_#00000015)] relative z-10 will-change-transform transition-transform duration-500 hover:translate-x-[-2px] hover:scale-[1.015]"
        :src="recipe?.picture || ''"
        fetchpriority="high"
        :alt="recipe?.title"
      />

      <div
        class="w-16 h-16 rounded-3xl z-20 mt-50 -ml-20 flex items-center justify-center shrink-0 [img:hover+&]:scale-103 [img:hover+&]:translate-y-[-2px] [img:hover+&]:translate-x-[2px] transition-transform will-change-transform duration-300"
        v-if="recipe?.hidx && recipe?.hidx >= 55 && recipe?.picture"
        :class="gradeStickerColors[getGrade(recipe?.hidx, 'ovr')[0] as keyof typeof gradeStickerColors]"
      >
        <span class="text-3xl font-bold">
          {{ getGrade(recipe?.hidx, 'ovr') }}
        </span>
      </div>
      <div
        class="action-card z-0 flex-1 p-10 flex gap-8 justify-between"
        :class="{ '-ml-60! pl-76!': recipe?.picture }"
      >
        <div class="flex flex-col flex-1 max-w-2xl">
          <div class="flex justify-between items-start">
            <h2
              class="font-bold text-[2.5rem] tracking-tighter line-clamp-2 items-center gap-4 flex justify-between leading-14"
              :class="{
                'underline decoration-primary underline-offset-4': true,
              }"
            >
              {{ recipe?.title }}
            </h2>
            <div class="flex items-start mt-4 gap-2">
              <button class="p-1">
                <span class="material-symbols-outlined !text-xl leading-none">
                  share
                </span>
              </button>
              <button class="p-1">
                <span class="material-symbols-outlined !text-xl leading-none">
                  print
                </span>
              </button>
              <button class="p-1">
                <span class="material-symbols-outlined !text-xl leading-none">
                  edit
                </span>
              </button>
            </div>
          </div>
          <p class="flex items-center gap-2 mt-1">
            <FormsRatingField
              :model-value="recipe?.rating"
              :star-width="24"
              :star-height="24"
              :spacing="2"
              :select="false"
              :uniqueId="`card-highlight-${recipe?.id}-${uniqueId}`"
              class="text-primary"
            />
            <span class="text-lg font-semibold leading-none mt-0.5">{{
              recipe?.rating.toFixed(1)
            }}</span>
          </p>

          <p class="text-lg mt-4" v-if="displayType === 'cuisine'">
            {{ getCuisineDescription(recipe?.collection ?? '') }}
          </p>
          <p
            class="text-base mt-4 flex items-center gap-1"
            v-if="displayType === 'website'"
          >
            <span class="material-symbols-outlined !text-lg leading-none"
              >language</span
            >
            Imported from {{ capitalize(websiteName) }}
          </p>
          <p
            class="text-base mt-4 flex items-center gap-2"
            v-if="displayType === 'creator'"
          >
            <span class="material-symbols-outlined !text-lg leading-none"
              >videocam</span
            >
            Created by {{ recipe?.original_creator_channel_name }}
          </p>
          <p
            class="text-lg mt-4 flex items-center gap-2"
            v-if="displayType === 'user'"
          >
            <Avatar :user="recipe.user!" class="w-8 h-8" />
            <span class="text-lg font-semibold leading-none">{{
              recipe?.user?.username
            }}</span>
          </p>
          <p class="text-sm mt-1 text-gray-600 line-clamp-3 leading-snug">
            {{ recipe?.description }}
          </p>

          <div class="flex items-center gap-2 justify-between mt-4 max-w-130">
            <div class="flex items-center gap-2">
              <span
                class="material-symbols-outlined !text-xl leading-none icon-fill text-gray-400"
                >timer</span
              >
              <div class="flex flex-col items-start">
                <p class="text-xs leading-none text-gray-400">Effort</p>
                <p class="text-[20px] leading-none">
                  {{ capitalize(recipe?.effort) }}
                </p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span
                class="material-symbols-outlined !text-xl leading-none icon-fill text-gray-400"
                >bolt</span
              >
              <div class="flex flex-col items-start">
                <p class="text-xs leading-none text-gray-400">Difficulty</p>
                <p class="text-[20px] leading-none">
                  {{ capitalize(recipe?.difficulty) }}
                </p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span
                class="material-symbols-outlined !text-xl leading-none icon-fill text-gray-400"
                >payments</span
              >
              <div class="flex flex-col items-start">
                <p class="text-xs leading-none text-gray-400">Price</p>
                <p class="text-[20px] leading-none">
                  {{ formatMoney(recipe?.price)
                  }}<span class="text-xs text-gray-400 ml-0.5">/ serving</span>
                </p>
              </div>
            </div>
          </div>
          <div class="flex gap-2 mt-4">
            <div class="flex gap-1.5 flex-wrap overflow-hidden py-0.5 text-sm">
              <div
                v-if="recipe?.hidx && recipe?.hidx >= 55 && !recipe?.picture"
                class="flex tag items-center justify-center !text-black text-center min-w-[2em] subpixel-antialiased tabular-nums"
                :class="gradeColors[getGrade(recipe?.hidx, 'ovr')]"
              >
                {{ getGrade(recipe?.hidx, 'ovr') }}
              </div>

              <div
                class="flex items-center justify-center text-nowrap bg-slate-100 text-slate-600 px-2 py-1 rounded-lg"
                v-for="(tag, index) in top7Tags"
                :key="index"
              >
                {{ tag?.name }}
              </div>
            </div>
          </div>
        </div>
        <div class="w-0.5 bg-gray-100"></div>
        <div class="flex flex-col gap-3 justify-between py-1">
          <!-- Header -->
          <div
            class="bg-red-200 text-red-700 p-3 rounded-2xl space-y-1"
            v-if="false"
          >
            <div class="flex items-center gap-2 text-lg font-bold">
              <span class="material-symbols-outlined !text-xl leading-none"
                >close</span
              >
              <span class="leading-none">Not vegan</span>
            </div>
            <p class="text-xs leading-none">
              Contains <strong>Boneless Short Ribs</strong> and
              <strong>Honey</strong>
            </p>
          </div>
          <div
            class="bg-green-200 text-green-700 p-3 rounded-2xl space-y-1"
            v-else
          >
            <div class="flex items-center gap-2 text-lg font-bold">
              <span class="material-symbols-outlined !text-xl leading-none"
                >check</span
              >
              <span class="leading-none">Fits your diet</span>
            </div>
          </div>
          <div class="flex items-center justify-between gap-2 mx-4">
            <div class="flex flex-col items-center gap-1">
              <Ring
                :segments="[
                  { value: (recipe?.kcal ?? 0) / 2000, color: '#6a7282' },
                ]"
                widthClass="w-15"
                :strokeWidth="13"
              >
                <div class="flex items-center justify-center text-center">
                  <div class="text-xs font-bold text-gray-400">
                    {{ (((recipe?.kcal ?? 0) / 2000) * 100).toFixed(0) }}%
                  </div>
                </div>
              </Ring>
              <p class="text-sm font-light text-gray-400">Kcal</p>
            </div>
            <div class="flex flex-col items-center gap-1">
              <Ring
                :segments="[
                  { value: (recipe?.protein ?? 0) / 120, color: '#6a7282' },
                ]"
                widthClass="w-15"
                :strokeWidth="13"
              >
                <div class="flex items-center justify-center text-center">
                  <div class="text-xs font-bold text-gray-400">
                    {{ (((recipe?.protein ?? 0) / 120) * 100).toFixed(0) }}%
                  </div>
                </div>
              </Ring>
              <p class="text-sm font-light text-gray-400">Protein</p>
            </div>
            <div class="flex flex-col items-center gap-1">
              <Ring
                :segments="[
                  { value: (recipe?.fiber ?? 0) / 30, color: '#6a7282' },
                ]"
                widthClass="w-15"
                :strokeWidth="13"
              >
                <div class="flex items-center justify-center text-center">
                  <div class="text-xs font-bold text-gray-400">
                    {{ (((recipe?.fiber ?? 0) / 30) * 100).toFixed(0) }}%
                  </div>
                </div>
              </Ring>
              <p class="text-sm font-light text-gray-400">Fiber</p>
            </div>
          </div>
          <div class="flex flex-col gap-2">
            <div class="flex gap-2">
              <button
                class="text-primary outline-2 outline-primary-200 rounded-xl p-2 font-semibold flex items-center justify-center gap-2 transition-colors flex-1"
              >
                <span class="material-symbols-outlined !text-xl leading-none"
                  >insert_chart</span
                >
                Track
              </button>
              <button
                class="text-primary outline-2 outline-primary-200 rounded-xl p-2 font-semibold flex items-center justify-center gap-2 transition-colors flex-1"
              >
                <span class="material-symbols-outlined !text-xl leading-none"
                  >bookmark</span
                >
                Save
              </button>
            </div>
            <!-- Main Action Area -->
            <button
              class="bg-primary-500 hover:bg-primary-600 text-white rounded-2xl p-3 flex items-center justify-center gap-3 transition-all hover:scale-[1.02]"
            >
              <span class="material-symbols-outlined !text-[28px] leading-none"
                >rocket_launch</span
              >
              <div class="flex flex-col items-start">
                <span class="font-semibold text-lg">Start Cook Mode</span>
              </div>
            </button>
          </div>
        </div>
        <!-- Social Media Link -->
        <div
          class="basis-42 flex-shrink-0 relative h-full aspect-9/16"
          v-if="displayType === 'creator'"
        >
          <NuxtImg
            v-if="socialPicture"
            :src="socialPicture"
            class="rounded-4xl object-cover w-full h-full"
          />
          <Skeleton v-else class="rounded-4xl overflow-hidden w-full h-full" />

          <div
            class="absolute inset-0 flex flex-col justify-between items-start p-4 gap-1 z-10"
          >
            <p
              class="py-0.5 px-2 rounded-4xl flex items-center gap-1 max-w-full"
              :class="bgStyles[websiteName as keyof typeof bgStyles]"
            >
              <img
                :src="`/${websiteName}.webp`"
                class="leading-none"
                :class="iconStyles?.[websiteName as keyof typeof iconStyles]"
              />
              <span class="truncate text-[12px] leading-none">
                {{ capitalize(recipe.original_creator_channel_name) }}
              </span>
            </p>
            <a
              class="outline-2 outline-primary text-primary bg-white text-sm font-bold rounded-4xl py-0.5 px-3 flex items-center gap-1 pointer-events-auto"
              :href="recipe.source ?? '#'"
              target="_blank"
              @click.stop
            >
              <span class="material-symbols-outlined !text-lg leading-none">
                play_circle
              </span>
              Watch
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  recipe: RecipeOverview;
  uniqueId?: string;
}>();
const top7Tags = ref(getTop7Tags(props.recipe));
const recipeStore = useRecipeStore();

function getTop7Tags(recipe: RecipeOverview) {
  const tags = recipe.tags.map((tag) => getTagByID(tag));
  tags.sort((a, b) => (b?.value ?? 0) - (a?.value ?? 0));
  const cropped = tags.slice(0, 7);
  return cropped;
}

const cuisines = ref([
  { name: 'italian', icon: '🇮🇹' },
  { name: 'german', icon: '🇩🇪' },
  { name: 'american', icon: '🇺🇸' },
  { name: 'vietnamese', icon: '🇻🇳' },
  { name: 'chinese', icon: '🇨🇳' },
  { name: 'japanese', icon: '🇯🇵' },
  { name: 'french', icon: '🇫🇷' },
  { name: 'british', icon: '🇬🇧' },
  { name: 'indian', icon: '🇮🇳' },
  { name: 'spanish', icon: '🇪🇸' },
  { name: 'middle eastern', icon: '🌍' },
  { name: 'thai', icon: '🇹🇭' },
  { name: 'mediterranean', icon: '🌊' },
  { name: 'greek', icon: '🇬🇷' },
  { name: 'turkish', icon: '🇹🇷' },
  { name: 'korean', icon: '🇰🇷' },
  { name: 'mexican', icon: '🇲🇽' },
]);

const displayType = computed(() => {
  if (
    props.recipe.collection &&
    props.recipe.collection.startsWith('traditional')
  )
    return 'cuisine';
  else if (props.recipe.source_type === 'WEBSITE') return 'website';
  else if (props.recipe.source_type === 'MEDIA') return 'creator';
  else if (props.recipe.user_id) return 'user';
  return null;
});

const websiteName = computed(() => {
  if (!props.recipe.source) return '';
  const url = new URL(props.recipe.source);
  const parts = url.hostname.split('.');
  const domain = parts.length > 2 ? parts[parts.length - 2] : parts[0];
  return domain;
});

const iconStyles = {
  youtube: 'w-4 h-3 my-1',
  tiktok: 'w-5 h-5',
  instagram: 'w-4 h-4 my-0.5',
};
const bgStyles = {
  youtube: 'bg-red-200/90',
  instagram: 'bg-yellow-100/90',
  tiktok: 'bg-gray-200/90',
};

const getCuisineDescription = (collection: string) => {
  if (displayType.value !== 'cuisine') return '';
  const cuisineName = collection.split('-')[1];
  const cuisine = cuisines.value.find(
    (cuisine) => cuisine.name === cuisineName
  );
  return `${cuisine?.icon} ${capitalize(cuisineName)}`;
};

const socialPicture = ref<string | null>(null);
watchEffect(async () => {
  if (props.recipe.source_type === 'MEDIA') {
    socialPicture.value = await recipeStore.getSocialPicture(
      props.recipe.source ?? ''
    );
  }
});
</script>

<style scoped>
.macro-ring {
  --progress: 0%;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: conic-gradient(
    var(--color-primary) var(--progress),
    #ffffff var(--progress)
  );
  display: flex;
  align-items: center;
  justify-content: center;
}

.macro-ring-inner {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
