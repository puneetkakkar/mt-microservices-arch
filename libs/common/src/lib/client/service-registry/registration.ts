import { ServiceInstance } from '../service-instance';

export interface Registration<T> extends Omit<ServiceInstance, 'getState'> {
  getService(): T;
}
