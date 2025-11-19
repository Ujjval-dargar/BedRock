import os
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import asymmetric
import base64


def generate_vault_key() -> bytes:
    return os.urandom(32)


def derive_key_from_password(password: str, salt: bytes, iterations: int = 200_000) -> bytes:
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=iterations,
        backend=default_backend(),
    )
    return kdf.derive(password.encode())


def aes_encrypt(key: bytes, plaintext: bytes) -> bytes:
    aesgcm = AESGCM(key)
    nonce = os.urandom(12)
    ciphertext = aesgcm.encrypt(nonce, plaintext, None)
    return nonce + ciphertext


def aes_decrypt(key: bytes, ciphertext_with_nonce: bytes) -> bytes:
    aesgcm = AESGCM(key)
    nonce = ciphertext_with_nonce[:12]
    ct = ciphertext_with_nonce[12:]
    return aesgcm.decrypt(nonce, ct, None)


def generate_rsa_keypair(key_size: int = 2048):
    private_key = rsa.generate_private_key(public_exponent=65537, key_size=key_size)
    public_key = private_key.public_key()
    priv_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption(),
    )
    pub_pem = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo,
    )
    return priv_pem, pub_pem


def rsa_encrypt(public_pem: bytes, plaintext: bytes) -> bytes:
    public_key = serialization.load_pem_public_key(public_pem)
    ct = public_key.encrypt(
        plaintext,
        padding.OAEP(mgf=padding.MGF1(algorithm=hashes.SHA256()), algorithm=hashes.SHA256(), label=None),
    )
    return ct


def rsa_decrypt(private_pem: bytes, ciphertext: bytes) -> bytes:
    private_key = serialization.load_pem_private_key(private_pem, password=None)
    pt = private_key.decrypt(
        ciphertext,
        padding.OAEP(mgf=padding.MGF1(algorithm=hashes.SHA256()), algorithm=hashes.SHA256(), label=None),
    )
    return pt


def b64encode(b: bytes) -> str:
    return base64.b64encode(b).decode()


def b64decode(s: str) -> bytes:
    return base64.b64decode(s.encode())


def generate_recovery_key() -> str:
    """
    Generate a human-readable recovery key in format: XXXX-XXXX-XXXX-XXXX
    Using random alphanumeric characters (excluding ambiguous: 0, O, I, 1, l)
    """
    import secrets
    import string
    
    # Use clear characters only (no 0, O, I, 1, l)
    chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'
    
    # Generate 16 characters in 4 groups of 4
    parts = []
    for _ in range(4):
        part = ''.join(secrets.choice(chars) for _ in range(4))
        parts.append(part)
    
    return '-'.join(parts)

