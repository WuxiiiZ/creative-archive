/**
 * ErrorBoundary — a safety net around the app.
 *
 * If a child component crashes while rendering, this catches the error and
 * shows a simple "Something went wrong" screen with a Try again button,
 * instead of a blank / broken page. It wraps the whole app in main.tsx.
 */
import { Component, type ErrorInfo, type ReactNode } from "react";
import { en, zh } from "../i18n/messages";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error boundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const copy =
        document.documentElement.lang.startsWith("zh") ? zh.error : en.error;
      return (
        <div className="error-fallback" role="alert">
          <h2>{copy.title}</h2>
          <p>{this.state.error?.message ?? copy.fallback}</p>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            {copy.retry}
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
