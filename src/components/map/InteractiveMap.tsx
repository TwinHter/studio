
"use client";

import React, { useState } from 'react';
import type { OutcodeData } from '@/types';

interface InteractiveMapProps {
  regionsData: OutcodeData[];
  onRegionSelect: (regionId: string) => void;
  selectedRegionId?: string | null;
}

// Simplified SVG path data for a few representative outcodes (rectangles for demonstration)
// In a real app, these would be accurate geographical paths.
const outcodeSvgPaths: Record<string, string> = {
  'E1': 'M50,50 h40 v30 h-40 z',    // Rectangle for E1
  'SW1A': 'M100,50 h50 v40 h-50 z', // Rectangle for SW1A
  'N1': 'M50,100 h30 v30 h-30 z',   // Rectangle for N1
  'SE1': 'M90,100 h40 v30 h-40 z',  // Rectangle for SE1
  'W1K': 'M150,100 h40 v40 h-40 z', // Rectangle for W1K (Mayfair)
  'WC2': 'M100,150 h50 v30 h-50 z', // Rectangle for WC2
  'EC2': 'M160,50 h30 v30 h-30 z',  // Rectangle for EC2
  // Add more simple paths if needed for other regions in regionsData for visual completeness
};

const InteractiveMap: React.FC<InteractiveMapProps> = ({ regionsData, onRegionSelect, selectedRegionId }) => {
  const [hoveredRegionId, setHoveredRegionId] = useState<string | null>(null);

  const getRegionStyle = (region: OutcodeData, isHovered: boolean = false) => {
    let baseColor;
    switch (region.priceCategory) {
      case 'low': baseColor = 'rgba(74, 222, 128, 0.7)'; break; // Tailwind green-400 with opacity
      case 'medium': baseColor = 'rgba(250, 204, 21, 0.7)'; break; // Tailwind yellow-400 with opacity
      case 'high': baseColor = 'rgba(239, 68, 68, 0.7)'; break; // Tailwind red-500 with opacity
      default: baseColor = 'rgba(156, 163, 175, 0.7)'; // Tailwind gray-400 with opacity
    }

    let strokeColor = 'hsl(var(--card-foreground))';
    let strokeWidth = 0.5;

    if (selectedRegionId === region.id) {
      baseColor = region.priceCategory === 'low' ? 'rgb(34, 197, 94)' : region.priceCategory === 'medium' ? 'rgb(234, 179, 8)' : 'rgb(220, 38, 38)'; // Darker, solid
      strokeColor = 'hsl(var(--primary))';
      strokeWidth = 1.5;
    } else if (isHovered) {
      // Slightly lighten or brighten on hover - can be more sophisticated
      baseColor = region.priceCategory === 'low' ? 'rgba(74, 222, 128, 0.9)' : region.priceCategory === 'medium' ? 'rgba(250, 204, 21, 0.9)' : 'rgba(239, 68, 68, 0.9)';
    }

    return {
      fill: baseColor,
      stroke: strokeColor,
      strokeWidth: strokeWidth,
    };
  };
  
  // Filter regionsData to only include those for which we have SVG paths
  const displayableRegions = regionsData.filter(region => outcodeSvgPaths[region.id]);

  return (
    <div className="bg-muted p-2 rounded-lg shadow-md aspect-[4/3] max-h-[600px] overflow-hidden">
      <svg 
        viewBox="0 0 250 200" // Adjust viewBox as needed for your paths
        className="w-full h-full"
        aria-label="Interactive map of London outcodes"
      >
        <desc>
          A simplified map of London outcodes. Each shape represents an outcode region.
          Colors indicate average price category: Green for low, Yellow for medium, Red for high.
          Click a region to see details.
        </desc>
        {displayableRegions.map((region) => {
          const style = getRegionStyle(region, hoveredRegionId === region.id);
          const pathDefinition = outcodeSvgPaths[region.id];

          if (!pathDefinition) return null; // Should not happen due to filter, but good practice

          return (
            <path
              key={region.id}
              id={`svg-region-${region.id}`}
              d={pathDefinition}
              fill={style.fill}
              stroke={style.stroke}
              strokeWidth={style.strokeWidth}
              onClick={() => onRegionSelect(region.id)}
              onMouseEnter={() => setHoveredRegionId(region.id)}
              onMouseLeave={() => setHoveredRegionId(null)}
              className="cursor-pointer transition-colors duration-150 ease-in-out"
              aria-label={`${region.name} (${region.id}), Average Price: £${region.avgPrice.toLocaleString()}`}
              tabIndex={0} // Make it focusable
              onFocus={() => setHoveredRegionId(region.id)}
              onBlur={() => setHoveredRegionId(null)}
            >
              <title>{`${region.name} (${region.id})\nAvg Price: £${region.avgPrice.toLocaleString()}`}</title>
            </path>
          );
        })}
        {/* Fallback text if no regions are displayable - for accessibility and debugging */}
        {displayableRegions.length === 0 && (
          <text x="10" y="20" fontFamily="Arial" fontSize="10" fill="hsl(var(--foreground))">
            No map data available for the current regions.
          </text>
        )}
      </svg>
      <p className="text-xs text-muted-foreground mt-2 text-center">
        Note: This is a simplified, illustrative SVG map for demonstration. Not all outcodes may be represented.
      </p>
    </div>
  );
};

export default InteractiveMap;
