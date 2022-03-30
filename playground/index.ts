import CounterService from '../example/services/counter.service';
import { InjectionKey, useService } from '../src';

const key: InjectionKey<number> = Symbol();

const abc = useService(key);

const abc1 = useService(CounterService);
