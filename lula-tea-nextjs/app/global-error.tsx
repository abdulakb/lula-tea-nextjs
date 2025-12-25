'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Silently log the error without showing to user
    if (process.env.NODE_ENV === 'development') {
      console.error('Global error caught:', error);
    }
  }, [error]);

  return (
    <html>
      <body style={{
        margin: 0,
        padding: 0,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        backgroundColor: '#f9f7f4',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
      }}>
        <div style={{
          maxWidth: '400px',
          width: '100%',
          padding: '2rem',
          textAlign: 'center',
        }}>
          <div style={{ marginBottom: '2rem' }}>
            <svg
              style={{
                width: '80px',
                height: '80px',
                margin: '0 auto',
                color: '#7a9b76',
                opacity: 0.5,
              }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#333',
            marginBottom: '1rem',
          }}>
            Something went wrong
          </h2>
          <p style={{
            color: '#666',
            marginBottom: '2rem',
          }}>
            We're sorry for the inconvenience. Please refresh the page to continue.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            style={{
              width: '100%',
              backgroundColor: '#7a9b76',
              color: 'white',
              fontWeight: '600',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            Go to Homepage
          </button>
        </div>
      </body>
    </html>
  );
}
