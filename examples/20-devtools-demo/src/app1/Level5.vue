<script setup lang="ts">
import { declareProviders, useService } from '@kaokei/use-vue-service'
import { UserService } from '../services'

// Level5 声明自己的 UserService
declareProviders([UserService])

const user = useService(UserService)
</script>

<template>
  <div style="border: 1px solid #a5d6a7; padding: 8px; margin-top: 8px; border-radius: 4px;">
    <h2>Level5 (独立 UserService)</h2>
    <p>独立用户：{{ user.name }} <button @click="user.setName('王五')">改名</button></p>
  </div>
</template>
