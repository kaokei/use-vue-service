import { mount } from '@vue/test-utils';
import DemoComp from './DemoComp.vue';
import { ChildService } from './ChildService';
import {
  FIND_CHILDREN_SERVICES,
  FIND_CHILD_SERVICE,
  getRootService,
} from '@/index';

describe('test19', () => {
  it('get DemoService instance', async () => {
    mount(DemoComp);

    const findChildService = getRootService(FIND_CHILD_SERVICE);
    const findChildrenServices = getRootService(FIND_CHILDREN_SERVICES);

    const childService = findChildService(ChildService);

    const childServiceList = findChildrenServices(ChildService);

    expect(childService).toBeInstanceOf(ChildService);

    expect(childServiceList.length).toBe(3);

    expect(childService).toBe(childServiceList[0]);
  });
});
