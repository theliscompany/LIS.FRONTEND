import React from 'react';
import {
  Box,
  IconButton,
  Tooltip,
  Button,
  Stack,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Visibility,
  Edit,
  Settings,
  MoreVert,
  CheckCircle,
  Cancel,
  Send,
  Delete
} from '@mui/icons-material';
import { useState } from 'react';

interface QuoteActionButtonsProps {
  quoteId: string;
  status?: string;
  onAction: (action: string, quoteId: string) => void;
  variant?: 'icons' | 'buttons' | 'menu';
  size?: 'small' | 'medium' | 'large';
  showEdit?: boolean;
  showDirectEdit?: boolean;
  showView?: boolean;
  showApproval?: boolean;
  showDelete?: boolean;
  showSend?: boolean;
}

const QuoteActionButtons: React.FC<QuoteActionButtonsProps> = ({
  quoteId,
  status,
  onAction,
  variant = 'icons',
  size = 'medium',
  showEdit = true,
  showDirectEdit = true,
  showView = true,
  showApproval = false,
  showDelete = false,
  showSend = false
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAction = (action: string) => {
    handleMenuClose();
    onAction(action, quoteId);
  };

  if (variant === 'menu') {
    return (
      <>
        <Tooltip title="Actions">
          <IconButton
            size={size}
            onClick={handleMenuClick}
            sx={{ 
              bgcolor: 'action.hover',
              '&:hover': { bgcolor: 'action.selected' }
            }}
          >
            <MoreVert />
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          {showView && (
            <MenuItem onClick={() => handleAction('view')}>
              <ListItemIcon>
                <Visibility fontSize="small" />
              </ListItemIcon>
              <ListItemText>Voir les détails</ListItemText>
            </MenuItem>
          )}
          {showView && (
            <MenuItem onClick={() => handleAction('viewer')}>
              <ListItemIcon>
                <Visibility fontSize="small" />
              </ListItemIcon>
              <ListItemText>Voir en mode viewer</ListItemText>
            </MenuItem>
          )}
          {showEdit && (
            <MenuItem onClick={() => handleAction('edit')}>
              <ListItemIcon>
                <Edit fontSize="small" />
              </ListItemIcon>
              <ListItemText>Édition wizard</ListItemText>
            </MenuItem>
          )}
          {showDirectEdit && (
            <MenuItem onClick={() => handleAction('edit-direct')}>
              <ListItemIcon>
                <Settings fontSize="small" />
              </ListItemIcon>
              <ListItemText>Édition directe</ListItemText>
            </MenuItem>
          )}
          {showApproval && status === 'PENDING_APPROVAL' && (
            <>
              <MenuItem onClick={() => handleAction('approve')}>
                <ListItemIcon>
                  <CheckCircle fontSize="small" color="success" />
                </ListItemIcon>
                <ListItemText>Approuver</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => handleAction('reject')}>
                <ListItemIcon>
                  <Cancel fontSize="small" color="error" />
                </ListItemIcon>
                <ListItemText>Rejeter</ListItemText>
              </MenuItem>
            </>
          )}
          {showSend && status === 'APPROVED' && (
            <MenuItem onClick={() => handleAction('send')}>
              <ListItemIcon>
                <Send fontSize="small" />
              </ListItemIcon>
              <ListItemText>Envoyer au client</ListItemText>
            </MenuItem>
          )}
          {showDelete && (
            <MenuItem onClick={() => handleAction('delete')}>
              <ListItemIcon>
                <Delete fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText>Supprimer</ListItemText>
            </MenuItem>
          )}
        </Menu>
      </>
    );
  }

  if (variant === 'buttons') {
    return (
      <Stack direction="row" spacing={1}>
        {showView && (
          <Button
            size={size}
            variant="outlined"
            startIcon={<Visibility />}
            onClick={() => onAction('view', quoteId)}
          >
            Voir
          </Button>
        )}
        {showView && (
          <Button
            size={size}
            variant="outlined"
            color="primary"
            startIcon={<Visibility />}
            onClick={() => onAction('viewer', quoteId)}
          >
            Viewer
          </Button>
        )}
        {showEdit && (
          <Button
            size={size}
            variant="outlined"
            color="secondary"
            startIcon={<Edit />}
            onClick={() => onAction('edit', quoteId)}
          >
            Wizard
          </Button>
        )}
        {showDirectEdit && (
          <Button
            size={size}
            variant="contained"
            color="info"
            startIcon={<Settings />}
            onClick={() => onAction('edit-direct', quoteId)}
          >
            Édition directe
          </Button>
        )}
      </Stack>
    );
  }

  // Variant 'icons' (default)
  return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      {showView && (
        <Tooltip title="Voir les détails">
          <IconButton
            size={size}
            color="primary"
            onClick={(e) => {
              e.stopPropagation();
              onAction('view', quoteId);
            }}
            sx={{ 
              bgcolor: 'primary.light', 
              '&:hover': { bgcolor: 'primary.main' } 
            }}
          >
            <Visibility fontSize={size} />
          </IconButton>
        </Tooltip>
      )}
      
      {showView && (
        <Tooltip title="Voir en mode viewer">
          <IconButton
            size={size}
            color="info"
            onClick={(e) => {
              e.stopPropagation();
              onAction('viewer', quoteId);
            }}
            sx={{ 
              bgcolor: 'info.light', 
              '&:hover': { bgcolor: 'info.main' } 
            }}
          >
            <Visibility fontSize={size} />
          </IconButton>
        </Tooltip>
      )}
      
      {showEdit && (
        <Tooltip title="Édition wizard">
          <IconButton
            size={size}
            color="secondary"
            onClick={(e) => {
              e.stopPropagation();
              onAction('edit', quoteId);
            }}
            sx={{ 
              bgcolor: 'secondary.light', 
              '&:hover': { bgcolor: 'secondary.main' } 
            }}
          >
            <Edit fontSize={size} />
          </IconButton>
        </Tooltip>
      )}
      
      {showDirectEdit && (
        <Tooltip title="Édition directe - Nouveau !">
          <IconButton
            size={size}
            color="info"
            onClick={(e) => {
              e.stopPropagation();
              onAction('edit-direct', quoteId);
            }}
            sx={{ 
              bgcolor: 'info.light', 
              '&:hover': { bgcolor: 'info.main' },
              position: 'relative',
              '&::after': {
                content: '"NEW"',
                position: 'absolute',
                top: -8,
                right: -8,
                fontSize: '8px',
                fontWeight: 'bold',
                bgcolor: 'error.main',
                color: 'white',
                px: 0.5,
                py: 0.25,
                borderRadius: 1,
                lineHeight: 1
              }
            }}
          >
            <Settings fontSize={size} />
          </IconButton>
        </Tooltip>
      )}

      {showApproval && status === 'PENDING_APPROVAL' && (
        <>
          <Tooltip title="Approuver">
            <IconButton
              size={size}
              color="success"
              onClick={(e) => {
                e.stopPropagation();
                onAction('approve', quoteId);
              }}
              sx={{ 
                bgcolor: 'success.light', 
                '&:hover': { bgcolor: 'success.main' } 
              }}
            >
              <CheckCircle fontSize={size} />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Rejeter">
            <IconButton
              size={size}
              color="error"
              onClick={(e) => {
                e.stopPropagation();
                onAction('reject', quoteId);
              }}
              sx={{ 
                bgcolor: 'error.light', 
                '&:hover': { bgcolor: 'error.main' } 
              }}
            >
              <Cancel fontSize={size} />
            </IconButton>
          </Tooltip>
        </>
      )}

      {showSend && status === 'APPROVED' && (
        <Tooltip title="Envoyer au client">
          <IconButton
            size={size}
            color="info"
            onClick={(e) => {
              e.stopPropagation();
              onAction('send', quoteId);
            }}
            sx={{ 
              bgcolor: 'info.light', 
              '&:hover': { bgcolor: 'info.main' } 
            }}
          >
            <Send fontSize={size} />
          </IconButton>
        </Tooltip>
      )}

      {showDelete && (
        <Tooltip title="Supprimer">
          <IconButton
            size={size}
            color="error"
            onClick={(e) => {
              e.stopPropagation();
              onAction('delete', quoteId);
            }}
            sx={{ 
              bgcolor: 'error.light', 
              '&:hover': { bgcolor: 'error.main' } 
            }}
          >
            <Delete fontSize={size} />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
};

export default QuoteActionButtons;