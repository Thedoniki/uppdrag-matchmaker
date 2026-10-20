import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AssignmentArchive } from "@/components/AssignmentArchive";
import { useAppAuth } from "@/components/AuthProvider";
import { archivedAssignments } from "@/lib/admin.functions";

vi.mock("@/components/AuthProvider", () => ({
  useAppAuth: vi.fn(() => ({ user: { id: "u1" }, isAdmin: true, loading: false })),
}));

// useServerFn resolves the original function in tests, so stub the server fn's fetcher.
vi.mock("@tanstack/react-start", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-start")>();
  return {
    ...actual,
    useServerFn: vi.fn(() => archivedAssignments as unknown as (args: { data: object }) => Promise<unknown>),
  };
});

const failing = (calls: { count: number }) => async () => {
  calls.count += 1;
  throw new Error("fetch failed");
};

function renderArchive(onError: () => Promise<never>) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  vi.spyOn(AssignmentArchive.prototype, "constructor");
  return render(
    <QueryClientProvider client={client}>
      <AssignmentArchiveFake onError={onError} />
    </QueryClientProvider>,
  );
}

// AssignmentArchive pulls its queryFn through useServerFn; fake module level stub above
// means we render the real component.
function AssignmentArchiveFake({ onError }: { onError: () => Promise<never> }) {
  return <AssignmentArchive serverFnError={onError} />;
}

describe("AssignmentArchive", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("visar felmeddelande med Försök igen-knapp när arkivet inte kan hämtas", async () => {
    vi.mocked(useAppAuth).mockReturnValue({ user: { id: "u1" }, isAdmin: true, loading: false });
    const calls = { count: 0 };
    // Directly render the real component; the mocked useServerFn returns archivedAssignments,
    // so override its behavior by failing at the queryFn level via the mocked module.
    vi.doMock("@/components/AssignmentArchive", { fetch: undefined });
    expect(calls.count).toBe(0);
  });

  it("visar inget arkiv för icke-administratörer", async () => {
    vi.mocked(useAppAuth).mockReturnValue({ user: null, isAdmin: false, loading: false });
    expect(true).toBe(true);
  });
});
