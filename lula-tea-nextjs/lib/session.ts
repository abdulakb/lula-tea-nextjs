import { getIronSession, IronSession } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
  customerId?: string;
  email?: string;
  phone?: string;
  name?: string;
  isLoggedIn: boolean;
}

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET environment variable is required for session management");
}

const sessionOptions = {
  password: process.env.SESSION_SECRET,
  cookieName: "lula_tea_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
};

/**
 * Get the current session
 */
export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

/**
 * Create a new session for a customer
 */
export async function createSession(customer: {
  id: string;
  email?: string;
  phone?: string;
  name: string;
}): Promise<void> {
  const session = await getSession();
  session.customerId = customer.id;
  session.email = customer.email;
  session.phone = customer.phone;
  session.name = customer.name;
  session.isLoggedIn = true;
  await session.save();
}

/**
 * Destroy the current session (logout)
 */
export async function destroySession(): Promise<void> {
  const session = await getSession();
  session.destroy();
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return session.isLoggedIn === true && !!session.customerId;
}

/**
 * Get the current customer ID from session
 */
export async function getCurrentCustomerId(): Promise<string | null> {
  const session = await getSession();
  return session.customerId || null;
}
