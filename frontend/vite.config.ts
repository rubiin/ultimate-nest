import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import Unocss from 'unocss/vite';
import presetUno from '@unocss/preset-uno';
import presetIcons from '@unocss/preset-icons';
import VueI18n from '@intlify/vite-plugin-vue-i18n';
import compress from 'vite-plugin-compress';
import ViteFonts from 'vite-plugin-fonts';
import svgLoader from 'vite-svg-loader';
import ViteVisualizer from 'rollup-plugin-visualizer';
import strip from '@rollup/plugin-strip';
import path from 'path';
import autoprefixer from 'autoprefixer';
import combineSelectors from 'postcss-combine-duplicated-selectors';
import { VitePWA } from 'vite-plugin-pwa';
import { quasar, transformAssetUrls } from '@quasar/vite-plugin';

export default defineConfig(({ mode }) => {
  const isDev = mode === 'dev';
  const isReport = mode === 'report';

  // loads environment variables from .env file and exposes them to process.env
  process.env = { ...process.env, ...loadEnv(mode, './env') };

  let optimizeDeps = {};
  if (isDev) {
    /**
     * DESC:
     * dependency pre-bundling
     */
    optimizeDeps = {
      include: [
        'vue',
        'vue-router',
        'pinia',
        'vue-i18n',
        '@vue/shared',
        '@vue/runtime-core',
        '@vueuse/core',
        '@vueuse/head',
      ],
    };
  }

  const plugins = [
    vue({
      template: { transformAssetUrls },
    }),

    quasar({
      sassVariables: 'src/styles/variables.scss',
    }),
    strip(),
    svgLoader(),
    Unocss({
      shortcuts: [
        [
          'btn',
          'px-4 py-1 rounded inline-block bg-teal-600 text-white cursor-pointer no-underline hover:bg-teal-700 disabled:cursor-default disabled:bg-gray-600 disabled:opacity-50',
        ],
        [
          'icon-btn',
          'text-[0.9em] inline-block cursor-pointer select-none opacity-75 transition duration-200 ease-in-out hover:opacity-100 hover:text-teal-600',
        ],
      ],
      presets: [
        presetUno(),
        compress({
          brotli: true,
          verbose: true,
        }),
        presetIcons({
          scale: 1.2,
          extraProperties: {
            display: 'inline-block',
            'vertical-align': 'middle',
          },
        }),
      ],
    }),
    AutoImport({
      include: [
        /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
        /\.vue$/,
        /\.vue\?vue/, // .vue
        /\.md$/, // .md
      ],
      imports: [
        'vue',
        'pinia',
        'vee-validate',
        'vue-router',
        'vue-i18n',
        '@vueuse/core',
        '@vueuse/head',
      ],
    }),
    Components({
      extensions: ['vue'],
      directoryAsNamespace: true,
      globalNamespaces: ['global'],
      importPathTransform: path =>
        path.endsWith('.svg') ? `${path}?component` : undefined,
      include: [/\.vue$/, /\.md$/],
    }),

    ViteFonts({
      google: {
        families: ['Roboto', 'Grand Hotel'],
      },
    }),

    // https://github.com/intlify/vite-plugin-vue-i18n
    VueI18n({
      include: [path.resolve(__dirname, './locales/**')],
    }),
    VitePWA({
      includeAssets: ['logo.svg'],
      manifest: {
        name: 'Vitely',
        short_name: 'Vitely',
        description: 'A progressive web app boilerplate',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ];

  if (isReport) {
    plugins.push(
      /**
       * DESC:
       * visualize bundle
       */
      ViteVisualizer({
        filename: './dist/report.html',
        open: true,
        brotliSize: true,
      }),
    );
  }

  return {
    server: {
      port: +process.env.VITE_APP_PORT || 4000,
    },
    resolve: {
      alias: {
        '/@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      minify: true,
      chunkSizeWarningLimit: 1024,
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('/node_modules/')) {
              const modules = [
                'vue',
                'vee-validate',
                '@vueuse/core',
                'vue-i18n',
                'vue-router',
                'pinia',
              ];
              const chunk = modules.find(module =>
                id.includes(`/node_modules/${module}`),
              );
              return chunk ? `vendor-${chunk}` : 'vendor';
            }
          },
        },
      },
    },
    css: {
      postcss: {
        plugins: [autoprefixer(), combineSelectors()],
      },
    },
    base: process.env.VITE_APP_BASE,
    plugins,
    optimizeDeps,
  };
});
