<template>
  <AuthLayout
    title="Create Account"
    subtitle="Join us and start your culinary journey"
    icon="person_add"
  >
    <template #form>
      <div class="space-y-2">
        <label for="username" class="block text-sm font-medium text-gray-700"
          >Username</label
        >
        <div class="relative">
          <div
            class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
          >
            <span class="material-symbols-outlined text-gray-400 text-lg"
              >person</span
            >
          </div>
          <input
            id="username"
            v-model="username"
            type="text"
            class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
            placeholder="Choose a username"
            required
          />
        </div>
      </div>

      <div class="space-y-2">
        <label for="password" class="block text-sm font-medium text-gray-700"
          >Password</label
        >
        <div class="relative">
          <div
            class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
          >
            <span class="material-symbols-outlined text-gray-400 text-lg"
              >lock</span
            >
          </div>
          <input
            id="password"
            v-model="password"
            type="password"
            class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
            placeholder="Create a password"
            required
          />
        </div>
      </div>

      <div class="space-y-2">
        <label
          for="confirm-password"
          class="block text-sm font-medium text-gray-700"
          >Confirm Password</label
        >
        <div class="relative">
          <div
            class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
          >
            <span class="material-symbols-outlined text-gray-400 text-lg"
              >lock</span
            >
          </div>
          <input
            id="confirm-password"
            v-model="confirmPassword"
            type="password"
            class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
            :class="{
              'border-red-500': confirmPassword && password !== confirmPassword,
            }"
            placeholder="Confirm your password"
            required
          />
        </div>
        <p
          v-if="confirmPassword && password !== confirmPassword"
          class="text-sm text-red-500"
        >
          Passwords do not match
        </p>
      </div>

      <button
        @click="register"
        :disabled="!canRegister"
        class="w-full button py-3 px-4 !bg-primary hover:!bg-primary/90 !text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Create Account
      </button>
    </template>

    <template #google-auth>
      <button
        class="w-full button flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 hover:bg-gray-50 transition-colors"
      >
        <img :src="'/google.webp'" class="w-5 h-5" alt="Google" />
        <span class="font-medium">Sign up with Google</span>
      </button>
    </template>

    <template #footer>
      <p class="text-sm text-gray-600">
        Already have an account?
        <NuxtLink
          to="/login"
          class="text-primary hover:text-primary/80 font-medium transition-colors"
        >
          Sign in here
        </NuxtLink>
      </p>
    </template>
  </AuthLayout>
</template>

<script setup lang="ts">
const username = ref('');
const password = ref('');
const confirmPassword = ref('');
const acceptTerms = ref(false);
const auth = useAuthStore();

const canRegister = computed(() => {
  return (
    username.value &&
    password.value &&
    confirmPassword.value &&
    password.value === confirmPassword.value
  );
});

function register() {
  if (!canRegister.value) return;

  auth.signUp(username.value, password.value);
  navigateTo('/');
}

function handleGoogleAuth() {
  console.log('Google authentication clicked');
}
</script>

<style scoped></style>
