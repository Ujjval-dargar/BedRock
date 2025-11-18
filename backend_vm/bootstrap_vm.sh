#!/usr/bin/env bash
set -e

# ===================================================================
# BedRock Backend Bootstrap Script for Ubuntu VM
# ===================================================================
# This script performs a complete setup of the BedRock FastAPI backend
# on a fresh Ubuntu VM. It will:
# 1. Install all system packages (Python, git, build tools, etc.)
# 2. Optionally create a dedicated user
# 3. Clone the repository
# 4. Set up Python virtualenv and install dependencies
# 5. Configure environment variables
# 6. Run database migrations
# 7. Install and enable systemd service (optional)
# 8. Configure firewall
# ===================================================================

echo "=========================================="
echo "BedRock Backend Bootstrap Script"
echo "=========================================="
echo ""

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration variables
REPO_URL="https://github.com/nipunagg2604/BedRock.git"
REPO_BRANCH="main"
INSTALL_DIR="$HOME/BedRock"
BACKEND_DIR="$INSTALL_DIR/backend_vm"
CREATE_USER=false
USERNAME="bedrock"
INSTALL_SYSTEMD=false
SETUP_FIREWALL=true
USE_MYSQL=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --create-user)
            CREATE_USER=true
            shift
            ;;
        --username)
            USERNAME="$2"
            shift 2
            ;;
        --install-dir)
            INSTALL_DIR="$2"
            BACKEND_DIR="$INSTALL_DIR/backend_vm"
            shift 2
            ;;
        --systemd)
            INSTALL_SYSTEMD=true
            shift
            ;;
        --mysql)
            USE_MYSQL=true
            shift
            ;;
        --no-firewall)
            SETUP_FIREWALL=false
            shift
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --create-user       Create a dedicated user for running the backend"
            echo "  --username NAME     Username to create (default: bedrock)"
            echo "  --install-dir PATH  Installation directory (default: \$HOME/BedRock)"
            echo "  --systemd           Install and enable systemd service"
            echo "  --mysql             Configure for MySQL instead of SQLite"
            echo "  --no-firewall       Skip firewall configuration"
            echo "  --help              Show this help message"
            echo ""
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# ===================================================================
# Step 1: Install system packages (requires sudo)
# ===================================================================
echo -e "${GREEN}Step 1: Installing system packages...${NC}"

if command -v apt &> /dev/null; then
    echo "Updating package lists..."
    sudo apt update
    
    echo "Installing required packages..."
    sudo apt install -y \
        git \
        curl \
        wget \
        build-essential \
        libssl-dev \
        libffi-dev \
        python3 \
        python3-venv \
        python3-pip \
        python3-dev \
        ufw \
        nginx
    
    if [ "$USE_MYSQL" = true ]; then
        echo "Installing MySQL client..."
        sudo apt install -y mysql-client libmysqlclient-dev
    fi
    
    echo -e "${GREEN}✓ System packages installed${NC}"
else
    echo -e "${RED}Error: apt package manager not found. This script is for Ubuntu/Debian systems.${NC}"
    exit 1
fi

# ===================================================================
# Step 2: Create dedicated user (optional)
# ===================================================================
if [ "$CREATE_USER" = true ]; then
    echo -e "${GREEN}Step 2: Creating user '$USERNAME'...${NC}"
    
    if id "$USERNAME" &>/dev/null; then
        echo "User $USERNAME already exists, skipping..."
    else
        sudo adduser --disabled-password --gecos "" "$USERNAME"
        echo -e "${GREEN}✓ User $USERNAME created${NC}"
        echo -e "${YELLOW}Note: To switch to this user, run: sudo su - $USERNAME${NC}"
        echo -e "${YELLOW}The remaining steps will run as the current user.${NC}"
        echo -e "${YELLOW}Re-run this script as the $USERNAME user to complete setup.${NC}"
        exit 0
    fi
else
    echo -e "${YELLOW}Step 2: Skipping user creation (run with --create-user to create one)${NC}"
fi

# ===================================================================
# Step 3: Clone repository
# ===================================================================
echo -e "${GREEN}Step 3: Cloning repository...${NC}"

if [ -d "$INSTALL_DIR" ]; then
    echo "Directory $INSTALL_DIR already exists."
    read -p "Do you want to update it (pull latest)? [y/N] " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cd "$INSTALL_DIR"
        git pull origin "$REPO_BRANCH"
        echo -e "${GREEN}✓ Repository updated${NC}"
    else
        echo "Using existing repository..."
    fi
else
    echo "Cloning from $REPO_URL..."
    git clone "$REPO_URL" "$INSTALL_DIR"
    cd "$INSTALL_DIR"
    git checkout "$REPO_BRANCH"
    echo -e "${GREEN}✓ Repository cloned${NC}"
fi

# ===================================================================
# Step 4: Set up Python virtualenv
# ===================================================================
echo -e "${GREEN}Step 4: Setting up Python virtual environment...${NC}"

cd "$BACKEND_DIR"

if [ -d ".venv" ]; then
    echo "Virtual environment already exists, skipping creation..."
else
    python3 -m venv .venv
    echo -e "${GREEN}✓ Virtual environment created${NC}"
fi

# Activate virtualenv
source .venv/bin/activate

# Upgrade pip
echo "Upgrading pip..."
pip install --upgrade pip

# Install dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Install additional async SQLite support if using SQLite
if [ "$USE_MYSQL" = false ]; then
    echo "Installing aiosqlite for SQLite support..."
    pip install aiosqlite
fi

echo -e "${GREEN}✓ Python dependencies installed${NC}"

# ===================================================================
# Step 5: Configure environment variables
# ===================================================================
echo -e "${GREEN}Step 5: Configuring environment variables...${NC}"

if [ -f ".env" ]; then
    echo ".env file already exists."
    read -p "Do you want to reconfigure it? [y/N] " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Keeping existing .env file..."
    else
        CONFIGURE_ENV=true
    fi
else
    CONFIGURE_ENV=true
fi

if [ "$CONFIGURE_ENV" = true ]; then
    # Generate a random JWT secret
    JWT_SECRET=$(openssl rand -hex 32)
    
    if [ "$USE_MYSQL" = true ]; then
        echo ""
        echo "MySQL Configuration"
        read -p "Enter MySQL host [localhost]: " MYSQL_HOST
        MYSQL_HOST=${MYSQL_HOST:-localhost}
        
        read -p "Enter MySQL database name [bedrock]: " MYSQL_DB
        MYSQL_DB=${MYSQL_DB:-bedrock}
        
        read -p "Enter MySQL username: " MYSQL_USER
        read -sp "Enter MySQL password: " MYSQL_PASS
        echo ""
        
        DATABASE_URL="mysql+aiomysql://${MYSQL_USER}:${MYSQL_PASS}@${MYSQL_HOST}/${MYSQL_DB}"
    else
        DATABASE_URL="sqlite+aiosqlite:///./bedrock.db"
    fi
    
    cat > .env << EOF
# Database Configuration
DATABASE_URL=${DATABASE_URL}

# JWT Configuration
JWT_SECRET=${JWT_SECRET}
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# Server Configuration (optional)
# HOST=0.0.0.0
# PORT=8000
EOF
    
    echo -e "${GREEN}✓ .env file created${NC}"
    echo -e "${YELLOW}Note: Your JWT secret has been generated automatically${NC}"
fi

# ===================================================================
# Step 6: Run database migration
# ===================================================================
echo -e "${GREEN}Step 6: Running database migrations...${NC}"

# Ensure we're in the correct directory and venv is active
cd "$BACKEND_DIR"
source .venv/bin/activate

# Run the migration script if it exists
if [ -f "update_db.py" ]; then
    echo "Running update_db.py migration..."
    python update_db.py
    echo -e "${GREEN}✓ Database migration completed${NC}"
else
    echo -e "${YELLOW}No migration script found, skipping...${NC}"
    echo -e "${YELLOW}Database will be initialized on first run${NC}"
fi

# ===================================================================
# Step 7: Test the backend (optional quick test)
# ===================================================================
echo -e "${GREEN}Step 7: Testing backend startup...${NC}"
echo "Starting backend for 5 seconds to verify it works..."

# Start backend in background
.venv/bin/uvicorn backend_vm.main:app --host 0.0.0.0 --port 8000 &
UVICORN_PID=$!

# Wait a few seconds for startup
sleep 5

# Test if it's responding
if curl -s http://localhost:8000/docs > /dev/null; then
    echo -e "${GREEN}✓ Backend is responding${NC}"
else
    echo -e "${YELLOW}Warning: Backend may not be responding properly${NC}"
fi

# Stop the test instance
kill $UVICORN_PID 2>/dev/null || true
sleep 1

# ===================================================================
# Step 8: Install systemd service (optional)
# ===================================================================
if [ "$INSTALL_SYSTEMD" = true ]; then
    echo -e "${GREEN}Step 8: Installing systemd service...${NC}"
    
    SERVICE_FILE="/etc/systemd/system/bedrock-backend.service"
    
    # Get current user
    CURRENT_USER=$(whoami)
    CURRENT_GROUP=$(id -gn)
    
    # Create systemd service file
    sudo tee $SERVICE_FILE > /dev/null << EOF
[Unit]
Description=BedRock FastAPI Backend
After=network.target

[Service]
Type=simple
User=$CURRENT_USER
Group=$CURRENT_GROUP
WorkingDirectory=$BACKEND_DIR
EnvironmentFile=$BACKEND_DIR/.env
ExecStart=$BACKEND_DIR/.venv/bin/uvicorn backend_vm.main:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF
    
    # Reload systemd and enable service
    sudo systemctl daemon-reload
    sudo systemctl enable bedrock-backend
    sudo systemctl start bedrock-backend
    
    echo -e "${GREEN}✓ Systemd service installed and started${NC}"
    echo "Service status:"
    sudo systemctl status bedrock-backend --no-pager
else
    echo -e "${YELLOW}Step 8: Skipping systemd installation (run with --systemd to install)${NC}"
fi

# ===================================================================
# Step 9: Configure firewall
# ===================================================================
if [ "$SETUP_FIREWALL" = true ]; then
    echo -e "${GREEN}Step 9: Configuring firewall...${NC}"
    
    # Check if ufw is installed
    if command -v ufw &> /dev/null; then
        # Allow SSH first (important!)
        sudo ufw allow ssh
        
        # Allow backend port
        sudo ufw allow 8000/tcp
        
        # Enable firewall if not already enabled
        if ! sudo ufw status | grep -q "Status: active"; then
            echo "Enabling firewall..."
            echo "y" | sudo ufw enable
        else
            sudo ufw reload
        fi
        
        echo -e "${GREEN}✓ Firewall configured${NC}"
        sudo ufw status
    else
        echo -e "${YELLOW}ufw not found, skipping firewall configuration${NC}"
    fi
else
    echo -e "${YELLOW}Step 9: Skipping firewall configuration${NC}"
fi

# ===================================================================
# Completion Summary
# ===================================================================
echo ""
echo "=========================================="
echo -e "${GREEN}✓ Bootstrap completed successfully!${NC}"
echo "=========================================="
echo ""
echo "Installation Summary:"
echo "  - Installation directory: $INSTALL_DIR"
echo "  - Backend directory: $BACKEND_DIR"
echo "  - Database: $([ "$USE_MYSQL" = true ] && echo "MySQL" || echo "SQLite")"
echo "  - Systemd service: $([ "$INSTALL_SYSTEMD" = true ] && echo "Installed" || echo "Not installed")"
echo ""
echo "Next Steps:"
echo ""

if [ "$INSTALL_SYSTEMD" = true ]; then
    echo "1. Check service status:"
    echo "   sudo systemctl status bedrock-backend"
    echo ""
    echo "2. View logs:"
    echo "   sudo journalctl -u bedrock-backend -f"
    echo ""
    echo "3. Manage service:"
    echo "   sudo systemctl [start|stop|restart] bedrock-backend"
else
    echo "1. Start the backend manually:"
    echo "   cd $BACKEND_DIR"
    echo "   source .venv/bin/activate"
    echo "   uvicorn backend_vm.main:app --host 0.0.0.0 --port 8000"
    echo ""
    echo "2. Or install systemd service:"
    echo "   sudo $0 --systemd"
fi

echo ""
echo "4. Test the API from your host machine:"
echo "   curl http://$(hostname -I | awk '{print $1}'):8000/docs"
echo ""
echo "5. Configure your Expo frontend to use:"
echo "   API URL: http://$(hostname -I | awk '{print $1}'):8000"
echo ""

if [ "$USE_MYSQL" = false ]; then
    echo -e "${YELLOW}Note: Using SQLite for development. For production, consider MySQL:${NC}"
    echo "  1. Install MySQL: sudo apt install mysql-server"
    echo "  2. Create database and user"
    echo "  3. Update .env with MySQL connection string"
    echo ""
fi

echo "Environment file location: $BACKEND_DIR/.env"
echo ""
echo -e "${GREEN}Happy coding!${NC}"
