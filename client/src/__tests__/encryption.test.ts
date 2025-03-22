import { encrypt, decrypt, generateKeyPair, createSharedSecret, EncryptedData } from '../utils/encryption';

describe('Encryption Utility', () => {
  describe('encrypt and decrypt', () => {
    it('should correctly encrypt and decrypt string data', () => {
      const testData = 'Hello, World!';
      const key = 'test-key-123';
      
      const encrypted = encrypt(testData, key);
      expect(encrypted).toHaveProperty('data');
      expect(encrypted).toHaveProperty('iv');
      
      const decrypted = decrypt(encrypted, key);
      expect(decrypted).toBe(testData);
    });

    it('should correctly encrypt and decrypt object data', () => {
      const testData = { message: 'Hello', number: 42 };
      const key = 'test-key-123';
      
      const encrypted = encrypt(testData, key);
      const decrypted = decrypt(encrypted, key);
      
      expect(decrypted).toEqual(testData);
    });

    it('should produce different ciphertexts for same data due to random IV', () => {
      const testData = 'Hello, World!';
      const key = 'test-key-123';
      
      const encrypted1 = encrypt(testData, key);
      const encrypted2 = encrypt(testData, key);
      
      expect(encrypted1.data).not.toBe(encrypted2.data);
      expect(encrypted1.iv).not.toBe(encrypted2.iv);
    });

    it('should throw error when decrypting with wrong key', () => {
      const testData = 'Hello, World!';
      const correctKey = 'correct-key';
      const wrongKey = 'wrong-key';
      
      const encrypted = encrypt(testData, correctKey);
      
      expect(() => {
        decrypt(encrypted, wrongKey);
      }).toThrow();
    });
  });

  describe('generateKeyPair', () => {
    it('should generate valid key pairs', () => {
      const keyPair = generateKeyPair();
      
      expect(keyPair).toHaveProperty('publicKey');
      expect(keyPair).toHaveProperty('privateKey');
      expect(typeof keyPair.publicKey).toBe('string');
      expect(typeof keyPair.privateKey).toBe('string');
      expect(keyPair.publicKey.length).toBeGreaterThan(0);
      expect(keyPair.privateKey.length).toBeGreaterThan(0);
    });

    it('should generate unique key pairs', () => {
      const keyPair1 = generateKeyPair();
      const keyPair2 = generateKeyPair();
      
      expect(keyPair1.publicKey).not.toBe(keyPair2.publicKey);
      expect(keyPair1.privateKey).not.toBe(keyPair2.privateKey);
    });
  });

  describe('createSharedSecret', () => {
    it('should create same shared secret for both parties', () => {
      const alice = generateKeyPair();
      const bob = generateKeyPair();
      
      const aliceSharedSecret = createSharedSecret(alice.privateKey, bob.publicKey);
      const bobSharedSecret = createSharedSecret(bob.privateKey, alice.publicKey);
      
      expect(aliceSharedSecret).toBe(bobSharedSecret);
    });

    it('should create different shared secrets for different pairs', () => {
      const alice = generateKeyPair();
      const bob = generateKeyPair();
      const charlie = generateKeyPair();
      
      const aliceBobSecret = createSharedSecret(alice.privateKey, bob.publicKey);
      const aliceCharlieSecret = createSharedSecret(alice.privateKey, charlie.publicKey);
      
      expect(aliceBobSecret).not.toBe(aliceCharlieSecret);
    });
  });
}); 