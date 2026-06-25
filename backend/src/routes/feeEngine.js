// Copyright (c) 2026 StellarDevTools
// SPDX-License-Identifier: MIT

import express from 'express';
import {
  fetchFeeStats,
  calculateFee,
  DEFAULT_MAX_FEE,
  DEFAULT_ESCALATION_FACTOR,
  DEFAULT_MAX_ATTEMPTS,
  BASE_FEE,
} from '../services/feeEngine.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

const VALID_NETWORKS = new Set(['testnet', 'mainnet']);

router.get(
  '/stats',
  asyncHandler(async (req, res) => {
    const network = VALID_NETWORKS.has(req.query.network)
      ? req.query.network
      : 'testnet';
    const stats = await fetchFeeStats(network);
    return res.json({
      success: true,
      data: {
        network,
        fee_charged: stats.fee_charged,
        max_fee: stats.max_fee,
        ledger_capacity_usage: stats.ledger_capacity_usage,
        last_ledger: stats.last_ledger,
        last_ledger_base_fee: stats.last_ledger_base_fee,
      },
    });
  })
);

router.post(
  '/estimate',
  asyncHandler(async (req, res) => {
    const network = VALID_NETWORKS.has(req.body?.network)
      ? req.body.network
      : 'testnet';
    const attempt = Math.max(1, parseInt(req.body?.attempt ?? 1, 10));
    const escalationFactor = parseFloat(
      req.body?.escalationFactor ?? DEFAULT_ESCALATION_FACTOR
    );
    const maxFee = parseInt(req.body?.maxFee ?? DEFAULT_MAX_FEE, 10);

    if (!Number.isFinite(escalationFactor) || escalationFactor < 1) {
      return res.status(400).json({
        success: false,
        message: 'escalationFactor must be a number >= 1',
      });
    }
    if (!Number.isInteger(maxFee) || maxFee < BASE_FEE) {
      return res.status(400).json({
        success: false,
        message: `maxFee must be an integer >= ${BASE_FEE} (stroops)`,
      });
    }

    const stats = await fetchFeeStats(network);
    const fee = calculateFee(stats, attempt, { escalationFactor, maxFee });

    return res.json({
      success: true,
      data: {
        network,
        attempt,
        fee,
        escalationFactor,
        maxFee,
        maxAttempts: DEFAULT_MAX_ATTEMPTS,
        baseFee: BASE_FEE,
        p90BasedOn: stats.fee_charged?.p90,
      },
    });
  })
);

export default router;
