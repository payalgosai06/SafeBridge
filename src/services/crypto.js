/**
 * SafeStep Crypto Service
 * Uses Web Crypto API for SHA-256 hashing and AES-256-GCM encryption.
 * No external crypto libraries — browser-native only.
 */

/**
 * Generate SHA-256 hash of a file or ArrayBuffer.
 * @param {File|ArrayBuffer} input - File object or ArrayBuffer to hash
 * @returns {Promise<string>} Hex-encoded SHA-256 hash
 */
export async function generateHash(input) {
  let buffer;
  if (input instanceof File) {
    buffer = await input.arrayBuffer();
  } else if (input instanceof ArrayBuffer) {
    buffer = input;
  } else if (typeof input === 'string') {
    buffer = new TextEncoder().encode(input).buffer;
  } else {
    throw new Error('Input must be a File, ArrayBuffer, or string');
  }

  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Derive an AES-256-GCM key from a passphrase using PBKDF2.
 * @param {string} passphrase - User's passcode
 * @param {Uint8Array} salt - Random salt (stored alongside encrypted data)
 * @returns {Promise<CryptoKey>} AES-256-GCM key
 */
async function deriveKey(passphrase, salt) {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt data with AES-256-GCM using a passphrase.
 * Returns an object with encrypted data, salt, and IV for storage.
 * @param {ArrayBuffer|string} data - Data to encrypt
 * @param {string} passphrase - Encryption passphrase
 * @returns {Promise<{encrypted: ArrayBuffer, salt: Uint8Array, iv: Uint8Array}>}
 */
export async function encrypt(data, passphrase) {
  let buffer;
  if (typeof data === 'string') {
    buffer = new TextEncoder().encode(data).buffer;
  } else if (data instanceof ArrayBuffer) {
    buffer = data;
  } else {
    throw new Error('Data must be a string or ArrayBuffer');
  }

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt);

  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    buffer
  );

  return { encrypted, salt, iv };
}

/**
 * Decrypt AES-256-GCM encrypted data using a passphrase.
 * @param {ArrayBuffer} encryptedData - Encrypted data
 * @param {string} passphrase - Decryption passphrase
 * @param {Uint8Array} salt - Salt used during encryption
 * @param {Uint8Array} iv - IV used during encryption
 * @returns {Promise<ArrayBuffer>} Decrypted data
 */
export async function decrypt(encryptedData, passphrase, salt, iv) {
  const key = await deriveKey(passphrase, salt);

  return crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    encryptedData
  );
}

/**
 * Generate a random Case ID (12-character alphanumeric).
 * @returns {string} Case ID like "A7K2-M9X3-P1Q4"
 */
export function generateCaseId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I, O, 0, 1 to avoid confusion
  const segments = [];
  for (let s = 0; s < 3; s++) {
    let segment = '';
    for (let i = 0; i < 4; i++) {
      const randomIndex = crypto.getRandomValues(new Uint8Array(1))[0] % chars.length;
      segment += chars[randomIndex];
    }
    segments.push(segment);
  }
  return segments.join('-');
}

/**
 * Generate a random encryption key for cases that don't use a passcode.
 * Stored in sessionStorage only — lost when tab closes.
 * @returns {string} 32-character hex string
 */
export function generateSessionKey() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Get device metadata (what's available in a browser context).
 * @returns {object} Device metadata
 */
export function getDeviceMetadata() {
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform || 'unknown',
    language: navigator.language,
    screenResolution: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timestamp: new Date().toISOString(),
    timestampUnix: Date.now(),
  };
}
