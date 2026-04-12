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

      it('普通对象：不先访问 computedX.value 直接修改，computedX 也不会更新（this.x 始终非响应式）', () => {
        const t = new DemoService();

        // 不先访问 computedX.value
        t.x = 42;
        // 普通对象上 computed 内部的 this.x 不是响应式的，
        // 但第一次求值时 this.x 已经是 42，所以返回 42
        expect(t.computedX.value).toBe(42);

        // 再次修改后同样不更新（NO_DIRTY_CHECK 锁定）
        t.x = 100;
        expect(t.computedX.value).toBe(42);
      });

      it('reactive 对象：先访问 computedX 再修改 rt.x，computedX 不会更新（NO_DIRTY_CHECK 锁定）', () => {
        const t = new DemoService();
        const rt = reactive(t);

        // 先访问 computedX → computed 求值 → 发现无响应式依赖 → flags 变为 NO_DIRTY_CHECK
        expect(rt.computedX).toBe(1);
        rt.x = 42;

        // computedX 被 NO_DIRTY_CHECK 锁定，永远返回缓存值
        expect(rt.computedX).toBe(1);
        // getX 和 getComputedX 不受影响，因为 getter 中 this 指向 reactive 代理
        expect(rt.getX).toBe(42);
        expect(rt.getComputedX).toBe(42);
      });

      it('reactive 对象：不先访问 computedX 直接修改 rt.x，computedX 看起来能更新（延迟求值的时序巧合）', () => {
        const t = new DemoService();
        const rt = reactive(t);

        // 不先访问 computedX，直接修改
        rt.x = 42;

        // computed 还没求值过（flags 仍为 TRACKING），第一次求值时 this.x 已经是 42
        expect(rt.computedX).toBe(42);
        expect(rt.getX).toBe(42);
        expect(rt.getComputedX).toBe(42);

        // 但再次修改后就不会更新了，因为上面的访问已经触发了 NO_DIRTY_CHECK
        rt.x = 100;
        expect(rt.computedX).toBe(42); // 锁定在第一次求值的结果
        expect(rt.getX).toBe(100);
        expect(rt.getComputedX).toBe(100);
      });

      it('reactive 对象：increaseX 修改后各属性均能更新（延迟求值的时序巧合）', () => {
        const t = new DemoService();
        const rt = reactive(t);

        expect(rt.x).toBe(1);
        rt.increaseX();

        expect(rt.x).toBe(2);
        expect(rt.getX).toBe(2);
        expect(rt.getComputedX).toBe(2);
        // 注意：这里 computedX 返回 2 不是因为响应式更新，
        // 而是因为修改前从未访问过 computedX，此时是第一次求值，
        // this.x 已经是 2 了，所以"碰巧"返回正确值。
        expect(rt.computedX).toBe(2);
      });
    });
  });

  // ========================================================================
  // 第二部分：组件渲染对 computed 更新行为的影响
  //
  // 关键发现：computed(() => this.x) 中的 this 指向原始对象（非 reactive 代理），
  // 所以 computed 永远无法收集到响应式依赖。
  //
  // Vue 3.5+ 的 NO_DIRTY_CHECK 机制：
  // computed 第一次求值后，如果发现没有收集到任何响应式依赖（deps 为空），
  // 会将 flags 设置为 NO_DIRTY_CHECK (128)，后续访问直接返回缓存值。
  //
  // 因此，只要 computedX 被访问过一次（无论是通过模板渲染还是测试代码），
  // 它就会被永久锁定。之前观察到的"未渲染时能更新"只是延迟求值的时序巧合：
  // 如果修改发生在 computed 第一次求值之前，第一次求值时读到的就是新值。
  //
  // 详见：docs/note/11.computed缓存陷阱.md
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

    it('模板未渲染 computedX：先访问 computedX 再 increaseX，computedX 不会更新（NO_DIRTY_CHECK 锁定）', () => {
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

      // 先访问 computedX → NO_DIRTY_CHECK 锁定
      expect(service.computedX).toBe(1);
      service.increaseX();
      expect(service.x).toBe(2);
      // computedX 不会更新，因为已被 NO_DIRTY_CHECK 锁定
      expect(service.computedX).toBe(1);
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

    it('DI 但模板不使用 service：先访问 computedX 再修改，computedX 不会更新（NO_DIRTY_CHECK 锁定）', () => {
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

      // 先访问 computedX → NO_DIRTY_CHECK 锁定
      expect(service.computedX).toBe(1);
      service.increaseX();
      expect(service.x).toBe(2);
      // computedX 不会更新
      expect(service.computedX).toBe(1);
    });

    it('DI 但模板不使用 service：不先访问 computedX，看起来能更新（延迟求值的时序巧合）', () => {
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

      // 不先访问 computedX，直接修改
      service.increaseX();
      expect(service.x).toBe(2);
      // 第一次访问 computedX，此时 this.x 已经是 2，所以"碰巧"返回 2
      expect(service.computedX).toBe(2);

      // 但再次修改后就不更新了
      service.increaseX();
      expect(service.x).toBe(3);
      expect(service.computedX).toBe(2); // 锁定在第一次求值的结果
    });

    it('模板未渲染 computedX：不先访问 computedX，看起来能更新（延迟求值的时序巧合）', () => {
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

      // 不先访问 computedX，直接修改
      service.increaseX();
      expect(service.x).toBe(2);
      // 第一次访问 computedX，此时 this.x 已经是 2
      expect(service.computedX).toBe(2);

      // 但再次修改后就不更新了
      service.increaseX();
      expect(service.x).toBe(3);
      expect(service.computedX).toBe(2); // 锁定
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
