<template>
  <div class="container">
    <h4>ClassA</h4>
    <div>
      <div>
        <Counter
          name="ClassA Counter"
          :counter="counterService4ClassA"
          :bgColor="counterTheme4ClassA"
        ></Counter>
      </div>
      <div class="mt5">
        <Counter
          name="SchoolA Counter @SkipSelf"
          :counter="counterService4SchoolA"
          :bgColor="counterTheme4SchoolA"
        ></Counter>
      </div>
      <div class="mt5">
        <PersonComp name="Local Person Counter"></PersonComp>
      </div>
      <div class="mt5">
        <Countdown name="ClassA Countdown" :minus="10" :add="10"></Countdown>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { useService, declareProviders } from '@src/index';

import CounterService from '@services/counter.service';
import PersonService from '@services/person.service';

import { COUNTER_THEME } from '@services/service.context';

import Counter from '@components/Counter.vue';
import Countdown from '@components/Countdown.vue';
import PersonComp from '@components/Person.vue';

export default defineComponent({
  name: 'ClassA',
  components: {
    Counter,
    Countdown,
    PersonComp,
  },
  setup() {
    declareProviders([
      {
        provide: COUNTER_THEME,
        useValue: '#ff7875',
      },
      CounterService,
      PersonService,
    ]);
    const counterService4ClassA = useService(CounterService);
    const counterService4SchoolA = useService(CounterService, {
      skipSelf: true,
    });

    const counterTheme4ClassA = useService(COUNTER_THEME);
    const counterTheme4SchoolA = useService(COUNTER_THEME, { skipSelf: true });

    const personService = useService(PersonService);

    console.log(
      'expect personService.check() toBe true :>> ',
      personService.check()
    );

    return {
      counterService4ClassA,
      counterService4SchoolA,
      counterTheme4ClassA,
      counterTheme4SchoolA,
      personService,
    };
  },
});
</script>

<style lang="css" scoped>
.container {
  margin: 0 auto;
}
</style>
