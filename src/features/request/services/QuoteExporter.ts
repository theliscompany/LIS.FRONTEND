import { QuoteJsonGenerator, QuoteJsonFormat } from './QuoteJsonGenerator';
import { QuoteValidator, ValidationResult } from './QuoteValidator';

export interface ExportOptions {
  filename?: string;
  includeMetadata?: boolean;
  format?: 'json' | 'minified';
  emailTemplate?: string;
}

export interface EmailData {
  to: string;
  subject: string;
  template: string;
  attachments: Array<{
    filename: string;
    content: string;
    contentType: string;
  }>;
}

export class QuoteExporter {
  /**
   * Exporte un devis au format JSON avec téléchargement automatique
   */
  static async exportQuoteAsJson(
    selectedOption: any,
    allOptions: any[],
    options: ExportOptions = {}
  ): Promise<void> {
    try {
      // Générer le JSON de devis
      const quoteJson = QuoteJsonGenerator.generateQuoteJson(selectedOption, allOptions);
      
      // Valider le JSON avant export
      const validation = QuoteValidator.validateQuoteJson(quoteJson);
      if (!validation.isValid) {
        throw new Error(`Erreur de validation: ${validation.errors.join(', ')}`);
      }

      // Préparer le contenu JSON
      const jsonContent = options.format === 'minified' 
        ? JSON.stringify(quoteJson)
        : JSON.stringify(quoteJson, null, 2);

      // Créer le blob et télécharger
      const blob = new Blob([jsonContent], {
        type: 'application/json'
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = options.filename || `devis_${quoteJson.reference}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      console.log(`Devis exporté avec succès: ${a.download}`);
    } catch (error) {
      console.error('Erreur lors de l\'export du devis:', error);
      throw error;
    }
  }

  /**
   * Prépare les données d'email pour l'envoi du devis
   */
  static prepareQuoteEmail(
    selectedOption: any,
    allOptions: any[],
    emailData: Partial<EmailData>,
    options: ExportOptions = {}
  ): EmailData {
    // Générer le JSON de devis
    const quoteJson = QuoteJsonGenerator.generateQuoteJson(selectedOption, allOptions);
    
    // Valider le JSON
    const validation = QuoteValidator.validateQuoteJson(quoteJson);
    if (!validation.isValid) {
      throw new Error(`Erreur de validation: ${validation.errors.join(', ')}`);
    }

    // Préparer le contenu JSON pour l'email
    const jsonContent = options.format === 'minified' 
      ? JSON.stringify(quoteJson)
      : JSON.stringify(quoteJson, null, 2);

    // Préparer les données d'email
    const email: EmailData = {
      to: emailData.to || selectedOption?.requestData?.customer?.email || '',
      subject: emailData.subject || `Devis ${quoteJson.reference} - LIS Quotes`,
      template: emailData.template || 'maritime_quote',
      attachments: [
        {
          filename: `devis_${quoteJson.reference}.json`,
          content: jsonContent,
          contentType: 'application/json'
        }
      ]
    };

    return email;
  }

  /**
   * Envoie le devis par email (simulation - à intégrer avec le service d'email réel)
   */
  static async sendQuoteEmail(
    selectedOption: any,
    allOptions: any[],
    emailData: Partial<EmailData>,
    options: ExportOptions = {}
  ): Promise<boolean> {
    try {
      const email = this.prepareQuoteEmail(selectedOption, allOptions, emailData, options);
      
      // Simulation de l'envoi d'email
      console.log('Envoi d\'email simulé:', {
        to: email.to,
        subject: email.subject,
        template: email.template,
        attachments: email.attachments.map(att => att.filename)
      });

      // TODO: Intégrer avec le vrai service d'email
      // await emailService.send(email);
      
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
      return false;
    }
  }

  /**
   * Prépare un aperçu du JSON de devis pour affichage
   */
  static generateQuotePreview(
    selectedOption: any,
    allOptions: any[],
    options: ExportOptions = {}
  ): { json: QuoteJsonFormat; validation: ValidationResult } {
    const quoteJson = QuoteJsonGenerator.generateQuoteJson(selectedOption, allOptions);
    const validation = QuoteValidator.validateQuoteJson(quoteJson);
    
    return {
      json: quoteJson,
      validation
    };
  }

  /**
   * Exporte plusieurs devis en lot
   */
  static async exportMultipleQuotes(
    quotes: Array<{ selectedOption: any; allOptions: any[] }>,
    options: ExportOptions = {}
  ): Promise<void> {
    const zip = new JSZip();
    
    quotes.forEach((quote, index) => {
      const quoteJson = QuoteJsonGenerator.generateQuoteJson(quote.selectedOption, quote.allOptions);
      const jsonContent = options.format === 'minified' 
        ? JSON.stringify(quoteJson)
        : JSON.stringify(quoteJson, null, 2);
      
      zip.file(`devis_${quoteJson.reference}.json`, jsonContent);
    });

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `devis_lot_${new Date().toISOString().split('T')[0]}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Génère un rapport d'export avec statistiques
   */
  static generateExportReport(
    selectedOption: any,
    allOptions: any[]
  ): {
    summary: {
      totalOptions: number;
      totalContainers: number;
      totalCost: number;
      averageTransitTime: number;
    };
    validation: ValidationResult;
    recommendations: string[];
  } {
    const quoteJson = QuoteJsonGenerator.generateQuoteJson(selectedOption, allOptions);
    const validation = QuoteValidator.validateQuoteJson(quoteJson);
    
    // Calculer les statistiques
    const totalOptions = quoteJson.options.length;
    const totalContainers = quoteJson.options.reduce((sum, option) => 
      sum + option.containers.reduce((containerSum, container) => 
        containerSum + container.quantity, 0), 0);
    
    const totalCost = Object.values(quoteJson.totals || {}).reduce((sum: number, total: any) => 
      sum + (total.grandTotal || 0), 0);
    
    const averageTransitTime = quoteJson.options.reduce((sum, option) => 
      sum + option.transit_time, 0) / totalOptions;

    // Générer des recommandations
    const recommendations: string[] = [];
    
    if (validation.warnings.length > 0) {
      recommendations.push('Vérifier les avertissements avant envoi au client');
    }
    
    if (averageTransitTime > 30) {
      recommendations.push('Considérer des options avec des temps de transit plus courts');
    }
    
    if (totalCost > 10000) {
      recommendations.push('Vérifier la compétitivité des prix proposés');
    }

    return {
      summary: {
        totalOptions,
        totalContainers,
        totalCost,
        averageTransitTime: Math.round(averageTransitTime)
      },
      validation,
      recommendations
    };
  }
}

// Interface pour JSZip (à installer si nécessaire)
interface JSZip {
  file(name: string, content: string): void;
  generateAsync(options: { type: string }): Promise<Blob>;
}

// Déclaration globale pour JSZip (à remplacer par l'import réel)
declare const JSZip: {
  new(): JSZip;
}; 