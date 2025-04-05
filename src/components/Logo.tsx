'use client';

import { useEffect, useState } from 'react';

export function Logo() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <svg
      className="h-10 w-auto"
      viewBox="0 0 250 120"
      xmlns="http://www.w3.org/2000/svg"
    >
      <style>
        {`
          @keyframes drawStroke {
            0% {
              stroke-dasharray: 300;
              stroke-dashoffset: 300;
            }
            100% {
              stroke-dasharray: 300;
              stroke-dashoffset: 0;
            }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .te-stroke {
            animation: drawStroke 1.5s ease-out forwards;
          }
          .text-fade {
            opacity: 0;
            animation: fadeIn 0.5s ease-out forwards;
            animation-delay: 1s;
          }
        `}
      </style>
      
      <path
        d="M20 60 C40 50, 60 50, 70 60 C80 70, 70 80, 50 85 C40 87, 30 90, 35 100 C40 110, 60 105, 90 95"
        stroke="#00CC99"
        strokeWidth="8"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="te-stroke"
      />
      
      <defs>
        <linearGradient id="greenBlueGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00CC99">
            <animate
              attributeName="stop-color"
              values="#00CC99;#00E6B0;#00CC99"
              dur="4s"
              repeatCount="indefinite"
            />
          </stop>
          <stop offset="100%" stopColor="#3498DB">
            <animate
              attributeName="stop-color"
              values="#3498DB;#4AA3E5;#3498DB"
              dur="4s"
              repeatCount="indefinite"
            />
          </stop>
        </linearGradient>
      </defs>
      
      <text
        x="100"
        y="80"
        fontFamily="Arial, sans-serif"
        fontWeight="700"
        fontSize="42"
        fill="url(#greenBlueGradient)"
        className="text-fade"
      >
        TeAI
      </text>
      <text
        x="190"
        y="80"
        fontFamily="Arial, sans-serif"
        fontWeight="700"
        fontSize="42"
        fill="#95A5A6"
        className="text-fade dark:fill-gray-400"
      >
        .io
      </text>
    </svg>
  );
}