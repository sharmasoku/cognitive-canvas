type ErrorReportOptions = {
  mechanism?: "manual" | "onerror" | "unhandledrejection" | "react_error_boundary";
  handled?: boolean;
  severity?: "error" | "warning" | "info";
};

type ErrorReporter = (
  error: unknown,
  context?: Record<string, unknown>,
  options?: ErrorReportOptions,
) => void;

declare global {
  interface Window {
    // Optional hook for an external error-reporting integration (e.g. Sentry).
    // No-op when nothing is wired up.
    __errorReporter?: ErrorReporter;
  }
}

export function reportError(error: unknown, context: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;

  const enrichedContext = {
    source: "react_error_boundary",
    route: window.location.pathname,
    ...context,
  };

  if (typeof window.__errorReporter === "function") {
    window.__errorReporter(error, enrichedContext, {
      mechanism: "react_error_boundary",
      handled: false,
      severity: "error",
    });
    return;
  }

  console.error("[error-boundary]", error, enrichedContext);
}
