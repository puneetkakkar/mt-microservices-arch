export interface IReactiveClient<C> {
  connect(opts: any, client: C): Promise<any>;

  close(): void | Promise<void>;
}
