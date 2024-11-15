export class DemoService {
  public name = 'demo';
  public age = 100;

  public increaseAge() {
    this.age++;
  }

  public changeName() {
    this.name = `${this.name}-${this.age}`;
  }
}
