import { applyDecorators } from '@nestjs/common';
import { ExtendMetadata } from '@nexuskit/common';
import { HTTP_CLIENT_SERVICE } from 'libs/client/src/lib/client.constants';
import { IHttpServiceClient } from '../interfaces';

export function HttpServiceClient(
  name: string,
  options?: Omit<IHttpServiceClient, 'transport'>,
) {
  return applyDecorators((target, property) => {
    return ExtendMetadata(HTTP_CLIENT_SERVICE, {
      name,
      property,
      options: { ...options, transport: 'http', service: name },
    })(target, property);
  });
}
