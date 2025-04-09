import { DemoService } from './DemoService';
import { OtherService } from './OtherService';
import { Token } from '@/index';

export const TYPES = {
  DemoService: new Token<DemoService>('DemoService'),
  OtherService: new Token<OtherService>('OtherService'),
};
