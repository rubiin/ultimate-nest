import { defineStore } from 'pinia';
import axios from 'axios';

export type Post = {
  id: number;
  file: string;
  date: string;
  location: string;
  caption: string;
};

export const usePostStore = defineStore('posts', {
  state: () => ({
    posts: [] as Post[],
  }),

  getters: {
    postsGetter(state) {
      return state.posts;
    },
  },

  actions: {
    async getPosts() {
      try {
        console.log('getPosts');
        const response = await axios.get('http://localhost:3000/posts', {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        this.posts = response.data;
      } catch (error) {
        return error;
      }
    },
  },
});
