import { Inject, Injectable, Skip } from '@src/index';
import Logger from './logger.service';
import CounterService from './counter.service';

@Injectable()
export default class Person {
  @Inject()
  public logger11!: Logger;

  @Inject(Logger)
  public logger21!: Logger;

  constructor(
    public logger1: Logger,
    public logger2: Logger,
    @Inject(Logger) public logger3: Logger,
    public counterService11: CounterService,
    @Inject(CounterService) public counterService12: CounterService,
    @Skip() public counterService21: CounterService,
    @Skip() @Inject(CounterService) public counterService22: CounterService,
    public counterService31: CounterService,
    @Inject(CounterService)
    public counterService32: CounterService
  ) {}

  public check() {
    return (
      this.logger1 === this.logger2 &&
      this.logger1 === this.logger3 &&
      this.counterService11 === this.counterService12 &&
      this.counterService21 === this.counterService22 &&
      this.counterService31 === this.counterService32 &&
      this.counterService11 !== this.counterService21 &&
      this.counterService21 !== this.counterService31
    );
  }
}
