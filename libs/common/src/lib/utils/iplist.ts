import * as ip from 'ip';

export class IpUtils {
  static getIpAddress(): string {
    return ip.address();
  }
}
