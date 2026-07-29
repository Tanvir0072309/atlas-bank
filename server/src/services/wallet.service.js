import walletRepository from "../repositories/wallet.repository.js";
import { generateWalletNumber } from "../helpers/walletNumber.helper.js";
import { generateUpiId } from "../helpers/upiId.helper.js";

class WalletService {
    async createWallet(user) {
        const userId = user?._id || user?.id;

        if (!user || !userId) {
            throw new Error("Authenticated user not found.");
        }

        const existingWallet = await walletRepository.findWalletByUserId(
            userId
        );

        if (existingWallet) {
            throw new Error("Wallet already exists.");
        }

        const walletNumber = await generateWalletNumber();
        const upiId = await generateUpiId(user.email);

        const wallet = await walletRepository.createWallet({
            user: userId,
            walletNumber,
            upiId,
        });

        return wallet;
    }

    async getMyWallet(user) {
        const userId = user?._id || user?.id || user;

        if (!userId) {
            throw new Error("Authenticated user not found.");
        }

        const wallet = await walletRepository.findWalletByUserId(userId);

        if (!wallet) {
            throw new Error("Wallet not found.");
        }

        return wallet;
    }

    async getWalletQr(user) {
        const wallet = await this.getMyWallet(user);

        return {
            upiId: wallet.upiId,
            walletNumber: wallet.walletNumber,
            payload: `upi://pay?pa=${wallet.upiId}&cu=${wallet.currency}`,
        };
    }

    async deleteWallet(walletId) {
        return await walletRepository.softDeleteWallet(walletId);
    }

    async updateWalletStatus(walletId, status) {
        return await walletRepository.updateWallet(walletId, {
            status,
        });
    }
}

export default new WalletService();