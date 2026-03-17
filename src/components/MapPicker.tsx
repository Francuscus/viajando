/// <reference types="google.maps" />
import { useEffect, useRef, useState, useCallback } from 'react';
import { LatLng, MissionStop, StartingPlace } from '@/types/mission';

interface MapPickerProps {
  center: LatLng;
  stops: MissionStop[];
  startingPlaces: StartingPlace[];
  onLocationSelect: (pos: LatLng) => void;
  apiKey: string;
}

// Module-level promise so we only load the script once
let mapsLoadPromise: Promise<void> | null = null;

function loadGoogleMaps(apiKey: string): Promise<void> {
  if (mapsLoadPromise) return mapsLoadPromise;

  if (window.google?.maps?.Map) {
    mapsLoadPromise = Promise.resolve();
    return mapsLoadPromise;
  }

  mapsLoadPromise = new Promise<void>((resolve, reject) => {
    const callbackName = '__googleMapsReady';
    (window as Record<string, unknown>)[callbackName] = () => {
      resolve();
      delete (window as Record<string, unknown>)[callbackName];
    };

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=streetview&callback=${callbackName}`;
    script.async = true;
    script.defer = true;
    script.onerror = () => reject(new Error('Failed to load Google Maps'));
    document.head.appendChild(script);
  });

  return mapsLoadPromise;
}

const MapPicker = ({ center, stops, startingPlaces, onLocationSelect, apiKey }: MapPickerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const startMarkersRef = useRef<google.maps.Marker[]>([]);
  const pendingMarkerRef = useRef<google.maps.Marker | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const onLocationSelectRef = useRef(onLocationSelect);
  onLocationSelectRef.current = onLocationSelect;

  useEffect(() => {
    loadGoogleMaps(apiKey)
      .then(() => setLoaded(true))
      .catch((e) => setError(e.message));
  }, [apiKey]);

  const initMap = useCallback(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new window.google.maps.Map(containerRef.current, {
      center,
      zoom: 15,
      mapTypeId: 'roadmap',
      fullscreenControl: false,
      streetViewControl: true,
      mapTypeControl: false,
      zoomControlOptions: {
        position: window.google.maps.ControlPosition.RIGHT_TOP,
      },
    });

    mapRef.current = map;

    // Force layout recalc so tiles load correctly
    window.google.maps.event.trigger(map, 'resize');

    map.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;
      const pos = { lat: e.latLng.lat(), lng: e.latLng.lng() };

      if (pendingMarkerRef.current) pendingMarkerRef.current.setMap(null);
      pendingMarkerRef.current = new window.google.maps.Marker({
        position: pos,
        map,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#f97316',
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 2,
        },
      });

      onLocationSelectRef.current(pos);
    });
  }, []);

  useEffect(() => {
    if (!loaded) return;
    initMap();
  }, [loaded, initMap]);

  // Sync stop markers
  useEffect(() => {
    if (!mapRef.current || !loaded) return;

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = stops.map((stop, i) =>
      new window.google.maps.Marker({
        position: stop.location,
        map: mapRef.current!,
        label: {
          text: String(i + 1),
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '11px',
        },
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: '#7c3aed',
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 2,
        },
        title: stop.questionEs,
      })
    );
  }, [stops, loaded]);

  // Sync starting place markers
  useEffect(() => {
    if (!mapRef.current || !loaded) return;

    startMarkersRef.current.forEach((m) => m.setMap(null));
    startMarkersRef.current = startingPlaces.map((place) =>
      new window.google.maps.Marker({
        position: place.location,
        map: mapRef.current!,
        title: place.nameEs,
        label: {
          text: place.emoji,
          fontSize: '16px',
        },
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 14,
          fillColor: '#10b981',
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 2,
        },
      })
    );
  }, [startingPlaces, loaded]);

  // Re-center when center prop changes
  useEffect(() => {
    if (mapRef.current && loaded) {
      mapRef.current.setCenter(center);
    }
  }, [center.lat, center.lng, loaded]);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted p-4 text-center">
        <p className="text-sm text-destructive font-body">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <p className="text-muted-foreground font-body text-sm">Loading map…</p>
        </div>
      )}
      {loaded && (
        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 text-xs font-body text-gray-600 shadow pointer-events-none">
          Click anywhere to set a stop location
        </div>
      )}
    </div>
  );
};

export default MapPicker;
