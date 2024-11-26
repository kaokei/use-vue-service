import { DemoService } from './DemoService';
import { OtherService } from './OtherService';
import { createToken } from '../../src/inversify';

export const TYPES = {
  DemoService: createToken<DemoService>('DemoService'),
  OtherService: createToken<OtherService>('OtherService'),
};
