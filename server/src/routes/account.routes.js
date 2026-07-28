import { Router } from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";

import {
    createAccount,
    getAccounts,
    getAccountById,
    updateAccount,
    deleteAccount,
    setPrimaryAccount,
} from "../controllers/account.controller.js";

import {
    createAccountSchema,
    updateAccountSchema,
    accountIdSchema,
} from "../validators/account.validator.js";

const router = Router();

/**
 * =====================================================
 * All routes require authentication
 * =====================================================
 */

router.use(protect);

/**
 * =====================================================
 * Create Account
 * POST /api/v1/accounts
 * =====================================================
 */
router.post(
    "/",
    validate(createAccountSchema),
    createAccount
);

/**
 * =====================================================
 * Get All Accounts
 * GET /api/v1/accounts
 * =====================================================
 */
router.get("/", getAccounts);

/**
 * =====================================================
 * Get Single Account
 * GET /api/v1/accounts/:accountId
 * =====================================================
 */
router.get(
    "/:accountId",
    validate(accountIdSchema, "params"),
    getAccountById
);

/**
 * =====================================================
 * Update Account
 * PATCH /api/v1/accounts/:accountId
 * =====================================================
 */
router.patch(
    "/:accountId",
    validate(accountIdSchema, "params"),
    validate(updateAccountSchema),
    updateAccount
);

/**
 * =====================================================
 * Set Primary Account
 * PATCH /api/v1/accounts/:accountId/primary
 * =====================================================
 */
router.patch(
    "/:accountId/primary",
    validate(accountIdSchema, "params"),
    setPrimaryAccount
);

/**
 * =====================================================
 * Delete Account
 * DELETE /api/v1/accounts/:accountId
 * =====================================================
 */
router.delete(
    "/:accountId",
    validate(accountIdSchema, "params"),
    deleteAccount
);

export default router;