import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AssignmentReviewStatus } from "@/components/AssignmentReviewStatus";
import { AssignmentReviewPanel } from "@/components/AssignmentReviewPanel";
import { useAppAuth } from "@/components/AuthProvider";
import type { Assignment } from "@/lib/assignments";

vi.mock("@/components/AuthProvider", () => ({ useAppAuth: vi.fn() }));

const REVIEWED = "2026-10-20T23:30:00+00:00";
let states: { id: string; reviewed_at: string | null }[] = [{ id: "a1", reviewed_at: null }];
const markCalls: { id: string; confirmed: boolean }[] = [];

// The components resolve their server functions through useServerFn. In tests one controllable
// fetcher answers both: the states query sends an empty payload, the mark action sends a confirmed flag.
const fetchServerFn = async ({ data }: { data: Record<string, unknown> }) => {
  if ("confirmed" in data) {
    markCalls.push(data as unknown as { id: string; confirmed: boolean });
    return { id: data.id };
  }
  return states;
};

vi.mock("@tanstack/react-start", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-start")>();
  return { ...actual, useServerFn: () => fetchServerFn };
});

const admin = { user: { id: "u1" }, isAdmin: true, loading: false } as unknown as ReturnType<typeof useAppAuth>;
const visitor = { user: null, isAdmin: false, loading: false } as unknown as ReturnType<typeof useAppAuth>;

const assignment: Assignment = {
  id: "a1",
  organisation_name: "Testorg",
  organisation_type: "Företag",
  title: "Testuppdrag",
  need: "En beskrivning som är lång nog för att vara giltig i formuläret.",
  category: "Hemsida",
  preferred_date: "2026-12-01",
  status: "Ny",
  interest_count: 0,
  created_at: "2026-10-01T08:00:00+00:00",
};

function renderWithClient(ui: React.ReactNode) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.mocked(useAppAuth).mockReset();
  markCalls.length = 0;
  states = [{ id: "a1", reviewed_at: null }];
});

describe("Granskningsstatus på uppdragskort", () => {
  it("visar Väntar på granskning för ett uppdrag som ännu inte har granskats", async () => {
    vi.mocked(useAppAuth).mockReturnValue(admin);

    renderWithClient(<AssignmentReviewStatus id="a1" />);

    expect(await screen.findByText("Väntar på granskning")).toBeInTheDocument();
    expect(screen.queryByText(/Granskad/)).toBeNull();
  });

  it("visar Granskad med datum för ett uppdrag som redan har granskats", async () => {
    vi.mocked(useAppAuth).mockReturnValue(admin);
    states = [{ id: "a1", reviewed_at: REVIEWED }];

    renderWithClient(<AssignmentReviewStatus id="a1" />);

    const badge = await screen.findByText(/Granskad/);
    expect(badge).toHaveTextContent("20 oktober 2026");
  });

  it("visar ingen granskningsstatus för besökare utan administratörsbehörighet", () => {
    vi.mocked(useAppAuth).mockReturnValue(visitor);

    const { container } = renderWithClient(<AssignmentReviewStatus id="a1" />);

    expect(container).toBeEmptyDOMElement();
  });
});

describe("Markera som granskad", () => {
  it("kräver administratörens uttryckliga bekräftelse innan uppdraget markeras som granskat", async () => {
    vi.mocked(useAppAuth).mockReturnValue(admin);

    renderWithClient(<AssignmentReviewPanel assignment={assignment} />);

    fireEvent.click(await screen.findByRole("button", { name: "Markera som granskad" }));

    await waitFor(() => expect(markCalls).toEqual([{ id: "a1", confirmed: true }]));
  });

  it("erbjuder ingen markering när uppdraget redan är granskat", async () => {
    vi.mocked(useAppAuth).mockReturnValue(admin);
    states = [{ id: "a1", reviewed_at: REVIEWED }];

    renderWithClient(<AssignmentReviewPanel assignment={assignment} />);

    await screen.findByRole("button", { name: "Granska med AI" });
    expect(screen.queryByRole("button", { name: "Markera som granskad" })).toBeNull();
  });

  it("visar ingen granskningsåtgärd för besökare utan administratörsbehörighet", () => {
    vi.mocked(useAppAuth).mockReturnValue(visitor);

    const { container } = renderWithClient(<AssignmentReviewPanel assignment={assignment} />);

    expect(container).toBeEmptyDOMElement();
  });
});
