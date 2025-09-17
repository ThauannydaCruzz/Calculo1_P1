import React, { useEffect, useRef, useState } from 'react';
import { Canvas as FabricCanvas, Line, Circle, Text } from 'fabric';

interface GraphCanvasProps {
  expression: string;
  type: 'limit' | 'derivative' | 'signal' | 'continuity';
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

    // Draw function based on type
    switch (type) {
      case 'limit':
        drawLimitFunction(fabricCanvas, expression, point);
        break;
      case 'derivative':
        drawDerivativeFunction(fabricCanvas, expression);
        break;
      case 'signal':
        drawSignalAnalysis(fabricCanvas, expression);
        break;
      case 'continuity':
        drawContinuityFunction(fabricCanvas, expression, point);
        break;
    }

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

    // Draw a simple parabola approaching a limit
    const points: number[] = [];
    for (let x = -5; x <= 5; x += 0.1) {
      if (Math.abs(x - limitPoint) < 0.1) continue; // Discontinuity
      
      let y;
      if (expr.includes('x^2')) {
        y = x * x - 4; // (x^2 - 4) / (x - 2) simplified
      } else {
        y = Math.sin(x * Math.PI / 2);
      }
      
      const canvasX = centerX + x * 60;
      const canvasY = centerY - y * 30;
      
      if (canvasX >= 0 && canvasX <= (canvas.width || 600) && 
          canvasY >= 0 && canvasY <= (canvas.height || 400)) {
        points.push(canvasX, canvasY);
      }
    }

    // Draw function curve
    if (points.length >= 4) {
      for (let i = 0; i < points.length - 2; i += 2) {
        const line = new Line([points[i], points[i + 1], points[i + 2], points[i + 3]], {
          stroke: '#ffffff',
          strokeWidth: 2,
          selectable: false,
        });
        canvas.add(line);
      }
    }

    // Mark limit point
    if (pt) {
      const limitX = centerX + limitPoint * 60;
      const limitCircle = new Circle({
        left: limitX - 3,
        top: centerY - 3,
        radius: 3,
        fill: 'transparent',
        stroke: '#ffffff',
        strokeWidth: 2,
        selectable: false,
      });
      canvas.add(limitCircle);
    }
  };

  const drawDerivativeFunction = (canvas: FabricCanvas, expr: string) => {
    const centerX = (canvas.width || 600) / 2;
    const centerY = (canvas.height || 400) / 2;

    // Draw original function and its derivative
    const points: number[] = [];
    const derivPoints: number[] = [];

    for (let x = -3; x <= 3; x += 0.1) {
      let y, dy;
      
      if (expr.includes('x^2')) {
        y = x * x;
        dy = 2 * x; // derivative
      } else {
        y = Math.sin(x);
        dy = Math.cos(x);
      }
      
      const canvasX = centerX + x * 60;
      const canvasY1 = centerY - y * 30;
      const canvasY2 = centerY - dy * 30;
      
      if (canvasX >= 0 && canvasX <= (canvas.width || 600)) {
        if (canvasY1 >= 0 && canvasY1 <= (canvas.height || 400)) {
          points.push(canvasX, canvasY1);
        }
        if (canvasY2 >= 0 && canvasY2 <= (canvas.height || 400)) {
          derivPoints.push(canvasX, canvasY2);
        }
      }
    }

    // Draw original function
    for (let i = 0; i < points.length - 2; i += 2) {
      const line = new Line([points[i], points[i + 1], points[i + 2], points[i + 3]], {
        stroke: '#ffffff',
        strokeWidth: 2,
        selectable: false,
      });
      canvas.add(line);
    }

    // Draw derivative (dashed)
    for (let i = 0; i < derivPoints.length - 2; i += 2) {
      const line = new Line([derivPoints[i], derivPoints[i + 1], derivPoints[i + 2], derivPoints[i + 3]], {
        stroke: '#999999',
        strokeWidth: 2,
        strokeDashArray: [5, 5],
        selectable: false,
      });
      canvas.add(line);
    }
  };

  const drawSignalAnalysis = (canvas: FabricCanvas, expr: string) => {
    const centerX = (canvas.width || 600) / 2;
    const centerY = (canvas.height || 400) / 2;

    // Draw function with sign analysis
    const points: number[] = [];
    
    for (let x = -4; x <= 4; x += 0.1) {
      let y;
      
      if (expr.includes('x^2')) {
        if (Math.abs(x - 2) < 0.05) continue; // Discontinuity at x=2
        y = (x * x - 4) / (x - 2);
      } else {
        y = x * x - 1;
      }
      
      const canvasX = centerX + x * 60;
      const canvasY = centerY - y * 20;
      
      if (canvasX >= 0 && canvasX <= (canvas.width || 600) && 
          canvasY >= 0 && canvasY <= (canvas.height || 400)) {
        points.push(canvasX, canvasY);
      }
    }

    // Draw function
    for (let i = 0; i < points.length - 2; i += 2) {
      const line = new Line([points[i], points[i + 1], points[i + 2], points[i + 3]], {
        stroke: '#ffffff',
        strokeWidth: 2,
        selectable: false,
      });
      canvas.add(line);
    }

    // Mark zeros and discontinuities
    const zeros = [-2, 2];
    zeros.forEach(zero => {
      const zeroX = centerX + zero * 60;
      const zeroCircle = new Circle({
        left: zeroX - 3,
        top: centerY - 3,
        radius: 3,
        fill: '#ffffff',
        selectable: false,
      });
      canvas.add(zeroCircle);
    });
  };

  const drawContinuityFunction = (canvas: FabricCanvas, expr: string, pt?: string) => {
    const centerX = (canvas.width || 600) / 2;
    const centerY = (canvas.height || 400) / 2;
    const checkPoint = parseFloat(pt || '1');

    // Draw piecewise function
    const points1: number[] = [];
    const points2: number[] = [];

    for (let x = -3; x <= checkPoint; x += 0.1) {
      const y = x * x; // First piece
      const canvasX = centerX + x * 60;
      const canvasY = centerY - y * 30;
      
      if (canvasX >= 0 && canvasX <= (canvas.width || 600) && 
          canvasY >= 0 && canvasY <= (canvas.height || 400)) {
        points1.push(canvasX, canvasY);
      }
    }

    for (let x = checkPoint; x <= 3; x += 0.1) {
      const y = 2 * x; // Second piece
      const canvasX = centerX + x * 60;
      const canvasY = centerY - y * 30;
      
      if (canvasX >= 0 && canvasX <= (canvas.width || 600) && 
          canvasY >= 0 && canvasY <= (canvas.height || 400)) {
        points2.push(canvasX, canvasY);
      }
    }

    // Draw first piece
    for (let i = 0; i < points1.length - 2; i += 2) {
      const line = new Line([points1[i], points1[i + 1], points1[i + 2], points1[i + 3]], {
        stroke: '#ffffff',
        strokeWidth: 2,
        selectable: false,
      });
      canvas.add(line);
    }

    // Draw second piece
    for (let i = 0; i < points2.length - 2; i += 2) {
      const line = new Line([points2[i], points2[i + 1], points2[i + 2], points2[i + 3]], {
        stroke: '#ffffff',
        strokeWidth: 2,
        selectable: false,
      });
      canvas.add(line);
    }

    // Mark the point of interest
    const pointX = centerX + checkPoint * 60;
    const pointY1 = centerY - (checkPoint * checkPoint) * 30;
    const pointY2 = centerY - (2 * checkPoint) * 30;

    // Left limit point
    const leftCircle = new Circle({
      left: pointX - 3,
      top: pointY1 - 3,
      radius: 3,
      fill: '#ffffff',
      selectable: false,
    });
    
    // Right limit point
    const rightCircle = new Circle({
      left: pointX - 3,
      top: pointY2 - 3,
      radius: 3,
      fill: 'transparent',
      stroke: '#ffffff',
      strokeWidth: 2,
      selectable: false,
    });

    canvas.add(leftCircle, rightCircle);
  };

  const generateSteps = (type: string, expr: string, pt?: string) => {
    const steps = {
      limit: [
        `Calculando lim(x→${pt || '0'}) ${expr}`,
        'Verificando se há indeterminação',
        'Aplicando técnicas de limite',
        'Simplificando a expressão',
        'Obtendo o resultado final'
      ],
      derivative: [
        `Calculando f'(x) onde f(x) = ${expr}`,
        'Aplicando a definição: lim h→0 [f(x+h)-f(x)]/h',
        'Expandindo f(x+h)',
        'Simplificando [f(x+h)-f(x)]/h',
        'Calculando o limite para obter f\'(x)'
      ],
      signal: [
        `Estudando o sinal de ${expr}`,
        'Encontrando zeros da função',
        'Identificando pontos de descontinuidade',
        'Analisando sinais em cada intervalo',
        'Construindo o quadro de sinais'
      ],
      continuity: [
        `Verificando continuidade de ${expr} em x=${pt || '1'}`,
        'Calculando limite lateral esquerdo',
        'Calculando limite lateral direito',
        'Verificando o valor da função no ponto',
        'Comparando os três valores'
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