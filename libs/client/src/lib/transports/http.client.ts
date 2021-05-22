import { Logger } from '@nestjs/common';
import { ServiceInstance } from '@swft-mt/common';
import { LoadBalancerClient, LoadBalancerRequest } from '@swft-mt/loadbalancer';
import * as got from 'got';
import { merge } from 'lodash';
import { HttpGotOptions, IHttpServiceClient } from '../interfaces';

export class HttpClient {
  private serviceId: string;
  private node: ServiceInstance;
  private httpOpts: HttpGotOptions & {
    baseUrl?: string;
    responseType?: 'json';
  } = {
    responseType: 'json',
  };
  private instance: got.Got;

  constructor(
    private readonly lb: LoadBalancerClient,
    options: IHttpServiceClient
  ) {
    this.init(options);
  }

  init(options: IHttpServiceClient) {
    try {
      this.serviceId = options.service;
      const { baseUrl } = this.getServiceAddress();
      this.httpOpts = this.mergeOptions(options, {
        responseType: 'json',
        baseUrl,
      });
      this.instance = got.default.extend({
        ...this.httpOpts,
      });
    } catch (e) {
      Logger.error(e);
    }
  }

  async get<T>(
    path: string,
    options?: Partial<HttpGotOptions>
  ): Promise<got.Response<string>> {
    return await this.request(path, 'GET', options);
  }

  async head<T>(
    path: string,
    options?: Partial<HttpGotOptions>
  ): Promise<got.Response<string>> {
    return await this.request(path, 'HEAD', options);
  }

  async delete<T>(
    path: string,
    options?: Partial<HttpGotOptions>
  ): Promise<got.Response<string>> {
    return await this.request(path, 'DELETE', options);
  }

  async post<T>(
    path: string,
    options?: Partial<HttpGotOptions>
  ): Promise<got.Response<string>> {
    return await this.request(path, 'POST', options);
  }

  async options<T>(
    path: string,
    options?: Partial<HttpGotOptions>
  ): Promise<got.Response<string>> {
    return await this.request(path, 'OPTIONS', options);
  }

  async trace<T>(
    path: string,
    options?: Partial<HttpGotOptions>
  ): Promise<got.Response<string>> {
    return await this.request(path, 'TRACE', options);
  }

  async put<T>(
    path: string,
    options?: Partial<HttpGotOptions>
  ): Promise<got.Response<string>> {
    return await this.request(path, 'PUT', options);
  }

  private doRequest(
    path: string,
    method: string,
    options?: Partial<HttpGotOptions>
  ) {
    return this.lb.execute(
      this.serviceId,
      this.node,
      new LoadBalancerRequest<
        Promise<got.Response<string>> & { cancel(): void }
      >(this.instance, path, { ...options, method })
    );
  }

  private request(
    path: string,
    method: 'GET' | 'POST' | 'PUT' | 'HEAD' | 'DELETE' | 'OPTIONS' | 'TRACE',
    options?: Partial<HttpGotOptions>
  ) {
    return this.doRequest(path, method, options);
  }

  private mergeOptions(
    target: HttpGotOptions & { baseUrl?: string; responseType?: 'json' },
    source?: HttpGotOptions & { baseUrl?: string; responseType?: 'json' }
  ) {
    return merge({}, target, source);
  }

  private getServiceAddress<T extends {}>(): {
    baseUrl: string;
    node: ServiceInstance;
  } {
    console.log('SERVICE_ID', this.serviceId);

    this.node = this.lb.choose(this.serviceId);
    console.log('NODE', this.node);

    const baseUrl = `${this.node.getScheme()}://${this.node.getHost()}:${this.node.getPort()}`;
    return { baseUrl, node: this.node };
  }
}
