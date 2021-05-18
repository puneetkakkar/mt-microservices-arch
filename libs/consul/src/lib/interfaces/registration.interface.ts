import { ServiceInstance } from './service-instance.interface';

export interface Registration<T> extends Omit<ServiceInstance, 'getState'> {
  getService(): T;
}
