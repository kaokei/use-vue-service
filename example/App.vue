<template>
  <div>
    <div>
      <div>
        <Counter name="Global Counter" :counter="counterService"></Counter>
      </div>
      <div class="mt5">
        <Countdown name="Global Countdown" :minus="10" :add="10"></Countdown>
      </div>
    </div>
    <div>
      <Earth></Earth>
    </div>
    <div class="switch-box">
      <h4>These areas with same background color have same service instance.</h4>
      <div>
        <button type="button" @click="switchService.toggleCounterStatus">
          {{ switchService.counterStatus === 1 ? 'hide' : 'show' }} counter background
        </button>
      </div>
      <div class="mt5">
        <button type="button" @click="switchService.toggleCountdownStatus">
          {{ switchService.countdownStatus === 1 ? 'hide' : 'show' }} countdown background
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { reactive, defineComponent } from 'vue';

import { useService, declareProviders } from '@src/index';

import CounterService from '@services/counter.service';
import SwitchService from '@services/switch.service';
import { COUNTER_THEME, COUNTDOWN_THEME } from '@services/service.context';

import Counter from '@components/Counter.vue';
import Countdown from '@components/Countdown.vue';

import Earth from '@containers/Earth.vue';

export default defineComponent({
  name: 'App',
  components: {
    Counter,
    Countdown,
    Earth,
  },
  setup() {
    declareProviders([
      {
        provide: COUNTER_THEME,
        useValue: '#69c0ff',
      },
      {
        provide: COUNTDOWN_THEME,
        useValue: '#69c0ff',
      },
    ]);
    const counterService = useService(CounterService);
    const switchService = useService(SwitchService);
    return {
      counterService,
      switchService,
    };
  },
});
</script>

<style lang="css" scoped>
.switch-box {
  background: #fff1b8;
  position: fixed;
  left: 10px;
  top: 10px;
  text-align: left;
  padding: 20px;
}
</style>
