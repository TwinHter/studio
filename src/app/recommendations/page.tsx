
"use client";

import { useState, useMemo, useEffect, type ChangeEvent, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import PageHero from '@/components/shared/PageHero';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
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
import type { PropertyType, EnergyRating, Tenure } from '@/lib/data/properties_data';
import { DollarSign, Home, BedDouble, Search, MapPin, ListFilter, Bath, Sofa, Zap, FileText, Tv2, Contact, UploadCloud, User, MailIcon, Building2, Coins, CalendarDays, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const uploadPropertyFormSchema = z.object({
  // Property Details
  name: z.string().min(5, "Property name must be at least 5 characters."),
  address: z.string().min(10, "Address must be at least 10 characters."),
  price: z.coerce.number().positive("Price must be a positive number."),
  type: z.enum(propertyTypeOptions as [PropertyType, ...PropertyType[]], { required_error: "Property type is required." }),
  bedrooms: z.coerce.number().int().min(0, "Bedrooms must be 0 or more."),
  bathrooms: z.coerce.number().int().min(0, "Bathrooms must be 0 or more."),
  receptionRooms: z.coerce.number().int().min(0, "Reception rooms must be 0 or more."),
  area: z.coerce.number().positive("Area must be a positive number.").optional(),
  energyRating: z.enum(energyRatingOptions as [EnergyRating, ...EnergyRating[]], { required_error: "Energy rating is required." }),
  tenure: z.enum(tenureOptions as [Tenure, ...Tenure[]], { required_error: "Tenure is required." }),
  region: z.enum(allRegionOptions as [string, ...string[]], { required_error: "Region is required." }),
  description: z.string().min(20, "Description must be at least 20 characters.").max(500, "Description cannot exceed 500 characters."),
  imageFile: z
    .custom<FileList>()
    .refine((files) => files && files.length === 1, "Property image is required.")
    .refine((files) => files && files?.[0]?.size <= MAX_FILE_SIZE_BYTES, `Max image size is ${MAX_FILE_SIZE_MB}MB.`)
    .refine(
      (files) => files && ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      "Only .jpg, .jpeg, .png and .webp formats are supported."
    ),
  // User Details
  uploaderName: z.string().min(2, "Your name must be at least 2 characters."),
  uploaderEmail: z.string().email("Please enter a valid email address."),
});

type UploadPropertyFormValues = z.infer<typeof uploadPropertyFormSchema>;


export default function RecommendationsPage() {
  const searchParams = useSearchParams();
  const initialRegion = searchParams.get('region');
  const { toast } = useToast();

  const [displayedProperties, setDisplayedProperties] = useState<Property[]>(sampleProperties);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const uploadSectionRef = useRef<HTMLDivElement>(null);

  const [filters, setFilters] = useState<RecommendationFilters>({
    maxPrice: MAX_POSSIBLE_PRICE,
    region: initialRegion || undefined,
  });
  const [searchTerm, setSearchTerm] = useState('');

  const uploadForm = useForm<UploadPropertyFormValues>({
    resolver: zodResolver(uploadPropertyFormSchema),
    defaultValues: {
      name: "",
      address: "",
      price: undefined,
      type: undefined,
      bedrooms: 1,
      bathrooms: 1,
      receptionRooms: 1,
      area: undefined,
      energyRating: undefined,
      tenure: undefined,
      region: undefined,
      description: "",
      imageFile: undefined,
      uploaderName: "",
      uploaderEmail: "",
    },
  });

  useEffect(() => {
    if (initialRegion) {
      setFilters(prev => ({ ...prev, region: initialRegion }));
    }
  }, [initialRegion]);

  useEffect(() => {
    if (showUploadForm && uploadSectionRef.current) {
      uploadSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [showUploadForm]);

  const filteredProperties = useMemo(() => {
    return displayedProperties.filter(property => {
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
  }, [filters, searchTerm, displayedProperties]);

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

  const handleFileUploadSubmit: SubmitHandler<UploadPropertyFormValues> = async (data) => {
    const imageFile = data.imageFile[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      const imageAsDataUrl = reader.result as string;
      const newProperty: Property = {
        id: Date.now().toString(), // Simple unique ID
        name: data.name,
        address: data.address,
        price: data.price,
        type: data.type,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        receptionRooms: data.receptionRooms,
        area: data.area,
        energyRating: data.energyRating,
        tenure: data.tenure,
        region: data.region,
        description: data.description,
        image: imageAsDataUrl,
        dataAiHint: "uploaded property", // Generic hint for uploaded images
      };

      setDisplayedProperties(prev => [newProperty, ...prev]);
      toast({
        title: "Property Uploaded",
        description: `${data.name} has been added to the listings. (Uploaded by ${data.uploaderName})`,
      });
      uploadForm.reset();
      setShowUploadForm(false); // Close form on successful upload
    };

    reader.onerror = () => {
      toast({
        title: "Image Upload Failed",
        description: "Could not process the image file. Please try again.",
        variant: "destructive",
      });
    };
    
    reader.readAsDataURL(imageFile);
  };


  return (
    <div className="space-y-12">
      <PageHero
        title="Suitable Property Recommendations"
        description="Find your ideal London property based on your budget and requirements. Explore our curated list or upload your own."
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

      <div className="my-8 text-center animate-fadeIn" style={{animationDelay: '0.2s'}}>
        {!showUploadForm && (
          <Button onClick={() => setShowUploadForm(true)} size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10 hover:text-primary">
            <UploadCloud className="mr-2 h-5 w-5" /> List Your Property
          </Button>
        )}
      </div>

      {showUploadForm && (
        <div ref={uploadSectionRef}>
          <Card className="shadow-xl animate-fadeIn mb-12" style={{ animationDelay: '0.1s' }}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="font-headline text-xl flex items-center"><UploadCloud className="mr-2 h-5 w-5 text-primary" />Upload New Property Listing</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setShowUploadForm(false)} aria-label="Close upload form">
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <CardDescription>Contribute to our listings by adding property information.</CardDescription>
            </CardHeader>
            <Form {...uploadForm}>
              <form onSubmit={uploadForm.handleSubmit(handleFileUploadSubmit)}>
                <CardContent className="space-y-6">
                  <h3 className="text-lg font-semibold text-foreground border-b pb-2">Property Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={uploadForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center"><Home className="mr-2 h-4 w-4 text-muted-foreground" />Property Name</FormLabel>
                          <FormControl><Input placeholder="e.g., Modern City Apartment" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={uploadForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center"><MapPin className="mr-2 h-4 w-4 text-muted-foreground" />Full Address</FormLabel>
                          <FormControl><Input placeholder="e.g., 123 Main St, London, E1 1AB" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={uploadForm.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center"><Coins className="mr-2 h-4 w-4 text-muted-foreground" />Price (£)</FormLabel>
                          <FormControl><Input type="number" placeholder="e.g., 500000" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={uploadForm.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center"><Building2 className="mr-2 h-4 w-4 text-muted-foreground" />Property Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                            <SelectContent>
                              {propertyTypeOptions.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={uploadForm.control}
                      name="region"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center"><MapPin className="mr-2 h-4 w-4 text-muted-foreground" />Region (Outcode)</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select region" /></SelectTrigger></FormControl>
                            <SelectContent>
                              {allRegionOptions.map(region => <SelectItem key={region} value={region}>{region}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <FormField
                      control={uploadForm.control}
                      name="bedrooms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center"><BedDouble className="mr-2 h-4 w-4 text-muted-foreground" />Bedrooms</FormLabel>
                          <FormControl><Input type="number" placeholder="e.g., 2" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={uploadForm.control}
                      name="bathrooms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center"><Bath className="mr-2 h-4 w-4 text-muted-foreground" />Bathrooms</FormLabel>
                          <FormControl><Input type="number" placeholder="e.g., 1" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={uploadForm.control}
                      name="receptionRooms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center"><Tv2 className="mr-2 h-4 w-4 text-muted-foreground" />Receptions</FormLabel>
                          <FormControl><Input type="number" placeholder="e.g., 1" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                        control={uploadForm.control}
                        name="area"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel className="flex items-center"><Home className="mr-2 h-4 w-4 text-muted-foreground"/>Area (sqm)</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="e.g., 70 (optional)" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))} value={field.value ?? ""} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={uploadForm.control}
                      name="tenure"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center"><FileText className="mr-2 h-4 w-4 text-muted-foreground" />Tenure</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select tenure" /></SelectTrigger></FormControl>
                            <SelectContent>
                              {tenureOptions.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={uploadForm.control}
                      name="energyRating"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center"><Zap className="mr-2 h-4 w-4 text-muted-foreground" />Energy Rating</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select rating" /></SelectTrigger></FormControl>
                            <SelectContent>
                              {energyRatingOptions.map(rating => <SelectItem key={rating} value={rating}>Rating {rating}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={uploadForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl><Textarea placeholder="Detailed description of the property..." {...field} rows={4} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={uploadForm.control}
                    name="imageFile"
                    render={({ field: { onChange, value, ...rest } }) => (
                      <FormItem>
                        <FormLabel>Property Image</FormLabel>
                        <FormControl>
                          <Input 
                            type="file" 
                            accept="image/*" 
                            onChange={(e) => onChange(e.target.files)} 
                            {...rest} 
                            className="file:text-primary file:font-medium"
                          />
                        </FormControl>
                        <FormDescription>Max file size: {MAX_FILE_SIZE_MB}MB. Accepted formats: JPG, PNG, WEBP.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <h3 className="text-lg font-semibold text-foreground border-b pt-4 pb-2">Your Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={uploadForm.control}
                      name="uploaderName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center"><User className="mr-2 h-4 w-4 text-muted-foreground" />Your Name</FormLabel>
                          <FormControl><Input placeholder="e.g., John Doe" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={uploadForm.control}
                      name="uploaderEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center"><MailIcon className="mr-2 h-4 w-4 text-muted-foreground" />Your Email</FormLabel>
                          <FormControl><Input type="email" placeholder="e.g., john.doe@example.com" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={uploadForm.formState.isSubmitting} className="w-full">
                    {uploadForm.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                    Upload Property
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </div>
      )}


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
                  <CardTitle className="font-headline text-xl mb-2 text-primary hover:underline">
                     <Link href={`/contact/${property.id}`}>{property.name}</Link>
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground mb-2 flex items-center">
                    <MapPin size={14} className="mr-1.5 flex-shrink-0" /> {property.address}
                  </CardDescription>
                  <div className="text-sm text-muted-foreground mb-3 space-y-1">
                    <div className="flex items-center"><Home size={14} className="mr-1.5" /> {property.type} - {property.tenure}</div>
                    <div className="flex items-center"><BedDouble size={14} className="mr-1.5" /> {property.bedrooms} bed{property.bedrooms > 1 ? 's': property.bedrooms === 1 ? '' : 's'}</div>
                    <div className="flex items-center"><Bath size={14} className="mr-1.5" /> {property.bathrooms} bath{property.bathrooms > 1 ? 's': property.bathrooms === 1 ? '' : 's'}</div>
                    <div className="flex items-center"><Tv2 size={14} className="mr-1.5" /> {property.receptionRooms} reception{property.receptionRooms > 1 ? 's': property.receptionRooms === 1 ? '' : 's'}</div>
                    {property.area && <div className="flex items-center"><Home size={14} className="mr-1.5" /> {property.area} m²</div>}
                  </div>
                  <p className="text-foreground/90 text-sm mb-4 line-clamp-3">{property.description}</p>
                </CardContent>
                <CardFooter className="p-6 bg-muted/20 border-t">
                  <div className="flex justify-between items-center w-full">
                    <p className="text-2xl font-bold text-primary flex items-center">
                      £{property.price.toLocaleString()}
                    </p>
                    <Button asChild>
                      <Link href={`/contact/${property.id}`}>
                        <Contact className="mr-2 h-4 w-4" /> Enquire
                      </Link>
                    </Button>
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

