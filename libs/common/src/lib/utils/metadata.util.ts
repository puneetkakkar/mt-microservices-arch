import 'reflect-metadata';

export const ExtendMetadata = <K = any, V = any>(
  metadataKey: K,
  metadataValue: V
) => (target: object, key?: any, descriptor?: any) => {
  if (descriptor) {
    const previousValue =
      Reflect.getMetadata(metadataKey, descriptor.value) || [];
    const value = [...previousValue, metadataValue];
    Reflect.defineMetadata(metadataKey, value, descriptor.value);
    return descriptor;
  }

  const previousValue = Reflect.getMetadata(metadataKey, target) || [];
  const value = [...previousValue, metadataValue];
  Reflect.defineMetadata(metadataKey, value, target);
  return target;
};

export class ReflectMetadataMissingError extends Error {
  constructor() {
    super(
      "Looks like you've forgot to provide experimental metadata API polyfill."
    );

    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function ensureReflectMetadataExists() {
  if (
    typeof Reflect !== 'object' ||
    typeof Reflect.decorate !== 'function' ||
    typeof Reflect.metadata !== 'function'
  ) {
    throw new ReflectMetadataMissingError();
  }
}
