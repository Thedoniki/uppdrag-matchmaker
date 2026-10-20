import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AssignmentArchive } from "@/components/AssignmentArchive";
import { useAppAuth } from "@/components/AuthProvider";

vi.mock("@/components/AuthProvider", () => ({ useAppAuth: vi.fn() }));

let fetchArchive: (args: { data: object }) => Promise<unknown> = async () => [];
vi.mock("@tanstack/react-start", () => ({
  // The component resolves its server function through useServerFn; in tests we
  // swap in a controllable fetcher instead of talking to the server.
  useServerFn: () => fetchArchive,
}));

function renderArchive() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <AssignmentArchive />
    </QueryClientProvider>,
  );
}

describe("AssignmentArchive", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.mocked(useAppAuth).mockReset();
  });

  it("visar felmeddelande med Försök igen-knapp när hämtningen misslyckas, och laddar arkivet vid nytt försök", async () => {
    vi.mocked(useAppAuth).mockReturnValue({ user: { id: "u1" }, isAdmin: true, loading: false } as ReturnType<typeof useAppAuth>);
    let calls = 0;
    fetchArchive = () => {
      calls += 1;
      if (calls === 1) return Promise.reject(new Error("fetch failed"));
      return Promise.resolve([{ id: "a1", title: "Testuppdrag", organisation_name: "Testorg" }]);
    };

    renderArchive();

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Arkiverade uppdrag kunde inte hämtas");
    const retry = screen.getByRole("button", { name: "Försök igen" });

    fireEvent.click(retry);

    await waitFor(() => expect(screen.getByText("Testuppdrag")).toBeInTheDocument());
    expect(calls).toBe(2);
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("renderar inget arkiv för icke-administratörer", () => {
    vi.mocked(useAppAuth).mockReturnValue({ user: null, isAdmin: false, loading: false } as ReturnType<typeof useAppAuth>);

    const { container } = renderArchive();

    expect(container).toBeEmptyDOMElement();
  });
});
