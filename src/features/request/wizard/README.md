# Request Wizard v2.0

A refactored, schema-driven wizard for creating quote requests with autosave and live preview.

## 🎯 Features

- **3-Step Flow**: Basics → Options → Review & Send
- **Schema-Driven**: Central Zod schema for validation and types
- **Auto-save**: Debounced auto-save (800ms) with resume token
- **Live Preview**: Real-time side panel showing form summary
- **Error Handling**: Flat error panel with "jump to field" anchors
- **Express Mode**: Quick 5-question flow for basic quotes
- **Port Management**: Full support for departure and arrival ports with UN/LOCODE

## 📁 Structure

```
wizard/
├── schema.ts                 # Zod schema and types
├── wizard.config.ts          # Step configuration
├── WizardEngine.tsx          # Main form provider and orchestration
├── StepRouter.tsx            # Step navigation and rendering
├── LivePreview.tsx           # Side panel preview
├── toDraftQuote.ts           # API payload adapter
├── NewRequestWizard.tsx      # Main wizard wrapper
├── ExpressWizard.tsx         # Express mode wrapper
└── pages/
    ├── BasicsStep.tsx        # Step 1: Basic information
    ├── OptionsStep.tsx       # Step 2: Seafreight/Haulage/Services
    ├── ReviewStep.tsx        # Step 3: Review and submit
    └── ExpressStep.tsx       # Express mode (5 questions)
```

## 🚀 Usage

### Basic Wizard

```tsx
import { NewRequestWizard } from '@features/request/wizard/NewRequestWizard';

// In your routing
<Route path="request-wizard" element={<NewRequestWizard />} />
<Route path="request-wizard/:id" element={<NewRequestWizard />} />
```

### Express Mode

```tsx
import { ExpressWizard } from '@features/request/wizard/ExpressWizard';

// In your routing
<Route path="request-express" element={<ExpressWizard />} />
```

### Custom Integration

```tsx
import { WizardEngine } from '@features/request/wizard/WizardEngine';

<WizardEngine
  defaultValues={formData}
  onAutoSave={handleAutoSave}
  onSubmit={handleSubmit}
  initialStep="basics"
  onStepChange={handleStepChange}
/>
```

## 🔧 Configuration

### Schema

The central schema defines the form structure:

```typescript
export const DraftQuoteFormSchema = z.object({
  basics: z.object({
    cargoType: z.enum(["FCL", "LCL", "AIR"]),
    incoterm: z.string().min(3),
    origin: z.object({ city: z.string().min(2), country: z.string().min(2) }),
    destination: z.object({ city: z.string().min(2), country: z.string().min(2) }),
    portFrom: z.object({
      portId: z.number().optional(),
      portName: z.string().nullable().optional(),
      unlocode: z.string().nullable().optional(),
      country: z.string().nullable().optional(),
      city: z.string().nullable().optional(),
    }).optional(),
    portTo: z.object({
      portId: z.number().optional(),
      portName: z.string().nullable().optional(),
      unlocode: z.string().nullable().optional(),
      country: z.string().nullable().optional(),
      city: z.string().nullable().optional(),
    }).optional(),
    requestedDeparture: z.string().optional(),
    goodsDescription: z.string().min(2),
  }),
  options: z.object({
    seafreights: z.array(/* ... */).default([]),
    haulages: z.array(/* ... */).default([]),
    services: z.array(/* ... */).default([]),
  }),
  attachments: z.array(/* ... */).default([]),
});
```

### Steps

Configure wizard steps in `wizard.config.ts`:

```typescript
export const wizardSteps = [
  { id: "basics", label: "Basics", fields: ["basics.*"] },
  { id: "options", label: "Options", fields: ["options.*"] },
  { id: "review", label: "Review & Send", fields: ["basics.*", "options.*", "attachments"] },
];
```

## 🚢 Port Management

The wizard now fully supports departure and arrival ports with the following features:

### Port Schema
```typescript
portFrom: z.object({
  portId: z.number().optional(),
  portName: z.string().nullable().optional(),
  unlocode: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
}).optional()
```

### Port Selection
- **PortAutocomplete**: Uses the existing `PortAutocomplete` component
- **UN/LOCODE Support**: Full support for international port codes
- **Auto-completion**: Search by port name, country, or city
- **Validation**: Optional but validated when provided

### API Integration
- **Saving**: Ports are saved to the API in `DraftQuoteShipmentDto.portFrom` and `DraftQuoteShipmentDto.portTo`
- **Loading**: Ports are loaded from the API and mapped to the wizard form
- **Mapping**: Bidirectional mapping between wizard form and API payload

## 🔄 API Integration

The wizard uses the `toDraftQuote.ts` adapter to convert form data to the existing backend payload format:

```typescript
import { toDraftQuotePayload } from './toDraftQuote';

const payload = toDraftQuotePayload(formData, resumeToken);
// Returns payload compatible with existing backend API
```

## 🧪 Testing

### Schema Tests

```typescript
import { DraftQuoteFormSchema } from './schema';

describe('DraftQuoteFormSchema', () => {
  it('validates correct form data', () => {
    const validData = {
      basics: {
        cargoType: 'FCL',
        incoterm: 'FOB',
        origin: { city: 'Hamburg', country: 'Germany' },
        destination: { city: 'New York', country: 'United States' },
        goodsDescription: 'Test goods'
      },
      options: { seafreights: [], haulages: [], services: [] },
      attachments: []
    };
    
    expect(() => DraftQuoteFormSchema.parse(validData)).not.toThrow();
  });
});
```

### Payload Tests

```typescript
import { toDraftQuotePayload } from './toDraftQuote';

describe('toDraftQuotePayload', () => {
  it('converts form data to API payload', () => {
    const formData = { /* ... */ };
    const payload = toDraftQuotePayload(formData, 'resume-token');
    
    expect(payload).toHaveProperty('cargoType');
    expect(payload).toHaveProperty('origin');
    expect(payload).toHaveProperty('destination');
    expect(payload).toHaveProperty('metadata.resumeToken', 'resume-token');
  });
});
```

## 🐛 Troubleshooting

### Common Issues

1. **Auto-save not working**: Check that `onAutoSave` prop is provided
2. **Validation errors**: Ensure all required fields are filled
3. **Navigation issues**: Verify step configuration in `wizard.config.ts`

### Debug Mode

Enable debug mode by adding `?debug=true` to the URL to see:
- Form state
- Validation errors
- API payloads
- Auto-save status

## 🔄 Migration from v1

The new wizard is backward compatible with existing URLs:
- `/request-wizard` → New wizard
- `/request-wizard/:id` → New wizard with draft loading
- `/request-express` → Express mode

## 📝 Development

### Adding New Steps

1. Add step configuration to `wizard.config.ts`
2. Create step component in `pages/`
3. Add step to `StepRouter.tsx`
4. Update validation rules

### Customizing Validation

Modify the Zod schema in `schema.ts` to add custom validation rules.

### Styling

The wizard uses Material-UI components. Customize styles by:
1. Overriding MUI theme
2. Adding custom CSS classes
3. Using the `sx` prop for component-specific styles

## 🚀 Performance

- **Auto-save debounce**: 800ms to prevent excessive API calls
- **Form optimization**: Only re-renders when necessary
- **Lazy loading**: Steps are loaded on demand
- **Memory management**: Proper cleanup of timeouts and listeners

## 🔒 Security

- **Input validation**: All inputs validated with Zod schema
- **XSS protection**: React's built-in XSS protection
- **CSRF protection**: Handled by backend API
- **Data sanitization**: Form data sanitized before API calls
