export interface SharedHealthCheckOptions {
  serviceId?: string;
  serviceName?: string;
  interval?: number | undefined;
  failFast?: boolean;
  scheme?: string;
}

export interface HTTPDiscoveryOptions extends SharedHealthCheckOptions {
  type: 'http';
  timeout?: string | number | undefined;
  body?: string;
  header?: Map<string, any>;
  http: string;
  skipVerifyTLS?: boolean;
  method?: 'POST' | 'GET' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD' | 'PUT';
}

export interface TCPDiscoveryOptions extends SharedHealthCheckOptions {
  type: 'tcp';
  timeout?: string | number | undefined;
  tcp: string;
}

export type DiscoveryOptions = TCPDiscoveryOptions | HTTPDiscoveryOptions;
