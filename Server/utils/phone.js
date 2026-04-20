const DEFAULT_PHONE_LENGTH = 10;
const DEFAULT_COUNTRY_CODE = (process.env.OTP_PHONE_COUNTRY_CODE || "91").replace(/\D/g, "");

const digitsOnly = (value = "") => String(value || "").replace(/\D/g, "");

const normalizePhone = (value = "") => {
  const digits = digitsOnly(value);

  if (!digits) return "";

  if (digits.length === DEFAULT_PHONE_LENGTH) {
    return digits;
  }

  if (
    DEFAULT_COUNTRY_CODE &&
    digits.length === DEFAULT_COUNTRY_CODE.length + DEFAULT_PHONE_LENGTH &&
    digits.startsWith(DEFAULT_COUNTRY_CODE)
  ) {
    return digits.slice(-DEFAULT_PHONE_LENGTH);
  }

  return digits.slice(-DEFAULT_PHONE_LENGTH);
};

const isValidPhone = (value = "") => /^\d{10}$/.test(normalizePhone(value));

const formatPhoneForSms = (value = "") => {
  const normalizedPhone = normalizePhone(value);
  if (!normalizedPhone) return "";
  return `+${DEFAULT_COUNTRY_CODE}${normalizedPhone}`;
};

module.exports = {
  digitsOnly,
  normalizePhone,
  isValidPhone,
  formatPhoneForSms,
};
