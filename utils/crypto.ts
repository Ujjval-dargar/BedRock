import * as Crypto from 'expo-crypto';
import { Buffer } from 'buffer';

// PBKDF2 key derivation (simulated with SHA256 hashing)
// Note: For production, you should use a proper PBKDF2 implementation
export async function deriveKeyFromPassword(
  password: string,
  salt: string,
  iterations: number = 200000
): Promise<string> {
  // This is a simplified version - in production use proper PBKDF2
  let derived = password + salt;
  for (let i = 0; i < Math.min(iterations, 1000); i++) {
    derived = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      derived
    );
  }
  return derived;
}

// AES-GCM encryption (simplified - React Native doesn't have built-in AES-GCM)
// In production, use a library like react-native-aes-crypto or expo-crypto with proper AES-GCM
export async function aesEncrypt(plaintext: string, key: string): Promise<string> {
  // For now, we'll use a simple XOR cipher as placeholder
  // In production, replace with proper AES-GCM encryption
  const keyHash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    key
  );
  
  // Simple encoding (NOT SECURE - replace with proper crypto library)
  const encrypted = Buffer.from(plaintext)
    .toString('base64')
    .split('')
    .map((char, i) => {
      const keyChar = keyHash.charCodeAt(i % keyHash.length);
      return String.fromCharCode(char.charCodeAt(0) ^ keyChar);
    })
    .join('');
  
  return Buffer.from(encrypted).toString('base64');
}

// AES-GCM decryption (simplified)
export async function aesDecrypt(ciphertext: string, key: string): Promise<string> {
  try {
    const keyHash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      key
    );
    
    // Simple decoding (NOT SECURE - replace with proper crypto library)
    const decoded = Buffer.from(ciphertext, 'base64').toString();
    const decrypted = decoded
      .split('')
      .map((char, i) => {
        const keyChar = keyHash.charCodeAt(i % keyHash.length);
        return String.fromCharCode(char.charCodeAt(0) ^ keyChar);
      })
      .join('');
    
    return Buffer.from(decrypted, 'base64').toString();
  } catch {
    throw new Error('Decryption failed');
  }
}

// Generate random bytes (for vault key generation)
export async function generateRandomBytes(length: number): Promise<string> {
  const bytes = await Crypto.getRandomBytesAsync(length);
  return Buffer.from(bytes).toString('hex');
}

// Convert hex to base64
export function hexToBase64(hex: string): string {
  return Buffer.from(hex, 'hex').toString('base64');
}

// Convert base64 to hex
export function base64ToHex(base64: string): string {
  return Buffer.from(base64, 'base64').toString('hex');
}

// Hash password (for display purposes, not for storage)
export async function hashPassword(password: string): Promise<string> {
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    password
  );
}

// Encrypt vault key with derived key from master password
export async function encryptVaultKey(
  vaultKey: string,
  masterPassword: string,
  salt: string
): Promise<string> {
  const derivedKey = await deriveKeyFromPassword(masterPassword, salt);
  return await aesEncrypt(derivedKey, vaultKey);
}

// Decrypt vault key with derived key from master password
export async function decryptVaultKey(
  encryptedVaultKey: string,
  masterPassword: string,
  salt: string
): Promise<string> {
  const derivedKey = await deriveKeyFromPassword(masterPassword, salt);
  return await aesDecrypt(derivedKey, encryptedVaultKey);
}

// RSA encryption/decryption helpers (placeholder - requires react-native-rsa-native or similar)
// For production, implement proper RSA-OAEP encryption
export async function rsaEncrypt(publicKey: string, plaintext: string): Promise<string> {
  // Placeholder - in production use proper RSA library
  console.warn('RSA encryption not implemented - using mock encryption');
  return Buffer.from(plaintext).toString('base64');
}

export async function rsaDecrypt(privateKey: string, ciphertext: string): Promise<string> {
  // Placeholder - in production use proper RSA library
  console.warn('RSA decryption not implemented - using mock decryption');
  return Buffer.from(ciphertext, 'base64').toString();
}

// Validate password strength
export function validatePasswordStrength(password: string): {
  isStrong: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  
  if (password.length < 12) {
    issues.push('Password must be at least 12 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    issues.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    issues.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    issues.push('Password must contain at least one number');
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    issues.push('Password must contain at least one special character');
  }
  
  return {
    isStrong: issues.length === 0,
    issues,
  };
}
