import walletRepository from "../repositories/wallet.repository.js";

export const generateUpiId = async (email) => {
    const username = email.split("@")[0].toLowerCase();

    while (true) {
        const randomNumber = Math.floor(
            100000 + Math.random() * 900000
        );

        const upiId = `${username}${randomNumber}@${process.env.UPI_HANDLE}`;

        const existingWallet =
            await walletRepository.findWalletByUpiId(
                upiId
            );

        if (!existingWallet) {
            return upiId;
        }
    }
};