import { z } from "zod";

/**
 * Validation schemas for authentication and customer management
 */

// Email validation
const emailSchema = z.string().email("Invalid email address");

// Phone validation for Saudi numbers
const phoneSchema = z
  .string()
  .regex(/^\+966[0-9]{9}$/, "Invalid Saudi phone number. Must be +966XXXXXXXXX");

// Password validation
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

// Signup validation - must have either email or phone
export const signupSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters").max(255),
    email: emailSchema.optional(),
    phone: phoneSchema.optional(),
    password: passwordSchema,
  })
  .refine(
    (data) => data.email || data.phone,
    "Either email or phone number is required"
  );

// Login validation
export const loginSchema = z.object({
  identifier: z.string().min(1, "Email or phone is required"),
  password: z.string().min(1, "Password is required"),
});

// Email verification
export const verifyEmailSchema = z.object({
  token: z.string().uuid("Invalid verification token"),
});

// Forgot password
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

// Reset password
export const resetPasswordSchema = z.object({
  token: z.string().uuid("Invalid reset token"),
  password: passwordSchema,
});

// Update profile
export const updateProfileSchema = z.object({
  name: z.string().min(2).max(255).optional(),
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),
});

// Change password
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: passwordSchema,
});

// Address validation
export const addressSchema = z.object({
  addressType: z.enum(["home", "work", "other"]).default("home"),
  fullAddress: z.string().min(10, "Address must be at least 10 characters"),
  gpsCoordinates: z.string().optional(),
  city: z.string().optional(),
  isDefault: z.boolean().default(false),
});

// Update address
export const updateAddressSchema = addressSchema.partial();

// Order update validation
export const updateOrderSchema = z.object({
  deliveryAddress: z.string().min(10).optional(),
  deliveryNotes: z.string().max(500).optional(),
  deliveryTime: z.string().optional(),
});

// Order cancellation
export const cancelOrderSchema = z.object({
  reason: z.string().min(5, "Cancellation reason must be at least 5 characters").max(500),
});

// Helper function to validate data against a schema
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: z.ZodError;
} {
  try {
    const validData = schema.parse(data);
    return { success: true, data: validData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error };
    }
    throw error;
  }
}

// Format Zod errors for API responses
export function formatZodErrors(errors: z.ZodError): Record<string, string> {
  const formatted: Record<string, string> = {};
  errors.errors.forEach((error) => {
    const path = error.path.join(".");
    formatted[path] = error.message;
  });
  return formatted;
}
