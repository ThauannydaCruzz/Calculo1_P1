import React, { useEffect, useRef, useState } from 'react';
import { Canvas as FabricCanvas, Line, Circle, Text } from 'fabric';

interface GraphCanvasProps {
  expression: string;
  type: 'limit' | 'continuity' | 'sinais';
  point?: string;
  onGraphReady?: (steps: string[]) => void;
}

export default function GraphCanvas({ expression, type, point, onGraphReady }: GraphCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 600, height: 400 });

  useEffect(() => {
    const updateCanvasSize = () => {
      if (window.innerWidth < 640) { // sm breakpoint
        setCanvasSize({ width: Math.min(window.innerWidth - 32, 400), height: 300 });
      } else if (window.innerWidth < 1024) { // lg breakpoint  
        setCanvasSize({ width: Math.min(window.innerWidth - 64, 500), height: 350 });
      } else {
        setCanvasSize({ width: 600, height: 400 });
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Add a small delay to ensure DOM is fully rendered
    let createdCanvas: FabricCanvas | null = null;
    const timer = setTimeout(() => {
      if (!canvasRef.current) return;
      
      const canvas = new FabricCanvas(canvasRef.current, {
        width: canvasSize.width,
        height: canvasSize.height,
        backgroundColor: '#000000',
        selection: false,
      });

      // Ensure canvas is fully initialized
      canvas.renderAll();
      createdCanvas = canvas;
      setFabricCanvas(canvas);
    }, 100);

    return () => {
      clearTimeout(timer);
      if (createdCanvas) {
        createdCanvas.dispose();
        createdCanvas = null;
      }
    };
  }, [canvasSize]);

  useEffect(() => {
    if (!fabricCanvas || !expression) return;

    // Ensure canvas element exists before drawing
    if (!(fabricCanvas as any).lowerCanvasEl) return;

    let drawTimer: number | undefined;

    try {
      // Clear canvas safely
      fabricCanvas.clear();
      fabricCanvas.backgroundColor = '#000000';

      // Draw coordinate system
      drawCoordinateSystem(fabricCanvas);

      // Draw function based on type with animation
      drawTimer = window.setTimeout(() => {
        // Double check canvas is still valid
        if (!(fabricCanvas as any).lowerCanvasEl) return;
        
        switch (type) {
          case 'limit':
            drawLimitFunction(fabricCanvas, expression, point);
            break;
          case 'continuity':
            drawContinuityFunction(fabricCanvas, expression, point);
            break;
          case 'sinais':
            drawSinaisFunction(fabricCanvas, expression, point);
            break;
        }
        fabricCanvas.renderAll();
      }, 500);

      // Generate steps (UI side)
      generateSteps(type, expression, point);
    } catch (error) {
      console.error('Canvas operation failed:', error);
    }

    return () => {
      if (drawTimer) window.clearTimeout(drawTimer);
    };
  }, [fabricCanvas, expression, type, point]);

  const drawCoordinateSystem = (canvas: FabricCanvas) => {
    const width = canvas.width || canvasSize.width;
    const height = canvas.height || canvasSize.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const gridSpacing = Math.min(width, height) / 20; // Responsive grid spacing

    // Grid lines
    for (let i = -10; i <= 10; i++) {
      if (i === 0) continue;
      
      // Vertical grid lines
      const x = centerX + i * gridSpacing;
      if (x > 0 && x < width) {
        const vLine = new Line([x, 0, x, height], {
          stroke: '#333333',
          strokeWidth: 1,
          selectable: false,
        });
        canvas.add(vLine);
      }

      // Horizontal grid lines
      const y = centerY - i * gridSpacing;
      if (y > 0 && y < height) {
        const hLine = new Line([0, y, width, y], {
          stroke: '#333333',
          strokeWidth: 1,
          selectable: false,
        });
        canvas.add(hLine);
      }
    }

    // Axes
    const xAxis = new Line([0, centerY, width, centerY], {
      stroke: '#666666',
      strokeWidth: 2,
      selectable: false,
    });
    const yAxis = new Line([centerX, 0, centerX, height], {
      stroke: '#666666',
      strokeWidth: 2,
      selectable: false,
    });

    canvas.add(xAxis, yAxis);

    // Axis labels - responsive font size
    const fontSize = Math.max(10, Math.min(12, width / 50));
    const labelSpacing = gridSpacing * 2;
    
    for (let i = -5; i <= 5; i++) {
      if (i === 0) continue;
      
      const x = centerX + i * labelSpacing;
      const y = centerY - i * labelSpacing;
      
      if (x > 20 && x < width - 20) {
        const xLabel = new Text(i.toString(), {
          left: x - 5,
          top: centerY + 5,
          fontSize: fontSize,
          fill: '#ffffff',
          selectable: false,
        });
        canvas.add(xLabel);
      }
      
      if (y > 20 && y < height - 20) {
        const yLabel = new Text(i.toString(), {
          left: centerX + 5,
          top: y - fontSize/2,
          fontSize: fontSize,
          fill: '#ffffff',
          selectable: false,
        });
        canvas.add(yLabel);
      }
    }
  };

  const drawLimitFunction = (canvas: FabricCanvas, expr: string, pt?: string) => {
    const width = canvas.width || canvasSize.width;
    const height = canvas.height || canvasSize.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const limitPoint = parseFloat(pt || '0');
    const scale = Math.min(width, height) / 20; // Responsive scaling

    // Calculate all points first
    const allPoints: number[] = [];
    for (let x = -5; x <= 5; x += 0.1) {
      if (Math.abs(x - limitPoint) < 0.1) continue; // Discontinuity
      
      let y;
      if (expr.includes('x^2')) {
        y = (x * x - 8 * x + 15) / (x * x - 5); // Actual function from default
      } else {
        y = Math.sin(x * Math.PI / 2);
      }
      
      const canvasX = centerX + x * scale;
      const canvasY = centerY - y * scale * 0.5;
      
      if (canvasX >= 0 && canvasX <= width && 
          canvasY >= 0 && canvasY <= height &&
          !isNaN(y) && isFinite(y)) {
        allPoints.push(canvasX, canvasY);
      }
    }

    // Animate drawing the curve progressively
    if (allPoints.length >= 4) {
      const drawSegment = (index: number) => {
        if (index < allPoints.length - 2) {
          const line = new Line([allPoints[index], allPoints[index + 1], allPoints[index + 2], allPoints[index + 3]], {
            stroke: '#ffffff',
            strokeWidth: Math.max(1, Math.min(2, width / 300)),
            selectable: false,
          });
          canvas.add(line);
          canvas.renderAll();
          
          // Continue with next segment after delay
          setTimeout(() => drawSegment(index + 2), 20);
        } else {
          // Mark limit point after curve is drawn
          if (pt) {
            setTimeout(() => {
              const limitX = centerX + limitPoint * scale;
              const limitY = centerY - ((limitPoint * limitPoint - 8 * limitPoint + 15) / (limitPoint * limitPoint - 5)) * scale * 0.5;
              const radius = Math.max(3, Math.min(5, width / 120));
              
              const limitCircle = new Circle({
                left: limitX - radius,
                top: limitY - radius,
                radius: radius,
                fill: 'transparent',
                stroke: '#ff6b6b',
                strokeWidth: Math.max(2, Math.min(3, width / 200)),
                selectable: false,
              });
              canvas.add(limitCircle);
              canvas.renderAll();
            }, 300);
          }
        }
      };
      
      drawSegment(0);
    }
  };

  const drawContinuityFunction = (canvas: FabricCanvas, expr: string, pt?: string) => {
    const width = canvas.width || canvasSize.width;
    const height = canvas.height || canvasSize.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const checkPoint = parseFloat(pt || '3');
    const scale = Math.min(width, height) / 20; // Responsive scaling

    // Calculate actual function values
    const points: number[] = [];
    for (let x = -4; x <= 4; x += 0.1) {
      if (Math.abs(x * x - 5) < 0.01) continue; // Skip near singularities
      
      const y = (x * x - 8 * x + 15) / (x * x - 5);
      const canvasX = centerX + x * scale;
      const canvasY = centerY - y * scale * 0.5;
      
      if (canvasX >= 0 && canvasX <= width && 
          canvasY >= 0 && canvasY <= height &&
          !isNaN(y) && isFinite(y)) {
        points.push(canvasX, canvasY);
      }
    }

    // Animate drawing the curve
    if (points.length >= 4) {
      const drawSegment = (index: number) => {
        if (index < points.length - 2) {
          const line = new Line([points[index], points[index + 1], points[index + 2], points[index + 3]], {
            stroke: '#ffffff',
            strokeWidth: Math.max(1, Math.min(2, width / 300)),
            selectable: false,
          });
          canvas.add(line);
          canvas.renderAll();
          
          setTimeout(() => drawSegment(index + 2), 15);
        } else {
          // Mark the continuity point
          setTimeout(() => {
            const pointX = centerX + checkPoint * scale;
            const pointY = centerY - ((checkPoint * checkPoint - 8 * checkPoint + 15) / (checkPoint * checkPoint - 5)) * scale * 0.5;
            const radius = Math.max(3, Math.min(5, width / 120));

            const continuityCircle = new Circle({
              left: pointX - radius,
              top: pointY - radius,
              radius: radius,
              fill: '#4ade80',
              selectable: false,
            });
            
            canvas.add(continuityCircle);
            canvas.renderAll();
          }, 300);
        }
      };
      
      drawSegment(0);
    }
  };

  const drawSinaisFunction = (canvas: FabricCanvas, expr: string, pt?: string) => {
    const width = canvas.width || canvasSize.width;
    const height = canvas.height || canvasSize.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const scale = Math.min(width, height) / 20; // Responsive scaling

    // Calculate function values for sign study
    const points: number[] = [];
    for (let x = -4; x <= 4; x += 0.1) {
      let y;
      if (expr.includes('x^2')) {
        y = (x * x - 8 * x + 15) / (x * x - 5);
      } else {
        y = Math.sin(x * Math.PI / 2);
      }
      
      const canvasX = centerX + x * scale;
      const canvasY = centerY - y * scale * 0.5;
      
      if (canvasX >= 0 && canvasX <= width && 
          canvasY >= 0 && canvasY <= height &&
          !isNaN(y) && isFinite(y)) {
        points.push(canvasX, canvasY);
      }
    }

    // Draw function curve
    if (points.length >= 4) {
      const drawSegment = (index: number) => {
        if (index < points.length - 2) {
          const line = new Line([points[index], points[index + 1], points[index + 2], points[index + 3]], {
            stroke: '#ffffff',
            strokeWidth: Math.max(1, Math.min(2, width / 300)),
            selectable: false,
          });
          canvas.add(line);
          canvas.renderAll();
          
          setTimeout(() => drawSegment(index + 2), 15);
        } else {
          // Mark zeros and critical points
          setTimeout(() => {
            const zeros = [3, 5]; // Example zeros for the default function
            zeros.forEach((zero, index) => {
              setTimeout(() => {
                const zeroX = centerX + zero * scale;
                const radius = Math.max(3, Math.min(5, width / 120));
                const zeroCircle = new Circle({
                  left: zeroX - radius,
                  top: centerY - radius,
                  radius: radius,
                  fill: '#fbbf24',
                  selectable: false,
                });
                canvas.add(zeroCircle);
                canvas.renderAll();
              }, index * 200);
            });
          }, 300);
        }
      };
      
      drawSegment(0);
    }
  };

  const generateSteps = (type: string, expr: string, pt?: string) => {
    const point = pt || '3';
    const pointNum = parseFloat(point);
    
    const steps = {
      limit: [
        `lim<sub>x→${point}</sub> <span class="fraction"><span class="numerator">x² - 8x + 15</span><span class="denominator">x² - 5</span></span>`,
        `Substituindo diretamente x = ${point}:`,
        `<span class="fraction"><span class="numerator">${point}² - 8(${point}) + 15</span><span class="denominator">${point}² - 5</span></span> = <span class="fraction"><span class="numerator">${pointNum*pointNum} - ${8*pointNum} + 15</span><span class="denominator">${pointNum*pointNum} - 5</span></span>`,
        `= <span class="fraction"><span class="numerator">${pointNum*pointNum - 8*pointNum + 15}</span><span class="denominator">${pointNum*pointNum - 5}</span></span>`,
        `= <span class="result">${(pointNum*pointNum - 8*pointNum + 15)/(pointNum*pointNum - 5)}</span>`,
        `∴ lim<sub>x→${point}</sub> f(x) = <strong>${(pointNum*pointNum - 8*pointNum + 15)/(pointNum*pointNum - 5)}</strong>`
      ],
      continuity: [
        `<strong>Verificando continuidade em x = ${point}</strong>`,
        `<em>Condição 1:</em> f(${point}) deve existir`,
        `f(${point}) = <span class="fraction"><span class="numerator">${point}² - 8(${point}) + 15</span><span class="denominator">${point}² - 5</span></span> = <span class="fraction"><span class="numerator">${pointNum*pointNum - 8*pointNum + 15}</span><span class="denominator">${pointNum*pointNum - 5}</span></span> = ${(pointNum*pointNum - 8*pointNum + 15)/(pointNum*pointNum - 5)}`,
        `<em>Condição 2:</em> lim<sub>x→${point}</sub> f(x) deve existir`,
        `lim<sub>x→${point}</sub> f(x) = ${(pointNum*pointNum - 8*pointNum + 15)/(pointNum*pointNum - 5)}`,
        `<em>Condição 3:</em> f(${point}) = lim<sub>x→${point}</sub> f(x)`,
        `Como todas as condições são satisfeitas:<br/><strong>A função é contínua em x = ${point}</strong>`
      ],
      sinais: [
        `<strong>Estudo do sinal de f(x) = <span class="fraction"><span class="numerator">x² - 8x + 15</span><span class="denominator">x² - 5</span></span></strong>`,
        `<em>Passo 1:</em> Encontrar os zeros do numerador: x² - 8x + 15 = 0`,
        `Usando a fórmula quadrática: x = (8 ± √(64-60))/2 = (8 ± 2)/2`,
        `Zeros: x = 3 e x = 5`,
        `<em>Passo 2:</em> Encontrar os zeros do denominador: x² - 5 = 0`,
        `x = ±√5 ≈ ±2.24 (pontos de descontinuidade)`,
        `<strong>Conclusão:</strong> f(x) > 0 quando x ∈ (-∞, -√5) ∪ (3, √5) ∪ (5, +∞)<br/>f(x) < 0 quando x ∈ (-√5, 3) ∪ (√5, 5)`
      ]
    };

    onGraphReady?.(steps[type as keyof typeof steps]);
  };

  return (
    <div className="graph-container w-full">
      <div className="w-full overflow-hidden rounded-lg bg-black">
        <canvas ref={canvasRef} className="w-full h-auto max-w-full" />
      </div>
    </div>
  );
}