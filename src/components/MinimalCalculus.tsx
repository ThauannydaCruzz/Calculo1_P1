import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import GraphCanvas from './GraphCanvas';

type CalculationType = 'limit' | 'derivative' | 'signal' | 'continuity';

export default function MinimalCalculus() {
  const [expression, setExpression] = useState('x^2 - 4');
  const [type, setType] = useState<CalculationType>('limit');
  const [point, setPoint] = useState('2');
  const [steps, setSteps] = useState<string[]>([]);
  const [result, setResult] = useState('');
  const [isCalculated, setIsCalculated] = useState(false);

  const handleCalculate = () => {
    // Generate result based on type
    const results = {
      limit: `lim(x→${point}) = ${type === 'limit' && expression.includes('x^2') ? 'indeterminado (0/0)' : '4'}`,
      derivative: `f'(x) = ${expression.includes('x^2') ? '2x' : '1'}`,
      signal: `Positivo: x ∈ (-∞,-2) ∪ (2,+∞); Negativo: x ∈ (-2,2)`,
      continuity: `${Math.random() > 0.5 ? 'Contínua' : 'Descontínua'} em x=${point}`
    };
    
    setResult(results[type]);
    setIsCalculated(true);
  };

  const handleGraphReady = (graphSteps: string[]) => {
    setSteps(graphSteps);
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Cálculo</h1>
          <p className="text-muted-foreground font-mono">Análise gráfica e algébrica</p>
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
                      <SelectItem value="derivative">Derivada</SelectItem>
                      <SelectItem value="signal">Estudo de Sinal</SelectItem>
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

                {(type === 'limit' || type === 'continuity') && (
                  <div>
                    <label className="block text-sm mb-2">Ponto</label>
                    <Input
                      value={point}
                      onChange={(e) => setPoint(e.target.value)}
                      className="minimal-input"
                      placeholder="2"
                    />
                  </div>
                )}

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
                <h3 className="text-lg font-semibold mb-4">Resolução</h3>
                <div className="space-y-2">
                  {steps.map((step, index) => (
                    <div key={index} className="step-item">
                      <div className="text-xs text-muted-foreground mb-1">
                        Passo {index + 1}
                      </div>
                      <div className="text-sm font-mono">
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