import { Registration } from './registration.interface';

export interface ServiceRegistry<R extends Registration<any>> {
  register(registration: R): Promise<void>;
  deregister(registration: R): Promise<void>;
  close(): Promise<void>;
  setStatus(status: string): Promise<void>;
  getStatus(): Promise<string>;
}
