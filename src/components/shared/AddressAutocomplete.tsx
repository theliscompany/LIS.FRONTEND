import { Autocomplete } from '@react-google-maps/api';
import { useRef } from 'react';
import TextField from '@mui/material/TextField';

interface AddressAutocompleteProps {
  value: string;
  onChange: (val: { address: string; city?: string; postalCode?: string; country?: string; latitude?: number; longitude?: number; placeId?: string }) => void;
  label?: string;
}

export function AddressAutocomplete({ value, onChange, label }: AddressAutocompleteProps) {
  const autocompleteRef = useRef<any>(null);

  const onLoad = (autocomplete: any) => {
    autocompleteRef.current = autocomplete;
  };

  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      const address = place.formatted_address || '';
      let city = '', postalCode = '', country = '';
      let latitude, longitude, placeId;
      place.address_components?.forEach((comp: any) => {
        if (comp.types.includes('locality')) city = comp.long_name;
        if (comp.types.includes('postal_code')) postalCode = comp.long_name;
        if (comp.types.includes('country')) country = comp.long_name;
      });
      if (place.geometry && place.geometry.location) {
        latitude = place.geometry.location.lat();
        longitude = place.geometry.location.lng();
      }
      placeId = place.place_id;
      onChange({ address, city, postalCode, country, latitude, longitude, placeId });
    }
  };

  return (
    <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
      <TextField
        fullWidth
        size="small"
        label={label}
        value={value ?? ''}
        onChange={e => onChange({ address: e.target.value })}
      />
    </Autocomplete>
  );
}
export default AddressAutocomplete; 