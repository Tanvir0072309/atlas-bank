import counterRepository from "../repositories/counter.repository.js";

export const generateTransactionNumber = async () => {
    const sequence = await counterRepository.getNextSequence(
        "transaction"
    );

    return `TXN${String(sequence).padStart(6, "0")}`;
};