import { isNil } from 'lodash';
import * as uuid from 'uuid';
import { RegistryConfiguration } from '../interfaces';

export function validateRegistryOptions(
  options: RegistryConfiguration
): RegistryConfiguration {
  if (isNil(options.heartbeat)) {
    options.heartbeat = {
      ttlInSeconds: 30,
      enabled: true,
    };
  }

  if (!options.service.name) {
    throw new Error('Service name is required');
  }

  if (!options.service.address) {
    throw new Error('Service address is required');
  }

  if (!options.service.port) {
    throw new Error('Service port is required');
  }

  if (!options.service.domain) {
    options.service.domain = 'swft-mt';
  }

  if (!options.service.id) {
    options.service.id = `${options.service.name}-${uuid.v4()}`;
  }

  if (!options.service.version) {
    options.service.version = 'latest';
  }

  return options;
}
