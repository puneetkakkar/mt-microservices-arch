import { ClientOptions } from './client-options.interface';

export interface Client {
  property: string;
  target: Function;
  options: ClientOptions;
}
