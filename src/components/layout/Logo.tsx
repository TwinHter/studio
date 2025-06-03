
import Link from 'next/link';
import { APP_NAME } from '@/lib/constants';

const Logo = () => {
  return (
    <Link href="/" className="text-2xl font-bold font-headline hover:opacity-90 transition-opacity text-primary">
      {APP_NAME}
    </Link>
  );
};

export default Logo;
