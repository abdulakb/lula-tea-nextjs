"use client";

import { useEffect, useState } from "react";

export default function SuccessAnimation({ onComplete }: { onComplete?: () => void }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);
    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
        show ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className={`bg-white rounded-3xl p-8 shadow-2xl transform transition-all duration-500 ${
          show ? "scale-100 rotate-0" : "scale-0 rotate-180"
        }`}
      >
        <div className="flex flex-col items-center">
          {/* Checkmark Animation */}
          <div className="relative w-24 h-24 mb-4">
            <svg
              className="w-24 h-24 text-tea-green"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle
                className="animate-[spin_1s_ease-in-out]"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
              <path
                className="animate-[dash_0.5s_ease-in-out_0.5s_forwards]"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4"
                style={{
                  strokeDasharray: 20,
                  strokeDashoffset: 20,
                }}
              />
            </svg>
          </div>

          {/* Success Text */}
          <h3 className="text-2xl font-bold text-deep-brown mb-2">Success!</h3>
          <p className="text-tea-brown text-center">Your order has been placed</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes dash {
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  );
}
