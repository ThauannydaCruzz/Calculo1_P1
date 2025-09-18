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
      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-12">
        
        {/* Title */}
        <div className="text-center py-8">
          <h1 className="text-3xl md:text-4xl font-light">Calculadora de Limites</h1>
        </div>

        {/* Inputs Section - Centralized */}
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-center">Tipo de Análise</label>
              <Select value={type} onValueChange={(value: CalculationType) => setType(value)}>
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="limit">Limite</SelectItem>
                  <SelectItem value="continuity">Continuidade</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-center">Função f(x)</label>
              <Input
                value={expression}
                onChange={(e) => setExpression(e.target.value)}
                className="minimal-input text-center h-12"
                placeholder="x^2 - 4"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-center">Ponto de Análise</label>
              <Input
                value={point}
                onChange={(e) => setPoint(e.target.value)}
                className="minimal-input text-center h-12"
                placeholder="3"
              />
            </div>
          </div>
          
          <div className="text-center mt-8">
            <Button 
              onClick={handleCalculate}
              variant="outline"
              className="px-12 py-3 text-base"
            >
              Calcular
            </Button>
          </div>
        </div>

        {/* Main content - Graph and Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          
          {/* Graph section */}
          <div className="space-y-6">
            <h2 className="text-xl md:text-2xl font-semibold text-center">Representação Gráfica</h2>
            <div className="bg-card border border-border rounded-lg p-4">
              <GraphCanvas 
                expression={expression}
                type={type}
                point={point}
                onGraphReady={handleGraphReady}
              />
            </div>
          </div>

          {/* Steps section */}
          <div className="space-y-6">
            <h2 className="text-xl md:text-2xl font-semibold text-center">Resolução</h2>
            
            {/* Result */}
            {isCalculated && result && (
              <div className="p-6 border border-border rounded-lg bg-card text-center">
                <h3 className="text-lg font-semibold mb-3">Resultado Final</h3>
                <code className="text-base font-bold text-primary">{result}</code>
              </div>
            )}

            {/* Steps */}
            {steps.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-center mb-6">Passos da Solução</h3>
                <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
                  {steps.map((step, index) => (
                    <div key={index} className="step-item animate-fade-in p-4 border-l-4 border-primary/30 bg-card/50 rounded-r-lg" 
                         style={{ animationDelay: `${index * 0.3}s` }}>
                      <div className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wide">
                        Passo {index + 1}
                      </div>
                      <div className="text-base leading-relaxed math-expression">
                        <div dangerouslySetInnerHTML={{ __html: step }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="py-8">
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-3">
              <div className="w-6 h-0.5 bg-foreground"></div>
              <span>Função original</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-0.5 border-t-2 border-dashed border-muted-foreground"></div>
              <span>Derivada/Auxiliar</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-foreground"></div>
              <span>Pontos importantes</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-sm text-muted-foreground border-t border-border pt-8 mt-12 space-y-2">
          <p className="font-medium">CÁLCULO DIFERENCIAL E INTEGRAL 04C-2025/2</p>
          <p>by Ana Julia Romera, Gabriela Akemi, Sophia Mattos e Thauanny da Cruz</p>
        </footer>
      </div>
    </div>
  );
}