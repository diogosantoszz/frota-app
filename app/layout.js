import NavBar from '@/components/layout/NavBar';
import './globals.css';

export const metadata = {
  title: 'Gestão de Frota Automóvel',
  description: 'Sistema de gestão de frota automóvel com controle de inspeções e manutenções',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt">
      <body className="min-h-screen bg-gray-50">
        <NavBar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
