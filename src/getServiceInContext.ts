/**
 * 如果A服务依赖B服务，B服务依赖C服务
 * 那么有这样的规则
 *    C.context=B.Context?.parent?.parent...
 *    B.context=A.Context?.parent?.parent...
 * 也就是说子服务的Content一定是大于等于父服务的Context
 * 需要注意这里C的context并没有使用原始context，也就是说C的context并不会从A.Context开始算起，而是从B.Context算起
 */

import "reflect-metadata";

export interface ContextProps {
  providers: any[];
  parent?: ContextProps;
  [key: string]: any;
}

const defaultNamespace = "root";

/**
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
export function getServiceInContext(
  key: any,
  ctx: ContextProps,
  options?: any
): any {
  const { parent, providers = [], values = [] } = ctx;
  const index = providers.findIndex((item) =>
    item.provide ? item.provide === key : item === key
  );
  if (index >= 0) {
    const value = values[index];
    if (value) {
      return value;
    } else {
      const newValue = generateServiceByProvider(providers[index], ctx);
      values[index] = newValue;
      return newValue;
    }
  } else {
    if (parent) {
      return getServiceInContext(key, parent, options);
    } else {
      const namespace = options?.namespace || defaultNamespace;
      ctx[namespace] = ctx[namespace] || new Map();
      if (ctx[namespace].get(key)) {
        return ctx[namespace].get(key);
      } else {
        const newValue = generateServiceByProvider(key, ctx);
        ctx[namespace].set(key, newValue);
        return newValue;
      }
    }
  }
}

/**
 * Logger
 * { provide: Logger, useClass: Logger }
 * { provide: Logger, useClass: BetterLogger }
 * { provide: OldLogger, useExisting: NewLogger} != { provide: OldLogger, useClass: NewLogger}
 * { provide: Logger, useValue: SilentLogger } - 非类依赖-字符串/函数/对象
 * { provide: HeroService, useFactory: heroServiceFactory, deps: [Logger, UserService] }
 * 预定义令牌
 * 多实例提供者
 */
function generateServiceByProvider(provider: any, ctx: any) {
  if (provider.useValue) {
    return provider.useValue;
  } else if (provider.useClass) {
    provider.useValue = generateServiceByClass(provider.useClass, ctx);
    return provider.useValue;
  } else if (provider.useExisting) {
    provider.useValue = getServiceInContext(provider.useExisting, ctx);
    return provider.useValue;
  } else if (provider.useFactory) {
    const deps = provider.deps;
    if (deps) {
      const args = deps.map((dep: any) => getServiceInContext(dep, ctx));
      provider.useValue = provider.useFactory(args);
    } else {
      provider.useValue = provider.useFactory();
    }
    return provider.useValue;
  } else {
    return generateServiceByClass(provider, ctx);
  }
}

/**
 * 根据类名new一个对象
 *
 * @param {*} ClassName
 * @param {*} ctx
 */
function generateServiceByClass(ClassName: any, ctx: any) {
  const providers = Reflect.getMetadata("class:providers", ClassName);
  if (providers && providers.length) {
    const args = providers.map((provide: any) =>
      getServiceInContext(provide, ctx)
    );
    return new ClassName(...args);
  } else {
    return new ClassName();
  }
}

// type Constructor<T = any> = new (...args: any[]) => T;

// const Injectable = (): ClassDecorator => target => {};

// class OtherService {
//   a = 1;
// }

// @Injectable()
// class TestService {
//   constructor(public readonly otherService: OtherService) {}

//   testMethod() {
//     console.log(this.otherService.a);
//   }
// }

// const Factory = <T>(target: Constructor<T>): T => {
//   const providers = Reflect.getMetadata('design:paramtypes', target); // [OtherService]
//   console.log('providers', providers);
//   const args = providers.map((provider: Constructor) => new provider());
//   return new target(...args);
// };

// Factory(TestService).testMethod(); //
