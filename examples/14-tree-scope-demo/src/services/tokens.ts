/**
 * Token 定义文件
 *
 * 使用 Token 实例作为非类类型服务的标识符。
 * COUNTER_THEME 和 COUNTDOWN_THEME 分别用于标识计数器和倒计时组件的背景色。
 */
import { Token } from '@kaokei/use-vue-service';

export const COUNTER_THEME = new Token<string>('COUNTER_THEME');
export const COUNTDOWN_THEME = new Token<string>('COUNTDOWN_THEME');
