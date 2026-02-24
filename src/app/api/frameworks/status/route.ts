import { NextRequest } from "next/server";
import { createClient } from "@/shared/lib/supabase/server";
import { createAdminClient } from "@/shared/lib/supabase/admin";

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
      return Response.json({ requirement_statuses: {} });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: org } = await (admin as any)
      .from("organizations")
      .select("settings")
      .eq("id", userData.organization_id)
      .single();

    return Response.json({
      requirement_statuses: org?.settings?.requirement_statuses || {},
    });
  } catch {
    return Response.json({ requirement_statuses: {} });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { key, status } = await request.json();
    if (!key || !status) {
      return Response.json({ error: "key and status are required" }, { status: 400 });
    }

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
    const newSettings = {
      ...currentSettings,
      requirement_statuses: {
        ...(currentSettings.requirement_statuses || {}),
        [key]: status,
      },
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (admin as any)
      .from("organizations")
      .update({ settings: newSettings })
      .eq("id", userData.organization_id);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "Failed to update status" }, { status: 500 });
  }
}
