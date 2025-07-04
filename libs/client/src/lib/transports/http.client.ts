import { Logger } from '@nestjs/common';
import { ServiceInstance } from '@swft-mt/common';
import { LoadBalancerClient, LoadBalancerRequest } from '@swft-mt/loadbalancer';
import { merge } from 'lodash';
import { HttpGotOptions, IHttpServiceClient } from '../interfaces';

export class HttpClient {
  private serviceId: string;
  private node: ServiceInstance;
  private httpOpts: HttpGotOptions & {
    prefixUrl?: string;
    responseType?: 'json';
  } = {
    responseType: 'json',
  };
  private instance: any;

  constructor(
    private readonly lb: LoadBalancerClient,
    options: IHttpServiceClient,
  ) {
    this.init(options).catch((e) =>
      Logger.error('Failed to initialize HttpClient:', e),
    );
  }

  async init(options: IHttpServiceClient) {
    try {
      this.serviceId = options.service;
      const { prefixUrl } = this.getServiceAddress();
      this.httpOpts = this.mergeOptions(options, {
        responseType: 'json',
        prefixUrl,
      });
      // Convert timeout to proper format if it's a number
      if (this.httpOpts.timeout && typeof this.httpOpts.timeout === 'number') {
        this.httpOpts.timeout = { request: this.httpOpts.timeout };
      }
      // Convert retry to proper format if it's a number
      if (this.httpOpts.retry && typeof this.httpOpts.retry === 'number') {
        this.httpOpts.retry = { limit: this.httpOpts.retry };
      }
      const { default: got } = await import('got');
      this.instance = got.extend({
        ...this.httpOpts,
      } as any);
    } catch (e) {
      Logger.error(e);
      throw e;
    }
  }

  async get<T>(path: string, options?: Partial<HttpGotOptions>) {
    return await this.request(path, 'GET', options);
  }

  async head<T>(path: string, options?: Partial<HttpGotOptions>) {
    return await this.request(path, 'HEAD', options);
  }

  async delete<T>(path: string, options?: Partial<HttpGotOptions>) {
    return await this.request(path, 'DELETE', options);
  }

  async post<T>(path: string, options?: Partial<HttpGotOptions>) {
    return await this.request(path, 'POST', options);
  }

  async options<T>(path: string, options?: Partial<HttpGotOptions>) {
    return await this.request(path, 'OPTIONS', options);
  }

  async trace<T>(path: string, options?: Partial<HttpGotOptions>) {
    return await this.request(path, 'TRACE', options);
  }

  async put<T>(path: string, options?: Partial<HttpGotOptions>) {
    return await this.request(path, 'PUT', options);
  }

  private async doRequest(
    path: string,
    method: string,
    options?: Partial<HttpGotOptions>,
  ) {
    return this.lb.execute(
      this.serviceId,
      this.node,
      new LoadBalancerRequest<Promise<any> & { cancel(): void }>(
        this.instance,
        path,
        { ...options, method },
      ),
    );
  }

  public request(
    path: string,
    method: 'GET' | 'POST' | 'PUT' | 'HEAD' | 'DELETE' | 'OPTIONS' | 'TRACE',
    options?: Partial<HttpGotOptions>,
  ) {
    return this.doRequest(path, method, options);
  }

  private mergeOptions(
    target: HttpGotOptions & { prefixUrl?: string; responseType?: 'json' },
    source?: HttpGotOptions & { prefixUrl?: string; responseType?: 'json' },
  ) {
    return merge({}, target, source);
  }

  private getServiceAddress<T extends {}>(): {
    prefixUrl: string;
    node: ServiceInstance;
  } {
    this.node = this.lb.choose(this.serviceId);
    const prefixUrl = `${this.node.getScheme()}://${this.node.getHost()}:${this.node.getPort()}`;
    return { prefixUrl, node: this.node };
  }
}
