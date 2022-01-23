import { useStorage } from '@vueuse/core';
import {} from 'vue-router';
import { IRoute } from '../interface/router';

export const auth = (to: IRoute, from: IRoute, next: Function) => {
  const token = useStorage('accessToken', null);
  const publicPages = [
    '/login',
    '/forgot-password',
    '/verify-email/' + to.params.token,
    '/reset-password/' + to.params.token,
    '/pages/error-419',
    '/admin/login',
    '/success',
  ];
  const authRequired = !publicPages.includes(to.path);

  if (to.path === '/login') {
    if (token) {
      return next('dashboard');
    }
  }

  if (!authRequired && token) {
    return next('/login');
    // }
  }

  if (authRequired && !token && to.name !== 'user-reset-password') {
    if (from.path !== '/admin/login') {
      return next('/login');
    }
  }

  return next();
};
