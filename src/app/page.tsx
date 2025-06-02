import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import PageHero from '@/components/shared/PageHero';
import { BarChart, TrendingUp, Database, Users, Building, Sparkles, CheckCircle } from 'lucide-react';

export default function IntroductionPage() {
  return (
    <div className="space-y-16">
      <PageHero
        title="AI-Powered London House Price Prediction"
        description="Explore the future of London's property market with our intelligent house price prediction tool, utilizing advanced AI and detailed historical data."
      />

      <section className="text-center animate-fadeIn" style={{animationDelay: '0.2s'}}>
        <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Link href="/prediction">Get Started with Prediction</Link>
        </Button>
      </section>

      <section className="animate-fadeIn" style={{animationDelay: '0.4s'}}>
        <div className="grid md:grid-cols-2 gap-8 items-stretch">
          <Card className="shadow-lg flex flex-col">
            <CardHeader>
              <div className="flex items-center mb-2">
                <Database className="w-8 h-8 text-primary mr-3" />
                <CardTitle className="font-headline text-2xl">Data & AI Model</CardTitle>
              </div>
              <CardDescription>The foundation of our analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-foreground/90 flex-grow">
              <p>
                Our project utilizes comprehensive and detailed London housing data, including historical transaction records from the <strong>UK Land Registry Price Paid Data</strong> spanning from 1991 to 2023.
                This information is enriched with crucial property features such as:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-4">
                <li><strong>Full Address & Geolocation:</strong> Precise location (latitude, longitude) and outcode.</li>
                <li><strong>Property Characteristics:</strong> Type (Flat, Detached, Terraced, etc.), tenure (Freehold, Leasehold), number of bedrooms, bathrooms, and reception rooms.</li>
                <li><strong>Physical Attributes:</strong> Internal area (square meters), and current energy efficiency rating (A-G).</li>
                <li><strong>Transactional Context:</strong> Month of sale for price prediction.</li>
              </ul>
              <p>
                We employ a suite of advanced machine learning models, including <strong>Ridge Regression</strong> for handling multicollinearity, <strong>XGBoost</strong> and <strong>LightGBM</strong> for high predictive performance and scalability, along with <strong>Ensemble Learning</strong> techniques to combine the strengths of multiple models.
                These models are trained on meticulously processed data, involving cleaning, normalization, and feature engineering to optimize the identification of complex trends and multifaceted factors influencing house prices.
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-lg flex flex-col">
             <CardHeader>
              <div className="flex items-center mb-2">
                <CheckCircle className="w-8 h-8 text-primary mr-3" />
                <CardTitle className="font-headline text-2xl">Accuracy Showcase</CardTitle>
              </div>
              <CardDescription>Evaluating our model's performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-foreground/90 flex-grow">
              <p>
                The accuracy of our AI model is a top priority. We continuously evaluate its performance using metrics like MAE (Mean Absolute Error) and MSE (Mean Squared Error).
              </p>
              <div className="bg-muted p-4 rounded-md text-center">
                <Image 
                  src="https://placehold.co/600x300.png" 
                  alt="Sample accuracy chart" 
                  width={600} 
                  height={300} 
                  className="rounded-md mx-auto shadow-md"
                  data-ai-hint="graph accuracy" 
                />
                <p className="text-sm text-muted-foreground mt-2">Example chart showing model accuracy (MAE/MSE).</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
      
      <section className="animate-fadeIn text-center" style={{animationDelay: '0.6s'}}>
        <Card className="max-w-2xl mx-auto shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-center mb-2">
              <Sparkles className="w-8 h-8 text-primary mr-3" />
              <CardTitle className="font-headline text-2xl">Project Goal</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-foreground/90">
            <p>
              The goal of London Dwellings AI is to provide a transparent and user-friendly tool that empowers buyers, sellers, and investors to make more informed decisions in the London property market. We aim to democratize access to in-depth information and analysis.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="animate-fadeIn" style={{animationDelay: '0.8s'}}>
        <Card className="max-w-3xl mx-auto shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-center mb-2">
              <Users className="w-8 h-8 text-primary mr-3" />
              <CardTitle className="font-headline text-2xl">Project Team</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-foreground/90">
            <ul className="list-disc list-inside space-y-2 text-left sm:text-center">
              <li><strong>An Nguyen:</strong> Project Lead & AI Architect</li>
              <li><strong>Binh Tran:</strong> Data Specialist & Backend Developer</li>
              <li><strong>Cuong Le:</strong> Frontend Engineer & UI/UX Designer</li>
              <li><strong>Dung Pham:</strong> QA & Testing Lead</li>
            </ul>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
