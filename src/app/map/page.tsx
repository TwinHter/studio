
"use client";

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import PageHero from '@/components/shared/PageHero';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { londonOutcodes, type OutcodeData } from '@/lib/data/london_outcodes_data';
import { fetchRegionInsights } from '@/services/api'; // Use the API service
import type { RegionPriceInsightsOutput } from '@/ai/flows/region-insights';
import { MapPin, Search, Home, Loader2, AlertTriangle, TrendingUp, BarChartIcon, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type RegionFilters = {
  priceRange?: [number, number];
};

export default function MapInteractionPage() {
  const [selectedRegion, setSelectedRegion] = useState<OutcodeData | null>(null);
  const [filters, setFilters] = useState<RegionFilters>({});
  const { toast } = useToast();

  const MIN_PRICE = 100000;
  const MAX_PRICE = 5000000;

  useEffect(() => {
    setFilters(prev => ({ ...prev, priceRange: [MIN_PRICE, MAX_PRICE] }));
  }, []);

  const regionInsightsMutation = useMutation({
    mutationFn: fetchRegionInsights,
    onSuccess: (data) => {
      // Handled by isSuccess, data directly
    },
    onError: (error) => {
      console.error("Error fetching region insights:", error);
      toast({
        title: "Error",
        description: "Could not fetch insights for this region.",
        variant: "destructive",
      });
    }
  });


  const filteredRegions = useMemo(() => {
    return londonOutcodes.filter(region => {
      if (filters.priceRange && (region.avgPrice < filters.priceRange[0] || region.avgPrice > filters.priceRange[1])) {
        return false;
      }
      return true;
    });
  }, [filters]);

  const handleRegionSelect = async (regionId: string) => {
    const region = londonOutcodes.find(r => r.id === regionId);
    if (region) {
      setSelectedRegion(region);
      regionInsightsMutation.mutate({ region: region.id });
      // Scroll to details section
      const detailsElement = document.getElementById('region-details');
      if (detailsElement) {
        detailsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const getRegionColorClass = (priceCategory: OutcodeData['priceCategory']) => {
    switch (priceCategory) {
      case 'low': return 'bg-green-500/20 border-green-500 hover:bg-green-500/30';
      case 'medium': return 'bg-yellow-500/20 border-yellow-500 hover:bg-yellow-500/30';
      case 'high': return 'bg-red-500/20 border-red-500 hover:bg-red-500/30';
      default: return 'bg-card hover:bg-muted/80';
    }
  };

  return (
    <div className="space-y-12">
      <PageHero
        title="Interactive London Map"
        description="Explore London's regions by average price, view details, and get AI-driven insights."
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
                min={MIN_PRICE}
                max={MAX_PRICE}
                step={50000}
                onValueChange={(value) => setFilters(prev => ({...prev, priceRange: value as [number, number]}))}
                className="my-4"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>£{filters.priceRange ? filters.priceRange[0].toLocaleString() : MIN_PRICE.toLocaleString()}</span>
                <span>£{filters.priceRange ? filters.priceRange[1].toLocaleString() : MAX_PRICE.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-8">
          <Card className="shadow-xl animate-fadeIn bg-card" style={{animationDelay: '0.4s'}}>
            <CardHeader>
              <CardTitle className="font-headline text-xl flex items-center"><MapPin className="mr-2 h-5 w-5 text-primary"/>London Map (Outcodes)</CardTitle>
            </CardHeader>
            <CardContent>
              <Image
                src="https://placehold.co/800x500.png"
                alt="London Map Placeholder"
                width={800}
                height={500}
                className="rounded-md shadow-md w-full h-auto"
                data-ai-hint="london boroughs map outline"
              />
              <p className="text-sm text-muted-foreground mt-2 text-center">
                This image is a placeholder. In a real application, this would be a fully interactive map.
                Please select a region from the list below to view details.
              </p>
            </CardContent>
          </Card>

           <Card className="shadow-xl animate-fadeIn bg-card" style={{animationDelay: '0.5s'}}>
            <CardHeader>
              <CardTitle className="font-headline text-xl">Select Region ({filteredRegions.length} results)</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredRegions.map((region) => (
                <Button
                  key={region.id}
                  variant="outline"
                  className={`p-4 h-auto text-left flex flex-col items-start justify-start border-2 transition-all duration-200 ${getRegionColorClass(region.priceCategory)} ${selectedRegion?.id === region.id ? 'ring-2 ring-offset-2 ring-primary scale-105' : 'hover:scale-105'}`}
                  onClick={() => handleRegionSelect(region.id)}
                  disabled={regionInsightsMutation.isPending && selectedRegion?.id === region.id}
                >
                  <span className="font-bold text-sm text-foreground">{region.id}</span>
                  <span className="text-xs text-muted-foreground block truncate w-full">{region.name.split(',')[0]}</span>
                  <span className="text-xs mt-1 text-foreground/80">£{region.avgPrice.toLocaleString()}</span>
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
                {regionInsightsMutation.isPending && (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="ml-2 text-muted-foreground">Loading AI insights...</p>
                  </div>
                )}
                {regionInsightsMutation.isSuccess && regionInsightsMutation.data && (
                  <div>
                    <h4 className="font-semibold text-lg mb-2 font-headline flex items-center text-primary">
                      <TrendingUp className="mr-2 h-5 w-5 text-accent" /> AI Insights
                    </h4>
                    <p className="text-foreground/90 bg-accent/10 p-4 rounded-md border border-accent/30">{regionInsightsMutation.data.summary}</p>
                  </div>
                )}
                 {regionInsightsMutation.isError && (
                  <div className="flex items-center text-muted-foreground p-4 border border-dashed rounded-md bg-destructive/10 border-destructive/30">
                     <AlertTriangle className="mr-2 h-5 w-5 text-destructive" />
                     <span>Could not load AI insights for this region.</span>
                   </div>
                 )}
                <div>
                  <h4 className="font-semibold text-lg mb-2 font-headline flex items-center text-primary">
                    <BarChartIcon className="mr-2 h-5 w-5 text-primary" /> Price Chart (Illustrative)
                  </h4>
                  <div className="bg-muted/50 p-4 rounded-md text-center">
                     <Image
                        src={`https://placehold.co/600x300.png`}
                        alt={`Price chart for ${selectedRegion.id}`}
                        width={600}
                        height={300}
                        className="rounded-md mx-auto shadow-md"
                        data-ai-hint="graph price trend"
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
