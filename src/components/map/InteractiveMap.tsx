
"use client";

import type { LatLngExpression, GeoJSON as LeafletGeoJSON, StyleFunction } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import type { FeatureCollection, Feature, Geometry } from 'geojson';
import type { OutcodeData } from '@/types';
import { PLACEHOLDER_HINTS } from '@/lib/constants';

// Embedded simplified GeoJSON data for demonstration
// In a real app, this would come from a file or API and be more detailed.
const sampleGeoJson: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { id: 'E1', name: 'Whitechapel, Stepney, Mile End' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-0.078, 51.513], [-0.072, 51.519], [-0.060, 51.516], [-0.065, 51.508], [-0.078, 51.513]
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: { id: 'SW1', name: 'Westminster, Belgravia, Pimlico' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-0.145, 51.498], [-0.130, 51.503], [-0.125, 51.490], [-0.140, 51.488], [-0.145, 51.498]
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: { id: 'N1', name: 'Islington, Barnsbury, Canonbury' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-0.110, 51.530], [-0.100, 51.535], [-0.095, 51.525], [-0.105, 51.520], [-0.110, 51.530]
          ],
        ],
      },
    },
     {
      type: 'Feature',
      properties: { id: 'SE1', name: 'Waterloo, Bermondsey, Southwark' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-0.100, 51.500], [-0.080, 51.505], [-0.075, 51.490], [-0.095, 51.488], [-0.100, 51.500]
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: { id: 'W1', name: 'Mayfair, Marylebone, Soho' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-0.160, 51.510], [-0.140, 51.515], [-0.135, 51.505], [-0.155, 51.500], [-0.160, 51.510]
          ],
        ],
      },
    },
     {
      type: 'Feature',
      properties: { id: 'IG1', name: 'Ilford' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [0.060, 51.560], [0.080, 51.565], [0.075, 51.550], [0.055, 51.548], [0.060, 51.560]
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: { id: 'CR0', name: 'Croydon' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-0.120, 51.370], [-0.090, 51.375], [-0.085, 51.360], [-0.115, 51.358], [-0.120, 51.370]
          ],
        ],
      },
    }
  ],
};

interface InteractiveMapProps {
  regionsData: OutcodeData[];
  onRegionSelect: (regionId: string) => void;
  selectedRegionId?: string | null;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ regionsData, onRegionSelect, selectedRegionId }) => {
  const londonCenter: LatLngExpression = [51.5074, -0.1278]; // Approx center of London

  const getRegionStyle: StyleFunction = (feature?: Feature<Geometry, any>) => {
    if (!feature) return { color: '#cccccc', weight: 1, fillOpacity: 0.5 };
    const regionId = feature.properties.id;
    const region = regionsData.find(r => r.id === regionId);
    
    let fillColor = '#cccccc'; // Default color
    let weight = 1;
    let opacity = 0.65;

    if (region) {
      switch (region.priceCategory) {
        case 'low': fillColor = '#66bb6a'; break; // Softer Green
        case 'medium': fillColor = '#ffee58'; break; // Softer Yellow
        case 'high': fillColor = '#ef5350'; break; // Softer Red
        default: fillColor = '#90a4ae'; // Bluish Grey for others
      }
    }
    
    if (selectedRegionId === regionId) {
        weight = 3;
        opacity = 0.85;
        fillColor = region ? fillColor : '#3388ff'; // Keep category color or blue if no category
    }

    return {
      fillColor,
      weight,
      opacity,
      color: 'white', // Border color for polygons
      fillOpacity: opacity,
    };
  };

  const onEachFeature = (feature: Feature<Geometry, any>, layer: LeafletGeoJSON) => {
    layer.on({
      click: () => {
        onRegionSelect(feature.properties.id);
      },
      mouseover: (e) => {
        const l = e.target;
        l.setStyle({
            weight: 2.5,
            fillOpacity: selectedRegionId === feature.properties.id ? 0.85: 0.75,
        });
        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            l.bringToFront();
        }
      },
      mouseout: (e) => {
         const l = e.target;
         // Reset to default style based on selection
         const baseStyle = getRegionStyle(feature);
         l.setStyle(baseStyle);
      }
    });
  };

  return (
    <MapContainer 
        center={londonCenter} 
        zoom={10} 
        style={{ height: '500px', width: '100%' }} 
        className="rounded-md shadow-md"
        scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <GeoJSON 
        key={selectedRegionId || 'geojson-layer'} // Force re-render on selection change for styling
        data={sampleGeoJson} 
        style={getRegionStyle}
        onEachFeature={onEachFeature} 
      />
    </MapContainer>
  );
};

export default InteractiveMap;

