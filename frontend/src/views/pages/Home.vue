<template>
  <q-page class="constrain q-pa-md">
    <div class="row q-col-gutter-lg">
      <div class="col-12 col-sm-8">
        <q-card
          v-for="post in posts"
          :key="post.id"
          class="card-post q-mb-md"
          flat
          bordered
        >
          <q-item>
            <q-item-section avatar>
              <q-avatar>
                <img
                  src="https://images7.alphacoders.com/457/thumb-1920-457534.jpg"
                />
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-bold">Lucas</q-item-label>
              <q-item-label caption>
                {{ post.location }}
              </q-item-label>
            </q-item-section>
          </q-item>

          <q-separator />
          <q-img :src="post.file" basic> </q-img>
          <q-card-section>
            <div class="flex w-full mb-5">
              <q-icon name="eva-heart-outline" size="sm" />
              <q-icon
                name="eva-message-circle-outline"
                size="sm"
                class="pl-5"
              />
            </div>
            <div>{{ post.caption }}</div>
            <div class="text-caption text-grey">Tuesday</div>
          </q-card-section>
          <q-card-section>
            <q-input borderless v-model="text" />
             </q-card-section>
        </q-card>
      </div>
      <div class="col-4 large-screen-only">
        <q-item>
          <q-item-section avatar>
            <q-avatar>
              <img
                src="https://images7.alphacoders.com/457/thumb-1920-457534.jpg"
              />
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label class="text-bold">Lucas</q-item-label>
            <q-item-label caption> Rodriguez Lucas </q-item-label>
          </q-item-section>
        </q-item>
      </div>
    </div>
  </q-page>
</template>


<script setup lang="ts">
import { usePostStore } from '/@/stores/posts';
const user = usePostStore();

const posts = computed(() => user.postsGetter);

const text = ref('');

async function getAll() {
  try {
    await user.getPosts();
    console.log('posts', user.postsGetter);
  } catch (error) {}
}

onMounted(() => {
  getAll();
});
</script>


<style lang="scss" scoped>
.card-post {
  .q-img {
    min-height: 200px;
  }
}
</style>