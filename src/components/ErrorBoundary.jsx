import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] Caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-dark-900 p-8">
          <div className="card p-10 text-center max-w-md">
            <div className="text-4xl mb-4">&#9888;</div>
            <h2 className="text-white font-semibold text-xl mb-2">Something went wrong</h2>
            <p className="text-slate-400 text-sm mb-6">An unexpected error occurred. Please try refreshing the page.</p>
            <button onClick={() => window.location.reload()} className="btn-primary">
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
