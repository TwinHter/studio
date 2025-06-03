
"use client";

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usePredict } from '@/hooks/usePredict';
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
import { 
  PREDICTION_PAGE_HERO_TITLE, 
  PREDICTION_PAGE_HERO_DESCRIPTION,
  PROPERTY_TYPE_OPTIONS,
  ENERGY_RATING_OPTIONS,
  TENURE_OPTIONS,
  REGION_OPTIONS, // Import REGION_OPTIONS
  PREDICTION_FORM_DEFAULT_BEDROOMS,
  PREDICTION_FORM_DEFAULT_BATHROOMS,
  PREDICTION_FORM_DEFAULT_RECEPTIONS,
  PREDICTION_MONTH_OF_SALE_FORMAT_DESC
} from '@/lib/constants';
import type { PropertyType, EnergyRating, Tenure } from '@/types';

const predictionFormSchema = z.object({
  fullAddress: z.string().min(5, { message: 'Full address must be at least 5 characters.' }),
  outcode: z.enum(REGION_OPTIONS as [string, ...string[]], { required_error: 'Outcode is required.' }), // Updated outcode validation
  longitude: z.coerce.number().optional(),
  latitude: z.coerce.number().optional(),
  bedrooms: z.coerce.number().int().min(0, { message: 'Must be 0 or more bedrooms.' }).max(10, { message: 'Cannot exceed 10 bedrooms.' }),
  bathrooms: z.coerce.number().int().min(0, { message: 'Must be 0 or more bathrooms.' }).max(10, { message: 'Cannot exceed 10 bathrooms.' }),
  receptionRooms: z.coerce.number().int().min(0, { message: 'Must be 0 or more reception rooms.' }).max(10, { message: 'Cannot exceed 10 reception rooms.' }),
  area: z.coerce.number().positive({ message: 'Area must be a positive number.' }),
  tenure: z.enum(TENURE_OPTIONS as [Tenure, ...Tenure[]], { required_error: 'Tenure is required.' }),
  propertyType: z.enum(PROPERTY_TYPE_OPTIONS as [PropertyType, ...PropertyType[]], { required_error: 'Property type is required.' }),
  currentEnergyRating: z.enum(ENERGY_RATING_OPTIONS as [EnergyRating, ...EnergyRating[]], { required_error: 'Energy rating is required.' }),
  monthOfSale: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, { message: PREDICTION_MONTH_OF_SALE_FORMAT_DESC }),
});

type PredictionFormValues = z.infer<typeof predictionFormSchema>;

export default function PredictionPage() {
  const { predict, isPredicting, predictionData, predictionError, resetPrediction } = usePredict();
  const currentYear = new Date().getFullYear();
  const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');

  const form = useForm<PredictionFormValues>({
    resolver: zodResolver(predictionFormSchema),
    defaultValues: {
      fullAddress: '',
      outcode: undefined, // Default to undefined for Select placeholder
      longitude: undefined,
      latitude: undefined,
      bedrooms: PREDICTION_FORM_DEFAULT_BEDROOMS,
      bathrooms: PREDICTION_FORM_DEFAULT_BATHROOMS,
      receptionRooms: PREDICTION_FORM_DEFAULT_RECEPTIONS,
      area: undefined,
      tenure: undefined,
      propertyType: undefined,
      currentEnergyRating: undefined,
      monthOfSale: `${currentYear}-${currentMonth}`,
    },
  });

  const onSubmit: SubmitHandler<PredictionFormValues> = async (data) => {
    resetPrediction();
    const inputData: PredictionInput = {
      ...data,
      outcode: data.outcode, // Ensure outcode is passed correctly
      ...(data.longitude && { longitude: data.longitude }),
      ...(data.latitude && { latitude: data.latitude }),
    };
    try {
      await predict(inputData);
    } catch (e) {
      console.error("Submit error", e)
    }
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
        title={PREDICTION_PAGE_HERO_TITLE}
        description={PREDICTION_PAGE_HERO_DESCRIPTION}
      />

      <Card className="max-w-3xl mx-auto shadow-xl animate-fadeIn" style={{animationDelay: '0.2s'}}>
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center"><Home className="mr-2 h-6 w-6 text-primary" />Enter Property Details</CardTitle>
          <CardDescription>Provide the following details for our AI to predict the price using hook-based fake data.</CardDescription>
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select outcode" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {REGION_OPTIONS.map((region) => (
                            <SelectItem key={region} value={region}>{region}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                          {PROPERTY_TYPE_OPTIONS.map((type) => (
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
                          {TENURE_OPTIONS.map((type) => (
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
                          {ENERGY_RATING_OPTIONS.map((rating) => (
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
                      <FormDescription>{PREDICTION_MONTH_OF_SALE_FORMAT_DESC}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isPredicting} className="w-full">
                {isPredicting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <TrendingUp className="mr-2 h-4 w-4" />}
                {isPredicting ? 'Predicting (Hook)...' : 'Predict Price (Hook)'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {isPredicting && (
        <div className="flex justify-center items-center mt-12">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="ml-3 text-lg">Fetching prediction using hook...</p>
        </div>
      )}

      {predictionError && (
         <Card className="mt-12 shadow-xl animate-fadeIn bg-destructive/10 border-destructive/30" style={{animationDelay: '0.4s'}}>
            <CardHeader>
                <CardTitle className="font-headline text-xl text-destructive">Prediction Error</CardTitle>
            </CardHeader>
            <CardContent>
                <p>Could not load prediction results: {predictionError.message}</p>
            </CardContent>
         </Card>
      )}

      {predictionData && !isPredicting && (
        <Card className="mt-12 shadow-xl animate-fadeIn" style={{animationDelay: '0.4s'}}>
          <CardHeader>
            <CardTitle className="font-headline text-2xl flex items-center"><Coins className="mr-2 h-6 w-6 text-primary" />Prediction Results (from Hook)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="bg-muted p-6 rounded-lg">
                <p className="text-sm text-muted-foreground font-medium">Predicted Price</p>
                <p className="text-3xl font-bold text-primary">
                  £{predictionData.predictedPrice.toLocaleString()}
                </p>
              </div>
              <div className="bg-muted p-6 rounded-lg">
                <p className="text-sm text-muted-foreground font-medium">Avg. Area Price</p>
                <p className="text-3xl font-bold text-secondary-foreground">
                  £{predictionData.averageAreaPrice.toLocaleString()}
                </p>
              </div>
              <div className="bg-muted p-6 rounded-lg">
                <p className="text-sm text-muted-foreground font-medium">Trend (12 months)</p>
                <p className="text-3xl font-bold capitalize" style={{ color: predictionData.priceTrend === 'increasing' ? 'hsl(var(--chart-1))' : predictionData.priceTrend === 'decreasing' ? 'hsl(var(--destructive))' : 'hsl(var(--chart-5))' }}>
                  {predictionData.priceTrend}
                </p>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-headline mb-4 flex items-center"><LineChartIcon className="mr-2 h-5 w-5 text-primary" />12-Month Price Forecast</h3>
              {predictionData.priceHistoryChartData && predictionData.priceHistoryChartData.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={predictionData.priceHistoryChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
