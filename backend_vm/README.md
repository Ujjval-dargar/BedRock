BedRock FastAPI backend (local VM replica)

This folder contains a minimal FastAPI backend intended to be run locally (mac) or on a VM. It uses MySQL as the database and provides secure authentication primitives and APIs for storing encrypted password entries and sharing them securely.

Key security design decisions
- Master passwords are never stored in plaintext. We store an Argon2 hash of the master password.
- Each user has a randomly generated vault key (symmetric) used to encrypt password entries. The vault key is encrypted using a key derived from the user's master password (PBKDF2) and stored on server as `encrypted_vault_key` with its salt.
- RSA keypairs are generated for users; the private key is encrypted with the user's vault key before storage so the server never holds plaintext private keys.
- The server stores encrypted password blobs (clients should encrypt with the vault key). For sharing, clients send a symmetric key encrypted with the recipient's public key; the server stores that for delivery to the recipient.

Running locally (mac)
1. Install Python 3.11+ and create a venv:
```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```
2. Start a MySQL server locally (Docker recommended):
```bash
docker run --name bedrock-mysql -e MYSQL_ROOT_PASSWORD=secret -e MYSQL_DATABASE=bedrock -p 3306:3306 -d mysql:8
```
3. Copy `.env.example` to `.env` and edit `DATABASE_URL` and `JWT_SECRET`
4. Initialize DB tables and run:
```bash
python -m backend_vm.main
# or
uvicorn backend_vm.main:app --reload --host 0.0.0.0 --port 8000
```

Notes for the mobile/web client
- Clients should derive the vault key locally from the master password and decrypt `encrypted_vault_key` returned on login to be able to encrypt/decrypt secrets locally.
- For sharing, the client encrypts the entry's symmetric key with the recipient public key and sends the encrypted key to the server via the `/share` endpoint.
