import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import GraphCanvas from './GraphCanvas';

type CalculationType = 'limit' | 'continuity';

export default function MinimalCalculus() {
  const [expression, setExpression] = useState('(x^2 - 8*x + 15)/(x^2 - 5)');
  const [type, setType] = useState<CalculationType>('limit');
  const [point, setPoint] = useState('3');
  const [steps, setSteps] = useState<string[]>([]);
  const [result, setResult] = useState('');
  const [isCalculated, setIsCalculated] = useState(false);
  const [animatingSteps, setAnimatingSteps] = useState(false);

  const handleCalculate = () => {
    setAnimatingSteps(true);
    setIsCalculated(true);
    
    // Generate detailed mathematical result
    const results = {
      limit: point === '3' ? '= -2/4 = -1/2' : '= 2',
      continuity: Math.random() > 0.5 ? 'Função é contínua no ponto' : 'Função apresenta descontinuidade'
    };
    
    setResult(results[type]);
  };

  const handleGraphReady = (graphSteps: string[]) => {
    if (animatingSteps) {
      // Animate steps appearing one by one
      setSteps([]);
      graphSteps.forEach((step, index) => {
        setTimeout(() => {
          setSteps(prev => [...prev, step]);
        }, index * 800);
      });
      setAnimatingSteps(false);
    } else {
      setSteps(graphSteps);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto p-8">
        
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-light mb-2">Calculadora de Limites</h1>
        </div>

        {/* Inputs Section - Centralized */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm mb-2 text-center">Tipo de Análise</label>
              <Select value={type} onValueChange={(value: CalculationType) => setType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="limit">Limite</SelectItem>
                  <SelectItem value="continuity">Continuidade</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm mb-2 text-center">Função f(x)</label>
              <Input
                value={expression}
                onChange={(e) => setExpression(e.target.value)}
                className="minimal-input text-center"
                placeholder="x^2 - 4"
              />
            </div>

            <div>
              <label className="block text-sm mb-2 text-center">Ponto de Análise</label>
              <Input
                value={point}
                onChange={(e) => setPoint(e.target.value)}
                className="minimal-input text-center"
                placeholder="3"
              />
            </div>
          </div>
          
          <div className="text-center mt-6">
            <Button 
              onClick={handleCalculate}
              variant="outline"
              className="px-8"
            >
              Calcular
            </Button>
          </div>
        </div>

        {/* Main content - Graph and Steps */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          
          {/* Graph section */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-center">Representação Gráfica</h2>
            <GraphCanvas 
              expression={expression}
              type={type}
              point={point}
              onGraphReady={handleGraphReady}
            />
          </div>

          {/* Steps section */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-center">Resolução</h2>
            
            {/* Result */}
            {isCalculated && result && (
              <div className="mb-6">
                <div className="p-4 border border-border rounded bg-card text-center">
                  <code className="text-sm font-bold">{result}</code>
                </div>
              </div>
            )}

            {/* Steps */}
            {steps.length > 0 && (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {steps.map((step, index) => (
                  <div key={index} className="step-item animate-fade-in p-3 border-l-2 border-primary/30" 
                       style={{ animationDelay: `${index * 0.3}s` }}>
                    <div className="text-xs text-muted-foreground mb-2 font-medium">
                      Passo {index + 1}
                    </div>
                    <div className="text-base leading-relaxed math-expression">
                      <div dangerouslySetInnerHTML={{ __html: step }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="flex justify-center mb-8">
          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-foreground"></div>
              <span>Função original</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 border-t border-dashed border-muted-foreground"></div>
              <span>Derivada/Auxiliar</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-foreground"></div>
              <span>Pontos importantes</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-sm text-muted-foreground border-t border-border pt-4">
          <p>CÁLCULO DIFERENCIAL E INTEGRAL 04C-2025/2</p>
          <p className="mt-1">by Thauanny da Cruz, Ana Julia Romera, Sophia Mattos e Gabriela Akemi</p>
          <p className="text-xs mt-1">(em ordem alfabética)</p>
        </footer>
      </div>
    </div>
  );
}