## 各种使用场景

组件和服务是绑定的，假设有 A，B 两个组件。A 组件中声明了 A 服务，B 组件中声明了 B 服务。同时 B 组件是 A 组件的子组件/子孙组件。

### A 组件访问 A 服务/B 组件访问 B 服务

useService(A)

### A 组件访问 B 服务

const findChildService = useService(FIND_CHILD_SERVICE)
const findChildrenService = useService(FIND_CHILDREN_SERVICES)

### A 服务访问 B 服务

@Inject(FIND_CHILD_SERVICE)
@Inject(FIND_CHILDREN_SERVICES)

### B 组件访问 A 服务

useService(A)

### B 服务访问 A 服务

@Inject(A)

### 假设 A 组件声明了多个服务，比如 A1，A2，A3 服务。A1 服务访问 A2 服务或者 A3 服务

@Inject(A2)
@Inject(A3)

### A 服务访问 A 组件/B 服务访问 B 组件

不支持

### A 组件访问 B 组件

不支持，访问子组件属于 vue 原生功能，通过 ref 来引用子组件，但是不能引用子组件的子组件

### A 服务访问 B 组件

不支持

### B 组件访问 A 组件

不支持，可以使用 vue 的原生能力，instance.parent 属性

### B 服务访问 A 组件

不支持
