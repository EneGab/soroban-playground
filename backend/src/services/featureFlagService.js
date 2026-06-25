// Copyright (c) 2026 StellarDevTools
// SPDX-License-Identifier: MIT

import crypto from 'crypto';
import Redis from 'ioredis';
import redisService from './redisService.js';
import { getDatabase } from '../database/connection.js';

const FLAGS_CACHE_KEY = 'feature_flags:all';
const FLAG_TTL_S = 60;

class FeatureFlagService {
  constructor() {
    // Pub/Sub requires a SEPARATE ioredis connection — a connection in subscriber
    // mode cannot execute regular commands (GET/SET/DEL). Regular Redis ops use
    // redisService.client; this subClient is exclusively for .subscribe().
    this.subClient = null;
    this.inflightLoad = null;
  }

  initSubscriber() {
    if (!redisService.isFallbackMode && redisService.client) {
      this.subClient = new Redis(
        process.env.REDIS_URL || 'redis://localhost:6379',
        {
          maxRetriesPerRequest: 1,
          connectTimeout: 5000,
          connectionName: 'feature-flags-sub',
        }
      );
      this.subClient.on('error', () => {
        // subscriber is best-effort; swallow to avoid unhandled rejection spam
      });
      this.subClient.subscribe('feature_flags:invalidate');
      this.subClient.on('message', () => {
        redisService.delete(FLAGS_CACHE_KEY);
      });
    }
  }

  async loadFlags() {
    if (this.inflightLoad) return this.inflightLoad;

    const cached = await redisService.get(FLAGS_CACHE_KEY);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        // corrupted cache — fall through to reload
      }
    }

    this.inflightLoad = this._fetchAndCache().finally(() => {
      this.inflightLoad = null;
    });
    return this.inflightLoad;
  }

  async _fetchAndCache() {
    const db = getDatabase();
    const flags = await db.all('SELECT * FROM feature_flags');
    const cohorts = await db.all('SELECT * FROM flag_cohorts');
    const data = { flags, cohorts };
    await redisService.set(FLAGS_CACHE_KEY, JSON.stringify(data), FLAG_TTL_S);
    return data;
  }

  // Evaluation order:
  // 1. Unknown flag → false
  // 2. Cohort override (if cohortId provided) → explicit enabled/disabled
  // 3. Global kill switch: enabled=0 → false
  // 4. Full rollout: rollout_pct=100 → true
  // 5. No userId → false (can't hash)
  // 6. Deterministic percentage rollout via SHA-256 hash bucket
  async evaluate(flagKey, context = {}) {
    const { flags, cohorts } = await this.loadFlags();
    const flag = flags.find((f) => f.key === flagKey);
    if (!flag) return false;

    if (context.cohortId) {
      const cohort = cohorts.find(
        (c) => c.flag_key === flagKey && c.cohort_id === context.cohortId
      );
      if (cohort) return !!cohort.enabled;
    }

    if (!flag.enabled) return false;
    if (flag.rollout_pct >= 100) return true;
    if (!context.userId) return false;

    const hash = crypto
      .createHash('sha256')
      .update(flagKey + context.userId)
      .digest();
    const bucket = hash.readUInt16BE(0) % 100;
    return bucket < flag.rollout_pct;
  }

  async invalidate() {
    await redisService.delete(FLAGS_CACHE_KEY);
    if (!redisService.isFallbackMode && redisService.client) {
      await redisService.client.publish('feature_flags:invalidate', '1');
    }
  }

  async listFlags() {
    const db = getDatabase();
    return db.all('SELECT * FROM feature_flags ORDER BY created_at DESC');
  }

  async getFlag(key) {
    const db = getDatabase();
    return db.get('SELECT * FROM feature_flags WHERE key = ?', [key]);
  }

  async createFlag({ key, enabled = 0, rollout_pct = 0, description = '' }) {
    const db = getDatabase();
    await db.run(
      'INSERT INTO feature_flags (key, enabled, rollout_pct, description) VALUES (?, ?, ?, ?)',
      [key, enabled ? 1 : 0, rollout_pct, description]
    );
    await this.invalidate();
    return this.getFlag(key);
  }

  async updateFlag(key, updates = {}) {
    const db = getDatabase();
    const flag = await this.getFlag(key);
    if (!flag) return null;

    const enabled =
      updates.enabled !== undefined ? (updates.enabled ? 1 : 0) : flag.enabled;
    const rollout_pct =
      updates.rollout_pct !== undefined
        ? updates.rollout_pct
        : flag.rollout_pct;
    const description =
      updates.description !== undefined
        ? updates.description
        : flag.description;

    await db.run(
      'UPDATE feature_flags SET enabled = ?, rollout_pct = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?',
      [enabled, rollout_pct, description, key]
    );
    await this.invalidate();
    return this.getFlag(key);
  }

  async deleteFlag(key) {
    const db = getDatabase();
    const result = await db.run('DELETE FROM feature_flags WHERE key = ?', [
      key,
    ]);
    await this.invalidate();
    return result.changes > 0;
  }

  async listCohorts(flagKey) {
    const db = getDatabase();
    return db.all(
      'SELECT * FROM flag_cohorts WHERE flag_key = ? ORDER BY created_at DESC',
      [flagKey]
    );
  }

  async addCohort(flagKey, cohortId, enabled = 1) {
    const db = getDatabase();
    await db.run(
      'INSERT INTO flag_cohorts (flag_key, cohort_id, enabled) VALUES (?, ?, ?) ON CONFLICT(flag_key, cohort_id) DO UPDATE SET enabled = excluded.enabled',
      [flagKey, cohortId, enabled ? 1 : 0]
    );
    await this.invalidate();
  }

  async removeCohort(flagKey, cohortId) {
    const db = getDatabase();
    const result = await db.run(
      'DELETE FROM flag_cohorts WHERE flag_key = ? AND cohort_id = ?',
      [flagKey, cohortId]
    );
    await this.invalidate();
    return result.changes > 0;
  }
}

export const featureFlagService = new FeatureFlagService();
export default featureFlagService;
