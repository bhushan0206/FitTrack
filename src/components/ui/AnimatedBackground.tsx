import { useEffect, useState } from 'react';

interface FloatingIconProps {
  icon: string;
  delay: number;
  duration: number;
  size: string;
}

const FloatingIcon = ({ icon, delay, duration, size }: FloatingIconProps) => (
  <div
    className={`absolute opacity-10 animate-pulse text-primary ${size}`}
    style={{
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${delay}s`,
      animationDuration: `${duration}s`,
    }}
  >
    {icon}
  </div>
);

export default function AnimatedBackground() {
  const [icons] = useState([
    '🏃‍♂️', '🏋️‍♀️', '🚴‍♂️', '⚽', '🏀', '🎾', '🏊‍♀️', 
    '🧘‍♂️', '💪', '🥗', '💧', '⏰', '📊', '🎯', '🔥'
  ]);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
      
      {/* Floating fitness icons */}
      {icons.map((icon, index) => (
        <FloatingIcon
          key={index}
          icon={icon}
          delay={index * 0.5}
          duration={8 + Math.random() * 4}
          size={Math.random() > 0.5 ? 'text-4xl' : 'text-6xl'}
        />
      ))}
      
      {/* Animated circles */}
      <div className="absolute top-10 left-10 w-64 h-64 bg-primary/5 rounded-full animate-pulse" />
      <div className="absolute bottom-10 right-10 w-48 h-48 bg-secondary/5 rounded-full animate-bounce" style={{ animationDuration: '3s' }} />
      <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-accent/5 rounded-full animate-ping" style={{ animationDuration: '4s' }} />
    </div>
  );
}
