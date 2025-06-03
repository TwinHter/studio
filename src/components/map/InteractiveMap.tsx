
"use client";

import React from 'react';
import Image from 'next/image';
import type { OutcodeData } from '@/types';
import { PLACEHOLDER_HINTS } from '@/lib/constants';

interface InteractiveMapProps {
  // Props remain the same to maintain the interface with the parent component,
  // but they are not used for direct map interaction anymore.
  regionsData: OutcodeData[];
  onRegionSelect: (regionId: string) => void;
  selectedRegionId?: string | null;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ regionsData, onRegionSelect, selectedRegionId }) => {
  return (
    <div className="bg-muted p-2 rounded-lg shadow-md aspect-[4/3] max-h-[600px] overflow-hidden flex flex-col justify-center items-center">
      <Image
        src="https://placehold.co/800x600.png" // Generic placeholder size
        alt="Illustrative map of London outcodes"
        width={800}
        height={600}
        className="w-full h-auto object-contain rounded-md" // object-contain to ensure it fits within the aspect ratio box
        data-ai-hint={PLACEHOLDER_HINTS.londonMap} 
      />
      <p className="text-xs text-muted-foreground mt-2 text-center">
        Illustrative map of London regions. Please use the list or filters to select an outcode for details.
      </p>
    </div>
  );
};

export default InteractiveMap;
