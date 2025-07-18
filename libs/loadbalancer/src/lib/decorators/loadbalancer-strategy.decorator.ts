import { applyDecorators } from '@nestjs/common';
import { getMetadataStorage } from '@nexuskit/common';
import 'reflect-metadata';

export function LoadBalancerStrategy(name?: string): ClassDecorator {
  return applyDecorators((target, property) => {
    return getMetadataStorage().collectLbStrategyMetadata({
      property,
      target,
      name,
    });
  });
}
