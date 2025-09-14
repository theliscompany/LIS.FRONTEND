import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Typography, Box, Skeleton, Button, Stack, Tab, Tabs } from '@mui/material';
import { useTranslation } from 'react-i18next';
import QuoteOptionsEditor from '@features/offer/components/QuoteOptionsEditor';
import QuoteGeneralInfoEditor from '@features/offer/components/QuoteGeneralInfoEditor';
import QuoteFinalConfigEditor from '@features/offer/components/QuoteFinalConfigEditor';
import { getQuote } from '@features/offer/api';

interface ManagePriceOfferProps {}

const ManagePriceOffer: React.FC<ManagePriceOfferProps> = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const [offer, setOffer] = useState<any>(null);
  const [offerNumber, setOfferNumber] = useState<string>("");
  const [options, setOptions] = useState<any>(null);
  const [files, setFiles] = useState<any>(null);
  // selectedOption plus nécessaire
  const [loading, setLoading] = useState(true);
  // Suppression des modes multiples - uniquement édition directe maintenant
  const [editMode] = useState<'direct'>('direct');
  const [activeTab, setActiveTab] = useState(0);

  let { id } = useParams();

  useEffect(() => {
    loadOffer();
  }, []);

  // Plus besoin de gestion des modes multiples

  const loadOffer = async () => {
    try {
      setLoading(true);
      const response: any = await getQuote({ path: { id: id || "" } });
      if (response !== null && response !== undefined) {
        console.log(response.data.data);
        var objTotal = response.data.data;
        setFiles(objTotal.files);
        setOptions(objTotal.options);
        setOffer(response.data.data);
        setOfferNumber(response.data.data.quoteOfferNumber);

        // Plus besoin de préparer les données pour FinalValidation
      }
    } catch (err: any) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/quote-offers');
  };

  const handleSaveFromDirectEdit = (updatedQuote: any) => {
    setOffer(updatedQuote);
    handleBack();
  };

  const handleCancelDirectEdit = () => {
    handleBack();
  };

  if (loading) {
    return (
      <div style={{ background: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
        <Box py={2.5}>
          <Skeleton sx={{ mx: 5, my: 2 }} />
        </Box>
      </div>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      pt: 3,
      pb: 6
    }}>
      {/* Header moderne avec gradient */}
      <Box sx={{ 
        background: 'rgba(255, 255, 255, 0.95)', 
        backdropFilter: 'blur(10px)',
        borderRadius: '20px 20px 0 0',
        mx: 2,
        p: 4,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        {/* Titre avec animation */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 3,
          animation: 'fadeInUp 0.6s ease-out'
        }}>
          <Box>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1
              }}
            >
              ⚙️ Configuration Finale - Devis N° {offerNumber}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Édition complète et configuration finale du devis
            </Typography>
          </Box>

          {/* Boutons d'action simplifiés */}
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              onClick={handleCancelDirectEdit}
              sx={{
                borderRadius: 3,
                textTransform: 'none',
                px: 3,
                py: 1.5,
                fontWeight: '600',
                border: '2px solid #f44336',
                color: '#f44336',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(244, 67, 54, 0.3)',
                  backgroundColor: 'rgba(244, 67, 54, 0.05)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Retour aux Devis
            </Button>
          </Stack>
        </Box>

        {/* Navigation des sections */}
        <Box sx={{ 
          mt: 3,
          animation: 'fadeInUp 0.8s ease-out'
        }}>
          <Tabs 
            value={activeTab} 
            onChange={(_, newValue) => setActiveTab(newValue)}
            sx={{
              '& .MuiTabs-indicator': {
                background: 'linear-gradient(135deg, #00bcd4 0%, #0097a7 100%)',
                height: 3,
                borderRadius: 1.5
              },
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: '600',
                fontSize: '1rem',
                '&.Mui-selected': {
                  color: '#00bcd4'
                }
              }
            }}
          >
            <Tab 
              label="⚙️ Options du Devis" 
              sx={{ 
                borderRadius: 2,
                mr: 2,
                '&:hover': {
                  backgroundColor: 'rgba(0, 188, 212, 0.08)'
                }
              }}
            />
            <Tab 
              label="💰 Configuration Finale" 
              sx={{ 
                borderRadius: 2,
                mr: 2,
                '&:hover': {
                  backgroundColor: 'rgba(0, 188, 212, 0.08)'
                }
              }}
            />
            <Tab 
              label="📝 Informations Générales" 
              sx={{ 
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: 'rgba(0, 188, 212, 0.08)'
                }
              }}
            />
          </Tabs>
        </Box>
      </Box>

      {/* Contenu principal avec style moderne */}
      <Box sx={{ 
        background: 'rgba(255, 255, 255, 0.98)', 
        backdropFilter: 'blur(10px)',
        mx: 2,
        borderRadius: '0 0 20px 20px',
        minHeight: '60vh',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        overflow: 'hidden'
      }}>
        {/* Interface d'édition directe unifiée */}
        <Box sx={{ 
          animation: 'fadeInUp 0.8s ease-out'
        }}>
          {activeTab === 0 && (
            // Onglet Options du Devis
            <Box sx={{
              background: 'linear-gradient(135deg, rgba(0, 188, 212, 0.03) 0%, rgba(0, 151, 167, 0.03) 100%)',
              minHeight: '60vh'
            }}>
              <QuoteOptionsEditor
                quote={offer}
                onSave={handleSaveFromDirectEdit}
                onCancel={handleCancelDirectEdit}
              />
            </Box>
          )}
          {activeTab === 1 && (
            // Onglet Configuration Finale (NOUVEAU)
            <Box sx={{
              background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.03) 0%, rgba(255, 152, 0, 0.03) 100%)',
              minHeight: '60vh'
            }}>
              {/* Nous allons créer ce nouveau composant */}
              <QuoteFinalConfigEditor
                quote={offer}
                onSave={handleSaveFromDirectEdit}
                onCancel={handleCancelDirectEdit}
              />
            </Box>
          )}
          {activeTab === 2 && (
            // Onglet Informations Générales
            <Box sx={{
              background: 'linear-gradient(135deg, rgba(0, 188, 212, 0.03) 0%, rgba(0, 151, 167, 0.03) 100%)',
              minHeight: '60vh'
            }}>
              <QuoteGeneralInfoEditor
                quote={offer}
                onSave={handleSaveFromDirectEdit}
                onCancel={handleCancelDirectEdit}
              />
            </Box>
          )}
        </Box>
      </Box>

      {/* Ajout des keyframes globales pour les animations */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
          }
        }
        
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </Box>
  );
};

export default ManagePriceOffer;
