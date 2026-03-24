import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Hotel, Utensils, Camera } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';

// Fix for default marker icons in Leaflet
// @ts-ignore
import icon from 'leaflet/dist/images/marker-icon.png';
// @ts-ignore
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

export interface MapLocation {
  name: string;
  lat: number;
  lng: number;
  type: 'attraction' | 'hotel' | 'restaurant' | 'other';
  description?: string;
}

interface InteractiveMapProps {
  locations: MapLocation[];
  center?: [number, number];
  zoom?: number;
}

function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

const getIconForType = (type: MapLocation['type']) => {
  let IconComponent = MapPin;
  let color = '#5a5a40'; // olive

  switch (type) {
    case 'hotel':
      IconComponent = Hotel;
      color = '#3b82f6'; // blue
      break;
    case 'restaurant':
      IconComponent = Utensils;
      color = '#ef4444'; // red
      break;
    case 'attraction':
      IconComponent = Camera;
      color = '#8b5cf6'; // purple
      break;
  }

  const iconMarkup = renderToStaticMarkup(
    <div style={{ 
      backgroundColor: 'white', 
      borderRadius: '50%', 
      padding: '8px', 
      border: `2px solid ${color}`,
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer'
    }}>
      <IconComponent size={20} color={color} />
    </div>
  );

  return L.divIcon({
    html: iconMarkup,
    className: 'custom-div-icon',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

export function InteractiveMap({ locations, center, zoom = 13 }: InteractiveMapProps) {
  const defaultCenter: [number, number] = center || (locations.length > 0 ? [locations[0].lat, locations[0].lng] : [0, 0]);

  if (locations.length === 0) {
    return (
      <div className="w-full h-[400px] bg-ink/5 rounded-[2.5rem] flex items-center justify-center border border-ink/10">
        <p className="text-ink/40 font-display italic">No locations found to display on the map.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[500px] rounded-[2.5rem] overflow-hidden border border-ink/10 shadow-xl relative z-0">
      <MapContainer 
        center={defaultCenter} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ChangeView center={defaultCenter} zoom={zoom} />
        {locations.map((loc, idx) => (
          <Marker 
            key={`${loc.name}-${idx}`} 
            position={[loc.lat, loc.lng]}
            icon={getIconForType(loc.type)}
          >
            <Popup className="custom-popup">
              <div className="p-2">
                <h4 className="font-bold text-olive mb-1">{loc.name}</h4>
                <p className="text-xs text-ink/60 capitalize mb-1 font-bold">{loc.type}</p>
                {loc.description && <p className="text-sm text-ink/80">{loc.description}</p>}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
