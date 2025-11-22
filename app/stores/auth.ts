export const useAuthStore = defineStore('auth', () => {
  const user = ref<FullUser | null>(null);
  const authListenerSet = ref(false);
  const userFetched = ref(false);
  const profileFetched = ref(false);
  const supabase = useSupabaseClient<Database>();
  const shoppingList = ref<ShoppingListItem[]>([]);
  const shoppingListOpen = ref(false);
  const lastSyncTimestamp = ref(0);
  const SYNC_DEBOUNCE_MS = 2000;

  async function fetchProfile() {
    if (!user.value || !user.value.id) return;
    const profile = expectSingleOrNull(
      await getUsers(supabase, { eq: { id: user.value.id } })
    );
    if (profile) {
      Object.assign(user.value, profile);
      // Load shopping list from profile
      if (profile.shopping_list) {
        shoppingList.value = profile.shopping_list as ShoppingListItem[];
      }
    }
    profileFetched.value = true;
  }

  async function fetchUser() {
    if (userFetched.value) {
      return;
    }

    const { data } = await supabase.auth.getUser();

    if (data.user) {
      user.value = data.user;
    } else {
      const { data: anonData, error } = await supabase.auth.signInAnonymously();
      if (error) {
        console.error('Failed to sign in anonymously:', error);
      }
      if (anonData.user) {
        user.value = anonData.user;
      }
    }

    userFetched.value = true;
  }

  function listenToProfileChanges() {
    if (!user.value?.id) return;

    supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.value.id}`,
        },
        (payload) => {
          // Ignore updates shortly after we synced (likely our own echo)
          const timeSinceSync = Date.now() - lastSyncTimestamp.value;
          if (timeSinceSync < SYNC_DEBOUNCE_MS) {
            return; // Skip this update
          }

          // Apply external changes
          Object.assign(user.value, payload.new);
          if (payload.new.shopping_list) {
            shoppingList.value = payload.new.shopping_list;
          }
        }
      )
      .subscribe();
  }

  function listenToAuthChanges() {
    if (authListenerSet.value) return;
    supabase.auth.onAuthStateChange(async (_event, session) => {
      const newUser = session?.user ?? null;
      if (user.value?.id !== newUser?.id) {
        if (newUser) {
          user.value = newUser;
          fetchProfile();
          listenToProfileChanges();
        } else {
          const { data: anonData, error } =
            await supabase.auth.signInAnonymously();
          if (error) {
            console.error('Failed to sign in anonymously:', error);
          }
          if (anonData.user) {
            user.value = anonData.user;
            fetchProfile();
            listenToProfileChanges();
          }
        }
      }
    });

    authListenerSet.value = true;
  }

  async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (data?.user) user.value = data.user;
    return { data, error };
  }

  async function signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (data?.user) user.value = data.user;
    return { data, error };
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  function isUser() {
    return user.value && !user.value.is_anonymous && user.value.username;
  }

  async function syncShoppingList() {
    if (!user.value?.id) return;
    lastSyncTimestamp.value = Date.now();
    const { error } = await supabase
      .from('profiles')
      .update({ shopping_list: shoppingList.value })
      .eq('id', user.value.id);

    if (error) console.error('Failed to sync shopping list:', error);
  }

  async function addToShoppingList(
    ingredients: any[],
    recipeId: number,
    servingSize: number
  ) {
    if (!ingredients || ingredients.length === 0) return;
    for (const ingredient of ingredients) {
      const amount = ingredient.amount * servingSize;
      const existingIndex = shoppingList.value.findIndex(
        (item) => item.ingredientId === ingredient.id
      );

      if (existingIndex !== -1) {
        // Aggregate: convert to grams if units differ
        const existing = shoppingList.value[existingIndex];
        const existingGrams = convertToGrams(
          existing.amount,
          existing.unit,
          ingredient.density || 1,
          ingredient.countable_units[existing.unit] || 0
        );
        const newGrams = convertToGrams(
          amount || 0,
          ingredient.unit ?? 'G',
          ingredient.density || 1,
          ingredient.countable_units[ingredient.unit] || 0
        );

        existing.amount = existingGrams + newGrams;
        existing.unit = 'G';
        if (!existing.recipeIds.includes(recipeId)) {
          existing.recipeIds.push(recipeId);
        }
      } else {
        // Add new item
        shoppingList.value.push({
          ingredientId: ingredient.id,
          name: ingredient.name,
          amount: amount || 0,
          unit: ingredient.unit ?? 'G',
          aisle: ingredient.aisle || null,
          price: ingredient.price || null,
          recipeIds: [recipeId],
          addedAt: Date.now(),
          unit_weight: ingredient.countable_units?.[ingredient.unit] || 0,
          density: ingredient.density || 1,
        });
      }
    }
    shoppingListOpen.value = true;
    await syncShoppingList();
  }

  async function removeFromShoppingList(ingredientId: number) {
    shoppingList.value = shoppingList.value.filter(
      (item) => item.ingredientId !== ingredientId
    );
    if (shoppingList.value.length === 0) {
      shoppingListOpen.value = false;
    }
    await syncShoppingList();
  }

  async function clearShoppingList() {
    shoppingListOpen.value = false;
    shoppingList.value = [];
    await syncShoppingList();
  }

  return {
    user,
    authListenerSet,
    userFetched,
    shoppingList,
    profileFetched,
    fetchProfile,
    fetchUser,
    signIn,
    signUp,
    signOut,
    listenToAuthChanges,
    isUser,
    addToShoppingList,
    removeFromShoppingList,
    clearShoppingList,
    syncShoppingList,
    shoppingListOpen,
  };
});
