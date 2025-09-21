<template>
  <div class="w-full mt-10 md:px-10">
    <h1 class="text-3xl font-bold text-gray-900">Scan a Recipe</h1>
    <p class="text-gray-600">
      Take a picture of a handwritten or printed recipe and we'll extract it for
      you.
    </p>

    <div class="flex gap-4 flex-col md:flex-row mt-6">
      <div class="flex-1">
        <div class="text-sm text-gray-600 mb-4">
          <p class="mb-2">📱 <strong>Tips for best results:</strong></p>
          <ul class="list-disc list-inside space-y-1 text-xs">
            <li>Ensure good lighting and clear text</li>
            <li>Include all ingredients and instructions if visible</li>
            <li>Avoid shadows and glare</li>
            <li>Hold camera steady for sharp focus</li>
          </ul>
        </div>

        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          capture="environment"
          @change="handleFileChange"
          class="hidden"
        />

        <button
          @click="triggerCamera"
          class="w-full px-6 py-4 flex items-center justify-center gap-3 text-white bg-primary rounded-lg font-bold hover:bg-primary-dark transition-colors"
        >
          <span class="material-symbols-outlined text-2xl">photo_camera</span>
          Take Picture
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  submit: (file: File) => void;
}>();

const fileInput = ref<HTMLInputElement>();
const selectedFile = ref<File | null>(null);
const processing = ref(false);

const triggerCamera = () => {
  fileInput.value?.click();
};

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
