// 模仿angular中的Injector
import 'reflect-metadata';

interface Meta {
  key: any;
  value: any;
}

import {
  SERVICE_INJECTED_KEY,
  SERVICE_INJECTED_PARAMS,
  SERVICE_INJECTED_PROPS,
  SERVICE_PARAM_TYPES,
} from './ServiceContext';
import { merge, has } from './utils';

// 第一步：准备构造函数的依赖对象
// 第二步：通过构造函数来获取服务的实例对象
// 第三步：补充@Inject注入的实例属性
// 第四步：执行constructed方法

export class Injector {
  providerMap = new WeakMap<any, any>();
  parent?: Injector;

  constructor(providers: any[], parent?: Injector) {
    this.parent = parent;
    this.resolveProviders(providers);
  }

  /**
   * 对外暴露的接口 - 获取服务对象
   * @done
   * @param {*} serviceIdentifier
   * @param {*} options
   * @return {*}  {*}
   * @memberof Injector
   */
  get(serviceIdentifier: any, options: any): any {
    if (this.providerMap.has(serviceIdentifier)) {
      const provider = this.providerMap.get(serviceIdentifier);
      return this.getServiceByProvider(provider, options);
    } else if (this.parent) {
      return this.parent.get(serviceIdentifier, options);
    } else {
      return 'not found';
    }
  }

  /**
   * 获取服务对象数组
   * @done
   * @param {Meta[]} metas
   * @return {*}
   * @memberof Injector
   */
  getServices(metas: Meta[]) {
    return metas.map(meta => this.get(meta.key, meta.value));
  }

  /**
   * 获取构造函数的参数-返回数组
   * @done
   * @param {*} serviceIdentifier
   * @return {*}
   * @memberof Injector
   */
  getContructorParameters(serviceIdentifier: any) {
    return this.getServices(this.getContructorParametersMetas(serviceIdentifier));
  }

  /**
   * 获取构造函数的参数的装饰器元数据
   * @done
   * @param {*} serviceIdentifier
   * @return {*}
   * @memberof Injector
   */
  getContructorParametersMetas(serviceIdentifier: any) {
    // 构造函数的参数的类型数据-原始数据-是一个数组
    const params = Reflect.getMetadata(SERVICE_PARAM_TYPES, serviceIdentifier) || [];
    // 构造函数的参数的类型数据-通过@Inject等装饰器实现-是一个对象-key是数字-对应第几个参数的类型数据
    const propertiesMetadatas =
      Reflect.getMetadata(SERVICE_INJECTED_PARAMS, serviceIdentifier) || {};
    return params.map((paramType: any, index: any) => {
      // 查找当前index对应的参数有没有使用装饰器
      const propertyMetadatas: any[] = propertiesMetadatas[index] || [];
      // 查找装饰器列表中有没有@Inject
      const ctor = propertyMetadatas.find(meta => meta.key === SERVICE_INJECTED_KEY);
      // 把装饰器列表收集为对象，并且排除掉@Inject
      const options = propertyMetadatas.reduce((acc, meta) => {
        if (meta.key !== SERVICE_INJECTED_KEY) {
          acc[meta.key] = meta.value;
        }
        return acc;
      }, {} as any);
      return {
        key: (ctor && ctor.value) || paramType,
        value: options,
      };
    });
  }

  /**
   * 获取注入的实例属性-返回对象
   * @done
   * @param {*} serviceIdentifier
   * @return {*}
   * @memberof Injector
   */
  getInjectProperties(serviceIdentifier: any) {
    return this.getServices(this.getInjectPropertiesMetas(serviceIdentifier));
  }

  /**
   * 获取注入属性的装饰器数据
   * @done
   * @param {*} serviceIdentifier
   * @return {*}
   * @memberof Injector
   */
  getInjectPropertiesMetas(serviceIdentifier: any) {
    // 获取注入属性的metas-类型是Recors<string, Array>
    const propertiesMetadatas =
      Reflect.getMetadata(SERVICE_INJECTED_PROPS, serviceIdentifier) || {};
    const propertiesMetas: any = [];
    for (const key in propertiesMetadatas) {
      if (has(propertiesMetadatas, key)) {
        // 当前key属性对应的所有的装饰器
        const propertyMetadatas = propertiesMetadatas[key] || [];
        // 当前key属性对应的@Inject
        const ctor = propertyMetadatas.find(
          (meta: any) => meta.key === SERVICE_INJECTED_KEY
        );
        if (!ctor) {
          // 属性一定要手动指定@Inject
          throw new Error('找不到可注入的服务');
        }
        const options = propertyMetadatas.reduce((acc: any, meta: any) => {
          if (meta.key !== SERVICE_INJECTED_KEY) {
            acc[meta.key] = meta.value;
          }
          return acc;
        }, {} as any);

        propertiesMetas.push({
          key: ctor.value,
          value: options,
        });
      }
    }
    return propertiesMetas;
  }

  /**
   * 通过provider直接获取service实例
   * @done
   * @param {*} provider
   * @param {*} options
   * @return {*}
   * @memberof Injector
   */
  getServiceByProvider(provider: any, options: any) {
    if (provider.useValue) {
      return provider.useValue;
    } else if (provider.useClass) {
      return (provider.useValue = this.getServiceByClass(provider.useClass, options));
    } else if (provider.useExisting) {
      return (provider.useValue = this.get(provider.useExisting, options));
    } else if (provider.useFactory) {
      const deps = provider.deps || [];
      const args = deps.map((dep: any) => this.get(dep, options));
      return (provider.useValue = provider.useFactory(...args));
    } else {
      throw new Error('provider 格式异常');
    }
  }

  /**
   * 通过类名获取服务实例
   * @done
   * @template T
   * @param {new (...args: any[]) => T} ClassName
   * @param {*} options
   * @return {*}
   * @memberof Injector
   */
  getServiceByClass<T>(ClassName: new (...args: any[]) => T, options: any) {
    const params = this.getContructorParameters(ClassName);
    const properties = this.getInjectProperties(ClassName);
    const service = new ClassName(...params);
    merge(service, properties);
    return service;
  }

  /**
   * 把providers数组转换成map，避免后续的遍历
   * @done
   * @param {any[]} providers
   * @memberof Injector
   */
  resolveProviders(providers: any[]) {
    providers.forEach(provider => {
      if (provider.provide) {
        this.providerMap.set(provider.provide, provider);
      } else {
        this.providerMap.set(provider, {
          provide: provider,
          useClass: provider,
        });
      }
    });
  }
}
