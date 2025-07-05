#!/bin/bash

# Dynamic Service Starter Script
# Usage: ./scripts/start-service.sh <service-name> [instance-count] [base-port]

SERVICE_NAME=$1
INSTANCE_COUNT=${2:-1}
BASE_PORT=${3:-3333}

if [ -z "$SERVICE_NAME" ]; then
    echo "Usage: $0 <service-name> [instance-count] [base-port]"
    echo "Example: $0 service-1 3 3333"
    echo "Example: $0 service-2 2 3334"
    exit 1
fi

echo "Starting $INSTANCE_COUNT instance(s) of $SERVICE_NAME starting from port $BASE_PORT"

# Kill any existing instances
pkill -f "nx run $SERVICE_NAME:serve" || true

# Start multiple instances
for i in $(seq 1 $INSTANCE_COUNT); do
    PORT=$((BASE_PORT + i - 1))
    echo "Starting $SERVICE_NAME instance $i on port $PORT"
    
    # Start the service in background with specific port
    PORT=$PORT nx run $SERVICE_NAME:serve &
    
    # Store the PID for later cleanup
    echo $! > "/tmp/${SERVICE_NAME}-${i}.pid"
    
    # Wait a bit between starts
    sleep 2
done

echo "Started $INSTANCE_COUNT instance(s) of $SERVICE_NAME"
echo "PIDs saved in /tmp/${SERVICE_NAME}-*.pid"
echo ""
echo "To stop all instances:"
echo "pkill -f 'nx run $SERVICE_NAME:serve'"
echo ""
echo "To check running instances:"
echo "ps aux | grep 'nx run $SERVICE_NAME:serve'" 