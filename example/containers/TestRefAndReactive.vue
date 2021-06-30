<template>
  <div>
    <div>
      <h1>
        This example approves that ref data is deep reactive even though after
        replaced.
      </h1>
      <h2>test ref</h2>
      <div>
        refData.data1.data2.data3.data4: {{ refData.data1.data2.data3.data4 }}
      </div>
      <div>
        <button type="button" @click="changeRefValue">
          replace refData.value to a new obj
        </button>

        <button type="button" @click="autoIncrementRef">
          refData.data1.data2.data3.data4 ++
        </button>
      </div>
    </div>
    <div>
      <h2>test reactive</h2>
      <div>
        reactiveData.data1.data2.data3.data4:
        {{ reactiveData.data1.data2.data3.data4 }}
      </div>
      <div>
        <button type="button" @click="autoIncrementReactive">
          reactiveData.data1.data2.data3.data4 ++
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive } from 'vue';

function getNestData() {
  return {
    data1: {
      data2: {
        data3: {
          data4: 1,
        },
      },
    },
  };
}

export default defineComponent({
  name: 'TestRefAndReactive',

  setup() {
    const refData = ref(getNestData());
    const reactiveData = reactive(getNestData());

    const changeRefValue = () => {
      refData.value = getNestData();
    };

    const autoIncrementRef = () => {
      refData.value.data1.data2.data3.data4++;
    };

    const autoIncrementReactive = () => {
      reactiveData.data1.data2.data3.data4++;
    };

    return {
      refData,
      reactiveData,
      changeRefValue,
      autoIncrementRef,
      autoIncrementReactive,
    };
  },

  mounted() {
    (document.querySelector('#app') as any).style.width = '100%';
  },
  unmounted() {
    (document.querySelector('#app') as any).style.width = 'max-content';
  },
});
</script>

<style lang="css" scoped></style>
