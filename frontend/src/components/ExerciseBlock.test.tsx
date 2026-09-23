import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ExerciseBlock } from "./ExerciseBlock";
import type { Exercise } from "@/lib/types";

function makeExercise(sets: number): Exercise {
  return {
    name: "Test Exercise",
    properties: {
      load: null,
      volume: {
        type: "TimeBased",
        hang_duration: { value: 10, unit: "s" },
        rest_duration: { value: 3, unit: "min" },
        sets,
      },
      grade: null,
      rpe: null,
    },
  };
}

function makeRepBasedExercise(count: number): Exercise {
  return {
    name: "Test Rep Exercise",
    properties: {
      load: null,
      volume: {
        type: "RepBased",
        count,
        rep_type: "reps",
        rpe: null,
      },
      grade: null,
      rpe: null,
    },
  };
}

describe("ExerciseBlock - Sequential Set Logic", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("set 0 is clickable, sets 1+ are disabled initially", async () => {
    const user = userEvent.setup();
    render(<ExerciseBlock exercise={makeExercise(5)} />);

    const set0 = screen.getByRole("button", { name: "Set 1" });
    const set1 = screen.getByRole("button", { name: "Set 2" });
    const set2 = screen.getByRole("button", { name: "Set 3" });

    expect(set0).not.toBeDisabled();
    expect(set1).toBeDisabled();
    expect(set2).toBeDisabled();
  });

  it("clicking set 0 shows hang timer, set 1 is disabled while timer is active", async () => {
    const user = userEvent.setup();
    render(<ExerciseBlock exercise={makeExercise(5)} />);

    const set0 = screen.getByRole("button", { name: "Set 1" });
    await user.click(set0);

    // After clicking, hang timer appears
    expect(screen.getByText("HANG")).toBeInTheDocument();

    const set1 = screen.getByRole("button", { name: "Set 2" });
    expect(set1).toBeDisabled();
  });

  it("set 1 hang timer starts automatically after rest is skipped", async () => {
    vi.useFakeTimers();
    render(<ExerciseBlock exercise={makeExercise(5)} />);

    const set0 = screen.getByRole("button", { name: "Set 1" });
    act(() => {
      set0.click();
    });

    // Start the hang
    const startBtn = screen.getByRole("button", { name: /start/i });
    act(() => {
      startBtn.click();
    });

    // Advance past hang duration (10 seconds) to get to rest
    act(() => {
      vi.advanceTimersByTime(11000);
    });

    // Now in rest phase, skip it
    const skipBtn = screen.getByRole("button", { name: /skip/i });
    act(() => {
      skipBtn.click();
    });

    // Set 1 should now be in hang waiting state (showing Start button)
    expect(screen.getByText("HANG")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /start/i })).toBeInTheDocument();
  });

  it("timer stays active after marking set as incomplete", async () => {
    vi.useFakeTimers();
    render(<ExerciseBlock exercise={makeExercise(5)} />);

    const set0 = screen.getByRole("button", { name: "Set 1" });
    act(() => {
      set0.click();
    });

    // Start the hang
    const startBtn = screen.getByRole("button", { name: /start/i });
    act(() => {
      startBtn.click();
    });

    // Advance past hang duration (10 seconds) to get to rest
    act(() => {
      vi.advanceTimersByTime(11000);
    });

    const incompleteBtn = screen.getByRole("button", { name: /mark as incomplete/i });
    act(() => {
      incompleteBtn.click();
    });

    // Timer should still be visible
    expect(screen.getByText("REST")).toBeInTheDocument();
    // Set 1 should still be disabled because timer is still running
    const set1 = screen.getByRole("button", { name: "Set 2" });
    expect(set1).toBeDisabled();
  });

  it("set 1 hang timer starts automatically after rest completes", async () => {
    vi.useFakeTimers();
    render(<ExerciseBlock exercise={makeExercise(5)} />);

    // Click set 0
    const set0 = screen.getByRole("button", { name: "Set 1" });
    act(() => {
      set0.click();
    });

    // Start the hang
    const startBtn = screen.getByRole("button", { name: /start/i });
    act(() => {
      startBtn.click();
    });

    // Advance past hang duration (10 seconds) to get to rest
    act(() => {
      vi.advanceTimersByTime(11000);
    });

    // Click mark as incomplete
    const incompleteBtn = screen.getByRole("button", { name: /mark as incomplete/i });
    act(() => {
      incompleteBtn.click();
    });

    // Advance timer past completion (3 minutes = 180 seconds)
    act(() => {
      vi.advanceTimersByTime(181000);
    });

    // Set 1 should now be in hang waiting state (showing Start button)
    expect(screen.getByText("HANG")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /start/i })).toBeInTheDocument();
  });

  it("cannot click set 2 when only set 0 is completed", async () => {
    vi.useFakeTimers();
    render(<ExerciseBlock exercise={makeExercise(5)} />);

    const set0 = screen.getByRole("button", { name: "Set 1" });
    act(() => {
      set0.click();
    });

    // Start the hang
    const startBtn = screen.getByRole("button", { name: /start/i });
    act(() => {
      startBtn.click();
    });

    // Advance past hang duration (10 seconds) to get to rest
    act(() => {
      vi.advanceTimersByTime(11000);
    });

    // Skip rest to complete the set
    const skipBtn = screen.getByRole("button", { name: /skip/i });
    act(() => {
      skipBtn.click();
    });

    const set2 = screen.getByRole("button", { name: "Set 3" });
    expect(set2).toBeDisabled();
  });

  it("timer with 'Mark as Incomplete' appears after hang completes", async () => {
    vi.useFakeTimers();
    render(<ExerciseBlock exercise={makeExercise(5)} />);

    const set0 = screen.getByRole("button", { name: "Set 1" });
    act(() => {
      set0.click();
    });

    const startBtn = screen.getByRole("button", { name: /start/i });
    act(() => {
      startBtn.click();
    });

    // Advance past hang duration (10 seconds) to get to rest
    act(() => {
      vi.advanceTimersByTime(11000);
    });

    expect(screen.getByRole("button", { name: /mark as incomplete/i })).toBeInTheDocument();
  });

  it("clicking 'Mark as Incomplete' in timer changes set to failed state", async () => {
    vi.useFakeTimers();
    render(<ExerciseBlock exercise={makeExercise(5)} />);

    const set0 = screen.getByRole("button", { name: "Set 1" });
    act(() => {
      set0.click();
    });

    const startBtn = screen.getByRole("button", { name: /start/i });
    act(() => {
      startBtn.click();
    });

    // Advance past hang duration (10 seconds) to get to rest
    act(() => {
      vi.advanceTimersByTime(11000);
    });

    const incompleteBtn = screen.getByRole("button", { name: /mark as incomplete/i });
    act(() => {
      incompleteBtn.click();
    });

    const failedSet = screen.getByRole("button", { name: "Set 1 (failed)" });
    expect(failedSet).toHaveAttribute("data-outcome", "failed");
  });

  it("clicking a completed set shows confirmation dialog", async () => {
    vi.useFakeTimers();
    render(<ExerciseBlock exercise={makeExercise(5)} />);

    const set0 = screen.getByRole("button", { name: "Set 1" });
    act(() => {
      set0.click();
    });

    const startBtn = screen.getByRole("button", { name: /start/i });
    act(() => {
      startBtn.click();
    });

    // Advance past hang duration (10 seconds) to get to rest
    act(() => {
      vi.advanceTimersByTime(11000);
    });

    const skipBtn = screen.getByRole("button", { name: /skip/i });
    act(() => {
      skipBtn.click();
    });

    const completedSet0 = screen.getByRole("button", { name: "Set 1 (completed)" });
    act(() => {
      completedSet0.click();
    });

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/clear set 1/i)).toBeInTheDocument();
  });

  it("confirming revert makes set clickable again", async () => {
    vi.useFakeTimers();
    render(<ExerciseBlock exercise={makeExercise(5)} />);

    const set0 = screen.getByRole("button", { name: "Set 1" });
    act(() => {
      set0.click();
    });

    const startBtn = screen.getByRole("button", { name: /start/i });
    act(() => {
      startBtn.click();
    });

    // Advance past hang duration (10 seconds) to get to rest
    act(() => {
      vi.advanceTimersByTime(11000);
    });

    const skipBtn = screen.getByRole("button", { name: /skip/i });
    act(() => {
      skipBtn.click();
    });

    const completedSet0 = screen.getByRole("button", { name: "Set 1 (completed)" });
    act(() => {
      completedSet0.click();
    });

    const confirmBtn = screen.getByRole("button", { name: /clear/i });
    act(() => {
      confirmBtn.click();
    });

    expect(set0).not.toBeDisabled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("canceling revert keeps set completed", async () => {
    vi.useFakeTimers();
    render(<ExerciseBlock exercise={makeExercise(5)} />);

    const set0 = screen.getByRole("button", { name: "Set 1" });
    act(() => {
      set0.click();
    });

    const startBtn = screen.getByRole("button", { name: /start/i });
    act(() => {
      startBtn.click();
    });

    // Advance past hang duration (10 seconds) to get to rest
    act(() => {
      vi.advanceTimersByTime(11000);
    });

    const skipBtn = screen.getByRole("button", { name: /skip/i });
    act(() => {
      skipBtn.click();
    });

    const completedSet0 = screen.getByRole("button", { name: "Set 1 (completed)" });
    act(() => {
      completedSet0.click();
    });

    const cancelBtn = screen.getByRole("button", { name: /cancel/i });
    act(() => {
      cancelBtn.click();
    });

    expect(screen.getByRole("button", { name: "Set 1 (completed)" })).toBeInTheDocument();
  });

  it("clicking a failed set shows confirmation dialog", async () => {
    vi.useFakeTimers();
    render(<ExerciseBlock exercise={makeExercise(5)} />);

    const set0 = screen.getByRole("button", { name: "Set 1" });
    act(() => {
      set0.click();
    });

    const startBtn = screen.getByRole("button", { name: /start/i });
    act(() => {
      startBtn.click();
    });

    // Advance past hang duration (10 seconds) to get to rest
    act(() => {
      vi.advanceTimersByTime(11000);
    });

    const failBtn = screen.getByRole("button", { name: /mark as incomplete/i });
    act(() => {
      failBtn.click();
    });

    const failedSet = screen.getByRole("button", { name: "Set 1 (failed)" });
    act(() => {
      failedSet.click();
    });

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("completing a set triggers rest timer", async () => {
    vi.useFakeTimers();
    render(<ExerciseBlock exercise={makeExercise(5)} />);

    const set0 = screen.getByRole("button", { name: "Set 1" });
    act(() => {
      set0.click();
    });

    const startBtn = screen.getByRole("button", { name: /start/i });
    act(() => {
      startBtn.click();
    });

    // Advance past hang duration (10 seconds) to get to rest
    act(() => {
      vi.advanceTimersByTime(11000);
    });

    expect(screen.getByText("REST")).toBeInTheDocument();
  });

  describe("Hang Timer for TimeBased exercises", () => {
    it("clicking set shows Start button (hang waiting state)", async () => {
      vi.useFakeTimers();
      render(<ExerciseBlock exercise={makeExercise(5)} />);

      const set0 = screen.getByRole("button", { name: "Set 1" });
      act(() => {
        set0.click();
      });

      // Should show HANG label and Start button
      expect(screen.getByText("HANG")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /start/i })).toBeInTheDocument();
    });

    it("clicking Start begins hang countdown", async () => {
      vi.useFakeTimers();
      render(<ExerciseBlock exercise={makeExercise(5)} />);

      const set0 = screen.getByRole("button", { name: "Set 1" });
      act(() => {
        set0.click();
      });

      const startBtn = screen.getByRole("button", { name: /start/i });
      act(() => {
        startBtn.click();
      });

      // Should show Cancel button during hang
      expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
      // Start button should be gone
      expect(screen.queryByRole("button", { name: /start/i })).not.toBeInTheDocument();
    });

    it("hang countdown auto-completes and starts rest", async () => {
      vi.useFakeTimers();
      render(<ExerciseBlock exercise={makeExercise(5)} />);

      // Click set 0
      const set0 = screen.getByRole("button", { name: "Set 1" });
      act(() => {
        set0.click();
      });

      // Click Start
      const startBtn = screen.getByRole("button", { name: /start/i });
      act(() => {
        startBtn.click();
      });

      // Advance past hang duration (10 seconds)
      act(() => {
        vi.advanceTimersByTime(11000);
      });

      // Should now be in REST phase
      expect(screen.getByText("REST")).toBeInTheDocument();
      // Set should be marked as completed
      expect(screen.getByRole("button", { name: "Set 1 (completed)" })).toBeInTheDocument();
    });

    it("Cancel during hang marks set as failed, starts rest", async () => {
      vi.useFakeTimers();
      render(<ExerciseBlock exercise={makeExercise(5)} />);

      // Click set 0
      const set0 = screen.getByRole("button", { name: "Set 1" });
      act(() => {
        set0.click();
      });

      // Click Start
      const startBtn = screen.getByRole("button", { name: /start/i });
      act(() => {
        startBtn.click();
      });

      // Click Cancel
      const cancelBtn = screen.getByRole("button", { name: /cancel/i });
      act(() => {
        cancelBtn.click();
      });

      // Should be in REST phase
      expect(screen.getByText("REST")).toBeInTheDocument();
      // Set should be marked as failed
      expect(screen.getByRole("button", { name: "Set 1 (failed)" })).toBeInTheDocument();
    });

    it("set is disabled during hang phase", async () => {
      vi.useFakeTimers();
      render(<ExerciseBlock exercise={makeExercise(5)} />);

      const set0 = screen.getByRole("button", { name: "Set 1" });
      act(() => {
        set0.click();
      });

      // Start the hang
      const startBtn = screen.getByRole("button", { name: /start/i });
      act(() => {
        startBtn.click();
      });

      // Set 1 should be disabled during hang
      const set1 = screen.getByRole("button", { name: "Set 2" });
      expect(set1).toBeDisabled();
    });
  });

  describe("RepBased exercises skip hang phase", () => {
    it("clicking set immediately completes it (no hang timer)", async () => {
      const user = userEvent.setup();
      render(<ExerciseBlock exercise={makeRepBasedExercise(5)} />);

      const set0 = screen.getByRole("button", { name: "Set 1" });
      await user.click(set0);

      // Should immediately be in REST phase, no HANG
      expect(screen.getByText("REST")).toBeInTheDocument();
      expect(screen.queryByText("HANG")).not.toBeInTheDocument();
      // Set should be marked as completed
      expect(screen.getByRole("button", { name: "Set 1 (completed)" })).toBeInTheDocument();
    });
  });
});
