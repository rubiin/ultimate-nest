import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import Unocss from 'unocss/vite';
import presetUno from '@unocss/preset-uno';
import presetIcons from '@unocss/preset-icons';
import VueI18n from '@intlify/vite-plugin-vue-i18n';
import PurgeIcons from 'vite-plugin-purge-icons';
import compress from 'vite-plugin-compress';
import clearConsole from 'vite-plugin-remove-console';
import { ViteWebfontDownload } from 'vite-plugin-webfont-dl';
import ViteVisualizer from 'rollup-plugin-visualizer';
import svgLoader from 'vite-svg-loader';
import path from 'path';

export default defineConfig(({ mode }) => {
  const isDev = mode === 'dev';
  const isReport = mode === 'report';

  let optimizeDeps = {};
  if (isDev) {
    /**
     * DESC:
     * dependency pre-bundling
     */
    optimizeDeps = {
      include: [
        'vue',
        'naive-ui',
        'vue-router',
        'pinia',
        '@vueuse/core',
        'vue-i18n',
      ],
    };
  }

  const plugins = [
    vue(),
    svgLoader(),
    Unocss({
      shortcuts: [
        [
          'btn',
          'px-4 py-1 rounded inline-block bg-teal-600 text-white cursor-pointer hover:bg-teal-700 disabled:cursor-default disabled:bg-gray-600 disabled:opacity-50',
        ],
        [
          'icon-btn',
          'text-[0.9em] inline-block cursor-pointer select-none opacity-75 transition duration-200 ease-in-out hover:opacity-100 hover:text-teal-600',
        ],
      ],
      presets: [
        presetUno(),
        clearConsole(),
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
        '@vueuse/core',
        'pinia',
        'vee-validate',
        'vue-i18n',
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
    ViteWebfontDownload([
      'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap',
      'https://fonts.googleapis.com/css2?family=Fira+Code&display=swap',
    ]),
    // https://github.com/antfu/purge-icons/tree/main/packages/vite-plugin-purge-icons
    PurgeIcons({
      /* PurgeIcons Options */
    }),

    // https://github.com/intlify/vite-plugin-vue-i18n
    VueI18n({
      include: [path.resolve(__dirname, './locales/**')],
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
      port: 4000,
    },
    resolve: {
      alias: {
        '/@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      chunkSizeWarningLimit: 1024,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('/node_modules/')) {
              const modules = [
                'vue',
                'naive-ui',
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
    plugins,
    optimizeDeps,
  };
});
