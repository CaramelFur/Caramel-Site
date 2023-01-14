import nodeCrypto from 'crypto';
import fs from 'fs';

export default function (content) {
  if (this.page?.outputFileExtension !== 'html') return content;
  if (!this.page?.data?.encryption) return content;

  const encryptedPath = this.page?.outputPath.slice(0, -5) + '.enc';
  const encryptionKeyStr = String(this.page?.data?.encryption);
  if (!encryptedPath || !encryptionKeyStr) return content;

  // encryption key is sha256(process.env.ENCRYPTION_BASE + outputpath + encryptionKeyStr)
  const encryptionKey = nodeCrypto
    .createHash('sha256')
    .update(process.env.ENCRYPTION_BASE)
    .update(encryptedPath)
    .update(encryptionKeyStr)
    .digest();

  const base64EncryptionKey = encryptionKey
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  // print encryption key as base64
  console.log(
    `Encryption key for ${encryptedPath} is http://localhost:8080/decrypt/?t=${this.page.url}#${base64EncryptionKey}`,
  );

  const encryptionIV = nodeCrypto.randomBytes(16);

  // encrypt content using aes-256-cbc with pcks7 padding
  const cipher = nodeCrypto.createCipheriv(
    'aes-256-cbc',
    encryptionKey,
    encryptionIV,
  );
  // encrypt into buffer
  const encrypted = Buffer.concat([
    Buffer.alloc(4),
    encryptionIV,
    cipher.update(content),
    cipher.final(),
  ]);

  encrypted.writeUint32LE(encrypted.length - 20, 0);

  // Write to encryptedPath, and ensure directory exists
  fs.mkdirSync(encryptedPath.slice(0, encryptedPath.lastIndexOf('/')), {
    recursive: true,
  });
  fs.writeFileSync(encryptedPath, encrypted);

  return '<h1>Encrypted</h1><p>This page is encrypted.</p>';
}
