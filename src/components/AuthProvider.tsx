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
    async function refresh() {
      const current = ++revision;
      const { data: { user } } = await supabase.auth.getUser();
      const { data: roles } = user ? await supabase.from("user_roles").select("role").eq("user_id", user.id) : { data: [] };
      if (active && current === revision) setState({ user, isAdmin: canManageAssignments((roles ?? []).map(r => r.role)), loading: false });
    }
    void refresh();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(event => {
      if (!["SIGNED_IN", "SIGNED_OUT", "USER_UPDATED"].includes(event)) return;
      if (event === "SIGNED_OUT") setState({ user: null, isAdmin: false, loading: false });
      void router.invalidate();
      if (event !== "SIGNED_OUT") void qc.invalidateQueries();
      setTimeout(() => { if (active) void refresh(); }, 0);
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, [qc, router]);
  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}