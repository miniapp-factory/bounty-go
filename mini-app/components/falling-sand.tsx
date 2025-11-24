"use client";

import { useEffect, useRef } from "react";

export default function FallingSand() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cols = 120;
    const rows = 80;
    const grid: number[][] = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => 0)
    );

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    let dragging = false;

    const getCell = (x: number, y: number) => {
      if (x < 0 || x >= cols || y < 0 || y >= rows) return 1;
      return grid[y][x];
    };

    const setCell = (x: number, y: number, val: number) => {
      if (x < 0 || x >= cols || y < 0 || y >= rows) return;
      grid[y][x] = val;
    };

    const mouseMove = (e: MouseEvent) => {
      if (!dragging) return;
      const rect = canvas.getBoundingClientRect();
      const x = Math.floor(((e.clientX - rect.left) / canvas.width) * cols);
      const y = Math.floor(((e.clientY - rect.top) / canvas.height) * rows);
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          setCell(x + dx, y + dy, 1);
        }
      }
    };

    const mouseDown = () => (dragging = true);
    const mouseUp = () => (dragging = false);

    canvas.addEventListener("mousedown", mouseDown);
    canvas.addEventListener("mouseup", mouseUp);
    canvas.addEventListener("mousemove", mouseMove);

    const animate = () => {

      for (let y = rows - 1; y >= 0; y--) {
        for (let x = 0; x < cols; x++) {
          if (grid[y][x] !== 1) continue;

          // Strict boundary check for gravity
          if (y + 1 < rows && getCell(x, y + 1) === 0) {
            setCell(x, y + 1, 1);
            setCell(x, y, 0);
          } else {
            const leftEmpty = getCell(x - 1, y + 1) === 0;
            const rightEmpty = getCell(x + 1, y + 1) === 0;
            if (leftEmpty || rightEmpty) {
              // Randomly pick side to try first
              const tryLeftFirst = Math.random() < 0.5;
              if (tryLeftFirst) {
                if (leftEmpty) {
                  setCell(x - 1, y + 1, 1);
                  setCell(x, y, 0);
                } else if (rightEmpty) {
                  setCell(x + 1, y + 1, 1);
                  setCell(x, y, 0);
                }
              } else {
                if (rightEmpty) {
                  setCell(x + 1, y + 1, 1);
                  setCell(x, y, 0);
                } else if (leftEmpty) {
                  setCell(x - 1, y + 1, 1);
                  setCell(x, y, 0);
                }
              }
            }
          }
        }
      }

      // Render
      const cellWidth = canvas.width / cols;
      const cellHeight = canvas.height / rows;
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#f0e68c";
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          if (grid[y][x] === 1) {
            ctx.fillRect(
              x * cellWidth,
              y * cellHeight,
              cellWidth,
              cellHeight
            );
          }
        }
      }

      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousedown", mouseDown);
      canvas.removeEventListener("mouseup", mouseUp);
      canvas.removeEventListener("mousemove", mouseMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0" />;
}
