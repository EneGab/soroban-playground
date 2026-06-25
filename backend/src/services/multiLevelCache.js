// Copyright (c) 2026 StellarDevTools
// SPDX-License-Identifier: MIT

import { LRUCache } from 'lru-cache';
import redisService from './redisService.js';

const L1_TTL_MS = 30_000;
const L1_MAX = 1000;
const L2_TTL_S = 300;

export class MultiLevelCache {
  constructor(opts = {}) {
    this.l1TtlMs = opts.l1TtlMs ?? L1_TTL_MS;
    this.l1 = new LRUCache({ max: opts.maxL1 ?? L1_MAX, ttl: this.l1TtlMs });
    this.l2TtlS = opts.l2TtlS ?? L2_TTL_S;
    this.inflight = new Map();
  }

  async get(key, fetchFn) {
    const l1Val = this.l1.get(key);
    if (l1Val !== undefined) return l1Val;

    const l2Raw = await redisService.get(key);
    if (l2Raw !== null) {
      let parsed;
      try {
        parsed = JSON.parse(l2Raw);
      } catch {
        parsed = l2Raw;
      }

      // Cap L1 TTL to remaining L2 TTL so we don't re-fetch L2 unnecessarily
      let l1Ttl = this.l1TtlMs;
      if (!redisService.isFallbackMode && redisService.client) {
        try {
          const remainingS = await redisService.client.ttl(key);
          if (remainingS > 0) {
            l1Ttl = Math.min(this.l1TtlMs, remainingS * 1000);
          }
        } catch {
          // best-effort
        }
      }
      this.l1.set(key, parsed, { ttl: l1Ttl });
      return parsed;
    }

    // Stampede protection: deduplicate concurrent fetches for the same key
    if (this.inflight.has(key)) return this.inflight.get(key);

    const promise = fetchFn()
      .then((value) => {
        if (value !== undefined && value !== null) {
          this.l1.set(key, value);
          redisService.set(key, JSON.stringify(value), this.l2TtlS);
        }
        return value;
      })
      .finally(() => this.inflight.delete(key));

    this.inflight.set(key, promise);
    return promise;
  }

  async invalidate(key) {
    this.l1.delete(key);
    await redisService.delete(key);
  }

  async invalidatePattern(prefix) {
    for (const k of this.l1.keys()) {
      if (k.startsWith(prefix)) this.l1.delete(k);
    }
    // Use cursor-based SCAN — never KEYS (O(N), blocks Redis event loop)
    if (!redisService.isFallbackMode && redisService.client) {
      let cursor = '0';
      do {
        const [next, keys] = await redisService.client.scan(
          cursor,
          'MATCH',
          `${prefix}*`,
          'COUNT',
          100
        );
        cursor = next;
        if (keys.length) await redisService.client.del(...keys);
      } while (cursor !== '0');
    }
  }

  clear() {
    this.l1.clear();
    this.inflight.clear();
  }
}

export const multiLevelCache = new MultiLevelCache();
export default multiLevelCache;
