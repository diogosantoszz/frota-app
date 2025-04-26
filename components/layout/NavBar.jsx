// components/layout/NavBar.jsx - Atualizar para incluir o link para tarefas
import React from 'react';
import Link from 'next/link';
import { Car, Wrench, FileText, Settings, User, CheckSquare } from 'lucide-react';

export default function NavBar() {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-2xl font-bold text-blue-600">
                GestãoFrota
              </Link>
            </div>
            <nav className="ml-6 flex space-x-4 sm:space-x-8">
              <Link 
                href="/" 
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
              >
                <Settings className="mr-2" size={16} />
                Dashboard
              </Link>
              <Link 
                href="/veiculos" 
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
              >
                <Car className="mr-2" size={16} />
                Veículos
              </Link>
              <Link 
                href="/manutencoes" 
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
              >
                <Wrench className="mr-2" size={16} />
                Manutenções
              </Link>
              <Link 
                href="/tarefas" 
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
              >
                <CheckSquare className="mr-2" size={16} />
                Tarefas
              </Link>
              <Link 
                href="/users" 
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
              >
                <User className="mr-2" size={16} />
                Utilizadores
              </Link>
              <Link 
                href="/relatorios" 
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
              >
                <FileText className="mr-2" size={16} />
                Relatórios
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}