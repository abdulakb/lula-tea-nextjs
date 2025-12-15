import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

const SALT_ROUNDS = 10;

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate a random verification token
 */
export function generateToken(): string {
  return uuidv4();
}

/**
 * Generate token expiry time (24 hours from now)
 */
export function generateTokenExpiry(): Date {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + 24);
  return expiry;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate Saudi phone number format (+966)
 */
export function isValidSaudiPhone(phone: string): boolean {
  // Remove spaces and dashes
  const cleanPhone = phone.replace(/[\s-]/g, "");
  // Check if it matches Saudi format: +966XXXXXXXXX (9 digits after +966)
  const phoneRegex = /^\+966[0-9]{9}$/;
  return phoneRegex.test(cleanPhone);
}

/**
 * Format phone number to standard format
 */
export function formatPhoneNumber(phone: string): string {
  // Remove spaces and dashes
  let cleanPhone = phone.replace(/[\s-]/g, "");
  
  // Add +966 prefix if not present
  if (!cleanPhone.startsWith("+966")) {
    if (cleanPhone.startsWith("966")) {
      cleanPhone = "+" + cleanPhone;
    } else if (cleanPhone.startsWith("0")) {
      cleanPhone = "+966" + cleanPhone.substring(1);
    } else {
      cleanPhone = "+966" + cleanPhone;
    }
  }
  
  return cleanPhone;
}

/**
 * Validate password strength
 * Must be at least 8 characters, contain uppercase, lowercase, and number
 */
export function isValidPassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, "") // Remove < and >
    .trim();
}
