import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/shared/lib/supabase/server";

/**
 * Auth callback handler for Supabase.
 *
 * This route handles:
 * 1. OAuth provider redirects (Google, GitHub, Azure)
 * 2. Email confirmation links
 * 3. Password reset links
 *
 * Supabase sends an authorization code which we exchange for a session.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Successful auth - redirect to the intended destination
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        // In development, redirect directly
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        // In production behind a proxy, use the forwarded host
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // Auth code exchange failed - redirect to login with error
  return NextResponse.redirect(
    `${origin}/login?message=auth-code-error`
  );
}
