<template>
  <div class="sm:mx-10 mb-10">
    <div class="max-w-200 mt-5 mx-auto text-center">
      <p class="text-red-500" v-if="error">
        {{ error }}
      </p>
      <div v-else>
        <h1>Account Settings</h1>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const error = ref<string | null>(null);
const auth = useAuthStore();

if (!auth.user) {
  error.value = 'You must be logged in to view this page';
}

watchEffect(() => {
  if (!auth.user) {
    error.value = 'You must be logged in to view this page';
  } else {
    error.value = null;
  }
});
</script>

<style scoped></style>
