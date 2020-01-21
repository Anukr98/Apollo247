import React, { ErrorInfo } from 'react';

interface ErrorBoundaryProps {
  onError?: () => void;
}
interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Display fallback UI
    this.setState({ hasError: true });
    // You can also log the error to an error reporting service
    console.log({ error, info });
    this.props.onError && this.props.onError();
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return null;
    }
    return this.props.children;
  }
}
