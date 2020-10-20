<template>
  <div>
    <img alt="Vue logo" src="./assets/logo.png" />
    <div>
      <button type="button" @click="countService.add1">count add1 {{countService.count}}</button>
      <button type="button" @click="countService.add1">count add1 {{countService.count}}</button>
    </div>
    <div>
        <Main></Main>
    </div>
  </div>
</template>

<script>
import Main from './components/Main.vue'
import CountService from "./services/count.service";

import {reactive} from 'vue'
import { useService, declareProviders } from "../src";

export default {
  name: "App",
  components: {
    Main,
  },
  mounted() {
    console.log("mounted :>> ");
  },
  setup() {
    console.log('1----------------- :>> ');
    const countService = useService(CountService);
    console.log('2----------------- :>> ');
    console.log("countService :>> ", countService);
    return {
      countService: reactive(countService),
    };
  },
};
</script>
