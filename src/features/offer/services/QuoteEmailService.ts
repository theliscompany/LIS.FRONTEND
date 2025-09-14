import { renderById, renderDirect, validateById } from '@features/template/api/templateApi';
import { postApiEmail } from '@features/request/api';
import { DEFAULT_QUOTE_TEMPLATE } from '@features/offer/templates/defaultQuoteTemplate';

export interface QuoteEmailData {
  to: string;
  cc?: string;
  bcc?: string;
  subject?: string;
  templateId?: string;
  customTemplate?: {
    htmlBody: string;
    textBody?: string;
  };
  attachments?: Array<{
    filename: string;
    content: string | Blob;
    contentType: string;
  }>;
}

export interface QuoteData {
  // Informations du devis
  quoteId: string;
  quoteNumber: string;
  status: string;
  createdAt: string;
  expiresAt?: string;
  
  // Informations client
  customer: {
    name: string;
    email: string;
    company?: string;
    phone?: string;
  };
  
  // Informations de transport
  transport: {
    from: string;
    to: string;
    product: string;
    quantity: number;
    unit: string;
  };
  
  // Options et prix
  options: Array<{
    id: string;
    description: string;
    totalPrice: number;
    currency: string;
    details: any;
  }>;
  
  // Informations de l'entreprise
  company: {
    name: string;
    address: string;
    phone: string;
    email: string;
    website: string;
  };
  
  // Données personnalisées
  customData?: Record<string, any>;
}

export interface EmailTemplateResult {
  subject: string;
  htmlBody: string;
  textBody?: string;
  diagnostics?: {
    missingPlaceholders: string[];
    warnings: string[];
    errors: string[];
  };
}

export class QuoteEmailService {
  
  /**
   * Prépare les données du devis pour les templates
   */
  static prepareQuoteData(quote: any): QuoteData {
    const selectedOption = quote.options?.[0];
    
    return {
      quoteId: quote.id,
      quoteNumber: quote.quoteOfferNumber || `DRAFT-${quote.id.slice(-6)}`,
      status: quote.status,
      createdAt: quote.created,
      expiresAt: quote.expirationDate,
      
      customer: {
        name: quote.customer?.contactName || 'Client',
        email: quote.customer?.email || '',
        company: quote.customer?.companyName,
        phone: quote.customer?.phone
      },
      
      transport: {
        from: selectedOption?.requestData?.pickupLocation?.city || 'Départ',
        to: selectedOption?.requestData?.deliveryLocation?.city || 'Arrivée',
        product: selectedOption?.requestData?.goodsDescription || 'Produit',
        quantity: selectedOption?.requestData?.numberOfUnits || 1,
        unit: selectedOption?.requestData?.packingType || 'unité'
      },
      
      options: quote.options?.map((option: any, index: number) => ({
        id: option.id || `option-${index}`,
        description: option.description || `Option ${index + 1}`,
        totalPrice: option.totals?.grandTotal || 0,
        currency: option.haulage?.currency || 'EUR',
        details: option
      })) || [],
      
      company: {
        name: 'Omnifreight',
        address: 'Italiëlei 211, 2000 Antwerpen, Belgium',
        phone: '+32.3.295.38.82',
        email: 'transport@omnifreight.eu',
        website: 'www.omnifreight.eu'
      },
      
      customData: {
        // Données supplémentaires spécifiques au devis
        requestId: quote.requestQuoteId,
        assignedTo: quote.assignedTo,
        lastModified: quote.lastModified,
        // Données des options détaillées
        haulage: selectedOption?.haulage,
        seaFreight: selectedOption?.seaFreight,
        miscellaneous: selectedOption?.miscellaneous
      }
    };
  }

  /**
   * Rendu d'un template avec les données du devis
   */
  static async renderTemplate(
    templateId: string,
    quoteData: QuoteData
  ): Promise<EmailTemplateResult> {
    try {
      const result = await renderById(templateId, quoteData);
      return result;
    } catch (error) {
      console.error('Erreur lors du rendu du template:', error);
      throw new Error('Impossible de rendre le template');
    }
  }

  /**
   * Rendu d'un template personnalisé
   */
  static async renderCustomTemplate(
    template: { htmlBody: string; textBody?: string },
    quoteData: QuoteData
  ): Promise<EmailTemplateResult> {
    try {
      const result = await renderDirect({
        htmlBody: template.htmlBody,
        textBody: template.textBody,
        data: quoteData
      });
      return result;
    } catch (error) {
      console.error('Erreur lors du rendu du template personnalisé:', error);
      throw new Error('Impossible de rendre le template personnalisé');
    }
  }

  /**
   * Validation des données pour un template
   */
  static async validateTemplateData(
    templateId: string,
    quoteData: QuoteData
  ): Promise<{
    isValid: boolean;
    missingPlaceholders: string[];
    warnings: string[];
    errors: string[];
  }> {
    try {
      const result = await validateById(templateId, quoteData);
      return result;
    } catch (error) {
      console.error('Erreur lors de la validation:', error);
      return {
        isValid: false,
        missingPlaceholders: [],
        warnings: [],
        errors: ['Erreur lors de la validation']
      };
    }
  }

  /**
   * Envoi d'un email avec template
   */
  static async sendQuoteEmail(
    quote: any,
    emailData: QuoteEmailData
  ): Promise<boolean> {
    try {
      // Préparer les données du devis
      const quoteData = this.prepareQuoteData(quote);
      
      // Rendre le template
      let templateResult: EmailTemplateResult;
      
      if (emailData.templateId) {
        // Utiliser un template sauvegardé
        templateResult = await this.renderTemplate(emailData.templateId, quoteData);
      } else if (emailData.customTemplate) {
        // Utiliser un template personnalisé
        templateResult = await this.renderCustomTemplate(emailData.customTemplate, quoteData);
      } else {
        throw new Error('Aucun template spécifié');
      }

      // Préparer les pièces jointes
      const attachments: File[] = [];
      if (emailData.attachments) {
        for (const attachment of emailData.attachments) {
          if (typeof attachment.content === 'string') {
            // Créer un fichier à partir du contenu string
            const blob = new Blob([attachment.content], { type: attachment.contentType });
            const file = new File([blob], attachment.filename, { type: attachment.contentType });
            attachments.push(file);
          } else {
            // Le contenu est déjà un Blob/File
            const file = new File([attachment.content], attachment.filename, { type: attachment.contentType });
            attachments.push(file);
          }
        }
      }

      // Envoyer l'email
      await postApiEmail({
        body: {
          From: 'transport@omnifreight.eu',
          To: emailData.to,
          Subject: emailData.subject || templateResult.subject,
          HtmlContent: templateResult.htmlBody,
          Attachments: attachments
        }
      });

      console.log('[QuoteEmailService] Email envoyé avec succès:', {
        to: emailData.to,
        subject: emailData.subject || templateResult.subject,
        templateId: emailData.templateId,
        attachments: attachments.length
      });

      return true;
    } catch (error) {
      console.error('[QuoteEmailService] Erreur lors de l\'envoi de l\'email:', error);
      return false;
    }
  }

  /**
   * Génère un aperçu de l'email sans l'envoyer
   */
  static async previewQuoteEmail(
    quote: any,
    emailData: QuoteEmailData
  ): Promise<EmailTemplateResult> {
    const quoteData = this.prepareQuoteData(quote);
    
    if (emailData.templateId) {
      return await this.renderTemplate(emailData.templateId, quoteData);
    } else if (emailData.customTemplate) {
      return await this.renderCustomTemplate(emailData.customTemplate, quoteData);
    } else {
      throw new Error('Aucun template spécifié');
    }
  }

  /**
   * Génère un template par défaut pour les devis
   */
  static getDefaultQuoteTemplate(): { htmlBody: string; textBody: string } {
    return DEFAULT_QUOTE_TEMPLATE;
  }
}
