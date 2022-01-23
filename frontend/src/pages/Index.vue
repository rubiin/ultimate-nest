<template>
  <div class="container max-w-3xl mx-auto mt-60">
    <div class="h-60 mb-8">
      <transition
        enter-active-class="transition ease-out duration-1000 transform"
        enter-from-class="-translate-x-100 opacity-0"
        enter-to-class="translate-x-0 opacity-100"
        leave-active-class="transition ease-in duration-1000 transform"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <img
          v-if="show"
          alt="Vitesome logo"
          class="w-52 mx-auto mb-12"
          :src="'imagotype.svg'"
        />
      </transition>
    </div>

    <HelloWorld :msg="t('hello') + ' 👋 ' + t('welcome')" />

    <footer class="text-center">
      <ul class="flex justify-between w-1/3 mx-auto mb-8">
        <li class="cursor-pointer text-2xl">
          <a
            href="#"
            @click="toggleLocales"
            class="footer-link text-cyan-700 hover:text-cyan-500"
            :title="t('toggle_language')"
          >
            <i class="iconify" :data-icon="'ant-design:translation-outlined'" />
          </a>
        </li>
        <li class="cursor-pointer text-2xl">
          <a
            href="#"
            @click="toggleDark"
            class="text-cyan-700 hover:text-cyan-500"
            :title="t('toggle_theme')"
          >
            <i class="iconify" :data-icon="'mdi:theme-light-dark'" />
          </a>
        </li>
        <li class="cursor-pointer text-2xl">
          <a
            href="https://github.com/rubiin"
            rel="noreferrer"
            target="_blank"
            class="footer-link text-cyan-700 hover:text-cyan-500"
            title="Github repo"
          >
            <i class="iconify" :data-icon="'mdi:github'" />
          </a>
        </li>
      </ul>

      <span class="text-xs"
        >{{ t('made_by') }}
        <a
          class="footer-link text-cyan-400 hover:text-cyan-500"
          href="https://github.com/rubiin"
          rel="noreferrer"
          target="_blank"
          >Rubiin</a
        ></span
      >
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useTheme } from '/@/composables';
const { t, availableLocales, locale } = useI18n();

const toggleLocales = () => {
  const locales = availableLocales;
  locale.value = locales[(locales.indexOf(locale.value) + 1) % locales.length];
};

const { toggleDark } = useTheme();

const show = ref(false);

setTimeout(() => {
  show.value = true;
}, 1000);
</script>

<style>
a,
.footer-link {
  transition: all 5s ease-out;
}
li {
  list-style: none;
}

.footer-link {
  opacity: 0.8;
}
</style>
