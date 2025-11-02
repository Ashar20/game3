#!/bin/bash

# Script to stop Torii indexer

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Stopping Torii indexer...${NC}"

# Find Torii processes
TORII_PIDS=$(pgrep -f "torii.*world" || true)

if [ -z "$TORII_PIDS" ]; then
    echo -e "${YELLOW}No Torii processes found${NC}"
    exit 0
fi

# Kill Torii processes
for PID in $TORII_PIDS; do
    echo -e "${BLUE}Stopping Torii (PID: $PID)...${NC}"
    kill $PID 2>/dev/null || true
done

# Wait a moment
sleep 2

# Force kill if still running
REMAINING=$(pgrep -f "torii.*world" || true)
if [ ! -z "$REMAINING" ]; then
    echo -e "${YELLOW}Force stopping remaining Torii processes...${NC}"
    pkill -9 -f "torii.*world" || true
    sleep 1
fi

# Verify stopped
if pgrep -f "torii.*world" > /dev/null; then
    echo -e "${RED}Error: Failed to stop some Torii processes${NC}"
    exit 1
else
    echo -e "${GREEN}Torii stopped successfully${NC}"
fi



