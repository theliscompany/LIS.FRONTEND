# Migration Guide: Request Wizard v1 → v2

This guide helps you migrate from the old Request Wizard to the new schema-driven wizard.

## 🎯 What Changed

### Architecture
- **Before**: Complex multi-step wizard with 6+ steps
- **After**: Simplified 3-step flow (Basics → Options → Review)

### State Management
- **Before**: Multiple hooks and context providers
- **After**: Single `WizardEngine` with react-hook-form + Zod

### Validation
- **Before**: Custom validation logic scattered across components
- **After**: Central Zod schema with consistent validation

### Auto-save
- **Before**: Manual save buttons and complex state management
- **After**: Automatic debounced save (800ms) with resume tokens

## 🔄 Breaking Changes

### Component Imports
```typescript
// ❌ Old
import RequestWizard from '@features/request/pages/RequestWizard';

// ✅ New
import { NewRequestWizard } from '@features/request/wizard/NewRequestWizard';
```

### Props Interface
```typescript
// ❌ Old
interface RequestWizardProps {
  initialData?: any;
  onSave?: (data: any) => void;
  onCancel?: () => void;
}

// ✅ New
interface WizardEngineProps {
  defaultValues?: Partial<DraftQuoteForm>;
  onAutoSave?: (formData: DraftQuoteForm) => void | Promise<void>;
  onSubmit?: (payload: any) => void | Promise<void>;
  initialStep?: string;
  onStepChange?: (step: string) => void;
}
```

### Form Data Structure
```typescript
// ❌ Old
interface OldFormData {
  step1: any;
  step2: any;
  step3: any;
  // ... many steps
}

// ✅ New
interface DraftQuoteForm {
  basics: {
    cargoType: 'FCL' | 'LCL' | 'AIR';
    incoterm: string;
    origin: { city: string; country: string };
    destination: { city: string; country: string };
    requestedDeparture?: string;
    goodsDescription: string;
  };
  options: {
    seafreights: SeafreightOption[];
    haulages: HaulageOption[];
    services: ServiceOption[];
  };
  attachments: Attachment[];
}
```

## 🚀 Migration Steps

### 1. Update Imports
```typescript
// Update your imports
import { NewRequestWizard } from '@features/request/wizard/NewRequestWizard';
import { ExpressWizard } from '@features/request/wizard/ExpressWizard';
```

### 2. Update Routing
```typescript
// Update your routes
<Route path="request-wizard" element={<NewRequestWizard />} />
<Route path="request-wizard/:id" element={<NewRequestWizard />} />
<Route path="request-express" element={<ExpressWizard />} />
```

### 3. Update API Integration
```typescript
// Old API calls
const saveDraft = async (data: any) => {
  await api.saveDraft(data);
};

// New API integration
const handleAutoSave = async (formData: DraftQuoteForm) => {
  const payload = toDraftQuotePayload(formData, resumeToken);
  await api.saveDraft(payload);
};
```

### 4. Update Form Validation
```typescript
// Old validation
const validateStep = (step: number, data: any) => {
  // Custom validation logic
};

// New validation
import { DraftQuoteFormSchema } from '@features/request/wizard/schema';

const validateForm = (data: any) => {
  return DraftQuoteFormSchema.safeParse(data);
};
```

## 🔧 Configuration

### Customizing Steps
```typescript
// Edit wizard.config.ts
export const wizardSteps = [
  { 
    id: "basics", 
    label: "Basic Information", 
    fields: ["basics.*"] 
  },
  // Add custom steps here
];
```

### Customizing Validation
```typescript
// Edit schema.ts
export const DraftQuoteFormSchema = z.object({
  basics: z.object({
    // Add custom validation rules
    customField: z.string().min(1, 'Custom field is required'),
  }),
  // ... rest of schema
});
```

### Customizing Auto-save
```typescript
// In WizardEngine
const debouncedAutoSave = useDebounce(async (data: DraftQuoteForm) => {
  // Custom auto-save logic
  await customAutoSave(data);
}, 800); // Adjust debounce delay
```

## 🧪 Testing

### Update Test Imports
```typescript
// Old tests
import { render, screen } from '@testing-library/react';
import RequestWizard from '@features/request/pages/RequestWizard';

// New tests
import { render, screen } from '@testing-library/react';
import { NewRequestWizard } from '@features/request/wizard/NewRequestWizard';
```

### Update Test Data
```typescript
// Old test data
const mockFormData = {
  step1: { /* ... */ },
  step2: { /* ... */ },
  // ... many steps
};

// New test data
const mockFormData = {
  basics: {
    cargoType: 'FCL',
    incoterm: 'FOB',
    origin: { city: 'Hamburg', country: 'DE' },
    destination: { city: 'New York', country: 'US' },
    goodsDescription: 'Test goods'
  },
  options: {
    seafreights: [],
    haulages: [],
    services: []
  },
  attachments: []
};
```

## 🐛 Common Issues

### 1. Form Not Saving
**Problem**: Auto-save not working
**Solution**: Ensure `onAutoSave` prop is provided to `WizardEngine`

### 2. Validation Errors
**Problem**: Form validation failing
**Solution**: Check that all required fields are filled according to the Zod schema

### 3. Navigation Issues
**Problem**: Can't navigate between steps
**Solution**: Verify step configuration in `wizard.config.ts`

### 4. API Payload Mismatch
**Problem**: Backend receiving unexpected data format
**Solution**: Use `toDraftQuotePayload()` to convert form data to API format

## 📚 Additional Resources

- [Wizard README](./README.md) - Complete documentation
- [Schema Reference](./schema.ts) - Form validation schema
- [API Adapter](./toDraftQuote.ts) - Backend integration
- [Test Examples](./__tests__/) - Unit test examples

## 🆘 Support

If you encounter issues during migration:

1. Check the [troubleshooting section](./README.md#troubleshooting)
2. Review the [test examples](./__tests__/)
3. Verify your configuration matches the examples
4. Check the browser console for error messages

## 🔄 Rollback Plan

If you need to rollback to the old wizard:

1. Revert the routing changes in `App.tsx`
2. Restore the old `RequestWizard` component
3. Update imports back to the old components
4. The old wizard should work as before

**Note**: The old wizard files have been removed, so you'll need to restore them from version control if rolling back.
