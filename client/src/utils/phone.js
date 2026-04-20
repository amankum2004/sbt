export const digitsOnly = (value = "") => String(value || "").replace(/\D/g, "");

export const normalizePhone = (value = "") => {
  const digits = digitsOnly(value);

  if (!digits) return "";
  if (digits.length <= 10) return digits;

  return digits.slice(-10);
};

export const isValidPhone = (value = "") => /^\d{10}$/.test(normalizePhone(value));
