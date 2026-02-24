import { showError } from "./toast";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_FILE_SIZE_MB = 10;
const ALLOWED_FILE_TYPES = ["application/pdf", "image/jpeg", "image/png"];

/**
 * Runs an array of validation rules.
 * Each rule: { test: boolean, message: string }
 * Shows the first failing toast and returns false.
 * Returns true if all pass.
 */
export const validate = (rules) => {
    for (const rule of rules) {
        if (!rule.test) {
            showError(rule.message);
            return false;
        }
    }
    return true;
};

// ── Reusable rule factories ─────────────────────────────────────────────────

export const required = (value, label) => ({
    test: typeof value === "string" ? value.trim().length > 0 : Boolean(value),
    message: `${label} is required.`,
});

export const minLength = (value, min, label) => ({
    test: typeof value === "string" && value.trim().length >= min,
    message: `${label} must be at least ${min} characters.`,
});

export const maxLength = (value, max, label) => ({
    test: typeof value === "string" && value.trim().length <= max,
    message: `${label} must be at most ${max} characters.`,
});

export const isEmail = (value) => ({
    test: EMAIL_REGEX.test(value),
    message: "Please enter a valid email address.",
});

export const passwordsMatch = (pass, confirm) => ({
    test: pass === confirm,
    message: "Passwords do not match.",
});

export const passwordStrength = (pass) => ({
    test: pass.length >= 8,
    message: "Password must be at least 8 characters.",
});

export const fileRequired = (file) => ({
    test: file !== null && file !== undefined,
    message: "Please select a file to upload.",
});

export const fileType = (file) => ({
    test: file && ALLOWED_FILE_TYPES.includes(file.type),
    message: "Only PDF, JPG, or PNG files are allowed.",
});

export const fileSize = (file, maxMb = MAX_FILE_SIZE_MB) => ({
    test: file && file.size <= maxMb * 1024 * 1024,
    message: `File size must be less than ${maxMb}MB.`,
});
