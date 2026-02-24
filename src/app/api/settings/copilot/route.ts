import { NextRequest } from "next/server";
import { createClient } from "@/shared/lib/supabase/server";
import { createAdminClient } from "@/shared/lib/supabase/admin";

export const FREE_LIMIT = 10;

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const admin = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: userData } = await (admin as any)
      .from("users")
      .select("organization_id")
      .eq("id", user.id)
      .single();

    if (!userData?.organization_id) {
      return Response.json({ write_count: 0, has_custom_key: false, limit: FREE_LIMIT });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: org } = await (admin as any)
      .from("organizations")
      .select("settings")
      .eq("id", userData.organization_id)
      .single();

    const settings = org?.settings || {};
    return Response.json({
      write_count: settings.copilot_write_count || 0,
      has_custom_key: Boolean(settings.anthropic_api_key),
      limit: FREE_LIMIT,
    });
  } catch {
    return Response.json({ write_count: 0, has_custom_key: false, limit: FREE_LIMIT });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { api_key } = await request.json();

    const admin = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: userData } = await (admin as any)
      .from("users")
      .select("organization_id")
      .eq("id", user.id)
      .single();

    if (!userData?.organization_id) {
      return Response.json({ error: "No organization found" }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: org } = await (admin as any)
      .from("organizations")
      .select("settings")
      .eq("id", userData.organization_id)
      .single();

    const currentSettings = org?.settings || {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newSettings: Record<string, any> = { ...currentSettings };

    if (api_key && String(api_key).trim()) {
      newSettings.anthropic_api_key = String(api_key).trim();
    } else {
      delete newSettings.anthropic_api_key;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (admin as any)
      .from("organizations")
      .update({ settings: newSettings })
      .eq("id", userData.organization_id);

    if (error) return Response.json({ error: error.message }, { status: 500 });

    return Response.json({ success: true, has_custom_key: Boolean(api_key && String(api_key).trim()) });
  } catch {
    return Response.json({ error: "Failed to save API key" }, { status: 500 });
  }
}
