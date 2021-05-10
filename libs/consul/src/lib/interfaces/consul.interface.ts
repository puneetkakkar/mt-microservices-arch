import * as Consul from 'consul';

import ConsulCheck = Consul.Agent.Check.RegisterOptions;
import ConsulService = Consul.Agent.Service.RegisterOptions;

export type Check = ConsulCheck;

export interface Service extends ConsulService {
  region?: string;
  status?: string;
}
