import { formatAddress } from '@utils/functions';

// Types pour le JSON de devis
export interface QuoteJsonFormat {
  reference: string;
  client: string;
  date: string;
  origin: string;
  destination: string;
  incoterm: string;
  validity: string;
  options: QuoteOption[];
  remarks: string[];
  metadata?: {
    generatedAt: string;
    version: string;
    currency: string;
    exchangeRate: number;
  };
  totals?: {
    [key: string]: {
      haulageTotal: number;
      seafreightTotal: number;
      servicesTotal: number;
      grandTotal: number;
    };
  };
}

export interface QuoteOption {
  option_id: string;
  transit_time: number;
  port_of_loading: string;
  containers: Container[];
}

export interface Container {
  type: string;
  quantity: number;
  unit_haulage: HaulageCost[];
  unit_seafreight: SeafreightCost;
  unit_services: ServiceCost[];
}

export interface HaulageCost {
  description: string;
  amount: number;
}

export interface SeafreightCost {
  freight: {
    description: string;
    amount: number;
  };
  surcharges: Surcharge[];
}

export interface Surcharge {
  code: string;
  amount: number;
}

export interface ServiceCost {
  description: string;
  amount: number;
}

export class QuoteJsonGenerator {
  static generateQuoteJson(
    selectedOption: any, 
    allOptions: any[],
    clientData?: any
  ): QuoteJsonFormat {
    const reference = this.generateReference();
    const client = selectedOption?.requestData?.customer?.contactName || 'Client';
    const date = new Date().toLocaleDateString('fr-FR');
    
    return {
      reference,
      client,
      date,
      origin: this.formatOrigin(selectedOption),
      destination: this.formatDestination(selectedOption),
      incoterm: selectedOption?.requestData?.incotermName || 'FOB',
      validity: '14 jours',
      options: this.generateOptions(allOptions),
      remarks: this.generateRemarks(selectedOption),
      metadata: {
        generatedAt: new Date().toISOString(),
        version: '1.0',
        currency: 'EUR',
        exchangeRate: 1.0
      },
      totals: this.calculateTotals(allOptions)
    };
  }

  private static generateReference(): string {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const day = String(new Date().getDate()).padStart(2, '0');
    const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
    return `DEV${year}-${month}${day}-${random}`;
  }

  private static formatOrigin(selectedOption: any): string {
    const portFrom = selectedOption?.requestData?.portFrom;
    const cityFrom = selectedOption?.requestData?.cityFrom;
    
    if (portFrom?.name) {
      return `${portFrom.name} (${portFrom.unlocode || 'N/A'})`;
    }
    
    if (cityFrom?.name) {
      return cityFrom.name;
    }
    
    return 'Belgique / Pays-Bas';
  }

  private static formatDestination(selectedOption: any): string {
    const portTo = selectedOption?.requestData?.portTo;
    const cityTo = selectedOption?.requestData?.cityTo;
    
    if (portTo?.name) {
      return `${portTo.name} (${portTo.unlocode || 'N/A'})`;
    }
    
    if (cityTo?.name) {
      return cityTo.name;
    }
    
    return 'Douala, Cameroun (CMDLA)';
  }

  private static generateOptions(allOptions: any[]): QuoteOption[] {
    return allOptions.map((option, index) => ({
      option_id: `Option ${index + 1}`,
      transit_time: this.calculateTransitTime(option),
      port_of_loading: this.formatPortOfLoading(option),
      containers: this.generateContainers(option)
    }));
  }

  private static calculateTransitTime(option: any): number {
    // Calcul basé sur les données de fret maritime
    if (option.selectedSeafreights && option.selectedSeafreights.length > 0) {
      return option.selectedSeafreights[0].transitTimeDays || 20;
    }
    
    // Valeurs par défaut selon le type de transport
    const portFrom = option.requestData?.portFrom?.unlocode;
    const portTo = option.requestData?.portTo?.unlocode;
    
    if (portFrom === 'BEANR' && portTo === 'CMDLA') {
      return 20; // Anvers vers Douala
    }
    
    if (portFrom === 'NLRTM' && portTo === 'CMDLA') {
      return 22; // Rotterdam vers Douala
    }
    
    return 25; // Valeur par défaut
  }

  private static formatPortOfLoading(option: any): string {
    const portFrom = option.requestData?.portFrom;
    if (portFrom?.name && portFrom?.unlocode) {
      return `${portFrom.name} (${portFrom.unlocode})`;
    }
    
    // Déterminer le port selon les données disponibles
    if (option.selectedSeafreights && option.selectedSeafreights.length > 0) {
      const seafreight = option.selectedSeafreights[0];
      if (seafreight.departurePort?.name) {
        return `${seafreight.departurePort.name} (${seafreight.departurePort.unlocode || 'N/A'})`;
      }
    }
    
    return 'Anvers (BEANR)'; // Port par défaut
  }

  private static generateContainers(option: any): Container[] {
    const containers: Container[] = [];
    
    // Gérer les conteneurs sélectionnés
    if (option.selectedContainers) {
      Object.entries(option.selectedContainers).forEach(([containerType, quantity]) => {
        if (quantity && quantity > 0) {
          containers.push({
            type: containerType,
            quantity: Number(quantity),
            unit_haulage: this.generateHaulageCosts(option, containerType),
            unit_seafreight: this.generateSeafreightCosts(option, containerType),
            unit_services: this.generateServiceCosts(option, containerType)
          });
        }
      });
    }
    
    // Si aucun conteneur défini, créer un conteneur par défaut
    if (containers.length === 0) {
      containers.push({
        type: '20\' DC',
        quantity: 1,
        unit_haulage: this.generateHaulageCosts(option, '20\' DC'),
        unit_seafreight: this.generateSeafreightCosts(option, '20\' DC'),
        unit_services: this.generateServiceCosts(option, '20\' DC')
      });
    }
    
    return containers;
  }

  private static generateHaulageCosts(option: any, containerType: string): HaulageCost[] {
    const costs: HaulageCost[] = [];
    
    if (option.selectedHaulage) {
      const haulage = option.selectedHaulage;
      const baseCost = this.getHaulageBaseCost(containerType);
      
      costs.push({
        description: 'Ramassage dépôt',
        amount: baseCost
      });
      
      costs.push({
        description: `Livraison port ${this.getPortName(option)}`,
        amount: baseCost + 20 // Coût supplémentaire pour la livraison
      });
    }
    
    return costs;
  }

  private static generateSeafreightCosts(option: any, containerType: string): SeafreightCost {
    const freightCost = this.getSeafreightBaseCost(containerType);
    const surcharges = this.generateSurcharges(containerType);
    
    return {
      freight: {
        description: `Fret maritime ${containerType} - ${this.getRouteDescription(option)}`,
        amount: freightCost
      },
      surcharges
    };
  }

  private static generateServiceCosts(option: any, containerType: string): ServiceCost[] {
    const costs: ServiceCost[] = [];
    
    // Services de base selon le type de conteneur
    if (containerType.includes('20')) {
      costs.push({
        description: 'Assurance',
        amount: 30.0
      });
      costs.push({
        description: 'Déclaration douanière',
        amount: 50.0
      });
    } else if (containerType.includes('40')) {
      costs.push({
        description: 'Assurance',
        amount: 45.0
      });
      costs.push({
        description: 'Frais de documentation',
        amount: 20.0
      });
    } else if (containerType === 'LCL') {
      costs.push({
        description: 'Frais de documentation',
        amount: 15.0
      });
      costs.push({
        description: 'Assurance proportionnelle',
        amount: 20.0
      });
    }
    
    return costs;
  }

  private static getHaulageBaseCost(containerType: string): number {
    switch (containerType) {
      case '20\' DC':
        return 100.0;
      case '40\' HC':
        return 110.0;
      case 'LCL':
        return 50.0;
      default:
        return 100.0;
    }
  }

  private static getSeafreightBaseCost(containerType: string): number {
    switch (containerType) {
      case '20\' DC':
        return 950.0;
      case '40\' HC':
        return 1600.0;
      case 'LCL':
        return 380.0;
      default:
        return 950.0;
    }
  }

  private static generateSurcharges(containerType: string): Surcharge[] {
    const surcharges: Surcharge[] = [];
    
    switch (containerType) {
      case '20\' DC':
        surcharges.push({ code: 'BAF', amount: 45.0 });
        surcharges.push({ code: 'CAF', amount: 35.0 });
        break;
      case '40\' HC':
        surcharges.push({ code: 'BAF', amount: 65.0 });
        break;
      case 'LCL':
        surcharges.push({ code: 'PSS', amount: 30.0 });
        break;
    }
    
    return surcharges;
  }

  private static getPortName(option: any): string {
    const portFrom = option.requestData?.portFrom;
    if (portFrom?.name) {
      return portFrom.name;
    }
    return 'Anvers';
  }

  private static getRouteDescription(option: any): string {
    const portFrom = option.requestData?.portFrom?.unlocode || 'BEANR';
    const portTo = option.requestData?.portTo?.unlocode || 'CMDLA';
    return `${portFrom} → ${portTo}`;
  }

  private static generateRemarks(selectedOption: any): string[] {
    return [
      'Validité du prix sous réserve de disponibilité navire & équipements.',
      'Les délais sont indicatifs et non contractuels.',
      'Les frais à destination ne sont pas inclus dans ce devis.',
      'Des frais opérationnels supplémentaires peuvent s\'appliquer en cas de manquements, oublis ou retards imputables au client (ex. : absence de documentation, erreurs dans les instructions, retard dans le chargement, non-respect des délais convenus). Ces frais peuvent inclure, sans s\'y limiter : frais de stockage, surestaries, détentions, rebooking, ajustements douaniers ou pénalités imposées par les prestataires tiers.'
    ];
  }

  private static calculateTotals(allOptions: any[]): any {
    const totals: any = {};
    
    allOptions.forEach((option, index) => {
      const optionKey = `option${index + 1}`;
      let haulageTotal = 0;
      let seafreightTotal = 0;
      let servicesTotal = 0;
      
      // Calculer les totaux pour cette option
      if (option.selectedContainers) {
        Object.entries(option.selectedContainers).forEach(([containerType, quantity]) => {
          const qty = Number(quantity);
          haulageTotal += this.getHaulageBaseCost(containerType) * qty * 2; // Ramassage + livraison
          seafreightTotal += this.getSeafreightBaseCost(containerType) * qty;
          
          // Services
          if (containerType.includes('20')) {
            servicesTotal += (30 + 50) * qty; // Assurance + Déclaration
          } else if (containerType.includes('40')) {
            servicesTotal += (45 + 20) * qty; // Assurance + Documentation
          } else if (containerType === 'LCL') {
            servicesTotal += (15 + 20) * qty; // Documentation + Assurance proportionnelle
          }
        });
      }
      
      totals[optionKey] = {
        haulageTotal,
        seafreightTotal,
        servicesTotal,
        grandTotal: haulageTotal + seafreightTotal + servicesTotal
      };
    });
    
    return totals;
  }
} 