# Dynamic Service Management Scripts

This directory contains scripts to manage multiple instances of services for load balancing testing.

## Scripts Overview

### 1. `start-service.sh` - Start Multiple Service Instances
```bash
./scripts/start-service.sh <service-name> [instance-count] [base-port]
```

**Examples:**
```bash
# Start 3 instances of service-2 starting from port 3334
./scripts/start-service.sh service-2 3 3334

# Start 2 instances of service-1 starting from port 3333
./scripts/start-service.sh service-1 2 3333

# Start 1 instance of service-2 on default port 3334
./scripts/start-service.sh service-2
```

### 2. `stop-service.sh` - Stop All Instances of a Service
```bash
./scripts/stop-service.sh <service-name>
```

**Examples:**
```bash
# Stop all service-2 instances
./scripts/stop-service.sh service-2

# Stop all service-1 instances
./scripts/stop-service.sh service-1
```

### 3. `status.sh` - Check Service Status
```bash
./scripts/status.sh [service-name]
```

**Examples:**
```bash
# Check all services
./scripts/status.sh

# Check specific service
./scripts/status.sh service-2
```

### 4. `test-loadbalancer.sh` - Test Load Balancing
```bash
./scripts/test-loadbalancer.sh [service-name] [request-count]
```

**Examples:**
```bash
# Test load balancing for service-2 with 10 requests
./scripts/test-loadbalancer.sh service-2 10

# Test load balancing for service-1 with 5 requests
./scripts/test-loadbalancer.sh service-1 5
```

## Complete Load Balancing Test Workflow

### Step 1: Start Multiple Instances
```bash
# Start 3 instances of service-2
./scripts/start-service.sh service-2 3 3334

# Start 1 instance of service-1 (to call service-2)
./scripts/start-service.sh service-1 1 3333
```

### Step 2: Check Status
```bash
# Verify all instances are running
./scripts/status.sh

# Check specific service
./scripts/status.sh service-2
```

### Step 3: Test Load Balancing
```bash
# Test load balancing across service-2 instances
./scripts/test-loadbalancer.sh service-2 20
```

### Step 4: Clean Up
```bash
# Stop all instances
./scripts/stop-service.sh service-2
./scripts/stop-service.sh service-1
```

## How It Works

1. **Dynamic Port Allocation**: Each instance gets a unique port (base-port + instance-number)
2. **Consul Registration**: Each instance registers itself with Consul using its unique port
3. **Load Balancing**: The `@HttpServiceClient` decorator automatically discovers all instances
4. **Health Checks**: Each instance has its own health check endpoint
5. **Instance Identification**: Each instance includes unique identifiers in responses

## Expected Output

When testing load balancing, you should see responses from different instances:

```json
{
  "message": "Welcome to service-2!",
  "instanceId": "abc123",
  "port": 3334,
  "timestamp": "2025-07-05T00:30:00.000Z"
}
```

Different `instanceId` and `port` values indicate requests are being distributed across instances.

## Troubleshooting

- **Port Conflicts**: Ensure base-port + instance-count doesn't conflict with other services
- **Consul Issues**: Check if Consul is running: `curl http://localhost:8500/v1/status/leader`
- **Health Check Failures**: Verify health check URLs are accessible from Consul container 