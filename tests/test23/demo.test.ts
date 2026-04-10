import { reactive, isRef } from 'vue';
import { mount } from '@vue/test-utils';
import { DemoService } from './DemoService';
import DemoComp from './DemoComp.vue';

/**
 * 测试 computed 在不同场景下的返回值和自动解包行为。
 *
 * 核心研究问题：
 * 1. 普通对象 vs reactive 对象上，computed 属性是否会自动解包？
 * 2. computed 作为属性赋值 vs getter 返回，解包行为有何差异？
 * 3. 类内部通过 this 访问时，是否会自动解包？
 */
describe('test23 - computed 自动解包行为研究', () => {
  // ========================================================================
  // 第一部分：纯 Vue API 层面的行为验证（不涉及 DI 框架）
  // ========================================================================
  describe('纯 Vue API 行为验证', () => {
    // ------------------------------------------------------------------
    // 外部访问：普通对象
    // ------------------------------------------------------------------
    describe('外部访问普通对象', () => {
      it('t.computedX 是 ComputedRef，不会自动解包', () => {
        const t = new DemoService();

        expect(isRef(t.computedX)).toBe(true);
        expect(t.computedX.value).toBe(1);
        expect(t.computedX).not.toBe(1);
      });

      it('t.getComputedX 每次返回新的 ComputedRef，不会自动解包', () => {
        const t = new DemoService();

        const ref1 = t.getComputedX;
        const ref2 = t.getComputedX;
        expect(isRef(ref1)).toBe(true);
        expect(isRef(ref2)).toBe(true);
        // 每次调用 getter 都创建新的 computed 实例
        expect(ref1).not.toBe(ref2);
        expect(ref1.value).toBe(1);
      });

      it('t.getX 返回原始值', () => {
        const t = new DemoService();

        expect(t.getX).toBe(1);
        expect(isRef(t.getX)).toBe(false);
      });
    });

    // ------------------------------------------------------------------
    // 外部访问：reactive 对象
    // ------------------------------------------------------------------
    describe('外部访问 reactive 对象', () => {
      it('rt.computedX 自动解包，直接返回原始值', () => {
        const t = new DemoService();
        const rt = reactive(t);

        expect(rt.computedX).toBe(1);
        expect(isRef(rt.computedX)).toBe(false);
        expect(typeof rt.computedX).toBe('number');
      });

      it('rt.getComputedX 自动解包，直接返回原始值', () => {
        const t = new DemoService();
        const rt = reactive(t);

        expect(rt.getComputedX).toBe(1);
        expect(isRef(rt.getComputedX)).toBe(false);
        expect(typeof rt.getComputedX).toBe('number');
      });

      it('rt.getX 返回原始值（本身就不是 ref）', () => {
        const t = new DemoService();
        const rt = reactive(t);

        expect(rt.getX).toBe(1);
        expect(isRef(rt.getX)).toBe(false);
      });

      it('rt.x 返回原始值（本身就不是 ref）', () => {
        const t = new DemoService();
        const rt = reactive(t);

        expect(rt.x).toBe(1);
        expect(isRef(rt.x)).toBe(false);
      });
    });

    // ------------------------------------------------------------------
    // 类内部通过 this 访问：普通对象
    // ------------------------------------------------------------------
    describe('类内部 this 访问（普通对象）', () => {
      it('普通对象内部：this.computedX 不会自动解包，仍然是 ComputedRef', () => {
        const t = new DemoService();
        const info = t.inspectInternalAccess();

        expect(info.x_value).toBe(1);
        expect(info.x_isRef).toBe(false);

        // this.computedX 仍然是 ComputedRef
        expect(info.computedX_isRef).toBe(true);
        expect(info.computedX_value).not.toBe(1);

        // this.getComputedX 也是 ComputedRef
        expect(info.getComputedX_isRef).toBe(true);
        expect(info.getComputedX_value).not.toBe(1);

        // this.getX 是普通值
        expect(info.getX_value).toBe(1);
        expect(info.getX_isRef).toBe(false);
      });
    });

    // ------------------------------------------------------------------
    // 类内部通过 this 访问：reactive 对象
    // ------------------------------------------------------------------
    describe('类内部 this 访问（reactive 对象）', () => {
      it('reactive 对象内部：this.computedX 自动解包', () => {
        const t = new DemoService();
        const rt = reactive(t);
        const info = rt.inspectInternalAccess();

        expect(info.x_value).toBe(1);
        expect(info.x_isRef).toBe(false);

        // this.computedX 被自动解包为原始值
        expect(info.computedX_isRef).toBe(false);
        expect(info.computedX_value).toBe(1);

        // this.getComputedX 也被自动解包
        expect(info.getComputedX_isRef).toBe(false);
        expect(info.getComputedX_value).toBe(1);

        // this.getX 本身就是原始值
        expect(info.getX_value).toBe(1);
        expect(info.getX_isRef).toBe(false);
      });
    });

    // ------------------------------------------------------------------
    // 响应式更新对比
    // ------------------------------------------------------------------
    describe('响应式更新对比', () => {
      it('普通对象：修改 x 后 computedX 不会更新（this.x 非响应式依赖）', () => {
        const t = new DemoService();

        expect(t.computedX.value).toBe(1);
        t.x = 999;
        // this.x 不是响应式属性，computed 返回缓存的旧值
        expect(t.computedX.value).toBe(1);
      });

      it('普通对象：increaseX 修改 x 后 computedX 不会更新', () => {
        const t = new DemoService();

        expect(t.computedX.value).toBe(1);
        t.increaseX();
        expect(t.x).toBe(2);
        // 同理，this.x 不是响应式依赖
        expect(t.computedX.value).toBe(1);
      });

      it('reactive 对象：直接修改 rt.x 后 computedX 响应式更新', () => {
        const t = new DemoService();
        const rt = reactive(t);

        expect(rt.computedX).toBe(1);
        rt.x = 42;

        expect(rt.computedX).toBe(42);
        expect(rt.getX).toBe(42);
        expect(rt.getComputedX).toBe(42);
      });

      it('reactive 对象：increaseX 修改后各属性的更新情况', () => {
        const t = new DemoService();
        const rt = reactive(t);

        expect(rt.x).toBe(1);
        rt.increaseX();

        expect(rt.x).toBe(2);
        expect(rt.getX).toBe(2);
        expect(rt.getComputedX).toBe(2);
        expect(rt.computedX).toBe(2);
      });
    });
  });

  // ========================================================================
  // 第二部分：通过 DI 框架注入后的行为验证
  // DI 框架通过 onActivation 钩子自动将实例包装为 reactive 对象。
  // ========================================================================
  describe('DI 框架注入后的行为验证', () => {
    // ------------------------------------------------------------------
    // 外部访问
    // ------------------------------------------------------------------
    describe('外部访问服务实例', () => {
      it('service.computedX 自动解包，直接返回原始值', () => {
        const wrapper = mount(DemoComp);
        const service = wrapper.vm.service;

        expect(service.computedX).toBe(1);
        expect(typeof service.computedX).toBe('number');
      });

      it('service.getComputedX 自动解包，直接返回原始值', () => {
        const wrapper = mount(DemoComp);
        const service = wrapper.vm.service;

        expect(service.getComputedX).toBe(1);
        expect(typeof service.getComputedX).toBe('number');
      });

      it('service.getX 返回原始值', () => {
        const wrapper = mount(DemoComp);
        const service = wrapper.vm.service;

        expect(service.getX).toBe(1);
        expect(typeof service.getX).toBe('number');
      });
    });

    // ------------------------------------------------------------------
    // 类内部 this 访问
    // ------------------------------------------------------------------
    describe('类内部 this 访问（DI 注入后）', () => {
      it('DI 注入后：类内部 this 访问 computedX 自动解包', () => {
        const wrapper = mount(DemoComp);
        const service = wrapper.vm.service;
        const info = service.inspectInternalAccess();

        expect(info.x_value).toBe(1);
        expect(info.x_isRef).toBe(false);

        expect(info.computedX_isRef).toBe(false);
        expect(info.computedX_value).toBe(1);

        expect(info.getComputedX_isRef).toBe(false);
        expect(info.getComputedX_value).toBe(1);

        expect(info.getX_value).toBe(1);
        expect(info.getX_isRef).toBe(false);
      });
    });

    // ------------------------------------------------------------------
    // 响应式更新
    // ------------------------------------------------------------------
    describe('响应式更新', () => {
      it('increaseX 后：computedX 不会更新（构造时 this 指向原始对象）', () => {
        const wrapper = mount(DemoComp);
        const service = wrapper.vm.service;

        expect(service.x).toBe(1);
        expect(service.computedX).toBe(1);

        service.increaseX();

        expect(service.x).toBe(2);
        // computedX 在构造时创建，闭包中 this 指向原始对象，
        // 原始对象的 x 不是响应式依赖，所以不会更新
        expect(service.computedX).toBe(1);

        // getX 和 getComputedX 能正确更新
        expect(service.getX).toBe(2);
        expect(service.getComputedX).toBe(2);
      });

      it('increaseX 后：类内部 this 访问的解包和更新情况', () => {
        const wrapper = mount(DemoComp);
        const service = wrapper.vm.service;

        service.increaseX();
        const info = service.inspectInternalAccess();

        expect(info.x_value).toBe(2);

        // computedX 仍然被解包，但值不会更新（闭包引用原始对象）
        expect(info.computedX_isRef).toBe(false);
        expect(info.computedX_value).toBe(1);

        expect(info.getComputedX_isRef).toBe(false);
        expect(info.getComputedX_value).toBe(2);

        expect(info.getX_value).toBe(2);
      });
    });

    // ------------------------------------------------------------------
    // DOM 渲染
    // ------------------------------------------------------------------
    describe('DOM 渲染', () => {
      it('初始渲染正确', () => {
        const wrapper = mount(DemoComp);

        expect(wrapper.get('.x').text()).toBe('1');
        expect(wrapper.get('.computedX').text()).toBe('1');
        expect(wrapper.get('.getX').text()).toBe('1');
        expect(wrapper.get('.getComputedX').text()).toBe('1');
      });

      it('点击后：computedX 不更新，其他正常更新', async () => {
        const wrapper = mount(DemoComp);

        await wrapper.get('.btn-x').trigger('click');

        expect(wrapper.get('.x').text()).toBe('2');
        expect(wrapper.get('.computedX').text()).toBe('1'); // 不更新
        expect(wrapper.get('.getX').text()).toBe('2');
        expect(wrapper.get('.getComputedX').text()).toBe('2');

        await wrapper.get('.btn-x').trigger('click');

        expect(wrapper.get('.x').text()).toBe('3');
        expect(wrapper.get('.computedX').text()).toBe('1'); // 仍然不更新
        expect(wrapper.get('.getX').text()).toBe('3');
        expect(wrapper.get('.getComputedX').text()).toBe('3');
      });
    });
  });
});
