'use client';

import { useState, useEffect } from 'react';
import { Car, Clock, Wrench, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/modern-card';
import { Button } from '@/components/ui/modern-button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

// Componente de Card de Estatística
const StatCard = ({ icon, title, value, bgColor = "bg-blue-50" }) => {
  return (
    <Card className="overflow-hidden">
      <CardHeader className={`${bgColor} flex flex-row items-center space-y-0 py-4`}>
        <div className="p-2 bg-white bg-opacity-30 rounded-lg">
          {icon}
        </div>
        <CardTitle className="ml-4 text-base sm:text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="py-6">
        <div className="text-3xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
};

// Componente de Lista de Inspeções
const InspectionsList = ({ 
  title,
  description, 
  vehicles, 
  type = "upcoming",
  onConfirmInspection,
  onSendEmail 
}) => {
  const isOverdue = type === "overdue";
  
  if (!vehicles || vehicles.length === 0) {
    return null;
  }

  return (
    <Card className={`mt-6 ${isOverdue ? 'border-red-200' : 'border-yellow-200'}`}>
      <CardHeader className={isOverdue ? "bg-red-50" : "bg-yellow-50"}>
        <div className="flex items-center">
          {isOverdue ? (
            <AlertTriangle className="mr-2 h-5 w-5 text-red-600" />
          ) : (
            <Clock className="mr-2 h-5 w-5 text-yellow-600" />
          )}
          <CardTitle className={isOverdue ? "text-red-800" : "text-yellow-800"}>
            {title}
          </CardTitle>
        </div>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Matrícula</th>
                <th className="text-left py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Veículo</th>
                <th className="text-left py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Responsável</th>
                <th className="text-left py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                <th className="text-left py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Dias</th>
                <th className="text-left py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map(vehicle => (
                <tr key={vehicle._id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 text-sm">
                    <Link href={`/veiculos/${vehicle._id}`} className="font-medium text-blue-600 hover:text-blue-800">
                      {vehicle.plate}
                    </Link>
                  </td>
                  <td className="py-3 text-sm text-gray-700">{vehicle.brand} {vehicle.model}</td>
                  <td className="py-3 text-sm text-gray-700 hidden md:table-cell">{vehicle.userName}</td>
                  <td className={`py-3 text-sm ${isOverdue ? "text-red-600 font-medium" : ""}`}>
                    {format(new Date(vehicle.nextInspection), 'dd/MM/yyyy', { locale: pt })}
                  </td>
                  <td className={`py-3 text-sm ${isOverdue ? "text-red-600 font-medium" : ""}`}>
                    {Math.abs(Math.floor((new Date(vehicle.nextInspection) - new Date()) / (1000 * 60 * 60 * 24)))}
                  </td>
                  <td className="py-3 text-sm">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        variant={isOverdue ? "destructive" : "primary"}
                        size="sm"
                        onClick={() => onConfirmInspection(vehicle._id)}
                        title="Confirmar realização da inspeção"
                        className="w-full sm:w-auto"
                      >
                        Confirmar
                      </Button>
                      {!vehicle.emailSent && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onSendEmail(vehicle._id)}
                          title="Enviar email de lembrete"
                          className="w-full sm:w-auto"
                        >
                          Lembrar
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default function Dashboard() {
  const [vehicles, setVehicles] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Carregar dados
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        // Carregar veículos
        const vehiclesResponse = await fetch('/api/vehicles');
        const vehiclesData = await vehiclesResponse.json();
        
        // Carregar manutenções
        const maintenanceResponse = await fetch('/api/maintenance');
        const maintenanceData = await maintenanceResponse.json();
        
        setVehicles(vehiclesData);
        setMaintenance(maintenanceData);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, []);
  
  // Filtrar veículos por status
  const upcomingInspections = vehicles.filter(vehicle => {
    const nextInspection = new Date(vehicle.nextInspection);
    const today = new Date();
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(today.getDate() + 30);
    return nextInspection >= today && 
           nextInspection <= thirtyDaysLater && 
           vehicle.inspectionStatus === "pendente";
  });
  
  const overdueInspections = vehicles.filter(vehicle => {
    const nextInspection = new Date(vehicle.nextInspection);
    const today = new Date();
    return nextInspection < today && vehicle.inspectionStatus !== "confirmada";
  });
  
  // Manutenções recentes (últimos 30 dias)
  const recentMaintenance = maintenance.filter(m => {
    const mDate = new Date(m.date);
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    return mDate >= thirtyDaysAgo;
  });
  
  // Manipuladores de eventos
  const handleConfirmInspection = async (vehicleId) => {
    try {
      const response = await fetch(`/api/vehicles/${vehicleId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inspectionStatus: 'confirmada',
          lastInspection: new Date().toISOString()
        }),
      });
      
      if (response.ok) {
        // Atualizar a lista de veículos
        const updatedVehicles = vehicles.map(vehicle => 
          vehicle._id === vehicleId 
            ? { 
                ...vehicle, 
                inspectionStatus: 'confirmada',
                lastInspection: new Date().toISOString()
              } 
            : vehicle
        );
        
        setVehicles(updatedVehicles);
      }
    } catch (error) {
      console.error('Erro ao confirmar inspeção:', error);
    }
  };
  
  const handleSendEmail = async (vehicleId) => {
    try {
      const response = await fetch(`/api/vehicles/${vehicleId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailSent: true
        }),
      });
      
      if (response.ok) {
        // Atualizar a lista de veículos
        const updatedVehicles = vehicles.map(vehicle => 
          vehicle._id === vehicleId 
            ? { 
                ...vehicle, 
                emailSent: true
              } 
            : vehicle
        );
        
        setVehicles(updatedVehicles);
      }
    } catch (error) {
      console.error('Erro ao enviar email:', error);
    }
  };
  
  if (isLoading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
  
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard 
          icon={<Car className="h-5 w-5 text-blue-600" />} 
          title="Total de Veículos" 
          value={vehicles.length} 
          bgColor="bg-blue-50" 
        />
        
        <StatCard 
          icon={<Clock className="h-5 w-5 text-yellow-600" />} 
          title="Inspeções Próximas" 
          value={upcomingInspections.length} 
          bgColor="bg-yellow-50" 
        />
        
        <StatCard 
          icon={<AlertTriangle className="h-5 w-5 text-red-600" />} 
          title="Inspeções Atrasadas" 
          value={overdueInspections.length} 
          bgColor="bg-red-50" 
        />
        
        <StatCard 
          icon={<Wrench className="h-5 w-5 text-green-600" />} 
          title="Manutenções Recentes" 
          value={recentMaintenance.length} 
          bgColor="bg-green-50" 
        />
      </div>
      
      {/* Inspeções Atrasadas */}
      {overdueInspections.length > 0 && (
        <InspectionsList 
          title="Inspeções Atrasadas" 
          description="Estes veículos precisam de atenção imediata. A inspeção já está atrasada."
          vehicles={overdueInspections}
          type="overdue"
          onConfirmInspection={handleConfirmInspection}
          onSendEmail={handleSendEmail}
        />
      )}
      
      {/* Inspeções Próximas */}
      {upcomingInspections.length > 0 && (
        <InspectionsList 
          title="Inspeções nos Próximos 30 Dias" 
          description="Veículos com inspeções programadas para breve."
          vehicles={upcomingInspections}
          type="upcoming"
          onConfirmInspection={handleConfirmInspection}
          onSendEmail={handleSendEmail}
        />
      )}

      {overdueInspections.length === 0 && upcomingInspections.length === 0 && (
        <Card className="mt-6">
          <CardContent className="p-6">
            <div className="text-center py-8">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <Car className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="mt-2 text-lg font-medium text-gray-900">Tudo em dia!</h3>
              <p className="mt-1 text-sm text-gray-500">
                Não há inspeções pendentes ou atrasadas no momento.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}