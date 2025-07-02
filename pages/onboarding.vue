<template>
  <AuthLayout
    title="Complete your profile"
    subtitle="Let's get you started"
    icon="assignment_ind"
  >
    <template #form>
      <div class="space-y-2">
        <label for="name" class="block text-sm font-medium text-gray-700"
          >Name</label
        >
        <input
          id="name"
          v-model="name"
          type="text"
          class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
          placeholder="Enter your name"
          required
        />
        <label for="picture" class="block text-sm font-medium text-gray-700"
          >Profile Picture</label
        >
        <div
          @click="triggerFileInput"
          class="relative cursor-pointer w-full rounded-xl overflow-hidden border-2 border-dashed border-gray-400 bg-gray-100 group hover:border-gray-600 py-2 flex justify-center items-center"
        >
          <span
            v-if="!imageUrl"
            class="material-symbols-outlined text-gray-400 select-none pointer-events-none !text-4xl"
          >
            photo_camera
          </span>

          <Avatar
            v-else
            :user="{ picture_url: imageUrl }"
            alt="Uploaded photo preview"
            class="object-cover w-16 h-16 transition-transform duration-700 group-hover:scale-105"
          />
          <input
            ref="imgUpload"
            id="picture"
            type="file"
            class="hidden w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
            placeholder="Upload your profile picture"
            accept="image/*"
            @change="onFileChange"
          />
        </div>
      </div>
    </template>
  </AuthLayout>
</template>

<script setup lang="ts">
const name = ref('');
const picture = ref('');
const imageUrl = ref('');
const imgUpload = ref<HTMLInputElement | null>(null);

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
