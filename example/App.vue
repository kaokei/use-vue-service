<template>
  <div>
    <img alt="Vue logo" src="./assets/logo.png" />
    <div>
      <button type="button" @click="countService.add1">
        count add1 {{ countService.count }}
      </button>
      <button type="button" @click="countService.add1">
        count add1 {{ countService.count }}
      </button>
    </div>
    <div>
      <Main></Main>
    </div>
  </div>
</template>

<script lang="ts">
import Main from './components/Main.vue';
import CountService from './services/count.service';
import LoggerService from './services/logger.service';

import { reactive, defineComponent } from 'vue';
import { useService, declareProviders } from '../src';

export default defineComponent({
  name: 'App',
  components: {
    Main,
  },
  mounted() {
    console.log('mounted :>> ');
  },
  setup() {
    console.log('1----------------- :>> ');
    const number123 = useService(123);
    const string123 = useService<string>(123);
    const string456 = useService('456');
    const number456 = useService<number>('4561');

    const date1 = useService(Date);
    const date11 = useService<CountService>(Date);
    const date2 = useService(new Date());
    const map1 = useService(new Map<string, number>());

    const countService = useService(CountService);

    const [countService1, loggerService1] = useService([CountService, LoggerService]);
    console.log('2----------------- :>> ');
    console.log('countService :>> ', countService);
    return {
      countService: reactive(countService),
    };
  },
});
</script>
