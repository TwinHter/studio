"use client";

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { predictPrice, type PredictionInput, type PredictionOutput } from '@/ai/flows/price-prediction';
import PageHero from '@/components/shared/PageHero';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, TrendingUp, Home, Coins, LineChart as LineChartIcon } from 'lucide-react';
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { useToast } from '@/hooks/use-toast';

const propertyTypesValues = ['Flat', 'Detached', 'Terraced', 'Semi-detached'] as const;

const predictionFormSchema = z.object({
  location: z.string().min(2, { message: 'Location (postcode) is required.' }),
  propertyType: z.enum(propertyTypesValues, { required_error: 'Property type is required.' }),
  bedrooms: z.coerce.number().int().min(1, { message: 'Must have at least 1 bedroom.' }).max(10, { message: 'Cannot exceed 10 bedrooms.' }),
  area: z.coerce.number().positive({ message: 'Area must be a positive number.' }).optional(),
  year: z.coerce.number().int().min(new Date().getFullYear(), { message: `Year must be ${new Date().getFullYear()} or future.` }).max(2050),
});

type PredictionFormValues = z.infer<typeof predictionFormSchema>;

export default function PredictionPage() {
  const [predictionResult, setPredictionResult] = useState<PredictionOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<PredictionFormValues>({
    resolver: zodResolver(predictionFormSchema),
    defaultValues: {
      location: '',
      propertyType: undefined,
      bedrooms: 1,
      area: undefined,
      year: new Date().getFullYear(),
    },
  });

  const onSubmit: SubmitHandler<PredictionFormValues> = async (data) => {
    setIsLoading(true);
    setPredictionResult(null);
    try {
      const inputData: PredictionInput = {
        location: data.location,
        propertyType: data.propertyType,
        bedrooms: data.bedrooms,
        year: data.year,
        ...(data.area && { area: data.area }),
      };
      const result = await predictPrice(inputData);
      setPredictionResult(result);
      toast({
        title: "Prediction Successful",
        description: `Price predicted for ${data.location}.`,
      });
    } catch (error) {
      console.error('Prediction failed:', error);
      toast({
        title: "Prediction Failed",
        description: "Could not retrieve prediction. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
        title="Dự đoán Giá Nhà"
        description="Nhập thông tin chi tiết về bất động sản để nhận dự đoán giá được hỗ trợ bởi AI và các thông tin chi tiết về thị trường."
      />

      <Card className="max-w-2xl mx-auto shadow-xl animate-fadeIn" style={{animationDelay: '0.2s'}}>
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center"><Home className="mr-2 h-6 w-6 text-primary" />Nhập thông tin bất động sản</CardTitle>
          <CardDescription>Cung cấp các chi tiết sau để AI của chúng tôi dự đoán giá.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vị trí (Postcode)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., E1, SW1A" {...field} />
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
                    <FormLabel>Loại nhà</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn loại hình bất động sản" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {propertyTypesValues.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="bedrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số phòng ngủ</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 3" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="area"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Diện tích (m², tùy chọn)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 70" {...field} value={field.value ?? ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Năm dự đoán</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <TrendingUp className="mr-2 h-4 w-4" />}
                {isLoading ? 'Đang dự đoán...' : 'Dự đoán giá'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {predictionResult && (
        <Card className="mt-12 shadow-xl animate-fadeIn" style={{animationDelay: '0.4s'}}>
          <CardHeader>
            <CardTitle className="font-headline text-2xl flex items-center"><Coins className="mr-2 h-6 w-6 text-primary" />Kết quả Dự đoán</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="bg-muted p-6 rounded-lg">
                <p className="text-sm text-muted-foreground font-medium">Giá dự đoán</p>
                <p className="text-3xl font-bold text-primary">
                  £{predictionResult.predictedPrice.toLocaleString()}
                </p>
              </div>
              <div className="bg-muted p-6 rounded-lg">
                <p className="text-sm text-muted-foreground font-medium">Giá TB khu vực</p>
                <p className="text-3xl font-bold text-secondary-foreground">
                  £{predictionResult.averageAreaPrice.toLocaleString()}
                </p>
              </div>
              <div className="bg-muted p-6 rounded-lg">
                <p className="text-sm text-muted-foreground font-medium">Xu hướng (12 tháng)</p>
                <p className="text-3xl font-bold capitalize" style={{ color: predictionResult.priceTrend === 'increasing' ? 'hsl(var(--chart-1))' : predictionResult.priceTrend === 'decreasing' ? 'hsl(var(--destructive))' : 'hsl(var(--chart-5))' }}>
                  {predictionResult.priceTrend}
                </p>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-headline mb-4 flex items-center"><LineChartIcon className="mr-2 h-5 w-5 text-primary" />Dự báo giá 12 tháng tới</h3>
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
                <p className="text-muted-foreground">Không có dữ liệu biểu đồ.</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
