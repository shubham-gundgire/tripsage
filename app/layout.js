import { Russo_One, Open_Sans } from 'next/font/google';
import './globals.css';

const openSans = Open_Sans({
  subsets: ['latin'],
  variable: '--font-opensans',
});

const russo = Russo_One({ 
  subsets: ['latin'],
  weight: '400',
  variable: '--font-russo',
});

export const metadata = {
  title: 'TripSage - Your Travel Planning Companion',
  description: 'Plan your perfect trip with TripSage - your intelligent travel planning companion.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${russo.variable} ${openSans.variable}`}>
      <body className={`${openSans.className}`}>{children}</body>
    </html>
  );
}
