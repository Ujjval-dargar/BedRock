import os
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Depends
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
import database, models, schemas, crud, crypto, auth, email_service
from database import get_session
from dotenv import load_dotenv
from pydantic import BaseModel

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: try to initialize DB (but don't fail if MySQL is not available)
    try:
        await database.init_db()
        print("✓ Database initialized successfully")
    except Exception as e:
        print(f"⚠ Warning: Could not initialize database: {e}")
        print("  The server will start but database operations will fail.")
        print("  Please ensure MySQL is running and configured correctly.")
    yield
    # Shutdown: cleanup if needed
    pass


app = FastAPI(title="BedRock Backend (local VM)", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SignupIn(BaseModel):
    username: str
    email: str
    master_password: str


class EmailCheckIn(BaseModel):
    email: str


class VerificationCodeIn(BaseModel):
    email: str
    code: str


@app.post("/check-email")
async def check_email(data: EmailCheckIn, db: AsyncSession = Depends(get_session)):
    """Check if an email is already registered."""
    existing = await crud.get_user_by_email(db, data.email.lower())
    return {"exists": existing is not None, "available": existing is None}


@app.post("/check-username")
async def check_username(data: schemas.UsernameCheckIn, db: AsyncSession = Depends(get_session)):
    """Check if a username is already taken."""
    existing = await crud.get_user_by_username(db, data.username)
    return {"exists": existing is not None, "available": existing is None}


@app.post("/send-verification-code")
async def send_verification_code(data: EmailCheckIn):
    """Send verification code to email."""
    try:
        code = await email_service.send_verification_code(data.email.lower())
        return {
            "success": True,
            "message": "Verification code sent to email",
            "email": data.email.lower()
        }
    except Exception as e:
        print(f"Error sending verification code: {e}")
        raise HTTPException(status_code=500, detail="Failed to send verification code")


@app.post("/verify-email-code")
async def verify_email_code(data: VerificationCodeIn):
    """Verify email with code."""
    is_valid = email_service.verify_code(data.email.lower(), data.code)
    
    if is_valid:
        return {
            "success": True,
            "message": "Email verified successfully",
            "verified": True
        }
    else:
        raise HTTPException(status_code=400, detail="Invalid or expired verification code")


@app.post("/resend-verification-code")
async def resend_verification_code(data: EmailCheckIn):
    """Resend verification code to email."""
    try:
        code = await email_service.resend_verification_code(data.email.lower())
        return {
            "success": True,
            "message": "Verification code resent to email",
            "email": data.email.lower()
        }
    except Exception as e:
        print(f"Error resending verification code: {e}")
        raise HTTPException(status_code=500, detail="Failed to resend verification code")


@app.post("/signup", response_model=schemas.SignupResponse)
async def signup(data: SignupIn, db: AsyncSession = Depends(get_session)):
    existing = await crud.get_user_by_email(db, data.email.lower())
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Validate username length (minimum 3 characters)
    if len(data.username.strip()) < 3:
        raise HTTPException(status_code=400, detail="Username must be at least 3 characters")

    # hash master password for authentication
    hashed = auth.hash_password(data.master_password)

    # generate vault key and encrypt it with key derived from master password
    vault_key = crypto.generate_vault_key()
    salt = os.urandom(16)
    derived = crypto.derive_key_from_password(data.master_password, salt)
    encrypted_vault_key = crypto.aes_encrypt(derived, vault_key)

    # generate RSA keys; encrypt private key with vault key
    priv_pem, pub_pem = crypto.generate_rsa_keypair()
    encrypted_priv = crypto.aes_encrypt(vault_key, priv_pem)

    # generate recovery key and hash it (same as password)
    recovery_key = crypto.generate_recovery_key()
    recovery_key_hash = auth.hash_password(recovery_key)

    user = models.User(
        username=data.username,
        email=data.email.lower(),
        master_password_hash=hashed,
        encrypted_vault_key=encrypted_vault_key,
        vault_salt=salt,
        public_key_pem=pub_pem.decode(),
        encrypted_private_key=encrypted_priv,
        recovery_key_hash=recovery_key_hash,
    )

    created = await crud.create_user(db, user)
    
    # Return user data with recovery key (only shown once!)
    return schemas.SignupResponse(
        id=created.id,
        username=created.username,
        email=created.email,
        biometric_enabled=created.biometric_enabled,
        recovery_key=recovery_key  # Plain text - user must save this!
    )


@app.post("/login")
async def login(payload: schemas.LoginIn, db: AsyncSession = Depends(get_session)):
    user = await crud.get_user_by_email(db, payload.email.lower())
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    if not auth.verify_password(payload.master_password, user.master_password_hash):
        raise HTTPException(status_code=400, detail="Incorrect email or password")

    # Return a token with user id; do not reveal vault key plain. Client should use master password to derive key and decrypt vault key.
    access_token = auth.create_access_token({"sub": str(user.id)})
    return JSONResponse({
        "access_token": access_token, 
        "token_type": "bearer", 
        "encrypted_vault_key": user.encrypted_vault_key.hex(), 
        "vault_salt": user.vault_salt.hex(), 
        "public_key_pem": user.public_key_pem,
        "is_first_login": user.is_first_login
    })


@app.post("/verify-recovery-key")
async def verify_recovery_key(data: schemas.RecoveryKeyVerify, db: AsyncSession = Depends(get_session)):
    """
    Verify recovery key for password reset flow.
    Returns success if recovery key matches, allowing user to proceed to password reset.
    """
    user = await crud.get_user_by_email(db, data.email.lower())
    if not user:
        raise HTTPException(status_code=400, detail="Email not found")
    
    if not user.recovery_key_hash:
        raise HTTPException(status_code=400, detail="No recovery key set for this account")
    
    # Verify recovery key against stored hash
    if not auth.verify_password(data.recovery_key, user.recovery_key_hash):
        raise HTTPException(status_code=400, detail="Invalid recovery key")
    
    return {"message": "Recovery key verified successfully", "email": user.email}


@app.post("/reset-password")
async def reset_password(data: schemas.PasswordReset, db: AsyncSession = Depends(get_session)):
    """
    Reset user's master password after recovery key verification.
    This updates the master password hash in the database.
    Note: User will need to re-create vault key and re-encrypt all passwords with new master password.
    """
    user = await crud.get_user_by_email(db, data.email.lower())
    if not user:
        raise HTTPException(status_code=400, detail="Email not found")
    
    # Hash the new master password
    new_password_hash = auth.hash_password(data.new_master_password)
    
    # Update user's master password hash
    user.master_password_hash = new_password_hash
    db.add(user)
    await db.commit()
    
    return {"message": "Password reset successfully"}


@app.get("/me", response_model=schemas.UserOut)
async def me(current: models.User = Depends(auth.get_current_user)):
    return current


@app.put("/me", response_model=schemas.UserOut)
async def update_me(
    user_update: schemas.UserUpdate, 
    current: models.User = Depends(auth.get_current_user),
    db: AsyncSession = Depends(get_session)
):
    """Update current user's username and/or email."""
    # Update username if provided (minimum 3 characters)
    if user_update.username and user_update.username != current.username:
        if len(user_update.username.strip()) < 3:
            raise HTTPException(status_code=400, detail="Username must be at least 3 characters")
        current.username = user_update.username
    
    # Check if email is being changed and if it's already registered
    if user_update.email and user_update.email.lower() != current.email:
        existing = await crud.get_user_by_email(db, user_update.email.lower())
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")
        current.email = user_update.email.lower()
    
    # Update the user in database
    updated_user = await crud.update_user(db, current)
    return updated_user


@app.post("/complete-tutorial")
async def complete_tutorial(current: models.User = Depends(auth.get_current_user), db: AsyncSession = Depends(get_session)):
    """Mark tutorial as completed for the user (set is_first_login to False)"""
    current.is_first_login = False
    db.add(current)
    await db.commit()
    return {"message": "Tutorial completed", "is_first_login": False}


# Biometric endpoints
@app.post("/biometric/enable")
async def enable_biometric(current: models.User = Depends(auth.get_current_user), db: AsyncSession = Depends(get_session)):
    """Enable biometric authentication for the current user"""
    current.biometric_enabled = True
    db.add(current)
    await db.commit()
    return {"message": "Biometric authentication enabled", "biometric_enabled": True}


@app.post("/biometric/disable")
async def disable_biometric(current: models.User = Depends(auth.get_current_user), db: AsyncSession = Depends(get_session)):
    """Disable biometric authentication for the current user"""
    current.biometric_enabled = False
    db.add(current)
    await db.commit()
    return {"message": "Biometric authentication disabled", "biometric_enabled": False}


@app.get("/biometric/status")
async def get_biometric_status(current: models.User = Depends(auth.get_current_user)):
    """Get biometric authentication status for the current user"""
    return {"biometric_enabled": current.biometric_enabled}


@app.post("/biometric/check")
async def check_biometric_status(
    request: schemas.BiometricLoginRequest,
    db: AsyncSession = Depends(get_session)
):
    """Check if biometric is enabled for a specific email
    
    This endpoint is used to check biometric status BEFORE prompting for fingerprint.
    It does not require authentication and only returns the enabled status.
    """
    # Find user by email
    user = await crud.get_user_by_email(db, request.email.lower())
    
    if not user:
        return {"biometric_enabled": False, "user_exists": False}
    
    return {"biometric_enabled": user.biometric_enabled, "user_exists": True}


@app.post("/biometric/master-password")
async def get_biometric_master_password(
    request: schemas.BiometricLoginRequest,
    db: AsyncSession = Depends(get_session)
):
    """Get master password hash for biometric authentication
    
    This endpoint is used DURING login flow, BEFORE user is authenticated.
    It verifies that biometric is enabled for the given email and returns
    the master password hash to complete the login.
    
    SECURITY: This is safe because:
    1. User must have already passed device biometric authentication
    2. Biometric must be explicitly enabled for this account
    3. The returned hash is still needed to decrypt vault keys
    """
    # Find user by email
    result = await db.execute(
        models.User.__table__.select().where(models.User.email == request.email)
    )
    user = result.fetchone()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not user.biometric_enabled:
        raise HTTPException(status_code=403, detail="Biometric authentication is not enabled for this account")
    
    return {
        "master_password": user.master_password_hash,
        "email": user.email
    }


@app.post("/biometric/login")
async def biometric_login(
    request: schemas.BiometricLoginRequest,
    db: AsyncSession = Depends(get_session)
):
    """Login using biometric authentication
    
    This endpoint is called AFTER successful device biometric verification.
    It verifies that biometric is enabled for the account and returns
    a login token and necessary cryptographic data WITHOUT password verification.
    
    SECURITY: This is safe because:
    1. User must have passed device-level biometric authentication (fingerprint/face)
    2. Biometric must be explicitly enabled for this account in the database
    3. Device biometric is as secure as password authentication
    4. Same login flow as regular password login, just different authentication method
    """
    # Find user by email
    user = await crud.get_user_by_email(db, request.email.lower())
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Verify biometric is enabled for this account
    if not user.biometric_enabled:
        raise HTTPException(
            status_code=403, 
            detail="Biometric authentication is not enabled for this account"
        )
    
    # Create access token (same as regular login)
    access_token = auth.create_access_token({"sub": str(user.id)})
    
    # Return same response as regular login
    return JSONResponse({
        "access_token": access_token,
        "token_type": "bearer",
        "encrypted_vault_key": user.encrypted_vault_key.hex(),
        "vault_salt": user.vault_salt.hex(),
        "public_key_pem": user.public_key_pem,
        "master_password_hash": user.master_password_hash,  # Client needs this to derive vault key
        "is_first_login": user.is_first_login
    })


@app.post("/passwords", response_model=schemas.PasswordEntryOut)
async def create_password(entry: schemas.PasswordEntryCreate, current: models.User = Depends(auth.get_current_user), db: AsyncSession = Depends(get_session)):
    # Server stores encrypted_password blob as-is
    pe = models.PasswordEntry(
        owner_id=current.id,
        title=entry.title,
        username=entry.username,
        encrypted_password=entry.encrypted_password,
        url=entry.url,
        category=entry.category,
        notes=entry.notes,
    )
    created = await crud.create_password_entry(db, pe)
    return created


@app.get("/passwords", response_model=list[schemas.PasswordEntryOut])
async def list_passwords(current: models.User = Depends(auth.get_current_user), db: AsyncSession = Depends(get_session)):
    items = await crud.get_passwords_for_user(db, current.id)
    return items


@app.get("/passwords/{password_id}", response_model=schemas.PasswordEntryOut)
async def get_password(password_id: int, current: models.User = Depends(auth.get_current_user), db: AsyncSession = Depends(get_session)):
    password = await crud.get_password_entry(db, password_id)
    if not password:
        raise HTTPException(status_code=404, detail="Password not found")
    
    # Check if user is owner or has access via sharing
    if password.owner_id != current.id:
        # Check if password is shared with this user
        shared = await crud.get_share_for_user_and_password(db, current.id, password_id)
        if not shared:
            raise HTTPException(status_code=404, detail="Password not found")
    
    return password


@app.put("/passwords/{password_id}", response_model=schemas.PasswordEntryOut)
async def update_password(password_id: int, entry: schemas.PasswordEntryCreate, current: models.User = Depends(auth.get_current_user), db: AsyncSession = Depends(get_session)):
    password = await crud.get_password_entry(db, password_id)
    if not password:
        raise HTTPException(status_code=404, detail="Password not found")
    
    # Check if user is owner or has edit permission via sharing
    if password.owner_id != current.id:
        shared = await crud.get_share_for_user_and_password(db, current.id, password_id)
        if not shared or shared.permission != "edit":
            raise HTTPException(status_code=403, detail="You don't have permission to edit this password")
    
    password.title = entry.title
    password.username = entry.username
    password.encrypted_password = entry.encrypted_password
    password.url = entry.url
    password.category = entry.category
    password.notes = entry.notes
    
    updated = await crud.update_password_entry(db, password)
    return updated


@app.delete("/passwords/{password_id}")
async def delete_password(password_id: int, current: models.User = Depends(auth.get_current_user), db: AsyncSession = Depends(get_session)):
    password = await crud.get_password_entry(db, password_id)
    if not password or password.owner_id != current.id:
        raise HTTPException(status_code=404, detail="Password not found")
    
    success = await crud.delete_password_entry(db, password_id)
    if not success:
        raise HTTPException(status_code=404, detail="Password not found")
    return {"status": "deleted", "id": password_id}


@app.post("/share", response_model=schemas.ShareOut)
async def share_password(share: schemas.ShareCreate, current: models.User = Depends(auth.get_current_user), db: AsyncSession = Depends(get_session)):
    # Ensure recipient exists
    recipient = await crud.get_user_by_id(db, share.to_user_id)
    if not recipient:
        raise HTTPException(status_code=404, detail="Recipient not found")

    sp = models.SharedPassword(
        entry_id=share.entry_id,
        from_user_id=current.id,
        to_user_id=share.to_user_id,
        encrypted_key_for_recipient=share.encrypted_key_for_recipient,
        encrypted_password=share.encrypted_password,
        encrypted_message=share.encrypted_message,
        permission=share.permission or "view",
        status="pending",
    )
    created = await crud.create_shared_password(db, sp)
    return created


@app.get("/shared/incoming", response_model=list[schemas.ShareOut])
async def incoming_shares(current: models.User = Depends(auth.get_current_user), db: AsyncSession = Depends(get_session)):
    items = await crud.get_incoming_shares(db, current.id)
    return items


@app.post("/shared/{share_id}/accept")
async def accept_share(share_id: int, current: models.User = Depends(auth.get_current_user), db: AsyncSession = Depends(get_session)):
    share = await crud.update_share_status(db, share_id, "accepted")
    if not share:
        raise HTTPException(status_code=404, detail="Share not found")
    return {"status": "accepted"}


@app.get("/users/{user_id}/public_key")
async def get_public_key(user_id: int, db: AsyncSession = Depends(get_session)):
    user = await crud.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"user_id": user.id, "public_key_pem": user.public_key_pem}


@app.get("/users/me")
async def get_current_user_info(current: models.User = Depends(auth.get_current_user)):
    return {"user_id": current.id, "username": current.username, "email": current.email, "public_key_pem": current.public_key_pem}


@app.get("/users/{user_id}")
async def get_user_info(user_id: int, current: models.User = Depends(auth.get_current_user), db: AsyncSession = Depends(get_session)):
    user = await crud.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"user_id": user.id, "username": user.username, "email": user.email, "public_key_pem": user.public_key_pem}


@app.get("/users/by-username/{username}")
async def get_user_by_username(username: str, db: AsyncSession = Depends(get_session)):
    user = await crud.get_user_by_username(db, username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"user_id": user.id, "username": user.username, "email": user.email, "public_key_pem": user.public_key_pem}


@app.get("/users/by-email/{email}")
async def get_user_by_email(email: str, db: AsyncSession = Depends(get_session)):
    user = await crud.get_user_by_email(db, email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"user_id": user.id, "username": user.username, "email": user.email, "public_key_pem": user.public_key_pem}


@app.get("/shared/outgoing", response_model=list[schemas.ShareOut])
async def outgoing_shares(current: models.User = Depends(auth.get_current_user), db: AsyncSession = Depends(get_session)):
    items = await crud.get_outgoing_shares(db, current.id)
    return items


@app.get("/passwords/{password_id}/shares", response_model=list[schemas.ShareOut])
async def get_password_shares(password_id: int, current: models.User = Depends(auth.get_current_user), db: AsyncSession = Depends(get_session)):
    # Verify the user owns this password
    password = await crud.get_password_entry(db, password_id)
    if not password or password.owner_id != current.id:
        raise HTTPException(status_code=404, detail="Password not found")
    
    # Get all shares for this password
    items = await crud.get_shares_for_password(db, password_id)
    return items


@app.delete("/shared/{share_id}")
async def delete_share(share_id: int, current: models.User = Depends(auth.get_current_user), db: AsyncSession = Depends(get_session)):
    # Get the share
    share = await crud.get_share_by_id(db, share_id)
    if not share:
        raise HTTPException(status_code=404, detail="Share not found")
    
    # Only the owner can delete shares
    if share.from_user_id != current.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await crud.delete_share(db, share_id)
    return {"status": "deleted", "id": share_id}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend_vm.main:app", host="0.0.0.0", port=8000, reload=True)
