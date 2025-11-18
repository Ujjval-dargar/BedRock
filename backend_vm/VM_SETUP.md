# BedRock Backend - Ubuntu VM Setup Guide

This guide will help you set up the BedRock FastAPI backend on a fresh Ubuntu VM.

## Quick Start (Automated Setup)

We've created a bootstrap script that automates the entire setup process. It handles system packages, Python environment, database configuration, and optional systemd service installation.

### Option 1: One-Command Setup (Recommended)

```bash
# Download and run the bootstrap script directly from the repo
curl -fsSL https://raw.githubusercontent.com/nipunagg2604/BedRock/main/backend_vm/bootstrap_vm.sh | bash
```

### Option 2: Clone First, Then Bootstrap

```bash
# Clone the repository
git clone https://github.com/nipunagg2604/BedRock.git
cd BedRock/backend_vm

# Make the script executable
chmod +x bootstrap_vm.sh

# Run the bootstrap script
./bootstrap_vm.sh
```

## Bootstrap Script Options

The bootstrap script supports several flags to customize your installation:

```bash
./bootstrap_vm.sh [OPTIONS]

Options:
  --create-user       Create a dedicated user for running the backend
  --username NAME     Username to create (default: bedrock)
  --install-dir PATH  Installation directory (default: $HOME/BedRock)
  --systemd           Install and enable systemd service
  --mysql             Configure for MySQL instead of SQLite
  --no-firewall       Skip firewall configuration
  --help              Show help message
```

### Example: Full Production Setup

```bash
# Install everything with systemd service and dedicated user
./bootstrap_vm.sh --create-user --systemd

# Then switch to the created user and run again
sudo su - bedrock
cd BedRock/backend_vm
./bootstrap_vm.sh --systemd
```

### Example: Development Setup (SQLite, No Service)

```bash
# Simple dev setup with SQLite
./bootstrap_vm.sh
```

### Example: Production with MySQL

```bash
# Setup with MySQL backend
./bootstrap_vm.sh --mysql --systemd
```

## What the Script Does

The bootstrap script performs the following steps automatically:

1. **System Packages**: Installs Python 3, pip, git, build tools, and dependencies
2. **User Creation** (optional): Creates a dedicated non-root user
3. **Repository**: Clones the BedRock repository
4. **Python Environment**: Creates virtualenv and installs all Python dependencies
5. **Configuration**: Generates `.env` file with secure random secrets
6. **Database**: Runs migrations and prepares the database
7. **Testing**: Performs a quick startup test
8. **Systemd Service** (optional): Installs and enables the backend as a system service
9. **Firewall**: Configures UFW to allow port 8000 and SSH

## Manual Setup (Alternative)

If you prefer manual setup or need to troubleshoot, follow these steps:

### 1. Install System Dependencies

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl build-essential libssl-dev libffi-dev \
  python3 python3-venv python3-pip ufw nginx
```

### 2. Clone Repository

```bash
git clone https://github.com/nipunagg2604/BedRock.git
cd BedRock/backend_vm
```

### 3. Create Python Virtual Environment

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
pip install aiosqlite  # For SQLite support
```

### 4. Configure Environment

Create a `.env` file:

```bash
# Generate a random secret
JWT_SECRET=$(openssl rand -hex 32)

cat > .env << EOF
DATABASE_URL=sqlite+aiosqlite:///./bedrock.db
JWT_SECRET=${JWT_SECRET}
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
EOF
```

### 5. Run Database Migration

```bash
python update_db.py
```

### 6. Start the Backend

**Development (foreground):**
```bash
uvicorn backend_vm.main:app --reload --host 0.0.0.0 --port 8000
```

**Production (systemd service):**
```bash
# Copy service file
sudo cp bedrock-backend.service /etc/systemd/system/

# Edit the service file to match your paths and user
sudo nano /etc/systemd/system/bedrock-backend.service

# Enable and start
sudo systemctl daemon-reload
sudo systemctl enable bedrock-backend
sudo systemctl start bedrock-backend
```

### 7. Configure Firewall

```bash
sudo ufw allow ssh
sudo ufw allow 8000/tcp
sudo ufw enable
```

## Post-Installation

### Testing the Backend

From your host machine (laptop):

```bash
# Replace VM_IP with your VM's IP address
curl http://VM_IP:8000/docs
```

You should see the FastAPI Swagger documentation.

### Managing the Service (if using systemd)

```bash
# Check status
sudo systemctl status bedrock-backend

# View logs
sudo journalctl -u bedrock-backend -f

# Restart service
sudo systemctl restart bedrock-backend

# Stop service
sudo systemctl stop bedrock-backend

# Start service
sudo systemctl start bedrock-backend
```

### Connecting Your Expo Frontend

Update your `config.ts` (or `utils/api.ts`) in the frontend project:

```typescript
export const API_CONFIG = {
  BASE_URL: 'http://YOUR_VM_IP:8000',
};
```

Make sure both devices are on the same network and the VM's firewall allows port 8000.

## Troubleshooting

### Backend Won't Start

1. Check the logs:
   ```bash
   sudo journalctl -u bedrock-backend -n 50
   ```

2. Verify the `.env` file exists and has correct values:
   ```bash
   cat .env
   ```

3. Test database connection:
   ```bash
   source .venv/bin/activate
   python -c "from backend_vm.db.database import engine; print('DB OK')"
   ```

### Can't Connect from Frontend

1. Verify the VM IP:
   ```bash
   hostname -I
   ```

2. Check if port 8000 is open:
   ```bash
   sudo ufw status
   sudo netstat -tlnp | grep 8000
   ```

3. Test from the VM itself:
   ```bash
   curl http://localhost:8000/docs
   ```

4. Test from host:
   ```bash
   curl http://VM_IP:8000/docs
   ```

### Database Errors

If you see "no such column" errors:

```bash
cd backend_vm
source .venv/bin/activate
python update_db.py
sudo systemctl restart bedrock-backend
```

### Permission Denied Errors

Make sure the user running the service has access to all files:

```bash
# If using the bedrock user
sudo chown -R bedrock:bedrock /home/bedrock/BedRock
```

## Database Options

### SQLite (Default - Development)

- No additional setup required
- Database file: `backend_vm/bedrock.db`
- Good for development and testing
- `.env` setting: `DATABASE_URL=sqlite+aiosqlite:///./bedrock.db`

### MySQL (Recommended for Production)

1. Install MySQL:
   ```bash
   sudo apt install -y mysql-server mysql-client libmysqlclient-dev
   sudo mysql_secure_installation
   ```

2. Create database and user:
   ```bash
   sudo mysql
   ```
   ```sql
   CREATE DATABASE bedrock CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'bedrock'@'localhost' IDENTIFIED BY 'your_secure_password';
   GRANT ALL PRIVILEGES ON bedrock.* TO 'bedrock'@'localhost';
   FLUSH PRIVILEGES;
   EXIT;
   ```

3. Update `.env`:
   ```
   DATABASE_URL=mysql+aiomysql://bedrock:your_secure_password@localhost/bedrock
   ```

4. Restart the backend:
   ```bash
   sudo systemctl restart bedrock-backend
   ```

## Security Recommendations

For production deployments:

1. **Use MySQL** instead of SQLite
2. **Enable HTTPS** with Nginx and Let's Encrypt:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

3. **Restrict firewall** to only necessary ports:
   ```bash
   sudo ufw default deny incoming
   sudo ufw default allow outgoing
   sudo ufw allow ssh
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```

4. **Use strong secrets**: The bootstrap script generates random JWT secrets automatically

5. **Regular updates**:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

## Nginx Reverse Proxy (Optional)

For production, put Nginx in front of uvicorn:

1. Create Nginx config:
   ```bash
   sudo nano /etc/nginx/sites-available/bedrock
   ```

2. Add configuration:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://127.0.0.1:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

3. Enable and restart:
   ```bash
   sudo ln -s /etc/nginx/sites-available/bedrock /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

4. Get SSL certificate:
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

## Getting Help

- Check the main README: `../README.md`
- Review backend documentation: `./README.md`
- Check password sharing features: `../PASSWORD_SHARING_FEATURES.md`
- View permission system docs: `../PERMISSION_SYSTEM_UPDATE.md`

## Environment Variables Reference

All variables that can be set in `.env`:

```bash
# Database
DATABASE_URL=sqlite+aiosqlite:///./bedrock.db
# or
DATABASE_URL=mysql+aiomysql://user:password@localhost/bedrock

# JWT Authentication
JWT_SECRET=your-random-secret-key-here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# Server (optional)
HOST=0.0.0.0
PORT=8000

# Logging (optional)
LOG_LEVEL=info
```

## Quick Reference Commands

```bash
# View service status
sudo systemctl status bedrock-backend

# View logs (live)
sudo journalctl -u bedrock-backend -f

# Restart service
sudo systemctl restart bedrock-backend

# Edit configuration
nano /home/bedrock/BedRock/backend_vm/.env
sudo systemctl restart bedrock-backend

# Run migration
cd /home/bedrock/BedRock/backend_vm
source .venv/bin/activate
python update_db.py

# Check listening ports
sudo netstat -tlnp | grep 8000

# Test API
curl http://localhost:8000/docs
```
