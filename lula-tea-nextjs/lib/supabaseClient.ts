import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client with service role key (bypasses RLS)
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : supabase; // Fallback to regular client if no service key

// Auth helpers
export async function signInWithMagicLink(email: string) {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/account`,
    },
  });
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
}

// Order helpers
export async function createOrder(order: {
  user_id: string;
  items: Array<{ id: string; name: string; quantity: number; price: number }>;
  subtotal: number;
  status: string;
}) {
  const { data, error } = await supabase
    .from("orders")
    .insert([order])
    .select();
  return { data, error };
}

export async function getOrders(userId: string) {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return { data, error };
}
