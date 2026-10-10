'use client';

import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { LANDING_MOTION, REDUCED_MOTION_QUERY } from '@/constants/landing';

const target = (name: string) => `[data-landing="${name}"]`;

function playIntro() {
  gsap
    .timeline({ defaults: { ease: 'power3.out' } })
    .from(target('avatar'), {
      scale: 0,
      rotation: -90,
      duration: 0.8,
      ease: 'back.out(1.8)',
    })
    .from(
      target('letter'),
      {
        yPercent: 120,
        opacity: 0,
        rotation: () => gsap.utils.random(-25, 25),
        stagger: LANDING_MOTION.letterStagger,
        duration: 0.6,
        ease: 'back.out(2)',
      },
      '-=0.4',
    )
    .from(
      target('fade'),
      { y: 24, opacity: 0, stagger: 0.1, duration: 0.6 },
      '-=0.3',
    )
    .from(
      target('fact'),
      {
        scale: 0,
        opacity: 0,
        stagger: 0.08,
        duration: 0.7,
        ease: 'elastic.out(1, 0.6)',
      },
      '-=0.2',
    );
}

function playAmbient() {
  const m = LANDING_MOTION;
  gsap.to(target('ring'), {
    rotation: 360,
    duration: m.ringSpinSeconds,
    ease: 'none',
    repeat: -1,
  });
  gsap.utils.toArray<HTMLElement>(target('float')).forEach((element) => {
    gsap.from(element, {
      scale: 0,
      opacity: 0,
      duration: 1,
      delay: gsap.utils.random(0.2, 1.2),
    });
    gsap.to(element, {
      x: gsap.utils.random(-m.floatDistancePx, m.floatDistancePx),
      y: gsap.utils.random(-m.floatDistancePx, m.floatDistancePx),
      rotation: gsap.utils.random(-m.floatRotationDeg, m.floatRotationDeg),
      duration: gsap.utils.random(m.floatMinSeconds, m.floatMaxSeconds),
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    });
  });
}

function playOnScroll() {
  gsap.utils.toArray<HTMLElement>(target('reveal')).forEach((element) => {
    gsap.from(element, {
      y: 40,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: { trigger: element, start: 'top 85%' },
    });
  });
  gsap.from(target('tile'), {
    y: 60,
    opacity: 0,
    rotation: () =>
      gsap.utils.random(
        -LANDING_MOTION.tileTiltDeg,
        LANDING_MOTION.tileTiltDeg,
      ),
    stagger: 0.08,
    duration: 0.7,
    ease: 'back.out(1.4)',
    scrollTrigger: { trigger: target('tiles'), start: 'top 85%' },
  });
}

function trackPointer() {
  const layers = gsap.utils
    .toArray<HTMLElement>(target('parallax'))
    .map((element) => ({
      depth: Number(element.dataset.depth ?? 1),
      x: gsap.quickTo(element, 'x', { duration: 0.8, ease: 'power3.out' }),
      y: gsap.quickTo(element, 'y', { duration: 0.8, ease: 'power3.out' }),
    }));

  const onMove = (event: PointerEvent) => {
    const dx = event.clientX / window.innerWidth - 0.5;
    const dy = event.clientY / window.innerHeight - 0.5;
    layers.forEach((layer) => {
      layer.x(dx * LANDING_MOTION.parallaxPx * layer.depth);
      layer.y(dy * LANDING_MOTION.parallaxPx * layer.depth);
    });
  };

  window.addEventListener('pointermove', onMove);
  return () => window.removeEventListener('pointermove', onMove);
}

export function useLandingAnimation<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root || window.matchMedia(REDUCED_MOTION_QUERY).matches) return;

    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      playIntro();
      playAmbient();
      playOnScroll();
      return trackPointer();
    }, root);

    return () => context.revert();
  }, []);

  return ref;
}
