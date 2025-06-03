
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import PageHero from '@/components/shared/PageHero';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { londonOutcodes } from '@/lib/data/london_outcodes_data'; // Now uses extended data
import type { OutcodeData } from '@/types';
import { useMap } from '@/hooks/useMap';
import { MapPin, Home, Loader2, AlertTriangle, TrendingUp, BarChartIcon, DollarSign, Map as MapLucideIcon } from 'lucide-react';
import { 
  MAP_PAGE_HERO_TITLE, 
  MAP_PAGE_HERO_DESCRIPTION, 
  MIN_PRICE_FILTER_DEFAULT, // These will be updated by constants.ts
  MAX_PRICE_FILTER_DEFAULT,
  PLACEHOLDER_HINTS
} from '@/lib/constants';
import Image from 'next/image'; 

// Dynamically import the InteractiveMap component for client-side rendering
const InteractiveMapDisplay = dynamic(() => import('@/components/map/InteractiveMap'), {
  ssr: false, 
  loading: () => <div className="flex justify-center items-center h-[400px] w-full bg-muted rounded-md shadow-md aspect-[4/3] max-h-[600px]"><Loader2 className="h-8 w-8 animate-spin text-primary" /> <p className="ml-2">Loading interactive map area...</p></div>,
});

type RegionFilters = {
  priceRange?: [number, number];
};

export default function MapInteractionPage() {
  const [selectedRegion, setSelectedRegion] = useState<OutcodeData | null>(null);
  const [filters, setFilters] = useState<RegionFilters>({});
  const { getInsights, isFetchingInsights, insightsData, insightsError, resetInsights } = useMap();

  // Calculate min/max price from the actual data for the slider
  const actualMinPrice = useMemo(() => Math.min(...londonOutcodes.map(r => r.avgPrice), MIN_PRICE_FILTER_DEFAULT), [londonOutcodes]);
  const actualMaxPrice = useMemo(() => Math.max(...londonOutcodes.map(r => r.avgPrice), MAX_PRICE_FILTER_DEFAULT), [londonOutcodes]);
  
  useEffect(() => {
    // Initialize filters with actual min/max from the data
    setFilters(prev => ({ ...prev, priceRange: [actualMinPrice, actualMaxPrice] }));
  }, [actualMinPrice, actualMaxPrice]);


  const filteredRegions = useMemo(() => {
    return londonOutcodes.filter(region => {
      if (filters.priceRange && (region.avgPrice < filters.priceRange[0] || region.avgPrice > filters.priceRange[1])) {
        return false;
      }
      return true;
    });
  }, [filters, londonOutcodes]);

  const handleRegionSelect = useCallback(async (regionId: string) => {
    const region = londonOutcodes.find(r => r.id === regionId);
    if (region) {
      setSelectedRegion(region);
      resetInsights(); 
      try {
        await getInsights({ region: region.id });
      } catch (e) {
        console.error("Region select error", e);
      }
      const detailsElement = document.getElementById('region-details');
      if (detailsElement) {
        detailsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [getInsights, resetInsights, londonOutcodes]); 

  const getRegionColorClassForButton = (priceCategory: OutcodeData['priceCategory']) => {
    switch (priceCategory) {
      case 'low': return 'bg-green-500/20 border-green-500 hover:bg-green-500/30 text-green-700';
      case 'medium': return 'bg-yellow-500/20 border-yellow-500 hover:bg-yellow-500/30 text-yellow-700';
      case 'high': return 'bg-red-500/20 border-red-500 hover:bg-red-500/30 text-red-700';
      default: return 'bg-card hover:bg-muted/80';
    }
  };

  return (
    <div className="space-y-12">
      <PageHero
        title={MAP_PAGE_HERO_TITLE}
        description={MAP_PAGE_HERO_DESCRIPTION}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 shadow-xl animate-fadeIn h-fit sticky top-24 bg-card" style={{animationDelay: '0.2s'}}>
          <CardHeader>
            <CardTitle className="font-headline text-xl flex items-center"><DollarSign className="mr-2 h-5 w-5 text-primary"/>Filter by Average Price</CardTitle>
            <CardDescription>Adjust the price range to find suitable areas.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">Average Price Range (£)</label>
              <Slider
                value={filters.priceRange}
                min={actualMinPrice} // Use actual min
                max={actualMaxPrice} // Use actual max
                step={50000}
                onValueChange={(value) => setFilters(prev => ({...prev, priceRange: value as [number, number]}))}
                className="my-4"
                disabled={londonOutcodes.length === 0}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>£{filters.priceRange ? filters.priceRange[0].toLocaleString() : actualMinPrice.toLocaleString()}</span>
                <span>£{filters.priceRange ? filters.priceRange[1].toLocaleString() : actualMaxPrice.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-8">
          <Card className="shadow-xl animate-fadeIn bg-card" style={{animationDelay: '0.4s'}}>
            <CardHeader>
              <CardTitle className="font-headline text-xl flex items-center"><MapLucideIcon className="mr-2 h-5 w-5 text-primary"/>Interactive London Outcodes SVG Map</CardTitle>
            </CardHeader>
            <CardContent>
              <InteractiveMapDisplay 
                regionsData={londonOutcodes} 
                onRegionSelect={handleRegionSelect}
                selectedRegionId={selectedRegion?.id}
              />
            </CardContent>
          </Card>

           <Card className="shadow-xl animate-fadeIn bg-card" style={{animationDelay: '0.5s'}}>
            <CardHeader>
              <CardTitle className="font-headline text-xl">Select Region from List ({filteredRegions.length} results)</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
              {filteredRegions.map((region) => (
                <Button
                  key={region.id}
                  variant="outline"
                  className={`p-4 h-auto text-left flex flex-col items-start justify-start border-2 transition-all duration-200 ${getRegionColorClassForButton(region.priceCategory)} ${selectedRegion?.id === region.id ? 'ring-2 ring-offset-2 ring-primary scale-105' : 'hover:scale-105'}`}
                  onClick={() => handleRegionSelect(region.id)}
                  disabled={isFetchingInsights && selectedRegion?.id === region.id}
                >
                  <span className="font-bold text-sm">{region.id}</span>
                  <span className="text-xs block truncate w-full">{region.name.split(',')[0]}</span>
                  <span className="text-xs mt-1">£{region.avgPrice.toLocaleString()}</span>
                </Button>
              ))}
               {filteredRegions.length === 0 && <p className="col-span-full text-center text-muted-foreground">No regions match your filters.</p>}
            </CardContent>
          </Card>

          {selectedRegion && (
            <Card className="shadow-xl animate-fadeIn bg-card" style={{animationDelay: '0.6s'}} id="region-details">
              <CardHeader>
                <CardTitle className="font-headline text-2xl flex items-center">
                  <MapPin className="mr-2 h-6 w-6 text-primary" />
                  {selectedRegion.name} ({selectedRegion.id})
                </CardTitle>
                <CardDescription>Current Average Price: £{selectedRegion.avgPrice.toLocaleString()}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isFetchingInsights && (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="ml-2 text-muted-foreground">Loading AI insights...</p>
                  </div>
                )}
                {insightsError && (
                  <div className="flex items-center text-muted-foreground p-4 border border-dashed rounded-md bg-destructive/10 border-destructive/30">
                     <AlertTriangle className="mr-2 h-5 w-5 text-destructive" />
                     <span>Could not load AI insights for this region: {insightsError.message}</span>
                   </div>
                 )}
                {insightsData && !isFetchingInsights && (
                  <div>
                    <h4 className="font-semibold text-lg mb-2 font-headline flex items-center text-primary">
                      <TrendingUp className="mr-2 h-5 w-5 text-accent" /> AI Insights
                    </h4>
                    <p className="text-foreground/90 bg-accent/10 p-4 rounded-md border border-accent/30">{insightsData.summary}</p>
                  </div>
                )}
                <div>
                  <h4 className="font-semibold text-lg mb-2 font-headline flex items-center text-primary">
                    <BarChartIcon className="mr-2 h-5 w-5 text-primary" /> Price Chart (Illustrative)
                  </h4>
                  <div className="bg-muted/50 p-4 rounded-md text-center">
                     <Image
                        src={`https://placehold.co/600x300.png`} // Placeholder, as real chart data is not part of this simplified map info
                        alt={`Illustrative price chart for ${selectedRegion.id}`}
                        width={600}
                        height={300}
                        className="rounded-md mx-auto shadow-md"
                        data-ai-hint={PLACEHOLDER_HINTS.priceChart}
                      />
                    <p className="text-sm text-muted-foreground mt-2">Illustrative price trend chart for {selectedRegion.id}.</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Link href={`/recommendations?region=${selectedRegion.id}`}>
                    <Home className="mr-2 h-4 w-4"/> View suitable properties in {selectedRegion.id}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
