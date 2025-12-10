import { useState, useRef, useEffect, useCallback } from "react";
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 5;


const ZOOM_SENSITIVITY = 0.001;

export default function useZoomPan() {
  const containerRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [last, setLast] = useState({ x: 0, y: 0 });
  const lastTouchDistance = useRef(null);

  const onWheel = useCallback(
    (e) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();

      const delta = -e.deltaY * ZOOM_SENSITIVITY;
      setZoom((z) => Math.min(Math.max(z + delta, MIN_ZOOM), MAX_ZOOM));
    },
    []
  );

  const onDown = useCallback((e) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      setIsPanning(true);
      setLast({ x: e.clientX, y: e.clientY });
    }
  }, []);

  const onMove = useCallback(
    (e) => {
      if (!isPanning) return;

      setPanOffset((p) => ({
        x: p.x + (e.clientX - last.x),
        y: p.y + (e.clientY - last.y),
      }));

      setLast({ x: e.clientX, y: e.clientY });
    },
    [isPanning, last]
  );

  const onUp = () => setIsPanning(false);

  // Touch event handlers for pinch-to-zoom
  const handleTouchStart = useCallback((e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      lastTouchDistance.current = distance;
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (e.touches.length === 2 && lastTouchDistance.current) {
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );

      const delta = distance - lastTouchDistance.current;
      const zoomDelta = delta * 0.01; // Sensitivity for pinch zoom

      setZoom((z) => Math.min(Math.max(z + zoomDelta, MIN_ZOOM), MAX_ZOOM));
      lastTouchDistance.current = distance;
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    lastTouchDistance.current = null;
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("mousedown", onDown);
    el.addEventListener("touchstart", handleTouchStart, { passive: false });
    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    el.addEventListener("touchend", handleTouchEnd);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);

    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("mousedown", onDown);
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [onWheel, onDown, onMove, handleTouchStart, handleTouchMove, handleTouchEnd]);

  const zoomIn = () => setZoom((z) => Math.min(z * 1.2, MAX_ZOOM));
  const zoomOut = () => setZoom((z) => Math.max(z / 1.2, MIN_ZOOM));
  const reset = () => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  };

  return { containerRef, zoom, panOffset, isPanning, zoomIn, zoomOut, reset };
}
