import walletService from "../services/wallet.service.js";

class WalletController {

    async createWallet(req, res, next) {
        try {
            const wallet = await walletService.createWallet(req.user);

            return res.status(201).json({
                success: true,
                message: "Wallet created successfully.",
                data: wallet,
            });
        } catch (error) {
            next(error);
        }
    }

    async getMyWallet(req, res, next) {
        try {
            const wallet = await walletService.getMyWallet(req.user._id);

            return res.status(200).json({
                success: true,
                data: wallet,
            });
        } catch (error) {
            next(error);
        }
    }

    async getWalletQr(req, res, next) {
        try {
            const qrCode = await walletService.getWalletQr(req.user._id);

            return res.status(200).json({
                success: true,
                data: qrCode,
            });
        } catch (error) {
            next(error);
        }
    }

    async updateWalletStatus(req, res, next) {
        try {
            const wallet = await walletService.updateWalletStatus(
                req.params.walletId,
                req.body.status
            );

            return res.status(200).json({
                success: true,
                message: "Wallet status updated successfully.",
                data: wallet,
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteWallet(req, res, next) {
        try {
            await walletService.deleteWallet(req.params.walletId);

            return res.status(200).json({
                success: true,
                message: "Wallet deleted successfully.",
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new WalletController();