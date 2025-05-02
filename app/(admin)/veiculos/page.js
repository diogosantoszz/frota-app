'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Car, Plus, ArrowUp, ArrowDown } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import UpdateVehiclesButton from '@/components/admin/UpdateVehiclesButton';

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados para ordenação
  const [sortColumn, setSortColumn] = useState('plate'); // Coluna padrão para ordenação
  const [sortDirection, setSortDirection] = useState('asc'); // Direção padrão (ascendente)
  
  // Carregar veículos
  useEffect(() => {
    async function fetchVehicles() {
      setIsLoading(true);
      try {
        const response = await fetch('/api/vehicles');
        if (response.ok) {
          const data = await response.json();
          setVehicles(data);
        }
      } catch (error) {
        console.error('Erro ao carregar veículos:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchVehicles();
  }, []);
  
  // Função para alternar a ordenação quando o cabeçalho da coluna é clicado
  const handleSort = (column) => {
    if (sortColumn === column) {
      // Se a mesma coluna for clicada novamente, inverta a direção
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Se uma nova coluna for clicada, defina-a como a coluna de ordenação e reset para ascendente
      setSortColumn(column);
      setSortDirection('asc');
    }
  };
  
  // Função para renderizar o ícone de ordenação
  const renderSortIcon = (column) => {
    if (sortColumn !== column) return null;
    
    return sortDirection === 'asc' ? (
      <ArrowUp className="inline-block ml-1" size={14} />
    ) : (
      <ArrowDown className="inline-block ml-1" size={14} />
    );
  };
  
  // Filtrar veículos com base na pesquisa
  const filteredVehicles = vehicles.filter(vehicle => 
    vehicle.plate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.userName?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Ordenar veículos
  const sortedVehicles = [...filteredVehicles].sort((a, b) => {
    // Função auxiliar para comparar valores possivelmente nulos
    const compareValues = (valueA, valueB) => {
      // Se ambos os valores forem números, compare numericamente
      if (!isNaN(valueA) && !isNaN(valueB)) {
        return valueA - valueB;
      }
      
      // Caso contrário, converter para string e comparar
      const strA = String(valueA || '').toLowerCase();
      const strB = String(valueB || '').toLowerCase();
      
      return strA.localeCompare(strB);
    };
    
    // Ordenar com base na coluna selecionada
    let result;
    
    switch (sortColumn) {
      case 'plate':
        result = compareValues(a.plate, b.plate);
        break;
      case 'brand':
        // Concatenar marca e modelo para ordenação
        result = compareValues(a.brand + ' ' + a.model, b.brand + ' ' + b.model);
        break;
      case 'firstRegistrationDate':
        // Comparar datas
        result = new Date(a.firstRegistrationDate) - new Date(b.firstRegistrationDate);
        break;
      case 'company':
        result = compareValues(a.company, b.company);
        break;
      case 'userName':
        result = compareValues(a.userName, b.userName);
        break;
      case 'currentMileage':
        result = compareValues(a.currentMileage, b.currentMileage);
        break;
      case 'nextInspection':
        // Comparar datas
        result = new Date(a.nextInspection) - new Date(b.nextInspection);
        break;
      case 'inspectionStatus':
        result = compareValues(a.inspectionStatus, b.inspectionStatus);
        break;
      default:
        result = 0; // Sem ordenação
    }
    
    // Inverter resultado se a direção for descendente
    return sortDirection === 'asc' ? result : -result;
  });
  
  if (isLoading) return <div>Carregando...</div>;
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Veículos</h1>
        <div className="flex items-center space-x-2">
          <UpdateVehiclesButton />
          <Link href="/veiculos/adicionar">
            <Button className="flex items-center">
              <Plus className="mr-2" size={16} />
              Adicionar Veículo
            </Button>
          </Link>
        </div>
      </div>

      
      <div className="mb-4">
        <input 
          type="text" 
          placeholder="Pesquisar veículos..." 
          className="w-full md:w-1/2 p-2 border rounded"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="bg-white shadow overflow-hidden rounded-lg">
        <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('plate')}
              >
                Matrícula {renderSortIcon('plate')}
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('brand')}
              >
                Marca/Modelo {renderSortIcon('brand')}
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('firstRegistrationDate')}
              >
                Primeira Matrícula {renderSortIcon('firstRegistrationDate')}
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('company')}
              >
                Empresa {renderSortIcon('company')}
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('userName')}
              >
                Responsável {renderSortIcon('userName')}
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('currentMileage')}
              >
                Quilometragem {renderSortIcon('currentMileage')}
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('nextInspection')}
              >
                Próxima Inspeção {renderSortIcon('nextInspection')}
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('inspectionStatus')}
              >
                Status {renderSortIcon('inspectionStatus')}
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedVehicles.map(vehicle => (
              <tr key={vehicle._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {vehicle.plate}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {vehicle.brand} {vehicle.model}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(vehicle.firstRegistrationDate), 'dd/MM/yyyy', { locale: pt })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {vehicle.company}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {vehicle.userName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                  {vehicle.currentMileage?.toLocaleString() || '0'} km
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(vehicle.nextInspection), 'dd/MM/yyyy', { locale: pt })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span 
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      vehicle.inspectionStatus === "pendente" 
                        ? "bg-yellow-100 text-yellow-800"
                        : vehicle.inspectionStatus === "atrasada"
                          ? "bg-red-100 text-red-800"
                          : "bg-green-100 text-green-800"
                    }`}
                  >
                    {vehicle.inspectionStatus === "pendente" 
                      ? "Pendente" 
                      : vehicle.inspectionStatus === "atrasada"
                        ? "Atrasada" 
                        : "Confirmada"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link href={`/veiculos/${vehicle._id}`}>
                    <Button variant="secondary" size="sm">
                      Detalhes
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
            
            {filteredVehicles.length === 0 && (
              <tr>
                <td colSpan={9} className="px-6 py-4 text-center text-sm text-gray-500">
                  Nenhum veículo encontrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}