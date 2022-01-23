import { defineStore } from 'pinia';

export const useStore = defineStore('main', {
  state: () => {
    return {
      someState: 'hello pinia',
    };
  },
  persist: true,
});
