import 'reflect-metadata';

import { mount } from '@vue/test-utils';

import TestTreeScope from '@containers/TestTreeScope.vue';

import { DECORATOR_KEYS } from '@src/index';
const { DESIGN_PARAM_TYPES } = DECORATOR_KEYS;

import Logger from '@services/logger.service';
import Counter from '@services/counter.service';
import Person from '@services/person.service';

describe('TestTreeScope Component', () => {
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

    expect(types1[0]).toBe(Logger);

    expect(types1[1]).toBe(Logger);

    expect(types1[2]).toBe(Logger);

    expect(types1[3]).toBe(Counter);

    expect(types1[4]).toBe(Counter);

    expect(types1[5]).toBe(Counter);

    expect(types1[6]).toBe(Counter);

    expect(types1[7]).toBe(Counter);

    expect(types1[8]).toBe(Counter);

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
