const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_PATTERN = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;
const RELATIVE_ASSET_PATTERN = /^\/[A-Za-z0-9/_\-.]+$/;

export function isValidEmail(value) {
  return EMAIL_PATTERN.test(value);
}

export function isValidHttpUrl(value) {
  return URL_PATTERN.test(value);
}

export function normalizeString(value, { maxLength = 5000, required = false } = {}) {
  const normalized = typeof value === "string" ? value.trim() : "";

  if (!normalized) {
    if (required) {
      throw new Error("This field is required");
    }

    return "";
  }

  if (normalized.length > maxLength) {
    throw new Error(`Value must be at most ${maxLength} characters`);
  }

  return normalized;
}

export function normalizeEmail(value, { required = false } = {}) {
  const normalized = normalizeString(value, { maxLength: 320, required }).toLowerCase();

  if (!normalized) {
    return "";
  }

  if (!isValidEmail(normalized)) {
    throw new Error("Invalid email address");
  }

  return normalized;
}

export function normalizeUrl(value) {
  const normalized = normalizeString(value, { maxLength: 2048 });

  if (!normalized) {
    return "";
  }

  if (!isValidHttpUrl(normalized) && !RELATIVE_ASSET_PATTERN.test(normalized)) {
    throw new Error("Invalid URL");
  }

  return normalized;
}

export function normalizeBoolean(value) {
  return Boolean(value);
}

export function normalizeNumber(value, { defaultValue = 0 } = {}) {
  const normalized = Number(value);

  if (!Number.isFinite(normalized)) {
    return defaultValue;
  }

  return normalized;
}

export function normalizeStringArray(value, { maxItems = 50, maxItemLength = 200 } = {}) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => normalizeString(item, { maxLength: maxItemLength }))
    .filter(Boolean)
    .slice(0, maxItems);
}

export function validatePasswordStrength(password) {
  if (typeof password !== "string" || password.length < 12) {
    throw new Error("Password must be at least 12 characters long");
  }

  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    throw new Error("Password must include at least one letter and one number");
  }

  return password;
}
