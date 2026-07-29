// Central mock data for the customer dashboard.
// Replace these with real API calls once your backend endpoints are ready —
// every page only reads from here, so swapping to `fetch`/React Query later
// means touching this file, not the pages.

// Maps 1:1 to the user document shape returned by the backend
// (id, fullName, email, phone, isEmailVerified, isPhoneVerified, status, lastLogin, createdAt).
export const CUSTOMER = {
  id: "6a68a4271477f4c9d6c58973",
  name: "Tanvir Khan",
  email: "mrtanvir0072@gmail.com",
  mobile: "+91 98765 43220",
  isEmailVerified: true,
  isPhoneVerified: false,
  role: "customer",
  status: "active",
  lastLogin: "2026-07-28T13:09:00.015Z",
  memberSince: "2026-07-28T12:44:23.455Z",
  photo: null, // fallback to initials avatar if null
  kyc: "Verified",
  twoFactorEnabled: false,
};

// Wallet — the primary balance shown across the dashboard.
export const WALLET = {
  id: "6a6962c612040208bbb00cec",
  balance: 1000,
  currency: "INR",
};

// Linked bank account(s) — shown as "cards" on the Cards page, and used as the
// source when moving money from a bank account into the wallet.
export const BANK_ACCOUNTS = [
  {
    id: "bank_1",
    accountHolderName: "Tanvir Khan",
    accountNumber: "456789012345",
    ifscCode: "UTIB0007890",
    bankName: "Axis Bank",
    branchName: "Vadodara",
    accountType: "savings",
    isPrimary: true,
  },
];

// The user's own receivable UPI handle, used for the "Transfer Money" flow.
export const MY_UPI_ID = "mrtanvir0072663544@atlas";

// Wallet ledger — mirrors the backend transaction schema
// (transactionNumber, sender, receiver, type, amount, currency, status, description, createdAt).
export const WALLET_TRANSACTIONS = [
  { _id: "6a696fd07f48e93c9e44fe11", transactionNumber: "TXN000003", sender: null, receiver: "6a68a8b11477f4c9d6c58979", type: "deposit", amount: 1000, currency: "INR", status: "success", description: "Initial Deposit", createdAt: "2026-07-29T03:13:20.399Z" },
  { _id: "6a696fd07f48e93c9e44fe0a", transactionNumber: "TXN000002", sender: "6a68a8b11477f4c9d6c58979", receiver: "rec_upi_1", type: "transfer", amount: 250, currency: "INR", status: "success", description: "Money Transfer", createdAt: "2026-07-28T18:42:10.000Z" },
  { _id: "6a696fd07f48e93c9e44fe09", transactionNumber: "TXN000001", sender: "bank_1", receiver: "6a68a8b11477f4c9d6c58979", type: "bank_transfer", amount: 2000, currency: "INR", status: "success", description: "Added money from Axis Bank", createdAt: "2026-07-27T09:05:44.000Z" },
];

export const ACCOUNTS = [
  {
    id: "acc_savings",
    type: "Savings Account",
    nickname: "Primary Savings",
    number: "0182 4471 9903",
    masked: "XXXX XXXX 9903",
    ifsc: "ATLS0000182",
    branch: "Satellite, Ahmedabad",
    balance: 284560.75,
    status: "Active",
    isPrimary: true,
  },
  {
    id: "acc_current",
    type: "Current Account",
    nickname: "Business Current",
    number: "0182 5582 1147",
    masked: "XXXX XXXX 1147",
    ifsc: "ATLS0000182",
    branch: "Satellite, Ahmedabad",
    balance: 96230.0,
    status: "Active",
    isPrimary: false,
  },
  {
    id: "acc_salary",
    type: "Salary Account",
    nickname: "Salary Account",
    number: "0182 6693 2285",
    masked: "XXXX XXXX 2285",
    ifsc: "ATLS0000182",
    branch: "Satellite, Ahmedabad",
    balance: 42110.4,
    status: "Dormant",
    isPrimary: false,
  },
];

export const TOTAL_BALANCE = ACCOUNTS.reduce((sum, a) => sum + a.balance, 0);

export const BENEFICIARIES = [
  { id: "ben_1", name: "Rohan Mehta", bank: "HDFC Bank", account: "XXXX 4521", ifsc: "HDFC0001234", verified: true, nickname: "Rohan" },
  { id: "ben_2", name: "Priya Nair", bank: "ICICI Bank", account: "XXXX 8890", ifsc: "ICIC0005678", verified: true, nickname: "Priya (Roomie)" },
  { id: "ben_3", name: "Karan Studios Pvt Ltd", bank: "Axis Bank", account: "XXXX 1123", ifsc: "UTIB0009988", verified: false, nickname: "Karan Studios" },
  { id: "ben_4", name: "Meera Iyer", bank: "State Bank of India", account: "XXXX 7765", ifsc: "SBIN0011223", verified: true, nickname: "Meera" },
];

export const TRANSACTIONS = [
  { id: "txn_1001", date: "2026-07-22T09:14:00", desc: "Rohan Mehta", category: "Transfer", type: "debit", amount: 5000, mode: "IMPS", status: "Success" },
  { id: "txn_1002", date: "2026-07-21T18:40:00", desc: "Salary Credit - Zynovate Pvt Ltd", category: "Salary", type: "credit", amount: 82000, mode: "NEFT", status: "Success" },
  { id: "txn_1003", date: "2026-07-21T11:02:00", desc: "Swiggy Order", category: "Food & Dining", type: "debit", amount: 640, mode: "UPI", status: "Success" },
  { id: "txn_1004", date: "2026-07-20T20:15:00", desc: "Electricity Bill - Torrent Power", category: "Utilities", type: "debit", amount: 2140, mode: "Auto-Debit", status: "Success" },
  { id: "txn_1005", date: "2026-07-19T08:30:00", desc: "Priya Nair", category: "Transfer", type: "credit", amount: 3200, mode: "UPI", status: "Success" },
  { id: "txn_1006", date: "2026-07-18T14:55:00", desc: "Amazon Shopping", category: "Shopping", type: "debit", amount: 4599, mode: "Card", status: "Success" },
  { id: "txn_1007", date: "2026-07-17T07:10:00", desc: "Mutual Fund SIP - Axis Bluechip", category: "Investment", type: "debit", amount: 10000, mode: "Auto-Debit", status: "Success" },
  { id: "txn_1008", date: "2026-07-16T19:45:00", desc: "Karan Studios Pvt Ltd", category: "Transfer", type: "debit", amount: 15000, mode: "NEFT", status: "Pending" },
  { id: "txn_1009", date: "2026-07-15T12:20:00", desc: "Cashback - Atlas Rewards", category: "Rewards", type: "credit", amount: 150, mode: "System", status: "Success" },
  { id: "txn_1010", date: "2026-07-14T21:05:00", desc: "Zomato Order", category: "Food & Dining", type: "debit", amount: 480, mode: "UPI", status: "Success" },
  { id: "txn_1011", date: "2026-07-13T10:00:00", desc: "ATM Withdrawal - Satellite Branch", category: "Cash", type: "debit", amount: 5000, mode: "ATM", status: "Success" },
  { id: "txn_1012", date: "2026-07-11T16:30:00", desc: "Meera Iyer", category: "Transfer", type: "credit", amount: 2000, mode: "UPI", status: "Failed" },
];

export const NOTIFICATIONS = [
  { id: "ntf_1", type: "security", title: "New login detected", message: "A login was recorded from a Windows device in Ahmedabad, IN.", time: "2026-07-22T09:00:00", read: false },
  { id: "ntf_2", type: "transfer", title: "Money sent", message: "₹5,000 sent to Rohan Mehta via IMPS.", time: "2026-07-22T09:14:00", read: false },
  { id: "ntf_3", type: "transfer", title: "Salary credited", message: "₹82,000 credited from Zynovate Pvt Ltd.", time: "2026-07-21T18:40:00", read: true },
  { id: "ntf_4", type: "security", title: "Password changed", message: "Your account password was changed successfully.", time: "2026-07-18T13:00:00", read: true },
  { id: "ntf_5", type: "system", title: "Scheduled maintenance", message: "Atlas Bank net banking will be briefly unavailable on 27 Jul, 2:00–3:00 AM.", time: "2026-07-17T10:00:00", read: true },
  { id: "ntf_6", type: "security", title: "New device linked", message: "An iPhone 15 was linked to two-factor authentication.", time: "2026-07-10T08:20:00", read: true },
];

export const MONTHLY_SPENDING = [
  { month: "Feb", amount: 38400 },
  { month: "Mar", amount: 42100 },
  { month: "Apr", amount: 35900 },
  { month: "May", amount: 47250 },
  { month: "Jun", amount: 40600 },
  { month: "Jul", amount: 44230 },
];

export const INCOME_VS_EXPENSE = [
  { month: "Feb", income: 82000, expense: 38400 },
  { month: "Mar", income: 82000, expense: 42100 },
  { month: "Apr", income: 85000, expense: 35900 },
  { month: "May", income: 85000, expense: 47250 },
  { month: "Jun", income: 85000, expense: 40600 },
  { month: "Jul", income: 87000, expense: 44230 },
];

export const CATEGORY_SPENDING = [
  { name: "Food & Dining", value: 6200, color: "#800A38" },
  { name: "Shopping", value: 8900, color: "#C4185C" },
  { name: "Utilities", value: 4300, color: "#E05A87" },
  { name: "Investment", value: 10000, color: "#F0A8C0" },
  { name: "Transfers", value: 12500, color: "#5C0526" },
  { name: "Other", value: 2330, color: "#F4D3E0" },
];

export const BALANCE_TREND = [
  { month: "Feb", balance: 232000 },
  { month: "Mar", balance: 251000 },
  { month: "Apr", balance: 268500 },
  { month: "May", balance: 259300 },
  { month: "Jun", balance: 279900 },
  { month: "Jul", balance: 284560 },
];

export const formatCurrency = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

export const formatDateTime = (iso) =>
  new Date(iso).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
