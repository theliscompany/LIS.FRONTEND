// === TEST DE COMPATIBILITÉ SDK - DraftQuote vs OptimizedCreateWizardDraftRequest ===

import { DraftQuote } from './DraftQuote';

// === PAYLOAD SDK COMPLET (exemple fourni par l'utilisateur) ===
const sdkPayloadExample = {
  // === IDENTIFIANT DE LA DEMANDE ===
  requestQuoteId: "REQ-2024-001",
  
  // === UTILISATEUR ===
  emailUser: "user@company.com",
  
  // === CLIENT ===
  clientNumber: "CLI-001",
  
  // === COMMENTAIRE OPTIONNEL ===
  comment: "Devis pour transport maritime vers l'Asie",
  
  // === DONNÉES STRUCTURÉES DU WIZARD ===
  draftData: {
    // === INFORMATIONS DU WIZARD ===
    wizard: {
      currentStep: 4,
      completedSteps: [1, 2, 3],
      status: "draft",
      lastModified: new Date("2024-01-15T10:30:00Z"),
      version: "1.0"
    },
    
    // === ÉTAPES DU WIZARD ===
    steps: {
      // === ÉTAPE 1: INFORMATIONS CLIENT ET ROUTE ===
      step1: {
        customer: {
          contactId: 123,
          contactName: "Jean Dupont",
          companyName: "Entreprise ABC",
          email: "jean.dupont@abc.com"
        },
        route: {
          origin: {
            city: { name: "Paris", country: "France" },
            port: { portId: 1, portName: "Port de Le Havre", country: "France" }
          },
          destination: {
            city: { name: "Shanghai", country: "Chine" },
            port: { portId: 2, portName: "Port de Shanghai", country: "Chine" }
          }
        },
        cargo: {
          product: { productId: 456, productName: "Équipements industriels" },
          incoterm: "FOB"
        },
        metadata: {
          comment: "Transport urgent pour projet industriel"
        }
      },
      
      // === ÉTAPE 2: SERVICES SÉLECTIONNÉS ===
      step2: {
        selectedServices: [
          {
            serviceId: 1,
            serviceName: "Transport routier",
            category: "logistics",
            usagePercent: 100
          },
          {
            serviceId: 2,
            serviceName: "Fret maritime",
            category: "shipping",
            usagePercent: 100
          }
        ]
      },
      
      // === ÉTAPE 3: CONTENEURS ===
      step3: {
        containers: [
          {
            id: "cont-001",
            type: "40HC",
            quantity: 2,
            teu: 4
          },
          {
            id: "cont-002",
            type: "20GP",
            quantity: 1,
            teu: 1
          }
        ],
        summary: {
          totalContainers: 3,
          totalTEU: 5,
          containerTypes: ["40HC", "20GP"]
        },
        route: {
          origin: {
            city: { name: "Paris", country: "France" },
            port: { portId: 1, portName: "Port de Le Havre", country: "France" }
          },
          destination: {
            city: { name: "Shanghai", country: "Chine" },
            port: { portId: 2, portName: "Port de Shanghai", country: "Chine" }
          }
        }
      },
      
      // === ÉTAPE 4: SÉLECTION TRANSPORT ROUTIER ===
      step4: {
        selection: {
          offerId: "haul-offer-789",        // ✅ CRITIQUE: offerId pour la persistance
          haulierId: 456,
          haulierName: "Transport Express",
          tariff: {
            unitPrice: 150.00,
            currency: "EUR",
            freeTime: 2
          },
          route: {
            pickup: {
              company: "Entreprise ABC",
              city: "Paris",
              country: "France"
            },
            delivery: {
              portId: 1,
              portName: "Port de Le Havre",
              country: "France"
            }
          },
          validity: {
            validUntil: new Date("2024-02-15T23:59:59Z")
          }
        },
        calculation: {
          quantity: 3,
          unitPrice: 150.00,
          subtotal: 450.00,
          currency: "EUR"
        }
      },
      
      // === ÉTAPE 5: SÉLECTION FRET MARITIME ===
      step5: {
        selections: [
          {
            id: "sea-001",
            seafreightId: "sea-offer-123",
            quoteNumber: "Q-2024-001",           // ✅ AJOUTÉ
            carrier: {
              name: "Maersk Line",
              agentName: "Maersk France"
            },
            route: {                              // ✅ AJOUTÉ
              departurePort: { portId: 1, portName: "Port de Le Havre", country: "France" },
              destinationPort: { portId: 2, portName: "Port de Shanghai", country: "Chine" },
              transitDays: 25,
              frequency: "Weekly"
            },
            container: {                          // ✅ AJOUTÉ
              containerType: "40HC",
              isReefer: false,
              quantity: 2,
              volumeM3: 67.7,
              weightKg: 22000,
              unitPrice: 800.00,
              subtotal: 1600.00
            },
            charges: {                            // ✅ AJOUTÉ
              basePrice: 800.00,
              currency: "EUR",
              surcharges: [
                {
                  name: "BAF",
                  value: 150.00,
                  type: "surcharge",
                  description: "Bunker Adjustment Factor",
                  isMandatory: true,
                  currency: "EUR"
                },
                {
                  name: "CAF",
                  value: 75.00,
                  type: "surcharge",
                  description: "Currency Adjustment Factor",
                  isMandatory: true,
                  currency: "EUR"
                }
              ],
              totalPrice: 1025.00
            },
            service: {                            // ✅ AJOUTÉ
              deliveryTerms: "FOB",
              createdBy: "user@company.com",
              createdDate: new Date("2024-01-15T10:30:00Z")
            },
            validity: {                           // ✅ AJOUTÉ
              startDate: new Date("2024-01-15T00:00:00Z"),
              endDate: new Date("2024-02-15T23:59:59Z")
            },
            remarks: "Service premium avec transit rapide",  // ✅ AJOUTÉ
            isSelected: true,                     // ✅ AJOUTÉ
            selectedAt: new Date("2024-01-15T10:30:00Z")    // ✅ AJOUTÉ
          }
        ],
        summary: {
          totalSelections: 1,
          totalContainers: 2,
          totalAmount: 1025.00,
          currency: "EUR",
          selectedCarriers: ["Maersk Line"],      // ✅ AJOUTÉ
          containerTypes: ["40HC"],               // ✅ AJOUTÉ
          preferredSelectionId: "sea-001"         // ✅ AJOUTÉ
        }
      },
      
      // === ÉTAPE 6: SERVICES DIVERS ===
      step6: {
        selections: [
          {
            id: "misc-001",
            service: {
              serviceId: 3,
              serviceName: "Assurance transport",
              category: "insurance"
            },
            supplier: {
              supplierName: "AssureTrans"
            },
            pricing: {
              unitPrice: 50.00,
              quantity: 1,
              subtotal: 50.00,
              currency: "EUR"
            },
            validity: {
              validUntil: new Date("2024-02-15T23:59:59Z")
            },
            remarks: "Assurance complète",        // ✅ AJOUTÉ
            isSelected: true,                     // ✅ AJOUTÉ
            selectedAt: new Date("2024-01-15T10:30:00Z")    // ✅ AJOUTÉ
          }
        ],
        summary: {
          totalSelections: 1,
          totalAmount: 50.00,
          currency: "EUR",
          categories: ["insurance"]
        }
      },
      
      // === ÉTAPE 7: FINALISATION ===
      step7: {
        finalization: {
          optionName: "Option Premium",
          optionDescription: "Transport express avec assurance",
          marginPercentage: 15.0,
          marginAmount: 228.75,
          marginType: "percentage",
          isReadyToGenerate: true,
          generatedAt: new Date("2024-01-15T10:30:00Z")
        },
        validation: {
          allStepsValid: true,
          errors: [],
          warnings: []
        },
        pricingSummary: {
          baseTotal: 1525.00,
          marginAmount: 228.75,
          finalTotal: 1753.75,
          currency: "EUR",
          breakdown: {
            haulageAmount: 450.00,
            seafreightAmount: 1025.00,
            miscellaneousAmount: 50.00,
            totalBeforeMargin: 1525.00,
            components: [
              {
                name: "Transport routier",
                category: "haulage",
                amount: 450.00,
                currency: "EUR",
                description: "Paris → Le Havre"
              },
              {
                name: "Fret maritime",
                category: "seafreight",
                amount: 1025.00,
                currency: "EUR",
                description: "Le Havre → Shanghai"
              },
              {
                name: "Assurance transport",
                category: "insurance",
                amount: 50.00,
                currency: "EUR",
                description: "Couverture complète"
              }
            ]
          }
        }
      }
    },
    
    // === TOTAUX ===
    totals: {
      haulage: 450.00,
      seafreight: 1025.00,
      miscellaneous: 50.00,
      subtotal: 1525.00,
      grandTotal: 1753.75,
      currency: "EUR",
      totalTEU: 5
    }
  }
};

// === TEST DE COMPATIBILITÉ ===
export const testSDKCompatibility = (): boolean => {
  try {
    // ✅ TEST 1: Vérifier que le payload SDK peut être assigné à DraftQuote
    const draftQuote: DraftQuote = {
      id: sdkPayloadExample.requestQuoteId,
      requestQuoteId: sdkPayloadExample.requestQuoteId,
      emailUser: sdkPayloadExample.emailUser,
      clientNumber: sdkPayloadExample.clientNumber,
      comment: sdkPayloadExample.comment,
      draftData: sdkPayloadExample.draftData
    };
    
    // ✅ TEST 2: Vérifier que tous les champs critiques sont présents
    const hasOfferId = draftQuote.draftData?.steps?.step4?.selection?.offerId !== undefined;
    const hasQuoteNumber = draftQuote.draftData?.steps?.step5?.selections?.[0]?.quoteNumber !== undefined;
    const hasRoute = draftQuote.draftData?.steps?.step5?.selections?.[0]?.route !== undefined;
    const hasContainer = draftQuote.draftData?.steps?.step5?.selections?.[0]?.container !== undefined;
    const hasCharges = draftQuote.draftData?.steps?.step5?.selections?.[0]?.charges !== undefined;
    const hasService = draftQuote.draftData?.steps?.step5?.selections?.[0]?.service !== undefined;
    const hasValidity = draftQuote.draftData?.steps?.step5?.selections?.[0]?.validity !== undefined;
    const hasRemarks = draftQuote.draftData?.steps?.step5?.selections?.[0]?.remarks !== undefined;
    const hasIsSelected = draftQuote.draftData?.steps?.step5?.selections?.[0]?.isSelected !== undefined;
    const hasSelectedAt = draftQuote.draftData?.steps?.step5?.selections?.[0]?.selectedAt !== undefined;
    
    // ✅ TEST 3: Vérifier les champs de summary
    const hasSelectedCarriers = draftQuote.draftData?.steps?.step5?.summary?.selectedCarriers !== undefined;
    const hasContainerTypes = draftQuote.draftData?.steps?.step5?.summary?.containerTypes !== undefined;
    const hasPreferredSelectionId = draftQuote.draftData?.steps?.step5?.summary?.preferredSelectionId !== undefined;
    
    // ✅ TEST 4: Vérifier les champs step6
    const hasStep6Remarks = draftQuote.draftData?.steps?.step6?.selections?.[0]?.remarks !== undefined;
    const hasStep6IsSelected = draftQuote.draftData?.steps?.step6?.selections?.[0]?.isSelected !== undefined;
    const hasStep6SelectedAt = draftQuote.draftData?.steps?.step6?.selections?.[0]?.selectedAt !== undefined;
    
    console.log('🧪 TEST DE COMPATIBILITÉ SDK:');
    console.log('✅ offerId présent:', hasOfferId);
    console.log('✅ quoteNumber présent:', hasQuoteNumber);
    console.log('✅ route présent:', hasRoute);
    console.log('✅ container présent:', hasContainer);
    console.log('✅ charges présent:', hasCharges);
    console.log('✅ service présent:', hasService);
    console.log('✅ validity présent:', hasValidity);
    console.log('✅ remarks présent:', hasRemarks);
    console.log('✅ isSelected présent:', hasIsSelected);
    console.log('✅ selectedAt présent:', hasSelectedAt);
    console.log('✅ selectedCarriers présent:', hasSelectedCarriers);
    console.log('✅ containerTypes présent:', hasContainerTypes);
    console.log('✅ preferredSelectionId présent:', hasPreferredSelectionId);
    console.log('✅ step6 remarks présent:', hasStep6Remarks);
    console.log('✅ step6 isSelected présent:', hasStep6IsSelected);
    console.log('✅ step6 selectedAt présent:', hasStep6SelectedAt);
    
    // ✅ TEST 5: Vérifier que l'objet est valide
    const isValid = draftQuote && 
                   draftQuote.draftData && 
                   draftQuote.draftData.steps &&
                   hasOfferId && 
                   hasQuoteNumber && 
                   hasRoute && 
                   hasContainer && 
                   hasCharges && 
                   hasService && 
                   hasValidity && 
                   hasRemarks && 
                   hasIsSelected && 
                   hasSelectedAt &&
                   hasSelectedCarriers &&
                   hasContainerTypes &&
                   hasPreferredSelectionId &&
                   hasStep6Remarks &&
                   hasStep6IsSelected &&
                   hasStep6SelectedAt;
    
    if (isValid) {
      console.log('🎉 COMPATIBILITÉ SDK: 100% ✅');
      return true;
    } else {
      console.log('❌ COMPATIBILITÉ SDK: INCOMPLÈTE');
      return false;
    }
    
  } catch (error) {
    console.error('❌ ERREUR DE COMPATIBILITÉ SDK:', error);
    return false;
  }
};

// === EXPORT DU PAYLOAD D'EXEMPLE ===
export { sdkPayloadExample };
