import Account from "../models/account.model.js";
import { encrypt } from "../helpers/encryption.helper.js";

/**
 * =====================================================
 * Create Account
 * =====================================================
 */
export const createAccount = async (userId, accountData) => {
    const encryptedAccountNumber = encrypt(accountData.accountNumber);

    const account = await Account.create({
        user: userId,
        accountHolderName: accountData.accountHolderName,
        accountNumber: encryptedAccountNumber,
        ifscCode: accountData.ifscCode,
        bankName: accountData.bankName,
        branchName: accountData.branchName,
        accountType: accountData.accountType,
    });

    return account;
};

/**
 * =====================================================
 * Get All Accounts Of Current User
 * =====================================================
 */
export const getAccounts = async (userId) => {
    return await Account.find({
        user: userId,
        deletedAt: null,
    }).sort({
        isPrimary: -1,
        createdAt: -1,
    });
};

/**
 * =====================================================
 * Get Single Account
 * =====================================================
 */
export const getAccountById = async (userId, accountId) => {
    return await Account.findOne({
        _id: accountId,
        user: userId,
        deletedAt: null,
    });
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
    return await Account.findOneAndUpdate(
        {
            _id: accountId,
            user: userId,
            deletedAt: null,
        },
        updateData,
        {
            new: true,
            runValidators: true,
        }
    );
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
    await Account.updateMany(
        {
            user: userId,
        },
        {
            isPrimary: false,
        }
    );

    return await Account.findOneAndUpdate(
        {
            _id: accountId,
            user: userId,
            deletedAt: null,
        },
        {
            isPrimary: true,
        },
        {
            new: true,
        }
    );
};

/**
 * =====================================================
 * Soft Delete
 * =====================================================
 */
export const deleteAccount = async (
    userId,
    accountId
) => {
    return await Account.findOneAndUpdate(
        {
            _id: accountId,
            user: userId,
            deletedAt: null,
        },
        {
            deletedAt: new Date(),
        },
        {
            new: true,
        }
    );
};