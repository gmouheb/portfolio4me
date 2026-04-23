import test from "node:test";
import assert from "node:assert/strict";
import { parseResetExpiryMs } from "../config/env.js";
import { parseCookies } from "./cookies.js";
import {
  normalizeEmail,
  normalizeStringArray,
  normalizeUrl,
  validatePasswordStrength,
} from "./validation.js";

test("normalizeEmail lowercases and validates email input", () => {
  assert.equal(normalizeEmail("Admin@Example.com", { required: true }), "admin@example.com");
  assert.throws(() => normalizeEmail("not-an-email", { required: true }), /Invalid email address/);
});

test("validatePasswordStrength enforces minimum length and mixed characters", () => {
  assert.equal(validatePasswordStrength("strongpass123"), "strongpass123");
  assert.throws(() => validatePasswordStrength("short1"), /at least 12 characters/);
  assert.throws(() => validatePasswordStrength("longpasswordonly"), /one letter and one number/);
});

test("normalizeUrl accepts http urls and rejects invalid ones", () => {
  assert.equal(normalizeUrl("https://example.com/path"), "https://example.com/path");
  assert.equal(normalizeUrl("/uploads/example.png"), "/uploads/example.png");
  assert.equal(normalizeUrl(""), "");
  assert.throws(() => normalizeUrl("ftp://example.com"), /Invalid URL/);
});

test("normalizeStringArray trims values and drops empty items", () => {
  assert.deepEqual(normalizeStringArray([" AWS ", "", "Terraform"]), ["AWS", "Terraform"]);
});

test("parseCookies reads cookie values by name", () => {
  assert.deepEqual(parseCookies("foo=bar; admin_session=abc123"), {
    foo: "bar",
    admin_session: "abc123",
  });
});

test("parseResetExpiryMs supports minutes and hours", () => {
  assert.equal(parseResetExpiryMs("15m"), 15 * 60 * 1000);
  assert.equal(parseResetExpiryMs("2h"), 2 * 60 * 60 * 1000);
  assert.throws(() => parseResetExpiryMs("15"), /RESET_TOKEN_EXPIRES/);
});
