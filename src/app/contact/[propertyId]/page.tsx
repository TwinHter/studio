
"use client";

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, notFound } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { fetchPropertyDetails, fetchSalesmanInfo } from '@/services/api';
import PageHero from '@/components/shared/PageHero';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Mail, Phone, MapPin, Home, ArrowLeft, UserCircle, Briefcase } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from '@/hooks/use-toast';

export default function ContactPropertyPage() {
  const params = useParams();
  const propertyId = params.propertyId as string;
  const { toast } = useToast();

  const { data: property, isLoading: isLoadingProperty, error: propertyError } = useQuery({
    queryKey: ['propertyDetails', propertyId],
    queryFn: () => fetchPropertyDetails(propertyId),
    enabled: !!propertyId, // Only run query if propertyId is available
  });

  const { data: salesman, isLoading: isLoadingSalesman, error: salesmanError } = useQuery({
    queryKey: ['salesmanInfo', propertyId], // Could be generic if salesman is always the same
    queryFn: () => fetchSalesmanInfo(propertyId),
    enabled: !!propertyId,
  });
  
  useEffect(() => {
    if (propertyError) {
      toast({ title: "Error", description: "Could not load property details.", variant: "destructive" });
    }
    if (salesmanError) {
      toast({ title: "Error", description: "Could not load contact information.", variant: "destructive" });
    }
  }, [propertyError, salesmanError, toast]);


  if (isLoadingProperty || isLoadingSalesman) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (!property) {
    // This will trigger the nearest not-found.js file or a default Next.js 404 page
    // Ensure you have a not-found.js in your app directory or handle this state explicitly
    notFound(); 
    return null; // Or a custom "Property not found" component
  }
  
  return (
    <div className="space-y-12">
      <PageHero
        title={`Enquire About: ${property.name}`}
        description={<span className="flex items-center justify-center"><MapPin size={16} className="mr-1.5" /> {property.address}</span>}
      />

      <div className="max-w-4xl mx-auto">
        <Button variant="outline" asChild className="mb-8 animate-fadeIn" style={{animationDelay: '0.1s'}}>
          <Link href="/recommendations">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Recommendations
          </Link>
        </Button>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="shadow-xl animate-fadeIn" style={{animationDelay: '0.2s'}}>
            <CardHeader>
              <CardTitle className="font-headline text-2xl flex items-center"><Home className="mr-2 h-6 w-6 text-primary"/>Property Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Image
                src={property.image}
                alt={property.name}
                width={600}
                height={400}
                className="rounded-lg object-cover w-full aspect-video shadow-md"
                data-ai-hint={property.dataAiHint || "house exterior"}
              />
              <div>
                <h3 className="font-semibold text-lg">{property.name}</h3>
                <p className="text-muted-foreground text-sm">{property.address}</p>
              </div>
              <p className="text-2xl font-bold text-primary">£{property.price.toLocaleString()}</p>
              <ul className="text-sm space-y-1 text-foreground/80">
                <li><strong>Type:</strong> {property.type}</li>
                <li><strong>Bedrooms:</strong> {property.bedrooms}</li>
                <li><strong>Bathrooms:</strong> {property.bathrooms}</li>
                <li><strong>Reception Rooms:</strong> {property.receptionRooms}</li>
                {property.area && <li><strong>Area:</strong> {property.area} m²</li>}
                <li><strong>Tenure:</strong> {property.tenure}</li>
                <li><strong>Energy Rating:</strong> {property.energyRating}</li>
              </ul>
            </CardContent>
          </Card>

          {salesman && (
            <Card className="shadow-xl animate-fadeIn" style={{animationDelay: '0.4s'}}>
              <CardHeader>
                <CardTitle className="font-headline text-2xl flex items-center"><UserCircle className="mr-2 h-6 w-6 text-primary"/>Your Contact Person</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={salesman.imageUrl} alt={salesman.name} data-ai-hint={salesman.dataAiHint || "professional portrait"} />
                    <AvatarFallback>{salesman.name.substring(0,2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">{salesman.name}</h3>
                    <p className="text-sm text-muted-foreground">Property Consultant</p>
                  </div>
                </div>
                <p className="text-foreground/80 text-sm flex items-start">
                  <Briefcase size={16} className="mr-2 mt-0.5 flex-shrink-0 text-primary" />
                  {salesman.bio}
                </p>
                <div className="space-y-2 pt-2 border-t">
                  <p className="flex items-center">
                    <Mail size={16} className="mr-2 text-primary" />
                    <a href={`mailto:${salesman.email}`} className="hover:underline text-accent-foreground hover:text-primary">
                      {salesman.email}
                    </a>
                  </p>
                  <p className="flex items-center">
                    <Phone size={16} className="mr-2 text-primary" />
                    <a href={`tel:${salesman.phone.replace(/\s/g, '')}`} className="hover:underline text-accent-foreground hover:text-primary">
                      {salesman.phone}
                    </a>
                  </p>
                </div>
                <Button className="w-full mt-4">
                  <Mail className="mr-2 h-4 w-4" /> Email {salesman.name.split(' ')[0]}
                </Button>
                 <p className="text-xs text-muted-foreground text-center">Please mention property ID: {property.id} when enquiring.</p>
              </CardContent>
            </Card>
          )}
           {!salesman && !isLoadingSalesman && (
             <Card className="shadow-xl animate-fadeIn" style={{animationDelay: '0.4s'}}>
                <CardHeader>
                    <CardTitle className="font-headline text-xl">Contact Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Contact details are currently unavailable. Please try again later.</p>
                </CardContent>
             </Card>
           )}
        </div>
      </div>
    </div>
  );
}
