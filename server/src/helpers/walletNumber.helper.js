import counterRepository from "../repositories/counter.repository.js";

export const generateWalletNumber = async () => {
    const sequence =
        await counterRepository.getNextSequence(
            "wallet"
        );

    return `ATW${String(sequence).padStart(
        6,
        "0"
    )}`;
};