import { toRaw } from 'vue';
import { Computed } from '@kaokei/use-vue-service';

/**
 * 用户服务 — 演示 @Computed 装饰器的各种用法
 *
 * 核心功能：
 * 1. @Computed（不带括号）— 只读计算属性
 * 2. @Computed()（带括号）— 只读计算属性（工厂函数形式）
 * 3. writable computed — getter + setter 组合实现可写计算属性
 * 4. 缓存效果 — 依赖不变时不会重新计算
 */
export class UserService {
  // 响应式数据源
  public firstName = '张';
  public lastName = '三';

  /**
   * 计算次数计数器，用于演示缓存效果
   * 每次 getter 实际执行时递增
   */
  public fullNameCalcCount = 0;
  public displayNameCalcCount = 0;

  /**
   * 用法一：@Computed（不带括号）
   * 只读计算属性，拼接姓和名
   * 依赖 firstName 和 lastName，只有它们变化时才会重新计算
   */
  @Computed
  public get fullName(): string {
    // 避免Computed死循环
    toRaw(this).fullNameCalcCount++;
    return `${this.firstName}${this.lastName}`;
  }

  /**
   * 用法二：@Computed()（带括号，工厂函数形式）
   * 只读计算属性，生成带问候语的显示名称
   */
  @Computed()
  public get displayName(): string {
    // 避免Computed死循环
    toRaw(this).displayNameCalcCount++;
    return `你好，${this.firstName}${this.lastName}！`;
  }

  /**
   * 用法三：writable computed（可写计算属性）
   * getter 返回 "姓 名" 格式的全名
   * setter 接收 "姓名" 字符串，将第一个字符作为姓，其余作为名
   */
  @Computed
  public get writableFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  public set writableFullName(val: string) {
    // 将第一个字符作为姓，其余作为名
    if (val.length > 0) {
      this.firstName = val[0];
      this.lastName = val.slice(1).trim() || '';
    }
  }
}
