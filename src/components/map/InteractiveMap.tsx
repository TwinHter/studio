
"use client";

import React, { useMemo, useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import type { GeoJsonObject } from 'geojson';
import L, { type PathOptions, type LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { OutcodeData } from '@/types';

interface InteractiveMapProps {
  regionsData: OutcodeData[];
  onRegionSelect: (regionId: string) => void;
  selectedRegionId?: string | null;
}

// Sample GeoJSON data matching londonOutcodes_data.ts structure
// In a real app, this would come from a file or API.
const londonOutcodesGeoJson: GeoJsonObject = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { id: "E1", name: "Whitechapel, Stepney, Mile End" },
      geometry: { type: "Polygon", coordinates: [[[-0.08, 51.505], [-0.04, 51.505], [-0.04, 51.525], [-0.08, 51.525], [-0.08, 51.505]]] }
    },
    {
      type: "Feature",
      properties: { id: "SW1", name: "Westminster, Belgravia, Pimlico" },
      geometry: { type: "Polygon", coordinates: [[[-0.16, 51.485], [-0.12, 51.485], [-0.12, 51.505], [-0.16, 51.505], [-0.16, 51.485]]] }
    },
    {
      type: "Feature",
      properties: { id: "N1", name: "Islington, Barnsbury, Canonbury" },
      geometry: { type: "Polygon", coordinates: [[[-0.13, 51.525], [-0.09, 51.525], [-0.09, 51.545], [-0.13, 51.545], [-0.13, 51.525]]] }
    },
    {
      type: "Feature",
      properties: { id: "SE1", name: "Waterloo, Bermondsey, Southwark" },
      geometry: { type: "Polygon", coordinates: [[[-0.11, 51.495], [-0.07, 51.495], [-0.07, 51.515], [-0.11, 51.515], [-0.11, 51.495]]] }
    },
    {
      type: "Feature",
      properties: { id: "W1", name: "Mayfair, Marylebone, Soho" },
      geometry: { type: "Polygon", coordinates: [[[-0.17, 51.508], [-0.13, 51.508], [-0.13, 51.528], [-0.17, 51.528], [-0.17, 51.508]]] }
    },
    {
      type: "Feature",
      properties: { id: "IG1", name: "Ilford" },
      geometry: { type: "Polygon", coordinates: [[[0.05, 51.55], [0.09, 51.55], [0.09, 51.57], [0.05, 51.57], [0.05, 51.55]]] }
    },
    {
      type: "Feature",
      properties: { id: "CR0", name: "Croydon" },
      geometry: { type: "Polygon", coordinates: [[[-0.12, 51.36], [-0.08, 51.36], [-0.08, 51.38], [-0.12, 51.38], [-0.12, 51.36]]] }
    }
  ]
} as GeoJsonObject;

const InteractiveMap: React.FC<InteractiveMapProps> = ({ regionsData, onRegionSelect, selectedRegionId }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Fix for default icon issue in Leaflet with Webpack/Next.js
    // @ts-ignore
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
  }, []); // Empty dependency array ensures this runs once on mount

  const londonCenter: LatLngExpression = [51.505, -0.09];
  const mapStyle = useMemo(() => ({ height: '500px', width: '100%', borderRadius: '0.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }), []);

  const getRegionStyle = useCallback((feature?: GeoJSON.Feature): PathOptions => {
    if (!feature || !feature.properties) return {
      fillColor: 'hsl(var(--muted))',
      color: 'hsl(var(--border))',
      weight: 1,
      opacity: 1,
      fillOpacity: 0.5
    };

    const regionDetails = regionsData.find(r => r.id === feature.properties.id);
    let fillColor = 'hsl(var(--muted-foreground))';

    if (regionDetails) {
      switch (regionDetails.priceCategory) {
        case 'low': fillColor = 'hsl(var(--chart-4))'; break;
        case 'medium': fillColor = 'hsl(var(--chart-3))'; break;
        case 'high': fillColor = 'hsl(var(--destructive))'; break;
      }
    }
    
    const isSelected = feature.properties.id === selectedRegionId;

    return {
      fillColor,
      color: isSelected ? 'hsl(var(--primary))' : 'hsl(var(--card-foreground))',
      weight: isSelected ? 3 : 1,
      opacity: 1,
      fillOpacity: isSelected ? 0.7 : 0.4,
    };
  }, [regionsData, selectedRegionId]);

  const onEachFeature = useCallback((feature: GeoJSON.Feature, layer: L.Layer) => {
    if (feature.properties && feature.properties.id) {
      layer.on({
        click: () => {
          onRegionSelect(feature.properties.id);
        },
        mouseover: (e) => {
          const l = e.target;
          l.setStyle({
            weight: 2,
            fillOpacity: 0.6,
          });
          if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            l.bringToFront();
          }
        },
        mouseout: (e) => {
           const l = e.target;
           const currentStyle = getRegionStyle(feature);
           l.setStyle({
             weight: currentStyle.weight,
             fillOpacity: currentStyle.fillOpacity,
           });
        }
      });
    }
  }, [onRegionSelect, getRegionStyle]);
  
  const geoJsonKey = useMemo(() => `geojson-${selectedRegionId}-${regionsData.length}`, [selectedRegionId, regionsData.length]);

  if (!isClient) {
    // Return null and rely on the dynamic import's loading state in the parent component.
    return null; 
  }

  return (
    <div style={mapStyle}> {/* Wrapper div to ensure fixed dimensions */}
      <MapContainer
        center={londonCenter}
        zoom={10}
        style={{ height: '100%', width: '100%' }} // MapContainer fills its parent
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <GeoJSON
          key={geoJsonKey} 
          data={londonOutcodesGeoJson}
          style={getRegionStyle}
          onEachFeature={onEachFeature}
        />
      </MapContainer>
    </div>
  );
};

export default InteractiveMap;
