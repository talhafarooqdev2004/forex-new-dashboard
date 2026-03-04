"use client";

export default function DisciplineTrackerGuage() {
  const percentage = 78;
  const radius = 80;
  const strokeWidth = 15;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  // We only want a semi-circle (half circumference)
  const strokeDashoffset = circumference - (percentage / 100) * (circumference / 2);

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
              stroke="#00D492"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={`${(percentage / 100) * (Math.PI * 80)} ${Math.PI * 80}`}
            />
          </svg>

          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
            <span className="text-[#00D492] text-[36px] font-bold leading-none">
              {percentage}%
            </span>
          </div>
        </div>

        <div className="text-[#00D492] text-[24px] font-medium mt-2">
          9 Days
        </div>
      </div>
    </div>
  );
}
