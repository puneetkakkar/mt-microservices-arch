import { Hooks } from 'got';
import * as nodeStream from 'stream';

export interface HttpGotOptions {
  header?: { [key: string]: string };
  body?: string | Buffer | nodeStream.Readable;
  hooks?: Hooks;
  timeout?: number | object;
  retry?: number | object;
  decompress?: boolean;
  throwHttpErrors?: boolean;
  http2?: boolean;
  followRedirect?: boolean;
  isStream?: boolean;
  auth?: string;
  ca?: string;
  searchParams?: import('url').URLSearchParams;
}

export interface IHttpServiceClient extends HttpGotOptions {
  transport: 'http';
  service?: string;
  url?: string;
}

export type ClientOptions = IHttpServiceClient;
