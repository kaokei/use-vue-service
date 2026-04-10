import { reactive, isRef, defineComponent, h } from 'vue';
import { mount } from '@vue/test-utils';
import { DemoService } from './DemoService';
import { declareProviders, useService } from '@/index';
import DemoComp from './DemoComp.vue';

/**
 * 测试 computed 在不同场景下的返回值和自动解包行为。
 *
 * 核心研究问题：
 * 1. 普通对象 vs reactive 对象上，computed 属性是否会自动解包？
 * 2. computed 作为属性赋值 vs getter 返回，解包行为有何差异？
 * 3. 类内部通过 this 访问时，是否会自动解包？
 * 4. 组件模板渲染 computedX 后，对 computed 更新行为的影响。
 */
describe('test23 - computed 自动解包行为研究', () => {
  // ========================================================================
  // 第一部分：纯 Vue API 层面的行为验证（不涉及 DI 框架和组件）
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

        expect(info.computedX_isRef).toBe(true);
        expect(info.computedX_value).not.toBe(1);

        expect(info.getComputedX_isRef).toBe(true);
        expect(info.getComputedX_value).not.toBe(1);

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

        expect(info.computedX_isRef).toBe(false);
        expect(info.computedX_value).toBe(1);

        expect(info.getComputedX_isRef).toBe(false);
        expect(info.getComputedX_value).toBe(1);

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
        expect(t.computedX.value).toBe(1);
      });

      it('普通对象：increaseX 修改 x 后 computedX 不会更新', () => {
        const t = new DemoService();

        expect(t.computedX.value).toBe(1);
        t.increaseX();
        expect(t.x).toBe(2);
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

      it('reactive 对象：increaseX 修改后各属性均能更新', () => {
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
  // 第二部分：组件渲染对 computed 更新行为的影响
  //
  // 关键发现：问题不在于 DI，而在于组件模板是否渲染了 computedX。
  // 当模板渲染 service.computedX 时，reactive 代理自动解包 ComputedRef，
  // 此过程中 computed 被组件的渲染 effect 订阅。
  // 但 computed 内部的 this.x 不是响应式依赖（this 指向原始对象），
  // 所以 computed 的 dep 版本号永远不会递增。
  // 后续访问时 computed 认为自己是"干净的"，直接返回缓存值。
  //
  // 而在不渲染的场景中，computed 没有被任何 effect 订阅，
  // 每次访问 .value 时 Vue 会走另一个代码路径（检查 globalVersion），
  // 能检测到全局有变化从而重新计算。
  // ========================================================================
  describe('组件渲染对 computed 更新的影响', () => {
    it('模板渲染了 computedX：increaseX 后 computedX 不会更新', () => {
      // DemoComp 模板中渲染了 service.computedX
      const wrapper = mount(DemoComp);
      const service = wrapper.vm.service;

      expect(service.computedX).toBe(1);
      service.increaseX();
      expect(service.x).toBe(2);
      // computedX 不会更新！
      expect(service.computedX).toBe(1);
    });

    it('模板未渲染 computedX：increaseX 后 computedX 能正常更新', () => {
      // 创建一个不在模板中渲染 computedX 的组件
      const NoComputedXComp = defineComponent({
        setup() {
          declareProviders([DemoService]);
          const service = useService(DemoService);
          return { service };
        },
        render() {
          return h('div', [
            h('div', { class: 'x' }, String(this.service.x)),
          ]);
        },
      });

      const wrapper = mount(NoComputedXComp);
      const service = wrapper.vm.service;

      expect(service.computedX).toBe(1);
      service.increaseX();
      expect(service.x).toBe(2);
      // computedX 能正常更新！
      expect(service.computedX).toBe(2);
    });

    it('不使用 DI，直接 new + reactive 在组件中渲染 computedX：同样不会更新', () => {
      // 证明问题不在 DI，而在组件模板渲染
      const DirectComp = defineComponent({
        setup() {
          const t = new DemoService();
          const service = reactive(t);
          return { service };
        },
        render() {
          return h('div', [
            h('div', { class: 'x' }, String(this.service.x)),
            h('div', { class: 'computedX' }, String(this.service.computedX)),
          ]);
        },
      });

      const wrapper = mount(DirectComp);
      const service = wrapper.vm.service;

      expect(service.computedX).toBe(1);
      service.increaseX();
      expect(service.x).toBe(2);
      // 同样不会更新！证明问题和 DI 无关
      expect(service.computedX).toBe(1);
    });

    it('DI 但模板不使用 service：computedX 能正常更新', () => {
      const NoRenderComp = defineComponent({
        setup() {
          declareProviders([DemoService]);
          const service = useService(DemoService);
          return { service };
        },
        render() {
          return h('div', 'nothing');
        },
      });

      const wrapper = mount(NoRenderComp);
      const service = wrapper.vm.service;

      expect(service.computedX).toBe(1);
      service.increaseX();
      expect(service.x).toBe(2);
      expect(service.computedX).toBe(2);
    });
  });

  // ========================================================================
  // 第三部分：DI 框架注入 + 组件渲染后的完整行为验证
  // ========================================================================
  describe('DI 框架注入 + 组件渲染后的行为验证', () => {
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

    describe('响应式更新（模板渲染了 computedX）', () => {
      it('increaseX 后：computedX 不会更新（被渲染 effect 订阅后锁定缓存）', () => {
        const wrapper = mount(DemoComp);
        const service = wrapper.vm.service;

        expect(service.x).toBe(1);
        expect(service.computedX).toBe(1);

        service.increaseX();

        expect(service.x).toBe(2);
        expect(service.computedX).toBe(1); // 不更新

        expect(service.getX).toBe(2);
        expect(service.getComputedX).toBe(2);
      });

      it('increaseX 后：类内部 this 访问的解包和更新情况', () => {
        const wrapper = mount(DemoComp);
        const service = wrapper.vm.service;

        service.increaseX();
        const info = service.inspectInternalAccess();

        expect(info.x_value).toBe(2);

        expect(info.computedX_isRef).toBe(false);
        expect(info.computedX_value).toBe(1); // 不更新

        expect(info.getComputedX_isRef).toBe(false);
        expect(info.getComputedX_value).toBe(2);

        expect(info.getX_value).toBe(2);
      });
    });

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
        expect(wrapper.get('.computedX').text()).toBe('1');
        expect(wrapper.get('.getX').text()).toBe('2');
        expect(wrapper.get('.getComputedX').text()).toBe('2');

        await wrapper.get('.btn-x').trigger('click');

        expect(wrapper.get('.x').text()).toBe('3');
        expect(wrapper.get('.computedX').text()).toBe('1');
        expect(wrapper.get('.getX').text()).toBe('3');
        expect(wrapper.get('.getComputedX').text()).toBe('3');
      });
    });
  });
});
