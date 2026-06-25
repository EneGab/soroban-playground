// Copyright (c) 2026 StellarDevTools
// SPDX-License-Identifier: MIT

import express from 'express';
import featureFlagService from '../services/featureFlagService.js';
import { asyncHandler, createHttpError } from '../middleware/errorHandler.js';

const router = express.Router();

const FLAG_KEY_RE = /^[a-z0-9_.-]{1,64}$/;

function validateFlagKey(key) {
  return typeof key === 'string' && FLAG_KEY_RE.test(key);
}

// GET /api/feature-flags — list all flags
router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const flags = await featureFlagService.listFlags();
    res.json({ success: true, data: flags });
  })
);

// POST /api/feature-flags — create flag
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const {
      key,
      enabled = 0,
      rollout_pct = 0,
      description = '',
    } = req.body ?? {};

    if (!validateFlagKey(key)) {
      throw createHttpError(
        400,
        'key must be 1–64 lowercase alphanumeric characters, underscores, hyphens, or dots'
      );
    }
    if (
      typeof rollout_pct !== 'number' ||
      rollout_pct < 0 ||
      rollout_pct > 100
    ) {
      throw createHttpError(
        400,
        'rollout_pct must be a number between 0 and 100'
      );
    }

    const flag = await featureFlagService.createFlag({
      key,
      enabled,
      rollout_pct,
      description,
    });
    res.status(201).json({ success: true, data: flag });
  })
);

// GET /api/feature-flags/:key — get single flag
router.get(
  '/:key',
  asyncHandler(async (req, res) => {
    const flag = await featureFlagService.getFlag(req.params.key);
    if (!flag)
      throw createHttpError(404, `Feature flag '${req.params.key}' not found`);
    res.json({ success: true, data: flag });
  })
);

// PATCH /api/feature-flags/:key — update flag
router.patch(
  '/:key',
  asyncHandler(async (req, res) => {
    const { enabled, rollout_pct, description } = req.body ?? {};

    if (rollout_pct !== undefined) {
      if (
        typeof rollout_pct !== 'number' ||
        rollout_pct < 0 ||
        rollout_pct > 100
      ) {
        throw createHttpError(
          400,
          'rollout_pct must be a number between 0 and 100'
        );
      }
    }

    const flag = await featureFlagService.updateFlag(req.params.key, {
      enabled,
      rollout_pct,
      description,
    });
    if (!flag)
      throw createHttpError(404, `Feature flag '${req.params.key}' not found`);
    res.json({ success: true, data: flag });
  })
);

// DELETE /api/feature-flags/:key — delete flag
router.delete(
  '/:key',
  asyncHandler(async (req, res) => {
    const deleted = await featureFlagService.deleteFlag(req.params.key);
    if (!deleted)
      throw createHttpError(404, `Feature flag '${req.params.key}' not found`);
    res.json({ success: true, message: `Flag '${req.params.key}' deleted` });
  })
);

// POST /api/feature-flags/:key/evaluate — evaluate flag for a user/cohort
router.post(
  '/:key/evaluate',
  asyncHandler(async (req, res) => {
    const { userId, cohortId } = req.body ?? {};
    const enabled = await featureFlagService.evaluate(req.params.key, {
      userId,
      cohortId,
    });
    res.json({ success: true, data: { flag: req.params.key, enabled } });
  })
);

// GET /api/feature-flags/:key/cohorts — list cohort overrides
router.get(
  '/:key/cohorts',
  asyncHandler(async (req, res) => {
    const cohorts = await featureFlagService.listCohorts(req.params.key);
    res.json({ success: true, data: cohorts });
  })
);

// POST /api/feature-flags/:key/cohorts — add/update cohort override
router.post(
  '/:key/cohorts',
  asyncHandler(async (req, res) => {
    const { cohortId, enabled = 1 } = req.body ?? {};
    if (!cohortId || typeof cohortId !== 'string') {
      throw createHttpError(400, 'cohortId is required');
    }
    await featureFlagService.addCohort(req.params.key, cohortId, enabled);
    res.status(201).json({
      success: true,
      data: { flag: req.params.key, cohortId, enabled: !!enabled },
    });
  })
);

// DELETE /api/feature-flags/:key/cohorts/:cohortId — remove cohort override
router.delete(
  '/:key/cohorts/:cohortId',
  asyncHandler(async (req, res) => {
    const deleted = await featureFlagService.removeCohort(
      req.params.key,
      req.params.cohortId
    );
    if (!deleted) {
      throw createHttpError(
        404,
        `Cohort '${req.params.cohortId}' not found for flag '${req.params.key}'`
      );
    }
    res.json({ success: true, message: 'Cohort override removed' });
  })
);

export default router;
