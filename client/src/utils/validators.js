export const isValidEmail = (value = "") =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export const isValidPhone = (value = "") =>
  /^[0-9]{10}$/.test(value.replace(/\D/g, ""));

// Bank-grade password rule: 8+ chars, upper, lower, number, symbol
export const getPasswordStrength = (value = "") => {
  const checks = {
    length: value.length >= 8,
    upper: /[A-Z]/.test(value),
    lower: /[a-z]/.test(value),
    number: /[0-9]/.test(value),
    symbol: /[^A-Za-z0-9]/.test(value),
  };
  const score = Object.values(checks).filter(Boolean).length;
  return { checks, score }; // score 0-5
};

export const isValidPassword = (value = "") => getPasswordStrength(value).score >= 4;

export const validateRegisterForm = ({ fullName, email, phone, password, confirmPassword }) => {
  const errors = {};
  if (!fullName || fullName.trim().length < 3) errors.fullName = "Enter your full legal name.";
  if (!isValidEmail(email)) errors.email = "Enter a valid email address.";
  if (!isValidPhone(phone)) errors.phone = "Enter a valid 10-digit phone number.";
  if (!isValidPassword(password))
    errors.password = "Password needs 8+ characters, upper & lower case, a number and a symbol.";
  if (password !== confirmPassword) errors.confirmPassword = "Passwords don't match.";
  return errors;
};

export const validateLoginForm = ({ email, password }) => {
  const errors = {};
  if (!isValidEmail(email)) errors.email = "Enter a valid email address.";
  if (!password) errors.password = "Enter your password.";
  return errors;
};
