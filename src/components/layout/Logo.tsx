import Link from 'next/link';

const Logo = () => {
  return (
    <Link href="/" className="text-2xl font-bold font-headline text-primary hover:text-primary/90 transition-colors">
      London Dwellings AI
    </Link>
  );
};

export default Logo;
