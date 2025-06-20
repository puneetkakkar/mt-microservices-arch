# Multi-Tenant Microservice Architecture

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-14+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.1+-blue.svg)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-7.0+-red.svg)](https://nestjs.com/)
[![Nx](https://img.shields.io/badge/Nx-12.1.1-purple.svg)](https://nx.dev/)

A production-ready, enterprise-grade microservice architecture foundation built with NestJS and Nx. This framework provides a robust, scalable, and maintainable foundation for building distributed systems with built-in service discovery, load balancing, and multi-tenancy support.

## 🚀 Features

### Core Architecture
- **🏗️ Monorepo Structure**: Built with Nx for efficient development and build processes
- **🔍 Service Discovery**: Automatic service registration and discovery using Consul
- **⚖️ Load Balancing**: Intelligent load balancing with configurable strategies
- **🌐 HTTP Client**: Declarative HTTP service clients with automatic service resolution
- **🔄 Health Checks**: Built-in health monitoring and TTL-based heartbeat system
- **🛡️ Graceful Shutdown**: Proper application lifecycle management

### Service Infrastructure
- **📡 Service Registry**: Centralized service registration and management
- **🔧 Configuration Management**: Flexible configuration loading from multiple sources
- **📊 Service Monitoring**: Real-time service health and status tracking
- **🔄 Retry Mechanisms**: Robust error handling with configurable retry policies
- **🎯 Metadata Management**: Comprehensive service metadata and tagging system

### Development Experience
- **🔧 TypeScript First**: Full TypeScript support with strict typing
- **📦 Modular Design**: Clean separation of concerns with reusable libraries
- **🧪 Testing Ready**: Built-in testing infrastructure with Jest
- **📝 Code Quality**: ESLint and Prettier integration for consistent code style
- **🚀 Hot Reload**: Development server with automatic reloading

## 🏗️ Architecture Overview

This project follows a modular microservice architecture with the following key components:

```
├── apps/                    # Application services
│   ├── service-1/          # Example microservice 1
│   └── service-2/          # Example microservice 2
├── libs/                   # Shared libraries
│   ├── bootstrap/          # Configuration management
│   ├── client/             # HTTP client framework
│   ├── cloud/              # Cloud-native abstractions
│   ├── common/             # Shared utilities and interfaces
│   ├── consul/             # Service discovery and registry
│   └── loadbalancer/       # Load balancing strategies
```

### Key Libraries

- **`@swft-mt/bootstrap`**: Configuration management with file-based loading
- **`@swft-mt/client`**: Declarative HTTP service clients with service discovery
- **`@swft-mt/cloud`**: Cloud-native service abstractions and registry management
- **`@swft-mt/common`**: Shared utilities, interfaces, and common functionality
- **`@swft-mt/consul`**: Consul integration for service discovery and health checks
- **`@swft-mt/loadbalancer`**: Configurable load balancing with multiple strategies

## 🛠️ Technology Stack

| Component | Technology | Version |
|-----------|------------|---------|
| **Runtime** | Node.js | 14+ |
| **Framework** | NestJS | 7.0+ |
| **Language** | TypeScript | 4.1+ |
| **Build System** | Nx | 12.1.1 |
| **Service Registry** | Consul | 0.40.0 |
| **HTTP Client** | Got | 11.8.2 |
| **Testing** | Jest | 26.2.2 |
| **Linting** | ESLint | 7.22.0 |
| **Formatting** | Prettier | 2.2.1 |

## 📦 Installation

### Prerequisites

- Node.js 14 or higher
- npm or yarn package manager
- Consul (for service discovery)

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

3. **Start Consul (required for service discovery)**
   ```bash
   # Using Docker
   docker run -d --name consul -p 8500:8500 consul:latest
   
   # Or install locally
   # Follow instructions at https://www.consul.io/docs/install
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

### Creating a New Service

1. **Generate a new service using Nx**
   ```bash
   npx nx generate @nrwl/nest:application my-service
   ```

2. **Configure the service module**
   ```typescript
   import { Module } from '@nestjs/common';
   import { CloudModule } from '@swft-mt/cloud';
   import { ConsulModule } from '@swft-mt/consul';
   import { ClientModule } from '@swft-mt/client';
   import { LoadBalancerModule } from '@swft-mt/loadbalancer';

   @Module({
     imports: [
       CloudModule.forRoot({
         registry: {
           discoverer: 'consul',
           service: {
             name: 'my-service',
             address: 'localhost',
             port: parseInt(process.env.PORT) || 3000,
           },
         },
       }),
       ConsulModule.forRoot({
         host: 'localhost',
         port: '8500',
         promisify: true,
         secure: false,
       }),
       ClientModule.forRoot(),
       LoadBalancerModule.forRoot(),
     ],
   })
   export class AppModule {}
   ```

### Using HTTP Service Clients

```typescript
import { Injectable } from '@nestjs/common';
import { HttpServiceClient } from '@swft-mt/client';

@Injectable()
export class UserService {
  @HttpServiceClient('user-service')
  private userServiceClient: any;

  async getUsers() {
    return await this.userServiceClient.get('/users');
  }

  async createUser(userData: any) {
    return await this.userServiceClient.post('/users', {
      body: JSON.stringify(userData),
    });
  }
}
```

### Configuration Management

Create a `bootstrap.yml` file in your service directory:

```yaml
clients:
  consul:
    host: localhost
    port: 8500
    promisify: true
    secure: false

services:
  my-service:
    name: my-service
    port: 3000
    address: localhost
    version: 1.0.0
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Service port | 3333 |
| `NODE_ENV` | Environment | development |
| `CONSUL_HOST` | Consul host | localhost |
| `CONSUL_PORT` | Consul port | 8500 |

### Service Configuration

Each service can be configured through:
- Environment variables
- Bootstrap configuration files (`bootstrap.yml`, `bootstrap.json`)
- Runtime configuration injection

## 🧪 Testing

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

## 📊 Monitoring and Health Checks

The framework provides built-in health monitoring:

- **Service Health**: Automatic health check registration with Consul
- **TTL Heartbeat**: Configurable time-to-live heartbeat system
- **Service Discovery**: Real-time service availability tracking
- **Load Balancer Health**: Health-aware load balancing

## 🔒 Security

- **Graceful Shutdown**: Proper signal handling and cleanup
- **Error Handling**: Comprehensive error handling with retry mechanisms
- **Service Isolation**: Service-level isolation and security boundaries
- **Configuration Security**: Secure configuration management

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
- [TypeScript](https://www.typescriptlang.org/) - Typed JavaScript at scale

---

**Built with ❤️ for the microservices community**
