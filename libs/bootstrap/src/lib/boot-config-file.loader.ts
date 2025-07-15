import { Inject, Injectable } from '@nestjs/common';
import { stringToObjectType } from '@swft-mt/common';
import { existsSync, readFileSync } from 'fs';
import { basename, dirname, resolve, toNamespacedPath } from 'path';
import { BOOTSTRAP_CONFIGURATION_OPTIONS } from './bootstrap.constants';
import { BootstrapModuleOptions } from './interfaces/bootstrap-options.interface';
import { defaultsDeep } from 'lodash';

@Injectable()
export class BootConfigFileLoader {
  private readonly files: string[];

  constructor(
    @Inject(BOOTSTRAP_CONFIGURATION_OPTIONS)
    private readonly options: BootstrapModuleOptions
  ) {
    this.files = this.getFilesPath();
  }

  public load(): any {
    const configs: any[] = [];
    this.checkFileExists();
    this.files.forEach((file, index) => {
      configs.push(this.loadFile(file));
    });

    return defaultsDeep({}, ...configs);
  }

  public loadFile(path: string) {
    let config = {};
    if (!existsSync(path)) {
      return config;
    }

    const configStr = readFileSync(path).toString();
    config = stringToObjectType(configStr);
    return config;
  }

  private checkFileExists() {
    if (this.files.length === 0) {
      throw new Error(`file bootstrap ${toNamespacedPath} was not found`);
    }

    for (const f of this.files) {
      if (!existsSync(f)) {
        throw new Error(`file ${f} was not found`);
      }
    }
  }

  private getFilesPath(): string[] {
    const filenames: string[] = [];
    const filedirname = dirname(this.options.filePath);
    const filename = basename(this.options.filePath);
    const tokens = /(.+)\.(.+)/.exec(filename);

    if (tokens) {
      tokens.reverse().pop();
      filenames.push(resolve(filedirname, `${tokens[1]}.${tokens[0]}`));
    } else {
      filenames.push(resolve(filedirname, filename));
    }

    return filenames;
  }
}
