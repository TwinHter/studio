"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from './Logo';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button'; 

const navItems = [
  { href: '/', label: 'Introduction' },
  { href: '/prediction', label: 'Prediction' },
  { href: '/map', label: 'Map' },
  { href: '/recommendations', label: 'Recommendations' },
];

const Navbar = () => {
  const pathname = usePathname();

  return (
    <nav className="bg-card shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Logo />
        <ul className="flex space-x-2 sm:space-x-4 items-center">
          {navItems.map((item) => (
            <li key={item.href}>
              <Button
                variant="ghost"
                asChild
                className={cn(
                  "text-sm sm:text-base font-medium transition-colors hover:text-primary",
                  pathname === item.href ? "text-primary font-semibold" : "text-foreground/80"
                )}
              >
                <Link href={item.href}>{item.label}</Link>
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
