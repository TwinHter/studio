
"use client";

import React, { useMemo } from 'react';
import L, { type LatLngExpression, type StyleFunction, type LeafletEvent, type Path } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import type { FeatureCollection, Feature, Geometry } from 'geojson';
import type { OutcodeData } from '@/types';

// Embedded simplified GeoJSON data for demonstration
// In a real app, this would likely come from a file or API
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
  
  // Style for the outer wrapper div, defining map dimensions
  const wrapperMapStyle = useMemo(() => ({ height: '500px', width: '100%' }), []);
  
  // Key for the wrapper div to force re-mount in development (HMR fix)
  const mapWrapperKey = process.env.NODE_ENV === 'development' ? Math.random().toString() : 'map-wrapper-prod';

  const getRegionStyle = useMemo((): StyleFunction<any> => {
    return (feature?: Feature<Geometry, any>) => {
      if (!feature || !feature.properties) {
        return { color: '#cccccc', weight: 1, fillOpacity: 0.5, fillColor: '#cccccc' };
      }
      const regionId = feature.properties.id;
      const region = regionsData.find(r => r.id === regionId);
      
      let fillColor = '#cccccc'; // Default color for regions not in regionsData or without category
      let weight = 1;
      let opacity = 0.65;

      if (region) {
        switch (region.priceCategory) {
          case 'low': fillColor = 'hsl(var(--chart-4))'; break; // Green
          case 'medium': fillColor = 'hsl(var(--chart-3))'; break; // Orange/Yellow
          case 'high': fillColor = 'hsl(var(--destructive))'; break; // Red
          default: fillColor = '#90a4ae'; // Grey for uncategorized but present in data
        }
      }
      
      if (selectedRegionId === regionId) {
          weight = 3;
          opacity = 0.85;
          fillColor = region ? fillColor : 'hsl(var(--primary))'; // Highlight selected with its color or primary if not found
      }

      return {
        fillColor,
        weight,
        opacity,
        color: 'white', // Border color for features
        fillOpacity: opacity,
      };
    };
  }, [regionsData, selectedRegionId]);


  const onEachFeature = useMemo(() => {
    return (feature: Feature<Geometry, any>, layer: L.Layer) => {
        layer.on({
          click: (e: LeafletEvent) => {
            L.DomEvent.stopPropagation(e); // Prevent map click if feature is clicked
            if (feature && feature.properties) {
              onRegionSelect(feature.properties.id);
            }
          },
          mouseover: (e: LeafletEvent) => {
            const targetLayer = e.target as Path;
            if (targetLayer.setStyle) { // Check if setStyle exists
                targetLayer.setStyle({
                    weight: 2.5,
                    fillOpacity: (feature.properties && selectedRegionId === feature.properties.id) ? 0.85 : 0.75,
                });
            }
            if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                if (targetLayer.bringToFront) targetLayer.bringToFront();
            }
          },
          mouseout: (e: LeafletEvent) => {
             const targetLayer = e.target as Path;
             if (targetLayer.setStyle) { // Check if setStyle exists
                targetLayer.setStyle(getRegionStyle(feature)); // Re-apply original or selected style
             }
          }
        });
      };
  }, [onRegionSelect, selectedRegionId, getRegionStyle]);

  // Key for GeoJSON to re-render when selectedRegionId changes (for styling) or if regionsData were dynamic
  const geoJsonKey = `geojson-${selectedRegionId}-${regionsData.length}`;

  return (
    <div key={mapWrapperKey} style={wrapperMapStyle} className="rounded-md shadow-md bg-muted">
      <MapContainer
          center={londonCenter}
          zoom={10}
          style={{ height: '100%', width: '100%' }} // MapContainer fills the wrapper
          className="rounded-md" // Keep rounded corners if desired on the map itself
          scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" // Using a CartoDB base map
        />
        <GeoJSON
          key={geoJsonKey}
          data={sampleGeoJson} // Ensure this GeoJSON data is valid
          style={getRegionStyle}
          onEachFeature={onEachFeature}
        />
      </MapContainer>
    </div>
  );
};

export default InteractiveMap;
