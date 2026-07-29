import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import accountService from "../services/account.service";
import walletService from "../services/wallet.service";
import transactionService from "../services/transaction.service";
import { normalizeTransactions } from "../utils/transactions";

// Central place every dashboard page pulls real, per-user data from —
// nothing here is mock data. Each logged-in user only ever sees rows
// scoped to their own accounts/wallet/transactions because every backend
// route this calls is behind `protect` and filters by req.user.id.
export function useBankingData() {
    const { user } = useAuth();
    const [wallet, setWallet] = useState(null);
    const [accounts, setAccounts] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const refresh = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [walletRes, accountsRes, txRes] = await Promise.allSettled([
                walletService.getMyWallet(),
                accountService.getAccounts(),
                transactionService.getMyTransactions(),
            ]);

            setWallet(walletRes.status === "fulfilled" ? walletRes.value : null);
            setAccounts(accountsRes.status === "fulfilled" ? accountsRes.value : []);
            setTransactions(txRes.status === "fulfilled" ? txRes.value : []);

            if (walletRes.status === "rejected" && accountsRes.status === "rejected") {
                setError("Could not load your account data. Please check your connection and try again.");
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (user) refresh();
    }, [user, refresh]);

    const normalizedTransactions = normalizeTransactions(transactions, user?._id);
    const primaryAccount = accounts.find((a) => a.isPrimary) || accounts[0] || null;

    return {
        user,
        wallet,
        accounts,
        primaryAccount,
        transactions,
        normalizedTransactions,
        loading,
        error,
        refresh,
    };
}

export default useBankingData;