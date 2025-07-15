import { Injectable } from '@nestjs/common';
import { EventEmitter } from 'events';
import { get } from 'lodash';

@Injectable()
export class BootstrapStore extends EventEmitter {
  private _data: Object = {};
  private eventName = 'changed';

  public get data() {
    return this._data;
  }

  public set data(data: any) {
    this._data = data;
  }

  get<T>(path: string | undefined, defaults?: T): T {
    if (typeof path === 'undefined') {
      return defaults as T;
    }
    return get(this._data, path, defaults) as T;
  }
}
