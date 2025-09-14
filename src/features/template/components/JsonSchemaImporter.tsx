import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Upload as UploadIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  Code as CodeIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postApiEmailTemplateObjectTypesMutation } from '../api/@tanstack/react-query.gen';

interface PropertySchema {
  name: string;
  type: string;
  description: string;
  isRequired: boolean;
  defaultValue?: string;
  format?: string;
  allowedValues?: string[];
}

interface ObjectSchema {
  typeName: string;
  description: string;
  isRequired: boolean;
  properties: Record<string, PropertySchema>;
}

interface JsonSchemaImporterProps {
  open: boolean;
  onClose: () => void;
}

const JsonSchemaImporter: React.FC<JsonSchemaImporterProps> = ({ open, onClose }) => {
  const queryClient = useQueryClient();
  const [jsonInput, setJsonInput] = useState('');
  const [parsedSchemas, setParsedSchemas] = useState<ObjectSchema[]>([]);
  const [error, setError] = useState<string>('');

  const createMutation = useMutation(postApiEmailTemplateObjectTypesMutation());

  const parseJsonSchema = (jsonString: string) => {
    try {
      setError('');
      const data = JSON.parse(jsonString);
      
      // Support pour différents formats de schémas JSON
      let schemas: ObjectSchema[] = [];
      
      if (Array.isArray(data)) {
        // Format: [{"typeName": "...", "properties": {...}}]
        schemas = data.map(item => convertToObjectSchema(item));
      } else if (data.definitions) {
        // Format OpenAPI/Swagger avec definitions
        schemas = Object.entries(data.definitions).map(([name, schema]: [string, any]) => 
          convertToObjectSchema({ typeName: name, ...schema })
        );
      } else if (data.components?.schemas) {
        // Format OpenAPI 3.0 avec components.schemas
        schemas = Object.entries(data.components.schemas).map(([name, schema]: [string, any]) => 
          convertToObjectSchema({ typeName: name, ...schema })
        );
      } else if (data.typeName || data.properties) {
        // Format: objet unique avec typeName et properties
        schemas = [convertToObjectSchema(data)];
      } else if (typeof data === 'object' && data !== null) {
        // NOUVEAU: Format simple avec propriétés de base
        // Exemple: {"id": "string", "name": "string", ...}
        schemas = [convertSimpleObjectToSchema(data)];
      } else {
        throw new Error('Format JSON non reconnu. Utilisez un tableau d\'objets, un schéma OpenAPI, ou un objet simple avec des propriétés.');
      }
      
      setParsedSchemas(schemas);
    } catch (err) {
      setError(`Erreur de parsing JSON: ${err instanceof Error ? err.message : 'Format invalide'}`);
      setParsedSchemas([]);
    }
  };

  const convertToObjectSchema = (schema: any): ObjectSchema => {
    const properties: Record<string, PropertySchema> = {};
    
    if (schema.properties) {
      Object.entries(schema.properties).forEach(([propName, propSchema]: [string, any]) => {
        properties[propName] = {
          name: propName,
          type: mapJsonTypeToSchemaType(propSchema.type || 'string'),
          description: propSchema.description || propSchema.title || '',
          isRequired: schema.required?.includes(propName) || false,
          defaultValue: propSchema.default,
          allowedValues: propSchema.enum
        };
      });
    }
    
    return {
      typeName: schema.typeName || schema.title || 'Unknown',
      description: schema.description || '',
      isRequired: false,
      properties
    };
  };

  // NOUVELLE FONCTION: Convertir un objet simple en schéma
  const convertSimpleObjectToSchema = (simpleObject: any): ObjectSchema => {
    const properties: Record<string, PropertySchema> = {};
    
    Object.entries(simpleObject).forEach(([propName, propValue]: [string, any]) => {
      let type = 'string';
      let description = '';
      
      // Déterminer le type basé sur la valeur
      if (typeof propValue === 'string') {
        if (propValue === 'string') {
          type = 'string';
        } else if (propValue === 'number') {
          type = 'number';
        } else if (propValue === 'boolean') {
          type = 'boolean';
        } else if (propValue === 'date') {
          type = 'datetime';
        } else if (propValue === 'array') {
          type = 'array';
        } else if (propValue === 'object') {
          type = 'object';
        } else {
          type = 'string';
          description = propValue; // Utiliser la valeur comme description
        }
      } else if (typeof propValue === 'object' && propValue !== null) {
        // Propriété imbriquée - créer un type d'objet séparé
        type = 'object';
        description = `Objet ${propName}`;
        
        // Ajouter les propriétés imbriquées comme sous-propriétés
        if (typeof propValue === 'object' && !Array.isArray(propValue)) {
          Object.entries(propValue).forEach(([nestedPropName, nestedPropValue]: [string, any]) => {
            const nestedType = typeof nestedPropValue === 'string' ? nestedPropValue : 'string';
            properties[`${propName}.${nestedPropName}`] = {
              name: `${propName}.${nestedPropName}`,
              type: mapJsonTypeToSchemaType(nestedType),
              description: `Propriété imbriquée de ${propName}`,
              isRequired: false,
              defaultValue: undefined,
              allowedValues: undefined
            };
          });
          return; // Ne pas ajouter la propriété parente
        }
      }
      
      properties[propName] = {
        name: propName,
        type: type,
        description: description,
        isRequired: false, // Par défaut, pas requis
        defaultValue: undefined,
        allowedValues: undefined
      };
    });
    
    // Générer un nom de type basé sur les propriétés principales
    const mainProps = Object.keys(properties).slice(0, 3);
    const typeName = mainProps.length > 0 ? mainProps.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('') + 'Object' : 'ImportedObject';
    
    return {
      typeName: typeName,
      description: `Objet importé avec ${Object.keys(properties).length} propriétés`,
      isRequired: false,
      properties
    };
  };

  const mapJsonTypeToSchemaType = (jsonType: string): string => {
    const typeMap: Record<string, string> = {
      'string': 'string',
      'number': 'number',
      'integer': 'number',
      'boolean': 'boolean',
      'array': 'array',
      'object': 'object',
      'date': 'datetime',
      'date-time': 'datetime'
    };
    return typeMap[jsonType] || 'string';
  };

  const handleImport = async () => {
    try {
      for (const schema of parsedSchemas) {
        // Convertir ObjectSchema en ObjectSchemaDTO
        const objectSchemaDTO = {
          typeName: schema.typeName,
          description: schema.description,
          isRequired: schema.isRequired,
          properties: {} as Record<string, any>
        };

        // Convertir les propriétés en PropertySchemaDTO
        Object.entries(schema.properties).forEach(([key, prop]) => {
          objectSchemaDTO.properties[key] = {
            name: prop.name,
            type: prop.type,
            isRequired: prop.isRequired,
            defaultValue: prop.defaultValue,
            format: prop.format || undefined,
            description: prop.description,
            allowedValues: prop.allowedValues
          };
        });

        // S'assurer qu'aucun champ id n'est envoyé
        const payload = {
          body: objectSchemaDTO
        };

        console.log('Payload envoyé à l\'API:', payload);

        await createMutation.mutateAsync(payload);
      }
      
      queryClient.invalidateQueries({ queryKey: ['getApiEmailTemplateObjectTypesOptions'] });
      onClose();
      setJsonInput('');
      setParsedSchemas([]);
    } catch (error) {
      console.error('Erreur détaillée lors de l\'import:', error);
      setError(`Erreur lors de l'import: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  };

  const removeSchema = (index: number) => {
    setParsedSchemas(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CodeIcon />
          Importer des Schémas JSON
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Collez votre schéma JSON ici. Formats supportés :
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
            <Chip label="Tableau d'objets" size="small" variant="outlined" />
            <Chip label="OpenAPI/Swagger" size="small" variant="outlined" />
            <Chip label="Schéma unique" size="small" variant="outlined" />
            <Chip label="Objet simple" size="small" variant="outlined" color="primary" />
          </Box>
          
          <TextField
            fullWidth
            multiline
            rows={8}
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder={`Exemples de formats supportés:

1. Objet simple (recommandé):
{
  "id": "string",
  "name": "string", 
  "email": "string",
  "age": "number",
  "isActive": "boolean",
  "createdAt": "date"
}

2. Tableau d'objets:
[
  {
    "typeName": "Customer",
    "description": "Client du système",
    "properties": {
      "id": {
        "type": "string",
        "description": "Identifiant unique"
      },
      "name": {
        "type": "string", 
        "description": "Nom complet"
      }
    }
  }
]

3. Schéma OpenAPI:
{
  "components": {
    "schemas": {
      "Customer": {
        "type": "object",
        "properties": {
          "id": {"type": "string"},
          "name": {"type": "string"}
        }
      }
    }
  }
}`}
            variant="outlined"
          />
          
          <Button
            variant="outlined"
            startIcon={<UploadIcon />}
            onClick={() => parseJsonSchema(jsonInput)}
            sx={{ mt: 2 }}
            disabled={!jsonInput.trim()}
          >
            Analyser le JSON
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {parsedSchemas.length > 0 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Schémas détectés ({parsedSchemas.length})
            </Typography>
            
            {parsedSchemas.map((schema, index) => (
              <Accordion key={index} sx={{ mb: 1 }}>
                <AccordionSummary 
                  expandIcon={<ExpandMoreIcon />}
                  component="div"
                  sx={{ cursor: 'pointer' }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <Box>
                      <Typography variant="subtitle1">{schema.typeName}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {schema.description || 'Aucune description'}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSchema(index);
                      }}
                      sx={{ zIndex: 1 }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Propriétés ({Object.keys(schema.properties).length}):
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {Object.entries(schema.properties).map(([propName, prop]) => (
                      <Chip
                        key={propName}
                        label={`${propName} (${prop.type})`}
                        size="small"
                        variant="outlined"
                        title={prop.description}
                      />
                    ))}
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          <CancelIcon sx={{ mr: 1 }} />
          Annuler
        </Button>
        <Button 
          onClick={handleImport} 
          variant="contained"
          disabled={parsedSchemas.length === 0 || createMutation.isPending}
        >
          <SaveIcon sx={{ mr: 1 }} />
          Importer ({parsedSchemas.length})
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default JsonSchemaImporter; 