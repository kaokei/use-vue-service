import 'reflect-metadata';

import { mount, VueWrapper } from '@vue/test-utils';

import App from '@/App.vue';

jest.unmock('vue');

describe('App', () => {
  test('渲染组件、获取服务数据', async () => {
    const wrapper = mount(App);
    const Earth = wrapper.findComponent({ name: 'Earth' });
    const China = Earth.findComponent({ name: 'China' });
    const ProvinceA = China.findComponent({ name: 'ProvinceA' });
    const SchoolA = ProvinceA.findComponent({ name: 'SchoolA' });
    const ClassA = SchoolA.findComponent({ name: 'ClassA' });

    expect((ClassA.vm as any).personService.check()).toBe(true);
  });

  test('组件快照、服务共享', async () => {
    const wrapper = mount(App);
    await wrapper.vm.$nextTick();
    expect(wrapper.html()).toMatchSnapshot();
  });
});
