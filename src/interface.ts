import type { Container, Newable, CommonToken } from '@kaokei/di';

export type NewableProvider = Newable[];
export type FunctionProvider = (container: Container) => void;
export type Provider = NewableProvider | FunctionProvider;

export type FindChildService = <T>(token: CommonToken<T>) => T | undefined;
export type FindChildrenServices = <T>(token: CommonToken<T>) => T[];
