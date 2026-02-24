import { NextRequest } from "next/server";
import { createClient } from "@/shared/lib/supabase/server";
import { createAdminClient } from "@/shared/lib/supabase/admin";

export async function GET(_request: NextRequest) {
  try {
    // Authenticate the user via session cookies
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use admin client to bypass RLS — safe because we've already authenticated above
    // and we explicitly filter by the authenticated user's data
    const admin = createAdminClient();

    // Try to get the user's organization_id
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: userData } = await (admin as any)
      .from("users")
      .select("organization_id")
      .eq("id", user.id)
      .single();

    const organizationId = userData?.organization_id ?? null;

    // Fetch risks — filter by org if available, otherwise by owner_id
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (admin as any)
      .from("risks")
      .select(
        "id, risk_id, title, inherent_likelihood, inherent_impact, inherent_score, status, owner_id, created_at, updated_at"
      )
      .order("inherent_score", { ascending: false });

    if (organizationId) {
      query = query.eq("organization_id", organizationId);
    } else {
      // Fallback: show risks owned by this user (no org set up yet)
      query = query.eq("owner_id", user.id);
    }

    const { data: risks, error } = await query;

    if (error) {
      console.error("Risks fetch error:", error);
      return Response.json({ risks: [], error: error.message });
    }

    return Response.json({ risks: risks || [] });
  } catch (err) {
    console.error("GET /api/risks error:", err);
    return Response.json({ risks: [], error: "Failed to fetch risks" }, { status: 500 });
  }
}
