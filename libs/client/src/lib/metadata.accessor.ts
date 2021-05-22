import { Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CLIENT_SERVICE, HTTP_CLIENT_SERVICE } from './client.constants';
import { ClientMetadata } from './interfaces/client-metadata.interface';

@Injectable()
export class MetadataAccessor {
  constructor(private readonly reflector: Reflector) {}

  getHttpServices(target: Function): ClientMetadata[] | undefined {
    return this.reflector.get(HTTP_CLIENT_SERVICE, target);
  }

  getClientServices(target: Function): ClientMetadata[] | undefined {
    return this.reflector.get(CLIENT_SERVICE, target);
  }

  getAllServices(target: Function): ClientMetadata[] | undefined {
    let c = this.getClientServices(target);
    if (c) {
      return c;
    }

    c = this.getHttpServices(target);
    if (c) {
      return c;
    }

    return undefined;
  }
}
