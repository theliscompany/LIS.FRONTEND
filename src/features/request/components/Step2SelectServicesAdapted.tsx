/**
 * Step2SelectServices adapté pour le RequestWizard
 * Utilise les adaptateurs de données pour normaliser l'accès aux données
 */

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { 
  Button, 
  Checkbox, 
  List, 
  ListItem, 
  Box, 
  CircularProgress, 
  Typography, 
  Pagination,
  Card,
  CardContent,
  Avatar,
  Chip,
  Fade,
  Slide,
  LinearProgress,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from "@mui/material";
import ServiceIcon from '@mui/icons-material/Support';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DescriptionIcon from '@mui/icons-material/Description';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useQuery } from '@tanstack/react-query';
import { getApiServiceStatisticsUsageByCountryOptions } from '@features/shipment/api/@tanstack/react-query.gen';
import { getStep1Data, getStep2Data } from '../adapters/StepDataAdapters';
import DebugStep2Data from './DebugStep2Data';

interface Step2SelectServicesAdaptedProps {
  requestData: any;
  onStepUpdate: (data: any) => void;
  onBack: () => void;
  onNext: () => void;
}

export default function Step2SelectServicesAdapted({
  requestData,
  onStepUpdate,
  onBack,
  onNext,
}: Step2SelectServicesAdaptedProps) {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  // ✅ NOUVEAU: Utilisation des adaptateurs de données
  const step1Data = getStep1Data(requestData);
  const step2Data = getStep2Data(requestData);

  // ✅ Utilisation du SDK pour charger les services avec les données normalisées
  const departureCountry = step1Data.cityFrom.country;
  const destinationCountry = step1Data.cityTo.country;
  const productNameParam = step1Data.productName.productName;
  const incotermNameParam = step1Data.incotermName;

  // ✅ Query pour charger les services via le SDK
  const { data: servicesData, isLoading: loadingServices, error: servicesError } = useQuery(
    getApiServiceStatisticsUsageByCountryOptions({
      query: {
        departureCountry,
        destinationCountry,
        productName: productNameParam,
        incotermName: incotermNameParam
      }
    })
  );

  // ✅ Traitement des données reçues du SDK
  const services = Array.isArray(servicesData) ? servicesData : [];
  
  // ✅ Appel du callback quand les services sont chargés
  useEffect(() => {
    if (services.length > 0) {
      console.log('✅ [STEP2_ADAPTED] Services chargés:', services.length);
    }
  }, [services]);

  // ✅ NOUVELLE LOGIQUE: Synchronisation des services sauvegardés avec les services chargés
  useEffect(() => {
    if (step2Data.selected.length > 0) {
      console.log('🔄 [STEP2_ADAPTED] Synchronisation des services sauvegardés avec les services chargés');
      console.log('🔄 [STEP2_ADAPTED] Services sauvegardés:', step2Data.selected);
      console.log('🔄 [STEP2_ADAPTED] Services chargés depuis l\'API:', services.length);
      
      if (services.length > 0) {
        // Vérifier si tous les services sauvegardés sont présents dans les services chargés
        const missingServices = step2Data.selected.filter(savedService => 
          !services.some(apiService => 
            savedService.serviceId === apiService.serviceId || 
            savedService.serviceName === apiService.serviceName
          )
        );
        
        if (missingServices.length > 0) {
          console.log('⚠️ [STEP2_ADAPTED] Services sauvegardés non trouvés dans l\'API:', missingServices);
          // Optionnel: Notifier l'utilisateur ou gérer le cas
        } else {
          console.log('✅ [STEP2_ADAPTED] Tous les services sauvegardés sont présents dans l\'API');
        }
      } else {
        console.log('⏳ [STEP2_ADAPTED] Services de l\'API pas encore chargés, mais services sauvegardés disponibles');
      }
    }
  }, [services, step2Data.selected]);

  // ✅ Log des paramètres pour débogage
  useEffect(() => {
    console.log('🔧 [STEP2_ADAPTED] Paramètres pour le SDK:', {
      departureCountry,
      destinationCountry,
      productNameParam,
      incotermNameParam,
      hasServices: services.length > 0,
      servicesError
    });
    
    // ✅ Log des données reçues pour débogage
    console.log('🔧 [STEP2_ADAPTED] Données reçues dans requestData:', {
      requestData: requestData,
      step1Data: step1Data,
      step2Data: step2Data
    });

    // ✅ Log de l'état de sélection
    console.log('🔧 [STEP2_ADAPTED] État de sélection actuel:', {
      selected: step2Data.selected,
      selectedCount: step2Data.selected.length
    });

    // ✅ NOUVEAU: Log détaillé des services pour diagnostic
    console.log('🔧 [STEP2_ADAPTED] DIAGNOSTIC DÉTAILLÉ:');
    console.log('  - Services chargés depuis l\'API:', services.length);
    console.log('  - Services sélectionnés:', step2Data.selected.length);
    console.log('  - Services sélectionnés détail:', step2Data.selected);
    
    if (services.length > 0 && step2Data.selected.length > 0) {
      console.log('🔧 [STEP2_ADAPTED] VÉRIFICATION DES CORRESPONDANCES:');
      step2Data.selected.forEach((selectedService, index) => {
        const matchingApiService = services.find(apiService => 
          apiService.serviceId === selectedService.serviceId || 
          apiService.serviceName === selectedService.serviceName
        );
        console.log(`  ${index + 1}. ${selectedService.serviceName} (ID: ${selectedService.serviceId})`);
        console.log(`     → Trouvé dans l'API: ${matchingApiService ? 'OUI' : 'NON'}`);
        if (matchingApiService) {
          console.log(`     → Service API: ${matchingApiService.serviceName} (ID: ${matchingApiService.serviceId})`);
        }
      });
    }
  }, [departureCountry, destinationCountry, productNameParam, incotermNameParam, services.length, servicesError, requestData, step2Data.selected]);

  // Mapping correctif pour garantir la présence de serviceId et name/serviceName
  const mappedServices = Array.isArray(services)
    ? services.map((s, idx) => ({
        ...s,
        serviceId: s.serviceId || idx, // fallback sur idx si aucun serviceId
        name: s.serviceName || `Service ${idx}`,
      }))
    : [];

  // ✅ NOUVELLE LOGIQUE: Ajouter les services sélectionnés qui ne sont pas dans l'API
  const allServices = [...mappedServices];
  
  if (step2Data.selected.length > 0) {
    step2Data.selected.forEach(savedService => {
      const isAlreadyInList = allServices.some(apiService => 
        apiService.serviceId === savedService.serviceId || 
        apiService.serviceName === savedService.serviceName
      );
      
      if (!isAlreadyInList) {
        console.log('➕ [STEP2_ADAPTED] Ajout du service sauvegardé non trouvé dans l\'API:', savedService.serviceName);
        allServices.push({
          ...savedService,
          serviceId: savedService.serviceId,
          serviceName: savedService.serviceName,
          name: savedService.serviceName,
          usagePercent: savedService.usagePercent || 0
        } as any);
      }
    });
  }

  const paginatedServices = allServices.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const pageCount = Math.ceil(allServices.length / rowsPerPage);

  const handleToggle = (service: any) => {
    console.log('🔄 [STEP2_ADAPTED] handleToggle appelé avec:', {
      service: service.serviceName,
      serviceId: service.serviceId,
      currentSelected: step2Data.selected.length,
      currentSelectedDetails: step2Data.selected.map(s => ({ name: s.serviceName, id: s.serviceId }))
    });
    
    // ✅ CORRECTION: Logique de comparaison robuste
    const isCurrentlySelected = step2Data.selected.some((s) => 
      s.serviceId === service.serviceId || 
      s.serviceName === service.serviceName
    );
    
    console.log('🔄 [STEP2_ADAPTED] Service actuellement sélectionné:', isCurrentlySelected);
    
    if (isCurrentlySelected) {
      // Désélectionner le service
      const newSelected = step2Data.selected.filter((s) => 
        !(s.serviceId === service.serviceId || 
          s.serviceName === service.serviceName)
      );
      console.log('🔧 [STEP2_ADAPTED] Service désélectionné:', service.serviceName);
      console.log('🔧 [STEP2_ADAPTED] Nouvelle sélection (désélection):', newSelected.length, 'services');
      console.log('🔧 [STEP2_ADAPTED] Détail nouvelle sélection:', newSelected.map(s => s.serviceName));
      
      // Mettre à jour le step2
      onStepUpdate({
        selectedServices: newSelected,
        selected: newSelected
      });
    } else {
      // Sélectionner le service
      const newSelected = [...step2Data.selected, service];
      console.log('🔧 [STEP2_ADAPTED] Service sélectionné:', service.serviceName);
      console.log('🔧 [STEP2_ADAPTED] Nouvelle sélection (sélection):', newSelected.length, 'services');
      console.log('🔧 [STEP2_ADAPTED] Détail nouvelle sélection:', newSelected.map(s => s.serviceName));
      
      // Mettre à jour le step2
      onStepUpdate({
        selectedServices: newSelected,
        selected: newSelected
      });
    }
  };

  return (
    <Box sx={{ 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      minHeight: '100vh',
      p: 3
    }}>
      <Fade in timeout={800}>
        <Box>
          {/* ✅ DEBUG: Composant de débogage temporaire */}
          <DebugStep2Data requestData={requestData} />
          {/* Affichage debug du nombre de services reçus */}
          <Typography variant="caption" color="primary" sx={{ mb: 2, display: 'block' }}>
            {Array.isArray(services) ? t('requestWizard.step2.servicesReceived', { count: services.length }) : t('requestWizard.step2.noServicesReceived')}
          </Typography>
          {/* Header avec titre moderne */}
          <Box sx={{ 
            textAlign: 'center', 
            mb: 4,
            background: 'linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%)',
            borderRadius: 4,
            p: 4,
            color: 'white',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
          }}>
            <Typography variant="h3" sx={{ 
              fontWeight: 700, 
              mb: 1,
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
            }}>
              {t('requestWizard.step2.title')}
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              {t('requestWizard.step2.subtitle')}
            </Typography>
          </Box>

          {/* Résumé de la demande */}
          <Slide direction="up" in timeout={1000}>
            <Accordion defaultExpanded sx={{ mb: 4, borderRadius: 3, boxShadow: '0 10px 30px rgba(0,0,0,0.1)', background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)' }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{
                    bgcolor: 'success.main',
                    mr: 2,
                    background: 'linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%)'
                  }}>
                    <ServiceIcon />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                    {t('requestWizard.step2.demandDetailsTitle')}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2} sx={{
                  p: 3,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                  width: '100%'
                }}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <PersonIcon sx={{ color: '#3498db' }} />
                      <Typography variant="subtitle2" color="text.secondary">{t('requestWizard.step2.client')}:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {step1Data.customer.companyName || step1Data.customer.contactName || '-'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <LocationOnIcon sx={{ color: '#e74c3c' }} />
                      <Typography variant="subtitle2" color="text.secondary">{t('requestWizard.step2.departure')}:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {step1Data.cityFrom.name || '-'} / {step1Data.cityFrom.country || '-'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <LocationOnIcon sx={{ color: '#27ae60' }} />
                      <Typography variant="subtitle2" color="text.secondary">{t('requestWizard.step2.arrival')}:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {step1Data.cityTo.name || '-'} / {step1Data.cityTo.country || '-'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <LocalShippingIcon sx={{ color: '#9b59b6' }} />
                      <Typography variant="subtitle2" color="text.secondary">{t('requestWizard.step2.product')}:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {step1Data.productName.productName || '-'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <AssignmentIcon sx={{ color: '#34495e' }} />
                      <Typography variant="subtitle2" color="text.secondary">{t('requestWizard.step2.incoterm')}:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {step1Data.incotermName || '-'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <DescriptionIcon sx={{ color: '#e67e22' }} />
                      <Typography variant="subtitle2" color="text.secondary">{t('requestWizard.step2.comment')}:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {step1Data.comment || '-'}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Slide>

          {/* Liste des services */}
          <Slide direction="up" in timeout={1200}>
            <Card sx={{ 
              mb: 4, 
              borderRadius: 3,
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
            }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ 
                    bgcolor: 'success.main', 
                    mr: 2,
                    background: 'linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%)'
                  }}>
                    <ServiceIcon />
                  </Avatar>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                    {t('requestWizard.step2.availableServicesTitle')}
                  </Typography>
                  <Chip 
                    label={t('requestWizard.step2.selectedCount', { count: step2Data.selected.length })} 
                    color="success" 
                    sx={{ ml: 2 }}
                  />
                </Box>

                {loadingServices ? (
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    py: 8 
                  }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <CircularProgress 
                        size={60}
                        sx={{
                          color: '#56ab2f',
                          mb: 2
                        }}
                      />
                      <Typography variant="h6" sx={{ color: '#7f8c8d' }}>
                        {t('requestWizard.step2.loadingServices')}
                      </Typography>
                    </Box>
                  </Box>
                ) : (
                  <>
                    {paginatedServices.length === 0 ? (
                      <Box sx={{ 
                        textAlign: 'center', 
                        py: 8,
                        color: '#7f8c8d'
                      }}>
                        <ServiceIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
                        <Typography variant="h6">{t('requestWizard.step2.noServicesAvailable')}</Typography>
                        <Typography variant="body2">
                          {t('requestWizard.step2.noServicesCriteria')}
                        </Typography>
                      </Box>
                    ) : (
                      <List sx={{ p: 0 }}>
                        {paginatedServices.map((service, idx) => {
                          // ✅ CORRECTION: Comparaison robuste basée sur serviceId ET serviceName
                          const isSelected = step2Data.selected.some((s) => 
                            s.serviceId === service.serviceId || 
                            s.serviceName === service.serviceName
                          );
                          
                          // ✅ LOG DÉTAILLÉ pour débogage
                          if (step2Data.selected.length > 0) {
                            const matchingService = step2Data.selected.find((s) => 
                              s.serviceId === service.serviceId || 
                              s.serviceName === service.serviceName
                            );
                            if (matchingService) {
                              console.log(`🎯 [STEP2_ADAPTED] Service "${service.serviceName}" (ID: ${service.serviceId}) correspond à "${matchingService.serviceName}" (ID: ${matchingService.serviceId}) - SÉLECTIONNÉ`);
                            } else {
                              console.log(`❌ [STEP2_ADAPTED] Service "${service.serviceName}" (ID: ${service.serviceId}) - NON SÉLECTIONNÉ`);
                            }
                          }
                          
                          // ✅ NOUVEAU: Log pour chaque service rendu
                          console.log(`🎨 [STEP2_ADAPTED] Rendu service ${idx + 1}: ${service.serviceName} (ID: ${service.serviceId}) - ${isSelected ? 'SÉLECTIONNÉ' : 'NON SÉLECTIONNÉ'}`);
                          return (
                            <ListItem
                              key={service.serviceId || service.name + '-' + idx}
                              component="div"
                              onClick={() => handleToggle(service)}
                              sx={{ 
                                cursor: 'pointer', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'space-between',
                                mb: 1,
                                p: 1.2,
                                borderRadius: 2,
                                minHeight: 48,
                                backgroundColor: isSelected ? 'rgba(86, 171, 47, 0.08)' : '#f8f9fa',
                                border: isSelected ? '2px solid #56ab2f' : '2px solid transparent',
                                '&:hover': {
                                  backgroundColor: isSelected ? 'rgba(86, 171, 47, 0.13)' : '#e9ecef',
                                  transform: 'translateY(-1px)',
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                                },
                                transition: 'all 0.2s ease-in-out'
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                                <Checkbox
                                  checked={isSelected}
                                  tabIndex={-1}
                                  sx={{
                                    color: '#56ab2f',
                                    p: 0.5,
                                    '&.Mui-checked': {
                                      color: '#56ab2f',
                                    }
                                  }}
                                />
                                <Box sx={{ ml: 1.2, flex: 1 }}>
                                  <Typography variant="subtitle1" sx={{ 
                                    fontWeight: 600, 
                                    color: '#2c3e50',
                                    mb: 0.2,
                                    fontSize: '1rem'
                                  }}>
                                    {service.name || service.serviceName || t('requestWizard.step2.defaultServiceName')}
                                    {(service as any)._fromSaved && (
                                      <Chip 
                                        label="Sauvegardé" 
                                        size="small" 
                                        sx={{ 
                                          ml: 1, 
                                          fontSize: '0.7rem',
                                          height: 20,
                                          backgroundColor: '#e3f2fd',
                                          color: '#1976d2'
                                        }} 
                                      />
                                    )}
                                  </Typography>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="caption" sx={{ 
                                      fontWeight: 600,
                                      color: '#56ab2f',
                                      fontSize: '0.85rem'
                                    }}>
                                      {t('requestWizard.step2.usagePercent', { percent: service.usagePercent || 0 })}
                                    </Typography>
                                    <Box sx={{ width: 70, flex: 1 }}>
                                      <LinearProgress 
                                        variant="determinate" 
                                        value={service.usagePercent || 0}
                                        sx={{
                                          height: 6,
                                          borderRadius: 3,
                                          backgroundColor: '#e0e0e0',
                                          '& .MuiLinearProgress-bar': {
                                            background: 'linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%)',
                                            borderRadius: 3,
                                          }
                                        }}
                                      />
                                    </Box>
                                  </Box>
                                </Box>
                              </Box>
                              {isSelected && (
                                <CheckCircleIcon 
                                  sx={{ 
                                    color: '#56ab2f', 
                                    fontSize: 22,
                                    ml: 1
                                  }} 
                                />
                              )}
                            </ListItem>
                          );
                        })}
                      </List>
                    )}

                    {/* Pagination */}
                    {pageCount > 1 && (
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        mt: 4 
                      }}>
                        <Pagination
                          count={pageCount}
                          page={page}
                          onChange={(_, value) => setPage(value)}
                          color="primary"
                          size="large"
                          sx={{
                            '& .MuiPaginationItem-root': {
                              borderRadius: 2,
                              fontWeight: 600,
                            },
                            '& .Mui-selected': {
                              background: 'linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%)',
                              color: 'white',
                            }
                          }}
                        />
                      </Box>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </Slide>

          {/* Actions */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              variant="outlined"
              onClick={onBack}
              startIcon={<ArrowBackIcon />}
              sx={{
                borderRadius: 2,
                px: 4,
                py: 1.5,
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '1rem'
              }}
            >
              {t('requestWizard.step2.backButton')}
            </Button>
            <Button
              variant="contained"
              onClick={onNext}
              endIcon={<ArrowForwardIcon />}
              sx={{
                borderRadius: 2,
                px: 4,
                py: 1.5,
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '1rem',
                background: 'linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #4a9a2a 0%, #96d4b8 100%)',
                }
              }}
            >
              {t('requestWizard.step2.nextButton')}
            </Button>
          </Box>
        </Box>
      </Fade>
    </Box>
  );
}
