import { useState, useEffect } from 'react';

export function Header() {
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('ru-RU', { hour12: false }));
      setDate(now.toLocaleDateString('ru-RU', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="relative z-10 flex flex-col sm:flex-row justify-between items-center px-6 md:px-10 py-5 bg-gradient-to-b from-cyber-black/90 to-transparent border-b-2 border-cyber-red">
      <div className="flex items-center gap-4 md:gap-5">
        <div className="w-12 h-12 md:w-14 md:h-14 animate-pulse-slow">
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <polygon
              points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5"
              fill="none"
              stroke="#EF233C"
              strokeWidth="2"
            />
            <rect x="40" y="40" width="20" height="20" fill="#EF233C" />
          </svg>
        </div>
        <h1 className="font-[Prosto_One] text-xl md:text-2xl lg:text-3xl text-cyber-white tracking-wider">
          КИБЕР СТРАТЕГИЯ
        </h1>
      </div>
      <div className="text-right mt-3 sm:mt-0">
        <div className="font-[Montserrat] text-3xl md:text-4xl lg:text-5xl font-light text-cyber-red tracking-widest">
          {time}
        </div>
        <div className="font-[Montserrat] text-sm md:text-base text-cyber-white/70 capitalize">
          {date}
        </div>
      </div>
    </header>
  );
}
