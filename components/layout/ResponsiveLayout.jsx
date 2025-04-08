// components/layout/ResponsiveLayout.jsx
import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Menu, X, Car, Wrench, FileText, 
  Users, Settings, ChevronDown, LogOut 
} from 'lucide-react';

export default function ResponsiveLayout({ children, title }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    { href: '/', icon: <Settings className="w-5 h-5" />, label: 'Dashboard' },
    { href: '/veiculos', icon: <Car className="w-5 h-5" />, label: 'Veículos' },
    { href: '/manutencoes', icon: <Wrench className="w-5 h-5" />, label: 'Manutenções' },
    { href: '/users', icon: <Users className="w-5 h-5" />, label: 'Usuários' },
    { href: '/relatorios', icon: <FileText className="w-5 h-5" />, label: 'Relatórios' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link href="/" className="flex-shrink-0 flex items-center">
                <span className="text-2xl font-bold text-blue-600">GestãoFrota</span>
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navItems.map((item) => (
                <Link 
                  key={item.href}
                  href={item.href} 
                  className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-colors"
                >
                  {item.icon}
                  <span className="ml-2">{item.label}</span>
                </Link>
              ))}
            </nav>
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              >
                <span className="sr-only">Abrir menu</span>
                {isMobileMenuOpen ? (
                  <X className="block h-6 w-6" />
                ) : (
                  <Menu className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
          <div className="pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center px-4 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                onClick={closeMobileMenu}
              >
                {item.icon}
                <span className="ml-3">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {title && (
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            </div>
          )}
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white shadow-sm mt-auto py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} GestãoFrota. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}