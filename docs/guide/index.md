# 快速开始

## 简介

本库是一个轻量级的适用于 vue3 项目的状态管理库。

本库是基于[@kaokei/di](https://github.com/kaokei/di)开发的，从而可以支持依赖注入能力。

本库的灵感来源于[Angular Service](https://angular.dev/guide/di/creating-injectable-service)，优势是管理数据的方式更加灵活。

## 安装

```sh
npm install @kaokei/di @kaokei/use-vue-service
```

本库 **不依赖** `reflect-metadata`，所以 **不需要** 安装这个 npm 包。

本库依赖 typescript 环境，其实是依赖装饰器特性。需要在 tsconfig.js 文件中配置如下字段。

> "experimentalDecorators": true  
> ~~"emitDecoratorMetadata": true~~ 不需要配置这个字段，因为本库不依赖装饰器元数据

## 基本使用

```ts
// 这个service.ts文件中定义了2个服务，LoggerService和CountService
// 并且CountService依赖着LoggerService
import { Inject } from '@kaokei/use-vue-service';

export class LoggerService {
  public log(...msg: any[]) {
    console.log('from logger service ==>', ...msg);
  }
}

export class CountService {
  public count = 0;

  @Inject(LoggerService)
  private logger: LoggerService;

  public addOne() {
    this.count++;
    this.logger.log('addOne ==> ', this.count);
  }
}
```

```vue
<script lang="ts" setup>
// 这个组件使用了service.ts文件中定义的服务
import { declareProviders, useService } from '@kaokei/use-vue-service';
import { CountService, LoggerService } from './service.ts';
// 这行代码将CountService、LoggerService和当前组件进行了绑定
declareProviders([CountService, LoggerService]);
// 这行代码实例化了CountService得到一个countService对象
const countService = useService(CountService);
</script>

<template>
  <div>{{ countService.count }}</div>
  <button @click="countService.addOne()">点击按钮+1</button>
</template>
```
