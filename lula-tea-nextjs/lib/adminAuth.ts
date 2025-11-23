// Simple password-based admin authentication
// For production, consider using NextAuth.js or Supabase Auth with admin roles

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "lulatea2024";

export function verifyAdminPassword(password: string): boolean {
  return password === ADMIN_PASSWORD;
}

export function isAdminAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  
  const adminToken = localStorage.getItem("admin_token");
  return adminToken === "authenticated";
}

export function setAdminAuthenticated() {
  if (typeof window === "undefined") return;
  localStorage.setItem("admin_token", "authenticated");
}

export function clearAdminAuthentication() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("admin_token");
}
