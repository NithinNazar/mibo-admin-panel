import React, { useState, useEffect, useRef } from "react";

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  minDisplayTime?: number; // Milliseconds (default: 3000)
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  message = "Creating clinician...",
  minDisplayTime = 3000,
}) => {
  const [shouldShow, setShouldShow] = useState(false);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (isVisible) {
      // Start showing the overlay
      startTimeRef.current = Date.now();
      setShouldShow(true);
    } else if (startTimeRef.current) {
      // Calculate how long the overlay has been shown
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, minDisplayTime - elapsed);

      // Hide after remaining time
      setTimeout(() => {
        setShouldShow(false);
        startTimeRef.current = null;
      }, remaining);
    }
  }, [isVisible, minDisplayTime]);

  if (!shouldShow) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 p-6 rounded-lg flex flex-col items-center shadow-xl">
        {/* Dark Blue Spinning Circle */}
        <div className="w-16 h-16 border-4 border-blue-900 border-t-blue-500 rounded-full animate-spin" />

        {/* Message */}
        <p className="text-white mt-4 text-center">{message}</p>
      </div>
    </div>
  );
};
