export { Inject, Self, Skip, Optional, Injectable } from '@kaokei/di'; // 导出依赖注入需要的装饰器

export { Component } from './Component'; // 支持类组件
export { declareProviders } from './declareProviders'; // setup中声明服务提供者
export { useService } from './useService'; // setup中获取服务实例
