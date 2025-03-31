import { DemoService } from './DemoService';
import { OtherService } from './OtherService';
import { Token } from '@kaokei/di';

export const TYPES = {
  DemoService: new Token<DemoService>('DemoService'),
  OtherService: new Token<OtherService>('OtherService'),
};
