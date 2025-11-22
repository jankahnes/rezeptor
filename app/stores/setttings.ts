export const useSettingsStore = defineStore('settings', () => {
    const settings = ref({
        useAltRecipeCard: false,
    });

    return {
        settings,
    };
});