# Multi-Tenant Microservice Architecture

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10.0+-red.svg)](https://nestjs.com/)
[![Nx](https://img.shields.io/badge/Nx-17.0+-purple.svg)](https://nx.dev/)

A production-ready, enterprise-grade microservice architecture foundation built with NestJS and Nx. This framework provides a robust, scalable, and maintainable foundation for building distributed systems with built-in service discovery, load balancing, dynamic scaling, and multi-tenancy support.

## 🚀 Features

### Core Architecture

- **🏗️ Monorepo Structure**: Built with Nx for efficient development and build processes
- **🔍 Service Discovery**: Automatic service registration and discovery using Consul or ZooKeeper
- **⚖️ Load Balancing**: Intelligent load balancing with configurable strategies
- **🔄 Dynamic Scaling**: Support for multiple instances of the same service with dynamic port allocation
- **🌐 HTTP Client**: Declarative HTTP service clients with automatic service resolution
- **🔄 Health Checks**: Built-in health monitoring with configurable timeouts
- **🛡️ Graceful Shutdown**: Proper application lifecycle management
- **📊 Real-time Monitoring**: Live service status and health tracking

### Service Infrastructure

- **📡 Service Registry**: Centralized service registration and management via Consul or ZooKeeper
- **🔧 Configuration Management**: Flexible configuration loading from multiple sources
- **📊 Service Monitoring**: Real-time service health and status tracking
- **🔄 Retry Mechanisms**: Robust error handling with configurable retry policies
- **🎯 Metadata Management**: Comprehensive service metadata and tagging system
- **🔄 Auto-scaling**: Dynamic service instance management with load balancing

### Development Experience

- **🔧 TypeScript First**: Full TypeScript support with strict typing
- **📦 Modular Design**: Clean separation of concerns with reusable libraries
- **🧪 Testing Ready**: Built-in testing infrastructure with Jest
- **📝 Code Quality**: ESLint and Prettier integration for consistent code style
- **🚀 Hot Reload**: Development server with automatic reloading
- **🛠️ Management Scripts**: Automated scripts for service lifecycle management

## 🏗️ Architecture Overview

This project follows a modular microservice architecture with the following key components:

```
├── apps/                    # Application services
│   ├── service-1/          # Example microservice 1 (port 3333)
│   └── service-2/          # Example microservice 2 (port 3334)
├── libs/                   # Shared libraries
│   ├── bootstrap/          # Configuration management
│   ├── client/             # HTTP client framework
│   ├── cloud/              # Cloud-native abstractions
│   ├── common/             # Shared utilities and interfaces
│   ├── consul/             # Service discovery and registry
│   ├── loadbalancer/       # Load balancing strategies
│   └── zookeeper/          # ZooKeeper service discovery and registry
├── scripts/                # Service management scripts
│   ├── start-service.sh    # Dynamic service startup
│   ├── stop-service.sh     # Service shutdown
│   ├── status.sh           # Service status monitoring
│   └── test-loadbalancer.sh # Load balancing tests
```

### Key Libraries

- **`@swft-mt/bootstrap`**: Configuration management with file-based loading
- **`@swft-mt/client`**: Declarative HTTP service clients with service discovery
- **`@swft-mt/cloud`**: Cloud-native service abstractions and registry management
- **`@swft-mt/common`**: Shared utilities, interfaces, and common functionality
- **`@swft-mt/consul`**: Consul integration for service discovery and health checks
- **`@swft-mt/loadbalancer`**: Configurable load balancing with multiple strategies
- **`@swft-mt/zookeeper`**: ZooKeeper integration for service discovery and registry

## 🛠️ Technology Stack

| Component            | Technology | Version |
| -------------------- | ---------- | ------- |
| **Runtime**          | Node.js    | 18+     |
| **Framework**        | NestJS     | 10.0+   |
| **Language**         | TypeScript | 5.0+    |
| **Build System**     | Nx         | 17.0+   |
| **Service Registry** | Consul/ZooKeeper | 1.21+/3.8+ |
| **HTTP Client**      | Got        | 11.8.2  |
| **Testing**          | Jest       | 29.0+   |
| **Linting**          | ESLint     | 8.0+    |
| **Formatting**       | Prettier   | 3.0+    |

## 📦 Installation

### Prerequisites

- Node.js 18 or higher
- npm or yarn package manager
- Docker (for Consul)

### Quick Start

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/mt-microservices-arch.git
   cd mt-microservices-arch
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start Service Registry (required for service discovery)**

   ```bash
   # Using Consul (recommended)
   docker run -d --name consul -p 8500:8500 hashicorp/consul:latest

   # Or using ZooKeeper
   docker run -d --name zookeeper -p 2181:2181 zookeeper:3.8

   # Or install locally
   # Follow instructions at https://www.consul.io/docs/install or https://zookeeper.apache.org/doc/current/zookeeperStarted.html
   ```

4. **Start the development servers**

   ```bash
   # Start all services
   npm run start

   # Start specific service
   npm run start service-1
   npm run start service-2
   ```

## 🚀 Usage

### Dynamic Service Management

The project includes powerful scripts for managing multiple service instances:

#### Start Multiple Service Instances

```bash
# Start 3 instances of service-2 starting from port 3334
./scripts/start-service.sh service-2 3 3334

# Start 2 instances of service-1 starting from port 3333
./scripts/start-service.sh service-1 2 3333

# Start 1 instance of service-2 on default port 3334
./scripts/start-service.sh service-2
```

#### Monitor Service Status

```bash
# Check all services
./scripts/status.sh

# Check specific service
./scripts/status.sh service-2
```

#### Test Load Balancing

```bash
# Test load balancing for service-2 with 10 requests
./scripts/test-loadbalancer.sh service-2 10

# Test load balancing for service-1 with 5 requests
./scripts/test-loadbalancer.sh service-1 5
```

#### Test ZooKeeper Integration

```bash
# Test ZooKeeper service discovery and registration
./scripts/test-zookeeper.sh
```

#### Stop Services

```bash
# Stop all service-2 instances
./scripts/stop-service.sh service-2

# Stop all service-1 instances
./scripts/stop-service.sh service-1
```

### Creating a New Service

1. **Generate a new service using Nx**

   ```bash
   npx nx generate @nx/nest:application my-service
   ```

2. **Configure the service module**

   ```typescript
   import { Module } from '@nestjs/common';
   import { BootstrapModule } from '@swft-mt/bootstrap';
   import { ClientModule } from '@swft-mt/client';
   import { CloudModule } from '@swft-mt/cloud';
   import { ConsulModule } from '@swft-mt/consul';
   import { ZookeeperModule } from '@swft-mt/zookeeper';
   import { LoadBalancerModule } from '@swft-mt/loadbalancer';

   @Module({
     imports: [
       BootstrapModule.forRoot(),
       // Using Consul
       ConsulModule.forRoot({
         host: 'localhost',
         port: '8500',
         promisify: true,
         secure: false,
       }),
       // Or using ZooKeeper
       ZookeeperModule.forRoot({
         host: 'localhost:2181',
         retryAttempts: 6000,
       }),
       CloudModule.forRoot({
         registry: {
           discoverer: 'consul', // or 'zookeeper'
           service: {
             name: 'my-service',
             address: 'localhost',
             port: parseInt(process.env.PORT) || 3000,
           },
           discovery: {
             type: 'http',
             http: `http://192.168.1.201:${process.env.PORT || 3000}/api/health`,
             interval: 10,
             timeout: '5s',
             failFast: false,
             scheme: 'http',
           },
           heartbeat: {
             enabled: false,
             ttlInSeconds: 30,
           },
         },
       }),
       ClientModule.forRoot(),
       LoadBalancerModule.forRoot(),
     ],
   })
   export class AppModule {}
   ```

### Using HTTP Service Clients

```typescript
import { Controller, Get } from '@nestjs/common';
import { HttpClient, HttpServiceClient } from '@swft-mt/client';

@Controller()
export class AppController {
  @HttpServiceClient('service-2', {
    timeout: 5000, // 5 second timeout
    retry: 2, // retry 2 times
  })
  serviceInstance: HttpClient;

  @Get('/service-2')
  async getServiceData() {
    try {
      const svcData = await this.serviceInstance.get('api/');
      return svcData.body;
    } catch (error) {
      return {
        error: 'Service-2 is not available',
        message: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
```

### Configuration Management

Create a `bootstrap.yaml` file in your service directory:

```yaml
config:
  service:
    name: 'My Service'
```

## 🔧 Configuration

### Environment Variables

| Variable      | Description  | Default     |
| ------------- | ------------ | ----------- |
| `PORT`        | Service port | 3333        |
| `NODE_ENV`    | Environment  | development |
| `CONSUL_HOST` | Consul host  | localhost   |
| `CONSUL_PORT` | Consul port  | 8500        |
| `ZOOKEEPER_HOST` | ZooKeeper host | localhost |
| `ZOOKEEPER_PORT` | ZooKeeper port | 2181 |

### Service Configuration

Each service can be configured through:

- Environment variables
- Bootstrap configuration files (`bootstrap.yaml`, `bootstrap.json`)
- Runtime configuration injection

### Health Check Configuration

```typescript
discovery: {
  type: 'http',
  http: `http://192.168.1.201:${process.env.PORT || 3333}/api/health`,
  interval: 10,        // Check every 10 seconds
  timeout: '5s',       // 5 second timeout
  failFast: false,     // Don't fail fast on health check failure
  scheme: 'http',
}
```

## 🧪 Testing

### Unit Tests

```bash
# Run all tests
npm run test

# Run tests for specific service
npm run test service-1

# Run e2e tests
npm run e2e

# Run affected tests
npm run affected:test
```

### Load Balancing Tests

```bash
# Test load balancing with multiple instances
./scripts/test-loadbalancer.sh service-2 20

# Expected output shows requests distributed across instances:
# Request 1: abc123 (port 3334)
# Request 2: def456 (port 3335)
# Request 3: abc123 (port 3334)
# ...
```

## 📊 Monitoring and Health Checks

The framework provides comprehensive health monitoring:

- **Service Health**: Automatic health check registration with Consul
- **Dynamic Timeouts**: Configurable health check timeouts (5s default)
- **Service Discovery**: Real-time service availability tracking
- **Load Balancer Health**: Health-aware load balancing across instances
- **Instance Monitoring**: Individual instance health tracking

### Health Check Endpoints

Each service automatically exposes a health endpoint:

```bash
# Check service health
curl http://localhost:3333/api/health
# Response: {"status":"ok","timestamp":"2025-07-05T00:30:00.000Z"}

# Check service-2 health
curl http://localhost:3334/api/health
# Response: {"status":"ok","timestamp":"2025-07-05T00:30:00.000Z"}
```

### Service Registry Health Monitoring

#### Consul Health Monitoring

```bash
# View all services in Consul
curl http://localhost:8500/v1/agent/services | jq

# View health checks
curl http://localhost:8500/v1/agent/checks | jq

# View healthy service instances
curl "http://localhost:8500/v1/health/service/service-2?passing=true" | jq
```

#### ZooKeeper Health Monitoring

```bash
# View all services in ZooKeeper
docker exec zookeeper zkCli.sh -server localhost:2181 ls /swft-mt-service

# View service details
docker exec zookeeper zkCli.sh -server localhost:2181 get /swft-mt-service/service__service-2__1.0.0-<uuid>

# View service instances
docker exec zookeeper zkCli.sh -server localhost:2181 ls /swft-mt-service/service__service-2__1.0.0-<uuid>
```

## 🔒 Security

- **Graceful Shutdown**: Proper signal handling and cleanup
- **Error Handling**: Comprehensive error handling with retry mechanisms
- **Service Isolation**: Service-level isolation and security boundaries
- **Configuration Security**: Secure configuration management
- **Health Check Security**: Configurable health check endpoints

## 🚀 Production Deployment

### Docker Deployment

```bash
# Build services
npx nx build service-1
npx nx build service-2

# Run with Docker Compose
docker-compose up -d
```

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: service-1
spec:
  replicas: 3
  selector:
    matchLabels:
      app: service-1
  template:
    metadata:
      labels:
        app: service-1
    spec:
      containers:
      - name: service-1
        image: your-registry/service-1:latest
        ports:
        - containerPort: 3333
        env:
        - name: PORT
          value: "3333"
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

### Code Style

This project uses:

- ESLint for code linting
- Prettier for code formatting
- TypeScript strict mode
- Conventional commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [Wiki](https://github.com/your-username/mt-microservices-arch/wiki)
- **Issues**: [GitHub Issues](https://github.com/your-username/mt-microservices-arch/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/mt-microservices-arch/discussions)

## 🙏 Acknowledgments

- [NestJS](https://nestjs.com/) - Progressive Node.js framework
- [Nx](https://nx.dev/) - Build system with first-class support for many frontend and backend technologies
- [Consul](https://www.consul.io/) - Service mesh solution providing a full featured control plane
- [ZooKeeper](https://zookeeper.apache.org/) - Distributed coordination service for distributed applications
- [TypeScript](https://www.typescriptlang.org/) - Typed JavaScript at scale

---

**Built with ❤️ for the microservices community**
