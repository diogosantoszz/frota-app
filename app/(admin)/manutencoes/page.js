'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import Link from 'next/link';

export default function MaintenancePage() {
  const [maintenance, setMaintenance] = useState([]);
  const [vehicles, setVehicles] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, repair, inspection, service
  
  // Carregar manutenções e veículos
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        // Carregar todas as manutenções
        const maintenanceResponse = await fetch('/api/maintenance');
        const maintenanceData = await maintenanceResponse.json();
        
        // Carregar todos os veículos
        const vehiclesResponse = await fetch('/api/vehicles');
        const vehiclesData = await vehiclesResponse.json();
        
        // Criar um mapa de veículos para lookup rápido
        const vehiclesMap = {};
        vehiclesData.forEach(vehicle => {
          vehiclesMap[vehicle._id] = vehicle;
        });
        
        setMaintenance(maintenanceData);
        setVehicles(vehiclesMap);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, []);
  
  // Filtrar manutenções por tipo
  const filteredMaintenance = maintenance.filter(record => {
    if (filter === 'all') return true;
    if (filter === 'repair') return record.type === 'Reparação';
    if (filter === 'inspection') return record.type === 'Inspeção';
    if (filter === 'service') return record.type === 'Revisão';
    return true;
  });
  
  // Calcular o custo total
  const totalCost = filteredMaintenance.reduce((sum, record) => sum + record.cost, 0);
  
  if (isLoading) return <div>Carregando...</div>;
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Registo de Manutenções</h1>
        
        <div className="flex space-x-2">
          <button 
            className={`px-3 py-1 text-sm rounded-md ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setFilter('all')}
          >
            Todos
          </button>
          <button 
            className={`px-3 py-1 text-sm rounded-md ${filter === 'repair' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setFilter('repair')}
          >
            Reparações
          </button>
          <button 
            className={`px-3 py-1 text-sm rounded-md ${filter === 'inspection' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setFilter('inspection')}
          >
            Inspeções
          </button>
          <button 
            className={`px-3 py-1 text-sm rounded-md ${filter === 'service' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setFilter('service')}
          >
            Revisões
          </button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>
            {filter === 'all' && 'Todas as Manutenções'}
            {filter === 'repair' && 'Reparações'}
            {filter === 'inspection' && 'Inspeções'}
            {filter === 'service' && 'Revisões'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Veículo
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Matrícula
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Responsável
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descrição
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Custo (€)
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMaintenance.map(record => {
                  const vehicle = vehicles[record.vehicleId] || {};
                  return (
                    <tr key={record._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(record.date), 'dd/MM/yyyy', { locale: pt })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {vehicle.brand} {vehicle.model}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <Link href={`/veiculos/${record.vehicleId}`} className="text-blue-500 hover:underline">
                          {vehicle.plate}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {vehicle.userName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span 
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            record.type === "Inspeção" 
                              ? "bg-blue-100 text-blue-800" 
                              : record.type === "Reparação"
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                          }`}
                        >
                          {record.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {record.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                        {record.cost.toFixed(2)} €
                      </td>
                    </tr>
                  );
                })}
                
                {filteredMaintenance.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                      Nenhum registo de manutenção encontrado
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="font-bold bg-gray-50">
                  <td className="px-6 py-4" colSpan={6}>Total</td>
                  <td className="px-6 py-4 text-right">
                    {totalCost.toFixed(2)} €
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
