/**
 * Token 定义文件
 *
 * Token 是 @kaokei/di 提供的泛型标识符，用于标识非类类型的服务。
 * 当需要注入字符串、数字、对象等非类类型的值时，使用 Token 作为标识符。
 * Token 通过 @kaokei/use-vue-service 重新导出，可以直接从中导入。
 */
import { Token } from '@kaokei/use-vue-service';

// 定义一个 Token<string> 类型的标识符，用于绑定 API 地址常量
export const API_URL = new Token<string>('API_URL');

// 定义一个 Token<object> 类型的标识符，用于绑定动态配置对象
export const CONFIG = new Token<{ env: string; debug: boolean }>('CONFIG');
