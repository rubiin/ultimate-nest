<template>
  <q-layout view="lHh Lpr lFf">
    <q-header bordered class="bg-white text-grey-10">
      <q-toolbar class="constrain">
        <q-btn
          to="/camera"
          class="large-screen-only"
          flat
          round
          icon="eva-camera-outline"
          size="18px;"
        />
        <q-separator class="large-screen-only" spaced="12px;" vertical />
        <q-toolbar-title class="text-grand-hotel text-bold">
          InstantGram
        </q-toolbar-title>
        <q-btn
          to="/"
          class="large-screen-only"
          flat
          round
          icon="eva-home-outline"
          size="18px;"
        />
      </q-toolbar>
    </q-header>
    <q-footer bordered class="bg-white small-screen-only">
      <q-tabs
        indicator-color="transparent"
        active-color="primary"
        class="text-grey-10"
      >
        <q-route-tab to="/" icon="eva-home-outline" label="Home" />
        <q-route-tab to="/camera" icon="eva-camera-outline" label="Camera" />
      </q-tabs>
    </q-footer>
    <q-page-container class="bg-grey-1">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
</script>

<style lang="scss">
.q-toolbar__title {
  font-size: 30px;
  @media (max-width: $breakpoint-xs-max) {
    text-align: center;
  }
}
.q-footer {
  .q-tab__icon {
    font-size: 30px;
  }
}

.q-toolbar {
  @media (min-width: $breakpoint-sm-min) {
    height: 65px;
  }
}
</style>