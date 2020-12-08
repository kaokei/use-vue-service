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
 */

import 'reflect-metadata';
import { PARAM_TYPES } from './Inject';

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
  skip?: true | number;
}

const defaultNamespace = 'root';

/**
 * 根据一个服务标志获取一个服务
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
  options?: IOptions
): any {
  const { parent, providers = [] } = ctx;
  const provider = providers.find(item => item.provide === serviceIdentifier);
  if (provider) {
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
      const namespace = (options && options.namespace) || defaultNamespace;
      const namespaceCtx = (ctx[namespace] = ctx[namespace] || new Map());
      const value = namespaceCtx.get(serviceIdentifier);
      if (value) {
        return value;
      } else {
        const newValue = generateServiceByClass(serviceIdentifier, ctx, options);
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
  options?: IOptions
) {
  if (provider.useValue) {
    return provider.useValue;
  } else if (provider.useClass) {
    return generateServiceByClass(provider.useClass, ctx, options);
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
  ctx: IContextProps,
  options?: IOptions
): T {
  const params = Reflect.getMetadata(PARAM_TYPES, ClassName);
  if (params && params.length) {
    const args = params.map((provide: any) => getServiceInContext(provide, ctx, options));
    return new ClassName(...args);
  } else {
    return new ClassName();
  }
}
