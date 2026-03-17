/// <reference types="google.maps" />
import { useEffect, useRef, useState } from 'react';
import { LatLng, MissionStop, StartingPlace } from '@/types/mission';

declare global {
  interface Window {
    google: typeof google;
  }
}

interface MapPickerProps {
  center: LatLng;
  stops: MissionStop[];
  startingPlaces: StartingPlace[];
  onLocationSelect: (pos: LatLng) => void;
  apiKey: string;
}

const MapPicker = ({ center, stops, startingPlaces, onLocationSelect, apiKey }: MapPickerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const startMarkersRef = useRef<google.maps.Marker[]>([]);
  const pendingMarkerRef = useRef<google.maps.Marker | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Load the Google Maps JS API
  useEffect(() => {
    if (window.google?.maps) {
      setLoaded(true);
      return;
    }

    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => setLoaded(true));
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=streetview`;
    script.async = true;
    script.onload = () => setLoaded(true);
    document.head.appendChild(script);
  }, [apiKey]);

  // Init map
  useEffect(() => {
    if (!loaded || !containerRef.current) return;

    const map = new window.google.maps.Map(containerRef.current, {
      center,
      zoom: 15,
      mapTypeId: 'roadmap',
      fullscreenControl: false,
      streetViewControl: false,
      mapTypeControl: false,
    });

    mapRef.current = map;

    map.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;
      const pos = { lat: e.latLng.lat(), lng: e.latLng.lng() };

      // Show a temporary pending marker
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

      onLocationSelect(pos);
    });

    return () => {
      window.google.maps.event.clearInstanceListeners(map);
    };
  }, [loaded]);

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

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <p className="text-muted-foreground font-body text-sm">Loading map…</p>
        </div>
      )}
      {loaded && (
        <div className="absolute bottom-3 left-3 bg-card/90 backdrop-blur-sm rounded-lg px-3 py-2 text-xs font-body text-muted-foreground shadow">
          Click anywhere on the map to set a stop location
        </div>
      )}
    </div>
  );
};

export default MapPicker;
