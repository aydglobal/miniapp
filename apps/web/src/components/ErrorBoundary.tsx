import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Telemetry varsa kullan, yoksa console'a yaz
    try {
      const telemetry = (window as any).__telemetry;
      if (telemetry?.captureError) {
        telemetry.captureError(error, { componentStack: info.componentStack });
      } else {
        console.error('[ErrorBoundary]', error, info);
      }
    } catch {
      console.error('[ErrorBoundary]', error);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div style={{ padding: 24, textAlign: 'center', color: '#fff' }}>
          <p>Bir şeyler ters gitti.</p>
          <button
            onClick={this.handleRetry}
            style={{ marginTop: 12, padding: '8px 20px', borderRadius: 8, cursor: 'pointer' }}
          >
            Tekrar Dene
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
