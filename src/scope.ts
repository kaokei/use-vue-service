import { EffectScope, effectScope } from 'vue';
import { SCOPE_KEY } from './constants.ts';

export function createScope(obj: object): EffectScope {
  const that = obj as any;
  const scope = effectScope(true);
  that[SCOPE_KEY] = scope;
  return scope;
}

export function getScope(obj: object): EffectScope | undefined {
  const that = obj as any;
  return that[SCOPE_KEY];
}

export function removeScope(obj: object): void {
  const that = obj as any;
  if (that) {
    const scope = getScope(that);
    if (scope) {
      scope.stop();
      delete that[SCOPE_KEY];
    }
  }
}

export function getEffectScope(obj: object): EffectScope {
  const scope = getScope(obj);
  if (!scope) {
    return createScope(obj);
  }
  return scope;
}
