"use client";

import { useState, useMemo, useEffect, type ChangeEvent } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import PageHero from '@/components/shared/PageHero';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { 
  sampleProperties, 
  type Property, 
  propertyTypeOptions, 
  bedroomOptions, 
  regionOptions as allRegionOptions,
  energyRatingOptions,
  tenureOptions,
  bathroomOptions,
  receptionOptions
} from '@/lib/data/properties_data';
import { DollarSign, Home, BedDouble, Search, MapPin, ListFilter, Bath, Sofa, Zap, FileText, Tv2 } from 'lucide-react'; // Added Bath, Sofa, Zap, FileText, Tv2

type RecommendationFilters = {
  maxPrice?: number;
  propertyType?: Property['type'];
  region?: string;
  bedrooms?: number;
  bathrooms?: number;
  receptionRooms?: number;
  tenure?: Property['tenure'];
  energyRating?: Property['energyRating'];
};

const MAX_POSSIBLE_PRICE = Math.max(...sampleProperties.map(p => p.price), 5000000);
const MIN_POSSIBLE_PRICE = Math.min(...sampleProperties.map(p => p.price), 100000);

export default function RecommendationsPage() {
  const searchParams = useSearchParams();
  const initialRegion = searchParams.get('region');

  const [filters, setFilters] = useState<RecommendationFilters>({
    maxPrice: MAX_POSSIBLE_PRICE,
    region: initialRegion || undefined,
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (initialRegion) {
      setFilters(prev => ({ ...prev, region: initialRegion }));
    }
  }, [initialRegion]);

  const filteredProperties = useMemo(() => {
    return sampleProperties.filter(property => {
      if (filters.maxPrice && property.price > filters.maxPrice) return false;
      if (filters.propertyType && property.type !== filters.propertyType) return false;
      if (filters.region && property.region !== filters.region) return false;
      if (filters.bedrooms && property.bedrooms < filters.bedrooms) return false;
      if (filters.bathrooms && property.bathrooms < filters.bathrooms) return false;
      if (filters.receptionRooms && property.receptionRooms < filters.receptionRooms) return false;
      if (filters.tenure && property.tenure !== filters.tenure) return false;
      if (filters.energyRating && property.energyRating !== filters.energyRating) return false;
      if (searchTerm && !`${property.name} ${property.address} ${property.description}`.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });
  }, [filters, searchTerm]);

  const handleFilterChange = (key: keyof RecommendationFilters, value: any) => {
    let processedValue = value;
    if (value === 'all' || value === '') {
      processedValue = undefined;
    } else if ((key === 'bedrooms' || key === 'bathrooms' || key === 'receptionRooms') && typeof value === 'string') {
      processedValue = parseInt(value);
    }
    setFilters(prev => ({ ...prev, [key]: processedValue }));
  };
  
  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  return (
    <div className="space-y-12">
      <PageHero
        title="Suitable Property Recommendations"
        description="Find your ideal London property based on your budget and requirements. Explore our curated list."
      />

      <Card className="shadow-xl animate-fadeIn" style={{animationDelay: '0.2s'}}>
        <CardHeader>
          <CardTitle className="font-headline text-xl flex items-center"><ListFilter className="mr-2 h-5 w-5 text-primary"/>Search Filters</CardTitle>
          <CardDescription>Refine your criteria to find your dream home.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
            <div>
              <label htmlFor="maxPriceFilterRec" className="block text-sm font-medium text-foreground mb-1">Max Price (£)</label>
              <Slider
                id="maxPriceFilterRec"
                value={[filters.maxPrice || MAX_POSSIBLE_PRICE]}
                max={MAX_POSSIBLE_PRICE}
                min={MIN_POSSIBLE_PRICE}
                step={50000}
                onValueChange={(value) => handleFilterChange('maxPrice', value[0])}
              />
              <div className="text-xs text-muted-foreground mt-1 text-right">
                £{(filters.maxPrice || MAX_POSSIBLE_PRICE).toLocaleString()}
              </div>
            </div>
            <div>
              <label htmlFor="propertyTypeFilterRec" className="block text-sm font-medium text-foreground mb-1">Property Type</label>
              <Select onValueChange={(value) => handleFilterChange('propertyType', value)} value={filters.propertyType || 'all'}>
                <SelectTrigger id="propertyTypeFilterRec">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  {propertyTypeOptions.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="regionFilterRec" className="block text-sm font-medium text-foreground mb-1">Region (Outcode)</label>
              <Select onValueChange={(value) => handleFilterChange('region', value)} value={filters.region || 'all'}>
                <SelectTrigger id="regionFilterRec">
                  <SelectValue placeholder="All regions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All regions</SelectItem>
                  {allRegionOptions.map(region => <SelectItem key={region} value={region}>{region}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="bedroomsFilterRec" className="block text-sm font-medium text-foreground mb-1">Min. Bedrooms</label>
              <Select onValueChange={(value) => handleFilterChange('bedrooms', value)} value={filters.bedrooms?.toString() || 'all'}>
                <SelectTrigger id="bedroomsFilterRec">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any</SelectItem>
                  {bedroomOptions.map(num => <SelectItem key={num} value={String(num)}>{num}+ beds</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="bathroomsFilterRec" className="block text-sm font-medium text-foreground mb-1">Min. Bathrooms</label>
              <Select onValueChange={(value) => handleFilterChange('bathrooms', value)} value={filters.bathrooms?.toString() || 'all'}>
                <SelectTrigger id="bathroomsFilterRec">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any</SelectItem>
                  {bathroomOptions.map(num => <SelectItem key={num} value={String(num)}>{num}+ baths</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
             <div>
              <label htmlFor="receptionFilterRec" className="block text-sm font-medium text-foreground mb-1">Min. Receptions</label>
              <Select onValueChange={(value) => handleFilterChange('receptionRooms', value)} value={filters.receptionRooms?.toString() || 'all'}>
                <SelectTrigger id="receptionFilterRec">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any</SelectItem>
                  {receptionOptions.map(num => <SelectItem key={num} value={String(num)}>{num}+ rooms</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
             <div>
              <label htmlFor="tenureFilterRec" className="block text-sm font-medium text-foreground mb-1">Tenure</label>
              <Select onValueChange={(value) => handleFilterChange('tenure', value)} value={filters.tenure || 'all'}>
                <SelectTrigger id="tenureFilterRec">
                  <SelectValue placeholder="Any tenure" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any tenure</SelectItem>
                  {tenureOptions.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="energyRatingFilterRec" className="block text-sm font-medium text-foreground mb-1">Energy Rating</label>
              <Select onValueChange={(value) => handleFilterChange('energyRating', value)} value={filters.energyRating || 'all'}>
                <SelectTrigger id="energyRatingFilterRec">
                  <SelectValue placeholder="Any rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any rating</SelectItem>
                  {energyRatingOptions.map(rating => <SelectItem key={rating} value={rating}>Rating {rating}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <label htmlFor="searchTermRec" className="block text-sm font-medium text-foreground mb-1">Keyword Search</label>
            <Input 
              id="searchTermRec" 
              placeholder="e.g., near park, balcony, victorian..." 
              value={searchTerm}
              onChange={handleSearchChange}
              className="bg-card"
            />
          </div>
        </CardContent>
      </Card>

      <div className="animate-fadeIn" style={{animationDelay: '0.4s'}}>
        <h2 className="text-2xl font-headline font-semibold mb-6 text-foreground">
          {filteredProperties.length} propert{filteredProperties.length === 1 ? 'y' : 'ies'} found
        </h2>
        {filteredProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProperties.map((property) => (
              <Card key={property.id} className="overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col bg-card">
                <CardHeader className="p-0 relative">
                  <Image 
                    src={property.image} 
                    alt={property.name} 
                    width={600} 
                    height={400} 
                    className="w-full h-56 object-cover"
                    data-ai-hint={property.dataAiHint || 'house exterior'}
                  />
                   <div className="absolute top-2 right-2 bg-primary/80 text-primary-foreground px-2 py-1 rounded-md text-xs font-semibold backdrop-blur-sm">
                    {property.region}
                  </div>
                  <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded-md text-xs font-semibold backdrop-blur-sm flex items-center">
                    <Zap size={12} className="mr-1 text-yellow-400" /> Energy Rating: {property.energyRating}
                  </div>
                </CardHeader>
                <CardContent className="p-6 flex-grow">
                  <CardTitle className="font-headline text-xl mb-2 text-primary hover:underline cursor-pointer">{property.name}</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground mb-2 flex items-center">
                    <MapPin size={14} className="mr-1.5 flex-shrink-0" /> {property.address}
                  </CardDescription>
                  <div className="text-sm text-muted-foreground mb-3 space-y-1">
                    <div className="flex items-center"><Home size={14} className="mr-1.5" /> {property.type} - {property.tenure}</div>
                    <div className="flex items-center"><BedDouble size={14} className="mr-1.5" /> {property.bedrooms} bed{property.bedrooms > 1 ? 's':'_short'}</div>
                    <div className="flex items-center"><Bath size={14} className="mr-1.5" /> {property.bathrooms} bath{property.bathrooms > 1 ? 's':'_short'}</div>
                    <div className="flex items-center"><Tv2 size={14} className="mr-1.5" /> {property.receptionRooms} reception{property.receptionRooms > 1 ? 's':'_short'}</div>
                    {property.area && <div className="flex items-center"><Home size={14} className="mr-1.5" /> {property.area} m²</div>}
                  </div>
                  <p className="text-foreground/90 text-sm mb-4 line-clamp-3">{property.description}</p>
                </CardContent>
                <CardFooter className="p-6 bg-muted/20 border-t">
                  <div className="flex justify-between items-center w-full">
                    <p className="text-2xl font-bold text-primary flex items-center">
                      £{property.price.toLocaleString()}
                    </p>
                    <Button variant="default">View Details</Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Search size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-xl text-muted-foreground">No properties found matching your criteria.</p>
            <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters or broadening your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
