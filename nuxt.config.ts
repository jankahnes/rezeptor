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
          href: 'https://fonts.googleapis.com/css2?family=Libertinus+Sans:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&display=swap'
        }
      ]
    }
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
      'animations',
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
    {
      path: '~/animations',
      pathPrefix: false,
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