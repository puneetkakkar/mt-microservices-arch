import { ServiceStatus } from '../constants';

export class ServiceInstanceState {
  status: ServiceStatus = ServiceStatus.CRITICAL;
  totalRequests = 0;
  activeRequestsCount = 0;
  weight = -1;
  responseTimeAvg = 0;
  responseTimeMax = 0;
  activeRequestCountTimeout = 10;
  lastActiveRequestsCountChangeTimestamp = 0;
  firstConnectionTimestamp = 0;
  lastConnectionFailedTimestamp: number = null;
  lastConnectionFailedMessage = '';
  failureCounts = 0;

  fixedWeight = false;

  ServiceInstanceState(fixedWeight?: boolean) {
    this.fixedWeight = fixedWeight || false;
  }

  getActiveRequestCount(currentTime?: number) {
    if (!currentTime) {
      currentTime = new Date().getTime();
    }
    const count = this.activeRequestsCount;
    if (count === 0) {
      return 0;
    } else if (
      currentTime - this.lastActiveRequestsCountChangeTimestamp >
        this.activeRequestCountTimeout * 1000 ||
      count < 0
    ) {
      return (this.activeRequestsCount = 0);
    } else {
      return count;
    }
  }

  get isHealthy() {
    return this.status !== ServiceStatus.CRITICAL;
  }

  incrementFailureCounts() {
    if (!this.failureCounts) {
      this.failureCounts = 0;
    }

    return ++this.failureCounts;
  }

  incrementRequestCounts() {
    if (!this.totalRequests) {
      this.totalRequests = 0;
    }

    return ++this.totalRequests;
  }

  incrementActiveRequests() {
    if (!this.activeRequestsCount) {
      this.activeRequestsCount = 0;
    }

    this.lastActiveRequestsCountChangeTimestamp = new Date().getTime();
    return ++this.activeRequestsCount;
  }

  decrementActiveRequests() {
    if (!this.activeRequestsCount) {
      return (this.activeRequestsCount = 0);
    }

    this.lastActiveRequestsCountChangeTimestamp = new Date().getTime();
    return --this.activeRequestsCount;
  }

  setConnectionFailedTime(message = '') {
    this.lastConnectionFailedTimestamp = new Date().getTime();
    this.lastConnectionFailedMessage = message;
    this.status = ServiceStatus.CRITICAL;
  }

  setFirstConnectionTime() {
    if (!this.firstConnectionTimestamp) {
      this.firstConnectionTimestamp = new Date().getTime();
    }
  }

  setResponseTime(time) {
    if (!this.fixedWeight) {
      this.weight = time - this.responseTimeAvg;
    }
    this.responseTimeAvg =
      (this.responseTimeAvg * (this.totalRequests - 1) + time) /
      this.totalRequests;
    this.responseTimeMax = Math.max(this.responseTimeMax, time);
  }
}
