'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Car, Clock, Wrench, AlertTriangle } from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import InspectionsList from '@/components/dashboard/InspectionsList';
import { getDaysUntilInspection } from '@/lib/utils/inspection-calculator';

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
          inspectionStatus: 'confirmada'
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
  
  if (isLoading) return <div>Carregando...</div>;
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={<Car />} 
          title="Total de Veículos" 
          value={vehicles.length} 
          bgColor="bg-blue-50" 
        />
        
        <StatCard 
          icon={<Clock />} 
          title="Inspeções Próximas" 
          value={upcomingInspections.length} 
          bgColor="bg-yellow-50" 
        />
        
        <StatCard 
          icon={<AlertTriangle />} 
          title="Inspeções Atrasadas" 
          value={overdueInspections.length} 
          bgColor="bg-red-50" 
        />
        
        <StatCard 
          icon={<Wrench />} 
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
    </div>
  );
}
