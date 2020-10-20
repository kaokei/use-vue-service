import { Injectable } from "./Inject";

@Injectable()
export default class LoggerService {
  public constructor() {}

  public log(...args: any[]) {
    console.log('log service :>> ', ...args);
  }
}
