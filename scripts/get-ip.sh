#!/bin/bash
# Get local IP address for React Native Metro bundler

# Try different methods to get IP
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    IP=$(hostname -I | awk '{print $1}')
else
    IP="localhost"
fi

if [ -z "$IP" ]; then
    IP="localhost"
fi

echo "$IP"

