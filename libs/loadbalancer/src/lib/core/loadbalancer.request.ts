export class LoadBalancerRequest<T> {
  arguments: any[];

  constructor(...args: any[]) {
    this.arguments = args;
  }
}
