import 'reflect-metadata';
import { DESIGN_PARAM_TYPES, SERVICE_PARAM_TYPES } from '../src/ServiceContext';

import { useService } from '../src';
import Logger from '../example/services/logger.service';
import Person from '../example/services/person.service';

describe('Injectable', () => {
  test('获取类的构造函数参数类型', () => {
    const person = useService(Person);
    const types1 = Reflect.getMetadata(DESIGN_PARAM_TYPES, Person);
    const types2 = Reflect.getMetadata(SERVICE_PARAM_TYPES, Person);

    expect(types1[0]).toBe(String);
    expect(types1[1]).toBe(Number);
    expect(types2[0]).toBe(String);
    expect(types2[1]).toBe(Number);

    expect(person).toBeInstanceOf(Person);
    expect(person.name).toBeInstanceOf(String);
    expect(person.age).toBeInstanceOf(Number);
    expect(person.logger).toBeInstanceOf(Logger);
  });
});
