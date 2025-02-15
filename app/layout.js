import { Inter, Russo_One } from 'next/font/google';
import './globals.css';
import FooterWrapper from './components/FooterWrapper';

const inter = Inter({ subsets: ['latin'] });
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
    <html lang="en" className={`${russo.variable}`}>
      <body className={`${inter.className}`}>
        {children}
        <FooterWrapper />
      </body>
    </html>
  );
}
