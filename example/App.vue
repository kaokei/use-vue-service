<template>
  <div>
    <img alt="Vue logo" src="./assets/logo.png" />
    <HelloWorld msg="Hello Vue 3.0 + Vite" />
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
import HelloWorld from "./components/HelloWorld.vue";
import Main from './components/Main.vue'
import CountService from "./services/count.service";

import {reactive} from 'vue'
import { useService, declareProviders } from "../src";

export default {
  name: "App",
  components: {
    HelloWorld,
    Main,
  },
  mounted() {
    console.log("mounted :>> ");
  },
  setup() {
    const countService = useService(CountService);
    console.log("countService :>> ", countService);
    return {
      countService: reactive(countService),
    };
  },
};
</script>
