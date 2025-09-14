import { QuoteJsonFormat, QuoteOption, Container } from './QuoteJsonGenerator';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export class QuoteValidator {
  static validateQuoteJson(quoteJson: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Validation de la structure de base
    if (!quoteJson) {
      errors.push('Le JSON de devis est vide ou invalide');
      return { isValid: false, errors, warnings, suggestions };
    }

    // Validation des champs obligatoires
    this.validateRequiredFields(quoteJson, errors);
    
    // Validation des options
    this.validateOptions(quoteJson.options, errors, warnings);
    
    // Validation des conteneurs
    this.validateContainers(quoteJson.options, errors, warnings);
    
    // Validation des calculs
    this.validateCalculations(quoteJson, errors, warnings);
    
    // Validation des métadonnées
    this.validateMetadata(quoteJson.metadata, warnings, suggestions);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  private static validateRequiredFields(quoteJson: any, errors: string[]): void {
    const requiredFields = [
      'reference', 'client', 'date', 'origin', 'destination', 
      'incoterm', 'validity', 'options', 'remarks'
    ];

    requiredFields.forEach(field => {
      if (!quoteJson[field]) {
        errors.push(`Champ obligatoire manquant: ${field}`);
      }
    });

    // Validation spécifique de la référence
    if (quoteJson.reference && !this.isValidReference(quoteJson.reference)) {
      errors.push('Format de référence invalide (format attendu: DEVYYYY-MMDD-XXX)');
    }

    // Validation de la date
    if (quoteJson.date && !this.isValidDate(quoteJson.date)) {
      errors.push('Format de date invalide');
    }
  }

  private static validateOptions(options: QuoteOption[], errors: string[], warnings: string[]): void {
    if (!Array.isArray(options)) {
      errors.push('Le champ "options" doit être un tableau');
      return;
    }

    if (options.length === 0) {
      errors.push('Aucune option définie dans le devis');
      return;
    }

    options.forEach((option, index) => {
      // Validation de l'ID de l'option
      if (!option.option_id) {
        errors.push(`Option ${index + 1}: ID d'option manquant`);
      }

      // Validation du temps de transit
      if (typeof option.transit_time !== 'number' || option.transit_time <= 0) {
        errors.push(`Option ${index + 1}: Temps de transit invalide`);
      } else if (option.transit_time > 60) {
        warnings.push(`Option ${index + 1}: Temps de transit élevé (${option.transit_time} jours)`);
      }

      // Validation du port de chargement
      if (!option.port_of_loading) {
        errors.push(`Option ${index + 1}: Port de chargement manquant`);
      }

      // Validation des conteneurs
      if (!Array.isArray(option.containers) || option.containers.length === 0) {
        errors.push(`Option ${index + 1}: Aucun conteneur défini`);
      }
    });
  }

  private static validateContainers(options: QuoteOption[], errors: string[], warnings: string[]): void {
    options.forEach((option, optionIndex) => {
      option.containers?.forEach((container, containerIndex) => {
        const containerId = `${option.option_id} - Conteneur ${containerIndex + 1}`;

        // Validation du type de conteneur
        if (!container.type) {
          errors.push(`${containerId}: Type de conteneur manquant`);
        } else if (!this.isValidContainerType(container.type)) {
          warnings.push(`${containerId}: Type de conteneur non standard (${container.type})`);
        }

        // Validation de la quantité
        if (typeof container.quantity !== 'number' || container.quantity <= 0) {
          errors.push(`${containerId}: Quantité invalide`);
        }

        // Validation des coûts de transport routier
        this.validateHaulageCosts(container.unit_haulage, containerId, errors, warnings);

        // Validation des coûts de fret maritime
        this.validateSeafreightCosts(container.unit_seafreight, containerId, errors, warnings);

        // Validation des services
        this.validateServiceCosts(container.unit_services, containerId, errors, warnings);
      });
    });
  }

  private static validateHaulageCosts(haulageCosts: any[], containerId: string, errors: string[], warnings: string[]): void {
    if (!Array.isArray(haulageCosts)) {
      errors.push(`${containerId}: Coûts de transport routier invalides`);
      return;
    }

    haulageCosts.forEach((cost, index) => {
      if (!cost.description || !cost.amount) {
        errors.push(`${containerId}: Coût de transport routier ${index + 1} incomplet`);
      }

      if (typeof cost.amount !== 'number' || cost.amount < 0) {
        errors.push(`${containerId}: Montant de transport routier ${index + 1} invalide`);
      }

      if (cost.amount > 500) {
        warnings.push(`${containerId}: Coût de transport routier élevé (${cost.amount}€)`);
      }
    });
  }

  private static validateSeafreightCosts(seafreightCosts: any, containerId: string, errors: string[], warnings: string[]): void {
    if (!seafreightCosts) {
      errors.push(`${containerId}: Coûts de fret maritime manquants`);
      return;
    }

    // Validation du fret de base
    if (!seafreightCosts.freight || !seafreightCosts.freight.description || !seafreightCosts.freight.amount) {
      errors.push(`${containerId}: Fret maritime de base incomplet`);
    }

    if (typeof seafreightCosts.freight?.amount !== 'number' || seafreightCosts.freight.amount < 0) {
      errors.push(`${containerId}: Montant du fret maritime invalide`);
    }

    // Validation des surcharges
    if (!Array.isArray(seafreightCosts.surcharges)) {
      errors.push(`${containerId}: Surcharges invalides`);
    } else {
      seafreightCosts.surcharges.forEach((surcharge: any, index: number) => {
        if (!surcharge.code || typeof surcharge.amount !== 'number') {
          errors.push(`${containerId}: Surcharge ${index + 1} invalide`);
        }
      });
    }
  }

  private static validateServiceCosts(serviceCosts: any[], containerId: string, errors: string[], warnings: string[]): void {
    if (!Array.isArray(serviceCosts)) {
      errors.push(`${containerId}: Services invalides`);
      return;
    }

    serviceCosts.forEach((service, index) => {
      if (!service.description || typeof service.amount !== 'number') {
        errors.push(`${containerId}: Service ${index + 1} incomplet`);
      }

      if (service.amount < 0) {
        errors.push(`${containerId}: Montant du service ${index + 1} négatif`);
      }
    });
  }

  private static validateCalculations(quoteJson: any, errors: string[], warnings: string[]): void {
    if (!quoteJson.totals) {
      warnings.push('Totaux non calculés automatiquement');
      return;
    }

    // Vérifier que les totaux sont cohérents avec les données
    Object.entries(quoteJson.totals).forEach(([optionKey, totals]: [string, any]) => {
      const expectedTotal = (totals.haulageTotal || 0) + (totals.seafreightTotal || 0) + (totals.servicesTotal || 0);
      
      if (Math.abs(expectedTotal - totals.grandTotal) > 0.01) {
        errors.push(`${optionKey}: Incohérence dans le calcul du total (attendu: ${expectedTotal}, calculé: ${totals.grandTotal})`);
      }
    });
  }

  private static validateMetadata(metadata: any, warnings: string[], suggestions: string[]): void {
    if (!metadata) {
      warnings.push('Métadonnées manquantes');
      return;
    }

    if (!metadata.generatedAt) {
      warnings.push('Date de génération manquante');
    }

    if (!metadata.version) {
      warnings.push('Version du format manquante');
    }

    if (metadata.currency && metadata.currency !== 'EUR') {
      suggestions.push(`Considérer l'utilisation de l'EUR comme devise standard (actuel: ${metadata.currency})`);
    }
  }

  private static isValidReference(reference: string): boolean {
    // Format: DEVYYYY-MMDD-XXX
    const pattern = /^DEV\d{4}-\d{2}\d{2}-\d{3}$/;
    return pattern.test(reference);
  }

  private static isValidDate(date: string): boolean {
    // Vérifier si c'est une date valide
    const dateObj = new Date(date);
    return !isNaN(dateObj.getTime());
  }

  private static isValidContainerType(containerType: string): boolean {
    const validTypes = [
      '20\' DC', '20\' HC', '20\' RF', '20\' OT',
      '40\' DC', '40\' HC', '40\' RF', '40\' OT',
      '45\' HC', 'LCL'
    ];
    return validTypes.includes(containerType);
  }

  // Méthode pour valider un devis complet avec données réelles
  static validateQuoteWithRealData(quoteJson: any, originalData: any): ValidationResult {
    const baseValidation = this.validateQuoteJson(quoteJson);
    
    if (!baseValidation.isValid) {
      return baseValidation;
    }

    const errors = [...baseValidation.errors];
    const warnings = [...baseValidation.warnings];
    const suggestions = [...baseValidation.suggestions];

    // Validation croisée avec les données originales
    this.crossValidateWithOriginalData(quoteJson, originalData, errors, warnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  private static crossValidateWithOriginalData(quoteJson: any, originalData: any, errors: string[], warnings: string[]): void {
    // Vérifier que le client correspond
    if (originalData?.requestData?.customer?.contactName && 
        quoteJson.client !== originalData.requestData.customer.contactName) {
      warnings.push('Nom du client différent entre les données originales et le JSON');
    }

    // Vérifier que les ports correspondent
    if (originalData?.requestData?.portFrom?.name && 
        !quoteJson.origin.includes(originalData.requestData.portFrom.name)) {
      warnings.push('Port de départ différent entre les données originales et le JSON');
    }

    if (originalData?.requestData?.portTo?.name && 
        !quoteJson.destination.includes(originalData.requestData.portTo.name)) {
      warnings.push('Port de destination différent entre les données originales et le JSON');
    }

    // Vérifier que l'incoterm correspond
    if (originalData?.requestData?.incotermName && 
        quoteJson.incoterm !== originalData.requestData.incotermName) {
      warnings.push('Incoterm différent entre les données originales et le JSON');
    }
  }
} 