#!/bin/bash

#############################################
# BedRock Backend VM Setup & Run Script
# This script automates the setup and launch
# of the BedRock backend server
#############################################

set -e  # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the script directory and backend_vm path
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKEND_DIR="$PROJECT_ROOT/backend_vm"

echo -e "${BLUE}=== BedRock Backend VM Setup ===${NC}\n"

# Check if running with correct permissions
if [ "$EUID" -eq 0 ]; then 
    echo -e "${RED}Error: Do not run this script with sudo${NC}"
    echo "The script will prompt for sudo when needed for system packages."
    exit 1
fi

# Navigate to backend directory
cd "$BACKEND_DIR"

#############################################
# 1. Check and Install System Dependencies
#############################################
echo -e "${YELLOW}[1/6] Checking system dependencies...${NC}"

check_command() {
    command -v "$1" >/dev/null 2>&1
}

MISSING_PACKAGES=()

if ! check_command python3; then
    MISSING_PACKAGES+=(python3)
fi

if ! dpkg -s python3-venv >/dev/null 2>&1; then
    MISSING_PACKAGES+=(python3-venv)
fi

if ! dpkg -s python3-pip >/dev/null 2>&1; then
    MISSING_PACKAGES+=(python3-pip)
fi

if ! check_command git; then
    MISSING_PACKAGES+=(git)
fi

if ! check_command curl; then
    MISSING_PACKAGES+=(curl)
fi

if [ ${#MISSING_PACKAGES[@]} -gt 0 ]; then
    echo -e "${YELLOW}Missing packages detected: ${MISSING_PACKAGES[*]}${NC}"
    echo -e "${YELLOW}Installing system dependencies...${NC}"
    
    sudo apt update
    sudo apt install -y "${MISSING_PACKAGES[@]}"
    
    echo -e "${GREEN}✓ System dependencies installed${NC}\n"
else
    echo -e "${GREEN}✓ All system dependencies present${NC}\n"
fi

#############################################
# 2. Create/Activate Python Virtual Environment
#############################################
echo -e "${YELLOW}[2/6] Setting up Python virtual environment...${NC}"

if [ ! -d ".venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv .venv
    echo -e "${GREEN}✓ Virtual environment created${NC}\n"
elif [ ! -f ".venv/bin/activate" ]; then
    echo -e "${YELLOW}⚠ Virtual environment corrupted, recreating...${NC}"
    rm -rf .venv
    python3 -m venv .venv
    echo -e "${GREEN}✓ Virtual environment recreated${NC}\n"
else
    echo -e "${GREEN}✓ Virtual environment already exists${NC}\n"
fi

# Activate virtual environment
source .venv/bin/activate

#############################################
# 3. Install Python Dependencies
#############################################
echo -e "${YELLOW}[3/6] Installing Python dependencies...${NC}"

pip install --upgrade pip -q
pip install -r requirements.txt -q
pip install aiosqlite email-validator -q

echo -e "${GREEN}✓ Python dependencies installed${NC}\n"

#############################################
# 4. Configure Environment Variables
#############################################
echo -e "${YELLOW}[4/6] Configuring environment variables...${NC}"

if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    
    # Generate a secure JWT secret
    JWT_SECRET=$(openssl rand -hex 32)
    
    cat > .env << EOF
DATABASE_URL=sqlite+aiosqlite:///./bedrock.db
JWT_SECRET=$JWT_SECRET
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
EOF
    
    echo -e "${GREEN}✓ .env file created with generated JWT secret${NC}\n"
else
    echo -e "${GREEN}✓ .env file already exists${NC}\n"
fi

#############################################
# 5. Initialize/Update Database
#############################################
echo -e "${YELLOW}[5/6] Initializing database...${NC}"

if [ -f "update_db.py" ]; then
    python update_db.py
    echo -e "${GREEN}✓ Database initialized/updated${NC}\n"
else
    echo -e "${YELLOW}⚠ update_db.py not found, skipping database initialization${NC}\n"
fi

#############################################
# 6. Start Server
#############################################
echo -e "${YELLOW}[6/6] Starting BedRock backend server...${NC}\n"

# Get VM IP addresses
VM_IP=$(hostname -I | awk '{print $1}')

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   BedRock Backend Server Starting${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "Server will be available at:"
echo -e "  ${BLUE}Local:${NC}        http://localhost:8000"
echo -e "  ${BLUE}Network:${NC}      http://$VM_IP:8000"
echo -e "  ${BLUE}API Docs:${NC}     http://$VM_IP:8000/docs"
echo -e "  ${BLUE}ReDoc:${NC}        http://$VM_IP:8000/redoc"
echo -e "${GREEN}========================================${NC}\n"
echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}\n"

# Start uvicorn server
uvicorn main:app --host 0.0.0.0 --port 8000
