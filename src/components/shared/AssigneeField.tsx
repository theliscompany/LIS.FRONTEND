import React, { useEffect, useState } from 'react';
import { 
    InputLabel, 
    NativeSelect, 
    Skeleton, 
    Box,
    Typography,
    Avatar,
    Chip,
    FormControl,
    FormHelperText
} from '@mui/material';
import { BootstrapInput, inputLabelStyles } from '@utils/misc/styles';
import { useTranslation } from 'react-i18next';
import { getApiAssigneeOptions } from '@features/request/api/@tanstack/react-query.gen';
import { useQuery } from '@tanstack/react-query';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AuthErrorHandler from './AuthErrorHandler';
import AzureConsentHandler from './AzureConsentHandler';

interface Assignee {
    id?: string | number;
    name?: string;
    email?: string;
    userId?: string;
    idUser?: string;
    // Propriétés compatibles avec l'ancienne interface
    organization?: string;
    displayName?: string;
    mail?: string;
}

interface AssigneeFieldProps {
    // Props de base
    id?: string;
    name?: string;
    value?: string | number;
    onChange?: (value: string | number) => void;
    
    // Props de style et comportement
    label?: string;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    fullWidth?: boolean;
    size?: 'small' | 'medium';
    
    // Props de validation
    error?: boolean;
    helperText?: string;
    
    // Props de données externes
    assignees?: Assignee[];
    isLoading?: boolean;
    
    // Props de personnalisation
    variant?: 'select' | 'chip' | 'compact';
    showAvatar?: boolean;
    showEmail?: boolean;
    showOrganization?: boolean;
    
    // Props de style personnalisé
    labelColor?: string;
    labelWeight?: string;
    customStyles?: any;
}

const AssigneeField: React.FC<AssigneeFieldProps> = ({
    // Props de base
    id = "assigned-manager",
    name,
    value,
    onChange,
    
    // Props de style et comportement
    label,
    placeholder,
    disabled = false,
    required = false,
    fullWidth = true,
    size = 'small',
    
    // Props de validation
    error = false,
    helperText,
    
    // Props de données externes
    assignees: externalAssignees,
    isLoading: externalLoading,
    
    // Props de personnalisation
    variant = 'select',
    showAvatar = false,
    showEmail = true,
    showOrganization = false,
    
    // Props de style personnalisé
    labelColor = 'green',
    labelWeight = 'bold',
    customStyles
}) => {
    const { t } = useTranslation();
    
    // États internes
    const [internalAssignees, setInternalAssignees] = useState<Assignee[]>([]);
    const [internalLoading, setInternalLoading] = useState<boolean>(true);
    
    // Charger les assignés si pas fournis en externe (fallback seulement)
    const { data: assigneesData, isLoading: queryLoading, error: queryError } = useQuery({
        ...getApiAssigneeOptions(),
        enabled: !externalAssignees || externalAssignees.length === 0,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        retry: (failureCount, error: any) => {
            // Ne pas retry en cas d'erreur d'authentification
            if (error?.message?.includes('AADSTS50076') || 
                error?.message?.includes('AADSTS65001') ||
                error?.message?.includes('interaction_required') ||
                error?.message?.includes('invalid_grant')) {
                console.warn('[AssigneeField] Erreur d\'authentification, pas de retry:', error);
                return false;
            }
            return failureCount < 3;
        }
    });
    
    // Debug détaillé
    console.log('[AssigneeField] Debug détaillé:', {
        externalAssignees: externalAssignees?.length || 0,
        externalAssigneesExists: !!externalAssignees,
        enabled: !externalAssignees || externalAssignees.length === 0,
        queryLoading,
        queryError,
        assigneesData: assigneesData?.length || 0,
        assigneesDataExists: !!assigneesData,
        internalAssignees: internalAssignees.length,
        internalLoading
    });
    
    // Mettre à jour les assignés internes quand les données arrivent
    useEffect(() => {
        console.log('[AssigneeField] useEffect - assigneesData changed:', {
            assigneesData: assigneesData?.length || 0,
            externalAssignees: externalAssignees?.length || 0,
            shouldUpdate: assigneesData && (!externalAssignees || externalAssignees.length === 0)
        });
        
        if (assigneesData && (!externalAssignees || externalAssignees.length === 0)) {
            const filteredData = Array.isArray(assigneesData) 
                ? assigneesData.filter(item => item && (item.id != null || item.userId != null || item.idUser != null))
                : [];
            console.log('[AssigneeField] Setting internal assignees:', filteredData.length);
            setInternalAssignees(filteredData as Assignee[]);
            setInternalLoading(false);
        }
    }, [assigneesData, externalAssignees]);
    
    // Mettre à jour l'état de chargement
    useEffect(() => {
        if (!externalAssignees || externalAssignees.length === 0) {
            setInternalLoading(queryLoading);
        }
    }, [queryLoading, externalAssignees]);
    
    // Utiliser les données externes ou charger en interne
    const assignees = (externalAssignees && externalAssignees.length > 0) ? externalAssignees : internalAssignees;
    const isLoading = (externalLoading !== undefined && externalAssignees && externalAssignees.length > 0) ? externalLoading : internalLoading;
    
    // Debug final
    console.log('[AssigneeField] Debug final:', {
        externalAssignees: externalAssignees?.length || 0,
        internalAssignees: internalAssignees.length,
        assignees: assignees.length,
        isLoading,
        externalLoading,
        internalLoading,
        queryLoading,
        queryError,
        assigneesData: assigneesData?.length || 0
    });
    

    
    // Trouver l'assigné sélectionné
    const selectedAssignee = assignees.find((assignee: Assignee) => {
        const assigneeId = assignee.id || assignee.userId || assignee.idUser;
        return String(assigneeId) === String(value);
    });
    
    // Gestionnaire de changement
    const handleChange = (newValue: string) => {
        if (onChange) {
            onChange(newValue);
        }
    };
    
    // Rendu du label
    const renderLabel = () => (
        <InputLabel 
            htmlFor={id} 
            sx={{ 
                ...inputLabelStyles, 
                color: labelColor, 
                fontWeight: labelWeight,
                ...customStyles?.label
            }}
        >
            {label || t('assignedManager')}
            {required && <span style={{ color: 'red' }}> *</span>}
        </InputLabel>
    );
    
    // Rendu du skeleton de chargement
    const renderSkeleton = () => (
        <Skeleton 
            sx={{ 
                mt: 3, 
                height: size === 'small' ? 40 : 56,
                ...customStyles?.skeleton
            }} 
        />
    );
    
    // Rendu du chip (variant compact)
    const renderChip = () => {
        if (!selectedAssignee) return null;
        
        const assigneeId = selectedAssignee.id || selectedAssignee.userId || selectedAssignee.idUser;
        const displayName = selectedAssignee.displayName || selectedAssignee.name || selectedAssignee.mail || String(assigneeId);
        const email = selectedAssignee.mail || selectedAssignee.email;
        
        return (
            <Box sx={{ mt: 1, mb: 1 }}>
                <Chip
                    avatar={
                        showAvatar ? (
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                                {displayName.charAt(0).toUpperCase()}
                            </Avatar>
                        ) : undefined
                    }
                    label={
                        <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {displayName}
                            </Typography>
                            {showEmail && email && (
                                <Typography variant="caption" color="text.secondary">
                                    {email}
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
                        },
                        ...customStyles?.chip
                    }}
                />
            </Box>
        );
    };
    
    // Rendu du select
    const renderSelect = () => (
        <FormControl fullWidth={fullWidth} error={error}>
            <NativeSelect
                id={id}
                name={name}
                value={value || ""}
                size={size}
                onChange={(e: any) => handleChange(e.target.value)}
                input={<BootstrapInput />}
                disabled={disabled || isLoading}
                sx={customStyles?.select}
            >
                <option value="">
                    {placeholder || t('noAgentAssigned')}
                </option>
                {assignees.map((assignee: Assignee, index: number) => {
                    const assigneeId = assignee.id || assignee.userId || assignee.idUser;
                    const displayName = assignee.displayName || assignee.name || assignee.mail || String(assigneeId);
                    const email = assignee.mail || assignee.email;
                    const organization = assignee.organization;
                    
                    let optionText = displayName;
                    if (showEmail && email) {
                        optionText += ` (${email})`;
                    }
                    if (showOrganization && organization) {
                        optionText += ` - ${organization}`;
                    }
                    
                    return (
                        <option key={`assignee-${assigneeId}-${index}`} value={String(assigneeId)}>
                            {optionText}
                        </option>
                    );
                })}
            </NativeSelect>
            {helperText && <FormHelperText>{helperText}</FormHelperText>}
        </FormControl>
    );
    
    // Rendu principal
    if (isLoading) {
        return (
            <Box sx={{ mb: 3, ...customStyles?.container }}>
                {renderLabel()}
                {renderSkeleton()}
            </Box>
        );
    }
    
    const content = (
        <Box sx={{ mb: 3, ...customStyles?.container }}>
            {renderLabel()}
            
            {variant === 'chip' && renderChip()}
            
            {variant === 'select' && renderSelect()}
            
            {variant === 'compact' && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AssignmentIcon sx={{ color: '#f39c12', fontSize: 20 }} />
                    {renderSelect()}
                </Box>
            )}
        </Box>
    );

    return (
        <AzureConsentHandler 
            error={queryError} 
            onRetry={() => {
                // Refetch les données
                window.location.reload();
            }}
        >
            <AuthErrorHandler 
                error={queryError} 
                onRetry={() => {
                    // Refetch les données
                    window.location.reload();
                }}
            >
                {content}
            </AuthErrorHandler>
        </AzureConsentHandler>
    );
};

export default AssigneeField; 