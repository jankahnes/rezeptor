<template>
  <AuthLayout
    title="Welcome Back"
    subtitle="Sign in to your account to continue"
    icon="person"
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
            placeholder="Enter your username"
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
            placeholder="Enter your password"
            required
          />
        </div>
      </div>

      <button
        @click="signIn"
        :disabled="!username || !password"
        class="w-full button py-3 px-4 !bg-primary hover:!bg-primary/90 !text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
      >
        Sign In
      </button>
    </template>

    <template #google-auth>
      <button
        class="w-full button flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 hover:bg-gray-50 transition-colors"
      >
        <img :src="'/google.svg'" class="w-5 h-5" alt="Google" />
        <span class="font-medium">Sign in with Google</span>
      </button>
    </template>

    <template #footer>
      <p class="text-sm text-gray-600">
        Don't have an account?
        <NuxtLink
          to="/register"
          class="text-primary hover:text-primary/80 font-medium transition-colors"
        >
          Register here
        </NuxtLink>
      </p>
    </template>
  </AuthLayout>
</template>

<script setup lang="ts">
const username = ref('');
const password = ref('');
const auth = useAuthStore();

function signIn() {
  if (!username.value || !password.value) return;

  auth.signIn(username.value, password.value);
  navigateTo('/');
}

function handleGoogleAuth() {
  console.log('Google authentication clicked');
}
</script>

<style scoped></style>
