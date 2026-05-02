// src/components/ErrorBoundary.jsx
import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950 p-6">
          <div className="card p-8 max-w-md w-full text-center animate-fade-in">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100 mb-2">
              Something went wrong
            </h1>
            <p className="text-surface-500 dark:text-surface-400 mb-6 text-sm">
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <button
              className="btn-primary"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
