## 测试场景

验证循环依赖，LazyServiceIdentifier 也不能解决循环依赖的问题

这是一个大问题，我以为属性注入器可以避免循环依赖已经是行业共识了，比如Spring中就是这么处理的。

但是inversify居然不是这么处理的，显然是收集完所有属性之后才会放入缓存系统。

比较简单的方案就是采用二级缓存，假设现在的缓存cache是最终的缓存结果。
那么再增加一层tempCache，这个缓存只是临时存储实例化对象，方便被其他对象依赖时可以从缓存中获取该对象。
