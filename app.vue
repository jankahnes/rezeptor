<template>
  <link
    href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Merriweather:ital,opsz,wght@0,18..144,300..900;1,18..144,300..900&display=swap"
    rel="stylesheet"
  />

  <div class="bg-main font-main">
    <NavbarsTop />
    <div
      class="pt-18 xm:pt-22 pb-18 xm:pb-0 w-[clamp(75vw,1550px,100%)] mx-auto min-h-[calc(100svh_-_144px)] xm:min-h-[calc(100svh_-_88px)]"
    >
      <GlobalLoadingIndicator />
      <NuxtPage />
    </div>
    <NavbarsBottom class="block xm:hidden" />
  </div>
</template>

<script setup>
const auth = useAuthStore();
const loadingStore = useLoadingStore();
onBeforeMount(() => {
  auth.fetchUser();
  auth.listenToAuthChanges();
});
</script>

<style>
.button {
  position: relative;
  z-index: 0;
  border-radius: 10px;
  transition: all 0.2s ease;
  overflow: hidden;
}

.button::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1;
  background: white;
  opacity: 0;
  mix-blend-mode: soft-light;
  pointer-events: none;
  transition: opacity 0.2s ease;
  border-radius: inherit;
}

.button:hover::after {
  opacity: 0.7;
}

.hover-shine {
  position: relative;
  z-index: 0;
  transition: all 0.5s ease;
}

.hover-shine:hover {
  filter: brightness(101%);
}

.hover-shine::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1;
  background: white;
  opacity: 0;
  mix-blend-mode: soft-light;
  pointer-events: none;
  transition: opacity 0.2s ease;
  border-radius: inherit;
}

.hover-shine:hover::after {
  opacity: 0.7;
}

.button:active {
  filter: brightness(95%);
  transform: scale(0.99);
}

.button:disabled {
  background-color: #94a3b8;
  opacity: 0.7;
}

.metallic-gradient {
  background: linear-gradient(
    30deg,
    #f0efef 0%,
    #fcfafa 10%,
    #f0efef 20%,
    #fcfafa 50%,
    #f5eeee 100%
  );
}

.golden-gradient {
  background: linear-gradient(
    45deg,
    #b78e00 5%,
    #e0b400 15%,
    #ffdd55 40%,
    #fff289 50%,
    #ffdd55 60%,
    #e0b400 85%,
    #b78e00 95%
  );
}

.platinum-gradient {
  background: linear-gradient(
    45deg,
    #ccc 15%,
    #f2f2f2 40%,
    #fff 50%,
    #f2f2f2 60%,
    #ccc 85%,
    #fff 100%
  );
}

.bronze-gradient {
  background: linear-gradient(
    45deg,
    #6a3e2b 5%,
    #a56f4f 15%,
    #d39c77 40%,
    #f1cfae 50%,
    #d39c77 60%,
    #a56f4f 85%,
    #6a3e2b 95%
  );
}
</style>
