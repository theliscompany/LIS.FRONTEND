/**
 * Script de test avec le payload exact de l'utilisateur
 */

// Payload exact de l'utilisateur
const apiResponse = {
  "code": 200,
  "message": "Draft quote retrieved successfully",
  "data": {
    "draftQuoteId": "66d1af7d-86a9-4b52-b409-f0d861bbc614",
    "requestQuoteId": "68b4952e440a44a9b3ce01ad",
    "resumeToken": "90dd6823b776",
    "createdAt": "2025-09-22T20:44:13.746Z",
    "updatedAt": "2025-09-22T20:44:13.746Z",
    "status": "inprogress",
    "currency": "EUR",
    "incoterm": "FOB",
    "customer": {
      "type": "company",
      "name": "FOETS DENIS NV",
      "vat": null,
      "emails": [],
      "phones": [
        "+32.14.850014"
      ],
      "address": {
        "line1": "",
        "line2": null,
        "city": "Mons",
        "zip": "",
        "country": "Belgium"
      },
      "contactPerson": {
        "fullName": "",
        "phone": "+32.14.850014",
        "email": ""
      }
    },
    "shipment": {
      "mode": "sea",
      "containerCount": 1,
      "containerTypes": [
        "20GP",
        "40GP",
        "40HC"
      ],
      "commodity": "USED CLOTHES",
      "hsCodes": [],
      "origin": {
        "location": "Mons",
        "country": "Belgium"
      },
      "destination": {
        "location": "Douala",
        "country": "Cameroon"
      },
      "requestedDeparture": "2025-10-24T22:00:00Z",
      "docs": {
        "requiresVGM": false,
        "requiresBLDraftApproval": false
      },
      "constraints": {
        "minTruckLeadDays": 6,
        "terminalCutoffDays": 11,
        "customsDeadlineHours": 48
      }
    },
    "attachments": [],
    "commercialTerms": {
      "depositPolicy": {
        "type": "fixed",
        "value": 2000
      },
      "generalConditionsId": "CGV-2025-01"
    },
    "wizard": {
      "notes": null,
      "selectedServiceLevel": "direct",
      "seafreights": [
        {
          "id": "687d5325d1002238a6a2109c",
          "carrier": "SCHENKER NV",
          "service": "Bi-weekly",
          "rate": [
            {
              "containerType": "40HC",
              "basePrice": 3600
            }
          ],
          "surcharges": []
        }
      ],
      "haulages": [
        {
          "id": "OFF-2025-8971",
          "phase": "",
          "mode": "truck",
          "from": "",
          "to": "",
          "pricingScope": "per_container",
          "containerFilter": [],
          "windows": null,
          "basePrice": 1000,
          "surcharges": []
        }
      ],
      "services": [
        {
          "code": "CUSTOMS",
          "label": "Dédouanement",
          "calc": "flat",
          "unit": "per_shipment",
          "value": 150,
          "currency": "EUR",
          "taxable": false
        },
        {
          "code": "DOCUMENTATION",
          "label": "Documentation",
          "calc": "flat",
          "unit": "per_shipment",
          "value": 75,
          "currency": "EUR",
          "taxable": false
        },
        {
          "code": "CERTIFICATION",
          "label": "Certification",
          "calc": "flat",
          "unit": "per_shipment",
          "value": 80,
          "currency": "EUR",
          "taxable": false
        }
      ]
    },
    "options": []
  },
  "meta": null,
  "errors": []
};

// Simuler la fonction d'adaptation corrigée
function adaptDraftToWizardForm(draftData) {
  console.log('🔄 [DRAFT_ADAPTER] Adaptation des données de brouillon vers le wizard:', draftData);
  console.log('🔍 [DRAFT_ADAPTER] Structure des données reçues:', {
    keys: Object.keys(draftData),
    hasCustomer: !!draftData.customer,
    hasShipment: !!draftData.shipment,
    hasOptions: !!draftData.options,
    hasWizard: !!draftData.wizard,
    draftQuoteId: draftData.draftQuoteId
  });

  // Extraire les données avec des fallbacks multiples
  const customerName = draftData.customer?.name || draftData.customerName || draftData.clientName || '';
  const customerEmail = draftData.customer?.emails?.[0] || draftData.customer?.email || draftData.email || '';
  const customerPhone = draftData.customer?.phones?.[0] || draftData.customer?.phone || draftData.phone || '';
  
  // Gérer la structure de l'API où les données sont dans shipment.origin/destination
  const originCity = draftData.shipment?.origin?.location || 
                    draftData.shipment?.origin?.city || 
                    draftData.origin?.location || 
                    draftData.origin?.city ||
                    draftData.pickupLocation?.city ||
                    draftData.pickupCity || '';
                    
  const originCountry = draftData.shipment?.origin?.country || 
                       draftData.origin?.country ||
                       draftData.pickupLocation?.country ||
                       draftData.pickupCountry || '';
                       
  const destinationCity = draftData.shipment?.destination?.location || 
                         draftData.shipment?.destination?.city || 
                         draftData.destination?.location || 
                         draftData.destination?.city ||
                         draftData.deliveryLocation?.city ||
                         draftData.deliveryCity || '';
                         
  const destinationCountry = draftData.shipment?.destination?.country || 
                            draftData.destination?.country ||
                            draftData.deliveryLocation?.country ||
                            draftData.deliveryCountry || '';

  console.log('🔍 [DRAFT_ADAPTER] Extraction des données géographiques:', {
    originCity,
    originCountry,
    destinationCity,
    destinationCountry,
    hasOriginLocation: !!draftData.shipment?.origin?.location,
    hasDestinationLocation: !!draftData.shipment?.destination?.location
  });

  // Extraire les données du wizard (seafreights, haulages, services)
  const wizardData = draftData.wizard || {};
  const seafreights = wizardData.seafreights || [];
  const haulages = wizardData.haulages || [];
  const services = wizardData.services || [];

  // Créer un formulaire de base
  const wizardForm = {
    basics: {
      // Adapter les données de base depuis le brouillon
      cargoType: mapCargoTypeFromDraft(draftData.shipment?.mode || draftData.mode || 'sea'),
      incoterm: draftData.incoterm || 'FOB',
      origin: {
        city: originCity,
        country: originCountry
      },
      destination: {
        city: destinationCity,
        country: destinationCountry
      },
      requestedDeparture: draftData.shipment?.requestedDeparture || draftData.requestedDeparture || new Date().toISOString(),
      goodsDescription: draftData.shipment?.commodity || draftData.shipment?.goodsDescription || draftData.commodity || draftData.goodsDescription || '',
      // Informations client
      client: {
        companyName: customerName,
        contactFullName: draftData.customer?.contactPerson?.firstName && draftData.customer?.contactPerson?.lastName 
          ? `${draftData.customer.contactPerson.firstName} ${draftData.customer.contactPerson.lastName}`
          : draftData.customer?.contactPerson?.fullName || '',
        email: customerEmail,
        phone: customerPhone
      },
      // Informations assigné (si disponibles)
      assignee: {
        assigneeDisplayName: draftData.assignee?.displayName || '',
        assigneeId: draftData.assignee?.id || ''
      }
    },
    // Adapter les options existantes
    existingOptions: draftData.options?.map(option => ({
      id: option.optionId || 'uuid-' + Math.random(),
      name: option.label || `Option ${draftData.options?.indexOf(option) + 1}`,
      seafreights: option.seafreights || [],
      haulages: option.haulages || [],
      services: option.services || [],
      containers: option.containers || [],
      ports: option.ports || [],
      totals: option.totals || {
        seafreights: 0,
        haulages: 0,
        services: 0,
        grandTotal: 0
      },
      currency: option.currency || 'EUR',
      validUntil: option.validUntil || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      isPreferred: option.isPreferred || false
    })) || [],
    // Option en cours avec les données du wizard
    currentOption: {
      seafreights: seafreights.map(sf => ({
        id: sf.id || 'uuid-' + Math.random(),
        carrier: sf.carrier || '',
        service: sf.service || '',
        etd: sf.etd || null,
        eta: sf.eta || null,
        rates: sf.rate?.map(rate => ({
          containerType: rate.containerType || '',
          basePrice: rate.basePrice || 0,
          currency: rate.currency || 'EUR'
        })) || [],
        surcharges: sf.surcharges || []
      })),
      haulages: haulages.map(haulage => ({
        id: haulage.id || 'uuid-' + Math.random(),
        mode: haulage.mode || 'truck',
        leg: haulage.phase || 'pre',
        from: haulage.from || '',
        to: haulage.to || '',
        price: haulage.basePrice || 0,
        note: haulage.note || '',
        pricingScope: haulage.pricingScope || 'per_container',
        containerFilter: haulage.containerFilter || [],
        windows: haulage.windows || null,
        surcharges: haulage.surcharges || []
      })),
      services: services.map(service => ({
        code: service.code || '',
        label: service.label || '',
        price: service.value || 0,
        currency: service.currency || 'EUR',
        calc: service.calc || 'flat',
        unit: service.unit || 'per_shipment',
        taxable: service.taxable || false
      })),
      containers: [],
      ports: []
    },
    // Adapter les données du wizard si disponibles
    options: {
      seafreights: seafreights,
      haulages: haulages,
      services: services
    },
    attachments: draftData.attachments || []
  };

  console.log('✅ [DRAFT_ADAPTER] Formulaire adapté depuis le brouillon:', wizardForm);
  return wizardForm;
}

// Mappe le mode de transport du brouillon vers le type de cargo du wizard
function mapCargoTypeFromDraft(mode) {
  const mapping = {
    'sea': 'FCL',
    'air': 'AIR',
    'road': 'FCL',
    'rail': 'FCL'
  };
  return mapping[mode?.toLowerCase()] || 'FCL';
}

// Test de l'adaptation avec le payload exact
console.log('🧪 [TEST] === TEST AVEC LE PAYLOAD EXACT ===');

try {
  // 1. Simuler la réponse de l'API
  console.log('📡 [TEST] Réponse de l\'API reçue:', {
    code: apiResponse.code,
    message: apiResponse.message,
    hasData: !!apiResponse.data
  });

  // 2. Extraire les données (comme dans NewRequestWizard.tsx)
  const draftData = apiResponse.data;
  console.log('📦 [TEST] Données du brouillon extraites:', {
    draftQuoteId: draftData.draftQuoteId,
    customer: draftData.customer?.name,
    origin: draftData.shipment?.origin,
    destination: draftData.shipment?.destination
  });

  // 3. Test d'adaptation (comme dans NewRequestWizard.tsx)
  console.log('🔍 [TEST] Données à adapter:', draftData);
  const adaptedForm = adaptDraftToWizardForm(draftData);
  
  // 4. Vérifier les données mappées
  console.log('\n📋 [TEST] === VÉRIFICATION DES DONNÉES MAPPÉES ===');
  console.log('✅ [TEST] Informations de base:', {
    cargoType: adaptedForm.basics.cargoType,
    incoterm: adaptedForm.basics.incoterm,
    origin: adaptedForm.basics.origin,
    destination: adaptedForm.basics.destination,
    goodsDescription: adaptedForm.basics.goodsDescription
  });
  
  console.log('✅ [TEST] Informations client:', {
    companyName: adaptedForm.basics.client.companyName,
    contactFullName: adaptedForm.basics.client.contactFullName,
    email: adaptedForm.basics.client.email,
    phone: adaptedForm.basics.client.phone
  });
  
  console.log('✅ [TEST] Informations assigné:', {
    assigneeDisplayName: adaptedForm.basics.assignee.assigneeDisplayName,
    assigneeId: adaptedForm.basics.assignee.assigneeId
  });
  
  console.log('✅ [TEST] Option en cours:', {
    seafreightsCount: adaptedForm.currentOption.seafreights.length,
    haulagesCount: adaptedForm.currentOption.haulages.length,
    servicesCount: adaptedForm.currentOption.services.length
  });
  
  console.log('✅ [TEST] Options existantes:', {
    count: adaptedForm.existingOptions.length
  });
  
  // 5. Vérifier les détails des seafreights, haulages et services
  console.log('\n📋 [TEST] === DÉTAILS DES OPTIONS ===');
  console.log('✅ [TEST] Seafreights:', adaptedForm.currentOption.seafreights);
  console.log('✅ [TEST] Haulages:', adaptedForm.currentOption.haulages);
  console.log('✅ [TEST] Services:', adaptedForm.currentOption.services);
  
} catch (error) {
  console.error('❌ [TEST] Erreur lors du test:', error);
}

console.log('\n🎉 [TEST] === TEST TERMINÉ ===');
