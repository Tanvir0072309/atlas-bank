export const classNames = (...classes) => classes.filter(Boolean).join(" ");

export const formatCurrency = (amount = 0, currency = "INR") =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 2 }).format(
    amount
  );

export const formatDate = (date) =>
  new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(
    new Date(date)
  );

export const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

// Masks account numbers the way real banks do: **** **** 4821
export const maskAccountNumber = (accountNumber = "") => {
  const digits = accountNumber.replace(/\s/g, "");
  const last4 = digits.slice(-4);
  return `**** **** ${last4}`;
};
