import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const archivedAssignments = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id?: string }) => z.object({ id: z.string().uuid().optional() }).parse(input))
  .handler(async ({ context, data }) => {
    const { data: allowed, error: roleError } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (roleError || !allowed) throw new Error("Åtkomst nekad.");
    let query = context.supabase.from("assignments").select("id,title,organisation_name,archived_at").not("archived_at", "is", null).order("archived_at", { ascending: false });
    if (data.id) query = query.eq("id", data.id);
    const { data: rows, error } = await query;
    if (error) throw new Error("Arkivet kunde inte laddas.");
    return rows ?? [];
  });