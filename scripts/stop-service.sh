#!/bin/bash

# Stop Service Script
# Usage: ./scripts/stop-service.sh <service-name>

SERVICE_NAME=$1

if [ -z "$SERVICE_NAME" ]; then
    echo "Usage: $0 <service-name>"
    echo "Example: $0 service-1"
    echo "Example: $0 service-2"
    exit 1
fi

echo "Stopping all instances of $SERVICE_NAME..."

# Kill all instances of the service
pkill -f "nx run $SERVICE_NAME:serve" || true

# Remove PID files
rm -f /tmp/${SERVICE_NAME}-*.pid

echo "Stopped all instances of $SERVICE_NAME" 