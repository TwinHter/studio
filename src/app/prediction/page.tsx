
"use client";

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { fetchPricePrediction } from '@/services/api'; // Use the API service
import type { PredictionInput, PredictionOutput } from '@/ai/flows/price-prediction';
import PageHero from '@/components/shared/PageHero';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, TrendingUp, Home, Coins, LineChart as LineChartIcon, MapPin, Building2, Bath, Sofa, Zap, FileText, CalendarDays, Tv2 } from 'lucide-react';
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { useToast } from '@/hooks/use-toast';
import { propertyTypeOptions, energyRatingOptions, tenureOptions } from '@/lib/data/properties_data';
import type { PropertyType, EnergyRating, Tenure } from '@/lib/data/properties_data';

const predictionFormSchema = z.object({
  fullAddress: z.string().min(5, { message: 'Full address must be at least 5 characters.' }),
  outcode: z.string().min(2, { message: 'Outcode must be at least 2 characters (e.g., E1, SW1A).' }),
  longitude: z.coerce.number().optional(),
  latitude: z.coerce.number().optional(),
  bedrooms: z.coerce.number().int().min(0, { message: 'Must be 0 or more bedrooms.' }).max(10, { message: 'Cannot exceed 10 bedrooms.' }),
  bathrooms: z.coerce.number().int().min(0, { message: 'Must be 0 or more bathrooms.' }).max(10, { message: 'Cannot exceed 10 bathrooms.' }),
  receptionRooms: z.coerce.number().int().min(0, { message: 'Must be 0 or more reception rooms.' }).max(10, { message: 'Cannot exceed 10 reception rooms.' }),
  area: z.coerce.number().positive({ message: 'Area must be a positive number.' }),
  tenure: z.enum(tenureOptions as [Tenure, ...Tenure[]], { required_error: 'Tenure is required.' }),
  propertyType: z.enum(propertyTypeOptions as [PropertyType, ...PropertyType[]], { required_error: 'Property type is required.' }),
  currentEnergyRating: z.enum(energyRatingOptions as [EnergyRating, ...EnergyRating[]], { required_error: 'Energy rating is required.' }),
  monthOfSale: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, { message: 'Month of sale must be in YYYY-MM format (e.g., 2024-07).' }),
});

type PredictionFormValues = z.infer<typeof predictionFormSchema>;

export default function PredictionPage() {
  const [predictionResult, setPredictionResult] = useState<PredictionOutput | null>(null);
  const { toast } = useToast();
  const currentYear = new Date().getFullYear();
  const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');

  const form = useForm<PredictionFormValues>({
    resolver: zodResolver(predictionFormSchema),
    defaultValues: {
      fullAddress: '',
      outcode: '',
      longitude: undefined,
      latitude: undefined,
      bedrooms: 1,
      bathrooms: 1,
      receptionRooms: 1,
      area: undefined,
      tenure: undefined,
      propertyType: undefined,
      currentEnergyRating: undefined,
      monthOfSale: `${currentYear}-${currentMonth}`,
    },
  });

  const mutation = useMutation({
    mutationFn: fetchPricePrediction,
    onSuccess: (data, variables) => {
      setPredictionResult(data);
      toast({
        title: "Prediction Successful",
        description: `Price predicted for property at ${variables.fullAddress.substring(0,30)}...`,
      });
    },
    onError: (error) => {
      console.error('Prediction failed:', error);
      toast({
        title: "Prediction Failed",
        description: "Could not retrieve prediction. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit: SubmitHandler<PredictionFormValues> = (data) => {
    setPredictionResult(null); // Clear previous results
    const inputData: PredictionInput = {
      ...data,
      ...(data.longitude && { longitude: data.longitude }),
      ...(data.latitude && { latitude: data.latitude }),
    };
    mutation.mutate(inputData);
  };

  const chartConfig: ChartConfig = {
    price: {
      label: "Price (£)",
      color: "hsl(var(--primary))",
    },
  } satisfies ChartConfig;

  return (
    <div className="space-y-12">
      <PageHero
        title="Property Price Prediction"
        description="Enter the property details below to receive an AI-powered price prediction and market insights. Note: Longitude and Latitude are optional; in a full app, they would be derived from the address."
      />

      <Card className="max-w-3xl mx-auto shadow-xl animate-fadeIn" style={{animationDelay: '0.2s'}}>
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center"><Home className="mr-2 h-6 w-6 text-primary" />Enter Property Details</CardTitle>
          <CardDescription>Provide the following details for our AI to predict the price.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="fullAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><MapPin className="mr-2 h-4 w-4" />Full Address</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 10 Downing Street, London" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="outcode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center"><MapPin className="mr-2 h-4 w-4" />Outcode</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., SW1A" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="longitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Longitude (Optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="any" placeholder="e.g., -0.1278" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))} value={field.value ?? ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="latitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Latitude (Optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="any" placeholder="e.g., 51.5074" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))} value={field.value ?? ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="bedrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center"><Sofa className="mr-2 h-4 w-4" />Bedrooms</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 3" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bathrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center"><Bath className="mr-2 h-4 w-4" />Bathrooms</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 2" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="receptionRooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center"><Tv2 className="mr-2 h-4 w-4" />Reception Rooms</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                    control={form.control}
                    name="area"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="flex items-center"><Home className="mr-2 h-4 w-4" />Area (sqm)</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="e.g., 70" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                 />
                <FormField
                  control={form.control}
                  name="propertyType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center"><Building2 className="mr-2 h-4 w-4" />Property Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select property type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {propertyTypeOptions.map((type) => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <FormField
                  control={form.control}
                  name="tenure"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center"><FileText className="mr-2 h-4 w-4" />Tenure</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select tenure" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {tenureOptions.map((type) => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="currentEnergyRating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center"><Zap className="mr-2 h-4 w-4" />Current Energy Rating</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select energy rating" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {energyRatingOptions.map((rating) => (
                            <SelectItem key={rating} value={rating}>Rating {rating}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="monthOfSale"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center"><CalendarDays className="mr-2 h-4 w-4" />Month of Sale (YYYY-MM)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 2024-07" {...field} />
                      </FormControl>
                      <FormDescription>The month you anticipate the sale.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={mutation.isPending} className="w-full">
                {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <TrendingUp className="mr-2 h-4 w-4" />}
                {mutation.isPending ? 'Predicting...' : 'Predict Price'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {predictionResult && (
        <Card className="mt-12 shadow-xl animate-fadeIn" style={{animationDelay: '0.4s'}}>
          <CardHeader>
            <CardTitle className="font-headline text-2xl flex items-center"><Coins className="mr-2 h-6 w-6 text-primary" />Prediction Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="bg-muted p-6 rounded-lg">
                <p className="text-sm text-muted-foreground font-medium">Predicted Price</p>
                <p className="text-3xl font-bold text-primary">
                  £{predictionResult.predictedPrice.toLocaleString()}
                </p>
              </div>
              <div className="bg-muted p-6 rounded-lg">
                <p className="text-sm text-muted-foreground font-medium">Avg. Area Price</p>
                <p className="text-3xl font-bold text-secondary-foreground">
                  £{predictionResult.averageAreaPrice.toLocaleString()}
                </p>
              </div>
              <div className="bg-muted p-6 rounded-lg">
                <p className="text-sm text-muted-foreground font-medium">Trend (12 months)</p>
                <p className="text-3xl font-bold capitalize" style={{ color: predictionResult.priceTrend === 'increasing' ? 'hsl(var(--chart-1))' : predictionResult.priceTrend === 'decreasing' ? 'hsl(var(--destructive))' : 'hsl(var(--chart-5))' }}>
                  {predictionResult.priceTrend}
                </p>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-headline mb-4 flex items-center"><LineChartIcon className="mr-2 h-5 w-5 text-primary" />12-Month Price Forecast</h3>
              {predictionResult.priceHistoryChartData && predictionResult.priceHistoryChartData.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={predictionResult.priceHistoryChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))" 
                        tickFormatter={(value) => `£${(value / 1000).toFixed(0)}k`} 
                        tick={{ fontSize: 12 }} 
                        domain={['dataMin - 10000', 'dataMax + 10000']}
                      />
                      <RechartsTooltip
                        content={<ChartTooltipContent indicator="line" />}
                        cursor={{ stroke: "hsl(var(--accent))", strokeWidth: 2, strokeDasharray: "3 3" }}
                      />
                      <Line type="monotone" dataKey="price" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4, fill: "hsl(var(--primary))" }} activeDot={{ r: 6, stroke: "hsl(var(--background))", strokeWidth: 2 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <p className="text-muted-foreground">No chart data available.</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
