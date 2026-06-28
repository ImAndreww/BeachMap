'use client';

import { useEffect, useRef, useState } from 'react';

type Beach = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  blue_flag: boolean;
  blue_flag_year: number | null;
  description: string | null;
};

type Props = {
  apiKey: string;
  centerLat: number;
  centerLng: number;
  beaches: Beach[];
};

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    google: any;
    initBeachMap: () => void;
  }
}

export default function BeachMap({ apiKey, centerLat, centerLng, beaches }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [selectedBeach, setSelectedBeach] = useState<Beach | null>(null);

  useEffect(() => {
    if (!apiKey || apiKey.includes('cheia')) {
      setLoaded(true); // show placeholder
      return;
    }

    if (window.google?.maps) {
      initMap();
      return;
    }

    window.initBeachMap = () => {
      initMap();
      setLoaded(true);
    };

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initBeachMap&loading=async`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [apiKey]);

  function initMap() {
    if (!mapRef.current) return;

    const map = new google.maps.Map(mapRef.current, {
      center: { lat: centerLat, lng: centerLng },
      zoom: 12,
      mapTypeId: 'roadmap',
      styles: [
        { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0097a7' }] },
        { featureType: 'landscape.natural.terrain', elementType: 'geometry', stylers: [{ color: '#e0f7fa' }] },
        { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
      ],
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
    });

    beaches.forEach((beach) => {
      const marker = new google.maps.Marker({
        position: { lat: beach.latitude, lng: beach.longitude },
        map,
        title: beach.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: beach.blue_flag ? '#1565C0' : '#FF8F00',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="font-family: Inter, sans-serif; padding: 4px; min-width: 160px;">
            <strong style="font-size: 14px; color: #1a2332;">${beach.name}</strong>
            ${beach.blue_flag
              ? `<div style="margin-top:6px; background:#E3F2FD; color:#1565C0; border-radius:4px; padding:3px 8px; font-size:12px; display:inline-block;">
                  🔵 Blue Flag ${beach.blue_flag_year || ''}
                </div>`
              : `<div style="margin-top:6px; color:#888; font-size:12px;">Fără certificare Blue Flag</div>`
            }
            ${beach.description
              ? `<p style="margin-top:6px; font-size:12px; color:#666; max-width:200px;">${beach.description}</p>`
              : ''
            }
          </div>
        `,
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
        setSelectedBeach(beach);
      });
    });

    setLoaded(true);
  }

  // Fără cheie API — arată placeholder informativ
  if (!apiKey || apiKey.includes('cheia')) {
    return (
      <div className="h-96 bg-gradient-to-br from-cyan-100 to-blue-200 flex flex-col items-center justify-center gap-3 text-gray-500">
        <div className="text-4xl">🗺️</div>
        <p className="font-medium text-gray-600">Hartă Google Maps</p>
        <p className="text-sm text-center max-w-xs text-gray-400">
          Adaugă cheia <code className="bg-white px-1 rounded text-xs">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> în <code className="bg-white px-1 rounded text-xs">.env.local</code> pentru a activa harta.
        </p>
        <div className="mt-2 text-xs text-gray-400">
          {beaches.length} plaje marcate: {beaches.filter(b => b.blue_flag).length} Blue Flag
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div ref={mapRef} className="w-full h-96" />
      {!loaded && (
        <div className="absolute inset-0 bg-cyan-50 flex items-center justify-center">
          <div className="text-cyan-600 text-sm">Se încarcă harta...</div>
        </div>
      )}
    </div>
  );
}
