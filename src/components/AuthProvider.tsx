import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { canManageAssignments } from "@/lib/admin-policy";

const AuthContext = createContext<{ user: User | null; isAdmin: boolean; loading: boolean }>({ user: null, isAdmin: false, loading: true });
export const useAppAuth = () => useContext(AuthContext);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState({ user: null as User | null, isAdmin: false, loading: true });
  const qc = useQueryClient();
  const router = useRouter();
  useEffect(() => {
    let active = true;
    let revision = 0;
    async function refresh(attempt = 0): Promise<void> {
      const current = ++revision;
      // Session restore after reload can lag; fall back to the stored session and retry transient failures.
      const { data: { session } } = await supabase.auth.getSession();
      const { data: userData, error: userError } = await supabase.auth.getUser();
      const user = userData.user ?? (userError ? session?.user ?? null : null);
      let roles: { role: string }[] = [];
      let failed = false;
      if (user) {
        const res = await supabase.from("user_roles").select("role").eq("user_id", user.id);
        if (res.error) failed = true; else roles = res.data ?? [];
      }
      if (!active || current !== revision) return;
      if (failed || (userError && session)) {
        if (attempt < 4) { setTimeout(() => { if (active) void refresh(attempt + 1); }, 800 * (attempt + 1)); }
        if (failed) return; // keep previous role state instead of hiding admin buttons
      }
      setState({ user, isAdmin: canManageAssignments(roles.map(r => r.role)), loading: false });
    }
    void refresh();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(event => {
      if (!["SIGNED_IN", "SIGNED_OUT", "USER_UPDATED"].includes(event)) return;
      if (event === "SIGNED_OUT") setState({ user: null, isAdmin: false, loading: false });
      void router.invalidate();
      if (event !== "SIGNED_OUT") void qc.invalidateQueries();
      setTimeout(() => { if (active) void refresh(); }, 0);
    });
    const refetchOnFocus = () => { if (document.visibilityState === "visible") void refresh(); };
    document.addEventListener("visibilitychange", refetchOnFocus);
    window.addEventListener("focus", refetchOnFocus);
    return () => {
      active = false;
      subscription.unsubscribe();
      document.removeEventListener("visibilitychange", refetchOnFocus);
      window.removeEventListener("focus", refetchOnFocus);
    };
  }, [qc, router]);
  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}