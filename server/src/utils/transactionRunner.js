import mongoose from "mongoose";

/**
 * Runs `fn(session)` inside a real multi-document MongoDB transaction.
 *
 * WHY THIS EXISTS:
 * Standalone MongoDB deployments (the default for most local installs and
 * a lot of hobby/dev setups) do not support multi-document transactions at
 * all. As soon as mongoose tries to use a session on a standalone server,
 * it throws immediately with something like:
 *   "Transaction numbers are only allowed on a replica set member or mongos"
 *
 * Previously every deposit/withdraw/transfer wrapped its logic in
 * `session.withTransaction(...)` with no fallback, so on a standalone
 * MongoDB every single money-moving request failed instantly — regardless
 * of wallet/bank balance — which looks exactly like "transfer nahi ho
 * raha, paisa hone ke bavjood bhi".
 *
 * This helper tries the real transaction first (best: atomic, safe under
 * concurrent requests). If — and only if — MongoDB reports that
 * transactions aren't supported on this deployment, it retries the same
 * logic once without a session. Any other error (insufficient balance,
 * account not found, etc.) is a real business error and is thrown as-is,
 * without retrying.
 */
const UNSUPPORTED_TRANSACTION_PATTERNS = [
    "Transaction numbers are only allowed on a replica set member or mongos",
    "This MongoDB deployment does not support retryable writes",
    "Transactions are not supported",
];

const isUnsupportedTransactionError = (error) => {
    const message = String(error?.message || error?.errmsg || "");
    return UNSUPPORTED_TRANSACTION_PATTERNS.some((pattern) => message.includes(pattern));
};

export const runInTransaction = async (fn) => {
    const session = await mongoose.startSession();

    try {
        let result;

        try {
            await session.withTransaction(async () => {
                result = await fn(session);
            });
        } catch (error) {
            if (!isUnsupportedTransactionError(error)) throw error;

            // This MongoDB deployment can't do multi-document transactions —
            // fall back to running the exact same logic without a session.
            // Not atomic across documents, but every write is still valid,
            // and this is what keeps things working on standalone MongoDB.
            result = await fn(null);
        }

        return result;
    } finally {
        session.endSession();
    }
};

export default runInTransaction;
