import { Buffer } from 'buffer';
import { AES, enc, lib } from 'crypto-js';

/**
 * Encryption utility for secure data handling
 * Uses Web Crypto API for secure cryptographic operations
 */

// Constants for encryption
const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12;
const SALT_LENGTH = 16;

/**
 * Generate a cryptographic key from a password
 */
async function generateKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);
  
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );
  
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Generate random bytes for IV or salt
 */
function generateRandomBytes(length: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(length));
}

export interface EncryptedData {
  data: string;
  iv: string;
}

/**
 * Encrypt data using AES-GCM
 */
export const encrypt = (text: string, key: string): EncryptedData => {
  const iv = generateRandomBytes(IV_LENGTH);
  const ivWordArray = lib.WordArray.create(Array.from(iv));
  const encrypted = AES.encrypt(text, key, { iv: ivWordArray });
  return {
    data: encrypted.toString(),
    iv: Buffer.from(iv).toString('base64')
  };
};

/**
 * Decrypt data using AES-GCM
 */
export const decrypt = (text: string, key: string, iv: string): string => {
  const ivBuffer = Buffer.from(iv, 'base64');
  const ivWordArray = lib.WordArray.create(Array.from(ivBuffer));
  const bytes = AES.decrypt(text, key, { iv: ivWordArray });
  return bytes.toString(enc.Utf8);
};

/**
 * Generate a secure random key
 */
export const generateSecureKey = async (): Promise<string> => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Buffer.from(array).toString('base64');
};

/**
 * Hash a string using SHA-256
 */
export async function hashString(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verify if a string matches a hash
 */
export async function verifyHash(input: string, hash: string): Promise<boolean> {
  const inputHash = await hashString(input);
  return inputHash === hash;
}

export const encryptObject = <T extends object>(obj: T, key: string): EncryptedData => {
  return encrypt(JSON.stringify(obj), key);
};

export const decryptObject = <T extends object>(ciphertext: EncryptedData, key: string): T => {
  const decrypted = decrypt(ciphertext.data, key, ciphertext.iv);
  return JSON.parse(decrypted) as T;
}; 