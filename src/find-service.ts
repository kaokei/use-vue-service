import type { CommonToken, Container } from '@kaokei/di';

function walk<T>(
  children: Set<Container> | undefined,
  token: CommonToken<T>,
  results: T[]
): T[] {
  if (children) {
    children.forEach(container => {
      if (container && container.isCurrentBound(token)) {
        results.push(container.get(token));
      }
      if (container.children) {
        walk(container.children, token, results);
      }
    });
  }
  return results;
}

export function findChildService<T>(
  token: CommonToken<T>,
  container: Container
): T | undefined {
  const results: T[] = [];
  walk(container.children, token, results);
  return results[0];
}

export function findChildrenServices<T>(
  token: CommonToken<T>,
  container: Container
): T[] {
  const results: T[] = [];
  walk(container.children, token, results);
  return results;
}
