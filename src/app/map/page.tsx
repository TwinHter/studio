"use client";

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import PageHero from '@/components/shared/PageHero';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { londonOutcodes, type OutcodeData } from '@/lib/data/london_outcodes_data';
import { getRegionPriceInsights, type RegionPriceInsightsOutput } from '@/ai/flows/region-insights';
import { MapPin, Search, Home, Loader2, AlertTriangle, TrendingUp, BarChartIcon } from 'lucide-react';
import { propertyTypes as propertyTypeOptions, bedroomOptions } from '@/lib/data/properties_data';
import { useToast } from '@/hooks/use-toast';

type RegionFilters = {
  propertyType?: string;
  priceRange?: [number, number];
  bedrooms?: number;
};

export default function MapInteractionPage() {
  const [selectedRegion, setSelectedRegion] = useState<OutcodeData | null>(null);
  const [regionInsights, setRegionInsights] = useState<RegionPriceInsightsOutput | null>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [filters, setFilters] = useState<RegionFilters>({});
  const { toast } = useToast();

  const MIN_PRICE = 100000;
  const MAX_PRICE = 5000000;

  useEffect(() => {
    // Set initial price range for slider display
    setFilters(prev => ({ ...prev, priceRange: [MIN_PRICE, MAX_PRICE] }));
  }, []);


  const filteredRegions = useMemo(() => {
    // This is a placeholder for actual filtering logic based on filters.
    // For now, it returns all regions, filtered by the mock avgPrice if priceRange is set.
    return londonOutcodes.filter(region => {
      if (filters.priceRange && (region.avgPrice < filters.priceRange[0] || region.avgPrice > filters.priceRange[1])) {
        return false;
      }
      // Add other filter conditions here if propertyType and bedrooms were part of OutcodeData or linked
      return true;
    });
  }, [filters]);

  const handleRegionSelect = async (regionId: string) => {
    const region = londonOutcodes.find(r => r.id === regionId);
    if (region) {
      setSelectedRegion(region);
      setIsLoadingInsights(true);
      setRegionInsights(null);
      try {
        const insights = await getRegionPriceInsights({ region: region.id });
        setRegionInsights(insights);
      } catch (error) {
        console.error("Error fetching region insights:", error);
        toast({
          title: "Error",
          description: "Could not fetch insights for this region.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingInsights(false);
      }
    }
  };

  const getRegionColorClass = (priceCategory: OutcodeData['priceCategory']) => {
    switch (priceCategory) {
      case 'low': return 'bg-green-500/20 border-green-500 hover:bg-green-500/30';
      case 'medium': return 'bg-yellow-500/20 border-yellow-500 hover:bg-yellow-500/30';
      case 'high': return 'bg-red-500/20 border-red-500 hover:bg-red-500/30';
      default: return 'bg-muted hover:bg-muted/80';
    }
  };
  
  return (
    <div className="space-y-12">
      <PageHero
        title="Bản đồ Tương tác London"
        description="Khám phá các khu vực của London, xem thông tin chi tiết về giá và nhận định từ AI. Lọc theo tiêu chí của bạn để tìm khu vực phù hợp."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 shadow-xl animate-fadeIn h-fit sticky top-24" style={{animationDelay: '0.2s'}}>
          <CardHeader>
            <CardTitle className="font-headline text-xl flex items-center"><Search className="mr-2 h-5 w-5 text-primary"/>Bộ lọc Khu vực</CardTitle>
            <CardDescription>Tinh chỉnh tìm kiếm của bạn.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label htmlFor="propertyTypeFilterMap" className="block text-sm font-medium text-foreground mb-1">Loại nhà (Minh họa)</label>
              <Select onValueChange={(value) => setFilters(prev => ({ ...prev, propertyType: value === 'all' ? undefined : value }))}>
                <SelectTrigger id="propertyTypeFilterMap">
                  <SelectValue placeholder="Tất cả loại nhà" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả loại nhà</SelectItem>
                  {propertyTypeOptions.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="bedroomsFilterMap" className="block text-sm font-medium text-foreground mb-1">Số phòng (Minh họa)</label>
               <Select onValueChange={(value) => setFilters(prev => ({ ...prev, bedrooms: value === 'any' ? undefined : parseInt(value) }))}>
                <SelectTrigger id="bedroomsFilterMap">
                  <SelectValue placeholder="Bất kỳ số phòng" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Bất kỳ số phòng</SelectItem>
                  {bedroomOptions.map(num => <SelectItem key={num} value={String(num)}>{num} phòng</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Khoảng giá trung bình (£)</label>
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
            <p className="text-xs text-muted-foreground">Lưu ý: Bộ lọc loại nhà và số phòng chỉ mang tính minh họa cho giao diện này.</p>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-8">
          <Card className="shadow-xl animate-fadeIn" style={{animationDelay: '0.4s'}}>
            <CardHeader>
              <CardTitle className="font-headline text-xl flex items-center"><MapPin className="mr-2 h-5 w-5 text-primary"/>Bản đồ London (Outcodes)</CardTitle>
            </CardHeader>
            <CardContent>
              <Image 
                src="https://placehold.co/800x500.png?text=London+Map+Placeholder" 
                alt="Bản đồ London Placeholder" 
                width={800} 
                height={500} 
                className="rounded-md shadow-md w-full h-auto"
                data-ai-hint="london map"
              />
              <p className="text-sm text-muted-foreground mt-2 text-center">
                Hình ảnh này là placeholder. Trong ứng dụng thực tế, đây sẽ là bản đồ tương tác.
                Vui lòng chọn một khu vực từ danh sách bên dưới để xem chi tiết.
              </p>
            </CardContent>
          </Card>

           <Card className="shadow-xl animate-fadeIn" style={{animationDelay: '0.5s'}}>
            <CardHeader>
              <CardTitle className="font-headline text-xl">Chọn Khu vực ({filteredRegions.length} kết quả)</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredRegions.map((region) => (
                <Button
                  key={region.id}
                  variant="outline"
                  className={`p-4 h-auto text-left flex flex-col items-start justify-start border-2 transition-all duration-200 ${getRegionColorClass(region.priceCategory)} ${selectedRegion?.id === region.id ? 'ring-2 ring-offset-2 ring-primary scale-105' : 'hover:scale-105'}`}
                  onClick={() => handleRegionSelect(region.id)}
                >
                  <span className="font-bold text-sm text-foreground">{region.id}</span>
                  <span className="text-xs text-muted-foreground block truncate w-full">{region.name.split(',')[0]}</span>
                  <span className="text-xs mt-1 text-foreground/80">£{region.avgPrice.toLocaleString()}</span>
                </Button>
              ))}
               {filteredRegions.length === 0 && <p className="col-span-full text-center text-muted-foreground">Không có khu vực nào khớp với bộ lọc.</p>}
            </CardContent>
          </Card>

          {selectedRegion && (
            <Card className="shadow-xl animate-fadeIn" style={{animationDelay: '0.6s'}} id="region-details">
              <CardHeader>
                <CardTitle className="font-headline text-2xl flex items-center">
                  <MapPin className="mr-2 h-6 w-6 text-primary" />
                  {selectedRegion.name} ({selectedRegion.id})
                </CardTitle>
                <CardDescription>Giá trung bình hiện tại: £{selectedRegion.avgPrice.toLocaleString()}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingInsights && (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="ml-2 text-muted-foreground">Đang tải nhận định AI...</p>
                  </div>
                )}
                {regionInsights && !isLoadingInsights && (
                  <div>
                    <h4 className="font-semibold text-lg mb-2 font-headline flex items-center">
                      <TrendingUp className="mr-2 h-5 w-5 text-accent" /> Nhận định từ AI
                    </h4>
                    <p className="text-foreground/90 bg-accent/10 p-4 rounded-md border border-accent/30">{regionInsights.summary}</p>
                  </div>
                )}
                 {!isLoadingInsights && !regionInsights && (
                  <div className="flex items-center text-muted-foreground p-4 border border-dashed rounded-md bg-destructive/10 border-destructive/30">
                     <AlertTriangle className="mr-2 h-5 w-5 text-destructive" />
                     <span>Không thể tải nhận định AI cho khu vực này.</span>
                   </div>
                 )}
                <div>
                  <h4 className="font-semibold text-lg mb-2 font-headline flex items-center">
                    <BarChartIcon className="mr-2 h-5 w-5 text-primary" /> Biểu đồ giá (Minh họa)
                  </h4>
                  <div className="bg-muted p-4 rounded-md text-center">
                     <Image 
                        src={`https://placehold.co/600x300.png?text=Price+Chart+${selectedRegion.id}`}
                        alt={`Biểu đồ giá cho ${selectedRegion.id}`}
                        width={600}
                        height={300}
                        className="rounded-md mx-auto shadow-md"
                        data-ai-hint="graph price"
                      />
                    <p className="text-sm text-muted-foreground mt-2">Biểu đồ minh họa xu hướng giá cho {selectedRegion.id}.</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Link href={`/recommendations?region=${selectedRegion.id}`}>
                    <Home className="mr-2 h-4 w-4"/> Xem nhà phù hợp ở {selectedRegion.id}
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
