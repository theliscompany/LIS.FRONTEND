// Script de correction pour step1.customer
// Remplacer les 3 occurrences de customer manquant companyName et email

// Occurrence 1 (ligne ~1365)
// AVANT:
customer: request.customerId ? { contactId: request.customerId, contactName: request.companyName } : undefined,

// APRÈS:
customer: request.customerId ? { 
  contactId: request.customerId, 
  contactName: request.companyName, 
  companyName: request.companyName || '', 
  email: '' 
} : undefined,

// Occurrence 2 (ligne ~1497)
// AVANT:
customer: request.customerId ? { contactId: request.customerId, contactName: request.companyName } : undefined,

// APRÈS:
customer: request.customerId ? { 
  contactId: request.customerId, 
  contactName: request.companyName, 
  companyName: request.companyName || '', 
  email: '' 
} : undefined,

// Occurrence 3 (ligne ~3117)
// AVANT:
customer: request.customerId ? { contactId: request.customerId, contactName: request.companyName } : undefined,

// APRÈS:
customer: request.customerId ? { 
  contactId: request.customerId, 
  contactId: request.customerId, 
  contactName: request.companyName, 
  companyName: request.companyName || '', 
  email: '' 
} : undefined,

