import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useAuth } from "./useAuth";

describe("useAuth", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns loading state initially", () => {
    vi.mocked(fetch).mockImplementation(() => new Promise(() => {}));

    const { result } = renderHook(() => useAuth());

    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBeNull();
  });

  it("sets user when auth check succeeds", async () => {
    const mockUser = { user: { subject: "user-123", email: null } };
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockUser),
    } as Response);

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toEqual({ subject: "user-123", email: null });
    expect(result.current.error).toBeNull();
  });

  it("sets user to null when auth check fails", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 401,
    } as Response);

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("handles network errors gracefully", async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.error).toBe("Failed to check auth");
  });

  it("login function is defined", () => {
    vi.mocked(fetch).mockImplementation(() => new Promise(() => {}));

    const { result } = renderHook(() => useAuth());

    expect(result.current.login).toBeDefined();
    expect(typeof result.current.login).toBe("function");
  });

  it("logout function is defined", () => {
    vi.mocked(fetch).mockImplementation(() => new Promise(() => {}));

    const { result } = renderHook(() => useAuth());

    expect(result.current.logout).toBeDefined();
    expect(typeof result.current.logout).toBe("function");
  });
});
