import * as IndexModule from '@/index';
import * as ScopeModule from '@/scope';

// ============================================================================
// 导出冒烟测试
// ============================================================================

describe('RunInScope 导出检查', () => {
  // 测试：@/index 导出了 RunInScope（需求 9.1）
  it('@/index 导出了 RunInScope', () => {
    expect('RunInScope' in IndexModule).toBe(true);
    expect(typeof IndexModule.RunInScope).toBe('function');
  });

  // 测试：@/index 不再导出 getEffectScope（需求 9.2）
  it('@/index 不再导出 getEffectScope', () => {
    expect('getEffectScope' in IndexModule).toBe(false);
  });

  // 测试：@/scope 仍然导出 getEffectScope 供内部使用（需求 9.3）
  it('@/scope 仍然导出 getEffectScope 供内部使用', () => {
    expect('getEffectScope' in ScopeModule).toBe(true);
    expect(typeof ScopeModule.getEffectScope).toBe('function');
  });
});
