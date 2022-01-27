import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    component: () => import('/@/views/layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('/@/views/pages/Home.vue'),
      },
      {
        path: '/camera',
        component: () => import('/@/views/pages/Home.vue'),
      },
    ],
  },
];

export const Router = createRouter({
  scrollBehavior: () => ({ left: 0, top: 0 }),
  history: createWebHistory(),
  routes,
});
