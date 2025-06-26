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
    console.log('increaseAge => ', this)
    this.age++;
  }

  public changeName() {
    console.log('changeName => ', this)
    this.name = `${this.name}-${this.age}`;
  }
}
