<template>
  <div>
    <h1>SubCount</h1>
    <div>
      <button type="button" @click="countService.add1">
        SubCount add1 {{ countService.count }}
      </button>
    </div>
    <div>
      <SubSubCount></SubSubCount>
      <SubSubCount></SubSubCount>
    </div>
  </div>
</template>

<script>
import { reactive } from 'vue';
import { useService, declareProviders } from '../../src';
import CountService from '../services/counter.service';

import SubSubCount from './SubSubCount.vue';

export default {
  name: 'SubCount',
  components: {
    SubSubCount,
  },
  setup() {
    declareProviders([CountService]);
    const countService = useService(CountService);
    return {
      countService: reactive(countService),
    };
  },
};
</script>
