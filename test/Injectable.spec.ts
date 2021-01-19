import 'reflect-metadata';
import { DESIGN_PARAM_TYPES, SERVICE_PARAM_TYPES } from '../src/ServiceContext';

import { useService } from '../src';
import Logger from '../example/services/logger.service';
import Counter from '../example/services/counter.service';
import Person from '../example/services/person.service';

describe('Injectable', () => {
  test('获取类的构造函数参数类型', () => {
    const person = useService(Person);
    const types1 = Reflect.getMetadata(DESIGN_PARAM_TYPES, Person);
    const types2 = Reflect.getMetadata(SERVICE_PARAM_TYPES, Person);

    expect(types1[0]).toBe(Logger);
    expect(types2[0]).toBe(Logger);

    expect(types1[1]).toBe(Logger);
    expect(types2[1]).toBe(Logger);

    expect(types1[2]).toBe(Logger);
    expect(types2[2]).toBe(Logger);

    expect(types1[3]).toBe(Counter);
    expect(types2[3]).toBe(Counter);

    expect(types1[4]).toBe(Counter);
    expect(types2[4]).toBe(Counter);

    expect(types1[5]).toBe(Counter);
    expect(types2[5]).toBe(Counter);

    expect(types1[6]).toBe(Counter);
    expect(types2[6]).toBe(Counter);

    expect(types1[7]).toBe(Counter);
    expect(types2[7]).toBe(Counter);

    expect(types1[8]).toBe(Counter);
    expect(types2[8]).toBe(Counter);

    expect(types1[9]).toBe(Counter);
    expect(types2[9]).toBe(Counter);

    expect(types1[10]).toBe(Counter);
    expect(types2[10]).toBe(Counter);

    expect(types1[11]).toBe(Counter);
    expect(types2[11]).toBe(Counter);

    expect(types1[12]).toBe(Counter);
    expect(types2[12]).toBe(Counter);

    expect(types1[13]).toBe(Counter);
    expect(types2[13]).toBe(Counter);

    expect(types1[14]).toBe(Counter);
    expect(types2[14]).toBe(Counter);

    expect(types1[15]).toBe(Counter);
    expect(types2[15]).toBe(Counter);

    expect(types1[16]).toBe(Counter);
    expect(types2[16]).toBe(Counter);

    expect(types1[17]).toBe(Counter);
    expect(types2[17]).toBe(Counter);

    expect(types1[18]).toBe(Counter);
    expect(types2[18]).toBe(Counter);

    expect(types1[19]).toBe(Counter);
    expect(types2[19]).toBe(Counter);

    expect(types1[20]).toBe(Counter);
    expect(types2[20]).toBe(Counter);

    expect(person.logger1).toBeInstanceOf(Logger);
    expect(person.logger2).toBeInstanceOf(Logger);
    expect(person.logger3).toBeInstanceOf(Logger);

    expect(person.counterService11).toBeInstanceOf(Counter);
    expect(person.counterService12).toBeInstanceOf(Counter);

    expect(person.counterService21).toBeInstanceOf(Counter);
    expect(person.counterService22).toBeInstanceOf(Counter);

    expect(person.counterService31).toBeInstanceOf(Counter);
    expect(person.counterService32).toBeInstanceOf(Counter);

    expect(person.counterService41).toBeInstanceOf(Counter);
    expect(person.counterService42).toBeInstanceOf(Counter);

    expect(person.counterService51).toBeInstanceOf(Counter);
    expect(person.counterService52).toBeInstanceOf(Counter);

    expect(person.counterService61).toBeInstanceOf(Counter);
    expect(person.counterService62).toBeInstanceOf(Counter);

    expect(person.counterService71).toBeInstanceOf(Counter);
    expect(person.counterService72).toBeInstanceOf(Counter);

    expect(person.counterService81).toBeInstanceOf(Counter);
    expect(person.counterService82).toBeInstanceOf(Counter);

    expect(person.counterService91).toBeInstanceOf(Counter);
    expect(person.counterService92).toBeInstanceOf(Counter);
  });
});
