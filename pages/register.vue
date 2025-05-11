  <template>
  <div
    class="mx-auto mt-20 sm:w-[500px] sm:border-2 sm:shadow-[4px_4px_0_0_rgba(0,0,0,1)] flex flex-col items-center p-10"
  >
    <h1 class="text-3xl font-bold">Register</h1>
    <div class="flex w-80 border gap-2 pl-2 mt-4 items-center">
      <span class="select-none material-symbols-outlined"> person </span
      ><input class="py-2 flex-grow focus:outline-none" placeholder="Username" />
    </div>
    <div class="flex w-80 border gap-2 pl-2 mt-1 items-center">
      <span class="select-none material-symbols-outlined"> key </span
      ><input class="py-2 flex-grow focus:outline-none" placeholder="Password" />
    </div>
    <span class="text-sm font-light my-2">OR</span>
    <button class="flex w-80 border p-2 gap-10">
      <img src="/google.svg" class="w-6 h-6"></img
      ><span>Register with Google</span>
    </button>
    <span class="text-sm font-light my-2">OR</span>
    <div class="flex w-80 border gap-2 pl-2 items-center mb-10">
      <span class="material-symbols-outlined"> crowdsource </span
      ><input class="py-2 flex-grow focus:outline-none" placeholder="Create a Public Account" />
    </div>
  </div>
</template>


<script setup lang="ts"></script>

<style scoped></style>
