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
  // Get pKey from hash value
  const passKey = window.location.hash.slice(1);
  if (!reqPath || !passKey || passKey.length === 0) {
    console.error('No target document or key');
    return;
  }

  const docPath = reqPath.endsWith('/')
    ? reqPath + 'index.enc'
    : reqPath + '/index.enc';

  // Strip query params from urlbar and strip hash
  window.history.replaceState({}, '', window.location.pathname);
  window.location.hash = '';

  // download target document into arraybuffer
  const docDat = await fetch(docPath).then((res) => res.arrayBuffer());

  // Key is base64, first 32 bytes are key, last 16 bytes are iv
  const fullKey = b64toU8(passKey.replace(/-/g, '+').replace(/_/g, '/'));

  // read uint32 from first 4 bytes of document
  const docDatLength = new DataView(docDat).getUint32(0, true);

  const decData = await decrypt(
    docDat.slice(20, 20 + docDatLength),
    fullKey,
    docDat.slice(4, 20),
  );

  // Set urlbar to target document and replace document with decrypted html
  window.history.replaceState({}, '', reqPath);

  setTimeout(() => {
    document.querySelector('html').innerHTML = decData;
  }, 1);
}

document.addEventListener('DOMContentLoaded', () => {
  main().catch((e) => {
    console.error(e);
    // Redirect to /
    window.location = '/';
  });
});
