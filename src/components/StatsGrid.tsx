import { useState, useEffect } from 'react';
import { Summary } from '../types';

interface StatsGridProps {
  summary: Summary;
}

function AnimatedNumber({ value, className = '' }: { value: number; className?: string }) {
  const [displayValue, setDisplayValue] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (displayValue !== value) {
      setAnimating(true);
      const timer = setTimeout(() => {
        setDisplayValue(value);
        setAnimating(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [value, displayValue]);

  return (
    <span className={`${className} ${animating ? 'animate-number' : ''} transition-all duration-300`}>
      {displayValue}
    </span>
  );
}

export function StatsGrid({ summary }: StatsGridProps) {
  const stats = [
    {
      icon: '🛡️',
      value: summary.protected,
      label: 'Защищено',
      color: 'text-cyber-green',
      border: 'border-cyber-green/30',
      hoverBorder: 'hover:border-cyber-green',
      hoverShadow: 'hover:shadow-[0_10px_30px_rgba(16,185,129,0.2)]',
    },
    {
      icon: '⚠️',
      value: summary.warnings,
      label: 'Требуют внимания',
      color: 'text-cyber-yellow',
      border: 'border-cyber-yellow/30',
      hoverBorder: 'hover:border-cyber-yellow',
      hoverShadow: 'hover:shadow-[0_10px_30px_rgba(245,158,11,0.2)]',
    },
    {
      icon: '🚨',
      value: summary.critical,
      label: 'Критические',
      color: 'text-cyber-red',
      border: 'border-cyber-red/30',
      hoverBorder: 'hover:border-cyber-red',
      hoverShadow: 'hover:shadow-[0_10px_30px_rgba(239,35,60,0.2)]',
    },
    {
      icon: '⚡',
      value: summary.threats_blocked_today,
      label: 'Угроз заблокировано',
      color: 'text-cyber-red',
      border: 'border-cyber-red/30',
      hoverBorder: 'hover:border-cyber-red',
      hoverShadow: 'hover:shadow-[0_10px_30px_rgba(239,35,60,0.2)]',
    },
  ];

  return (
    <section className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8 px-4 md:px-10 py-6 md:py-10">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`card-hover bg-cyber-card border ${stat.border} rounded-xl p-5 md:p-8 text-center backdrop-blur-lg ${stat.hoverBorder} ${stat.hoverShadow}`}
        >
          <div className={`text-3xl md:text-5xl mb-3 md:mb-4`}>{stat.icon}</div>
          <div className={`font-[Prosto_One] text-4xl md:text-5xl lg:text-6xl text-cyber-white mb-2 md:mb-3`}>
            <AnimatedNumber value={stat.value} />
          </div>
          <div className="font-[Play] text-xs md:text-sm lg:text-base text-cyber-white/80 uppercase tracking-wider">
            {stat.label}
          </div>
        </div>
      ))}
    </section>
  );
}
