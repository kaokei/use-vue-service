<template>
  <div>
    <div>
      <Counter name="Global Counter" :counter="counterService"></Counter>
    </div>
    <div>
      <Earth></Earth>
    </div>
  </div>
</template>

<script lang="ts">
import { reactive, defineComponent } from 'vue';

import { useService, declareProviders } from '@src/index';

import CounterService from '@services/counter.service';
import { COUNTER_THEME } from '@services/service.context';

import Counter from '@components/Counter.vue';
import Countdown from '@components/Countdown.vue';

import Earth from '@containers/Earth.vue';

export default defineComponent({
  name: 'App',
  components: {
    Counter,
    Earth,
  },
  mounted() {
    console.log('mounted :>> ');
  },
  setup() {
    declareProviders([
      {
        provide: COUNTER_THEME,
        useValue: '#69c0ff',
      },
    ]);
    const counterService = useService(CounterService);
    return {
      counterService,
    };
  },
});
</script>
