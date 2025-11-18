from sqlalchemy import Column, Integer, String, LargeBinary, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from database import Base
import datetime


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(200), unique=True, nullable=False, index=True)
    master_password_hash = Column(String(512), nullable=False)
    # vault key encrypted with key derived from master password
    encrypted_vault_key = Column(LargeBinary, nullable=False)
    vault_salt = Column(LargeBinary, nullable=False)
    # RSA public key stored plaintext (public)
    public_key_pem = Column(Text, nullable=False)
    # Private key encrypted with vault key
    encrypted_private_key = Column(LargeBinary, nullable=False)

    password_entries = relationship("PasswordEntry", back_populates="owner")
    outgoing_shares = relationship("SharedPassword", back_populates="from_user", foreign_keys='SharedPassword.from_user_id')
    incoming_shares = relationship("SharedPassword", back_populates="to_user", foreign_keys='SharedPassword.to_user_id')


class PasswordEntry(Base):
    __tablename__ = "password_entries"
    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    username = Column(String(200), nullable=True)
    # encrypted blob (clients should encrypt with their vault key before sending)
    encrypted_password = Column(LargeBinary, nullable=False)
    url = Column(String(500), nullable=True)
    category = Column(String(50), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    owner = relationship("User", back_populates="password_entries")


class SharedPassword(Base):
    __tablename__ = "shared_passwords"
    id = Column(Integer, primary_key=True, index=True)
    entry_id = Column(Integer, ForeignKey("password_entries.id"), nullable=True)
    from_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    to_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    # the encrypted symmetric key for recipient (encrypted with recipient public key)
    encrypted_key_for_recipient = Column(LargeBinary, nullable=False)
    # carry the encrypted password blob as-is
    encrypted_password = Column(LargeBinary, nullable=False)
    permission = Column(String(20), default="view")  # 'view' or 'edit'
    status = Column(String(50), default="pending")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    from_user = relationship("User", foreign_keys=[from_user_id], back_populates="outgoing_shares")
    to_user = relationship("User", foreign_keys=[to_user_id], back_populates="incoming_shares")
