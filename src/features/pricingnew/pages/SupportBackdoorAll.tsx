import React, { useState } from 'react';
import { 
  MiscellaneousCreateRequest,
  MiscellaneousResponse,
  MiscellaneousSearchRequest
} from '../api/types.gen';
import { postApiMiscellaneous, postApiMiscellaneousSearch } from '../api/sdk.gen';
import { client as pricingnewClient } from '../api';
import { showSnackbar } from '../../../components/common/Snackbar';

// Constantes pour les types de service
const SERVICE_TYPES = {
  WAREHOUSING: 'Warehousing',
  CUSTOMS_CLEARANCE: 'CustomsClearance',
  INSURANCE: 'Insurance',
  PORT_HANDLING: 'PortHandling',
  PACKAGING: 'Packaging',
  LOADING: 'Loading',
  UNLOADING: 'Unloading',
  INSPECTION: 'Inspection',
  DOCUMENTATION: 'Documentation',
  OTHER: 'Other'
} as const;

// Constantes pour les types de pricing
const PRICING_TYPES = {
  FIXED_PRICE: 'FixedPrice',
  PER_UNIT: 'PerUnit',
  PER_DAY: 'PerDay',
  PERCENTAGE: 'Percentage',
  ON_REQUEST: 'OnRequest'
} as const;

// Constantes pour les types de containers
const CONTAINER_TYPES = {
  DRY_CONTAINER20: 'DryContainer20',
  DRY_CONTAINER40: 'DryContainer40',
  DRY_CONTAINER40HC: 'DryContainer40HC',
  REEFER_CONTAINER20: 'ReeferContainer20',
  REEFER_CONTAINER40: 'ReeferContainer40',
  OPEN_TOP20: 'OpenTop20',
  OPEN_TOP40: 'OpenTop40',
  FLAT_RACK20: 'FlatRack20',
  FLAT_RACK40: 'FlatRack40',
  TANK20: 'Tank20',
  TANK40: 'Tank40',
  BULK_CONTAINER: 'BulkContainer',
  SPECIAL_EQUIPMENT: 'SpecialEquipment'
} as const;

const SupportBackdoorAll: React.FC = () => {
  const [createPayload, setCreatePayload] = useState<MiscellaneousCreateRequest>({
    serviceProviderId: 1,
    serviceProviderName: 'Test Provider',
    serviceType: SERVICE_TYPES.WAREHOUSING as string,
    serviceName: 'Test Service',
    serviceDescription: 'Test Description',
    departurePortId: 1,
    departurePortName: 'Test Port',
    destinationPortId: 2,
    destinationPortName: 'Test Destination Port',
    locationCity: 'Test City',
    locationCountry: 'Test Country',
    applicableContainerTypes: [CONTAINER_TYPES.DRY_CONTAINER20, CONTAINER_TYPES.DRY_CONTAINER40],
    serviceDurationHours: 24,
    serviceDurationDescription: '24 hours',
    pricing: {
      pricingType: PRICING_TYPES.FIXED_PRICE as string,
      basePrice: 100,
      minimumCharge: 50,
      maximumCharge: 200,
      unitOfMeasure: 'Per Container',
      minimumQuantity: 1,
      maximumQuantity: 10
    },
    currency: 'EUR',
    specialConditions: [{
      conditionType: 'Custom',
      description: 'Test condition',
      isRequired: false
    }],
    comment: 'Test comment',
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    createdBy: 'Test User'
  });

  const [searchPayload, setSearchPayload] = useState<MiscellaneousSearchRequest>({
    serviceType: SERVICE_TYPES.WAREHOUSING as string,
    serviceProviderId: 1,
    departurePortId: 1,
         applicableContainerTypes: [CONTAINER_TYPES.DRY_CONTAINER20],
    locationCity: 'Test City',
    currency: 'EUR',
    minBasePrice: 50,
    maxBasePrice: 200,
    isActive: true
  });

  const [createResult, setCreateResult] = useState<string>('');
  const [searchResult, setSearchResult] = useState<MiscellaneousResponse[]>([]);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    try {
      setLoading(true);
      console.log('Creating miscellaneous with payload:', createPayload);
      const result = await postApiMiscellaneous({ client: pricingnewClient, body: createPayload });
      setCreateResult(`Created with ID: ${result.data}`);
      showSnackbar('Miscellaneous created successfully', 'success');
    } catch (error) {
      console.error('Error creating miscellaneous:', error);
      setCreateResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      showSnackbar('Error creating miscellaneous', 'warning');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      console.log('Searching miscellaneous with payload:', searchPayload);
      const result = await postApiMiscellaneousSearch({ client: pricingnewClient, body: searchPayload });
      setSearchResult(result.data || []);
      showSnackbar(`Found ${result.data?.length || 0} results`, 'success');
    } catch (error) {
      console.error('Error searching miscellaneous:', error);
      setSearchResult([]);
      showSnackbar('Error searching miscellaneous', 'warning');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Support Backdoor - Miscellaneous API Testing</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Create Section */}
        <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
          <h2>Create Miscellaneous</h2>
          <button 
            onClick={handleCreate} 
            disabled={loading}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#007bff', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Creating...' : 'Create'}
          </button>
          
          <div style={{ marginTop: '20px' }}>
            <h3>Payload:</h3>
            <pre style={{ 
              backgroundColor: '#f8f9fa', 
              padding: '10px', 
              borderRadius: '4px',
              overflow: 'auto',
              maxHeight: '300px'
            }}>
              {JSON.stringify(createPayload, null, 2)}
            </pre>
          </div>
          
          {createResult && (
            <div style={{ marginTop: '20px' }}>
              <h3>Result:</h3>
              <pre style={{ 
                backgroundColor: '#e9ecef', 
                padding: '10px', 
                borderRadius: '4px',
                overflow: 'auto'
              }}>
                {createResult}
              </pre>
            </div>
          )}
        </div>

        {/* Search Section */}
        <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
          <h2>Search Miscellaneous</h2>
          <button 
            onClick={handleSearch} 
            disabled={loading}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#28a745', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
          
          <div style={{ marginTop: '20px' }}>
            <h3>Payload:</h3>
            <pre style={{ 
              backgroundColor: '#f8f9fa', 
              padding: '10px', 
              borderRadius: '4px',
              overflow: 'auto',
              maxHeight: '300px'
            }}>
              {JSON.stringify(searchPayload, null, 2)}
            </pre>
          </div>
          
          {searchResult.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <h3>Results ({searchResult.length}):</h3>
              <pre style={{ 
                backgroundColor: '#e9ecef', 
                padding: '10px', 
                borderRadius: '4px',
                overflow: 'auto',
                maxHeight: '300px'
              }}>
                {JSON.stringify(searchResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupportBackdoorAll; 