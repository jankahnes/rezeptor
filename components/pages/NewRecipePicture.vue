<template>
  <div class="w-full mt-10 md:px-10 space-y-2">
    <h1 class="text-3xl font-bold text-gray-900">Scan a Recipe</h1>
    <div class="inline-flex flex-col">
      <p class="text-gray-800">
        Take a picture of a handwritten or printed recipe
      </p>
      <p class="text-gray-400 text-sm font-extralight">or</p>
      <p class="text-gray-800">Take a picture of your plate</p>
      <p class="text-gray-400">...and we'll handle the rest!</p>
    </div>
    <div class="space-y-8 mt-2">
      <div class="text-sm text-gray-800">
        <p class="mb-2">📱 <strong>Tips for best results:</strong></p>
        <ul class="list-disc list-inside space-y-1 text-xs">
          <li>Ensure good lighting</li>
          <li>
            For written recipes, include all ingredients and instructions if
            visible and camera steady for sharp focus
          </li>
          <li>
            For pictures of the final dish, capture the whole plate from the top
            down
          </li>
        </ul>
      </div>

      <input
        ref="cameraInput"
        type="file"
        accept="image/*"
        capture="environment"
        @change="handleFileChange"
        class="hidden"
      />

      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        @change="handleFileChange"
        class="hidden"
      />
      <div class="flex gap-4">
        <button
          @click="cameraInput?.click()"
          class="flex-2/3 px-3 py-2 flex items-center justify-center gap-3 text-white bg-primary rounded-lg font-bold hover:bg-primary-dark transition-colors"
        >
          <span class="material-symbols-outlined text-2xl">photo_camera</span>
          <span v-if="!isOnSafari">Take Picture</span>
          <span v-else>Take or choose picture</span>
        </button>
        <button
          v-if="!isOnSafari"
          @click="fileInput?.click()"
          class="flex-1/3 px-3 py-2 flex items-center justify-center gap-3 text-primary border border-primary rounded-lg font-bold hover:bg-primary-dark transition-colors"
        >
          <span class="material-symbols-outlined text-2xl">file_upload</span>
          Upload
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  submit: (file: File) => void;
}>();

const cameraInput = ref<HTMLInputElement>();
const fileInput = ref<HTMLInputElement>();
const selectedFile = ref<File | null>(null);
const processing = ref(false);
const isOnSafari = computed(
  () =>
    /iP(ad|hone|od)/.test(navigator.userAgent) &&
    /Safari/.test(navigator.userAgent) &&
    !/CriOS|FxiOS/.test(navigator.userAgent)
);

const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    selectedFile.value = file;
    await processImage();
  }
};

const processImage = async () => {
  if (!selectedFile.value) return;

  processing.value = true;
  try {
    props.submit(selectedFile.value);
  } finally {
    processing.value = false;
  }
};
</script>

<style scoped></style>
