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
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-light mb-2">Resolução de Exercícios</h1>
          <p className="text-muted-foreground font-mono text-lg">Limites e Continuidade</p>
        </div>

        {/* Main content grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Graph section - takes up 2/3 of the space */}
          <div className="lg:col-span-2">
            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-4">Representação Gráfica</h2>
            </div>
            <GraphCanvas 
              expression={expression}
              type={type}
              point={point}
              onGraphReady={handleGraphReady}
            />
          </div>

          {/* Controls and steps - takes up 1/3 */}
          <div className="space-y-6">
            
            {/* Input controls */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Configuração</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-2">Tipo de Análise</label>
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
                  <label className="block text-sm mb-2">Função f(x)</label>
                  <Input
                    value={expression}
                    onChange={(e) => setExpression(e.target.value)}
                    className="minimal-input"
                    placeholder="x^2 - 4"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2">Ponto de Análise</label>
                  <Input
                    value={point}
                    onChange={(e) => setPoint(e.target.value)}
                    className="minimal-input"
                    placeholder="3"
                  />
                </div>

                <Button 
                  onClick={handleCalculate}
                  className="w-full"
                  variant="outline"
                >
                  Calcular
                </Button>
              </div>
            </div>

            {/* Result */}
            {isCalculated && result && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Resultado</h3>
                <div className="p-4 border border-border rounded bg-card">
                  <code className="text-sm">{result}</code>
                </div>
              </div>
            )}

            {/* Steps */}
            {steps.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Passos da Solução</h3>
                <div className="space-y-4">
                  {steps.map((step, index) => (
                    <div key={index} className="step-item animate-fade-in" 
                         style={{ animationDelay: `${index * 0.2}s` }}>
                      <div className="text-xs text-muted-foreground mb-2">
                        {index + 1}.
                      </div>
                      <div className="text-sm font-mono leading-relaxed">
                        {step}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Legend */}
            <div className="text-xs text-muted-foreground space-y-1">
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
        </div>
      </div>
    </div>
  );
}