import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

const ORBS = [
  { color: '#cc785c', size: 520, top: '-10%', left: '-8%' },
  { color: '#e8b568', size: 420, top: '55%', left: '65%' },
  { color: '#b45f6c', size: 380, top: '10%', left: '70%' },
];

function AmbientBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (window.matchMedia(REDUCED_MOTION_QUERY).matches) return;

    const orbs = container.querySelectorAll<HTMLDivElement>('[data-orb]');
    const context = gsap.context(() => {
      orbs.forEach((orb, index) => {
        gsap
          .timeline({ repeat: -1, yoyo: true, delay: index * 1.5 })
          .to(orb, {
            x: 60 + index * 20,
            y: -40 - index * 10,
            scale: 1.15,
            duration: 10 + index * 3,
            ease: 'sine.inOut',
          })
          .to(orb, {
            x: -40,
            y: 30,
            scale: 0.95,
            duration: 9 + index * 2,
            ease: 'sine.inOut',
          });
      });
    }, container);

    return () => context.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {ORBS.map((orb, index) => (
        <div
          key={index}
          data-orb
          className="absolute rounded-full opacity-30 blur-3xl"
          style={{
            width: orb.size,
            height: orb.size,
            top: orb.top,
            left: orb.left,
            background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
          }}
        />
      ))}
    </div>
  );
}

export default AmbientBackground;
