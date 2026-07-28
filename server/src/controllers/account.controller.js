import * as accountService from "../services/account.service.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

/**
 * =====================================================
 * Create Account
 * =====================================================
 */
export const createAccount = asyncHandler(async (req, res) => {
    const account = await accountService.createAccount(
        req.user.id,
        req.body
    );

    return res.status(201).json(
        new ApiResponse(
            201,
            account,
            "Bank account added successfully."
        )
    );
});

/**
 * =====================================================
 * Get All Accounts
 * =====================================================
 */
export const getAccounts = asyncHandler(async (req, res) => {
    const accounts = await accountService.getAccounts(req.user.id);

    return res.status(200).json(
        new ApiResponse(
            200,
            accounts,
            "Bank accounts fetched successfully."
        )
    );
});

/**
 * =====================================================
 * Get Single Account
 * =====================================================
 */
export const getAccountById = asyncHandler(async (req, res) => {
    const account = await accountService.getAccountById(
        req.user.id,
        req.params.accountId
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            account,
            "Bank account fetched successfully."
        )
    );
});

/**
 * =====================================================
 * Update Account
 * =====================================================
 */
export const updateAccount = asyncHandler(async (req, res) => {
    const account = await accountService.updateAccount(
        req.user.id,
        req.params.accountId,
        req.body
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            account,
            "Bank account updated successfully."
        )
    );
});

/**
 * =====================================================
 * Set Primary Account
 * =====================================================
 */
export const setPrimaryAccount = asyncHandler(async (req, res) => {
    const account = await accountService.setPrimaryAccount(
        req.user.id,
        req.params.accountId
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            account,
            "Primary bank account updated successfully."
        )
    );
});

/**
 * =====================================================
 * Delete Account
 * =====================================================
 */
export const deleteAccount = asyncHandler(async (req, res) => {
    await accountService.deleteAccount(
        req.user.id,
        req.params.accountId
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            null,
            "Bank account deleted successfully."
        )
    );
});