import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Dashboard } from "./Dashboard";
import { AuthProviderMock } from "@/lib/AuthContext";

function renderWithAuth(
  ui: React.ReactNode,
  authValue: { user: any; loading: boolean }
) {
  return render(
    <MemoryRouter>
      <AuthProviderMock
        value={{
          ...authValue,
          error: null,
          login: vi.fn(),
          logout: vi.fn(),
        }}
      >
        {ui}
      </AuthProviderMock>
    </MemoryRouter>
  );
}

describe("Dashboard", () => {
  it("displays welcome message with user subject", () => {
    renderWithAuth(<Dashboard />, {
      user: { subject: "user-123" },
      loading: false,
    });

    expect(screen.getByText("Welcome, user-123!")).toBeInTheDocument();
  });

  it("renders under construction message", () => {
    renderWithAuth(<Dashboard />, {
      user: { subject: "user-123" },
      loading: false,
    });

    expect(
      screen.getByText("Your dashboard is under construction.")
    ).toBeInTheDocument();
  });

  it("renders without errors", () => {
    renderWithAuth(<Dashboard />, {
      user: { subject: "test-user" },
      loading: false,
    });

    expect(screen.getByText("Welcome, test-user!")).toBeInTheDocument();
  });
});
