import React, { useState, useEffect, useRef } from 'react';

interface FloatingCTAProps {
  onLoginClick: () => void;
  onJoinClick: () => void;
}

export function FloatingCTA({ onLoginClick, onJoinClick }: FloatingCTAProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [currentText, setCurrentText] = useState<'login' | 'join'>('join');
  const [showText, setShowText] = useState(false);
  const ctaRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);

  // Update position based on scroll
  useEffect(() => {
    const updatePosition = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const windowWidth = window.innerWidth;
      
      // Calculate position based on scroll progress
      const scrollProgress = scrollY / (document.body.scrollHeight - windowHeight);
      
      // Move the CTA along a path as user scrolls
      const baseX = windowWidth * 0.85; // Start from right side
      const baseY = windowHeight * 0.3; // Start from top third
      
      // Create a floating path
      const x = baseX + Math.sin(scrollProgress * Math.PI * 4) * 100;
      const y = baseY + scrollProgress * (windowHeight * 0.4) + Math.cos(scrollProgress * Math.PI * 6) * 50;
      
      setPosition({ x, y });
      lastScrollY.current = scrollY;
    };

    // Initial position
    updatePosition();
    
    // Update on scroll
    const handleScroll = () => {
      requestAnimationFrame(updatePosition);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Randomly switch between login and join text
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentText(prev => prev === 'login' ? 'join' : 'login');
    }, 3000 + Math.random() * 2000); // 3-5 seconds

    return () => clearInterval(interval);
  }, []);

  // Show text sporadically
  useEffect(() => {
    const showInterval = setInterval(() => {
      setShowText(true);
      setTimeout(() => setShowText(false), 2000);
    }, 5000 + Math.random() * 3000); // Every 5-8 seconds

    return () => clearInterval(showInterval);
  }, []);

  const handleClick = () => {
    if (currentText === 'login') {
      onLoginClick();
    } else {
      onJoinClick();
    }
  };

  return (
    <div
      ref={ctaRef}
      className="wf-floating-cta"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -50%)',
      }}
      onClick={handleClick}
    >
      <div className="wf-cta-particle" />
      <div className={`wf-cta-text ${showText ? 'visible' : ''}`}>
        {currentText === 'login' ? 'Click to Login' : 'Click to Join'}
      </div>
    </div>
  );
}