import * as YAML from 'yaml';

export enum StringFormatType {
  json = 'json',
  yaml = 'yaml',
}

export function isValidYaml(rawString: string): boolean {
  try {
    if (YAML.parse(rawString)) {
      return true;
    }

    return false;
  } catch (e) {
    return false;
  }
}

export function isValidJson(rawString: string): boolean {
  try {
    JSON.parse(rawString);
    return true;
  } catch (_) {
    return false;
  }
}

export function stringToObjectType(rawString: string): any {
  if (isValidJson(rawString)) {
    return JSON.parse(rawString);
  } else if (isValidYaml(rawString)) {
    return YAML.parse(rawString);
  }

  throw new Error('Invalid config format (only supports json and yaml)');
}
