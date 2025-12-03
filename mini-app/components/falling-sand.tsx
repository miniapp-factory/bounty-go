"use client";


export default function FallingSand() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<number>(1);
  const selectedMaterialRef = useRef<number>(selectedMaterial);
  const [brushSize, setBrushSize] = useState<number>(1);
  const animationRef = useRef<number | null>(null);
  const brushSizeRef = useRef<number>(1);
  const gridRef = useRef<number[][]>([]);
  const setCellRef = useRef<(x: number, y: number, val: number) => void | null>(null);
  const rowsRef = useRef<number>(0);
  const colsRef = useRef<number>(0);

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
    rowsRef.current = rows;
    colsRef.current = cols;

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
    setCellRef.current = setCell;
    gridRef.current = grid;
    for (let y = rows - 5; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        grid[y][x] = 3;
      }
    }
    let frameCount = 0;

    const mouseMove = (e: MouseEvent) => {
      if (!dragging) return;
      const rect = canvas.getBoundingClientRect();
      const x = Math.floor(((e.clientX - rect.left) / canvas.width) * cols);
      const y = Math.floor(((e.clientY - rect.top) / canvas.height) * rows);
      for (let dy = -brushSizeRef.current; dy <= brushSizeRef.current; dy++) {
        for (let dx = -brushSizeRef.current; dx <= brushSizeRef.current; dx++) {
          if (dx * dx + dy * dy <= brushSizeRef.current * brushSizeRef.current) {
            setCell(x + dx, y + dy, selectedMaterialRef.current);
          }
        }
      }
    };

    const mouseDown = () => (dragging = true);
    const mouseUp = () => (dragging = false);

    canvas.addEventListener("mousedown", mouseDown);
    canvas.addEventListener("mouseup", mouseUp);
    canvas.addEventListener("mousemove", mouseMove);

    const animate = () => {
      const hasMoved: boolean[][] = Array.from({ length: rows }, () => Array(cols).fill(false));
      for (let y = rows - 1; y >= 0; y--) {
        const xStart = frameCount % 2 === 0 ? 0 : cols - 1;
        const xEnd = frameCount % 2 === 0 ? cols : -1;
        const xStep = frameCount % 2 === 0 ? 1 : -1;
        for (let x = xStart; x !== xEnd; x += xStep) {
          if (grid[y][x] === 0 || hasMoved[y][x]) continue;
          const cell = grid[y][x];
          if (cell === 1) {
            // Sand logic
            if (y + 1 >= rows) continue;
            const below = grid[y + 1][x];
            if (below === 0) {
              grid[y + 1][x] = 1;
              grid[y][x] = 0;
              hasMoved[y + 1][x] = true;
            } else if (below === 2) {
              grid[y + 1][x] = 1;
              grid[y][x] = 2;
              hasMoved[y + 1][x] = true;
              hasMoved[y][x] = true;
            } else {
              const leftBelow = x > 0 ? grid[y + 1][x - 1] : 1;
              const rightBelow = x < cols - 1 ? grid[y + 1][x + 1] : 1;
              if (leftBelow === 0 || leftBelow === 2 || leftBelow === 6 || rightBelow === 0 || rightBelow === 2 || rightBelow === 6) {
                const tryLeftFirst = Math.random() < 0.5;
                if (tryLeftFirst) {
                  if (leftBelow === 0) {
                    grid[y + 1][x - 1] = 1;
                    grid[y][x] = 0;
                    hasMoved[y + 1][x - 1] = true;
                  } else if (leftBelow === 2) {
                    grid[y + 1][x - 1] = 1;
                    grid[y][x] = 2;
                    hasMoved[y + 1][x - 1] = true;
                    hasMoved[y][x] = true;
                  } else if (leftBelow === 6) {
                    grid[y + 1][x - 1] = 1;
                    grid[y][x] = 6;
                    hasMoved[y + 1][x - 1] = true;
                    hasMoved[y][x] = true;
                  } else if (rightBelow === 0) {
                    grid[y + 1][x + 1] = 1;
                    grid[y][x] = 0;
                    hasMoved[y + 1][x + 1] = true;
                  } else if (rightBelow === 2) {
                    grid[y + 1][x + 1] = 1;
                    grid[y][x] = 2;
                    hasMoved[y + 1][x + 1] = true;
                    hasMoved[y][x] = true;
                  } else if (rightBelow === 6) {
                    grid[y + 1][x + 1] = 1;
                    grid[y][x] = 6;
                    hasMoved[y + 1][x + 1] = true;
                    hasMoved[y][x] = true;
                  }
                } else {
                  if (rightBelow === 0) {
                    grid[y + 1][x + 1] = 1;
                    grid[y][x] = 0;
                    hasMoved[y + 1][x + 1] = true;
                  } else if (rightBelow === 2) {
                    grid[y + 1][x + 1] = 1;
                    grid[y][x] = 2;
                    hasMoved[y + 1][x + 1] = true;
                    hasMoved[y][x] = true;
                  } else if (leftBelow === 0) {
                    grid[y + 1][x - 1] = 1;
                    grid[y][x] = 0;
                    hasMoved[y + 1][x - 1] = true;
                  } else if (leftBelow === 2) {
                    grid[y + 1][x - 1] = 1;
                    grid[y][x] = 2;
                    hasMoved[y + 1][x - 1] = true;
                    hasMoved[y][x] = true;
                  }
                }
              }
            }
          } else if (cell === 2) {
            // Water logic
            if (y + 1 < rows && grid[y + 1][x] === 0) {
              grid[y + 1][x] = 2;
              grid[y][x] = 0;
              hasMoved[y + 1][x] = true;
            } else {
              const leftEmpty = x > 0 && grid[y][x - 1] === 0;
              const rightEmpty = x < cols - 1 && grid[y][x + 1] === 0;
              if (leftEmpty || rightEmpty) {
                const tryLeftFirst = Math.random() < 0.5;
                if (tryLeftFirst) {
                  if (leftEmpty) {
                    grid[y][x - 1] = 2;
                    grid[y][x] = 0;
                    hasMoved[y][x - 1] = true;
                  } else if (rightEmpty) {
                    grid[y][x + 1] = 2;
                    grid[y][x] = 0;
                    hasMoved[y][x + 1] = true;
                  } else if (grid[y][x - 1] === 6) {
                    grid[y][x - 1] = 2;
                    grid[y][x] = 6;
                    hasMoved[y][x - 1] = true;
                    hasMoved[y][x] = true;
                  } else if (grid[y][x + 1] === 6) {
                    grid[y][x + 1] = 2;
                    grid[y][x] = 6;
                    hasMoved[y][x + 1] = true;
                    hasMoved[y][x] = true;
                  }
                } else {
                  if (rightEmpty) {
                    grid[y][x + 1] = 2;
                    grid[y][x] = 0;
                    hasMoved[y][x + 1] = true;
                  } else if (leftEmpty) {
                    grid[y][x - 1] = 2;
                    grid[y][x] = 0;
                    hasMoved[y][x - 1] = true;
                  }
                }
              }
            }
          } else if (cell === 3) {
            // Stone: static, nothing to do
            continue;
          } else if (cell === 4) {
            // Wood: static, can be burned by fire
            for (let dy = -1; dy <= 1; dy++) {
              for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                const nx = x + dx, ny = y + dy;
                if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) continue;
                if ((grid[ny][nx] === 5 || grid[ny][nx] === 8) && !hasMoved[ny][nx]) {
                  grid[y][x] = 5;
                  hasMoved[y][x] = true;
                  hasMoved[ny][nx] = true;
                  break;
                }
              }
              if (grid[y][x] === 5) break;
            }
          } else if (cell === 5) {
            // Fire logic
            let extinguished = false;
            for (let dy = -1; dy <= 1; dy++) {
              for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                const nx = x + dx, ny = y + dy;
                if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) continue;
                if (grid[ny][nx] === 2 && !hasMoved[ny][nx]) {
                  grid[y][x] = 6;
                  grid[ny][nx] = 0;
                  hasMoved[y][x] = true;
                  hasMoved[ny][nx] = true;
                  extinguished = true;
                  break;
                }
              }
              if (extinguished) break;
            }
            if (extinguished) continue;
            let combusted = false;
            for (let dy = -1; dy <= 1; dy++) {
              for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                const nx = x + dx, ny = y + dy;
                if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) continue;
                if ((grid[ny][nx] === 4 || grid[ny][nx] === 8) && !hasMoved[ny][nx]) {
                  grid[ny][nx] = 5;
                  hasMoved[ny][nx] = true;
                  combusted = true;
                  break;
                }
              }
              if (combusted) break;
            }
            if (combusted) continue;
            if (Math.random() < 0.05) {
              grid[y][x] = 6;
              hasMoved[y][x] = true;
            }
          } else if (cell === 6) {
            if (Math.random() < 0.015) { grid[y][x] = 0; hasMoved[y][x] = true; continue; }
            // Smoke logic: rise
            if (y > 0 && !hasMoved[y-1][x]) {
              const above = grid[y-1][x];
              if (above === 0 || above === 1 || above === 2) {
                grid[y-1][x] = 6;
                grid[y][x] = above;
                hasMoved[y-1][x] = true;
                hasMoved[y][x] = true;
              }
            }
          } else if (cell === 7) {
            // Acid logic
            if (y + 1 >= rows) continue;
            // Gravity
            if (!hasMoved[y + 1][x] && grid[y + 1][x] === 0) {
              grid[y + 1][x] = 7;
              grid[y][x] = 0;
              hasMoved[y + 1][x] = true;
              hasMoved[y][x] = true;
              continue;
            }
            // Slopes
            const diagOrder = Math.random() < 0.5 ? [{ dx: -1 }, { dx: 1 }] : [{ dx: 1 }, { dx: -1 }];
            let moved = false;
            for (const { dx } of diagOrder) {
              const nx = x + dx;
              if (nx < 0 || nx >= cols) continue;
              if (!hasMoved[y + 1][nx] && grid[y + 1][nx] === 0) {
                grid[y + 1][nx] = 7;
                grid[y][x] = 0;
                hasMoved[y + 1][nx] = true;
                hasMoved[y][x] = true;
                moved = true;
                break;
              }
            }
            if (moved) continue;
            // Viscous Spread
            if (Math.random() < 0.1) {
              const sideOrder = Math.random() < 0.5 ? [-1, 1] : [1, -1];
              for (const dx of sideOrder) {
                const nx = x + dx;
                if (nx < 0 || nx >= cols) continue;
                if (!hasMoved[y][nx] && grid[y][nx] === 0) {
                  grid[y][nx] = 7;
                  grid[y][x] = 0;
                  hasMoved[y][nx] = true;
                  hasMoved[y][x] = true;
                  moved = true;
                  break;
                }
              }
            }
            if (moved) continue;
            if (Math.random() < 0.4) {
              // corrosion
              for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                  if (dx === 0 && dy === 0) continue;
                  const nx = x + dx, ny = y + dy;
                  if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) continue;
                  const target = grid[ny][nx];
                  if ((target === 1 || target === 8) && !hasMoved[ny][nx]) {
                    grid[y][x] = 0;
                    grid[ny][nx] = 0;
                    hasMoved[y][x] = true;
                    hasMoved[ny][nx] = true;
                    break;
                  }
                }
                if (grid[y][x] === 0) break;
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

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const cell = grid[y][x];
          if (cell === 1) ctx.fillStyle = "#ffae00";
          else if (cell === 2) ctx.fillStyle = "#00ffff";
          else if (cell === 3) ctx.fillStyle = "#808080";
          else if (cell === 4) ctx.fillStyle = "#8b4513";
          else if (cell === 5) ctx.fillStyle = Math.random() < 0.5 ? "#ff4500" : "#ff8c00";
          else if (cell === 6) ctx.fillStyle = "#555555";
          else if (cell === 7) ctx.fillStyle = "#32CD32";
          else if (cell === 8) ctx.fillStyle = "#333333";
          else continue;
          ctx.fillRect(
            x * cellWidth,
            y * cellHeight,
            cellWidth,
            cellHeight
          );
        }
      }

      frameCount++;
      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousedown", mouseDown);
      canvas.removeEventListener("mouseup", mouseUp);
      canvas.removeEventListener("mousemove", mouseMove);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);  // removed dependency on selectedMaterial

  useEffect(() => {
    selectedMaterialRef.current = selectedMaterial;
  }, [selectedMaterial]);  // keep ref in sync with selectedMaterial

  useEffect(() => {
    brushSizeRef.current = brushSize;
  }, [brushSize]);  // sync brushSize to ref

function loadScenario(type: string) {
  if (!gridRef.current || !setCellRef.current) return;
  const grid = gridRef.current;
  const setCell = setCellRef.current;
  const rows = rowsRef.current;
  const cols = colsRef.current;
  // clear grid
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      setCell(x, y, 0);
    }
  }
  if (type === 'Volcano') {
    const center = Math.floor(cols / 2);
    const maxHeight = Math.floor(rows * 0.4);
    // compute center column height
    const centerHeight = Math.floor(Math.random() * 5) + maxHeight;
    for (let x = 0; x < cols; x++) {
      const height = Math.floor(Math.random() * 5) + Math.floor((1 - Math.abs(x - center) / (cols / 2)) * maxHeight);
      for (let y = rows - 1; y >= rows - height; y--) {
        setCell(x, y, 3);
      }
      // magma pockets
      if (Math.random() < 0.1) {
        const pocketHeight = Math.floor(Math.random() * 3) + 1;
        for (let y = 0; y < pocketHeight; y++) {
          const pocketY = rows - Math.floor(Math.random() * height) - 1;
          setCell(x, pocketY, 5);
        }
      }
    }
    // center pipe fire, 4 tiles wide
    for (let offset = -1; offset <= 2; offset++) {
      for (let y = rows - 1; y >= rows - centerHeight; y--) {
        setCell(center + offset, y, 5);
      }
    }
  } else if (type === 'Hazard') {
    // U‑shaped cup made of Stone walls (left/right) floating in the air
    const cupHeight = Math.floor(rows * 0.2);
    const cupWidth = Math.floor(cols * 0.3);
    const startX = Math.floor((cols - cupWidth) / 2);
    const startY = Math.floor(rows * 0.4);
    // left and right walls
    for (let y = startY; y < startY + cupHeight; y++) {
      setCell(startX, y, 3); // left wall
      setCell(startX + cupWidth - 1, y, 3); // right wall
    }
    // wood floor bridging the walls
    for (let x = startX + 1; x < startX + cupWidth - 1; x++) {
      setCell(x, startY + cupHeight, 4);
    }
    // fill the cup with Acid
    for (let y = startY + 1; y < startY + cupHeight; y++) {
      for (let x = startX + 1; x < startX + cupWidth - 1; x++) {
        setCell(x, y, 7);
      }
    }
    // Garden at the bottom: stone floor + water + plants
    const gardenFloorY = rows - 5;
    for (let x = 0; x < cols; x++) {
      setCell(x, gardenFloorY, 3); // stone floor
    }
    // water pool
    const waterStartX = Math.floor(cols * 0.3);
    const waterEndX = Math.floor(cols * 0.7);
    for (let x = waterStartX; x < waterEndX; x++) {
      setCell(x, gardenFloorY - 1, 2); // water
    }
    // plants on the banks
    for (let y = gardenFloorY - 2; y >= gardenFloorY - 6; y--) {
      const width = (gardenFloorY - y) * 2 + 1;
      const startX = Math.floor((cols - width) / 2);
      for (let x = startX; x < startX + width; x++) {
        setCell(x, y, 8);
      }
    }
  } else if (type === 'Splash') {
    // Pool (Bottom): large stone basin
    const basinStart = rows - 20;
    for (let y = basinStart; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        setCell(x, y, 3); // stone
      }
    }
    // Fill basin with water
    for (let y = basinStart; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        setCell(x, y, 2); // water
      }
    }
    // Drop (Top): 20x20 block of sand at top center
    const dropSize = 20;
    const dropStartX = Math.floor((cols - dropSize) / 2);
    const dropStartY = 10;
    for (let y = dropStartY; y < dropStartY + dropSize; y++) {
      for (let x = dropStartX; x < dropStartX + dropSize; x++) {
        setCell(x, y, 1); // sand
      }
    }
  } else if (type === 'Fuse') {
    // Bomb: large stone box at bottom-right filled with gunpowder
    const bombSize = 10;
    const bombStartX = cols - bombSize;
    const bombStartY = rows - bombSize;
    for (let y = bombStartY; y < rows; y++) {
      for (let x = bombStartX; x < cols; x++) {
        if (y === bombStartY || y === rows - 1 || x === bombStartX || x === cols - 1) {
          setCell(x, y, 3); // stone walls
        } else {
          setCell(x, y, 8); // gunpowder inside
        }
      }
    }
    // Fuse: thin winding line of gunpowder from bomb to top-left
    // Left across floor
    for (let x = bombStartX - 1; x >= 0; x--) {
      setCell(x, rows - 1, 8);
    }
    // Up left wall
    for (let y = rows - 2; y >= 0; y--) {
      setCell(0, y, 8);
    }
    // Small wood platform at top-left
    setCell(0, 0, 4);
  }
  }
return (
    <>
      <div className="toolbar fixed top-4 left-1/2 transform -translate-x-1/2 flex space-x-2 bg-white/20 backdrop-blur-md z-50 p-2 rounded-md">
        <button
          className={`btn ${selectedMaterial === 1 ? 'selected' : ''}`}
          onClick={() => setSelectedMaterial(1)}
          style={{ backgroundColor: selectedMaterial === 1 ? '#ffae00' : '' }}
        >
          Sand
        </button>
        <button
          className={`btn ${selectedMaterial === 2 ? 'selected' : ''}`}
          onClick={() => setSelectedMaterial(2)}
          style={{ backgroundColor: selectedMaterial === 2 ? '#ffae00' : '' }}
        >
          Water
        </button>
        <button
          className={`btn ${selectedMaterial === 3 ? 'selected' : ''}`}
          onClick={() => setSelectedMaterial(3)}
          style={{ backgroundColor: selectedMaterial === 3 ? '#ffae00' : '' }}
        >
          Stone
        </button>
        <button
          className={`btn ${selectedMaterial === 0 ? 'selected' : ''}`}
          onClick={() => setSelectedMaterial(0)}
          style={{ backgroundColor: selectedMaterial === 0 ? '#ffae00' : '' }}
        >
          Eraser
        </button>
        <button
          className={`btn ${selectedMaterial === 4 ? 'selected' : ''}`}
          onClick={() => setSelectedMaterial(4)}
          style={{ backgroundColor: selectedMaterial === 4 ? '#8B4513' : '' }}
        >
          Wood
        </button>
        <button
          className={`btn ${selectedMaterial === 5 ? 'selected' : ''}`}
          onClick={() => setSelectedMaterial(5)}
          style={{ backgroundColor: selectedMaterial === 5 ? '#FF4500' : '' }}
        >
          Fire
        </button>
        <button
          className={`btn ${selectedMaterial === 6 ? 'selected' : ''}`}
          onClick={() => setSelectedMaterial(6)}
          style={{ backgroundColor: selectedMaterial === 6 ? '#696969' : '' }}
        >
          Smoke
        </button>
        <button
          className={`btn ${selectedMaterial === 7 ? 'selected' : ''}`}
          onClick={() => setSelectedMaterial(7)}
          style={{ backgroundColor: selectedMaterial === 7 ? '#00FF00' : '' }}
        >
          Acid
        </button>
        <button
          className={`btn ${selectedMaterial === 8 ? 'selected' : ''}`}
          onClick={() => setSelectedMaterial(8)}
          style={{ backgroundColor: selectedMaterial === 8 ? '#333333' : '' }}
        >
          Gunpowder
        </button>
        <input
          type="range"
          min="1"
          max="5"
          value={brushSize}
          onChange={e => setBrushSize(Number(e.target.value))}
          className="slider"
        />
      </div>
      <div className="scenario-toolbar fixed top-12 left-1/2 transform -translate-x-1/2 flex space-x-2 bg-white/20 backdrop-blur-md z-50 p-2 rounded-md">
        <button className="btn" style={{backgroundColor:'#ff4500'}} onClick={() => loadScenario('Volcano')}>Volcano</button>
        <button className="btn" style={{backgroundColor:'#8b4513'}} onClick={() => loadScenario('Hazard')}>Hazard</button>
        <button className="btn" style={{backgroundColor:'#228B22'}} onClick={() => loadScenario('Splash')}>Splash</button>
        <button className="btn" style={{backgroundColor:'#9370DB'}} onClick={() => loadScenario('Fuse')}>Fuse</button>
      </div>
      <button
        className="btn"
        onClick={() => {
          if (gridRef.current && setCellRef.current) {
            for (let y = 0; y < rowsRef.current; y++) {
              for (let x = 0; x < colsRef.current; x++) {
                setCellRef.current(x, y, 0);
              }
            }
          }
        }}
      >
        Clear
      </button>
      <canvas ref={canvasRef} className="fixed inset-0" />
    </>
  );
}

import { useEffect, useRef, useState } from "react";

export default function FallingSand() {
  const canvasRef = useRef<HTMLCanvasElement>(null); const [selectedMaterial, setSelectedMaterial] = useState<number>(1); const selectedMaterialRef = useRef<number>(selectedMaterial); const [brushSize, setBrushSize] = useState<number>(1); const animationRef = useRef<number | null>(null);
  const brushSizeRef = useRef<number>(1);
  const gridRef = useRef<number[][]>([]);
  const setCellRef = useRef<(x: number, y: number, val: number) => void | null>(null);
  const rowsRef = useRef<number>(0);
  const colsRef = useRef<number>(0);

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
    rowsRef.current = rows;
    colsRef.current = cols;

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
    setCellRef.current = setCell;
    gridRef.current = grid;
    for (let y = rows - 5; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        grid[y][x] = 3;
      }
    }
    let frameCount = 0;

    const mouseMove = (e: MouseEvent) => {
      if (!dragging) return;
      const rect = canvas.getBoundingClientRect();
      const x = Math.floor(((e.clientX - rect.left) / canvas.width) * cols);
      const y = Math.floor(((e.clientY - rect.top) / canvas.height) * rows);
      for (let dy = -brushSizeRef.current; dy <= brushSizeRef.current; dy++) {
        for (let dx = -brushSizeRef.current; dx <= brushSizeRef.current; dx++) {
          if (dx * dx + dy * dy <= brushSizeRef.current * brushSizeRef.current) {
            setCell(x + dx, y + dy, selectedMaterialRef.current);
          }
        }
      }
    };

    const mouseDown = () => (dragging = true);
    const mouseUp = () => (dragging = false);

    canvas.addEventListener("mousedown", mouseDown);
    canvas.addEventListener("mouseup", mouseUp);
    canvas.addEventListener("mousemove", mouseMove);

    const animate = () => {
      const hasMoved: boolean[][] = Array.from({ length: rows }, () => Array(cols).fill(false));
      for (let y = rows - 1; y >= 0; y--) {
        const xStart = frameCount % 2 === 0 ? 0 : cols - 1;
        const xEnd = frameCount % 2 === 0 ? cols : -1;
        const xStep = frameCount % 2 === 0 ? 1 : -1;
        for (let x = xStart; x !== xEnd; x += xStep) {
          if (grid[y][x] === 0 || hasMoved[y][x]) continue;
          const cell = grid[y][x];
          if (cell === 1) {
            // Sand logic
            if (y + 1 >= rows) continue;  // prevent out‑of‑bounds access
            const below = grid[y + 1][x];
            if (below === 0) {
              grid[y + 1][x] = 1;
              grid[y][x] = 0;
              hasMoved[y + 1][x] = true;
            } else if (below === 2) {
              grid[y + 1][x] = 1;
              grid[y][x] = 2;
              hasMoved[y + 1][x] = true;
              hasMoved[y][x] = true;
            } else {
              const leftBelow = x > 0 ? grid[y + 1][x - 1] : 1;
              const rightBelow = x < cols - 1 ? grid[y + 1][x + 1] : 1;
              if (leftBelow === 0 || leftBelow === 2 || leftBelow === 6 || rightBelow === 0 || rightBelow === 2 || rightBelow === 6) {
                const tryLeftFirst = Math.random() < 0.5;
                if (tryLeftFirst) {
                  if (leftBelow === 0) {
                    grid[y + 1][x - 1] = 1;
                    grid[y][x] = 0;
                    hasMoved[y + 1][x - 1] = true;
                  } else if (leftBelow === 2) {
                    grid[y + 1][x - 1] = 1;
                    grid[y][x] = 2;
                    hasMoved[y + 1][x - 1] = true;
                    hasMoved[y][x] = true;
                  } else if (leftBelow === 6) {
                    grid[y + 1][x - 1] = 1;
                    grid[y][x] = 6;
                    hasMoved[y + 1][x - 1] = true;
                    hasMoved[y][x] = true;
                  } else if (rightBelow === 0) {
                    grid[y + 1][x + 1] = 1;
                    grid[y][x] = 0;
                    hasMoved[y + 1][x + 1] = true;
                  } else if (rightBelow === 2) {
                    grid[y + 1][x + 1] = 1;
                    grid[y][x] = 2;
                    hasMoved[y + 1][x + 1] = true;
                    hasMoved[y][x] = true;
                  } else if (rightBelow === 6) {
                    grid[y + 1][x + 1] = 1;
                    grid[y][x] = 6;
                    hasMoved[y + 1][x + 1] = true;
                    hasMoved[y][x] = true;
                  }
                } else {
                  if (rightBelow === 0) {
                    grid[y + 1][x + 1] = 1;
                    grid[y][x] = 0;
                    hasMoved[y + 1][x + 1] = true;
                  } else if (rightBelow === 2) {
                    grid[y + 1][x + 1] = 1;
                    grid[y][x] = 2;
                    hasMoved[y + 1][x + 1] = true;
                    hasMoved[y][x] = true;
                  } else if (leftBelow === 0) {
                    grid[y + 1][x - 1] = 1;
                    grid[y][x] = 0;
                    hasMoved[y + 1][x - 1] = true;
                  } else if (leftBelow === 2) {
                    grid[y + 1][x - 1] = 1;
                    grid[y][x] = 2;
                    hasMoved[y + 1][x - 1] = true;
                    hasMoved[y][x] = true;
                  }
                }
              }
            }
          } else if (cell === 2) {
            // Water logic
            if (y + 1 < rows && grid[y + 1][x] === 0) {
              grid[y + 1][x] = 2;
              grid[y][x] = 0;
              hasMoved[y + 1][x] = true;
            } else {
              const leftEmpty = x > 0 && grid[y][x - 1] === 0;
              const rightEmpty = x < cols - 1 && grid[y][x + 1] === 0;
              if (leftEmpty || rightEmpty) {
                const tryLeftFirst = Math.random() < 0.5;
                if (tryLeftFirst) {
                  if (leftEmpty) {
                    grid[y][x - 1] = 2;
                    grid[y][x] = 0;
                    hasMoved[y][x - 1] = true;
                  } else if (rightEmpty) {
                    grid[y][x + 1] = 2;
                    grid[y][x] = 0;
                    hasMoved[y][x + 1] = true;
                  } else if (grid[y][x - 1] === 6) {
                    grid[y][x - 1] = 2;
                    grid[y][x] = 6;
                    hasMoved[y][x - 1] = true;
                    hasMoved[y][x] = true;
                  } else if (grid[y][x + 1] === 6) {
                    grid[y][x + 1] = 2;
                    grid[y][x] = 6;
                    hasMoved[y][x + 1] = true;
                    hasMoved[y][x] = true;
                  }
                } else {
                  if (rightEmpty) {
                    grid[y][x + 1] = 2;
                    grid[y][x] = 0;
                    hasMoved[y][x + 1] = true;
                  } else if (leftEmpty) {
                    grid[y][x - 1] = 2;
                    grid[y][x] = 0;
                    hasMoved[y][x - 1] = true;
                  }
                }
              }
            }
          } else if (cell === 3) {
            // Stone: static, nothing to do
            continue;
          } else if (cell === 4) {
            // Wood: static, can be burned by fire
            for (let dy = -1; dy <= 1; dy++) {
              for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                const nx = x + dx, ny = y + dy;
                if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) continue;
                if ((grid[ny][nx] === 5 || grid[ny][nx] === 8) && !hasMoved[ny][nx]) {
                  grid[y][x] = 5;
                  hasMoved[y][x] = true;
                  hasMoved[ny][nx] = true;
                  break;
                }
              }
              if (grid[y][x] === 5) break;
            }
          } else if (cell === 5) {
            // Fire logic
            let extinguished = false;
            for (let dy = -1; dy <= 1; dy++) {
              for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                const nx = x + dx, ny = y + dy;
                if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) continue;
                if (grid[ny][nx] === 2 && !hasMoved[ny][nx]) {
                  grid[y][x] = 6;
                  grid[ny][nx] = 0;
                  hasMoved[y][x] = true;
                  hasMoved[ny][nx] = true;
                  extinguished = true;
                  break;
                }
              }
              if (extinguished) break;
            }
            if (extinguished) continue;
            let combusted = false;
            for (let dy = -1; dy <= 1; dy++) {
              for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                const nx = x + dx, ny = y + dy;
                if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) continue;
                if ((grid[ny][nx] === 4 || grid[ny][nx] === 8) && !hasMoved[ny][nx]) {
                  grid[ny][nx] = 5;
                  hasMoved[ny][nx] = true;
                  combusted = true;
                  break;
                }
              }
              if (combusted) break;
            }
            if (combusted) continue;
            if (Math.random() < 0.05) {
              grid[y][x] = 6;
              hasMoved[y][x] = true;
            }
          } else if (cell === 6) {
            if (Math.random() < 0.015) { grid[y][x] = 0; hasMoved[y][x] = true; continue; }
            // Smoke logic: rise
            if (y > 0 && !hasMoved[y-1][x]) {
              const above = grid[y-1][x];
              if (above === 0 || above === 1 || above === 2) {
                grid[y-1][x] = 6;
                grid[y][x] = above;
                hasMoved[y-1][x] = true;
                hasMoved[y][x] = true;
              }
            }
          } else if (cell === 7) {
            // Acid logic
            if (y + 1 >= rows) continue;
            // Gravity
            if (!hasMoved[y + 1][x] && grid[y + 1][x] === 0) {
              grid[y + 1][x] = 7;
              grid[y][x] = 0;
              hasMoved[y + 1][x] = true;
              hasMoved[y][x] = true;
              continue;
            }
            // Slopes
            const diagOrder = Math.random() < 0.5 ? [{ dx: -1 }, { dx: 1 }] : [{ dx: 1 }, { dx: -1 }];
            let moved = false;
            for (const { dx } of diagOrder) {
              const nx = x + dx;
              if (nx < 0 || nx >= cols) continue;
              if (!hasMoved[y + 1][nx] && grid[y + 1][nx] === 0) {
                grid[y + 1][nx] = 7;
                grid[y][x] = 0;
                hasMoved[y + 1][nx] = true;
                hasMoved[y][x] = true;
                moved = true;
                break;
              }
            }
            if (moved) continue;
            // Viscous Spread
            if (Math.random() < 0.1) {
              const sideOrder = Math.random() < 0.5 ? [-1, 1] : [1, -1];
              for (const dx of sideOrder) {
                const nx = x + dx;
                if (nx < 0 || nx >= cols) continue;
                if (!hasMoved[y][nx] && grid[y][nx] === 0) {
                  grid[y][nx] = 7;
                  grid[y][x] = 0;
                  hasMoved[y][nx] = true;
                  hasMoved[y][x] = true;
                  moved = true;
                  break;
                }
              }
            }
            if (moved) continue;
            if (Math.random() < 0.4) {
              // corrosion
              for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                  if (dx === 0 && dy === 0) continue;
                  const nx = x + dx, ny = y + dy;
                  if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) continue;
                  const target = grid[ny][nx];
                  if ((target === 1 || target === 8) && !hasMoved[ny][nx]) {
                    grid[y][x] = 0;
                    grid[ny][nx] = 0;
                    hasMoved[y][x] = true;
                    hasMoved[ny][nx] = true;
                    break;
                  }
                }
                if (grid[y][x] === 0) break;
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

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const cell = grid[y][x];
          if (cell === 1) ctx.fillStyle = "#ffae00";
          else if (cell === 2) ctx.fillStyle = "#00ffff";
          else if (cell === 3) ctx.fillStyle = "#808080";
          else if (cell === 4) ctx.fillStyle = "#8b4513";
          else if (cell === 5) ctx.fillStyle = Math.random() < 0.5 ? "#ff4500" : "#ff8c00";
          else if (cell === 6) ctx.fillStyle = "#555555";
          else if (cell === 7) ctx.fillStyle = "#32CD32";
          else if (cell === 8) ctx.fillStyle = "#333333";
          else continue;
          ctx.fillRect(
            x * cellWidth,
            y * cellHeight,
            cellWidth,
            cellHeight
          );
        }
      }

      frameCount++;
      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousedown", mouseDown);
      canvas.removeEventListener("mouseup", mouseUp);
      canvas.removeEventListener("mousemove", mouseMove);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);  // removed dependency on selectedMaterial

  useEffect(() => {
    selectedMaterialRef.current = selectedMaterial;
  }, [selectedMaterial]);  // keep ref in sync with selectedMaterial

  useEffect(() => {
    brushSizeRef.current = brushSize;
  }, [brushSize]);  // sync brushSize to ref

function loadScenario(type: string) {
  if (!gridRef.current || !setCellRef.current) return;
  const grid = gridRef.current;
  const setCell = setCellRef.current;
  const rows = rowsRef.current;
  const cols = colsRef.current;
  // clear grid
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      setCell(x, y, 0);
    }
  }
  if (type === 'Volcano') {
    const center = Math.floor(cols / 2);
    const maxHeight = Math.floor(rows * 0.4);
    // compute center column height
    const centerHeight = Math.floor(Math.random() * 5) + maxHeight;
    for (let x = 0; x < cols; x++) {
      const height = Math.floor(Math.random() * 5) + Math.floor((1 - Math.abs(x - center) / (cols / 2)) * maxHeight);
      for (let y = rows - 1; y >= rows - height; y--) {
        setCell(x, y, 3);
      }
      // magma pockets
      if (Math.random() < 0.1) {
        const pocketHeight = Math.floor(Math.random() * 3) + 1;
        for (let y = 0; y < pocketHeight; y++) {
          const pocketY = rows - Math.floor(Math.random() * height) - 1;
          setCell(x, pocketY, 5);
        }
      }
    }
    // center pipe fire, 4 tiles wide
    for (let offset = -1; offset <= 2; offset++) {
      for (let y = rows - 1; y >= rows - centerHeight; y--) {
        setCell(center + offset, y, 5);
      }
    }
  } else if (type === 'Hazard') {
    // U‑shaped cup made of Stone walls (left/right) floating in the air
    const cupHeight = Math.floor(rows * 0.2);
    const cupWidth = Math.floor(cols * 0.3);
    const startX = Math.floor((cols - cupWidth) / 2);
    const startY = Math.floor(rows * 0.4);
    // left and right walls
    for (let y = startY; y < startY + cupHeight; y++) {
      setCell(startX, y, 3); // left wall
      setCell(startX + cupWidth - 1, y, 3); // right wall
    }
    // wood floor bridging the walls
    for (let x = startX + 1; x < startX + cupWidth - 1; x++) {
      setCell(x, startY + cupHeight, 4);
    }
    // fill the cup with Acid
    for (let y = startY + 1; y < startY + cupHeight; y++) {
      for (let x = startX + 1; x < startX + cupWidth - 1; x++) {
        setCell(x, y, 7);
      }
    }
    // Garden at the bottom: stone floor + water + plants
    const gardenFloorY = rows - 5;
    for (let x = 0; x < cols; x++) {
      setCell(x, gardenFloorY, 3); // stone floor
    }
    // water pool
    const waterStartX = Math.floor(cols * 0.3);
    const waterEndX = Math.floor(cols * 0.7);
    for (let x = waterStartX; x < waterEndX; x++) {
      setCell(x, gardenFloorY - 1, 2); // water
    }
    // plants on the banks
    for (let y = gardenFloorY - 2; y >= gardenFloorY - 6; y--) {
      const width = (gardenFloorY - y) * 2 + 1;
      const startX = Math.floor((cols - width) / 2);
      for (let x = startX; x < startX + width; x++) {
        setCell(x, y, 8);
      }
    }
  } else if (type === 'Splash') {
    // Pool (Bottom): large stone basin
    const basinStart = rows - 20;
    for (let y = basinStart; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        setCell(x, y, 3); // stone
      }
    }
    // Fill basin with water
    for (let y = basinStart; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        setCell(x, y, 2); // water
      }
    }
    // Drop (Top): 20x20 block of sand at top center
    const dropSize = 20;
    const dropStartX = Math.floor((cols - dropSize) / 2);
    const dropStartY = 10;
    for (let y = dropStartY; y < dropStartY + dropSize; y++) {
      for (let x = dropStartX; x < dropStartX + dropSize; x++) {
        setCell(x, y, 1); // sand
      }
    }
  } else if (type === 'Fuse') {
    // Bomb: large stone box at bottom-right filled with gunpowder
    const bombSize = 10;
    const bombStartX = cols - bombSize;
    const bombStartY = rows - bombSize;
    for (let y = bombStartY; y < rows; y++) {
      for (let x = bombStartX; x < cols; x++) {
        if (y === bombStartY || y === rows - 1 || x === bombStartX || x === cols - 1) {
          setCell(x, y, 3); // stone walls
        } else {
          setCell(x, y, 8); // gunpowder inside
        }
      }
    }
    // Fuse: thin winding line of gunpowder from bomb to top-left
    // Left across floor
    for (let x = bombStartX - 1; x >= 0; x--) {
      setCell(x, rows - 1, 8);
    }
    // Up left wall
    for (let y = rows - 2; y >= 0; y--) {
      setCell(0, y, 8);
    }
    // Small wood platform at top-left
    setCell(0, 0, 4);
  }
  }
return (
    <>
      <div className="toolbar fixed top-4 left-1/2 transform -translate-x-1/2 flex space-x-2 bg-white/20 backdrop-blur-md z-50 p-2 rounded-md">
        <button
          className={`btn ${selectedMaterial === 1 ? 'selected' : ''}`}
          onClick={() => setSelectedMaterial(1)}
          style={{ backgroundColor: selectedMaterial === 1 ? '#ffae00' : '' }}
        >
          Sand
        </button>
        <button
          className={`btn ${selectedMaterial === 2 ? 'selected' : ''}`}
          onClick={() => setSelectedMaterial(2)}
          style={{ backgroundColor: selectedMaterial === 2 ? '#ffae00' : '' }}
        >
          Water
        </button>
        <button
          className={`btn ${selectedMaterial === 3 ? 'selected' : ''}`}
          onClick={() => setSelectedMaterial(3)}
          style={{ backgroundColor: selectedMaterial === 3 ? '#ffae00' : '' }}
        >
          Stone
        </button>
        <button
          className={`btn ${selectedMaterial === 0 ? 'selected' : ''}`}
          onClick={() => setSelectedMaterial(0)}
          style={{ backgroundColor: selectedMaterial === 0 ? '#ffae00' : '' }}
        >
          Eraser
        </button>
        <button
          className={`btn ${selectedMaterial === 4 ? 'selected' : ''}`}
          onClick={() => setSelectedMaterial(4)}
          style={{ backgroundColor: selectedMaterial === 4 ? '#8B4513' : '' }}
        >
          Wood
        </button>
        <button
          className={`btn ${selectedMaterial === 5 ? 'selected' : ''}`}
          onClick={() => setSelectedMaterial(5)}
          style={{ backgroundColor: selectedMaterial === 5 ? '#FF4500' : '' }}
        >
          Fire
        </button>
        <button
          className={`btn ${selectedMaterial === 6 ? 'selected' : ''}`}
          onClick={() => setSelectedMaterial(6)}
          style={{ backgroundColor: selectedMaterial === 6 ? '#696969' : '' }}
        >
          Smoke
        </button>
        <button
          className={`btn ${selectedMaterial === 7 ? 'selected' : ''}`}
          onClick={() => setSelectedMaterial(7)}
          style={{ backgroundColor: selectedMaterial === 7 ? '#00FF00' : '' }}
        >
          Acid
        </button>
      <button
        className={`btn ${selectedMaterial === 8 ? 'selected' : ''}`}
        onClick={() => setSelectedMaterial(8)}
        style={{ backgroundColor: selectedMaterial === 8 ? '#333333' : '' }}
      >
        Gunpowder
      </button>
      <input
        type="range"
        min="1"
        max="5"
        value={brushSize}
        onChange={e => setBrushSize(Number(e.target.value))}
        className="slider"
      />
      </div>
      <div className="scenario-toolbar fixed top-12 left-1/2 transform -translate-x-1/2 flex space-x-2 bg-white/20 backdrop-blur-md z-50 p-2 rounded-md">
        <button className="btn" style={{backgroundColor:'#ff4500'}} onClick={() => loadScenario('Volcano')}>Volcano</button>
        <button className="btn" style={{backgroundColor:'#8b4513'}} onClick={() => loadScenario('Hazard')}>Hazard</button>
        <button className="btn" style={{backgroundColor:'#228B22'}} onClick={() => loadScenario('Splash')}>Splash</button>
        <button className="btn" style={{backgroundColor:'#9370DB'}} onClick={() => loadScenario('Fuse')}>Fuse</button>
      </div>
      <button
        className="btn"
        onClick={() => {
          if (gridRef.current && setCellRef.current) {
            for (let y = 0; y < rowsRef.current; y++) {
              for (let x = 0; x < colsRef.current; x++) {
                setCellRef.current(x, y, 0);
              }
            }
          }
        }}
      >
        Clear
      </button>
      <canvas ref={canvasRef} className="fixed inset-0" />
    </>
  );
}
