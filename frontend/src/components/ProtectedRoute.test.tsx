import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
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

describe("ProtectedRoute", () => {
  it("redirects to home when not authenticated", () => {
    renderWithAuth(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>,
      { user: null, loading: false }
    );

    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  it("renders children when authenticated", () => {
    renderWithAuth(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>,
      { user: { subject: "user-123" }, loading: false }
    );

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("shows loading state while checking auth", () => {
    renderWithAuth(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>,
      { user: null, loading: true }
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });
});
