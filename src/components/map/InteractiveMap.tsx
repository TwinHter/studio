
"use client";

import React, { useMemo } from 'react'; // Import useMemo
import L, { type LatLngExpression, type GeoJSON as LeafletGeoJSON, type StyleFunction, type LeafletEvent } from 'leaflet'; // Explicitly import L
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import type { FeatureCollection, Feature, Geometry } from 'geojson';
import type { OutcodeData } from '@/types';

// Embedded simplified GeoJSON data for demonstration
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
  const londonCenter: LatLngExpression = [51.5074, -0.1278];
  const mapStyle = useMemo(() => ({ height: '500px', width: '100%' }), []);

  const getRegionStyle = useMemo((): StyleFunction => {
    return (feature?: Feature<Geometry, any>) => {
      if (!feature) return { color: '#cccccc', weight: 1, fillOpacity: 0.5 };
      const regionId = feature.properties.id;
      const region = regionsData.find(r => r.id === regionId);
      
      let fillColor = '#cccccc'; // Default color
      let weight = 1;
      let opacity = 0.65;

      if (region) {
        switch (region.priceCategory) {
          case 'low': fillColor = '#66bb6a'; break; 
          case 'medium': fillColor = '#ffee58'; break; 
          case 'high': fillColor = '#ef5350'; break; 
          default: fillColor = '#90a4ae'; 
        }
      }
      
      if (selectedRegionId === regionId) {
          weight = 3;
          opacity = 0.85;
          fillColor = region ? fillColor : '#3388ff'; 
      }

      return {
        fillColor,
        weight,
        opacity,
        color: 'white', 
        fillOpacity: opacity,
      };
    };
  }, [regionsData, selectedRegionId]);


  const onEachFeature = useMemo(() => {
    return (feature: Feature<Geometry, any>, layer: L.Layer) => {
        layer.on({
          click: () => {
            onRegionSelect(feature.properties.id);
          },
          mouseover: (e: LeafletEvent) => {
            const l = e.target;
            l.setStyle({
                weight: 2.5,
                fillOpacity: selectedRegionId === feature.properties.id ? 0.85 : 0.75,
            });
            if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                l.bringToFront();
            }
          },
          mouseout: (e: LeafletEvent) => {
             const l = e.target;
             const styleFunction = getRegionStyle; // getRegionStyle is stable due to useMemo
             const baseStyle = styleFunction(feature);
             l.setStyle(baseStyle);
          }
        });
      };
  }, [onRegionSelect, selectedRegionId, getRegionStyle]); // getRegionStyle is a dependency


  return (
    <MapContainer
        center={londonCenter}
        zoom={10}
        style={mapStyle} // Use memoized style
        className="rounded-md shadow-md"
        scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <GeoJSON
        key={selectedRegionId || 'geojson-layer'} // This key is important for GeoJSON updates
        data={sampleGeoJson}
        style={getRegionStyle}
        onEachFeature={onEachFeature}
      />
    </MapContainer>
  );
};

export default InteractiveMap;
    
