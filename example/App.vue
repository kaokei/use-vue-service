<template>
  <div>
    <p>
      <router-link to="/">Test Tree Scope</router-link>
      <router-link to="/partial" class="ml20">Test Partial Scope</router-link>
      <router-link to="/refAndReactive" class="ml20">Test Ref And Reactive</router-link>
    </p>
    <router-view></router-view>
  </div>
</template>
