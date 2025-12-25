import React, { useEffect, useState } from 'react';
import '../styles/components/CoinAnimation.css';

interface Coin {
  id: number;
  style: React.CSSProperties;
}

const CoinAnimation: React.FC = () => {
  const [coins, setCoins] = useState<Coin[]>([]);

  useEffect(() => {
    const handleAnimateCoins = (event: Event) => {
      const target = document.getElementById('coin-target');
      if (!target) return;

      const targetRect = target.getBoundingClientRect();
      const targetX = targetRect.left + targetRect.width / 2;
      const targetY = targetRect.top + targetRect.height / 2;

      // Start from center of screen
      const startX = window.innerWidth / 2;
      const startY = window.innerHeight / 2;

      const newCoins: Coin[] = [];
      const coinCount = 10; // Number of coins to fly

      for (let i = 0; i < coinCount; i++) {
        // Random spread for start
        const spreadX = (Math.random() - 0.5) * 100;
        const spreadY = (Math.random() - 0.5) * 100;

        // Random control point for bezier curve (quadratic)
        // We want them to arc slightly
        // const controlX = startX + (targetX - startX) / 2 + (Math.random() - 0.5) * 200;
        // const controlY = startY + (targetY - startY) / 2 - 200 - Math.random() * 100; // Arc upwards

        const duration = 1000 + Math.random() * 500; // 1-1.5s
        const delay = Math.random() * 500;
        
        const deltaX = targetX - (startX + spreadX);
        const deltaY = targetY - (startY + spreadY);

        newCoins.push({
          id: Date.now() + i,
          style: {
            left: `${startX + spreadX}px`,
            top: `${startY + spreadY}px`,
            '--delta-x': `${deltaX}px`,
            '--delta-y': `${deltaY}px`,
            animationDuration: `${duration}ms`,
            animationDelay: `${delay}ms`,
          } as React.CSSProperties,
        });
      }

      setCoins(prev => [...prev, ...newCoins]);

      // Cleanup coins after animation
      setTimeout(() => {
        setCoins(prev => prev.filter(c => !newCoins.find(nc => nc.id === c.id)));
      }, 2000); // Max duration + delay
    };

    window.addEventListener('animate-coins', handleAnimateCoins);

    return () => {
      window.removeEventListener('animate-coins', handleAnimateCoins);
    };
  }, []);

  if (coins.length === 0) return null;

  return (
    <div className="coin-animation-container">
      {coins.map(coin => (
        <div
          key={coin.id}
          className="flying-coin"
          style={coin.style}
        >
          <svg viewBox="0 0 24 24" width="24" height="24">
             <path
                fill="#DAA520"
                d="M12 2c1.8 0 3.2 1.3 3.5 3 .3-1.7 1.7-3 3.5-3 2 0 3.5 1.5 3.5 3.5 0 1.9-1.4 3.4-3.2 3.5 1.8.1 3.2 1.6 3.2 3.5 0 2-1.5 3.5-3.5 3.5-1.8 0-3.2-1.3-3.5-3-.3 1.7-1.7 3-3.5 3-2 0-3.5-1.5-3.5-3.5 0-1.9 1.4-3.4 3.2-3.5-1.8-.1-3.2-1.6-3.2-3.5C8.5 3.5 10 2 12 2zm0 10.5c.6 0 1 .4 1 1v7h-2v-7c0-.6.4-1 1-1z"
            />
          </svg>
        </div>
      ))}
    </div>
  );
};

export default CoinAnimation;
