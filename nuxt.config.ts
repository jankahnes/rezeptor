import tailwindcss from '@tailwindcss/vite';
import svgLoader from 'vite-svg-loader';

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      link: [
        {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com'
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: ''
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Libertinus+Sans:ital,wght@0,400;0,700;1,400&display=swap'
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap'
        }
      ]
    },
    pageTransition: false
  },
  vite: {
    plugins: [tailwindcss(), svgLoader()],
  },
  devtools: {
    enabled: false,
  },
  runtimeConfig: {
    gptKey: process.env.NUXT_PRIVATE_GPT_KEY,
  },
  imports: {
    dirs: [
      'types',
      'utils/db',
      'utils/gpt',
      'utils/format',
      'utils/calculation',
      'utils/db/getters',
      'utils/helpers',
      'utils/db/setters',
      'utils/types',
      'utils/calculation',
      'utils/directives',
      'utils/constants',
      'utils/format/toHumanReadable',
    ],
  },
  components: [
    {
      path: '~/components',
      pathPrefix: true,
    },
  ],
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/supabase',
    '@nuxt/image',
  ],
  supabase: {
    url: process.env.NUXT_PUBLIC_SUPABASE_URL,
    key: process.env.NUXT_PUBLIC_SUPABASE_KEY,
    redirect: false,
  },
});