// auth.js - TOTP helper for admin 2FA
const XPA_TOTP_SEED = 'JBSWY3DPEHPK3PXP';

function base32toHex(base32) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = "";
  let hex = "";
  
  for (let i = 0; i < base32.length; i++) {
    const val = alphabet.indexOf(base32.charAt(i).toUpperCase());
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, '0');
  }
  
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    const chunk = bits.substr(i, 8);
    hex += parseInt(chunk, 2).toString(16).padStart(2, '0');
  }
  
  return hex;
}

async function totpCode(seed) {
  const keyHex = base32toHex(seed);
  const key = hexToUint8Array(keyHex);
  const epoch = Math.floor(Date.now() / 1000);
  const time = Math.floor(epoch / 30);
  const timeBuffer = new ArrayBuffer(8);
  const view = new DataView(timeBuffer);
  view.setUint32(4, time);
  
  const cryptoKey = await crypto.subtle.importKey('raw', key, {name:'HMAC', hash:'SHA-1'}, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, timeBuffer);
  const bytes = new Uint8Array(sig);
  const offset = bytes[bytes.length - 1] & 0xf;
  const code = ((bytes[offset] & 0x7f) << 24) | 
               ((bytes[offset+1] & 0xff) << 16) | 
               ((bytes[offset+2] & 0xff) << 8) | 
               (bytes[offset+3] & 0xff);
  
  return (code % 1000000).toString().padStart(6, '0');
}

function hexToUint8Array(hex) {
  const res = new Uint8Array(hex.length / 2);
  for (let i = 0; i < res.length; i++) {
    res[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return res;
}

window.xpandoraxAuth = {seed: XPA_TOTP_SEED, totpCode};
