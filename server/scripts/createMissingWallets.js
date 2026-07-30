import "dotenv/config";
import mongoose from "mongoose";
import User from "../src/models/user.model.js";
import Wallet from "../src/models/wallet.model.js";
import { generateWalletNumber } from "../src/helpers/walletNumber.helper.js";
import { generateUpiId } from "../src/helpers/upiId.helper.js";

/**
 * One-time fix for users who registered BEFORE wallets were auto-created
 * at registration time — those accounts can log in fine but every
 * deposit/withdraw/transfer fails with "Wallet not found" because they
 * simply never got one.
 *
 * Run once with:  node scripts/createMissingWallets.js
 */
const run = async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB.");

    const users = await User.find({ status: { $ne: "deleted" } });

    let created = 0;
    let skipped = 0;

    for (const user of users) {
        const existing = await Wallet.findOne({ user: user._id });
        if (existing) {
            skipped++;
            continue;
        }

        const walletNumber = await generateWalletNumber();
        const upiId = await generateUpiId(user.email);

        await Wallet.create({
            user: user._id,
            walletNumber,
            upiId,
        });

        created++;
        console.log(`Created wallet for ${user.email}`);
    }

    console.log(`Done. Created ${created} wallet(s), skipped ${skipped} user(s) who already had one.`);

    await mongoose.disconnect();
    process.exit(0);
};

run().catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
});
