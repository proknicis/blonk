import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';

// Obtain the system master secret key
const SECRET = process.env.NEXTAUTH_SECRET || 'blonk-sovereign-institutional-default-secret-key-32-chars';

// Derive a standard 32-byte key from the NextAuth secret
const KEY = crypto.createHash('sha256').update(SECRET).digest();

/**
 * Encrypts a plaintext string using AES-256-GCM.
 * Returns the encrypted string formatted as "iv_hex:auth_tag_hex:ciphertext_hex"
 */
export function encrypt(text: string): string {
    const iv = crypto.randomBytes(12); // Standard GCM IV length is 12 bytes
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag().toString('hex');
    
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypts a formatted ciphertext string ("iv_hex:auth_tag_hex:ciphertext_hex") using AES-256-GCM.
 * Returns the original decrypted plaintext string.
 */
export function decrypt(encryptedText: string): string {
    const parts = encryptedText.split(':');
    if (parts.length !== 3) {
        throw new Error('Invalid encryption data format. Must be formatted as "iv:authTag:ciphertext".');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const ciphertext = parts[2];
    
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
}
