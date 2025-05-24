import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as null | Object,
    authListenerSet: false,
    userFetched: false,
  }),
  actions: {
    async fetchUser() {
      if (this.userFetched) {
        return;
      }
      const supabase = useSupabase();
      const { data } = await supabase.auth.getUser();
      this.user = data.user;
      this.userFetched = true;
    },
    listenToAuthChanges() {
      if (this.authListenerSet) return;
      const supabase = useSupabase();
      supabase.auth.onAuthStateChange((_event, session) => {
        this.user = session?.user ?? null;
      });
      this.authListenerSet = true;
    },
    async signIn(email: string, password: string) {
      const supabase = useSupabase();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (data?.user) this.user = data.user;
      return { data, error };
    },
    async signUp(email: string, password: string) {
      const supabase = useSupabase();
      console.log('Email:', JSON.stringify(email));
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (data?.user) this.user = data.user;
      return { data, error };
    },
    async signOut() {
      const supabase = useSupabase();
      await supabase.auth.signOut();
      this.user = null;
    },
  },
});
