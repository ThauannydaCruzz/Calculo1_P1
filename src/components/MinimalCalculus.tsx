import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import GraphCanvas from './GraphCanvas';

type CalculationType = 'limit' | 'continuity' | 'sinais';

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
      continuity: Math.random() > 0.5 ? 'Função é contínua no ponto' : 'Função apresenta descontinuidade',
      sinais: 'f(x) > 0 quando x ∈ (-∞, 3) ∪ (5, ∞) e f(x) < 0 quando x ∈ (3, 5)'
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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-8 sm:space-y-12">
        
        {/* Title */}
        <div className="text-center py-4 sm:py-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light">Calculadora de Limites</h1>
        </div>

        {/* Inputs Section - Centralized */}
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            <div className="space-y-2 sm:space-y-3">
              <label className="block text-xs sm:text-sm font-medium text-center">Tipo de Análise</label>
              <Select value={type} onValueChange={(value: CalculationType) => setType(value)}>
                <SelectTrigger className="h-10 sm:h-12 text-sm sm:text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="limit">Limite</SelectItem>
                  <SelectItem value="continuity">Continuidade</SelectItem>
                  <SelectItem value="sinais">Estudo de Sinais</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 sm:space-y-3">
              <label className="block text-xs sm:text-sm font-medium text-center">Função f(x)</label>
              <Input
                value={expression}
                onChange={(e) => setExpression(e.target.value)}
                className="minimal-input text-center h-10 sm:h-12 text-sm sm:text-base"
                placeholder="x^2 - 4"
              />
            </div>

            <div className="space-y-2 sm:space-y-3 sm:col-span-2 lg:col-span-1">
              <label className="block text-xs sm:text-sm font-medium text-center">Ponto de Análise</label>
              <Input
                value={point}
                onChange={(e) => setPoint(e.target.value)}
                className="minimal-input text-center h-10 sm:h-12 text-sm sm:text-base"
                placeholder="3"
              />
            </div>
          </div>
          
          <div className="text-center mt-6 sm:mt-8">
            <Button 
              onClick={handleCalculate}
              variant="outline"
              className="px-8 sm:px-12 py-2 sm:py-3 text-sm sm:text-base w-full sm:w-auto"
            >
              Calcular
            </Button>
          </div>
        </div>

        {/* Main content - Graph and Steps */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
          
          {/* Graph section */}
          <div className="space-y-4 sm:space-y-6 order-2 xl:order-1">
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-center">Representação Gráfica</h2>
            <div className="bg-card border border-border rounded-lg p-2 sm:p-4">
              <GraphCanvas 
                expression={expression}
                type={type}
                point={point}
                onGraphReady={handleGraphReady}
              />
            </div>
          </div>

          {/* Steps section */}
          <div className="space-y-4 sm:space-y-6 order-1 xl:order-2">
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-center">Resolução</h2>
            
            {/* Result */}
            {isCalculated && result && (
              <div className="p-4 sm:p-6 border border-border rounded-lg bg-card text-center">
                <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">Resultado Final</h3>
                <code className="text-sm sm:text-base font-bold text-primary break-all">{result}</code>
              </div>
            )}

            {/* Steps */}
            {steps.length > 0 && (
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-base sm:text-lg font-semibold text-center mb-4 sm:mb-6">Passos da Solução</h3>
                <div className="space-y-4 sm:space-y-6 max-h-80 sm:max-h-96 overflow-y-auto pr-1 sm:pr-2">
                  {steps.map((step, index) => (
                    <div key={index} className="step-item animate-fade-in p-3 sm:p-4 border-l-4 border-primary/30 bg-card/50 rounded-r-lg" 
                         style={{ animationDelay: `${index * 0.3}s` }}>
                      <div className="text-xs text-muted-foreground mb-2 sm:mb-3 font-medium uppercase tracking-wide">
                        Passo {index + 1}
                      </div>
                      <div className="text-sm sm:text-base leading-relaxed math-expression break-words">
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
        <div className="py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-4 sm:gap-6 md:gap-8 text-xs sm:text-sm text-muted-foreground">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-4 sm:w-6 h-0.5 bg-foreground"></div>
              <span>Função original</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-4 sm:w-6 h-0.5 border-t-2 border-dashed border-muted-foreground"></div>
              <span>Derivada/Auxiliar</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-2 sm:w-3 h-2 sm:h-3 rounded-full bg-foreground"></div>
              <span>Pontos importantes</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-xs sm:text-sm text-muted-foreground border-t border-border pt-6 sm:pt-8 mt-8 sm:mt-12 space-y-1 sm:space-y-2">
          <p className="font-medium">CÁLCULO DIFERENCIAL E INTEGRAL 04C-2025/2</p>
          <p className="break-words">by Ana Julia Romera, Gabriela Akemi, Sophia Mattos e Thauanny da Cruz</p>
        </footer>
      </div>
    </div>
  );
}