/**
 * 如果A服务依赖B服务，B服务依赖C服务
 * 那么有这样的规则
 *    C.context=B.Context?.parent?.parent...
 *    B.context=A.Context?.parent?.parent...
 * 也就是说子服务的Content一定是大于等于父服务的Context
 * 需要注意这里C的context并没有使用原始context，也就是说C的context并不会从A.Context开始算起，而是从B.Context算起
 *
 * Logger
 * { provide: Logger, useClass: Logger }
 * { provide: Logger, useClass: BetterLogger }
 * { provide: OldLogger, useExisting: NewLogger} != { provide: OldLogger, useClass: NewLogger}
 * { provide: Logger, useValue: SilentLogger }
 * 非类依赖-字符串/函数/对象
 * { provide: HeroService, useFactory: heroServiceFactory, deps: [Logger, UserService] }
 * 预定义令牌
 * 多实例提供者
 *
 * 1. 组件只支持实例属性注入，并且实例属性必须使用@Inject
 * 2. 类服务既支持实例属性注入，也支持构造函数参数注入，并且构造函数参数也支持@Inject
 *
 * 1. options只对自己有效
 * 2. ctx只会往上冒泡，不会每次从头开始寻找
 */

import 'reflect-metadata';
import { inject, reactive, ref } from 'vue';
import {
  SERVICE_INJECTED_KEY,
  SERVICE_INJECTED_PARAMS,
  SERVICE_INJECTED_PROPS,
  SERVICE_PARAM_TYPES,
  ServiceContext,
  DefaultContext,
} from './ServiceContext';
import { merge, has } from './utils';

interface IProvider {
  provide: any;
  useClass: any;
  useExisting: any;
  useValue: any;
  useFactory: any;
  deps: Array<any>;
  multi: boolean;
}
export interface IContextProps {
  providers: IProvider[];
  parent?: IContextProps;
  [key: string]: any;
}

export interface IOptions {
  // 对直接注入的service和间接注入的service都生效
  namespace?: string;
  // 只对直接注入的service生效，该service依赖的其他service不直接生效，但是有间接影响
  skip?: boolean | number;
}

const defaultNamespace = 'root';

/**
 * 根据一个服务标志获取一个服务
 * 处理options里的各种参数
 *
 * @export
 * @param {*} serviceIdentifier
 * @param {IContextProps} ctx
 * @param {IOptions} [options]
 * @return {*}  {*}
 */
export function getServiceInContext(
  serviceIdentifier: any,
  ctx: IContextProps,
  options: IOptions
): any {
  const { parent, providers = [] } = ctx;
  const { namespace, skip = 0 } = options;

  if (namespace && parent) {
    return getServiceInContext(
      serviceIdentifier,
      DefaultContext as IContextProps,
      options
    );
  }

  const provider = providers.find(item => item.provide === serviceIdentifier);

  if (provider && parent && skip > 0) {
    return getServiceInContext(serviceIdentifier, parent, {
      ...options,
      skip: (skip as number) - 1,
    });
  } else if (provider) {
    if (provider.useValue) {
      return provider.useValue;
    } else {
      const newValue = generateServiceByProvider(provider, ctx, options);
      provider.useValue = newValue;
      return newValue;
    }
  } else {
    if (parent) {
      return getServiceInContext(serviceIdentifier, parent, options);
    } else {
      const ns = namespace || defaultNamespace;
      const namespaceCtx = (ctx[ns] = ctx[ns] || new Map());
      const value = namespaceCtx.get(serviceIdentifier);
      if (value) {
        return value;
      } else {
        const newValue = generateServiceByClass(serviceIdentifier, ctx);
        namespaceCtx.set(serviceIdentifier, newValue);
        return newValue;
      }
    }
  }
}

/**
 * 根据provider获取service
 *
 * @param {*} provider
 * @param {*} ctx
 * @return {*}
 */
function generateServiceByProvider(
  provider: IProvider,
  ctx: IContextProps,
  options: IOptions
) {
  if (provider.useValue) {
    return provider.useValue;
  } else if (provider.useClass) {
    return generateServiceByClass(provider.useClass, ctx);
  } else if (provider.useExisting) {
    return getServiceInContext(provider.useExisting, ctx, options);
  } else if (provider.useFactory) {
    const deps = provider.deps;
    if (deps && deps.length) {
      const args = deps.map((dep: any) => getServiceInContext(dep, ctx, options));
      return provider.useFactory(...args);
    } else {
      return provider.useFactory();
    }
  } else {
    throw new Error('provider 格式异常');
  }
}

/**
 * 根据类名new一个对象
 *
 * @param {*} ClassName
 * @param {*} ctx
 */
function generateServiceByClass<T>(
  ClassName: new (...args: any[]) => T,
  ctx: IContextProps
): T {
  if (typeof ClassName !== 'function') {
    throw new Error(`服务标识符不是类名: ${ClassName}`);
  }
  let service;
  const params = Reflect.getMetadata(SERVICE_PARAM_TYPES, ClassName);
  if (params && params.length) {
    const propertiesMetadatas =
      Reflect.getMetadata(SERVICE_INJECTED_PARAMS, ClassName) || {};
    const newParams = getNewParamsWithPropertiesMetadatas(params, propertiesMetadatas);
    const args = newParams.map((item: any) =>
      getServiceInContext(item.provide, ctx, item.options)
    );
    service = new ClassName(...args);
  } else {
    service = new ClassName();
  }
  const properties = getPropertiesByClass(ClassName);
  // todo 需要验证这样合并是否符合预期
  merge(service, properties);
  return service;
}

function getNewParamsWithPropertiesMetadatas(params: any[], propertiesMetadatas: any) {
  return params.map((provide, index) => {
    const propertyMetadatas: any[] = propertiesMetadatas[index] || [];
    const ctor = propertyMetadatas.find(meta => meta.key === SERVICE_INJECTED_KEY);
    const options = propertyMetadatas.reduce((acc, meta) => {
      if (meta.key !== SERVICE_INJECTED_KEY) {
        acc[meta.key] = meta.value;
      }
      return acc;
    }, {} as any);
    return {
      provide: (ctor && ctor.value) || provide,
      options: options,
    };
  });
}

/**
 * 1. useService 负责获取context
 * 2. useServiceWithContext 负责reactive/ref
 * 3. getServiceInContext 负责处理skip
 *
 * @param {*} Service
 * @param {IContextProps} ctx
 * @param {IOptions} [options]
 * @return {*}
 */
export function useServiceWithContext(
  Service: any,
  ctx: IContextProps,
  options?: IOptions
) {
  options = options || {};
  options.skip = Number(options.skip) || 0;
  const service = getServiceInContext(Service, ctx, options);
  return service && typeof service === 'object' ? reactive(service) : ref(service);
}

/**
 * 类组件中@Inject注入的数据
 * 只支持实例属性注入，不支持类的构造函数参数注入
 * 只能在setup中使用
 *
 * @export
 * @template T
 * @param {new (...args: any[]) => T} ClassName
 * @return {*}
 */
export function getPropertiesByClass<T>(ClassName: new (...args: any[]) => T) {
  const propertiesMetadatas =
    Reflect.getMetadata(SERVICE_INJECTED_PROPS, ClassName) || {};

  const properties: any = {};
  const ctx = inject(ServiceContext, DefaultContext as IContextProps);

  for (const key in propertiesMetadatas) {
    if (has(propertiesMetadatas, key)) {
      const propertyMetadatas = propertiesMetadatas[key] || [];
      const [Cotr, options] = getOptionsByMetadatas(propertyMetadatas);
      properties[key] = useServiceWithContext(Cotr, ctx, options);
    }
  }
  return properties;
}

export function getOptionsByMetadatas(metadatas: any[]) {
  const ctor = metadatas.find(meta => meta.key === SERVICE_INJECTED_KEY);
  if (!ctor) {
    throw new Error('找不到可注入的服务');
  }
  const options = metadatas.reduce((acc, meta) => {
    if (meta.key !== SERVICE_INJECTED_KEY) {
      acc[meta.key] = meta.value;
    }
    return acc;
  }, {} as any);

  return [ctor.value, options];
}
