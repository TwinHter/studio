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
import { sampleProperties, type Property, propertyTypes, bedroomOptions, regionOptions as allRegionOptions } from '@/lib/data/properties_data';
import { DollarSign, Home, BedDouble, Search, MapPin, ListFilter } from 'lucide-react';

type RecommendationFilters = {
  maxPrice?: number;
  propertyType?: Property['type'];
  region?: string;
  bedrooms?: number;
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
      if (searchTerm && !`${property.name} ${property.address} ${property.description}`.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });
  }, [filters, searchTerm]);

  const handleFilterChange = (key: keyof RecommendationFilters, value: any) => {
    let processedValue = value;
    if (value === 'all' || value === '') {
      processedValue = undefined;
    } else if (key === 'bedrooms' && typeof value === 'string') {
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
        title="Gợi ý Căn nhà Phù hợp"
        description="Tìm kiếm bất động sản lý tưởng tại London dựa trên ngân sách và yêu cầu của bạn. Khám phá danh sách được tuyển chọn của chúng tôi."
      />

      <Card className="shadow-xl animate-fadeIn" style={{animationDelay: '0.2s'}}>
        <CardHeader>
          <CardTitle className="font-headline text-xl flex items-center"><ListFilter className="mr-2 h-5 w-5 text-primary"/>Bộ lọc Tìm kiếm</CardTitle>
          <CardDescription>Tinh chỉnh các tiêu chí để tìm căn nhà mơ ước của bạn.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
            <div>
              <label htmlFor="maxPriceFilterRec" className="block text-sm font-medium text-foreground mb-1">Giá tối đa (£)</label>
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
              <label htmlFor="propertyTypeFilterRec" className="block text-sm font-medium text-foreground mb-1">Loại nhà</label>
              <Select onValueChange={(value) => handleFilterChange('propertyType', value)} value={filters.propertyType || 'all'}>
                <SelectTrigger id="propertyTypeFilterRec">
                  <SelectValue placeholder="Tất cả loại nhà" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả loại nhà</SelectItem>
                  {propertyTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="regionFilterRec" className="block text-sm font-medium text-foreground mb-1">Khu vực (Outcode)</label>
              <Select onValueChange={(value) => handleFilterChange('region', value)} value={filters.region || 'all'}>
                <SelectTrigger id="regionFilterRec">
                  <SelectValue placeholder="Tất cả khu vực" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả khu vực</SelectItem>
                  {allRegionOptions.map(region => <SelectItem key={region} value={region}>{region}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="bedroomsFilterRec" className="block text-sm font-medium text-foreground mb-1">Số phòng ngủ (tối thiểu)</label>
              <Select onValueChange={(value) => handleFilterChange('bedrooms', value)} value={filters.bedrooms?.toString() || 'all'}>
                <SelectTrigger id="bedroomsFilterRec">
                  <SelectValue placeholder="Bất kỳ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Bất kỳ</SelectItem>
                  {bedroomOptions.map(num => <SelectItem key={num} value={String(num)}>{num}+ phòng</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <label htmlFor="searchTermRec" className="block text-sm font-medium text-foreground mb-1">Tìm kiếm từ khóa</label>
            <Input 
              id="searchTermRec" 
              placeholder="Ví dụ: gần công viên, ban công, victorian..." 
              value={searchTerm}
              onChange={handleSearchChange}
              className="bg-card"
            />
          </div>
        </CardContent>
      </Card>

      <div className="animate-fadeIn" style={{animationDelay: '0.4s'}}>
        <h2 className="text-2xl font-headline font-semibold mb-6 text-foreground">
          {filteredProperties.length} bất động sản được tìm thấy
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
                    className="w-full h-56 object-cover" // Increased height
                    data-ai-hint={property.dataAiHint || 'house exterior'}
                  />
                   <div className="absolute top-2 right-2 bg-primary/80 text-primary-foreground px-2 py-1 rounded-md text-xs font-semibold backdrop-blur-sm">
                    {property.region}
                  </div>
                </CardHeader>
                <CardContent className="p-6 flex-grow">
                  <CardTitle className="font-headline text-xl mb-2 text-primary hover:underline cursor-pointer">{property.name}</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground mb-1 flex items-center">
                    <MapPin size={14} className="mr-1.5 flex-shrink-0" /> {property.address}
                  </CardDescription>
                  <div className="flex items-center text-sm text-muted-foreground mb-3 flex-wrap">
                    <span className="flex items-center mr-3"><Home size={14} className="mr-1.5" /> {property.type}</span>
                    <span className="flex items-center"><BedDouble size={14} className="mr-1.5" /> {property.bedrooms} phòng ngủ</span>
                    {property.area && <span className="flex items-center ml-3">{property.area} m²</span>}
                  </div>
                  <p className="text-foreground/90 text-sm mb-4 line-clamp-3">{property.description}</p>
                </CardContent>
                <CardFooter className="p-6 bg-muted/20 border-t">
                  <div className="flex justify-between items-center w-full">
                    <p className="text-2xl font-bold text-primary flex items-center">
                      <DollarSign size={20} className="mr-1" />{property.price.toLocaleString()}
                    </p>
                    <Button variant="default">Xem chi tiết</Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Search size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-xl text-muted-foreground">Không tìm thấy bất động sản nào phù hợp với tiêu chí của bạn.</p>
            <p className="text-sm text-muted-foreground mt-2">Hãy thử điều chỉnh bộ lọc hoặc mở rộng tìm kiếm.</p>
          </div>
        )}
      </div>
    </div>
  );
}

