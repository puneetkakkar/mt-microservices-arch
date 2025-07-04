import * as nodeStream from 'stream';

export interface HttpGotOptions {
  headers?: { [key: string]: string };
  body?: string | Buffer | nodeStream.Readable;
  hooks?: any; // Will be resolved dynamically
  timeout?: { request?: number; response?: number; deadline?: number };
  retry?: {
    limit?: number;
    methods?: string[]; // Will be resolved dynamically
    statusCodes?: number[];
    errorCodes?: string[];
  };
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
