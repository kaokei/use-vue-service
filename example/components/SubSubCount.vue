<template>
  <div>
    <h1>SubSubCount</h1>
    <div>
      <button type="button" @click="countService.add1">
        SubSubCount add1 {{ countService.count }}
      </button>
    </div>
  </div>
</template>

<script>
import { reactive } from 'vue';
import { useService, declareProviders } from '../../src';
import CountService from '../services/counter.service';
export default {
  name: 'SubSubCount',
  setup() {
    const countService = useService(CountService);
    return {
      countService: reactive(countService),
    };
  },
};
</script>
