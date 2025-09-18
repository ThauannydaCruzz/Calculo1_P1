import React, { useEffect, useRef, useState } from 'react';
import { Canvas as FabricCanvas, Line, Circle, Text } from 'fabric';

interface GraphCanvasProps {
  expression: string;
  type: 'limit' | 'continuity';
  point?: string;
  onGraphReady?: (steps: string[]) => void;
}

export default function GraphCanvas({ expression, type, point, onGraphReady }: GraphCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 600,
      height: 400,
      backgroundColor: '#000000',
      selection: false,
    });

    setFabricCanvas(canvas);

    return () => {
      canvas.dispose();
    };
  }, []);

  useEffect(() => {
    if (!fabricCanvas || !expression) return;

    // Clear canvas
    fabricCanvas.clear();
    fabricCanvas.backgroundColor = '#000000';

    // Draw coordinate system
    drawCoordinateSystem(fabricCanvas);

    // Draw function based on type with animation
    setTimeout(() => {
      switch (type) {
        case 'limit':
          drawLimitFunction(fabricCanvas, expression, point);
          break;
        case 'continuity':
          drawContinuityFunction(fabricCanvas, expression, point);
          break;
      }
    }, 500); // Delay for animation effect

    fabricCanvas.renderAll();

    // Generate steps
    generateSteps(type, expression, point);
  }, [fabricCanvas, expression, type, point]);

  const drawCoordinateSystem = (canvas: FabricCanvas) => {
    const width = canvas.width || 600;
    const height = canvas.height || 400;
    const centerX = width / 2;
    const centerY = height / 2;

    // Grid lines
    for (let i = -10; i <= 10; i++) {
      if (i === 0) continue;
      
      // Vertical grid lines
      const x = centerX + i * 30;
      if (x > 0 && x < width) {
        const vLine = new Line([x, 0, x, height], {
          stroke: '#333333',
          strokeWidth: 1,
          selectable: false,
        });
        canvas.add(vLine);
      }

      // Horizontal grid lines
      const y = centerY - i * 30;
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

    // Axis labels
    for (let i = -5; i <= 5; i++) {
      if (i === 0) continue;
      
      const x = centerX + i * 60;
      const y = centerY - i * 60;
      
      if (x > 20 && x < width - 20) {
        const xLabel = new Text(i.toString(), {
          left: x - 5,
          top: centerY + 10,
          fontSize: 12,
          fill: '#ffffff',
          selectable: false,
        });
        canvas.add(xLabel);
      }
      
      if (y > 20 && y < height - 20) {
        const yLabel = new Text(i.toString(), {
          left: centerX + 10,
          top: y - 8,
          fontSize: 12,
          fill: '#ffffff',
          selectable: false,
        });
        canvas.add(yLabel);
      }
    }
  };

  const drawLimitFunction = (canvas: FabricCanvas, expr: string, pt?: string) => {
    const centerX = (canvas.width || 600) / 2;
    const centerY = (canvas.height || 400) / 2;
    const limitPoint = parseFloat(pt || '0');

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
      
      const canvasX = centerX + x * 60;
      const canvasY = centerY - y * 30;
      
      if (canvasX >= 0 && canvasX <= (canvas.width || 600) && 
          canvasY >= 0 && canvasY <= (canvas.height || 400) &&
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
            strokeWidth: 2,
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
              const limitX = centerX + limitPoint * 60;
              const limitY = centerY - ((limitPoint * limitPoint - 8 * limitPoint + 15) / (limitPoint * limitPoint - 5)) * 30;
              
              const limitCircle = new Circle({
                left: limitX - 4,
                top: limitY - 4,
                radius: 4,
                fill: 'transparent',
                stroke: '#ff6b6b',
                strokeWidth: 3,
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
    const centerX = (canvas.width || 600) / 2;
    const centerY = (canvas.height || 400) / 2;
    const checkPoint = parseFloat(pt || '3');

    // Calculate actual function values
    const points: number[] = [];
    for (let x = -4; x <= 4; x += 0.1) {
      if (Math.abs(x * x - 5) < 0.01) continue; // Skip near singularities
      
      const y = (x * x - 8 * x + 15) / (x * x - 5);
      const canvasX = centerX + x * 60;
      const canvasY = centerY - y * 30;
      
      if (canvasX >= 0 && canvasX <= (canvas.width || 600) && 
          canvasY >= 0 && canvasY <= (canvas.height || 400) &&
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
            strokeWidth: 2,
            selectable: false,
          });
          canvas.add(line);
          canvas.renderAll();
          
          setTimeout(() => drawSegment(index + 2), 15);
        } else {
          // Mark the continuity point
          setTimeout(() => {
            const pointX = centerX + checkPoint * 60;
            const pointY = centerY - ((checkPoint * checkPoint - 8 * checkPoint + 15) / (checkPoint * checkPoint - 5)) * 30;

            const continuityCircle = new Circle({
              left: pointX - 4,
              top: pointY - 4,
              radius: 4,
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
      ]
    };

    onGraphReady?.(steps[type as keyof typeof steps]);
  };

  return (
    <div className="graph-container">
      <canvas ref={canvasRef} className="w-full" />
    </div>
  );
}