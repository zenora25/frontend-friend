// src/components/ErrorBoundary.tsx
import React, { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: React.ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error,
            errorInfo: null
        };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Error caught by ErrorBoundary:', error);
        console.error('Error info:', errorInfo);
        this.setState({ errorInfo });

        // You can also log the error to an error reporting service here
        // logErrorToService(error, errorInfo);
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });
        // Force a reload of the current route
        window.location.reload();
    };

    handleGoHome = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen flex items-center justify-center bg-background p-4">
                    <div className="max-w-md w-full bg-card border border-border rounded-lg shadow-lg p-6 space-y-6">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
                                <AlertTriangle className="w-8 h-8 text-destructive" />
                            </div>

                            <div className="space-y-2">
                                <h1 className="text-2xl font-bold text-foreground">Oops! Something went wrong</h1>
                                <p className="text-muted-foreground">
                                    {this.state.error?.message || 'An unexpected error occurred'}
                                </p>
                            </div>

                            {process.env.NODE_ENV === 'development' && this.state.error && (
                                <div className="w-full mt-4 p-4 bg-muted rounded-lg text-left">
                                    <details className="text-sm">
                                        <summary className="font-medium cursor-pointer mb-2">Error Details</summary>
                                        <pre className="text-xs overflow-auto whitespace-pre-wrap break-words">
                      {this.state.error.toString()}
                                            {this.state.errorInfo?.componentStack}
                    </pre>
                                    </details>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button
                                onClick={this.handleReset}
                                className="flex-1"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Try Again
                            </Button>
                            <Button
                                onClick={this.handleGoHome}
                                variant="outline"
                                className="flex-1"
                            >
                                <Home className="w-4 h-4 mr-2" />
                                Go to Home
                            </Button>
                        </div>

                        <p className="text-xs text-muted-foreground text-center pt-4">
                            If the problem persists, please contact support.
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;