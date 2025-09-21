import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails,
  Alert,
  Chip,
  Divider
} from '@mui/material';
import { ExpandMore, Code, Api, BugReport } from '@mui/icons-material';
import { mapDraftQuoteToApi, mapDraftQuoteToUpdateApi } from '../../offer/services/draftQuoteService';
import type { DraftQuote } from '../../offer/types/DraftQuote';

interface DebugPayloadDisplayProps {
  draftQuote: DraftQuote | null;
  savedOptions: any[];
}

export default function DebugPayloadDisplay({ draftQuote, savedOptions }: DebugPayloadDisplayProps) {
  const [expanded, setExpanded] = useState<string | false>(false);

  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  if (!draftQuote) {
    return (
      <Alert severity="warning" sx={{ mb: 2 }}>
        Aucun brouillon à afficher
      </Alert>
    );
  }

  const createPayload = mapDraftQuoteToApi(draftQuote);
  const updatePayload = draftQuote.draftQuoteId ? mapDraftQuoteToUpdateApi(draftQuote) : null;

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <BugReport color="primary" />
        Debug - Payloads API
      </Typography>

      {/* Informations générales */}
      <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary">
          <strong>Draft ID:</strong> {draftQuote.draftQuoteId || 'Nouveau brouillon'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <strong>Options:</strong> {savedOptions.length} option(s)
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <strong>Statut:</strong> {draftQuote.status || 'draft'}
        </Typography>
      </Box>

      {/* Payload de création (POST) */}
      <Accordion 
        expanded={expanded === 'create'} 
        onChange={handleChange('create')}
        sx={{ mb: 1 }}
      >
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
            <Api color="success" />
            <Typography variant="subtitle1">
              POST /api/draft-quotes
            </Typography>
            <Chip 
              label="Création" 
              color="success" 
              size="small" 
              sx={{ ml: 'auto' }}
            />
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Payload pour créer un nouveau brouillon
            </Typography>
            <Box 
              component="pre" 
              sx={{ 
                bgcolor: 'grey.100', 
                p: 2, 
                borderRadius: 1, 
                overflow: 'auto',
                fontSize: '0.75rem',
                maxHeight: '300px'
              }}
            >
              {JSON.stringify(createPayload, null, 2)}
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Payload de mise à jour (PUT) */}
      {updatePayload ? (
        <Accordion 
          expanded={expanded === 'update'} 
          onChange={handleChange('update')}
          sx={{ mb: 1 }}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
              <Code color="primary" />
              <Typography variant="subtitle1">
                PUT /api/draft-quotes/{draftQuote.draftQuoteId}
              </Typography>
              <Chip 
                label="Mise à jour" 
                color="primary" 
                size="small" 
                sx={{ ml: 'auto' }}
              />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Payload pour mettre à jour le brouillon existant
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle2" gutterBottom>
                Structure complète de la requête :
              </Typography>
              <Box 
                component="pre" 
                sx={{ 
                  bgcolor: 'grey.100', 
                  p: 2, 
                  borderRadius: 1, 
                  overflow: 'auto',
                  fontSize: '0.75rem',
                  maxHeight: '300px'
                }}
              >
                {JSON.stringify({
                  path: { id: draftQuote.draftQuoteId },
                  body: updatePayload
                }, null, 2)}
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" gutterBottom>
                Corps de la requête (body uniquement) :
              </Typography>
              <Box 
                component="pre" 
                sx={{ 
                  bgcolor: 'primary.light', 
                  color: 'primary.contrastText',
                  p: 2, 
                  borderRadius: 1, 
                  overflow: 'auto',
                  fontSize: '0.75rem',
                  maxHeight: '300px'
                }}
              >
                {JSON.stringify(updatePayload, null, 2)}
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>
      ) : (
        <Alert severity="info" sx={{ mb: 1 }}>
          Pas de payload PUT disponible - le brouillon n'a pas encore d'ID
        </Alert>
      )}

      {/* Options détaillées */}
      {savedOptions.length > 0 && (
        <Accordion 
          expanded={expanded === 'options'} 
          onChange={handleChange('options')}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
              <Code color="secondary" />
              <Typography variant="subtitle1">
                Options sauvegardées ({savedOptions.length})
              </Typography>
              <Chip 
                label="Options" 
                color="secondary" 
                size="small" 
                sx={{ ml: 'auto' }}
              />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Options qui seront sauvegardées avec le brouillon
              </Typography>
              <Box 
                component="pre" 
                sx={{ 
                  bgcolor: 'grey.100', 
                  p: 2, 
                  borderRadius: 1, 
                  overflow: 'auto',
                  fontSize: '0.75rem',
                  maxHeight: '300px'
                }}
              >
                {JSON.stringify(savedOptions, null, 2)}
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>
      )}
    </Box>
  );
}
