/// <reference types="google.maps" />
import { useEffect, useRef, useState } from 'react';
import { LatLng } from '@/types/mission';

declare global {
  interface Window {
    google: typeof google;
  }
}

interface StreetViewExplorerProps {
  position: LatLng;
  onPositionChange?: (pos: LatLng) => void;
  onHeadingChange?: (heading: number) => void;
  apiKey: string;
}

const StreetViewExplorer = ({ position, onPositionChange, onHeadingChange, apiKey }: StreetViewExplorerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const panoramaRef = useRef<google.maps.StreetViewPanorama | null>(null);
  const [loaded, setLoaded] = useState(false);

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

  useEffect(() => {
    if (!loaded || !containerRef.current) return;

    const pano = new window.google.maps.StreetViewPanorama(containerRef.current, {
      position,
      pov: { heading: 0, pitch: 0 },
      zoom: 1,
      addressControl: false,
      showRoadLabels: true,
      motionTracking: false,
      motionTrackingControl: false,
      fullscreenControl: false,
      linksControl: true,
    });

    panoramaRef.current = pano;

    pano.addListener('position_changed', () => {
      const pos = pano.getPosition();
      if (pos && onPositionChange) {
        onPositionChange({ lat: pos.lat(), lng: pos.lng() });
      }
    });

    pano.addListener('pov_changed', () => {
      if (onHeadingChange) {
        onHeadingChange(pano.getPov().heading);
      }
    });

    return () => {
      window.google.maps.event.clearInstanceListeners(pano);
    };
  }, [loaded]);

  useEffect(() => {
    if (panoramaRef.current && loaded) {
      panoramaRef.current.setPosition(position);
    }
  }, [position.lat, position.lng, loaded]);

  return (
    <div ref={containerRef} className="w-full h-full bg-muted flex items-center justify-center">
      {!loaded && (
        <p className="text-muted-foreground font-body text-sm">Loading Street View...</p>
      )}
    </div>
  );
};

export default StreetViewExplorer;
