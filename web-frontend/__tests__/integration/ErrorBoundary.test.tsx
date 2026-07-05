import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ErrorBoundary from "@/components/ErrorBoundary";

const ThrowingComponent = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) throw new Error("Test error");
  return <div data-testid="child">Child rendered</div>;
};

describe("ErrorBoundary Component", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("renders children when no error", () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={false} />
      </ErrorBoundary>,
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("renders error UI when error occurs", () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>,
    );
    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
  });

  it("shows try again button on error", () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>,
    );
    expect(
      screen.getByRole("button", { name: /Try Again/i }),
    ).toBeInTheDocument();
  });

  it("shows go home button on error", () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>,
    );
    expect(
      screen.getByRole("button", { name: /Go Home/i }),
    ).toBeInTheDocument();
  });

  it("renders custom fallback when provided", () => {
    render(
      <ErrorBoundary
        fallback={<div data-testid="custom-fallback">Custom error</div>}
      >
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>,
    );
    expect(screen.getByTestId("custom-fallback")).toBeInTheDocument();
  });

  it("Try Again button resets error state", () => {
    let shouldThrow = true;
    const Child = () => {
      if (shouldThrow) throw new Error("Test error");
      return <div data-testid="child">Child rendered</div>;
    };

    render(
      <ErrorBoundary>
        <Child />
      </ErrorBoundary>,
    );
    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();

    // The underlying problem is resolved, then the user retries.
    shouldThrow = false;
    fireEvent.click(screen.getByRole("button", { name: /Try Again/i }));

    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.queryByText(/Something went wrong/i)).not.toBeInTheDocument();
  });
});
