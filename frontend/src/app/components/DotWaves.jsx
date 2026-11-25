'use client'
import { useEffect, useRef } from 'react';

// Animated background: a grid of white dots that rise and fall like moving dunes.
// Use it inside any parent that has "relative" and a size, for example:
//   <div className="relative min-h-screen"> <DotWaves /> ...your content... </div>

const COLS = 120; // dots per row (left to right)
const ROWS = 70;  // number of rows (horizon to bottom of the screen)

export default function DotWaves({ className = "" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2); // sharper dots on retina screens
    // true if the person turned on "reduce motion" in their device settings
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = 0;
    let height = 0;
    let frameId = 0;

    // The height of the terrain at one spot. We add a few sine waves together,
    // which gives the bumpy, rolling look. u = position left to right (0 to 1),
    // r = row number, t = time in seconds (this is what makes it move).
    const terrainHeight = (u, r, t) => {
      const a = Math.sin(u * 9 + r * 0.09 + t * 0.7);
      const b = Math.sin(u * 4 - r * 0.15 + t * 0.5);
      const c = Math.cos(u * 15 + r * 0.05 - t * 0.9) * 0.35;
      return a * 0.5 + b * 0.8 + c; // roughly between -1.65 and 1.65
    };

    const draw = (time) => {
      const t = time * 0.001; // milliseconds -> seconds

      // 1. Paint the black background
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, width, height);

      const horizon = height * 0.3; // the far edge of the terrain (black sky above)
      ctx.fillStyle = '#fff';

      // 2. Draw every row of dots, from far away (top) to close up (bottom)
      for (let r = 0; r < ROWS; r++) {
        const depth = r / (ROWS - 1); // 0 = far away, 1 = close to us

        // Rows are squeezed together near the horizon and spread out near us.
        // This is what gives the picture its 3D depth.
        const rowY = horizon + Math.pow(depth, 1.8) * (height - horizon) * 1.05;

        const near = 0.25 + depth * 0.75;   // 0.25 (far) to 1 (near)
        const amplitude = height * 0.12 * near; // how tall the waves are in pixels
        const dotSize = 0.6 + depth * 1.6;  // far dots are tiny, near dots bigger

        for (let c = 0; c < COLS; c++) {
          const u = c / (COLS - 1); // 0 to 1 across the screen
          const x = (u - 0.5) * width * 1.25 + width / 2;

          const h = terrainHeight(u, r, t);
          const y = rowY - h * amplitude; // higher terrain = dot drawn higher up

          // Skip dots that are outside the screen
          if (x < 0 || x > width || y < 0 || y > height) continue;

          // Crests (high spots) are brighter, hollows are darker,
          // and dots fade out as they get further away.
          const shade = (h + 1.65) / 3.3; // 0 to 1
          ctx.globalAlpha = (0.15 + 0.85 * shade) * (0.25 + 0.75 * depth);

          ctx.fillRect(x, y, dotSize, dotSize);
        }
      }
    };

    // Match the canvas size to its box on the page
    const resize = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (reduceMotion) draw(2000); // static picture, no animation
    };

    // The animation loop: draw a frame, then ask the browser to call us again
    const loop = (time) => {
      draw(time);
      frameId = requestAnimationFrame(loop);
    };

    resize();
    window.addEventListener('resize', resize);
    if (!reduceMotion) frameId = requestAnimationFrame(loop);

    // Cleanup: stop the animation when the user leaves the page
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className={`absolute inset-0 w-full h-full ${className}`} />;
}

