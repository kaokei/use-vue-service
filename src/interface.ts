import type { Container, Newable, CommonToken } from '@kaokei/di';

export type NewableProvider = Newable[];
export type FunctionProvider = (container: Container) => void;
export type Provider = NewableProvider | FunctionProvider;

export type FindService = <T>(token: CommonToken<T>) => T | undefined;

export type FindAllServices = <T>(token: CommonToken<T>) => T[];
