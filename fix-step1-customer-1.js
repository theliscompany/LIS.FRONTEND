// CORRECTION ÉTAPE 1 : Première occurrence de step1.customer (ligne ~1365)
// Dans RequestWizard.tsx, rechercher et remplacer :

// AVANT (ligne ~1365):
customer: request.customerId ? { contactId: request.customerId, contactName: request.companyName } : undefined,

// APRÈS:
customer: request.customerId ? { 
  contactId: request.customerId, 
  contactName: request.companyName, 
  companyName: request.companyName || '', 
  email: '' 
} : undefined,

// CONTEXTE COMPLET À RECHERCHER:
// step1: {
//   ...prevState.step1,
//   customer: request.customerId ? { contactId: request.customerId, contactName: request.companyName } : undefined,
//   cityFrom: request.pickupLocation?.city ? { 
//     cityName: request.pickupLocation.city, 
//     name: request.pickupLocation.city,
//     country: request.pickupLocation.country || ''
//   } : undefined,

// REMPLACER PAR:
// step1: {
//   ...prevState.step1,
//   customer: request.customerId ? { 
//     contactId: request.customerId, 
//     contactName: request.companyName, 
//     companyName: request.companyName || '', 
//     email: '' 
//   } : undefined,
//   cityFrom: request.pickupLocation?.city ? { 
//     name: request.pickupLocation.city,
//     country: request.pickupLocation.country || ''
//   } : undefined,






