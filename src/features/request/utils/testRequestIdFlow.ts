/**
 * Test utilitaire pour vérifier le flux de RequestId
 */

import { createDraftQuoteFromRequest, buildCreateDraftPayload } from '../types/DraftQuote';

/**
 * Teste le flux complet de RequestId depuis Requests.tsx jusqu'au payload API
 */
export function testRequestIdFlow() {
  console.log('🧪 [TEST] Début du test du flux RequestId');
  
  // Simuler les données reçues de Requests.tsx
  const mockRequestData = {
    requestQuoteId: 'REQ_1234567890_abc123',
    companyName: 'Test Company',
    assigneeId: 'user123',
    assigneeDisplayName: 'John Doe',
    incoterm: 'FOB',
    pickupLocation: { city: 'Paris', country: 'France' },
    deliveryLocation: { city: 'New York', country: 'USA' },
    productName: 'Test Product',
    customerId: 123,
    productId: 456
  };
  
  console.log('🧪 [TEST] Données simulées de Requests.tsx:', mockRequestData);
  
  // Étape 1: Créer le draftQuote depuis la requête
  const draftQuote = createDraftQuoteFromRequest(mockRequestData, 'test@example.com');
  
  console.log('🧪 [TEST] DraftQuote créé:', {
    id: draftQuote.id,
    requestQuoteId: draftQuote.requestQuoteId,
    emailUser: draftQuote.emailUser,
    step1Assignee: draftQuote.step1?.assignee,
    step1Incoterm: draftQuote.step1?.incotermName
  });
  
  // Étape 2: Construire le payload pour l'API
  const payload = buildCreateDraftPayload(draftQuote, 'test@example.com');
  
  console.log('🧪 [TEST] Payload final pour l\'API:', {
    requestId: payload.requestId,
    header: payload.header,
    wizardData: payload.wizardData
  });
  
  // Vérification
  const isRequestIdCorrect = payload.requestId === mockRequestData.requestQuoteId;
  
  console.log('🧪 [TEST] Résultat du test:', {
    isRequestIdCorrect,
    expectedRequestId: mockRequestData.requestQuoteId,
    actualRequestId: payload.requestId,
    testPassed: isRequestIdCorrect,
    note: 'RequestId doit être EXACTEMENT celui de la requête existante'
  });
  
  return {
    testPassed: isRequestIdCorrect,
    expectedRequestId: mockRequestData.requestQuoteId,
    actualRequestId: payload.requestId,
    draftQuote,
    payload
  };
}

/**
 * Teste que les erreurs sont bien levées quand le requestQuoteId est manquant
 */
export function testRequestIdValidation() {
  console.log('🧪 [TEST] Test de validation du RequestId manquant');
  
  try {
    // Test 1: createDraftQuoteFromRequest sans requestQuoteId
    const mockRequestDataWithoutId = {
      companyName: 'Test Company',
      assigneeDisplayName: 'John Doe'
      // requestQuoteId manquant
    };
    
    createDraftQuoteFromRequest(mockRequestDataWithoutId, 'test@example.com');
    console.log('❌ [TEST] ERREUR: createDraftQuoteFromRequest aurait dû lever une erreur');
    return false;
  } catch (error) {
    console.log('✅ [TEST] createDraftQuoteFromRequest lève bien une erreur:', error.message);
  }
  
  try {
    // Test 2: createInitialDraftQuote sans requestQuoteId
    createInitialDraftQuote('test@example.com');
    console.log('❌ [TEST] ERREUR: createInitialDraftQuote aurait dû lever une erreur');
    return false;
  } catch (error) {
    console.log('✅ [TEST] createInitialDraftQuote lève bien une erreur:', error.message);
  }
  
  try {
    // Test 3: buildCreateDraftPayload sans requestQuoteId
    const draftQuoteWithoutId = {
      requestQuoteId: undefined,
      id: 'new',
      emailUser: 'test@example.com'
    } as any;
    
    buildCreateDraftPayload(draftQuoteWithoutId, 'test@example.com');
    console.log('❌ [TEST] ERREUR: buildCreateDraftPayload aurait dû lever une erreur');
    return false;
  } catch (error) {
    console.log('✅ [TEST] buildCreateDraftPayload lève bien une erreur:', error.message);
  }
  
  console.log('✅ [TEST] Tous les tests de validation ont réussi');
  return true;
}

// Exporter pour utilisation dans la console du navigateur
if (typeof window !== 'undefined') {
  (window as any).testRequestIdFlow = testRequestIdFlow;
  (window as any).testRequestIdValidation = testRequestIdValidation;
}
