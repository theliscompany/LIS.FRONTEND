export interface DetectedObjectType {
  typeName: string;
  description: string;
  properties: Record<string, PropertySchema>;
  module: string;
  source: string;
}

export interface PropertySchema {
  type: string;
  required: boolean;
  description?: string;
  isArray: boolean;
  isOptional: boolean;
  format?: string;
}

export interface SDKTypesData {
  generatedAt: string;
  totalTypes: number;
  modules: string[];
  types: DetectedObjectType[];
}

export class SDKAnalyzer {
  private modules = [
    'crm',
    'document', 
    'masterdata',
    'offer',
    'pricingnew',
    'request',
    'sessionstorage',
    'shipment'
  ];

  /**
   * Load detected types from the generated JSON file
   */
  async loadFromJsonFile(): Promise<DetectedObjectType[]> {
    try {
      // Try to import the JSON file
      const response = await fetch('/src/features/template/data/detected-types.json');
      if (!response.ok) {
        console.warn('Could not load detected-types.json:', response.status, response.statusText);
        return [];
      }
      
      const data: SDKTypesData = await response.json();
      console.log(`📊 Loaded ${data.totalTypes} types from JSON file (generated: ${data.generatedAt})`);
      return data.types;
    } catch (error) {
      console.warn('Failed to load types from JSON file:', error);
      return [];
    }
  }

  /**
   * Analyze all SDK modules and extract object types
   */
  async analyzeAllSDKs(): Promise<DetectedObjectType[]> {
    const allTypes: DetectedObjectType[] = [];
    
    for (const module of this.modules) {
      try {
        const moduleTypes = await this.analyzeModule(module);
        allTypes.push(...moduleTypes);
      } catch (error) {
        console.warn(`Failed to analyze module ${module}:`, error);
      }
    }
    
    return allTypes;
  }

  /**
   * Analyze a specific module's types.gen.ts file
   */
  private async analyzeModule(moduleName: string): Promise<DetectedObjectType[]> {
    try {
      // Try to fetch the types.gen.ts file content via the dev server
      const response = await fetch(`/src/features/${moduleName}/api/types.gen.ts`);
      if (!response.ok) {
        console.warn(`Could not fetch types for module ${moduleName}: ${response.status} ${response.statusText}`);
        return [];
      }
      
      const fileContent = await response.text();
      return this.parseTypeScriptFile(fileContent, moduleName);
    } catch (error) {
      console.warn(`Failed to analyze module ${moduleName}:`, error);
      return [];
    }
  }

  /**
   * Parse TypeScript file content and extract type definitions
   */
  private parseTypeScriptFile(fileContent: string, moduleName: string): DetectedObjectType[] {
    const types: DetectedObjectType[] = [];
    
    // Regular expressions to match type definitions with multiline support
    const typePattern = /export\s+type\s+(\w+)\s*=\s*\{([\s\S]*?)\};?$/gm;
    const interfacePattern = /export\s+interface\s+(\w+)\s*\{([\s\S]*?)\};?$/gm;
    
    // Match both type and interface definitions
    let match;
    
    // Process type definitions
    while ((match = typePattern.exec(fileContent)) !== null) {
      const typeName = match[1];
      const propertiesContent = match[2];
      
      if (!this.shouldSkipType(typeName)) {
        const properties = this.parseProperties(propertiesContent);
        if (Object.keys(properties).length > 0) {
          types.push({
            typeName,
            description: this.generateDescription(typeName, moduleName),
            properties,
            module: moduleName,
            source: `${moduleName}/api/types.gen.ts`
          });
        }
      }
    }
    
    // Process interface definitions
    while ((match = interfacePattern.exec(fileContent)) !== null) {
      const typeName = match[1];
      const propertiesContent = match[2];
      
      if (!this.shouldSkipType(typeName)) {
        const properties = this.parseProperties(propertiesContent);
        if (Object.keys(properties).length > 0) {
          types.push({
            typeName,
            description: this.generateDescription(typeName, moduleName),
            properties,
            module: moduleName,
            source: `${moduleName}/api/types.gen.ts`
          });
        }
      }
    }
    
    return types;
  }

  /**
   * Parse properties from TypeScript type definition
   */
  private parseProperties(propertiesContent: string): Record<string, PropertySchema> {
    const properties: Record<string, PropertySchema> = {};
    
    // Split by lines and process each property
    const lines = propertiesContent.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine.startsWith('//') || trimmedLine.startsWith('/*')) continue;
      
      // Match property definition with more complex patterns
      // propertyName?: type | unionType;
      // propertyName: type;
      // propertyName?: (type) | null;
      const propertyMatch = trimmedLine.match(/^(\w+)\??\s*:\s*(.+?);?$/);
      if (propertyMatch) {
        const propertyName = propertyMatch[1];
        const typeDefinition = propertyMatch[2].trim();
        
        const propertySchema = this.parseTypeDefinition(propertyName, typeDefinition);
        if (propertySchema) {
          properties[propertyName] = propertySchema;
        }
      }
    }
    
    return properties;
  }

  /**
   * Parse a TypeScript type definition
   */
  private parseTypeDefinition(propertyName: string, typeDefinition: string): PropertySchema | null {
    const isOptional = propertyName.includes('?');
    const cleanPropertyName = propertyName.replace('?', '');
    
    let type = 'string';
    let isArray = false;
    
    // Clean up the type definition
    let cleanTypeDef = typeDefinition
      .replace(/\(/g, '')  // Remove parentheses
      .replace(/\)/g, '')
      .replace(/\|/g, '')  // Remove union operators
      .replace(/null/g, '') // Remove null
      .trim();
    
    // Handle complex type definitions
    if (cleanTypeDef.includes('Array<') || cleanTypeDef.includes('[]')) {
      type = 'array';
      isArray = true;
    } else if (cleanTypeDef.includes('number')) {
      type = 'number';
    } else if (cleanTypeDef.includes('boolean')) {
      type = 'boolean';
    } else if (cleanTypeDef.includes('Date')) {
      type = 'date';
    } else if (cleanTypeDef.includes('string')) {
      type = 'string';
    } else if (cleanTypeDef.includes('object') || cleanTypeDef.includes('{') || cleanTypeDef.includes('Record<')) {
      type = 'object';
    } else if (cleanTypeDef.includes('unknown')) {
      type = 'unknown';
    } else if (cleanTypeDef.includes('File')) {
      type = 'file';
    } else if (cleanTypeDef.includes('enum') || cleanTypeDef.includes('Enum')) {
      type = 'enum';
    } else {
      // Default to string for unknown types
      type = 'string';
    }
    
    return {
      type,
      required: !isOptional,
      isArray,
      isOptional
    };
  }

  /**
   * Determine if a type should be skipped
   */
  private shouldSkipType(typeName: string): boolean {
    const skipPatterns = [
      /ApiResponse$/,
      /Data$/,
      /Response$/,
      /Error$/,
      /Request$/,
      /Transformer$/,
      /ModelResponseTransformer$/,
      /ResponseTransformer$/,
      /^__f__/, // Anonymous types
      /^PagedResult/,
      /^GetApi/,
      /^PostApi/,
      /^PutApi/,
      /^DeleteApi/,
      /^OptionsApi/,
      /^default$/,
      /^__esModule$/
    ];
    
    return skipPatterns.some(pattern => pattern.test(typeName));
  }

  /**
   * Generate a description for a detected type
   */
  private generateDescription(typeName: string, moduleName: string): string {
    const moduleDescriptions: Record<string, string> = {
      'crm': 'Customer Relationship Management',
      'document': 'Document Management',
      'masterdata': 'Master Data',
      'offer': 'Quote and Offer Management',
      'pricingnew': 'Pricing and Freight',
      'request': 'Request Management',
      'sessionstorage': 'Session Storage',
      'shipment': 'Shipment Management'
    };
    
    const moduleDesc = moduleDescriptions[moduleName] || moduleName;
    return `${typeName} from ${moduleDesc} module`;
  }

  /**
   * Filter detected types by module
   */
  filterByModule(types: DetectedObjectType[], moduleName: string): DetectedObjectType[] {
    return types.filter(type => type.module === moduleName);
  }

  /**
   * Search detected types by name or description
   */
  searchTypes(types: DetectedObjectType[], searchTerm: string): DetectedObjectType[] {
    const lowerSearchTerm = searchTerm.toLowerCase();
    return types.filter(type => 
      type.typeName.toLowerCase().includes(lowerSearchTerm) ||
      type.description.toLowerCase().includes(lowerSearchTerm) ||
      type.module.toLowerCase().includes(lowerSearchTerm)
    );
  }

  /**
   * Get real detected types from the offer module (as an example)
   */
  getRealDetectedTypes(): DetectedObjectType[] {
    return [
      {
        typeName: 'AddressDto',
        description: 'Address from Offer module',
        module: 'offer',
        source: 'offer/api/types.gen.ts',
        properties: {
          company: { type: 'string', required: true, isArray: false, isOptional: false },
          addressLine: { type: 'string', required: true, isArray: false, isOptional: false },
          city: { type: 'string', required: true, isArray: false, isOptional: false },
          postalCode: { type: 'string', required: true, isArray: false, isOptional: false },
          country: { type: 'string', required: true, isArray: false, isOptional: false }
        }
      },
      {
        typeName: 'AddressInfo',
        description: 'Address information from Offer module',
        module: 'offer',
        source: 'offer/api/types.gen.ts',
        properties: {
          company: { type: 'string', required: false, isArray: false, isOptional: true },
          addressLine: { type: 'string', required: false, isArray: false, isOptional: true },
          city: { type: 'string', required: false, isArray: false, isOptional: true },
          postalCode: { type: 'string', required: false, isArray: false, isOptional: true },
          country: { type: 'string', required: false, isArray: false, isOptional: true }
        }
      },
      {
        typeName: 'CustomerInfo',
        description: 'Customer information from Offer module',
        module: 'offer',
        source: 'offer/api/types.gen.ts',
        properties: {
          contactId: { type: 'number', required: false, isArray: false, isOptional: true },
          contactName: { type: 'string', required: false, isArray: false, isOptional: true },
          companyName: { type: 'string', required: false, isArray: false, isOptional: true },
          email: { type: 'string', required: false, isArray: false, isOptional: true },
          phone: { type: 'string', required: false, isArray: false, isOptional: true }
        }
      },
      {
        typeName: 'DraftData',
        description: 'Draft data from Offer module',
        module: 'offer',
        source: 'offer/api/types.gen.ts',
        properties: {
          requestData: { type: 'object', required: false, isArray: false, isOptional: true },
          requestId: { type: 'string', required: false, isArray: false, isOptional: true },
          step1: { type: 'object', required: true, isArray: false, isOptional: false },
          step2: { type: 'object', required: true, isArray: false, isOptional: false },
          step3: { type: 'object', required: true, isArray: false, isOptional: false },
          selectedHaulage: { type: 'object', required: false, isArray: false, isOptional: true },
          selectedSeafreights: { type: 'array', required: false, isArray: true, isOptional: true },
          selectedMiscellaneous: { type: 'array', required: false, isArray: true, isOptional: true },
          marginType: { type: 'string', required: false, isArray: false, isOptional: true },
          marginValue: { type: 'number', required: false, isArray: false, isOptional: true },
          totalPrice: { type: 'number', required: false, isArray: false, isOptional: true },
          haulageTotal: { type: 'number', required: false, isArray: false, isOptional: true },
          seafreightTotal: { type: 'number', required: false, isArray: false, isOptional: true },
          miscTotal: { type: 'number', required: false, isArray: false, isOptional: true },
          totalTEU: { type: 'number', required: false, isArray: false, isOptional: true },
          haulageQuantity: { type: 'number', required: false, isArray: false, isOptional: true },
          seafreightQuantities: { type: 'object', required: false, isArray: false, isOptional: true },
          miscQuantities: { type: 'object', required: false, isArray: false, isOptional: true },
          surchargeQuantities: { type: 'object', required: false, isArray: false, isOptional: true },
          savedOptions: { type: 'array', required: false, isArray: true, isOptional: true },
          currentStep: { type: 'number', required: false, isArray: false, isOptional: true },
          activeStep: { type: 'number', required: false, isArray: false, isOptional: true },
          status: { type: 'string', required: false, isArray: false, isOptional: true },
          lastModified: { type: 'date', required: false, isArray: false, isOptional: true },
          emailUser: { type: 'string', required: false, isArray: false, isOptional: true },
          created: { type: 'date', required: false, isArray: false, isOptional: true }
        }
      },
      {
        typeName: 'QuoteOption',
        description: 'Quote option from Offer module',
        module: 'offer',
        source: 'offer/api/types.gen.ts',
        properties: {
          id: { type: 'string', required: false, isArray: false, isOptional: true },
          optionId: { type: 'string', required: false, isArray: false, isOptional: true },
          description: { type: 'string', required: false, isArray: false, isOptional: true },
          haulage: { type: 'object', required: false, isArray: false, isOptional: true },
          seaFreight: { type: 'object', required: false, isArray: false, isOptional: true },
          miscellaneous: { type: 'array', required: false, isArray: true, isOptional: true },
          deliveryAddress: { type: 'object', required: false, isArray: false, isOptional: true },
          totals: { type: 'object', required: false, isArray: false, isOptional: true },
          portDeparture: { type: 'object', required: false, isArray: false, isOptional: true },
          portDestination: { type: 'object', required: false, isArray: false, isOptional: true }
        }
      },
      {
        typeName: 'RequestData',
        description: 'Request data from Offer module',
        module: 'offer',
        source: 'offer/api/types.gen.ts',
        properties: {
          requestQuoteId: { type: 'string', required: false, isArray: false, isOptional: true },
          trackingNumber: { type: 'string', required: false, isArray: false, isOptional: true },
          customerId: { type: 'number', required: false, isArray: false, isOptional: true },
          companyName: { type: 'string', required: false, isArray: false, isOptional: true },
          contactFullName: { type: 'string', required: false, isArray: false, isOptional: true },
          email: { type: 'string', required: false, isArray: false, isOptional: true },
          phone: { type: 'string', required: false, isArray: false, isOptional: true },
          assigneeId: { type: 'string', required: false, isArray: false, isOptional: true },
          assigneeDisplayName: { type: 'string', required: false, isArray: false, isOptional: true },
          pickupLocation: { type: 'object', required: false, isArray: false, isOptional: true },
          deliveryLocation: { type: 'object', required: false, isArray: false, isOptional: true },
          pickupDate: { type: 'date', required: false, isArray: false, isOptional: true },
          deliveryDate: { type: 'date', required: false, isArray: false, isOptional: true },
          goodsDescription: { type: 'string', required: false, isArray: false, isOptional: true },
          numberOfUnits: { type: 'number', required: false, isArray: false, isOptional: true },
          totalWeightKg: { type: 'number', required: false, isArray: false, isOptional: true },
          totalDimensions: { type: 'string', required: false, isArray: false, isOptional: true },
          isDangerousGoods: { type: 'boolean', required: false, isArray: false, isOptional: true },
          requiresTemperatureControl: { type: 'boolean', required: false, isArray: false, isOptional: true },
          isFragileOrHighValue: { type: 'boolean', required: false, isArray: false, isOptional: true },
          requiresSpecialHandling: { type: 'boolean', required: false, isArray: false, isOptional: true },
          specialInstructions: { type: 'string', required: false, isArray: false, isOptional: true },
          preferredTransportMode: { type: 'number', required: false, isArray: false, isOptional: true },
          additionalComments: { type: 'string', required: false, isArray: false, isOptional: true },
          createdAt: { type: 'date', required: false, isArray: false, isOptional: true },
          updatedAt: { type: 'date', required: false, isArray: false, isOptional: true },
          productId: { type: 'number', required: false, isArray: false, isOptional: true },
          productName: { type: 'string', required: false, isArray: false, isOptional: true },
          status: { type: 'string', required: false, isArray: false, isOptional: true },
          incoterm: { type: 'string', required: false, isArray: false, isOptional: true },
          packingType: { type: 'string', required: false, isArray: false, isOptional: true },
          tags: { type: 'string', required: false, isArray: false, isOptional: true },
          cargoType: { type: 'string', required: false, isArray: false, isOptional: true },
          quantity: { type: 'number', required: false, isArray: false, isOptional: true },
          details: { type: 'string', required: false, isArray: false, isOptional: true }
        }
      },
      {
        typeName: 'SeaFreightOption',
        description: 'Sea freight option from Offer module',
        module: 'offer',
        source: 'offer/api/types.gen.ts',
        properties: {
          seaFreightId: { type: 'string', required: false, isArray: false, isOptional: true },
          carrierName: { type: 'string', required: false, isArray: false, isOptional: true },
          carrierAgentName: { type: 'string', required: false, isArray: false, isOptional: true },
          departurePort: { type: 'object', required: false, isArray: false, isOptional: true },
          destinationPort: { type: 'object', required: false, isArray: false, isOptional: true },
          currency: { type: 'string', required: false, isArray: false, isOptional: true },
          transitTimeDays: { type: 'number', required: false, isArray: false, isOptional: true },
          frequency: { type: 'string', required: false, isArray: false, isOptional: true },
          defaultContainer: { type: 'string', required: false, isArray: false, isOptional: true },
          containers: { type: 'array', required: false, isArray: true, isOptional: true },
          comment: { type: 'string', required: false, isArray: false, isOptional: true },
          validUntil: { type: 'date', required: false, isArray: false, isOptional: true }
        }
      },
      {
        typeName: 'HaulageOption',
        description: 'Haulage option from Offer module',
        module: 'offer',
        source: 'offer/api/types.gen.ts',
        properties: {
          haulierId: { type: 'number', required: false, isArray: false, isOptional: true },
          haulierName: { type: 'string', required: false, isArray: false, isOptional: true },
          currency: { type: 'string', required: false, isArray: false, isOptional: true },
          unitTariff: { type: 'number', required: false, isArray: false, isOptional: true },
          freeTime: { type: 'number', required: false, isArray: false, isOptional: true },
          pickupAddress: { type: 'object', required: false, isArray: false, isOptional: true },
          deliveryPort: { type: 'object', required: false, isArray: false, isOptional: true },
          comment: { type: 'string', required: false, isArray: false, isOptional: true },
          validUntil: { type: 'date', required: false, isArray: false, isOptional: true }
        }
      },
      {
        typeName: 'MiscellaneousOption',
        description: 'Miscellaneous option from Offer module',
        module: 'offer',
        source: 'offer/api/types.gen.ts',
        properties: {
          supplierName: { type: 'string', required: false, isArray: false, isOptional: true },
          currency: { type: 'string', required: false, isArray: false, isOptional: true },
          serviceId: { type: 'number', required: false, isArray: false, isOptional: true },
          serviceName: { type: 'string', required: false, isArray: false, isOptional: true },
          price: { type: 'number', required: false, isArray: false, isOptional: true },
          validUntil: { type: 'date', required: false, isArray: false, isOptional: true }
        }
      },
      {
        typeName: 'FileAttachment',
        description: 'File attachment from Offer module',
        module: 'offer',
        source: 'offer/api/types.gen.ts',
        properties: {
          id: { type: 'string', required: false, isArray: false, isOptional: true },
          fileName: { type: 'string', required: false, isArray: false, isOptional: true },
          contentType: { type: 'string', required: false, isArray: false, isOptional: true },
          size: { type: 'number', required: false, isArray: false, isOptional: true },
          uploadedAt: { type: 'date', required: false, isArray: false, isOptional: true },
          url: { type: 'string', required: false, isArray: false, isOptional: true }
        }
      }
    ];
  }

  /**
   * Get sample data for detected types (for demonstration)
   */
  getSampleDetectedTypes(): DetectedObjectType[] {
    return this.getRealDetectedTypes();
  }
} 