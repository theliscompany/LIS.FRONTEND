import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Parse TypeScript file content and extract type definitions
 */
function parseTypeScriptFile(fileContent, moduleName) {
  const types = [];
  
  // Regular expressions to match type definitions with multiline support
  const typePattern = /export\s+type\s+(\w+)\s*=\s*\{([\s\S]*?)\};?$/gm;
  const interfacePattern = /export\s+interface\s+(\w+)\s*\{([\s\S]*?)\};?$/gm;
  
  // Match both type and interface definitions
  let match;
  
  // Process type definitions
  while ((match = typePattern.exec(fileContent)) !== null) {
    const typeName = match[1];
    const propertiesContent = match[2];
    
    if (!shouldSkipType(typeName)) {
      const properties = parseProperties(propertiesContent);
      if (Object.keys(properties).length > 0) {
        types.push({
          typeName,
          description: generateDescription(typeName, moduleName),
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
    
    if (!shouldSkipType(typeName)) {
      const properties = parseProperties(propertiesContent);
      if (Object.keys(properties).length > 0) {
        types.push({
          typeName,
          description: generateDescription(typeName, moduleName),
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
function parseProperties(propertiesContent) {
  const properties = {};
  
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
      
      const propertySchema = parseTypeDefinition(propertyName, typeDefinition);
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
function parseTypeDefinition(propertyName, typeDefinition) {
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
function shouldSkipType(typeName) {
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
function generateDescription(typeName, moduleName) {
  const moduleDescriptions = {
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
 * Main function to generate SDK types
 */
function generateSDKTypes() {
  const featuresDir = path.join(__dirname, '../src/features');
  const outputFile = path.join(__dirname, '../src/features/template/data/detected-types.json');
  
  // Ensure output directory exists
  const outputDir = path.dirname(outputFile);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const allTypes = [];
  
  // Get all feature directories
  const features = fs.readdirSync(featuresDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  console.log('🔍 Scanning features:', features);
  
  for (const feature of features) {
    const typesFilePath = path.join(featuresDir, feature, 'api', 'types.gen.ts');
    
    if (fs.existsSync(typesFilePath)) {
      try {
        console.log(`📁 Processing ${feature}...`);
        const fileContent = fs.readFileSync(typesFilePath, 'utf8');
        const types = parseTypeScriptFile(fileContent, feature);
        
        console.log(`✅ Found ${types.length} types in ${feature}`);
        allTypes.push(...types);
      } catch (error) {
        console.error(`❌ Error processing ${feature}:`, error.message);
      }
    } else {
      console.log(`⚠️  No types.gen.ts found in ${feature}`);
    }
  }
  
  // Sort types by module and name
  allTypes.sort((a, b) => {
    if (a.module !== b.module) {
      return a.module.localeCompare(b.module);
    }
    return a.typeName.localeCompare(b.typeName);
  });
  
  // Write to JSON file
  const output = {
    generatedAt: new Date().toISOString(),
    totalTypes: allTypes.length,
    modules: [...new Set(allTypes.map(t => t.module))],
    types: allTypes
  };
  
  fs.writeFileSync(outputFile, JSON.stringify(output, null, 2));
  
  console.log('\n🎉 SDK Types Generation Complete!');
  console.log(`📊 Total types detected: ${allTypes.length}`);
  console.log(`📁 Output file: ${outputFile}`);
  console.log('\n📋 Summary by module:');
  
  const moduleStats = {};
  allTypes.forEach(type => {
    moduleStats[type.module] = (moduleStats[type.module] || 0) + 1;
  });
  
  Object.entries(moduleStats).forEach(([module, count]) => {
    console.log(`  ${module}: ${count} types`);
  });
}

// Run the script
generateSDKTypes(); 