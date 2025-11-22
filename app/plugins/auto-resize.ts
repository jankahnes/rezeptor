export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('auto-resize', {
    mounted(el: HTMLTextAreaElement) {
      const resize = () => {
        el.style.height = '1px';
        const newHeight = el.scrollHeight;
        el.style.height = newHeight + 'px';
      };
      queueMicrotask(resize);
      el.addEventListener('input', resize);
    },
    updated(el: HTMLTextAreaElement) {
      el.style.height = '1px';
      el.style.height = el.scrollHeight + 'px';
    },
    unmounted(el: HTMLTextAreaElement) {
      el.removeEventListener('input', () => {});
    },
  });
});
