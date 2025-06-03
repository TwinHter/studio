
"use client";

import React from 'react';
import Image from 'next/image';
import type { OutcodeData } from '@/types';
import { PLACEHOLDER_HINTS } from '@/lib/constants';

interface InteractiveMapProps {
  regionsData: OutcodeData[]; // Still accepted, though not directly used by the static image
  onRegionSelect: (regionId: string) => void; // Still accepted for interface consistency
  selectedRegionId?: string | null; // Still accepted for interface consistency
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ regionsData, onRegionSelect, selectedRegionId }) => {
  // Style for the outer wrapper div, defining map dimensions
  const wrapperMapStyle: React.CSSProperties = { height: '500px', width: '100%' };

  return (
    <div style={wrapperMapStyle} className="rounded-md shadow-md bg-muted flex items-center justify-center">
      <Image
        src={`https://placehold.co/800x500.png`}
        alt="Static map of London regions"
        width={800}
        height={500}
        className="rounded-md object-contain"
        data-ai-hint={PLACEHOLDER_HINTS.londonMap + " static"}
        priority // Might help LCP if this is a primary visual element
      />
    </div>
  );
};

export default InteractiveMap;
