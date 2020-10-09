import { useService, declareProviders, Inject, Injectable } from "../../src";

@Injectable()
export default class CountService {
  public count = 0;

  public constructor() {}

  public add1() {
    this.count++;
  }
}
