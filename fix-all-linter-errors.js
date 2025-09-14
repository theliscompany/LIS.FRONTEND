// 🔧 SCRIPT DE CORRECTION COMPLÈTE DES ERREURS DE LINTER
// RequestWizard.tsx

// === 1. CORRECTION STEP1.CUSTOMER (3 occurrences) ===
// Remplacer toutes les occurrences de :
// customer: request.customerId ? { contactId: request.customerId, contactName: request.companyName } : undefined,
// Par :
// customer: request.customerId ? { 
//   contactId: request.customerId, 
//   contactName: request.companyName, 
//   companyName: request.companyName || '', 
//   email: '' 
// } : undefined,

// === 2. CORRECTION STEP1.CITYFROM/CITYTO ===
// Supprimer cityName et garder seulement name
// AVANT:
// cityFrom: request.pickupLocation?.city ? { 
//   cityName: request.pickupLocation.city, 
//   name: request.pickupLocation.city,
//   country: request.pickupLocation.country || ''
// } : undefined,
// APRÈS:
// cityFrom: request.pickupLocation?.city ? { 
//   name: request.pickupLocation.city,
//   country: request.pickupLocation.country || ''
// } : undefined,

// === 3. CORRECTION STEP1.PRODUCTNAME ===
// Ajouter productId manquant
// AVANT:
// productName: { productName: 'DEBUG PRODUCT' },
// APRÈS:
// productName: { productId: 0, productName: 'DEBUG PRODUCT' },

// === 4. CORRECTION STEP3 ===
// Ajouter containers, summary, route manquants
// AVANT:
// step3: { selectedContainers: { list: [] } },
// APRÈS:
// step3: { 
//   containers: [],
//   summary: { totalContainers: 0, totalTEU: 0, containerTypes: [] },
//   route: { 
//     origin: { city: { name: '', country: '' }, port: { portId: 0, portName: '', country: '' } }, 
//     destination: { city: { name: '', country: '' }, port: { portId: 0, portName: '', country: '' } } 
//   },
//   selectedContainers: { list: [] } 
// },

// === 5. CORRECTION STEP6 ===
// Ajouter selections et summary manquants
// AVANT:
// step6: {
//   selectedMiscellaneous: mappedForLocal,
//   completed: mappedForLocal.length > 0
// }
// APRÈS:
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

// === 6. CORRECTION SELECTEDHAULAGE ===
// Utiliser tariff.* au lieu des propriétés directes
// AVANT:
// unitTariff: draftQuote.selectedHaulage.unitTariff,
// currency: draftQuote.selectedHaulage.currency,
// freeTime: draftQuote.selectedHaulage.freeTime,
// APRÈS:
// unitTariff: draftQuote.selectedHaulage.tariff?.unitPrice || 0,
// currency: draftQuote.selectedHaulage.tariff?.currency || 'EUR',
// freeTime: draftQuote.selectedHaulage.tariff?.freeTime || 0,

// === 7. CORRECTION SELECTEDSEAFREIGHT ===
// Utiliser les bonnes propriétés du type
// AVANT:
// seaFreightId: draftQuote.selectedSeafreights[0].seaFreightId,
// carrierName: draftQuote.selectedSeafreights[0].carrierName,
// APRÈS:
// seafreightId: draftQuote.selectedSeafreights[0].seafreightId,
// carrierName: draftQuote.selectedSeafreights[0].carrier?.name || '',

// === 8. CORRECTION LOADDRAFTFROMDATABASE ===
// Vérifier la signature de la fonction dans DraftQuote.ts
// Elle attend 2 arguments : parsedData et currentDraftQuote

