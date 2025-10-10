export const useAuthStore = defineStore('auth', () => {
  const user = ref<FullUser | null>(null);
  const authListenerSet = ref(false);
  const userFetched = ref(false);
  const supabase = useSupabaseClient();

  async function fetchProfile() {
    if (!user.value || !user.value.id) return;
    const profile = expectSingleOrNull(await getUsers(supabase, { eq: { id: user.value.id } }));
    if(profile) Object.assign(user.value, profile);
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

  function listenToAuthChanges() {
    if (authListenerSet.value) return;
    supabase.auth.onAuthStateChange(async (_event, session) => {
      const newUser = session?.user ?? null;
      if (user.value?.id !== newUser?.id) {
        if (newUser) {
          user.value = newUser;
          fetchProfile();
        } else {
          const { data: anonData, error } = await supabase.auth.signInAnonymously();
          if (error) {
            console.error('Failed to sign in anonymously:', error);
          }
          if (anonData.user) {
            user.value = anonData.user;
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
    isUser,
  };
});