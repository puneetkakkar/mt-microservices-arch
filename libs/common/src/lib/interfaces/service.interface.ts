import { DiscoveryOptions } from './discovery-options.interface';
import { PlainObject } from '../utils';

export interface Service {
  name: string;
  address: string;
  port?: number;
  id?: string;
  version?: string;
  domain?: string;
  metadata?: PlainObject;
  status?: string;
  tags?: string[];
  region?: string;
  checks?: DiscoveryOptions;
}
