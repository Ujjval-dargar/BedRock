# Backend Script Fix - Corrupted Virtual Environment

## Issue Resolved ✅

**Error:**
```bash
./scripts/run_backend_vm.sh: line 92: .venv/bin/activate: No such file or directory
```

## Root Cause
The Python virtual environment (`.venv`) in `backend_vm/` was **corrupted**:
- Directory existed but was incomplete
- Had `include/` and `lib/` folders but **no `bin/` directory**
- Missing the `activate` script needed to activate the venv

This typically happens when:
- Virtual environment creation was interrupted
- Disk space issues during creation
- Permission problems
- Incomplete Python installation

## Solution Applied

Updated `scripts/run_backend_vm.sh` to detect and fix corrupted virtual environments:

### Before
```bash
if [ ! -d ".venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv .venv
else
    echo "✓ Virtual environment already exists"
fi
```

### After (Fixed)
```bash
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
```

## What Changed

The script now checks **three conditions**:

1. **`.venv` doesn't exist** → Create it
2. **`.venv` exists but `.venv/bin/activate` missing** → Delete and recreate (corrupted)
3. **`.venv` and `activate` both exist** → Use existing venv

## How to Use

Simply run the script as before:
```bash
./scripts/run_backend_vm.sh
```

The script will now:
1. ✅ Detect corrupted virtual environments automatically
2. ✅ Clean up and recreate them
3. ✅ Continue with normal setup
4. ✅ Start the backend server

## Expected Output

```bash
=== BedRock Backend VM Setup ===

[1/6] Checking system dependencies...
✓ All system dependencies present

[2/6] Setting up Python virtual environment...
⚠ Virtual environment corrupted, recreating...
✓ Virtual environment recreated

[3/6] Installing Python dependencies...
✓ Python dependencies installed

[4/6] Configuring environment variables...
✓ .env file already exists

[5/6] Initializing database...
✓ Database initialized/updated

[6/6] Starting BedRock backend server...
========================================
   BedRock Backend Server Starting
========================================
Server will be available at:
  Local:        http://localhost:8000
  Network:      http://192.168.29.231:8000
  API Docs:     http://192.168.29.231:8000/docs
========================================
```

## Manual Fix (If Needed)

If you ever need to manually fix a corrupted venv:

```bash
# Navigate to backend directory
cd /home/ujjval-dargar/Desktop/BedRock/backend_vm

# Remove corrupted venv
rm -rf .venv

# Create fresh venv
python3 -m venv .venv

# Activate it
source .venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt
pip install aiosqlite email-validator
```

## Prevention

To prevent virtual environment corruption:
1. ✅ Don't interrupt the creation process (Ctrl+C during `python3 -m venv`)
2. ✅ Ensure sufficient disk space
3. ✅ Use stable Python installation
4. ✅ Don't manually modify `.venv/` contents

## Related Files

- `scripts/run_backend_vm.sh` - Updated with corruption detection
- `backend_vm/.venv/` - Virtual environment location
- `backend_vm/requirements.txt` - Python dependencies

## Testing

Script has been tested and verified:
- ✅ Detects corrupted venv
- ✅ Removes and recreates automatically
- ✅ Installs dependencies correctly
- ✅ Starts server successfully

---

**Fixed:** November 19, 2025  
**Script Version:** 1.1  
**Status:** ✅ Working
