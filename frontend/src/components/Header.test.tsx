import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { Header } from "./Header";
import { AuthProviderMock } from "@/lib/AuthContext";

function renderWithAuth(
  ui: React.ReactNode,
  authValue: { user: any; loading: boolean; login: () => void; logout: () => void }
) {
  return render(
    <MemoryRouter>
      <AuthProviderMock value={authValue}>{ui}</AuthProviderMock>
    </MemoryRouter>
  );
}

describe("Header", () => {
  it("shows 'Sign in with Google' when not authenticated", () => {
    renderWithAuth(<Header />, {
      user: null,
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
    });

    expect(screen.getByText("Sign in with Google")).toBeInTheDocument();
    expect(screen.queryByText("Sign out")).not.toBeInTheDocument();
  });

  it("shows user info and logout button when authenticated", () => {
    renderWithAuth(<Header />, {
      user: { subject: "user-123456789" },
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
    });

    expect(screen.getByText(/user-123\.\.\./)).toBeInTheDocument();
    expect(screen.getByText("Sign out")).toBeInTheDocument();
    expect(screen.queryByText("Sign in with Google")).not.toBeInTheDocument();
  });

  it("shows Dashboard link when authenticated", () => {
    renderWithAuth(<Header />, {
      user: { subject: "user-123" },
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
    });

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("does not show Dashboard link when not authenticated", () => {
    renderWithAuth(<Header />, {
      user: null,
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
    });

    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
  });

  it("calls login when 'Sign in with Google' is clicked", async () => {
    const user = userEvent.setup();
    const login = vi.fn();

    renderWithAuth(<Header />, {
      user: null,
      loading: false,
      login,
      logout: vi.fn(),
    });

    await user.click(screen.getByText("Sign in with Google"));
    expect(login).toHaveBeenCalled();
  });

  it("calls logout when 'Sign out' is clicked", async () => {
    const user = userEvent.setup();
    const logout = vi.fn();

    renderWithAuth(<Header />, {
      user: { subject: "user-123" },
      loading: false,
      login: vi.fn(),
      logout,
    });

    await user.click(screen.getByText("Sign out"));
    expect(logout).toHaveBeenCalled();
  });
});
