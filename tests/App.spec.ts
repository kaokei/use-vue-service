import 'reflect-metadata';

import { mount } from '@vue/test-utils';

import TestTreeScope from '@containers/TestTreeScope.vue';

import { DESIGN_PARAM_TYPES, SERVICE_PARAM_TYPES } from '../src';

import Logger from '@services/logger.service';
import Counter from '@services/counter.service';
import Person from '@services/person.service';

describe('App', () => {
  test('渲染组件、获取服务数据', async () => {
    const wrapper = mount(TestTreeScope);
    const Earth = wrapper.findComponent({ name: 'Earth' });
    const China = Earth.findComponent({ name: 'China' });
    const ProvinceA = China.findComponent({ name: 'ProvinceA' });
    const SchoolA = ProvinceA.findComponent({ name: 'SchoolA' });
    const ClassA = SchoolA.findComponent({ name: 'ClassA' });

    const person = (ClassA.vm as any).personService;

    expect(person.check()).toBe(true);

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

    expect(person.logger1).toBeInstanceOf(Logger);
    expect(person.logger2).toBeInstanceOf(Logger);
    expect(person.logger3).toBeInstanceOf(Logger);

    expect(person.counterService11).toBeInstanceOf(Counter);
    expect(person.counterService12).toBeInstanceOf(Counter);

    expect(person.counterService21).toBeInstanceOf(Counter);
    expect(person.counterService22).toBeInstanceOf(Counter);

    expect(person.counterService31).toBeInstanceOf(Counter);
    expect(person.counterService32).toBeInstanceOf(Counter);
  });

  test('组件快照、服务共享', async () => {
    const wrapper = mount(TestTreeScope);
    await wrapper.vm.$nextTick();
    expect(wrapper.html()).toMatchSnapshot();
  });
});
