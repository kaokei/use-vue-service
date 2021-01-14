<template>
  <div>
    <h1>Main</h1>
    <div>
      <button type="button" @click="countService.add1">
        main add1 {{ countService.count }}
      </button>
    </div>
    <div>
      <SubCount></SubCount>
    </div>
  </div>
</template>

<script>
import { reactive } from 'vue';

import { useService } from '@src/index';

import CountService from '@services/counter.service';

import SubCount from './SubCount.vue';

export default {
  name: 'Main',
  components: {
    SubCount,
  },
  setup() {
    const countService = useService(CountService);
    return {
      countService: reactive(countService),
    };
  },
};
</script>
