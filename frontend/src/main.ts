import { createApp } from 'vue';
import App from './App.vue';
import { createI18n } from 'vue-i18n';

import './styles/base.scss';

import { createPinia } from 'pinia';

import axios from './axios/axios';

import { Quasar } from 'quasar';

// Import Quasar css
import 'quasar/src/css/index.sass';

import '@quasar/extras/eva-icons/eva-icons.css';
import iconSet from 'quasar/icon-set/eva-icons';

// Router
import { Router } from '/@/router';

// i18n
import messages from '@intlify/vite-plugin-vue-i18n/messages';

import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

import 'uno.css';

const app = createApp(App);

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

//
const i18n = createI18n({
  locale: 'en',
  messages,
});

app.config.globalProperties.$http = axios;

app.use(i18n);

app.use(pinia);

app.use(Router);

app.use(Quasar, {
  plugins: {}, // import Quasar plugins and add here,
  iconSet,
});

app.mount('#app');
