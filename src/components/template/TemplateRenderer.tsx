import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertCircle, Info } from 'lucide-react';

interface TemplateData {
  [key: string]: any;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  context: Record<string, any>;
}

interface PlaceholderExtractionResult {
  simplePlaceholders: string[];
  helpers: string[];
  blockHelpers: string[];
  allPlaceholders: string[];
  stats: {
    totalCount: number;
    uniqueCount: number;
    helpersCount: number;
    blockHelpersCount: number;
    extractionTimeMs: number;
  };
}

interface RenderedEmail {
  subject: string;
  htmlBody: string;
  textBody: string;
  templateId?: string;
  renderedAt: string;
  renderDuration: string;
  metadata: Record<string, any>;
}

const TemplateRenderer: React.FC = () => {
  const [subject, setSubject] = useState('');
  const [htmlBody, setHtmlBody] = useState('');
  const [textBody, setTextBody] = useState('');
  const [templateData, setTemplateData] = useState<TemplateData>({});
  const [renderedEmail, setRenderedEmail] = useState<RenderedEmail | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [placeholderResult, setPlaceholderResult] = useState<PlaceholderExtractionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helpers Handlebars côté client (parité avec le backend)
  const handlebarsHelpers = {
    formatDate: (value: any, format = 'dd/MM/yyyy', culture = 'fr-FR') => {
      if (!value) return '';
      const date = new Date(value);
      if (isNaN(date.getTime())) return '';
      
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: format.includes('HH') ? '2-digit' : undefined,
        minute: format.includes('mm') ? '2-digit' : undefined
      };
      
      return new Intl.DateTimeFormat(culture, options).format(date);
    },

    formatCurrency: (value: any, currency = 'EUR', culture = 'fr-FR') => {
      if (!value) return '';
      const num = parseFloat(value);
      if (isNaN(num)) return '';
      
      return new Intl.NumberFormat(culture, {
        style: 'currency',
        currency: currency
      }).format(num);
    },

    upper: (value: any) => {
      return String(value || '').toUpperCase();
    },

    lower: (value: any) => {
      return String(value || '').toLowerCase();
    },

    truncate: (value: any, length = 50, suffix = '...') => {
      const str = String(value || '');
      return str.length <= length ? str : str.substring(0, length) + suffix;
    },

    formatNumber: (value: any, format = 'N2', culture = 'fr-FR') => {
      if (!value) return '';
      const num = parseFloat(value);
      if (isNaN(num)) return '';
      
      return new Intl.NumberFormat(culture, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(num);
    },

    formatPercent: (value: any, format = 'P2', culture = 'fr-FR') => {
      if (!value) return '';
      const num = parseFloat(value);
      if (isNaN(num)) return '';
      
      return new Intl.NumberFormat(culture, {
        style: 'percent',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(num / 100);
    }
  };

  // Rendu côté client avec parité
  const renderTemplateClient = (template: string, data: TemplateData): string => {
    let result = template;
    
    // Remplacer les placeholders simples
    Object.keys(data).forEach(key => {
      const value = data[key];
      if (typeof value === 'object' && value !== null) {
        Object.keys(value).forEach(subKey => {
          const placeholder = `{{${key}.${subKey}}}`;
          result = result.replace(new RegExp(placeholder, 'g'), String(value[subKey] || ''));
        });
      } else {
        const placeholder = `{{${key}}}`;
        result = result.replace(new RegExp(placeholder, 'g'), String(value || ''));
      }
    });

    // Appliquer les helpers (version simplifiée)
    Object.keys(handlebarsHelpers).forEach(helperName => {
      const helper = handlebarsHelpers[helperName as keyof typeof handlebarsHelpers];
      const regex = new RegExp(`{{${helperName}\\s+([^}]+)}}`, 'g');
      result = result.replace(regex, (match, args) => {
        const [value, ...params] = args.split(' ').map((arg: string) => arg.trim().replace(/['"]/g, ''));
        return helper(data[value] || value, ...params);
      });
    });

    return result;
  };

  const handleRenderTemplate = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Rendu côté client pour comparaison
      const clientSubject = renderTemplateClient(subject, templateData);
      const clientHtmlBody = renderTemplateClient(htmlBody, templateData);
      const clientTextBody = renderTemplateClient(textBody, templateData);

      // Appel API pour rendu côté serveur
      const response = await fetch('/api/EmailTemplate/render-direct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject,
          htmlBody,
          textBody,
          data: templateData,
          configuration: {
            strictMode: false,
            allowHtml: true
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const serverResult: RenderedEmail = await response.json();
      setRenderedEmail(serverResult);

      // Comparaison parité
      const isParity = 
        serverResult.subject === clientSubject &&
        serverResult.htmlBody === clientHtmlBody &&
        serverResult.textBody === clientTextBody;

      if (!isParity) {
        console.warn('Parité front/back non respectée:', {
          subject: { client: clientSubject, server: serverResult.subject },
          htmlBody: { client: clientHtmlBody, server: serverResult.htmlBody },
          textBody: { client: clientTextBody, server: serverResult.textBody }
        });
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du rendu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExtractPlaceholders = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/EmailTemplate/extract-placeholders-advanced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject,
          htmlBody,
          textBody,
          includeHelpers: true,
          includeBlockHelpers: true
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: PlaceholderExtractionResult = await response.json();
      setPlaceholderResult(result);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'extraction');
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidateData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/EmailTemplate/validate-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: templateData,
          objectSchemas: {
            // Exemple de schéma de validation
            client: {
              typeName: 'client',
              properties: {
                name: { name: 'name', type: 'string', isRequired: true },
                email: { name: 'email', type: 'string', isRequired: true }
              }
            }
          },
          configuration: {
            strictMode: false,
            validateTypes: true,
            validateFormats: true
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ValidationResult = await response.json();
      setValidationResult(result);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la validation');
    } finally {
      setIsLoading(false);
    }
  };

  const updateTemplateData = (key: string, value: any) => {
    setTemplateData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Template Renderer - Parité Front/Back</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs defaultValue="template" className="w-full">
            <TabsList>
              <TabsTrigger value="template">Template</TabsTrigger>
              <TabsTrigger value="data">Données</TabsTrigger>
              <TabsTrigger value="result">Résultat</TabsTrigger>
              <TabsTrigger value="validation">Validation</TabsTrigger>
            </TabsList>

            <TabsContent value="template" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Sujet</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Sujet avec placeholders: {{client.name}}"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="htmlBody">Corps HTML</Label>
                <Textarea
                  id="htmlBody"
                  value={htmlBody}
                  onChange={(e) => setHtmlBody(e.target.value)}
                  placeholder="<h1>Bonjour {{client.name}}!</h1><p>Montant: {{formatCurrency order.total}}</p>"
                  rows={8}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="textBody">Corps Texte</Label>
                <Textarea
                  id="textBody"
                  value={textBody}
                  onChange={(e) => setTextBody(e.target.value)}
                  placeholder="Bonjour {{client.name}}, montant: {{formatCurrency order.total}}"
                  rows={4}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleExtractPlaceholders} disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Info className="mr-2 h-4 w-4" />}
                  Extraire Placeholders
                </Button>
                <Button onClick={handleRenderTemplate} disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                  Rendre Template
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="data" className="space-y-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Client</Label>
                    <Input
                      placeholder="Nom"
                      onChange={(e) => updateTemplateData('client', { ...templateData.client, name: e.target.value })}
                    />
                    <Input
                      placeholder="Email"
                      onChange={(e) => updateTemplateData('client', { ...templateData.client, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Commande</Label>
                    <Input
                      placeholder="Numéro"
                      onChange={(e) => updateTemplateData('order', { ...templateData.order, number: e.target.value })}
                    />
                    <Input
                      placeholder="Total"
                      type="number"
                      step="0.01"
                      onChange={(e) => updateTemplateData('order', { ...templateData.order, total: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Données JSON</Label>
                  <Textarea
                    value={JSON.stringify(templateData, null, 2)}
                    onChange={(e) => {
                      try {
                        setTemplateData(JSON.parse(e.target.value));
                      } catch {
                        // Ignore les erreurs de parsing
                      }
                    }}
                    rows={6}
                    placeholder='{"client": {"name": "Jean Dupont", "email": "jean@example.com"}, "order": {"number": "CMD-123", "total": 1549.9}}'
                  />
                </div>

                <Button onClick={handleValidateData} disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <AlertCircle className="mr-2 h-4 w-4" />}
                  Valider Données
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="result" className="space-y-4">
              {renderedEmail && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Sujet</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">{renderedEmail.subject}</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Métadonnées</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-xs space-y-1">
                          <p>Temps de rendu: {renderedEmail.renderDuration}</p>
                          <p>Rendu à: {new Date(renderedEmail.renderedAt).toLocaleString()}</p>
                          {renderedEmail.metadata.diagnostics && (
                            <p>Taille template: {renderedEmail.metadata.diagnostics.templateSize} caractères</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">HTML</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div 
                          className="text-sm border rounded p-2 max-h-64 overflow-auto"
                          dangerouslySetInnerHTML={{ __html: renderedEmail.htmlBody }}
                        />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Texte</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm border rounded p-2 max-h-64 overflow-auto whitespace-pre-wrap">
                          {renderedEmail.textBody}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {placeholderResult && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Analyse des Placeholders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Badge variant="secondary">Simples: {placeholderResult.stats.uniqueCount}</Badge>
                        <Badge variant="secondary">Helpers: {placeholderResult.stats.helpersCount}</Badge>
                        <Badge variant="secondary">Block: {placeholderResult.stats.blockHelpersCount}</Badge>
                        <Badge variant="secondary">Temps: {placeholderResult.stats.extractionTimeMs}ms</Badge>
                      </div>
                      
                      <div className="space-y-1">
                        <Label className="text-xs">Placeholders simples:</Label>
                        <div className="flex flex-wrap gap-1">
                          {placeholderResult.simplePlaceholders.map((placeholder, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {placeholder}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {placeholderResult.helpers.length > 0 && (
                        <div className="space-y-1">
                          <Label className="text-xs">Helpers:</Label>
                          <div className="flex flex-wrap gap-1">
                            {placeholderResult.helpers.map((helper, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {helper}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="validation" className="space-y-4">
              {validationResult && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    {validationResult.isValid ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    )}
                    <span className="font-medium">
                      Validation: {validationResult.isValid ? 'Succès' : 'Échec'}
                    </span>
                  </div>

                  {validationResult.errors.length > 0 && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="space-y-1">
                          {validationResult.errors.map((error, index) => (
                            <p key={index} className="text-sm">{error}</p>
                          ))}
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  {validationResult.warnings.length > 0 && (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        <div className="space-y-1">
                          {validationResult.warnings.map((warning, index) => (
                            <p key={index} className="text-sm">{warning}</p>
                          ))}
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  {Object.keys(validationResult.context).length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Contexte</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <pre className="text-xs bg-gray-100 p-2 rounded">
                          {JSON.stringify(validationResult.context, null, 2)}
                        </pre>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {error && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TemplateRenderer;






