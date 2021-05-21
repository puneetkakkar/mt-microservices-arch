import { MetadataStorage } from './storage';

export function getMetadataStorage(): MetadataStorage {
  return (
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    global.MetadataStorage || (global.MetadataStorage = new MetadataStorage())
  );
}
