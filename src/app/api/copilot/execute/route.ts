import { NextRequest } from "next/server";
import { createClient } from "@/shared/lib/supabase/server";
import { createAdminClient } from "@/shared/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const { toolCallId, name, input } = await request.json();

    // Authenticate via session cookies
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use admin client to bypass RLS for writes — safe because we authenticated above
    const admin = createAdminClient();

    // Get the user's organization_id
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: userData } = await (admin as any)
      .from("users")
      .select("organization_id")
      .eq("id", user.id)
      .single();

    let organizationId: string | null = userData?.organization_id ?? null;

    // Auto-provision an organization + user record for new users (no org yet)
    if (!organizationId) {
      const orgSlug = `org-${user.id.slice(0, 8)}`;
      const orgName = user.email?.split("@")[0] ?? "My Organization";

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: newOrg } = await (admin as any)
        .from("organizations")
        .insert({ name: orgName, slug: orgSlug, subscription_tier: "starter" })
        .select("id")
        .single();

      if (newOrg?.id) {
        organizationId = newOrg.id as string;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (admin as any)
          .from("users")
          .upsert({
            id: user.id,
            organization_id: organizationId,
            email: user.email,
            full_name: user.user_metadata?.full_name ?? user.email,
            role: "admin",
          });
      }
    }

    switch (name) {
      case "create_risk": {
        const likelihood = Number(input.inherent_likelihood) || 3;
        const impact = Number(input.inherent_impact) || 3;
        const riskId = `RISK-${Date.now().toString(36).toUpperCase()}`;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (admin as any)
          .from("risks")
          .insert({
            organization_id: organizationId,
            risk_id: riskId,
            title: input.title || "Untitled Risk",
            description: input.description || "",
            inherent_likelihood: likelihood,
            inherent_impact: impact,
            // inherent_score is a generated column (likelihood * impact) — do not insert
            risk_response: input.risk_response || "mitigate",
            status: "identified",
            owner_id: user.id,
          })
          .select()
          .single();

        if (error) {
          console.error("Create risk DB error:", JSON.stringify(error));
          return Response.json(
            { error: "Failed to create risk", detail: error.message },
            { status: 500 }
          );
        }

        return Response.json({ success: true, result: data, toolCallId });
      }

      case "create_control": {
        const controlCode =
          String(input.code || "").trim() ||
          `CTRL-${Date.now().toString(36).toUpperCase()}`;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (admin as any)
          .from("control_library")
          .insert({
            organization_id: organizationId,
            code: controlCode,
            title: input.title || "Untitled Control",
            description: input.description || "",
            control_type: input.control_type || "technical",
            automation_level: input.automation_level || "manual",
            effectiveness_rating: Number(input.effectiveness_rating) || 3,
            status: "draft",
            metadata: { frameworks: Array.isArray(input.frameworks) ? input.frameworks : [] },
            owner_id: user.id,
          })
          .select()
          .single();

        if (error) {
          console.error("Create control DB error:", JSON.stringify(error));
          return Response.json(
            { error: "Failed to create control", detail: error.message },
            { status: 500 }
          );
        }

        return Response.json({ success: true, result: data, toolCallId });
      }

      case "update_requirement_status": {
        // Store per-org requirement status overrides in organizations.settings
        const key = `${input.framework_code}::${input.requirement_code}`;
        const newStatus = input.status as string;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: orgData } = await (admin as any)
          .from("organizations")
          .select("settings")
          .eq("id", organizationId)
          .single();

        const currentSettings = orgData?.settings || {};
        const currentStatuses = currentSettings.requirement_statuses || {};
        const newSettings = {
          ...currentSettings,
          requirement_statuses: { ...currentStatuses, [key]: newStatus },
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (admin as any)
          .from("organizations")
          .update({ settings: newSettings })
          .eq("id", organizationId);

        if (error) {
          return Response.json(
            { error: "Failed to update requirement status", detail: error.message },
            { status: 500 }
          );
        }

        return Response.json({ success: true, toolCallId });
      }

      case "create_requirement": {
        // Add a requirement to a custom framework stored in organizations.settings
        const frameworkCode = String(input.framework_code || "").toUpperCase().replace(/[^A-Z0-9_]/g, "_");
        const domainName = String(input.domain || "General").trim();
        const reqCode =
          String(input.code || "").trim() ||
          `REQ-${Date.now().toString(36).toUpperCase()}`;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: orgDataReq } = await (admin as any)
          .from("organizations")
          .select("settings")
          .eq("id", organizationId)
          .single();

        const currentSettingsReq = orgDataReq?.settings || {};
        const customReqs = currentSettingsReq.custom_framework_requirements || {};
        const fwReqs = customReqs[frameworkCode] || {};
        const domainReqs: object[] = fwReqs[domainName] || [];

        const newReq = {
          id: reqCode.toLowerCase().replace(/[^a-z0-9]/g, "-"),
          code: reqCode,
          title: String(input.title || "Untitled Requirement").trim(),
          domain: domainName,
          controls: [],
          evidence: 0,
          evidenceRequired: Number(input.evidence_required) || 1,
        };

        const updatedSettingsReq = {
          ...currentSettingsReq,
          custom_framework_requirements: {
            ...customReqs,
            [frameworkCode]: {
              ...fwReqs,
              [domainName]: [...domainReqs, newReq],
            },
          },
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: reqError } = await (admin as any)
          .from("organizations")
          .update({ settings: updatedSettingsReq })
          .eq("id", organizationId);

        if (reqError) {
          return Response.json(
            { error: "Failed to create requirement", detail: reqError.message },
            { status: 500 }
          );
        }

        return Response.json({ success: true, result: newReq, toolCallId });
      }

      case "create_framework": {
        const frameworkCode = String(input.code || "").toUpperCase().replace(/[^A-Z0-9_]/g, "_");

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (admin as any)
          .from("compliance_frameworks")
          .insert({
            code: frameworkCode,
            name: input.name || "Unnamed Framework",
            version: input.version || "1.0",
            description: input.description || "",
            structure: {},
            is_active: true,
          })
          .select()
          .single();

        if (error) {
          console.error("Create framework DB error:", JSON.stringify(error));
          return Response.json(
            { error: "Failed to create framework", detail: error.message },
            { status: 500 }
          );
        }

        return Response.json({ success: true, result: data, toolCallId });
      }

      default:
        return Response.json({ error: `Unknown action: ${name}` }, { status: 400 });
    }
  } catch (err) {
    console.error("Execute error:", err);
    return Response.json({ error: "Execution failed" }, { status: 500 });
  }
}
