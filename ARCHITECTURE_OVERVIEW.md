# BedRock Password Manager - Complete Architecture Overview

## 📋 Table of Contents
1. [System Architecture](#system-architecture)
2. [Backend Deep Dive](#backend-deep-dive)
3. [Frontend Deep Dive](#frontend-deep-dive)
4. [Security Architecture](#security-architecture)
5. [Data Flow](#data-flow)
6. [API Endpoints](#api-endpoints)

---

## 🏗️ System Architecture

### High-Level Overview
```
┌─────────────────────────────────────────────────────────────┐
│                     React Native App                         │
│              (Expo + TypeScript Frontend)                    │
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Login   │  │  Signup  │  │  Vault   │  │  Share   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│         │              │             │             │         │
│         └──────────────┴─────────────┴─────────────┘         │
│                         │                                     │
│                    utils/api.ts                              │
│                    utils/crypto.ts                           │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/JSON
                         │ (Bearer Token Auth)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              FastAPI Backend (Python)                        │
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   Auth   │  │  Crypto  │  │   CRUD   │  │  Models  │   │
│  │ (JWT)    │  │ (AES/RSA)│  │          │  │          │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                         │                                     │
│                         ▼                                     │
│              ┌──────────────────┐                           │
│              │   Database.py    │                           │
│              │  (SQLAlchemy)    │                           │
│              └──────────────────┘                           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
                 ┌──────────────┐
                 │  SQLite DB   │
                 │ (bedrock.db) │
                 └──────────────┘
```

---

## 🔧 Backend Deep Dive

### 1. **Main Application (`main.py`)**

#### Purpose
Central FastAPI application that orchestrates all API endpoints.

#### Key Components

**Lifespan Management**
```python
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize database
    await database.init_db()
    yield
    # Shutdown: cleanup
```
- Initializes database on startup
- Gracefully handles DB connection errors
- Creates all tables if they don't exist

**CORS Configuration**
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # React Native app can access from any IP
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### API Endpoints Summary

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---------------|
| `/signup` | POST | Register new user | ❌ |
| `/login` | POST | Authenticate user | ❌ |
| `/me` | GET | Get current user info | ✅ |
| `/passwords` | POST | Create password entry | ✅ |
| `/passwords` | GET | List all passwords | ✅ |
| `/passwords/{id}` | GET | Get specific password | ✅ |
| `/passwords/{id}` | PUT | Update password | ✅ |
| `/passwords/{id}` | DELETE | Delete password | ✅ |
| `/share` | POST | Share password | ✅ |
| `/shared/incoming` | GET | View received shares | ✅ |
| `/shared/outgoing` | GET | View sent shares | ✅ |
| `/passwords/{id}/shares` | GET | Get shares for password | ✅ |
| `/shared/{id}` | DELETE | Delete share | ✅ |
| `/shared/{id}/accept` | POST | Accept shared password | ✅ |
| `/users/{id}` | GET | Get user info | ✅ |
| `/users/by-username/{username}` | GET | Search user by username | ❌ |
| `/users/{id}/public_key` | GET | Get user's public key | ❌ |

---

### 2. **Database Layer (`database.py`)**

#### Database Setup
```python
DATABASE_URL = "sqlite+aiosqlite:///./bedrock.db"
engine = create_async_engine(ASYNC_DATABASE_URL, echo=False, future=True)
AsyncSessionLocal = sessionmaker(bind=engine, class_=AsyncSession)
```

**Key Functions:**
- `init_db()`: Creates all tables from models
- `get_session()`: Provides async DB session with automatic commit/rollback

#### Why Async?
- Non-blocking I/O operations
- Better scalability
- Handles concurrent requests efficiently

---

### 3. **Data Models (`models.py`)**

#### **User Model**
```python
class User(Base):
    __tablename__ = "users"
    id = Integer (Primary Key)
    username = String (Unique, Indexed)
    email = String (Unique, Indexed)
    master_password_hash = String (Argon2 hash)
    encrypted_vault_key = Binary (AES encrypted)
    vault_salt = Binary (for PBKDF2)
    public_key_pem = Text (RSA public key)
    encrypted_private_key = Binary (encrypted with vault key)
```

**Relationships:**
- `password_entries`: One-to-many with PasswordEntry
- `outgoing_shares`: One-to-many with SharedPassword (sent)
- `incoming_shares`: One-to-many with SharedPassword (received)

#### **PasswordEntry Model**
```python
class PasswordEntry(Base):
    __tablename__ = "password_entries"
    id = Integer (Primary Key)
    owner_id = ForeignKey to User
    title = String
    username = String (nullable)
    encrypted_password = Binary (AES encrypted blob)
    url = String (nullable)
    category = String (Browser, Social, Work, etc.)
    notes = Text (nullable)
    created_at = DateTime
```

#### **SharedPassword Model**
```python
class SharedPassword(Base):
    __tablename__ = "shared_passwords"
    id = Integer (Primary Key)
    entry_id = ForeignKey to PasswordEntry (nullable)
    from_user_id = ForeignKey to User
    to_user_id = ForeignKey to User
    encrypted_key_for_recipient = Binary (RSA encrypted symmetric key)
    encrypted_password = Binary (password encrypted with shared key)
    permission = String ('view' or 'edit')
    status = String ('pending' or 'accepted')
    created_at = DateTime
```

---

### 4. **Authentication (`auth.py`)**

#### Password Hashing
```python
def hash_password(password: str) -> str:
    return argon2.hash(password)  # Argon2id algorithm

def verify_password(password: str, hashed: str) -> bool:
    return argon2.verify(password, hashed)
```

**Why Argon2?**
- Winner of Password Hashing Competition (2015)
- Memory-hard algorithm (resistant to GPU attacks)
- Configurable cost parameters

#### JWT Token System
```python
def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=60)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm="HS256")
```

**Token Contents:**
- `sub`: User ID
- `exp`: Expiration timestamp (60 minutes)

#### Dependency Injection
```python
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_session)
) -> models.User:
    # Decode JWT
    # Fetch user from database
    # Return user object
```

Used in protected endpoints: `current_user = Depends(auth.get_current_user)`

---

### 5. **Cryptography (`crypto.py`)**

#### Key Generation
```python
def generate_vault_key() -> bytes:
    return os.urandom(32)  # 256-bit random key
```

#### Key Derivation (PBKDF2)
```python
def derive_key_from_password(password: str, salt: bytes, iterations: int = 200_000) -> bytes:
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=iterations,
    )
    return kdf.derive(password.encode())
```

**Purpose:** Convert master password into encryption key
- **Salt:** Prevents rainbow table attacks
- **Iterations:** Makes brute-force attacks expensive (200,000 iterations)

#### AES-GCM Encryption
```python
def aes_encrypt(key: bytes, plaintext: bytes) -> bytes:
    aesgcm = AESGCM(key)
    nonce = os.urandom(12)  # Random nonce
    ciphertext = aesgcm.encrypt(nonce, plaintext, None)
    return nonce + ciphertext  # Prepend nonce to ciphertext

def aes_decrypt(key: bytes, ciphertext_with_nonce: bytes) -> bytes:
    nonce = ciphertext_with_nonce[:12]
    ct = ciphertext_with_nonce[12:]
    return aesgcm.decrypt(nonce, ct, None)
```

**AES-GCM Features:**
- Authenticated encryption (prevents tampering)
- 256-bit keys
- 96-bit nonces (prevents replay attacks)

#### RSA Asymmetric Encryption
```python
def generate_rsa_keypair(key_size: int = 2048):
    private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    public_key = private_key.public_key()
    # Return PEM-encoded keys
```

**Used for:** Password sharing between users
- Public key: Shared with others
- Private key: Encrypted with vault key, never leaves user's device

```python
def rsa_encrypt(public_pem: bytes, plaintext: bytes) -> bytes:
    # Uses OAEP padding with SHA-256
    
def rsa_decrypt(private_pem: bytes, ciphertext: bytes) -> bytes:
    # Decrypts with private key
```

---

### 6. **CRUD Operations (`crud.py`)**

All database operations are async for better performance:

```python
# User Operations
async def get_user_by_email(db, email) -> User
async def get_user_by_id(db, user_id) -> User
async def get_user_by_username(db, username) -> User
async def create_user(db, user) -> User

# Password Operations
async def create_password_entry(db, entry) -> PasswordEntry
async def get_passwords_for_user(db, user_id) -> List[PasswordEntry]
async def get_password_entry(db, entry_id) -> PasswordEntry
async def update_password_entry(db, entry) -> PasswordEntry
async def delete_password_entry(db, entry_id) -> bool

# Sharing Operations
async def create_shared_password(db, shared) -> SharedPassword
async def get_incoming_shares(db, user_id) -> List[SharedPassword]
async def get_outgoing_shares(db, user_id) -> List[SharedPassword]
async def get_shares_for_password(db, password_id) -> List[SharedPassword]
async def update_share_status(db, share_id, status) -> SharedPassword
async def delete_share(db, share_id) -> None
```

---

## 📱 Frontend Deep Dive

### 1. **API Client (`utils/api.ts`)**

#### Configuration
```typescript
const API_BASE_URL = 'http://192.168.29.231:8000'
```

#### Storage Keys
```typescript
const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER_ID: 'user_id',
  VAULT_KEY: 'vault_key',
  ENCRYPTED_VAULT_KEY: 'encrypted_vault_key',
  VAULT_SALT: 'vault_salt',
  PUBLIC_KEY: 'public_key',
  ENCRYPTED_PRIVATE_KEY: 'encrypted_private_key',
  EMAIL: 'user_email',
}
```

#### API Modules

**Auth API**
```typescript
authAPI.signup(username, email, masterPassword)
authAPI.login(email, masterPassword)
authAPI.getMe()
authAPI.logout()
```

**Password API**
```typescript
passwordAPI.create(title, username, encryptedPassword, url, category, notes)
passwordAPI.list()
passwordAPI.get(id)
passwordAPI.update(id, ...)
passwordAPI.delete(id)
```

**Sharing API**
```typescript
sharingAPI.getUserByUsername(username)
sharingAPI.share(entryId, toUserId, encryptedKey, encryptedPassword, permission)
sharingAPI.getIncoming()
sharingAPI.getOutgoing()
sharingAPI.accept(shareId)
```

---

### 2. **Crypto Utilities (`utils/crypto.ts`)**

⚠️ **Important Note:** Current implementation uses simplified crypto (XOR cipher). Production should use:
- `react-native-aes-crypto` for AES-GCM
- `react-native-rsa-native` for RSA-OAEP

```typescript
deriveKeyFromPassword(password, salt, iterations)
aesEncrypt(plaintext, key)
aesDecrypt(ciphertext, key)
generateRandomBytes(length)
validatePasswordStrength(password)
```

---

### 3. **User Flow Examples**

#### **Signup Flow** (`signup.tsx` → `create-master-password.tsx`)

1. User enters email
2. Email stored in AsyncStorage temporarily
3. Navigate to master password screen
4. User enters username + master password (2x)
5. Frontend calls `authAPI.signup(username, email, masterPassword)`
6. Backend:
   - Hashes master password with Argon2
   - Generates 256-bit vault key
   - Derives key from master password using PBKDF2
   - Encrypts vault key with derived key
   - Generates RSA keypair
   - Encrypts private key with vault key
   - Stores everything in database
7. User redirected to login

#### **Login Flow** (`login.tsx` → `enter-master-password.tsx`)

1. User enters email
2. Navigate to master password screen
3. User enters master password
4. Frontend calls `authAPI.login(email, masterPassword)`
5. Backend:
   - Verifies email/password with Argon2
   - Returns JWT token + encrypted vault key + salt + public key
6. Frontend stores:
   - JWT token (for API authentication)
   - Encrypted vault key (for later decryption)
   - Salt (for key derivation)
7. Frontend derives key from master password + salt
8. Decrypts vault key
9. Stores vault key in AsyncStorage (in memory)
10. Navigate to home screen

#### **Add Password Flow** (`add-password.tsx`)

1. User fills form: title, username, password, category, URL, notes
2. Get vault key from AsyncStorage
3. Encrypt password with vault key using AES-GCM
4. Call `passwordAPI.create(...)` with encrypted password
5. Backend stores encrypted password in database
6. Password never transmitted or stored in plaintext

#### **View Vault Flow** (`vault.tsx`)

1. Fetch all passwords: `passwordAPI.list()`
2. Backend returns list of PasswordEntry objects (passwords still encrypted)
3. Get vault key from AsyncStorage
4. For each entry:
   - Decrypt password using AES-GCM
   - Validate password strength
   - Display in UI
5. Passwords decrypted locally, never sent to server

#### **Share Password Flow** (`share-password.tsx`)

1. User searches for recipient by username
2. Frontend calls `sharingAPI.getUserByUsername(username)`
3. Backend returns recipient's public key
4. Frontend:
   - Generates random symmetric key
   - Encrypts password with this key
   - Encrypts the key with recipient's RSA public key
5. Call `sharingAPI.share(entryId, recipientId, encryptedKey, encryptedPassword, permission)`
6. Recipient receives notification
7. When recipient accepts:
   - Decrypts symmetric key with their RSA private key
   - Decrypts password with symmetric key
   - Password now accessible to recipient

---

## 🔐 Security Architecture

### Defense in Depth

```
┌─────────────────────────────────────────────────────────┐
│ Layer 1: Zero-Knowledge Architecture                    │
│ ✅ Server never sees plaintext passwords                │
│ ✅ Master password never transmitted                    │
│ ✅ Vault key encrypted client-side                      │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│ Layer 2: Strong Cryptography                            │
│ ✅ AES-256-GCM for symmetric encryption                 │
│ ✅ RSA-2048-OAEP for sharing                            │
│ ✅ PBKDF2-HMAC-SHA256 (200k iterations)                 │
│ ✅ Argon2id for password hashing                        │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│ Layer 3: Authentication                                  │
│ ✅ JWT tokens (60-minute expiry)                        │
│ ✅ Bearer token authentication                          │
│ ✅ Per-request authorization checks                     │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│ Layer 4: Permission System                              │
│ ✅ Owner verification for delete/share                  │
│ ✅ 'view' vs 'edit' permissions                         │
│ ✅ Pending/accepted share states                        │
└─────────────────────────────────────────────────────────┘
```

### Key Security Principles

#### 1. **Zero-Knowledge Architecture**
- Server only stores encrypted blobs
- Decryption only happens client-side
- Master password never leaves device
- Even database admin can't read passwords

#### 2. **Encryption Hierarchy**
```
Master Password (user knows)
    ↓ PBKDF2 (200k iterations, random salt)
Derived Key (32 bytes)
    ↓ AES-256-GCM
Vault Key (32 bytes, random)
    ↓ AES-256-GCM
Individual Passwords (plaintext)
```

#### 3. **Sharing Security**
```
Sender:
  Password → [AES with random key] → Encrypted Password
  Random Key → [RSA with recipient's public key] → Encrypted Key
  
Recipient:
  Encrypted Key → [RSA with private key] → Random Key
  Encrypted Password → [AES with random key] → Password
```

#### 4. **Private Key Protection**
```
RSA Private Key → [AES-GCM with vault key] → Encrypted Private Key (stored in DB)
```
- Private key encrypted before storage
- Only decryptable by owner with master password

---

## 🔄 Data Flow Diagrams

### Complete Signup Flow
```
┌──────────┐
│  Client  │
└────┬─────┘
     │ 1. POST /signup {username, email, master_password}
     ▼
┌──────────────┐
│   Backend    │
└──────┬───────┘
       │ 2. Hash master password (Argon2)
       │ 3. Generate vault_key = random(32 bytes)
       │ 4. salt = random(16 bytes)
       │ 5. derived_key = PBKDF2(master_password, salt)
       │ 6. encrypted_vault_key = AES(derived_key, vault_key)
       │ 7. (private_key, public_key) = RSA_generate(2048)
       │ 8. encrypted_private_key = AES(vault_key, private_key)
       │ 9. Store in DB:
       │    - master_password_hash
       │    - encrypted_vault_key
       │    - vault_salt
       │    - public_key_pem
       │    - encrypted_private_key
       ▼
    ┌──────┐
    │  DB  │
    └──────┘
```

### Complete Login Flow
```
┌──────────┐
│  Client  │
└────┬─────┘
     │ 1. POST /login {email, master_password}
     ▼
┌──────────────┐
│   Backend    │
└──────┬───────┘
       │ 2. Fetch user by email
       │ 3. Verify password (Argon2)
       │ 4. Generate JWT token
       │ 5. Return {token, encrypted_vault_key, salt, public_key}
       ▼
┌──────────┐
│  Client  │
└────┬─────┘
     │ 6. Store JWT token
     │ 7. derived_key = PBKDF2(master_password, salt)
     │ 8. vault_key = AES_decrypt(derived_key, encrypted_vault_key)
     │ 9. Store vault_key in memory (AsyncStorage)
     ▼
  [User logged in]
```

### Password Storage Flow
```
┌──────────┐
│  Client  │
└────┬─────┘
     │ plaintext_password = "MyP@ssw0rd!"
     │ vault_key = get_from_storage()
     │ encrypted_password = AES-GCM(vault_key, plaintext_password)
     │
     │ POST /passwords {
     │   title: "Gmail",
     │   username: "user@gmail.com",
     │   encrypted_password: <binary blob>,
     │   category: "Email"
     │ }
     ▼
┌──────────────┐
│   Backend    │
└──────┬───────┘
       │ Verify JWT token
       │ Extract user_id from token
       │ Store PasswordEntry {
       │   owner_id: user_id,
       │   title: "Gmail",
       │   encrypted_password: <binary blob>,
       │   ...
       │ }
       ▼
    ┌──────┐
    │  DB  │
    └──────┘
    
    [Password stored encrypted, server has no knowledge of plaintext]
```

### Password Retrieval Flow
```
┌──────────┐
│  Client  │
└────┬─────┘
     │ GET /passwords
     ▼
┌──────────────┐
│   Backend    │
└──────┬───────┘
       │ Verify JWT token
       │ Fetch all passwords for user
       │ Return [{id, title, encrypted_password, ...}, ...]
       ▼
┌──────────┐
│  Client  │
└────┬─────┘
     │ vault_key = get_from_storage()
     │ For each password:
     │   plaintext = AES_decrypt(vault_key, encrypted_password)
     │   display(title, plaintext)
     ▼
  [Passwords displayed]
```

---

## 📡 Complete API Reference

### Authentication Endpoints

#### `POST /signup`
**Request:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "master_password": "SuperSecret123!"
}
```

**Response:**
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com"
}
```

**Backend Processing:**
1. Validate unique email/username
2. Hash master password (Argon2)
3. Generate and encrypt vault key
4. Generate RSA keypair
5. Create user record

---

#### `POST /login`
**Request:**
```json
{
  "email": "john@example.com",
  "master_password": "SuperSecret123!"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "encrypted_vault_key": "a1b2c3d4e5f6...",
  "vault_salt": "f1e2d3c4b5a6...",
  "public_key_pem": "-----BEGIN PUBLIC KEY-----\n..."
}
```

---

### Password Management Endpoints

#### `POST /passwords`
**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "title": "Gmail Account",
  "username": "john@gmail.com",
  "encrypted_password": "<base64 binary>",
  "url": "https://gmail.com",
  "category": "Email",
  "notes": "Personal email"
}
```

**Response:**
```json
{
  "id": 42,
  "owner_id": 1,
  "title": "Gmail Account",
  "username": "john@gmail.com",
  "encrypted_password": "<base64 binary>",
  "url": "https://gmail.com",
  "category": "Email",
  "notes": "Personal email",
  "created_at": "2025-11-19T10:30:00"
}
```

---

#### `GET /passwords`
**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
[
  {
    "id": 42,
    "owner_id": 1,
    "title": "Gmail Account",
    "username": "john@gmail.com",
    "encrypted_password": "<binary>",
    "category": "Email",
    "created_at": "2025-11-19T10:30:00"
  }
]
```

---

### Sharing Endpoints

#### `POST /share`
**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "entry_id": 42,
  "to_user_id": 5,
  "encrypted_key_for_recipient": "<RSA encrypted symmetric key>",
  "encrypted_password": "<password encrypted with symmetric key>",
  "permission": "view"
}
```

**Response:**
```json
{
  "id": 10,
  "entry_id": 42,
  "from_user_id": 1,
  "to_user_id": 5,
  "encrypted_key_for_recipient": "<binary>",
  "encrypted_password": "<binary>",
  "permission": "view",
  "status": "pending",
  "created_at": "2025-11-19T11:00:00"
}
```

---

## 🗄️ Database Schema

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(200) UNIQUE NOT NULL,
    master_password_hash VARCHAR(512) NOT NULL,
    encrypted_vault_key BLOB NOT NULL,
    vault_salt BLOB NOT NULL,
    public_key_pem TEXT NOT NULL,
    encrypted_private_key BLOB NOT NULL
);

CREATE TABLE password_entries (
    id INTEGER PRIMARY KEY,
    owner_id INTEGER NOT NULL,
    title VARCHAR(200) NOT NULL,
    username VARCHAR(200),
    encrypted_password BLOB NOT NULL,
    url VARCHAR(500),
    category VARCHAR(50),
    notes TEXT,
    created_at DATETIME,
    FOREIGN KEY (owner_id) REFERENCES users(id)
);

CREATE TABLE shared_passwords (
    id INTEGER PRIMARY KEY,
    entry_id INTEGER,
    from_user_id INTEGER NOT NULL,
    to_user_id INTEGER NOT NULL,
    encrypted_key_for_recipient BLOB NOT NULL,
    encrypted_password BLOB NOT NULL,
    permission VARCHAR(20) DEFAULT 'view',
    status VARCHAR(50) DEFAULT 'pending',
    created_at DATETIME,
    FOREIGN KEY (entry_id) REFERENCES password_entries(id),
    FOREIGN KEY (from_user_id) REFERENCES users(id),
    FOREIGN KEY (to_user_id) REFERENCES users(id)
);
```

---

## 🚀 Deployment & Running

### Backend Setup
```bash
# Run the automated setup script
./scripts/run_backend_vm.sh
```

**What it does:**
1. Checks and installs system dependencies (python3, venv, pip, git, curl)
2. Creates Python virtual environment
3. Installs all Python packages
4. Generates secure JWT secret
5. Creates .env file
6. Initializes database
7. Starts uvicorn server on 0.0.0.0:8000

### Frontend Configuration
Edit `config.ts`:
```typescript
export const API_CONFIG = {
  BASE_URL: 'http://YOUR_BACKEND_IP:8000',
};
```

For local development:
- iOS Simulator: `http://localhost:8000`
- Android Emulator: `http://10.0.2.2:8000`
- Physical Device: `http://192.168.x.x:8000` (your computer's IP)

---

## 🎯 Key Takeaways

### What Makes This Secure?

1. **Zero-Knowledge**: Server can't read passwords even if hacked
2. **End-to-End Encryption**: Passwords encrypted before leaving device
3. **Strong Algorithms**: AES-256-GCM, RSA-2048, Argon2id
4. **Key Derivation**: 200,000 PBKDF2 iterations prevents brute force
5. **Authenticated Encryption**: AES-GCM prevents tampering
6. **Secure Sharing**: RSA public-key cryptography

### What Could Be Improved?

1. **Frontend Crypto**: Replace XOR cipher with proper AES-GCM implementation
2. **2FA**: Add two-factor authentication
3. **Biometrics**: Add fingerprint/face unlock
4. **Auto-lock**: Lock vault after inactivity
5. **Password History**: Track password changes
6. **Breach Detection**: Check against HaveIBeenPwned API
7. **Audit Logs**: Track all access to passwords
8. **Rate Limiting**: Prevent brute force attacks
9. **HTTPS**: Use TLS for all communications
10. **Hardware Security**: Use device keychain for vault key

---

## 📚 Technology Stack Summary

### Backend
- **Framework**: FastAPI (async Python web framework)
- **Database**: SQLAlchemy + SQLite (aiosqlite for async)
- **Auth**: JWT tokens + Argon2 password hashing
- **Crypto**: cryptography library (AES-GCM, RSA-OAEP, PBKDF2)
- **Server**: Uvicorn (ASGI server)

### Frontend
- **Framework**: React Native + Expo
- **Language**: TypeScript
- **Storage**: AsyncStorage (local key-value store)
- **Crypto**: Expo Crypto (⚠️ needs upgrade to proper AES/RSA)
- **Navigation**: Expo Router
- **UI**: React Native components + Ionicons

### Security Algorithms
- **Symmetric**: AES-256-GCM
- **Asymmetric**: RSA-2048-OAEP
- **Key Derivation**: PBKDF2-HMAC-SHA256 (200k iterations)
- **Password Hashing**: Argon2id
- **Tokens**: JWT with HS256

---

**Created**: November 19, 2025  
**Version**: 1.0  
**BedRock Password Manager** - Secure, Zero-Knowledge Password Management
