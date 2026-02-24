import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/shared/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all active frameworks (global, not org-specific)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: frameworks, error } = await (supabase as any)
      .from("compliance_frameworks")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Frameworks fetch error:", error);
      return NextResponse.json(
        { frameworks: [], error: error.message },
        { status: 200 }
      );
    }

    return NextResponse.json({ frameworks: frameworks || [] });
  } catch (error) {
    console.error("Frameworks API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch frameworks" },
      { status: 500 }
    );
  }
}
