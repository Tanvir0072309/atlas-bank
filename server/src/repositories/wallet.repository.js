import Wallet from "../models/wallet.model.js";

class WalletRepository {
    async createWallet(walletData) {
        return await Wallet.create(walletData);
    }

    async findWalletByUserId(userId) {
        return await Wallet.findOne({
            user: userId,
            deletedAt: null,
        });
    }

    async findWalletByWalletNumber(walletNumber) {
        return await Wallet.findOne({
            walletNumber,
            deletedAt: null,
        });
    }

    async findWalletByUpiId(upiId) {
        return await Wallet.findOne({
            upiId,
            deletedAt: null,
        });
    }

    async updateWallet(filter, updateData) {
        return await Wallet.findOneAndUpdate(
            filter,
            updateData,
            {
                new: true,
                runValidators: true,
            }
        );
    }

    async softDeleteWallet(walletId) {
        return await Wallet.findByIdAndUpdate(
            walletId,
            {
                deletedAt: new Date(),
            },
            {
                new: true,
            }
        );
    }
}

export default new WalletRepository();