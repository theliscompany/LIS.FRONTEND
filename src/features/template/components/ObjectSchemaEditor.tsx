import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  IconButton,
  Tooltip,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Schema as SchemaIcon,
  ContentCopy as CopyIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

interface ObjectSchema {
  [key: string]: {
    type: string;
    isRequired: boolean;
    description?: string;
  };
}

interface ObjectSchemaEditorProps {
  objectSchemas: Record<string, ObjectSchema>;
  onObjectSchemasChange: (schemas: Record<string, ObjectSchema>) => void;
}

const ObjectSchemaEditor: React.FC<ObjectSchemaEditorProps> = ({
  objectSchemas,
  onObjectSchemasChange
}) => {
  const [schemas, setSchemas] = useState<Record<string, ObjectSchema>>(objectSchemas || {});
  const [editingSchema, setEditingSchema] = useState<string | null>(null);
  const [newSchemaName, setNewSchemaName] = useState('');
  const [newSchemaContent, setNewSchemaContent] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSchemas(objectSchemas || {});
  }, [objectSchemas]);

  const handleAddSchema = () => {
    if (!newSchemaName.trim()) {
      setError('Le nom du schéma est requis');
      return;
    }

    try {
      const parsedSchema = JSON.parse(newSchemaContent || '{}');
      const validatedSchema: ObjectSchema = {};

      // Valider et transformer le schéma
      for (const [key, value] of Object.entries(parsedSchema)) {
        if (typeof value === 'object' && value !== null) {
          validatedSchema[key] = {
            type: (value as any).type || 'string',
            isRequired: (value as any).required || false,
            description: (value as any).description || ''
          };
        } else {
          validatedSchema[key] = {
            type: typeof value,
            isRequired: false,
            description: ''
          };
        }
      }

      const updatedSchemas = {
        ...schemas,
        [newSchemaName]: validatedSchema
      };

      setSchemas(updatedSchemas);
      onObjectSchemasChange(updatedSchemas);
      setNewSchemaName('');
      setNewSchemaContent('');
      setDialogOpen(false);
      setError(null);
    } catch (error) {
      setError('JSON invalide');
    }
  };

  const handleEditSchema = (schemaName: string) => {
    setEditingSchema(schemaName);
    setNewSchemaName(schemaName);
    setNewSchemaContent(JSON.stringify(schemas[schemaName], null, 2));
    setDialogOpen(true);
  };

  const handleUpdateSchema = () => {
    if (!editingSchema) return;

    try {
      const parsedSchema = JSON.parse(newSchemaContent || '{}');
      const validatedSchema: ObjectSchema = {};

      for (const [key, value] of Object.entries(parsedSchema)) {
        if (typeof value === 'object' && value !== null) {
          validatedSchema[key] = {
            type: (value as any).type || 'string',
            isRequired: (value as any).required || false,
            description: (value as any).description || ''
          };
        } else {
          validatedSchema[key] = {
            type: typeof value,
            isRequired: false,
            description: ''
          };
        }
      }

      const updatedSchemas = {
        ...schemas,
        [editingSchema]: validatedSchema
      };

      setSchemas(updatedSchemas);
      onObjectSchemasChange(updatedSchemas);
      setEditingSchema(null);
      setNewSchemaName('');
      setNewSchemaContent('');
      setDialogOpen(false);
      setError(null);
    } catch (error) {
      setError('JSON invalide');
    }
  };

  const handleDeleteSchema = (schemaName: string) => {
    const updatedSchemas = { ...schemas };
    delete updatedSchemas[schemaName];
    setSchemas(updatedSchemas);
    onObjectSchemasChange(updatedSchemas);
  };

  const handleCopySchema = (schemaName: string) => {
    const schemaText = JSON.stringify(schemas[schemaName], null, 2);
    navigator.clipboard.writeText(schemaText);
  };

  const handleLoadExample = () => {
    const exampleSchema = {
      client: {
        name: { type: "string", required: true, description: "Nom du client" },
        email: { type: "string", required: true, description: "Email du client" },
        company: { type: "string", required: false, description: "Entreprise" }
      },
      order: {
        number: { type: "string", required: true, description: "Numéro de commande" },
        date: { type: "string", required: true, description: "Date de commande" },
        total: { type: "number", required: true, description: "Montant total" },
        items: { type: "array", required: false, description: "Liste des articles" }
      }
    };
    setNewSchemaContent(JSON.stringify(exampleSchema, null, 2));
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingSchema(null);
    setNewSchemaName('');
    setNewSchemaContent('');
    setError(null);
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SchemaIcon />
          Schémas d'Objets
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
        >
          Ajouter Schéma
        </Button>
      </Box>

      {Object.keys(schemas).length === 0 ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          Aucun schéma d'objet défini. Ajoutez des schémas pour valider les données.
        </Alert>
      ) : (
        <List>
          {Object.entries(schemas).map(([schemaName, schema]) => (
            <ListItem key={schemaName} sx={{ border: '1px solid #ddd', borderRadius: 1, mb: 1 }}>
              <ListItemText
                primary={schemaName}
                secondary={
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      {Object.keys(schema).length} propriétés
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1 }}>
                      {Object.entries(schema).map(([key, value]) => (
                        <Chip
                          key={key}
                          label={`${key}: ${value.type}`}
                          size="small"
                          variant="outlined"
                          color={value.isRequired ? "warning" : "default"}
                        />
                      ))}
                    </Box>
                  </Box>
                }
              />
              <ListItemSecondaryAction>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Copier">
                    <IconButton size="small" onClick={() => handleCopySchema(schemaName)}>
                      <CopyIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Modifier">
                    <IconButton size="small" onClick={() => handleEditSchema(schemaName)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Supprimer">
                    <IconButton size="small" onClick={() => handleDeleteSchema(schemaName)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}

      {/* Dialog pour ajouter/modifier un schéma */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingSchema ? `Modifier le schéma "${editingSchema}"` : 'Ajouter un nouveau schéma'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nom du schéma"
                value={newSchemaName}
                onChange={(e) => setNewSchemaName(e.target.value)}
                disabled={!!editingSchema}
                helperText="Nom unique pour identifier ce schéma"
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2">Définition du schéma (JSON)</Typography>
                <Button size="small" onClick={handleLoadExample} startIcon={<RefreshIcon />}>
                  Charger Exemple
                </Button>
              </Box>
              <TextField
                fullWidth
                multiline
                rows={12}
                value={newSchemaContent}
                onChange={(e) => setNewSchemaContent(e.target.value)}
                placeholder={`{
  "propertyName": {
    "type": "string",
    "required": true,
    "description": "Description de la propriété"
  }
}`}
                error={!!error}
                helperText={error || "Format JSON avec type, required et description pour chaque propriété"}
                sx={{
                  '& .MuiInputBase-root': {
                    fontFamily: 'monospace',
                    fontSize: '0.875rem'
                  }
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button
            onClick={editingSchema ? handleUpdateSchema : handleAddSchema}
            variant="contained"
          >
            {editingSchema ? 'Modifier' : 'Ajouter'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default ObjectSchemaEditor;
