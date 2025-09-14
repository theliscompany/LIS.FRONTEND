// @ts-ignore
import Handlebars from "handlebars";

export interface HandlebarsHelperContext {
  data?: {
    root?: any;
    first?: boolean;
    last?: boolean;
    index?: number;
    key?: string;
  };
}

export function registerSharedHelpers() {
  // Formatage de date
  Handlebars.registerHelper("formatDate", (value: any, format = "dd/MM/yyyy", culture = "fr-FR") => {
    const d = value ? new Date(value) : null;
    if (!d || isNaN(d.getTime())) return "";
    
    // Format simple basé sur la culture
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    };
    
    if (format.includes("HH") || format.includes("mm")) {
      options.hour = '2-digit';
      options.minute = '2-digit';
    }
    
    return d.toLocaleDateString(culture, options);
  });

  // Formatage de devise
  Handlebars.registerHelper("formatCurrency", (value: any, currency = "EUR", culture = "fr-FR") => {
    const num = Number(value ?? 0);
    return new Intl.NumberFormat(culture, { 
      style: "currency", 
      currency 
    }).format(num);
  });

  // Formatage de nombre
  Handlebars.registerHelper("formatNumber", (value: any, decimals = 2, culture = "fr-FR") => {
    const num = Number(value ?? 0);
    return new Intl.NumberFormat(culture, { 
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(num);
  });

  // Conversion en majuscules
  Handlebars.registerHelper("upper", (v: any) => (v ?? "").toString().toUpperCase());

  // Conversion en minuscules
  Handlebars.registerHelper("lower", (v: any) => (v ?? "").toString().toLowerCase());

  // Troncature de texte
  Handlebars.registerHelper("truncate", (v: any, len = 50) => {
    const s = (v ?? "").toString();
    return s.length > len ? s.slice(0, len) + "…" : s;
  });

  // Comparaison numérique
  Handlebars.registerHelper("ifGreater", function (a: any, b: any, options: any) {
    return Number(a) > Number(b) ? options.fn(this) : options.inverse(this);
  });

  Handlebars.registerHelper("ifLess", function (a: any, b: any, options: any) {
    return Number(a) < Number(b) ? options.fn(this) : options.inverse(this);
  });

  Handlebars.registerHelper("ifEqual", function (a: any, b: any, options: any) {
    return a === b ? options.fn(this) : options.inverse(this);
  });

  // Vérification d'existence
  Handlebars.registerHelper("ifExists", function (value: any, options: any) {
    return value !== undefined && value !== null && value !== "" ? options.fn(this) : options.inverse(this);
  });

  // Concaténation
  Handlebars.registerHelper("concat", (...args: any[]) => {
    return args.slice(0, -1).join("");
  });

  // Mathématiques
  Handlebars.registerHelper("add", (a: any, b: any) => Number(a ?? 0) + Number(b ?? 0));
  Handlebars.registerHelper("subtract", (a: any, b: any) => Number(a ?? 0) - Number(b ?? 0));
  Handlebars.registerHelper("multiply", (a: any, b: any) => Number(a ?? 0) * Number(b ?? 0));
  Handlebars.registerHelper("divide", (a: any, b: any) => {
    const divisor = Number(b);
    return divisor !== 0 ? Number(a ?? 0) / divisor : 0;
  });

  // Formatage conditionnel
  Handlebars.registerHelper("formatIf", function (value: any, format: string, options: any) {
    if (!value) return options.inverse(this);
    
    switch (format) {
      case "currency":
        return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(Number(value));
      case "date":
        return new Date(value).toLocaleDateString("fr-FR");
      case "upper":
        return value.toString().toUpperCase();
      case "lower":
        return value.toString().toLowerCase();
      default:
        return value;
    }
  });

  // Helpers pour les listes
  Handlebars.registerHelper("sum", function (items: any[], property: string) {
    return items.reduce((sum, item) => sum + Number(item[property] ?? 0), 0);
  });

  Handlebars.registerHelper("count", function (items: any[]) {
    return items ? items.length : 0;
  });

  // Helper pour les valeurs par défaut
  Handlebars.registerHelper("default", function (value: any, defaultValue: any) {
    return value !== undefined && value !== null && value !== "" ? value : defaultValue;
  });
}

// Fonction pour compiler un template avec les helpers
export function compileTemplate(template: string, data: any): string {
  try {
    const compiledTemplate = Handlebars.compile(template);
    return compiledTemplate(data);
  } catch (error) {
    console.error("Erreur de compilation Handlebars:", error);
    throw new Error(`Erreur de compilation: ${error}`);
  }
}

// Fonction pour extraire les placeholders d'un template
export function extractPlaceholders(template: string): string[] {
  const placeholders: string[] = [];
  const regex = /\{\{([^}]+)\}\}/g;
  let match;
  
  while ((match = regex.exec(template)) !== null) {
    const placeholder = match[1].trim();
    if (!placeholders.includes(placeholder)) {
      placeholders.push(placeholder);
    }
  }
  
  return placeholders;
}

// Fonction pour valider les données contre un template
export function validateTemplateData(template: string, data: any): {
  missing: string[];
  warnings: string[];
} {
  const placeholders = extractPlaceholders(template);
  const missing: string[] = [];
  const warnings: string[] = [];

  for (const placeholder of placeholders) {
    const value = getNestedValue(data, placeholder);
    if (value === undefined || value === null) {
      missing.push(placeholder);
    } else if (value === "") {
      warnings.push(`${placeholder} est vide`);
    }
  }

  return { missing, warnings };
}

// Fonction utilitaire pour accéder aux propriétés imbriquées
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
}
