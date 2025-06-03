
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TrendingUp, MapIcon, ListChecksIcon, Database, ShieldCheck, Sparkles, Users } from 'lucide-react';

export default function IntroductionPage() {
  return (
    <div className="space-y-12">
      <section className="bg-muted p-8 md:p-12 rounded-xl shadow-lg text-center animate-fadeIn">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-4">London Housing</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          Explore the future of London's property market with our intelligent house price prediction tool, utilizing advanced AI and detailed historical data.
        </p>
        <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Link href="/prediction">Get Started with Prediction</Link>
        </Button>
      </section>

       <section className="bg-muted py-12 px-6 md:px-8 rounded-xl shadow-lg animate-fadeIn" style={{animationDelay: '0.2s'}}>
        <h2 className="text-3xl font-headline font-bold text-center text-primary mb-10">Application Features</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 animate-fadeIn bg-card" style={{animationDelay: '0.3s'}}>
            <CardHeader className="items-center text-center">
              <TrendingUp className="w-12 h-12 text-accent mb-3" />
              <CardTitle className="font-headline text-xl text-primary">AI Price Prediction & Forecast</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-center text-card-foreground/80">
              Input property details (address, type, size, rooms, etc.) to get an AI-driven price estimate for a specific sale month and a 12-month price trend forecast.
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 animate-fadeIn bg-card" style={{animationDelay: '0.4s'}}>
            <CardHeader className="items-center text-center">
              <MapIcon className="w-12 h-12 text-accent mb-3" />
              <CardTitle className="font-headline text-xl text-primary">Interactive Map Exploration</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-center text-card-foreground/80">
              Discover London regions with a map color-coded by average prices. Click areas for detailed local market insights powered by AI.
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 animate-fadeIn bg-card" style={{animationDelay: '0.5s'}}>
            <CardHeader className="items-center text-center">
              <ListChecksIcon className="w-12 h-12 text-accent mb-3" />
              <CardTitle className="font-headline text-xl text-primary">Property Recommendations</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-center text-card-foreground/80">
              Find properties matching your criteria: price range, type, area, rooms, and more. Upload your own listings to share.
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="animate-fadeIn" style={{animationDelay: '0.6s'}}>
        <div className="grid md:grid-cols-2 gap-8 items-stretch">
          <Card className="shadow-lg flex flex-col bg-card">
            <CardHeader>
              <div className="flex items-center mb-2">
                <Database className="w-8 h-8 text-primary mr-3" />
                <CardTitle className="font-headline text-2xl text-primary">Data & AI Model</CardTitle>
              </div>
              <CardDescription>The foundation of our analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-card-foreground/90 flex-grow">
              <p>
                Our project utilizes comprehensive London housing data, including historical transactions from the <strong>UK Land Registry Price Paid Data</strong> (1991-2023), enriched with:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-4">
                <li><strong>Location:</strong> Full Address, Geolocation (Latitude, Longitude), Outcode.</li>
                <li><strong>Characteristics:</strong> Property Type (Flat, Detached, etc.), Tenure (Freehold, Leasehold).</li>
                <li><strong>Size & Layout:</strong> Bedrooms, Bathrooms, Reception Rooms, Internal Area (sqm).</li>
                <li><strong>Condition:</strong> Current Energy Efficiency Rating (A-G).</li>
                <li><strong>Timing:</strong> Month of Sale for accurate predictions.</li>
              </ul>
              <p>
                We employ machine learning models like <strong>Ridge Regression</strong>, <strong>XGBoost</strong>, <strong>LightGBM</strong>, and <strong>Ensemble Learning</strong>, trained on meticulously processed data to identify complex price-influencing factors.
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-lg flex flex-col bg-card">
             <CardHeader>
              <div className="flex items-center mb-2">
                <ShieldCheck className="w-8 h-8 text-primary mr-3" />
                <CardTitle className="font-headline text-2xl text-primary">Model Accuracy</CardTitle>
              </div>
              <CardDescription>Evaluating our model's performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-card-foreground/90 flex-grow">
              <p>
                Model accuracy is paramount. We use metrics like MAE (Mean Absolute Error) and R² (R-squared) to continuously evaluate and refine our predictions, aiming for maximum reliability.
              </p>
              <div className="bg-muted/50 p-4 rounded-md text-center border">
                <Image
                  src="https://placehold.co/600x300.png"
                  alt="Sample accuracy chart"
                  width={600}
                  height={300}
                  className="rounded-md mx-auto shadow-md"
                  data-ai-hint="graph accuracy"
                />
                <p className="text-sm text-muted-foreground mt-2">Example chart showing model performance (e.g., MAE, R²).</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="animate-fadeIn text-center" style={{animationDelay: '0.7s'}}>
        <Card className="max-w-2xl mx-auto shadow-lg bg-card">
          <CardHeader>
            <div className="flex items-center justify-center mb-2">
              <Sparkles className="w-8 h-8 text-primary mr-3" />
              <CardTitle className="font-headline text-2xl text-primary">Project Goal</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-card-foreground/90">
            <p>
              London Housing aims to provide a transparent, user-friendly tool empowering users to make informed decisions in the property market by democratizing access to in-depth analysis.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="animate-fadeIn" style={{animationDelay: '0.8s'}}>
        <Card className="max-w-3xl mx-auto shadow-lg bg-card">
          <CardHeader>
            <div className="flex items-center justify-center mb-2">
              <Users className="w-8 h-8 text-primary mr-3" />
              <CardTitle className="font-headline text-2xl text-primary">Project Team</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-card-foreground/90">
            <ul className="list-disc list-inside space-y-2 text-left sm:text-center">
              <li><strong>An Nguyen:</strong> Project Lead &amp; AI Architect</li>
              <li><strong>Binh Tran:</strong> Data Specialist &amp; Backend Developer</li>
              <li><strong>Cuong Le:</strong> Frontend Engineer &amp; UI/UX Designer</li>
              <li><strong>Dung Pham:</strong> QA &amp; Testing Lead</li>
            </ul>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
