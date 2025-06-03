
"use client";

import React from 'react';
import Image from 'next/image';
import type { OutcodeData } from '@/types';
import { PLACEHOLDER_HINTS } from '@/lib/constants';

interface InteractiveMapProps {
  regionsData: OutcodeData[]; // Kept for potential future use or if parent expects it
  onRegionSelect: (regionId: string) => void; // Kept for consistency
  selectedRegionId?: string | null; // Kept for consistency
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ regionsData, selectedRegionId }) => {
  // In this version, the map is a static image.
  // Interaction (selecting a region) happens via the list of buttons on the parent page.
  
  const mapWrapperStyle: React.CSSProperties = { 
    height: '500px', 
    width: '100%', 
    borderRadius: '0.5rem', 
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'hsl(var(--muted))', // Use a muted background
  };

  return (
    <div style={mapWrapperStyle}>
      <Image
        src={`https://placehold.co/800x500.png`} // A generic placeholder
        alt="Illustrative map of London outcodes"
        width={800}
        height={500}
        className="rounded-md object-contain" // Ensure image fits and maintains aspect ratio
        data-ai-hint={PLACEHOLDER_HINTS.londonMap}
        priority // Good to prioritize if it's a key visual element
      />
    </div>
  );
};

export default InteractiveMap;
