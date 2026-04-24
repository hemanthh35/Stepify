import { Component } from 'react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error(error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-4">
          <h1 className="text-lg font-semibold text-ink">Something went wrong</h1>
          <p className="mt-2 max-w-md text-center text-sm text-gray-600">
            Please refresh the page. If the problem continues, try signing out and back in.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
