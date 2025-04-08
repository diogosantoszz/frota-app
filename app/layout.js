// app/layout.js
import ResponsiveLayout from '@/components/layout/ResponsiveLayout';
import './globals.css';

export const metadata = {
  title: 'Gestão de Frota Automóvel',
  description: 'Sistema de gestão de frota automóvel com controle de inspeções e manutenções',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt">
      <body className="min-h-screen bg-gray-50">
        <ResponsiveLayout>
          {children}
        </ResponsiveLayout>
      </body>
    </html>
  );
}