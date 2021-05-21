import { ensureReflectMetadataExists } from '../utils';
import { ClassType } from './class-type.interface';

export class MetadataStorage {
  instances: InstanceMetadata[] = [];

  strategies: InstanceMetadata[] = [];

  constructor() {
    ensureReflectMetadataExists();
  }

  collectLbStrategyMetadata(definition: InstanceMetadata) {
    this.strategies.push(definition);
  }

  clear() {
    this.instances = [];
    this.strategies = [];
  }
}

export type ClassTypeResolver = (of?: void) => ClassType;

export interface InstanceMetadata {
  name: string;
  target: Function;
  prototype?: any;
  property?: any;
  getObjectType?: ClassTypeResolver;
  fieldType?: string | ClassType<any>;
  objectType?: any;
}
