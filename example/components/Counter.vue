<template>
  <div>
    <div class="countNum">{{ counterService.count }}</div>
    <button type="button" @click="counterService.increment">add</button>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import { useService } from '../../src/getServiceInContext';
import CounterService from '../services/counter.service';

export default defineComponent({
  setup() {
    const counterService = useService(CounterService);
    return {
      counterService,
    };
  },
});
</script>
