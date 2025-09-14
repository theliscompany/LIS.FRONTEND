import React from 'react';
import { Box, Grid, Card, CardContent, Typography, Avatar, Stack, Button, Chip, Divider, Tooltip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BusinessIcon from '@mui/icons-material/Business';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { blue, green, purple, orange } from '@mui/material/colors';

// Placeholder for charts (replace with Chart.js or Recharts if available)
const ChartPlaceholder = ({ title }: { title: string }) => (
  <Box sx={{ height: 220, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fff', borderRadius: 3, boxShadow: '0 2px 12px #764ba233', mb: 2 }}>
    <Typography variant="subtitle1" sx={{ color: '#764ba2', mb: 1 }}>{title}</Typography>
    <Box sx={{ width: '100%', height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c3cfe2', fontSize: 32, fontWeight: 700 }}>
      [Graphique ici]
    </Box>
  </Box>
);

const kpis = [
  {
    label: 'Demandes en cours',
    value: 12,
    icon: <AssignmentIcon fontSize="large" />, color: blue[500], trend: '+8%', trendColor: green[500]
  },
  {
    label: 'Offres envoyées',
    value: 34,
    icon: <DescriptionIcon fontSize="large" />, color: purple[500], trend: '+5%', trendColor: green[500]
  },
  {
    label: 'Offres acceptées',
    value: 9,
    icon: <CheckCircleIcon fontSize="large" />, color: green[500], trend: '+2%', trendColor: green[500]
  },
  {
    label: 'Clients actifs',
    value: 21,
    icon: <BusinessIcon fontSize="large" />, color: orange[500], trend: '+1', trendColor: green[500]
  },
];

const recentActivity = [
  { type: 'offre', label: 'Offre acceptée', user: 'Société X', date: 'il y a 2h', icon: <CheckCircleIcon sx={{ color: green[500] }} /> },
  { type: 'demande', label: 'Nouvelle demande', user: 'Société Y', date: 'il y a 4h', icon: <AssignmentIcon sx={{ color: blue[500] }} /> },
  { type: 'client', label: 'Nouveau client', user: 'Société Z', date: 'hier', icon: <BusinessIcon sx={{ color: orange[500] }} /> },
];

const Overview: React.FC = () => {
  const navigate = useNavigate();

  const handleNewRequest = () => {
    navigate('/request');
  };

  const handleNewClient = () => {
    navigate('/contacts');
  };

  const handleViewOffers = () => {
    navigate('/quote-offers');
  };

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', p: { xs: 1, md: 4 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4, p: 3, borderRadius: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', boxShadow: '0 10px 30px rgba(102,126,234,0.10)' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>Bienvenue sur LIS Quotes</Typography>
          <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>Vue d'ensemble de votre activité</Typography>
        </Box>
        <Avatar sx={{ width: 64, height: 64, bgcolor: '#fff', color: '#764ba2', fontWeight: 700, fontSize: 32, boxShadow: '0 2px 12px #764ba233' }}>LQ</Avatar>
      </Box>
      {/* KPIs */}
      <Grid container spacing={3} sx={{ mb: 2 }}>
        {kpis.map((kpi, idx) => (
          <Grid item xs={12} sm={6} md={3} key={kpi.label}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px #764ba233', background: '#fff', p: 2, display: 'flex', alignItems: 'center', gap: 2, position: 'relative', overflow: 'visible', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 24px #764ba244' } }}>
              <Avatar sx={{ bgcolor: kpi.color, width: 56, height: 56, mr: 2 }}>{kpi.icon}</Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>{kpi.value}</Typography>
                <Typography variant="body2" sx={{ color: '#764ba2', fontWeight: 500 }}>{kpi.label}</Typography>
              </Box>
              <Chip label={kpi.trend} size="small" sx={{ position: 'absolute', top: 12, right: 12, bgcolor: kpi.trendColor, color: '#fff', fontWeight: 600 }} />
            </Card>
          </Grid>
        ))}
      </Grid>
      {/* Graphiques */}
      <Grid container spacing={3} sx={{ mb: 2 }}>
        <Grid item xs={12} md={8}>
          <ChartPlaceholder title="Evolution des demandes (7 derniers jours)" />
        </Grid>
        <Grid item xs={12} md={4}>
          <ChartPlaceholder title="Répartition des statuts" />
        </Grid>
      </Grid>
      {/* Activité récente */}
      <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px #764ba233', background: '#fff', mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ color: '#764ba2', fontWeight: 700, mb: 2 }}>Activité récente</Typography>
          <Stack spacing={2}>
            {recentActivity.map((item, idx) => (
              <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#f5f7fa', color: '#764ba2', boxShadow: '0 1px 4px #764ba211' }}>{item.icon}</Avatar>
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{item.label}</Typography>
                  <Typography variant="body2" sx={{ color: '#888' }}>{item.user} • {item.date}</Typography>
                </Box>
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>
      {/* Actions rapides */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: { xs: 'center', md: 'flex-end' } }}>
        <Tooltip title="Créer une nouvelle demande">
          <Button 
            variant="contained" 
            startIcon={<AddCircleIcon />} 
            onClick={handleNewRequest}
            sx={{ 
              borderRadius: 3, 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
              color: 'white', 
              fontWeight: 600, 
              px: 4, 
              py: 1.5, 
              boxShadow: '0 2px 8px #764ba233', 
              '&:hover': { 
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)', 
                color: 'white', 
                transform: 'translateY(-2px)', 
                boxShadow: '0 10px 20px #764ba233' 
              }, 
              transition: 'all 0.3s ease-in-out' 
            }}
          >
            Nouvelle demande
          </Button>
        </Tooltip>
        <Tooltip title="Ajouter un client">
          <Button 
            variant="outlined" 
            startIcon={<BusinessIcon />} 
            onClick={handleNewClient}
            sx={{ 
              borderRadius: 3, 
              color: '#764ba2', 
              borderColor: '#764ba2', 
              fontWeight: 600, 
              px: 4, 
              py: 1.5, 
              '&:hover': { 
                borderColor: '#5a6fd8', 
                background: 'rgba(118, 75, 162, 0.04)' 
              } 
            }}
          >
            Nouveau client
          </Button>
        </Tooltip>
        <Tooltip title="Voir les offres">
          <Button 
            variant="outlined" 
            startIcon={<DescriptionIcon />} 
            onClick={handleViewOffers}
            sx={{ 
              borderRadius: 3, 
              color: '#764ba2', 
              borderColor: '#764ba2', 
              fontWeight: 600, 
              px: 4, 
              py: 1.5, 
              '&:hover': { 
                borderColor: '#5a6fd8', 
                background: 'rgba(118, 75, 162, 0.04)' 
              } 
            }}
          >
            Voir les offres
          </Button>
        </Tooltip>
        <Tooltip title="Exporter les stats">
          <Button 
            variant="outlined" 
            startIcon={<TrendingUpIcon />} 
            sx={{ 
              borderRadius: 3, 
              color: '#764ba2', 
              borderColor: '#764ba2', 
              fontWeight: 600, 
              px: 4, 
              py: 1.5, 
              '&:hover': { 
                borderColor: '#5a6fd8', 
                background: 'rgba(118, 75, 162, 0.04)' 
              } 
            }}
          >
            Exporter
          </Button>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default Overview; 