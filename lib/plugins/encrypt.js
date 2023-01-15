import nodeCrypto from 'crypto';
import fs from 'fs';
import greyMatter from 'gray-matter';

function shareFrontmatterTransform(content) {
  if (!this.inputPath || !this.inputPath.endsWith('.md')) return content;
  const inputContent = fs.readFileSync(this.inputPath, 'utf8');
  this.page.data = greyMatter(inputContent).data;
  return content;
}

function encryptTransform(content) {
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

  // Open ./decryptions.txt and append the decryption path
  fs.appendFileSync(
    './decryptions.txt',
    `${encryptedPath} -> /decrypt/?t=${encodeURIComponent(this.page.url)}#${base64EncryptionKey}\n`,
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

  // Redirect to /encrypted
  return '<meta http-equiv="refresh" content="0; url=/encrypted" />';
}

/**
 * @param {import('@11ty/eleventy').UserConfig} eleventyConfig
 * */
export default function (eleventyConfig) {
  // clear decryptions.txt
  fs.writeFileSync('./decryptions.txt', '');

  eleventyConfig.addTransform('share-frontmatter', shareFrontmatterTransform);
  eleventyConfig.addTransform('encrypt', encryptTransform);
}
