"use client";

import React from "react";

const lineData = [
  { x: 0, pips: 0, label: '' },
  { x: 1, pips: 100, label: '5' },
  { x: 10, pips: 175, label: '15' },
  { x: 20, pips: 400, label: '1000' },
  { x: 22, pips: 600, label: '1500' },
  { x: 24, pips: 800, label: '2000' },
];

const pieData = [
  { name: 'Wins', value: 79, color: '#4ADE80' },
  { name: 'Losses', value: 21, color: '#EF4444' },
];

export default function PipsGrowthChart() {
  return (
    <div className="bg-[#1a1d23] rounded-[12px] w-full border-b-[0.8px] border-[rgba(255,255,255,0.05)] overflow-hidden">
      <div className="w-full horizontal-scroll">
        <div className="flex flex-col lg:flex-row gap-8 p-6 min-w-[800px]">
          {/* Donut Chart Section (Manual SVG) */}
          <div className="flex flex-col items-center min-w-[288px]">
            <div className="relative w-[192px] h-[192px]">
              <svg viewBox="0 0 192 192" className="w-full h-full transform -rotate-90">
                {/* Wins Circle */}
                <circle
                  cx="96"
                  cy="96"
                  r="67.5"
                  fill="transparent"
                  stroke="#4ADE80"
                  strokeWidth="25"
                  strokeDasharray={`${(79 / 100) * 424} 424`}
                />
                {/* Losses Circle */}
                <circle
                  cx="96"
                  cy="96"
                  r="67.5"
                  fill="transparent"
                  stroke="#EF4444"
                  strokeWidth="25"
                  strokeDasharray={`${(21 / 100) * 424} 424`}
                  strokeDashoffset={`${-(79 / 100) * 424}`}
                />
                {/* Inner stroke */}
                <circle cx="96" cy="96" r="55" fill="transparent" stroke="white" strokeWidth="1" />
                {/* Outer stroke */}
                <circle cx="96" cy="96" r="80" fill="transparent" stroke="white" strokeWidth="1" />
              </svg>
              {/* Center text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="font-['Arimo',sans-serif] font-bold text-[30px] leading-[36px] text-white">79%</span>
                <span className="font-['Arimo',sans-serif] font-bold text-[10px] leading-[15px] text-[#05df72]">Wins</span>
              </div>
              {/* Loss label on the red slice */}
              <div className="absolute" style={{ top: '57px', left: '85px' }}>
                <span className="font-['Arimo',sans-serif] font-bold text-[10px] leading-[15px] text-[#ff6467]">Loss</span>
              </div>
            </div>
            {/* Legend */}
            <div className="flex gap-4 items-center mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-[6px] bg-[#00c950]" />
                <span className="font-['Arima',sans-serif] text-[10px] leading-[15px] text-white">Wins</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-[6px] bg-[#fb2c36]" />
                <span className="font-['Arima',sans-serif] text-[10px] leading-[15px] text-white">Losses</span>
              </div>
            </div>
          </div>

          {/* Line Chart Section (Manual SVG) */}
          <div className="flex-1 flex flex-col gap-4 min-w-0 pr-12">
            <h3 className="font-['Inter',sans-serif] font-bold text-[20px] leading-[24px] text-white tracking-normal">
              Pips Growth
            </h3>
            <div className="w-full h-[192px] relative">
              <svg viewBox="0 0 600 200" className="w-full h-full" preserveAspectRatio="none">
                {/* Grid Lines */}
                {[0, 50, 100, 150, 200].map((y) => (
                  <line key={y} x1="0" y1={y} x2="600" y2={y} stroke="#6A7282" strokeWidth="0.5" strokeDasharray="3 3" />
                ))}
                {/* Line Path */}
                <path
                  d="M 0 200 L 25 175 L 250 156.25 L 500 100 L 550 50 L 600 0"
                  fill="none"
                  stroke="#60A5FA"
                  strokeWidth="2"
                />
                {/* Dots and Labels */}
                {[
                  { x: 0, y: 200, label: '' },
                  { x: 25, y: 175, label: '5' },
                  { x: 250, y: 156.25, label: '15' },
                  { x: 500, y: 100, label: '1000' },
                  { x: 550, y: 50, label: '1500' },
                  { x: 600, y: 0, label: '2000' },
                ].map((p, i) => (
                  <g key={i}>
                    <circle cx={p.x} cy={p.y} r="4" fill="#60A5FA" />
                    {p.label && (
                      <text x={p.x} y={p.y - 10} fill="white" fontSize="10" textAnchor="middle">
                        {p.label}
                      </text>
                    )}
                  </g>
                ))}
              </svg>
              {/* Y-Axis Labels (Right) */}
              <div className="absolute right-0 top-0 h-full flex flex-col justify-between text-white text-[10px] pr-1 translate-x-full">
                <span>+800</span>
                <span>+600</span>
                <span>+400</span>
                <span>+200</span>
                <span>+0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
