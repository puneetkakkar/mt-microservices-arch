#!/bin/bash

# Load Balancer Test Script
# Usage: ./scripts/test-loadbalancer.sh [service-name] [request-count]

SERVICE_NAME=${1:-service-2}
REQUEST_COUNT=${2:-10}

echo "=== Load Balancer Test ==="
echo "Testing load balancing for $SERVICE_NAME"
echo "Making $REQUEST_COUNT requests..."
echo ""

# Get the service that calls the target service
if [ "$SERVICE_NAME" = "service-2" ]; then
    CALLER_SERVICE="service-1"
    CALLER_PORT="3333"
elif [ "$SERVICE_NAME" = "service-1" ]; then
    CALLER_SERVICE="service-2"
    CALLER_PORT="3334"
else
    echo "Unknown service: $SERVICE_NAME"
    exit 1
fi

echo "Using $CALLER_SERVICE (port $CALLER_PORT) to call $SERVICE_NAME"
echo ""

# Check if caller service is running
if ! curl -s http://localhost:$CALLER_PORT/api/health > /dev/null; then
    echo "Error: $CALLER_SERVICE is not running on port $CALLER_PORT"
    exit 1
fi

# Make multiple requests and track responses
echo "Making requests..."
echo ""

for i in $(seq 1 $REQUEST_COUNT); do
    echo -n "Request $i: "
    
    # Make the request and extract the response
    response=$(curl -s http://localhost:$CALLER_PORT/api/$SERVICE_NAME 2>/dev/null)
    
    if [ $? -eq 0 ]; then
        # Extract timestamp to see if it's from different instances
        timestamp=$(echo "$response" | jq -r '.timestamp // .message // "unknown"' 2>/dev/null)
        echo "✅ Success - $timestamp"
    else
        echo "❌ Failed"
    fi
    
    # Small delay between requests
    if command -v usleep > /dev/null; then
        usleep 500000
    else
        perl -e 'select(undef, undef, undef, 0.5)'
    fi
done

echo ""
echo "=== Load Balancer Analysis ==="
echo ""

# Show Consul service instances
echo "Available $SERVICE_NAME instances in Consul:"
curl -s "http://localhost:8500/v1/health/service/$SERVICE_NAME?passing=true" | \
    jq -r '.[] | "  - Instance: \(.Service.ID) | Port: \(.Service.Port) | Status: \(.Checks[] | select(.ServiceID == .Service.ID) | .Status)"' 2>/dev/null || echo "  No instances found"

echo ""
echo "=== Test Complete ===" 