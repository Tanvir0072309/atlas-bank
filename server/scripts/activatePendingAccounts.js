import "dotenv/config";
import mongoose from "mongoose";
import Account from "../src/models/account.model.js";

/**
 * One-time fix for bank accounts that were created before the "auto-activate
 * on creation" fix — they are stuck at status "pending" forever since there
 * is no verification workflow that ever flips them to "active".
 *
 * Run once with:  node scripts/activatePendingAccounts.js
 */
const run = async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB.");

    const result = await Account.updateMany(
        { status: "pending" },
        { $set: { status: "active", isVerified: true } }
    );

    console.log(`Updated ${result.modifiedCount} account(s) from "pending" to "active".`);

    await mongoose.disconnect();
    process.exit(0);
};

run().catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
});
