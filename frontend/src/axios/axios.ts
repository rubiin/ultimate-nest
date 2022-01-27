// axios
import axios, { AxiosRequestConfig } from 'axios';
import { useStorage } from '@vueuse/core';

const instance = axios.create({
  baseURL: `https://jsonkeeper.com/b/MFAQ`,
});

instance.interceptors.request.use((config: AxiosRequestConfig) => {
  const token = useStorage('token', '');
  if (config.headers) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default instance;
