import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import PageHero from '@/components/shared/PageHero';
import { BarChart, TrendingUp, Database } from 'lucide-react';

export default function IntroductionPage() {
  return (
    <div className="space-y-16">
      <PageHero
        title="Dự đoán giá nhà London bằng AI"
        description="Khám phá tương lai thị trường bất động sản London với công cụ dự đoán giá nhà thông minh, sử dụng công nghệ AI tiên tiến và dữ liệu lịch sử chi tiết."
      />

      <section className="text-center animate-fadeIn" style={{animationDelay: '0.2s'}}>
        <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Link href="/prediction">Bắt đầu dự đoán ngay</Link>
        </Button>
      </section>

      <section className="animate-fadeIn" style={{animationDelay: '0.4s'}}>
        <div className="grid md:grid-cols-2 gap-8 items-stretch">
          <Card className="shadow-lg flex flex-col">
            <CardHeader>
              <div className="flex items-center mb-2">
                <Database className="w-8 h-8 text-primary mr-3" />
                <CardTitle className="font-headline text-2xl">Dữ liệu và Mô hình AI</CardTitle>
              </div>
              <CardDescription>Nền tảng phân tích của chúng tôi</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-foreground/90 flex-grow">
              <p>
                Dự án sử dụng nguồn dữ liệu giá nhà phong phú tại London, kéo dài từ năm 1991 đến năm 2023. 
                Thông tin này bao gồm các yếu tố như vị trí, loại hình bất động sản, số phòng ngủ, diện tích, và nhiều đặc điểm khác.
              </p>
              <p>
                Chúng tôi áp dụng các mô hình học máy tiên tiến như Ridge Regression và XGBoost để phân tích và đưa ra dự đoán. 
                Các mô hình này được huấn luyện kỹ lưỡng để nhận diện các xu hướng phức tạp và yếu tố ảnh hưởng đến giá nhà.
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-lg flex flex-col">
             <CardHeader>
              <div className="flex items-center mb-2">
                <BarChart className="w-8 h-8 text-primary mr-3" />
                <CardTitle className="font-headline text-2xl">Minh họa Độ chính xác</CardTitle>
              </div>
              <CardDescription>Đánh giá hiệu suất mô hình</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-foreground/90 flex-grow">
              <p>
                Độ chính xác của mô hình AI là ưu tiên hàng đầu. Chúng tôi liên tục đánh giá hiệu suất thông qua các chỉ số như MAE (Mean Absolute Error) và MSE (Mean Squared Error).
              </p>
              <div className="bg-muted p-4 rounded-md text-center">
                <Image 
                  src="https://placehold.co/600x300.png?text=Sample+Accuracy+Chart" 
                  alt="Biểu đồ độ chính xác mẫu" 
                  width={600} 
                  height={300} 
                  className="rounded-md mx-auto shadow-md"
                  data-ai-hint="graph accuracy" 
                />
                <p className="text-sm text-muted-foreground mt-2">Biểu đồ ví dụ về độ chính xác của mô hình (MAE/MSE).</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
      
      <section className="animate-fadeIn text-center" style={{animationDelay: '0.6s'}}>
        <Card className="max-w-2xl mx-auto shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="w-8 h-8 text-primary mr-3" />
              <CardTitle className="font-headline text-2xl">Mục tiêu của Dự án</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-foreground/90">
            <p>
              Mục tiêu của London Dwellings AI là cung cấp một công cụ minh bạch và dễ sử dụng, giúp người mua, người bán, và các nhà đầu tư đưa ra quyết định sáng suốt hơn trên thị trường bất động sản London. Chúng tôi mong muốn dân chủ hóa việc tiếp cận thông tin và phân tích chuyên sâu.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
