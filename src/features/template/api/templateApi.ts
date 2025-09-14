import { 
  postApiEmailTemplateRenderDirect,
  postApiEmailTemplateByIdRender,
  postApiEmailTemplateExtractPlaceholders,
  postApiEmailTemplateByIdValidate,
  postApiEmailTemplateByIdMissingPlaceholders
} from './sdk.gen';

export interface RenderDirectRequest {
  subject?: string;
  htmlBody: string;
  textBody?: string;
  objectSchemas?: Record<string, any>;
  data: any;
}

export interface RenderDirectResponse {
  subject: string;
  htmlBody: string;
  textBody?: string;
  diagnostics?: {
    missingPlaceholders: string[];
    warnings: string[];
    errors: string[];
  };
}

export interface ExtractPlaceholdersResponse {
  placeholders: string[];
  objectSchemas: Record<string, any>;
}

export interface ValidationResponse {
  isValid: boolean;
  missingPlaceholders: string[];
  warnings: string[];
  errors: string[];
}

// Rendu direct sans sauvegarde
export async function renderDirect(body: RenderDirectRequest): Promise<RenderDirectResponse> {
  const response = await postApiEmailTemplateRenderDirect({
    body
  });
  return response.data;
}

// Rendu par ID de template
export async function renderById(id: string, data: any): Promise<RenderDirectResponse> {
  const response = await postApiEmailTemplateByIdRender({
    path: { id },
    body: data
  });
  return response.data;
}

// Extraction des placeholders
export async function extractPlaceholders(htmlBody: string): Promise<ExtractPlaceholdersResponse> {
  const response = await postApiEmailTemplateExtractPlaceholders({
    body: { htmlBody }
  });
  return response.data;
}

// Validation des données pour un template
export async function validateById(id: string, data: any): Promise<ValidationResponse> {
  const response = await postApiEmailTemplateByIdValidate({
    path: { id },
    body: data
  });
  return response.data;
}

// Validation directe sans template sauvegardé
export async function validateDirect(htmlBody: string, data: any): Promise<ValidationResponse> {
  const response = await postApiEmailTemplateExtractPlaceholders({
    body: { htmlBody }
  });
  
  const placeholders = response.data.placeholders;
  const missing: string[] = [];
  const warnings: string[] = [];
  const errors: string[] = [];

  for (const placeholder of placeholders) {
    const value = getNestedValue(data, placeholder);
    if (value === undefined || value === null) {
      missing.push(placeholder);
    } else if (value === "") {
      warnings.push(`${placeholder} est vide`);
    }
  }

  return {
    isValid: missing.length === 0,
    missingPlaceholders: missing,
    warnings,
    errors
  };
}

// Fonction utilitaire pour accéder aux propriétés imbriquées
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
}
