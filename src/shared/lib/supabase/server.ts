import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setAll(cookiesToSet: any[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }: { name: string; value: string; options?: unknown }) =>
              cookieStore.set(name, value, options as Parameters<typeof cookieStore.set>[2])
            );
          } catch {
            // Server Component - cookies are read-only
          }
        },
      },
    }
  );
}

export async function getSession() {
  const supabase = await createClient();
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session) {
    return null;
  }

  let userData: { organization_id?: string; role?: string; permissions?: unknown[] } | null = null;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from("users")
      .select("organization_id, role, permissions")
      .eq("id", session.user.id)
      .single();
    userData = data;
  } catch {
    // Table may not exist yet
  }

  return {
    ...session,
    user: {
      ...session.user,
      organizationId: userData?.organization_id,
      role: userData?.role,
      permissions: userData?.permissions || [],
    },
  };
}
