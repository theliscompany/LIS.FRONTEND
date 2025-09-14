// 🔧 SCRIPT DE CORRECTION AUTOMATIQUE COMPLÈTE
// RequestWizard.tsx

// === 1. CORRECTION DES IMPORTS ===
// Remplacer ligne 54:
// from '../types';
// Par:
// from '../types/DraftQuote';

// === 2. CORRECTION STEP1.CUSTOMER (3 occurrences) ===
// Remplacer toutes les occurrences de:
// customer: request.customerId ? { contactId: request.customerId, contactName: request.companyName } : undefined,
// Par:
// customer: request.customerId ? { 
//   contactId: request.customerId, 
//   contactName: request.companyName, 
//   companyName: request.companyName || '', 
//   email: '' 
// } : undefined,

// === 3. CORRECTION STEP1.CITYFROM/CITYTO (3 occurrences) ===
// Supprimer cityName et garder seulement name
// Remplacer:
// cityFrom: request.pickupLocation?.city ? { 
//   cityName: request.pickupLocation.city, 
//   name: request.pickupLocation.city,
//   country: request.pickupLocation.country || ''
// } : undefined,
// Par:
// cityFrom: request.pickupLocation?.city ? { 
//   name: request.pickupLocation.city,
//   country: request.pickupLocation.country || ''
// } : undefined,

// === 4. CORRECTION STEP1.PRODUCTNAME (3 occurrences) ===
// Remplacer:
// productName: { productName: 'DEBUG PRODUCT' },
// Par:
// productName: { productId: 0, productName: 'DEBUG PRODUCT' },

// === 5. CORRECTION STEP3 (2 occurrences) ===
// Remplacer:
// step3: { selectedContainers: { list: [] } },
// Par:
// step3: { 
//   containers: [],
//   summary: { totalContainers: 0, totalTEU: 0, containerTypes: [] },
//   route: { 
//     origin: { city: { name: '', country: '' }, port: { portId: 0, portName: '', country: '' } }, 
//     destination: { city: { name: '', country: '' }, port: { portId: 0, portName: '', country: '' } } 
//   },
//   selectedContainers: { list: [] } 
// },

// === 6. CORRECTION STEP6 (2 occurrences) ===
// Remplacer:
// step6: {
//   selectedMiscellaneous: mappedForLocal,
//   completed: mappedForLocal.length > 0
// }
// Par:
// step6: {
//   selections: mappedForLocal.map(m => ({
//     id: m.id,
//     service: { serviceId: m.serviceId, serviceName: m.serviceName, category: '' },
//     supplier: { supplierName: m.supplierName },
//     pricing: { unitPrice: m.price, quantity: 1, subtotal: m.price, currency: m.currency },
//     validity: { validUntil: m.validUntil },
//     remarks: '',
//     isSelected: true,
//     selectedAt: new Date()
//   })),
//   summary: {
//     totalSelections: mappedForLocal.length,
//     totalAmount: mappedForLocal.reduce((sum, m) => sum + m.price, 0),
//     currency: 'EUR',
//     categories: []
//   }
// }

// === 7. CORRECTION SELECTEDHAULAGE (8 occurrences) ===
// Remplacer toutes les occurrences de:
// unitTariff: draftQuote.selectedHaulage.unitTariff,
// currency: draftQuote.selectedHaulage.currency,
// freeTime: draftQuote.selectedHaulage.freeTime,
// Par:
// unitTariff: draftQuote.selectedHaulage.tariff?.unitPrice || 0,
// currency: draftQuote.selectedHaulage.tariff?.currency || 'EUR',
// freeTime: draftQuote.selectedHaulage.tariff?.freeTime || 0,

// === 8. CORRECTION SELECTEDSEAFREIGHT (6 occurrences) ===
// Remplacer toutes les occurrences de:
// seaFreightId: draftQuote.selectedSeafreights[0].seaFreightId,
// carrierName: draftQuote.selectedSeafreights[0].carrierName,
// Par:
// seafreightId: draftQuote.selectedSeafreights[0].seafreightId,
// carrierName: draftQuote.selectedSeafreights[0].carrier?.name || '',

// === 9. CORRECTION LOADDRAFTFROMDATABASE (1 occurrence) ===
// Ligne 2509 - Vérifier la signature
// Si la fonction attend 2 arguments, garder:
// setDraftQuote(prev => loadDraftFromDatabase(parsedData, prev));
// Si la fonction n'attend qu'1 argument, changer en:
// setDraftQuote(prev => loadDraftFromDatabase(parsedData));

// === 10. CORRECTION PROPRIÉTÉS MANQUANTES (5 occurrences) ===
// Remplacer:
// totalContainers: draftQuote.totalContainers || 0,
// containerTypes: draftQuote.containerTypes || [],
// currentStep: draftQuote.currentStep,
// Par:
// totalContainers: draftQuote.step3?.summary?.totalContainers || 0,
// containerTypes: draftQuote.step3?.summary?.containerTypes || [],
// currentStep: activeStep, // Utiliser activeStep au lieu de draftQuote.currentStep

console.log('✅ Script de correction créé. Appliquez ces corrections manuellement dans RequestWizard.tsx');






