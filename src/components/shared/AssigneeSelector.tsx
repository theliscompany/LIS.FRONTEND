import React from 'react';
import { 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Button, 
  Box, 
  Typography,
  Avatar,
  Chip,
  Autocomplete,
  TextField,
  FormHelperText
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { useTranslation } from 'react-i18next';
import { enqueueSnackbar } from 'notistack';
import { Controller, useFormContext } from 'react-hook-form';

interface Assignee {
  id: string | number;
  name?: string;
  email?: string;
  organization?: string;
  displayName?: string;
  mail?: string;
}

interface AssigneeSelectorProps {
  name?: string; // Nom du champ dans le formulaire (ex: 'assigneeId')
  assignee?: string | number; // Pour usage sans react-hook-form
  setAssignee?: (assignee: string | number) => void; // Pour usage sans react-hook-form
  assignees?: Assignee[]; // Pour usage sans react-hook-form
  isLoading?: boolean;
  disabled?: boolean;
  showActions?: boolean;
  onAssign?: () => void;
  onRemove?: () => void;
  variant?: 'select' | 'autocomplete';
  label?: string;
  placeholder?: string;
  error?: boolean;
  helperText?: string;
}

const AssigneeSelector: React.FC<AssigneeSelectorProps> = ({
  name,
  assignee,
  setAssignee,
  assignees: externalAssignees,
  isLoading: externalLoading = false,
  disabled = false,
  showActions = false,
  onAssign,
  onRemove,
  variant = 'select',
  label,
  placeholder,
  error,
  helperText
}) => {
  const { t } = useTranslation();
  const formContext = useFormContext();

  // Utiliser uniquement les assignés fournis en props
  const assignees = externalAssignees || [];
  const isLoading = externalLoading || false;

  // Gestion de l'assigné sélectionné (comme dans Request.tsx)
  const currentAssignee = name && formContext ? formContext.watch(name) : assignee;
  const assigneeIdStr = currentAssignee ? String(currentAssignee) : '';
  
  const selectedAssignee = React.useMemo(() => {
    return assignees.find((a: any) => String(a.id) === assigneeIdStr);
  }, [assignees, assigneeIdStr]);

  const assigneesWithFallback = React.useMemo(() => {
    return assigneeIdStr && !selectedAssignee
      ? [
          ...assignees,
          { id: assigneeIdStr, displayName: assigneeIdStr, mail: '' }
        ]
      : assignees;
  }, [assignees, assigneeIdStr, selectedAssignee]);

  const handleAssign = async () => {
    if (currentAssignee) {
      if (onAssign) {
        onAssign();
      } else {
        enqueueSnackbar(t('managerAssigned'), { variant: 'success' });
      }
    } else {
      enqueueSnackbar(t('selectManagerFirst'), { variant: 'error' });
    }
  };

  const handleRemove = async () => {
    if (onRemove) {
      onRemove();
    } else {
      enqueueSnackbar(t('managerRemoved'), { variant: 'success' });
    }
  };

  if (variant === 'autocomplete') {
    return (
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <AssignmentIcon sx={{ color: '#f39c12', mr: 1 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2c3e50' }}>
            {label || t('assignedManager')}
          </Typography>
        </Box>
        
        <Autocomplete
          options={assignees}
          getOptionLabel={(option) => {
            const displayName = option.displayName || option.name || option.mail || String(option.id);
            const email = option.mail || option.email;
            const organization = option.organization;
            
            if (organization && email) {
              return `${organization} - ${displayName} ${email}`;
            }
            return displayName;
          }}
          value={selectedAssignee || null}
          onChange={(_, newValue) => {
            if (name && formContext) {
              formContext.setValue(name, newValue?.id || '');
            } else if (setAssignee) {
              setAssignee(newValue?.id || '');
            }
          }}
          loading={isLoading}
          disabled={disabled}
          isOptionEqualToValue={(option, value) => String(option.id) === String(value.id)}
          renderOption={(props, option) => {
            const displayName = option.displayName || option.name || option.mail || String(option.id);
            const email = option.mail || option.email;
            return (
              <li {...props} key={option.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <Avatar sx={{ width: 32, height: 32, mr: 2, bgcolor: 'primary.main' }}>
                    {displayName.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {displayName}
                    </Typography>
                    {email && (
                      <Typography variant="caption" color="text.secondary">
                        {email}
                      </Typography>
                    )}
                    {option.organization && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        {option.organization}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </li>
            );
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder={placeholder || t('selectAssigneePlaceholder')}
              variant="outlined"
              fullWidth
              disabled={disabled}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: '#f8f9fa',
                  '&:hover': {
                    backgroundColor: '#e9ecef',
                  },
                  '&.Mui-focused': {
                    backgroundColor: '#ffffff',
                    boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)',
                  }
                }
              }}
            />
          )}
        />

        {showActions && (
          <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
            <Button 
              variant="contained" 
              color="inherit" 
              onClick={handleAssign}
              disabled={disabled || !assignee}
              sx={{ 
                backgroundColor: '#f8f9fa',
                color: '#495057',
                '&:hover': {
                  backgroundColor: '#e9ecef',
                }
              }}
            >
              {t('updateManager')}
            </Button>
            <Button 
              variant="contained" 
              color="inherit" 
              onClick={handleRemove}
              disabled={disabled || !assignee}
              sx={{ 
                backgroundColor: '#f8f9fa',
                color: '#495057',
                '&:hover': {
                  backgroundColor: '#e9ecef',
                }
              }}
            >
              {t('removeManager')}
            </Button>
          </Box>
        )}
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <AssignmentIcon sx={{ color: '#f39c12', mr: 1 }} />
        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2c3e50' }}>
          {label || t('assignedManager')}
        </Typography>
      </Box>

                  {selectedAssignee && (
              <Box sx={{ mb: 2 }}>
                <Chip
                  avatar={
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {(selectedAssignee.displayName || selectedAssignee.name || selectedAssignee.mail || String(selectedAssignee.id)).charAt(0).toUpperCase()}
                    </Avatar>
                  }
                  label={
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {selectedAssignee.displayName || selectedAssignee.name || selectedAssignee.mail || String(selectedAssignee.id)}
                      </Typography>
                      {(selectedAssignee.mail || selectedAssignee.email) && (
                        <Typography variant="caption" color="text.secondary">
                          {selectedAssignee.mail || selectedAssignee.email}
                        </Typography>
                      )}
                    </Box>
                  }
                  sx={{ 
                    p: 1, 
                    height: 'auto',
                    '& .MuiChip-label': {
                      display: 'block',
                      whiteSpace: 'normal'
                    }
                  }}
                />
              </Box>
            )}

      <FormControl fullWidth error={error}>
        <Select
          value={assigneeIdStr}
          onChange={(e) => {
            if (name && formContext) {
              formContext.setValue(name, e.target.value);
            } else if (setAssignee) {
              setAssignee(e.target.value);
            }
          }}
          displayEmpty
          disabled={disabled || isLoading}
          sx={{
            borderRadius: 2,
            backgroundColor: '#f8f9fa',
            '&:hover': {
              backgroundColor: '#e9ecef',
            },
            '&.Mui-focused': {
              backgroundColor: '#ffffff',
              boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)',
            }
          }}
        >
          <MenuItem value="">
            <em>{placeholder || t('selectAssigneePlaceholder')}</em>
          </MenuItem>
          {assigneesWithFallback.map((member: any) => {
            const displayName = member.displayName || member.name || member.mail || String(member.id);
            const email = member.mail || member.email;
            return (
              <MenuItem key={String(member.id)} value={String(member.id)}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <Avatar sx={{ width: 24, height: 24, mr: 2, bgcolor: 'primary.main' }}>
                    {displayName.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {displayName}
                    </Typography>
                    {email && (
                      <Typography variant="caption" color="text.secondary">
                        {email}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </MenuItem>
            );
          })}
        </Select>
        {helperText && <FormHelperText>{helperText}</FormHelperText>}
      </FormControl>

      {showActions && (
        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
          <Button 
            variant="contained" 
            color="inherit" 
            onClick={handleAssign}
            disabled={disabled || !assignee}
            sx={{ 
              backgroundColor: '#f8f9fa',
              color: '#495057',
              '&:hover': {
                backgroundColor: '#e9ecef',
              }
            }}
          >
            {t('updateManager')}
          </Button>
          <Button 
            variant="contained" 
            color="inherit" 
            onClick={handleRemove}
            disabled={disabled || !assignee}
            sx={{ 
              backgroundColor: '#f8f9fa',
              color: '#495057',
              '&:hover': {
                backgroundColor: '#e9ecef',
              }
            }}
          >
            {t('removeManager')}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default AssigneeSelector; 