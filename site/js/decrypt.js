function b64toU8(b64) {
  return new Uint8Array(
    window
      .atob(b64)
      .split('')
      .map((c) => c.charCodeAt(0)),
  );
}

function keyImp(raw) {
  return crypto.subtle.importKey('raw', raw, 'AES-CBC', false, ['decrypt']);
}

async function decrypt(dat, key, iv) {
  // decrypt target document using subtle crypto (aes-256-cbc);
  // Output is string
  return await crypto.subtle
    .decrypt(
      {
        name: 'AES-CBC',
        iv,
      },
      await keyImp(key),
      dat,
    )
    .then((decrypted) => new TextDecoder().decode(decrypted));
}

async function main() {
  const params = new URLSearchParams(window.location.search);
  // Get targetdocument from "t" queryparam
  const reqPath = params.get('t');
  const pKey = params.get('k');
  if (!reqPath || !pKey) {
    console.error('No target document or key');
    return;
  }

  const docPath = reqPath.endsWith('/')
    ? reqPath + 'index.enc'
    : reqPath + '/index.enc';

  console.log(`Decrypting ${docPath}`);

  // Strip query params from urlbar
  window.history.replaceState({}, '', window.location.pathname);

  // download target document into arraybuffer
  const docDat = await fetch(docPath).then((res) => res.arrayBuffer());

  // Key is base64, first 32 bytes are key, last 16 bytes are iv
  const fullKey = b64toU8(pKey.replace(/-/g, '+').replace(/_/g, '/'));

  const decData = await decrypt(
    docDat,
    fullKey.slice(0, 32),
    fullKey.slice(32, 48),
  );

  // Set urlbar to target document and replace document with decrypted html
  window.history.replaceState({}, '', reqPath);
  // clear full document
  document.open();
  // write decrypted html
  document.write(decData);
  // close document
  document.close();
}

main().catch((e) => {
  console.error(e);
  // Redirect to /
  window.location = '/';
});
