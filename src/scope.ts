import { Newable } from '@kaokei/di';
import { EffectScope, effectScope } from 'vue';
import { SCOPE_KEY } from './constants.ts';

export function createScope(obj: Newable): EffectScope {
  const that = obj as any;
  const scope = effectScope(true);
  that[SCOPE_KEY] = scope;
  return scope;
}

export function getScope(obj: Newable): EffectScope | undefined {
  const that = obj as any;
  return that[SCOPE_KEY];
}

export function getEffectScope(obj: Newable): EffectScope {
  const scope = getScope(obj);
  if (!scope) {
    return createScope(obj);
  }
  return scope;
}

export function removeScope(obj: Newable): void {
  const that = obj as any;
  if (that) {
    const scope = getScope(that);
    if (scope) {
      scope.stop();
      delete that[SCOPE_KEY];
    }
  }
}
