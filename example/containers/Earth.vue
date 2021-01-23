<template>
  <div class="container">
    <h4>Earth</h4>
    <div>
      <div>
        <Counter name="Earth Counter" :counter="counterService"></Counter>
      </div>
      <div class="mt5">
        <Countdown name="Earth Countdown" :minus="10" :add="10"></Countdown>
      </div>
    </div>
    <div>
      <China></China>
    </div>
  </div>
</template>

<script lang="ts">
import { reactive, defineComponent } from 'vue';

import { useService, declareProviders } from '@src/index';

import CounterService from '@services/counter.service';
import CountdownService from '@services/countdown.service';
import { COUNTDOWN_THEME } from '@services/service.context';

import Counter from '@components/Counter.vue';
import Countdown from '@components/Countdown.vue';

import China from './China/index.vue';

export default defineComponent({
  name: 'Earth',
  components: {
    Counter,
    Countdown,
    China,
  },
  setup() {
    declareProviders([
      {
        provide: COUNTDOWN_THEME,
        useValue: '#5cdbd3',
      },
      CountdownService,
    ]);
    const counterService = useService(CounterService);
    return {
      counterService,
    };
  },
});
</script>
