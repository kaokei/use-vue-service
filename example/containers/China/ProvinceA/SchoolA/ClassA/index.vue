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
          name="SchoolA Counter"
          :counter="counterService4SchoolA"
          :bgColor="counterTheme4SchoolA"
        ></Counter>
      </div>
      <div class="mt5">
        <Counter
          name="ProvinceA Counter"
          :counter="counterService4ProvinceA"
          :bgColor="counterTheme4ProvinceA"
        ></Counter>
      </div>
      <div class="mt5">
        <Counter
          name="China Counter"
          :counter="counterService4China"
          :bgColor="counterTheme4China"
        ></Counter>
      </div>
      <div class="mt5">
        <Counter
          name="Global Counter"
          :counter="counterService4Global"
          :bgColor="counterTheme4Global"
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
import { reactive, provide, inject, defineComponent } from 'vue';

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
    const counterService4SchoolA = useService(CounterService, { skip: 1 });
    const counterService4ProvinceA = useService(CounterService, { skip: 2 });
    const counterService4China = useService(CounterService, { skip: 3 });
    const counterService4Global = useService(CounterService, { skip: 4 });

    const counterTheme4ClassA = useService(COUNTER_THEME);
    const counterTheme4SchoolA = useService(COUNTER_THEME, { skip: 1 });
    const counterTheme4ProvinceA = useService(COUNTER_THEME, { skip: 2 });
    const counterTheme4China = useService(COUNTER_THEME, { skip: 3 });
    const counterTheme4Global = useService(COUNTER_THEME, { skip: 4 });

    const personService = useService(PersonService);

    console.log('expect personService.check() toBe true :>> ', personService.check());

    return {
      counterService4ClassA,
      counterService4SchoolA,
      counterService4ProvinceA,
      counterService4China,
      counterService4Global,
      counterTheme4ClassA,
      counterTheme4SchoolA,
      counterTheme4ProvinceA,
      counterTheme4China,
      counterTheme4Global,
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
