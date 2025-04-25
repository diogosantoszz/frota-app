'use client';

// components/layout/ResponsiveLayout.jsx
import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Menu, X, Car, Wrench, FileText, 
  Users, Settings
} from 'lucide-react';
import './responsive-layout.css'; // Vamos criar este arquivo CSS

export default function ResponsiveLayout({ children, title }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    { href: '/', icon: <Settings className="nav-icon" />, label: 'Dashboard' },
    { href: '/veiculos', icon: <Car className="nav-icon" />, label: 'Veículos' },
    { href: '/manutencoes', icon: <Wrench className="nav-icon" />, label: 'Manutenções' },
    { href: '/users', icon: <Users className="nav-icon" />, label: 'Usuários' },
    { href: '/relatorios', icon: <FileText className="nav-icon" />, label: 'Relatórios' },
  ];

  return (
    <div className="layout-container">
      {/* Header */}
      <header className="header">
        <div className="header-container">
          <div className="header-content">
            <div className="logo-container">
              <Link href="/" className="logo-link">
                <span className="logo-text">GestãoFrota</span>
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="desktop-nav">
              {navItems.map((item) => (
                <Link 
                  key={item.href}
                  href={item.href} 
                  className="nav-link"
                >
                  {item.icon}
                  <span className="nav-label">{item.label}</span>
                </Link>
              ))}
            </nav>
            
            {/* Mobile menu button */}
            <div className="mobile-menu-button-container">
              <button
                onClick={toggleMobileMenu}
                className="mobile-menu-button"
              >
                <span className="sr-only">Abrir menu</span>
                {isMobileMenuOpen ? (
                  <X className="menu-icon" />
                ) : (
                  <Menu className="menu-icon" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`mobile-menu ${isMobileMenuOpen ? 'mobile-menu-open' : ''}`}>
          <div className="mobile-menu-items">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="mobile-nav-link"
                onClick={closeMobileMenu}
              >
                {item.icon}
                <span className="mobile-nav-label">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="main-content">
        <div className="content-container">
          {title && (
            <div className="page-title-container">
              <h1 className="page-title">{title}</h1>
            </div>
          )}
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <p className="copyright">
            &copy; {new Date().getFullYear()} GestãoFrota. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}