#!/bin/bash

# Service Status Script
# Usage: ./scripts/status.sh [service-name]

SERVICE_NAME=$1

echo "=== Service Status ==="
echo ""

if [ -z "$SERVICE_NAME" ]; then
    echo "All Services:"
    echo "-------------"
    ps aux | grep "nx run.*:serve" | grep -v grep | while read line; do
        echo "$line"
    done
    echo ""
    
    echo "Consul Services:"
    echo "----------------"
    curl -s http://localhost:8500/v1/agent/services | jq '.[] | {ID, Service, Port, Address}' 2>/dev/null || echo "Consul not available"
    echo ""
    
    echo "Health Checks:"
    echo "--------------"
    curl -s http://localhost:8500/v1/agent/checks | jq '.[] | {ServiceName, Status, Output}' 2>/dev/null || echo "Consul not available"
else
    echo "Service: $SERVICE_NAME"
    echo "----------------------"
    ps aux | grep "nx run $SERVICE_NAME:serve" | grep -v grep | while read line; do
        echo "$line"
    done
    echo ""
    
    echo "Consul Registration:"
    echo "-------------------"
    curl -s http://localhost:8500/v1/agent/services | jq ".[] | select(.Service == \"$SERVICE_NAME\") | {ID, Service, Port, Address}" 2>/dev/null || echo "Service not found in Consul"
    echo ""
    
    echo "Health Status:"
    echo "--------------"
    curl -s http://localhost:8500/v1/agent/checks | jq ".[] | select(.ServiceName == \"$SERVICE_NAME\") | {ServiceID, Status, Output}" 2>/dev/null || echo "No health checks found"
fi 