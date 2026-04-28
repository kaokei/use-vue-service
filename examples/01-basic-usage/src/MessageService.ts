export class MessageService {
  public message = 'Hello, use-vue-service!';

  public updateMessage(msg: string) {
    this.message = msg;
  }
}
