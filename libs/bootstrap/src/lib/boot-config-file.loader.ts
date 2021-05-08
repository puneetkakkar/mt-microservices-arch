import { Inject, Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { BOOTSTRAP_CONFIGURATION_OPTIONS } from './bootstrap.constants';
import { BootstrapModuleOptions } from './interfaces/bootstrap-options.interface';

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
    const configs = [];
    this.checkFileExists();
    this.files.forEach((file, index) => {
      configs.push(this.loadFile(file));
    });
  }

  public loadFile(path: string) {
    let config = {};
    if (!fs.existsSync(path)) {
      return config;
    }
    const configStr = fs.readFileSync(path).toString();
  }

  private checkFileExists() {
    if (this.files.length === 0) {
      throw new Error(`file bootstrap ${path} was not found`);
    }

    for (const f of this.files) {
      if (!fs.existsSync(f)) {
        throw new Error(`file ${f} was not found`);
      }
    }
  }

  private getFilesPath(): string[] {
    const filenames: string[] = [];
    const dirname = path.dirname(this.options.filePath);
    const filename = path.basename(this.options.filePath);
    const tokens = /(.+)\.(.+)/.exec(filename);

    if (tokens) {
      tokens.reverse().pop();
      filenames.push(path.resolve(dirname, `${tokens[1]}.${tokens[0]}`));
    } else {
      filenames.push(path.resolve(dirname, filename));
    }

    return filenames;
  }
}
