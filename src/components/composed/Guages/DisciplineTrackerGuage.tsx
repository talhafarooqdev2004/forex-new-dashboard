"use client";

import { GAUGE_SIGNAL_COLORS } from "@/lib/gaugeSignalColors";

export default function DisciplineTrackerGuage() {
  const percentage = 78;
  const strokeWidth = 15;

  return (
    <div className="rounded-[12px] w-full border-b-[0.8px] border-[rgba(255,255,255,0.05)] overflow-hidden flex flex-col h-full">

      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
        <div className="relative w-[200px] h-[100px] mb-4">
          <svg viewBox="0 0 200 100" className="w-full h-full">
            {/* Background semi-circle */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="#2A2E37"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
            {/* Progress semi-circle */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke={GAUGE_SIGNAL_COLORS.buy}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={`${(percentage / 100) * (Math.PI * 80)} ${Math.PI * 80}`}
            />
          </svg>

          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
            <span className="text-[36px] font-bold leading-none" style={{ color: GAUGE_SIGNAL_COLORS.buy }}>
              {percentage}%
            </span>
          </div>
        </div>

        <div className="text-[24px] font-medium mt-2" style={{ color: GAUGE_SIGNAL_COLORS.buy }}>
          9 Days
        </div>
      </div>
    </div>
  );
}
