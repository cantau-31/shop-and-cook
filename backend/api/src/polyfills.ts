import { webcrypto } from 'crypto';

// Ensure libraries that expect Node 20+ Web Crypto APIs still work under Node 18
if (!globalThis.crypto) {
  globalThis.crypto = webcrypto as Crypto;
}
