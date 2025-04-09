## 测试场景-当前组件的服务访问当前组件

```
@Inject(CURRENT_COMPONENT)
public component: ComponentInternalInstance | null = null;
```

测试了在服务中获取当前组件的功能，主要功能可以获取 props 或者发送事件

```
this.component.props
this.component.emit()

// 还可以获取组件的defineExpose的数据，但是不建议使用
// 因为所有数据都在服务中，服务可以通过依赖注入引用其他服务
this.component.exposeProxy
```
