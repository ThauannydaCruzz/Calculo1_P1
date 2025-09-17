import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calculator, TrendingUp, BarChart3, CheckCircle2 } from 'lucide-react';

interface CalculationType {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  placeholder: string;
  color: string;
}

const calculationTypes: CalculationType[] = [
  {
    id: 'signal',
    title: 'Estudar Sinal de Expressão',
    description: 'Analisa onde a expressão é positiva, negativa, zero ou indefinida',
    icon: TrendingUp,
    placeholder: 'Ex: (x^2 - 4)/(x - 2)',
    color: 'bg-math-accent'
  },
  {
    id: 'limit',
    title: 'Calcular Limite',
    description: 'Calcula o limite quando x se aproxima de um ponto',
    icon: BarChart3,
    placeholder: 'Ex: x^2 + 3*x - 1',
    color: 'bg-math-secondary'
  },
  {
    id: 'derivative',
    title: 'Derivada pela Definição',
    description: 'Utiliza a definição formal: lim h→0 [f(x+h)-f(x)]/h',
    icon: Calculator,
    placeholder: 'Ex: x^2 + 2*x + 1',
    color: 'bg-math-warning'
  },
  {
    id: 'continuity',
    title: 'Verificar Continuidade',
    description: 'Analisa continuidade comparando limites laterais e valor da função',
    icon: CheckCircle2,
    placeholder: 'Ex: x^2 se x <= 1, senão 2*x',
    color: 'bg-primary'
  }
];

export default function CalculusResolver() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [expression, setExpression] = useState('');
  const [point, setPoint] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [steps, setSteps] = useState<string[]>([]);

  const handleCalculate = async () => {
    if (!selectedType || !expression) return;
    
    setIsCalculating(true);
    
    // Simular cálculo com delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Resultados simulados para demonstração
    const mockResults = {
      signal: {
        result: 'Expressão positiva para x ∈ (-∞, -2) ∪ (2, +∞)',
        steps: [
          'Fatorando o numerador: (x-2)(x+2)',
          'Identificando zeros: x = -2 e x = 2', 
          'Ponto de descontinuidade: x = 2',
          'Analisando sinais por intervalos',
          'Resultado: (+) para x < -2, (-) para -2 < x < 2, (+) para x > 2'
        ]
      },
      limit: {
        result: `lim(x→${point || '0'}) = ${expression.includes('x^2') ? parseInt(point || '0')**2 + 3*parseInt(point || '0') - 1 : '∞'}`,
        steps: [
          'Substituindo diretamente na expressão',
          'Verificando se há indeterminação',
          `Calculando: f(${point || '0'})`,
          'Aplicando propriedades dos limites',
          'Obtendo resultado final'
        ]
      },
      derivative: {
        result: `f'(x) = ${expression.includes('x^2') ? '2x + 2' : '1'}`,
        steps: [
          'Aplicando definição: lim h→0 [f(x+h)-f(x)]/h',
          'Expandindo f(x+h)',
          'Calculando f(x+h) - f(x)',
          'Simplificando a fração',
          'Calculando o limite'
        ]
      },
      continuity: {
        result: 'Função contínua em x = 1',
        steps: [
          'Calculando limite à esquerda: lim x→1⁻ f(x) = 1',
          'Calculando limite à direita: lim x→1⁺ f(x) = 2',
          'Valor da função: f(1) = 1',
          'Comparando os três valores',
          'Verificação de continuidade concluída'
        ]
      }
    };

    const typeResult = mockResults[selectedType as keyof typeof mockResults];
    setResult(typeResult.result);
    setSteps(typeResult.steps);
    setIsCalculating(false);
  };

  const resetCalculation = () => {
    setSelectedType(null);
    setExpression('');
    setPoint('');
    setResult(null);
    setSteps([]);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-math-secondary bg-clip-text text-transparent">
            Resolução de Exercícios de Cálculo
          </h1>
          <p className="text-muted-foreground text-lg">
            Cálculo Diferencial e Integral - Análise passo a passo
          </p>
        </div>

        {!selectedType ? (
          /* Menu de seleção */
          <div className="grid md:grid-cols-2 gap-6">
            {calculationTypes.map((type, index) => {
              const Icon = type.icon;
              return (
                <Card 
                  key={type.id}
                  className="math-card glow-border cursor-pointer transition-all duration-300 hover:scale-105"
                  onClick={() => setSelectedType(type.id)}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-3 rounded-lg ${type.color}`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        Opção {index + 1}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl">{type.title}</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {type.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground math-expression">
                      {type.placeholder}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          /* Interface de cálculo */
          <div className="space-y-6">
            <Card className="math-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {React.createElement(calculationTypes.find(t => t.id === selectedType)?.icon || Calculator, { className: "h-5 w-5" })}
                    {calculationTypes.find(t => t.id === selectedType)?.title}
                  </CardTitle>
                  <Button variant="outline" onClick={resetCalculation}>
                    Voltar ao Menu
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Expressão Matemática</label>
                  <Input
                    value={expression}
                    onChange={(e) => setExpression(e.target.value)}
                    placeholder={calculationTypes.find(t => t.id === selectedType)?.placeholder}
                    className="math-expression text-lg"
                  />
                </div>
                
                {selectedType === 'limit' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Ponto de Aproximação</label>
                    <Input
                      value={point}
                      onChange={(e) => setPoint(e.target.value)}
                      placeholder="Ex: 0, 1, 2..."
                      className="math-expression"
                    />
                  </div>
                )}
                
                <Button 
                  onClick={handleCalculate}
                  disabled={!expression || isCalculating}
                  className="w-full"
                  size="lg"
                >
                  {isCalculating ? 'Calculando...' : 'Resolver Exercício'}
                </Button>
              </CardContent>
            </Card>

            {/* Resultado */}
            {(result || isCalculating) && (
              <Card className="math-card">
                <CardHeader>
                  <CardTitle>Resultado</CardTitle>
                </CardHeader>
                <CardContent>
                  {isCalculating ? (
                    <div className="flex items-center gap-3">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
                      <span>Processando cálculo...</span>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg bg-math-surface border border-primary/20">
                        <div className="math-expression text-lg font-semibold text-primary">
                          {result}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-3">Passo a Passo:</h4>
                        <div className="space-y-2">
                          {steps.map((step, index) => (
                            <div 
                              key={index}
                              className="step-reveal flex items-start gap-3 p-3 rounded bg-muted/20"
                              style={{ animationDelay: `${index * 0.2}s` }}
                            >
                              <Badge variant="secondary" className="mt-0.5">
                                {index + 1}
                              </Badge>
                              <span className="math-expression text-sm">{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Footer decorativo */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 text-muted-foreground">
            <span className="float-symbol text-2xl">∫</span>
            <span>Cálculo Diferencial e Integral</span>
            <span className="float-symbol text-2xl">∂</span>
          </div>
        </div>
      </div>
    </div>
  );
}