import { Computed } from '@/index';

export class DemoService {
  public name = 'demo';
  public age = 100;

  public get sumage() {
    return this.age + 10000;
  }

  @Computed
  public get computedsumage() {
    return this.age + 1000000;
  }

  public increaseAge() {
    this.age++;
  }

  public changeName() {
    this.name = `${this.name}-${this.age}`;
  }
}
