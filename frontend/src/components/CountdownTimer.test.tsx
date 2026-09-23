import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CountdownTimer } from "./CountdownTimer";

describe("CountdownTimer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("basic countdown", () => {
    it("renders with custom label", () => {
      render(
        <CountdownTimer
          totalSeconds={60}
          label="HANG"
          running={true}
          onComplete={vi.fn()}
        />
      );

      expect(screen.getByText("HANG")).toBeInTheDocument();
      expect(screen.getByText("01:00")).toBeInTheDocument();
    });

    it("counts down when running is true", () => {
      const onComplete = vi.fn();
      render(
        <CountdownTimer
          totalSeconds={3}
          label="TEST"
          running={true}
          onComplete={onComplete}
        />
      );

      expect(screen.getByText("00:03")).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(screen.getByText("00:02")).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(screen.getByText("00:01")).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(onComplete).toHaveBeenCalled();
    });

    it("does not count down when running is false", () => {
      render(
        <CountdownTimer
          totalSeconds={60}
          label="WAIT"
          running={false}
          onComplete={vi.fn()}
        />
      );

      expect(screen.getByText("01:00")).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(screen.getByText("01:00")).toBeInTheDocument();
    });
  });

  describe("hang phase buttons", () => {
    it("shows Start button when not running", () => {
      const onStart = vi.fn();

      render(
        <CountdownTimer
          totalSeconds={10}
          label="HANG"
          running={false}
          onStart={onStart}
          onComplete={vi.fn()}
        />
      );

      const startBtn = screen.getByRole("button", { name: /start/i });
      expect(startBtn).toBeInTheDocument();

      act(() => {
        startBtn.click();
      });
      expect(onStart).toHaveBeenCalled();
    });

    it("shows Cancel button when running in hang phase", () => {
      const onCancel = vi.fn();

      render(
        <CountdownTimer
          totalSeconds={10}
          label="HANG"
          running={true}
          onCancel={onCancel}
          onComplete={vi.fn()}
        />
      );

      const cancelBtn = screen.getByRole("button", { name: /cancel/i });
      expect(cancelBtn).toBeInTheDocument();

      act(() => {
        cancelBtn.click();
      });
      expect(onCancel).toHaveBeenCalled();
    });
  });

  describe("rest phase buttons", () => {
    it("shows Mark as Incomplete and Skip buttons in rest phase", () => {
      const onIncomplete = vi.fn();
      const onSkip = vi.fn();

      render(
        <CountdownTimer
          totalSeconds={180}
          label="REST"
          running={true}
          onIncomplete={onIncomplete}
          onSkip={onSkip}
          onComplete={vi.fn()}
        />
      );

      const incompleteBtn = screen.getByRole("button", { name: /mark as incomplete/i });
      const skipBtn = screen.getByRole("button", { name: /skip/i });

      expect(incompleteBtn).toBeInTheDocument();
      expect(skipBtn).toBeInTheDocument();

      act(() => {
        incompleteBtn.click();
      });
      expect(onIncomplete).toHaveBeenCalled();

      act(() => {
        skipBtn.click();
      });
      expect(onSkip).toHaveBeenCalled();
    });
  });

  describe("progress bar", () => {
    it("shows progress bar that decreases over time", () => {
      render(
        <CountdownTimer
          totalSeconds={10}
          label="TEST"
          running={true}
          onComplete={vi.fn()}
        />
      );

      const progressBar = screen.getByRole("progressbar");
      expect(progressBar).toHaveStyle({ width: "100%" });

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(progressBar).toHaveStyle({ width: "50%" });
    });
  });
});
