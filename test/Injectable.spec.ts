import 'reflect-metadata';
import { DESIGN_PARAM_TYPES, SERVICE_PARAM_TYPES } from '../src/ServiceContext';

import Person from './data/Person.service';
import Component1 from './data/Component1.vue';
// import App from '../example/App.vue';
import { mount } from '@vue/test-utils';
// import { createRenderer } from 'vue-server-renderer';

const Component2 = {
  template: '<p>{{ msg }}</p>',
  props: ['msg'],
};

describe('test Injectable', () => {
  test('adds 1 + 2 to equal 3', () => {
    const person = new Person('zhangsan', 123);
    const types = Reflect.getMetadata(DESIGN_PARAM_TYPES, Person);
    const types2 = Reflect.getMetadata(SERVICE_PARAM_TYPES, Person);

    expect(types[0]).toBe(String);
    expect(types[1]).toBe(Number);
    expect(person).toBeInstanceOf(Person);
  });
});

describe('test Component', () => {
  it('renders li for each item in props.items', () => {
    console.log('hello ', Component1);
    const wrapper = mount(Component1 as any, {
      props: {},
    });
    expect(wrapper.findAll('div')).toHaveLength(1);
  });

  // it('matches snapshot', () => {
  //   const renderer = createRenderer();
  //   const wrapper = mount(Component2, {
  //     props: {},
  //   });
  //   renderer.renderToString(wrapper.vm, (err, str) => {
  //     if (err) throw new Error(err.message);
  //     expect(str).toMatchSnapshot();
  //   });
  // });
});