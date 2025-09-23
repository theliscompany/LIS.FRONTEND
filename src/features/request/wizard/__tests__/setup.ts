import React from 'react';
import { beforeAll, afterAll, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock uuid
vi.mock('uuid', () => ({
  v4: vi.fn(() => 'mock-uuid-123')
}));

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(() => vi.fn()),
  useLocation: vi.fn(() => ({ pathname: '/test', state: null })),
  useParams: vi.fn(() => ({})),
  useSearchParams: vi.fn(() => [new URLSearchParams(), vi.fn()])
}));

// Mock notistack
vi.mock('notistack', () => ({
  useSnackbar: vi.fn(() => ({
    enqueueSnackbar: vi.fn()
  }))
}));

// Mock @mui/x-date-pickers
vi.mock('@mui/x-date-pickers/DatePicker', () => ({
  DatePicker: vi.fn(({ value, onChange, ...props }: any) => 
    React.createElement('input', {
      type: 'date',
      value: value ? value.toISOString().split('T')[0] : '',
      onChange: (e: any) => onChange && onChange(new Date(e.target.value)),
      ...props
    })
  )
}));

vi.mock('@mui/x-date-pickers/LocalizationProvider', () => ({
  LocalizationProvider: vi.fn(({ children }: any) => children)
}));

vi.mock('@mui/x-date-pickers/AdapterDateFns', () => ({
  AdapterDateFns: vi.fn()
}));

beforeAll(() => {
  // Setup any global test configuration
});

afterEach(() => {
  cleanup();
});

afterAll(() => {
  // Cleanup any global test resources
});
