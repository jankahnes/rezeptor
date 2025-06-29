  <template>
    <div class="pt-20">
  <div
    class="mx-auto sm:w-[500px] sm:border-2 sm:shadow-[4px_4px_0_0_rgba(0,0,0,1)] flex flex-col items-center p-10"
  >
    <h1 class="text-3xl font-bold">Register</h1>
    <div class="flex w-80 border gap-2 pl-2 mt-4 items-center">
      <span class="select-none material-symbols-outlined"> person </span
      ><input v-model="username" class="py-2 flex-grow focus:outline-none" placeholder="Username" />
    </div>
    <div class="flex w-80 border gap-2 pl-2 mt-1 items-center">
      <span class="select-none material-symbols-outlined"> key </span
      ><input v-model="password" type="password" class="py-2 flex-grow focus:outline-none" placeholder="Password" />
    </div><button class="flex w-80 border-3 border-double p-2 gap-2 mt-1" @click="register">
      <span>Register</span>
    </button>
    <span class="text-sm font-light my-2">OR</span>
    <button class="flex w-80 border p-2 gap-2">
      <img src="/google.svg" class="w-6 h-6"></img
      ><span>Register with Google</span>
    </button>
    <span class="text-sm font-light my-2">OR</span>
    <div class="flex w-80 border gap-2 pl-2 items-center mb-10">
      <span class="material-symbols-outlined"> crowdsource </span
      ><input class="py-2 flex-grow focus:outline-none" placeholder="Create a Public Account" />
    </div>
    <p class="text-sm font-light" >Already have an account?</p>
    <NuxtLink class="text-sm underline font-light" to="/login">Log In instead</NuxtLink>
  </div></div>
</template>


<script setup lang="ts">
const username = ref("")
const password = ref("")
const auth = useAuthStore()

function register() {
  auth.signUp(username.value, password.value)
  navigateTo('/')
}
</script>

<style scoped></style>
