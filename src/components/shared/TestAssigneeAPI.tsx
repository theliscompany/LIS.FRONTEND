import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { getApiAssigneeOptions } from '@features/request/api/@tanstack/react-query.gen';

const TestAssigneeAPI: React.FC = () => {
    const { data, isLoading, error, refetch } = useQuery({
        ...getApiAssigneeOptions(),
        enabled: true,
    });

    console.log('[TestAssigneeAPI] Debug:', {
        data: data?.length || 0,
        isLoading,
        error: error?.message,
        errorType: error?.constructor?.name
    });

    return (
        <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: 2, mb: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
                Test API Assignés
            </Typography>
            
            <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>État:</strong> {isLoading ? 'Chargement...' : 'Terminé'}
            </Typography>
            
            <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Données:</strong> {data?.length || 0} assignés
            </Typography>
            
            {error && (
                <Typography variant="body2" color="error" sx={{ mb: 1 }}>
                    <strong>Erreur:</strong> {error.message}
                </Typography>
            )}
            
            <Button 
                variant="contained" 
                size="small" 
                onClick={() => refetch()}
                sx={{ mr: 1 }}
            >
                Refetch
            </Button>
            
            <Button 
                variant="outlined" 
                size="small" 
                onClick={() => console.log('[TestAssigneeAPI] Data:', data)}
            >
                Log Data
            </Button>
        </Box>
    );
};

export default TestAssigneeAPI; 