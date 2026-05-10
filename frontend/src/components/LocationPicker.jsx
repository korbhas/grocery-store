import { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { MapPin, Locate, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TEZPUR_CENTER = { lat: 26.6338, lng: 92.7926 };
const ALLOWED_PINCODE = '784028';
const MAP_CONTAINER_STYLE = { width: '100%', height: '300px' };
const MAP_OPTIONS = { disableDefaultUI: true, zoomControl: true, clickableIcons: false };

function extractPincode(results) {
  for (const result of results) {
    const comp = result.address_components?.find((c) => c.types.includes('postal_code'));
    if (comp) return comp.long_name.replace(/\s/g, '');
  }
  return '';
}

export default function LocationPicker({ onLocationChange, onValidChange }) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const [markerPos, setMarkerPos] = useState(TEZPUR_CENTER);
  const [geocoding, setGeocoding] = useState(false);
  const [locating, setLocating] = useState(false);
  const [pincode, setPincode] = useState('');
  const [error, setError] = useState('');
  const mapRef = useRef(null);

  const handleGeocode = useCallback((lat, lng) => {
    setGeocoding(true);
    setError('');
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      setGeocoding(false);
      if (status !== 'OK' || !results?.length) {
        setError('Could not detect address. Please try again.');
        onValidChange(false);
        return;
      }
      const pc = extractPincode(results);
      const address = results[0].formatted_address;
      setPincode(pc);
      const valid = pc === ALLOWED_PINCODE;
      if (!valid) {
        setError(`We can't deliver to your location, we are sorry.\nWe currently only deliver to pincode ${ALLOWED_PINCODE} (Tezpur, Assam).`);
      }
      onLocationChange({ address, pincode: pc, lat, lng });
      onValidChange(valid);
    });
  }, [onLocationChange, onValidChange]);

  useEffect(() => {
    if (isLoaded) handleGeocode(TEZPUR_CENTER.lat, TEZPUR_CENTER.lng);
  }, [isLoaded, handleGeocode]);

  const handleMarkerDragEnd = useCallback((e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setMarkerPos({ lat, lng });
    handleGeocode(lat, lng);
  }, [handleGeocode]);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const pos = { lat: coords.latitude, lng: coords.longitude };
        setMarkerPos(pos);
        mapRef.current?.panTo(pos);
        mapRef.current?.setZoom(16);
        handleGeocode(coords.latitude, coords.longitude);
        setLocating(false);
      },
      () => {
        setError('Could not get your location. Please pin your address manually.');
        setLocating(false);
      },
      { timeout: 10000 }
    );
  };

  if (loadError) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
        Failed to load Google Maps. Check your API key.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex h-[300px] items-center justify-center rounded-xl border border-border bg-muted">
        <Loader2 size={24} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Drag the pin to your delivery location</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleUseMyLocation}
          disabled={locating || geocoding}
          className="gap-1.5"
        >
          {locating ? <Loader2 size={14} className="animate-spin" /> : <Locate size={14} />}
          Use my location
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <GoogleMap
          mapContainerStyle={MAP_CONTAINER_STYLE}
          center={markerPos}
          zoom={14}
          options={MAP_OPTIONS}
          onLoad={(map) => { mapRef.current = map; }}
        >
          <Marker
            position={markerPos}
            draggable
            onDragEnd={handleMarkerDragEnd}
          />
        </GoogleMap>
      </div>

      {geocoding && (
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Loader2 size={14} className="animate-spin" /> Detecting address...
        </p>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3">
          <p className="font-semibold text-destructive text-sm">{error.split('\n')[0]}</p>
          {error.split('\n')[1] && (
            <p className="mt-0.5 text-xs text-destructive/80">{error.split('\n')[1]}</p>
          )}
        </div>
      )}

      {!error && pincode === ALLOWED_PINCODE && (
        <p className="flex items-center gap-1.5 text-sm text-green-600">
          <MapPin size={14} />
          Delivery available to this location (Pincode {ALLOWED_PINCODE})
        </p>
      )}
    </div>
  );
}
