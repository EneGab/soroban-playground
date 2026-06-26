import crypto from 'crypto';
import { Keypair } from '@stellar/stellar-sdk';
import redisService from './redisService.js';

/**
 * Signing request schema:
 * {
 *   callerAddress: string  — Stellar G… public key of the signing wallet
 *   contractId:   string  — Soroban contract ID being called
 *   method:       string  — contract method name
 *   params:       any     — method arguments (JSON-serialisable, may be null/omitted)
 *   nonce:        string  — unique value per request (UUID or random hex)
 *   expiry:       number  — Unix timestamp in milliseconds; request is invalid after this
 *   signature:    string  — base64-encoded ED25519 signature over SHA-256 of canonical message
 * }
 */

class SignatureValidationService {
  /**
   * Builds a deterministic string representation of the request fields.
   * Fields are serialised in lexicographic key order to prevent ambiguity.
   */
  _buildCanonicalMessage({ callerAddress, contractId, expiry, method, nonce, params }) {
    return JSON.stringify({
      callerAddress,
      contractId,
      expiry,
      method,
      nonce,
      params: JSON.stringify(params ?? null),
    });
  }

  /**
   * Verifies a Stellar ED25519 signature over a canonical request message.
   *
   * Returns { valid: true } on success.
   * Returns { valid: false, reason: 'expired' | 'bad_signature' | 'replay' } on failure.
   *
   * The expiry check and hash computation happen before the signature check so
   * that cheap operations gate the more expensive ED25519 verify call.
   */
  async verify({ callerAddress, contractId, method, params, nonce, expiry, signature }) {
    // 1. Reject stale requests immediately (no crypto work needed)
    if (expiry < Date.now()) {
      return { valid: false, reason: 'expired' };
    }

    // 2. Hash the canonical message (fast, pre-screens replay before touching Redis)
    const msgHash = crypto
      .createHash('sha256')
      .update(this._buildCanonicalMessage({ callerAddress, contractId, expiry, method, nonce, params }))
      .digest();

    // 3. Verify ED25519 signature using the Stellar public key
    try {
      const keypair = Keypair.fromPublicKey(callerAddress);
      const sigBuffer = Buffer.from(signature, 'base64');
      const valid = keypair.verify(msgHash, sigBuffer);
      if (!valid) {
        return { valid: false, reason: 'bad_signature' };
      }
    } catch {
      return { valid: false, reason: 'bad_signature' };
    }

    // 4. Atomically claim the nonce (set-if-not-exists) to prevent replay attacks.
    //    TTL is derived from the remaining time until expiry so the nonce key
    //    expires at the same time as the request itself.
    const nonceKey = `sig:nonce:${callerAddress}:${nonce}`;
    const ttlSeconds = Math.max(1, Math.ceil((expiry - Date.now()) / 1000));
    const stored = await redisService.setNX(nonceKey, '1', ttlSeconds);
    if (!stored) {
      return { valid: false, reason: 'replay' };
    }

    return { valid: true };
  }
}

const signatureValidationService = new SignatureValidationService();
export default signatureValidationService;
