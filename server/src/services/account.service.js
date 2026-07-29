import * as accountRepository from "../repositories/account.repository.js";

/**
 * =====================================================
 * Create Bank Account
 * =====================================================
 */
export const createAccount = async (userId, accountData) => {
    // Get all existing accounts
    const accounts = await accountRepository.getAccounts(userId);

    // Check maximum account limit
    if (accounts.length >= 10) {
        throw new Error(
            "You can only add up to 10 bank accounts."
        );
    }

    // First account becomes primary automatically
    const isFirstAccount = accounts.length === 0;

    const account = await accountRepository.createAccount(
        userId,
        accountData
    );

    if (isFirstAccount) {
        await accountRepository.setPrimaryAccount(
            userId,
            account._id
        );

        account.isPrimary = true;
    }

    return account;
};

/**
 * =====================================================
 * Get All Accounts
 * =====================================================
 */
export const getAccounts = async (userId) => {
    return await accountRepository.getAccounts(userId);
};

/**
 * =====================================================
 * Get Single Account
 * =====================================================
 */
export const getAccountById = async (
    userId,
    accountId
) => {
    const account = await accountRepository.getAccountById(
        userId,
        accountId
    );

    if (!account) {
        throw new Error("Bank account not found.");
    }

    return account;
};

/**
 * =====================================================
 * Update Account
 * =====================================================
 */
export const updateAccount = async (
    userId,
    accountId,
    updateData
) => {
    const account = await accountRepository.updateAccount(
        userId,
        accountId,
        updateData
    );

    if (!account) {
        throw new Error("Bank account not found.");
    }

    return account;
};

/**
 * =====================================================
 * Set Primary Account
 * =====================================================
 */
export const setPrimaryAccount = async (
    userId,
    accountId
) => {
    const account = await accountRepository.getAccountById(
        userId,
        accountId
    );

    if (!account) {
        throw new Error("Bank account not found.");
    }

    return await accountRepository.setPrimaryAccount(
        userId,
        accountId
    );
};

/**
 * =====================================================
 * Delete Account
 * =====================================================
 */
export const deleteAccount = async (
    userId,
    accountId
) => {
    const account = await accountRepository.getAccountById(
        userId,
        accountId
    );

    if (!account) {
        throw new Error("Bank account not found.");
    }

    const accounts = await accountRepository.getAccounts(userId);

    // Prevent deleting the only account
    if (accounts.length === 1) {
        throw new Error(
            "At least one bank account is required."
        );
    }

    // Prevent deleting primary account
    if (account.isPrimary) {
        throw new Error(
            "Set another account as primary before deleting this account."
        );
    }

    return await accountRepository.deleteAccount(
        userId,
        accountId
    );
};