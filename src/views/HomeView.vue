<template>
  <div>
    <the-board :data="data"></the-board>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import TheBoard from '../components/TheBoard.vue';
import { data } from '@/assets/data';
import type { Data } from '../types';

export default defineComponent({
  name: "HomeView",
  components: {
    TheBoard
  },
  data() {
    return {
      data: data as Data[] 
    }
  },
});
</script>
