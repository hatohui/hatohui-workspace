'use client';

import {
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent,
  type WheelEvent,
} from 'react';
import {
  IMAGE_VIEWER_BUTTON_STEP,
  IMAGE_VIEWER_CLICK_TOLERANCE_PX,
  IMAGE_VIEWER_DOUBLE_CLICK_SCALE,
  IMAGE_VIEWER_MAX_SCALE,
  IMAGE_VIEWER_MIN_SCALE,
  IMAGE_VIEWER_WHEEL_STEP,
} from '@/constants/imageViewer';

interface View {
  scale: number;
  x: number;
  y: number;
}

interface Point {
  x: number;
  y: number;
}

const RESET: View = { scale: IMAGE_VIEWER_MIN_SCALE, x: 0, y: 0 };
const CENTER: Point = { x: 0, y: 0 };

const clampScale = (scale: number) =>
  Math.min(IMAGE_VIEWER_MAX_SCALE, Math.max(IMAGE_VIEWER_MIN_SCALE, scale));

function fromCenter(element: Element, clientX: number, clientY: number) {
  const rect = element.getBoundingClientRect();
  return {
    x: clientX - (rect.left + rect.width / 2),
    y: clientY - (rect.top + rect.height / 2),
  };
}

export function useZoomPan() {
  const [view, setView] = useState<View>(RESET);
  const [isGesturing, setIsGesturing] = useState(false);
  const pointers = useRef(new Map<number, Point>());
  const drag = useRef<{ start: Point; origin: Point } | null>(null);
  const pinch = useRef<{ distance: number; scale: number } | null>(null);
  const moved = useRef(false);
  const pressedBackdrop = useRef(false);
  const downAt = useRef<Point>(CENTER);

  const zoomTo = (next: (scale: number) => number, at: Point) =>
    setView((current) => {
      const scale = clampScale(next(current.scale));
      if (scale === IMAGE_VIEWER_MIN_SCALE) return RESET;
      const ratio = scale / current.scale;
      return {
        scale,
        x: at.x - (at.x - current.x) * ratio,
        y: at.y - (at.y - current.y) * ratio,
      };
    });

  const onWheel = (event: WheelEvent<HTMLElement>) => {
    const step =
      event.deltaY < 0 ? IMAGE_VIEWER_WHEEL_STEP : 1 / IMAGE_VIEWER_WHEEL_STEP;
    const at = fromCenter(event.currentTarget, event.clientX, event.clientY);
    zoomTo((scale) => scale * step, at);
  };

  const onDoubleClick = (event: MouseEvent<HTMLElement>) => {
    const at = fromCenter(event.currentTarget, event.clientX, event.clientY);
    zoomTo(
      (scale) =>
        scale > IMAGE_VIEWER_MIN_SCALE
          ? IMAGE_VIEWER_MIN_SCALE
          : IMAGE_VIEWER_DOUBLE_CLICK_SCALE,
      at,
    );
  };

  const pinchState = () => {
    const [a, b] = [...pointers.current.values()];
    return {
      distance: Math.hypot(a.x - b.x, a.y - b.y),
      mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
    };
  };

  const onPointerDown = (event: PointerEvent<HTMLElement>) => {
    moved.current = false;
    pressedBackdrop.current = event.target === event.currentTarget;
    downAt.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });
    if (pointers.current.size === 2) {
      drag.current = null;
      pinch.current = { distance: pinchState().distance, scale: view.scale };
      setIsGesturing(true);
    } else if (view.scale > IMAGE_VIEWER_MIN_SCALE) {
      drag.current = {
        start: { x: event.clientX, y: event.clientY },
        origin: { x: view.x, y: view.y },
      };
      setIsGesturing(true);
    }
  };

  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    if (!pointers.current.has(event.pointerId)) return;
    if (
      Math.hypot(
        event.clientX - downAt.current.x,
        event.clientY - downAt.current.y,
      ) > IMAGE_VIEWER_CLICK_TOLERANCE_PX
    ) {
      moved.current = true;
    }
    pointers.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });
    if (pinch.current && pointers.current.size === 2) {
      const { distance, mid } = pinchState();
      const target = pinch.current.scale * (distance / pinch.current.distance);
      zoomTo(() => target, fromCenter(event.currentTarget, mid.x, mid.y));
      return;
    }
    const current = drag.current;
    if (!current) return;
    setView((view) => ({
      ...view,
      x: current.origin.x + event.clientX - current.start.x,
      y: current.origin.y + event.clientY - current.start.y,
    }));
  };

  const onPointerEnd = (event: PointerEvent<HTMLElement>) => {
    pointers.current.delete(event.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
    if (pointers.current.size === 0) {
      drag.current = null;
      setIsGesturing(false);
    }
  };

  return {
    scale: view.scale,
    transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
    isZoomed: view.scale > IMAGE_VIEWER_MIN_SCALE,
    isGesturing,
    canZoomIn: view.scale < IMAGE_VIEWER_MAX_SCALE,
    zoomIn: () => zoomTo((scale) => scale * IMAGE_VIEWER_BUTTON_STEP, CENTER),
    zoomOut: () => zoomTo((scale) => scale / IMAGE_VIEWER_BUTTON_STEP, CENTER),
    reset: () => setView(RESET),
    isBackdropClick: () => pressedBackdrop.current && !moved.current,
    handlers: {
      onWheel,
      onDoubleClick,
      onPointerDown,
      onPointerMove,
      onPointerUp: onPointerEnd,
      onPointerCancel: onPointerEnd,
    },
  };
}
