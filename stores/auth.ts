export const useAuthStore = defineStore('auth', () => {
  const user = ref<null | Object>(null);
  const authListenerSet = ref(false);
  const userFetched = ref(false);
  const supabase = useSupabaseClient();

  async function fetchProfile() {
    if (!user.value || !user.value.id) return;
    const profile = expectSingleOrNull(await getUsers(supabase, { eq: { id: user.value.id } }));
    if(profile) user.value = profile;
  }

  async function fetchUser() {
    if (userFetched.value) {
      return;
    }
    const { data } = await supabase.auth.getUser();
    user.value = data.user;
    userFetched.value = true;
  }
  function listenToAuthChanges() {
    if (authListenerSet.value) return;
    supabase.auth.onAuthStateChange((_event, session) => {
      const newUser = session?.user ?? null;
      if (user.value?.id !== newUser?.id) {
        user.value = newUser;
        fetchProfile();
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
    user.value = null;
  }
  return {
    user,
    authListenerSet,
    userFetched,
    fetchProfile,
    fetchUser,
    signIn,
    signUp,
    signOut,
    listenToAuthChanges,
  };
});
