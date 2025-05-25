import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as null | Object,
    authListenerSet: false,
    userFetched: false,
  }),
  actions: {
    async fetchProfile() {
      if (!this.user || !this.user.id) {
        return;
      }

      const supabase = useSupabase();
      const { data, error } = await supabase
        .from('profiles')
        .select('picture_url, username')
        .eq('id', this.user.id)
        .single();

      if (error) {
        console.error('Failed to fetch profile:', error);
        return;
      }

      if (data) {
        this.user = { ...this.user, ...data };
      }
    },

    async fetchUser() {
      if (this.userFetched) {
        return;
      }
      const supabase = useSupabase();
      const { data } = await supabase.auth.getUser();
      this.user = data.user;
      this.userFetched = true;
      this.fetchProfile();
    },
    listenToAuthChanges() {
      if (this.authListenerSet) return;

      const supabase = useSupabase();

      supabase.auth.onAuthStateChange((_event, session) => {
        const newUser = session?.user ?? null;

        if (this.user?.id !== newUser?.id) {
          this.user = newUser;
          this.fetchProfile();
        }
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
      this.fetchProfile();
      return { data, error };
    },
    async signUp(email: string, password: string) {
      const supabase = useSupabase();
      console.log('Email:', JSON.stringify(email));
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (data?.user) this.user = data.user;
      this.fetchProfile();
      return { data, error };
    },
    async signOut() {
      const supabase = useSupabase();
      await supabase.auth.signOut();
      this.user = null;
    },
  },
});
