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
import CountService from './services/counter.service';
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
    const date1 = useService(Date);
    const date11 = useService<CountService>(Date);

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
