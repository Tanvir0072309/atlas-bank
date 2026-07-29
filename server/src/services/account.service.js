import * as accountRepository from "../repositories/account.repository.js";
import { decrypt } from "../helpers/encryption.helper.js";

/**
 * =====================================================
 * Decrypt the stored account number and replace it with
 * a masked version (e.g. "•••• 2345") before sending the
 * account back to the client. The real, decrypted digits
 * never leave the server.
 * =====================================================
 */
const toSafeAccount = (account) => {
    if (!account) return account;

    const plain =
        typeof account.toObject === "function"
            ? account.toObject()
            : { ...account };

    if (plain.accountNumber) {
        try {
            const decrypted = decrypt(plain.accountNumber);
            plain.accountNumber = `•••• ${decrypted.slice(-4)}`;
        } catch {
            delete plain.accountNumber;
        }
    }

    return plain;
};

const toSafeAccounts = (accounts) => accounts.map(toSafeAccount);

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

    return toSafeAccount(account);
};

/**
 * =====================================================
 * Get All Accounts
 * =====================================================
 */
export const getAccounts = async (userId) => {
    const accounts = await accountRepository.getAccounts(userId);
    return toSafeAccounts(accounts);
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

    return toSafeAccount(account);
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

    return toSafeAccount(account);
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

    const updated = await accountRepository.setPrimaryAccount(
        userId,
        accountId
    );

    return toSafeAccount(updated);
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
    const wasPrimary = account.isPrimary;

    const deleted = await accountRepository.deleteAccount(
        userId,
        accountId
    );

    // If the deleted account was primary and other accounts remain,
    // automatically promote the next most recent one to primary so the
    // user is never blocked and always has a clear primary account.
    if (wasPrimary) {
        const remaining = accounts.filter(
            (a) => a._id.toString() !== accountId.toString()
        );

        if (remaining.length > 0) {
            await accountRepository.setPrimaryAccount(
                userId,
                remaining[0]._id
            );
        }
    }

    return deleted;
};