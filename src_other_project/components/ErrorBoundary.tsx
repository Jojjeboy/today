import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
}

interface ErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    resetError = () => {
        this.setState({ hasError: false, error: undefined });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                const FallbackComponent = this.props.fallback;
                return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
            }

            return <DefaultErrorFallback error={this.state.error} resetError={this.resetError} />;
        }

        return this.props.children;
    }
}

const DefaultErrorFallback: React.FC<{ error?: Error; resetError: () => void }> = ({ error, resetError }) => {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                    <AlertTriangle size={32} className="text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {t('error.title', 'Något gick fel')}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                    {t('error.message', 'Ett oväntat fel inträffade. Försök ladda om sidan eller kontakta support om problemet kvarstår.')}
                </p>
                {error && (
                    <details className="mb-6 text-left">
                        <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400 mb-2">
                            {t('error.details', 'Tekniska detaljer')}
                        </summary>
                        <pre className="text-xs bg-gray-100 dark:bg-gray-700 p-3 rounded overflow-auto">
                            {error.message}
                        </pre>
                    </details>
                )}
                <div className="flex gap-3 justify-center">
                    <button
                        onClick={resetError}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                        {t('error.retry', 'Försök igen')}
                    </button>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                    >
                        {t('error.reload', 'Ladda om')}
                    </button>
                </div>
            </div>
        </div>
    );
};