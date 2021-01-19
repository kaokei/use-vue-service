import { Inject, Injectable, Namespace, Skip } from '@src/index';
import Logger from './logger.service';
import CounterService from './counter.service';

@Injectable()
export default class Person {
  constructor(
    public logger1: Logger,
    public logger2: Logger,
    @Inject(Logger) public logger3: Logger,
    public counterService11: CounterService,
    @Inject(CounterService) public counterService12: CounterService,
    @Skip() public counterService21: CounterService,
    @Skip() @Inject(CounterService) public counterService22: CounterService,
    @Skip(2) public counterService31: CounterService,
    @Skip(2) @Inject(CounterService) public counterService32: CounterService,
    @Skip(3) public counterService41: CounterService,
    @Skip(3) @Inject(CounterService) public counterService42: CounterService,
    @Skip(4) public counterService51: CounterService,
    @Skip(4) @Inject(CounterService) public counterService52: CounterService,
    @Skip(5) public counterService61: CounterService,
    @Skip(5) @Inject(CounterService) public counterService62: CounterService,
    @Namespace('test') @Skip(4) public counterService71: CounterService,
    @Namespace('test')
    @Skip(4)
    @Inject(CounterService)
    public counterService72: CounterService,
    @Namespace('test2') @Skip(4) public counterService81: CounterService,
    @Namespace('test2')
    @Skip(4)
    @Inject(CounterService)
    public counterService82: CounterService,
    @Namespace('test2') @Skip(5) public counterService91: CounterService,
    @Namespace('test2')
    @Skip(5)
    @Inject(CounterService)
    public counterService92: CounterService
  ) {}

  public check() {
    return (
      this.logger1 === this.logger2 &&
      this.logger1 === this.logger3 &&
      this.counterService11 === this.counterService12 &&
      this.counterService21 === this.counterService22 &&
      this.counterService31 === this.counterService32 &&
      this.counterService41 === this.counterService42 &&
      this.counterService51 === this.counterService52 &&
      this.counterService61 === this.counterService62 &&
      this.counterService71 === this.counterService72 &&
      this.counterService81 === this.counterService82 &&
      this.counterService11 !== this.counterService21 &&
      this.counterService21 !== this.counterService31 &&
      this.counterService31 !== this.counterService41 &&
      this.counterService41 !== this.counterService51 &&
      this.counterService51 === this.counterService61 &&
      this.counterService51 !== this.counterService71 &&
      this.counterService71 !== this.counterService81 &&
      this.counterService81 === this.counterService91
    );
  }
}
