import type { CommonToken, Container } from '@kaokei/di';

// 遍历子容器树，收集绑定了指定 token 的服务实例
// findFirst 为 true 时找到第一个即停止遍历
function walk<T>(
  children: Set<Container> | undefined,
  token: CommonToken<T>,
  results: T[],
  findFirst: boolean
): boolean {
  if (children) {
    for (const container of children) {
      if (container.isCurrentBound(token)) {
        results.push(container.get(token));
        if (findFirst) return true;
      }
      if (walk(container.getChildren(), token, results, findFirst)) {
        return true;
      }
    }
  }
  return false;
}

export function findChildService<T>(
  token: CommonToken<T>,
  container: Container
): T | undefined {
  const results: T[] = [];
  walk(container.getChildren(), token, results, true);
  return results[0];
}

export function findChildrenServices<T>(
  token: CommonToken<T>,
  container: Container
): T[] {
  const results: T[] = [];
  walk(container.getChildren(), token, results, false);
  return results;
}
