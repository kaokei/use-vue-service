## @injectable()

这个装饰器主要是收集构造函数的参数的元数据，以用于构造函数的依赖注入。
因为我基本不推荐使用构造函数来注入，就算使用构造函数也需要通过@inject 明确依赖项。
根本原因是不期望依赖 typescript 的 emitDecoratorMetadata 选项。

## ref vs exposed
父组件通过ref引用子组件，实际上引用的是子组件的exposeProxy对象。
```
ref.value === this.component.exposeProxy
```
