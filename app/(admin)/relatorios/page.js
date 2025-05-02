// app/(admin)/relatorios/page.js - com as correções
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { format, parseISO } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Car, Users, FileText, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { calculateAverageKmPerYear } from '@/lib/utils/mileage-calculator';
import { Button } from '@/components/ui/button';

export default function ReportsPage() {
  const [vehicles, setVehicles] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
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
  
  // Relatório por empresa (CORRIGIDO)
  const companyReport = () => {
    const report = {};
    
    // Inicializar relatório com contadores para cada empresa
    vehicles.forEach(vehicle => {
      if (!vehicle.company) return; // Ignorar veículos sem empresa
      
      if (!report[vehicle.company]) {
        report[vehicle.company] = {
          count: 0,
          totalCost: 0,
          upcomingInspections: 0,
          overdueInspections: 0,
          vehicles: []
        };
      }
      
      report[vehicle.company].count += 1;
      report[vehicle.company].vehicles.push(vehicle._id);
      
      // Verificar status de inspeção
      const nextInspection = new Date(vehicle.nextInspection);
      const today = new Date();
      const thirtyDaysLater = new Date();
      thirtyDaysLater.setDate(today.getDate() + 30);
      
      if (nextInspection < today && vehicle.inspectionStatus !== "confirmada") {
        report[vehicle.company].overdueInspections += 1;
      } else if (nextInspection >= today && nextInspection <= thirtyDaysLater && vehicle.inspectionStatus === "pendente") {
        report[vehicle.company].upcomingInspections += 1;
      }
    });
    
    // Adicionar custos de manutenção
    maintenance.forEach(record => {
      const vehicle = vehicles.find(v => v._id === record.vehicleId);
      if (vehicle && vehicle.company && report[vehicle.company]) {
        report[vehicle.company].totalCost += record.cost || 0;
      }
    });
    
    return Object.entries(report).map(([company, data]) => ({
      company,
      ...data
    }));
  };
  
  // Relatório por veículo
  const vehicleReport = () => {
    return vehicles.map(vehicle => {
      const vehicleMaintenance = maintenance.filter(m => m.vehicleId === vehicle._id);
      const totalCost = vehicleMaintenance.reduce((sum, m) => sum + (m.cost || 0), 0);
      
      // Calcular dias até a próxima inspeção
      const nextInspection = new Date(vehicle.nextInspection);
      const today = new Date();
      const daysUntil = Math.ceil((nextInspection - today) / (1000 * 60 * 60 * 24));
      
      // Calcular média de km por ano
      const kmPerYear = calculateAverageKmPerYear(
        vehicle.currentMileage,
        vehicle.initialMileage || 0,
        vehicle.firstRegistrationDate
      );
      
      return {
        ...vehicle,
        maintenanceCount: vehicleMaintenance.length,
        totalCost,
        daysUntil,
        kmPerYear
      };
    });
  };
  
  // Relatório mensal agrupado por ano - CORRIGIDO
  const monthlyReport = () => {
    // Agrupar por ano e mês
    const reportByYearMonth = {};
    
    maintenance.forEach(record => {
      if (!record.date) return; // Ignorar registros sem data
      
      const date = new Date(record.date);
      const year = date.getFullYear();
      const month = date.getMonth();
      
      // Criar entrada para o ano se não existir
      if (!reportByYearMonth[year]) {
        reportByYearMonth[year] = Array(12).fill().map(() => ({
          count: 0,
          cost: 0,
          inspections: 0,
          repairs: 0,
          services: 0
        }));
      }
      
      // Incrementar contadores para o mês
      reportByYearMonth[year][month].count += 1;
      reportByYearMonth[year][month].cost += record.cost || 0;
      
      if (record.type === "Inspeção") {
        reportByYearMonth[year][month].inspections += 1;
      } else if (record.type === "Reparação") {
        reportByYearMonth[year][month].repairs += 1;
      } else if (record.type === "Revisão") {
        reportByYearMonth[year][month].services += 1;
      }
    });
    
    // Obter anos disponíveis para navegação
    const availableYears = Object.keys(reportByYearMonth).map(Number).sort((a, b) => a - b);
    
    // Formatação do relatório para o ano selecionado
    if (!reportByYearMonth[selectedYear]) {
      return { months: [], availableYears, totals: { count: 0, cost: 0, inspections: 0, repairs: 0, services: 0 } };
    }
    
    const monthsData = reportByYearMonth[selectedYear].map((data, index) => {
      const date = new Date(selectedYear, index, 1);
      return {
        monthYear: `${selectedYear}-${String(index + 1).padStart(2, '0')}`,
        monthName: format(date, 'MMMM yyyy', { locale: pt }),
        ...data
      };
    });
    
    // Calcular totais para o ano selecionado
    const totals = monthsData.reduce((acc, month) => ({
      count: acc.count + month.count,
      cost: acc.cost + month.cost,
      inspections: acc.inspections + month.inspections,
      repairs: acc.repairs + month.repairs,
      services: acc.services + month.services
    }), { count: 0, cost: 0, inspections: 0, repairs: 0, services: 0 });
    
    return { months: monthsData, availableYears, totals };
  };
  
  if (isLoading) return <div>Carregando...</div>;
  
  const companies = companyReport();
  const vehiclesReport = vehicleReport();
  const { months, availableYears, totals } = monthlyReport();
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold mb-6">Relatórios</h1>
      
      {/* Relatório por Empresa - CORRIGIDO */}
      <Card>
        <CardHeader className="bg-blue-50">
          <CardTitle className="flex items-center">
            <Users className="mr-2" size={20} /> Relatório por Empresa
          </CardTitle>
          <CardDescription>
            Veículos e custos agrupados por empresa
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Empresa
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total de Veículos
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Inspeções Pendentes
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Inspeções Atrasadas
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Custo Total Manutenção (€)
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {companies.map((company, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {company.company}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      {company.count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      {company.upcomingInspections}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      {company.overdueInspections}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {company.totalCost.toFixed(2)} €
                    </td>
                  </tr>
                ))}
                
                {companies.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                      Nenhuma empresa encontrada
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      {/* Relatório por Veículo */}
      <Card>
        <CardHeader className="bg-green-50">
          <CardTitle className="flex items-center">
            <Car className="mr-2" size={20} /> Relatório por Veículo
          </CardTitle>
          <CardDescription>
            Custos de manutenção por veículo
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Veículo
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Matrícula
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Responsável
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Manutenções
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quilometragem
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Média Anual
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Custo Total (€)
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Próxima Inspeção
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {vehiclesReport.map(vehicle => (
                  <tr key={vehicle._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {vehicle.brand} {vehicle.model}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {vehicle.plate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {vehicle.userName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      {vehicle.maintenanceCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      {vehicle.currentMileage?.toLocaleString() || '0'} km
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      {vehicle.kmPerYear.toLocaleString()} km/ano
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {vehicle.totalCost.toFixed(2)} €
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span 
                        className={
                          vehicle.inspectionStatus === "atrasada" 
                            ? "text-red-500 font-semibold" 
                            : vehicle.inspectionStatus === "pendente" && vehicle.daysUntil < 30
                              ? "text-yellow-500 font-semibold"
                              : "text-gray-500"
                        }
                      >
                        {format(new Date(vehicle.nextInspection), 'dd/MM/yyyy', { locale: pt })}
                      </span>
                    </td>
                  </tr>
                ))}
                
                {vehiclesReport.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                      Nenhum veículo encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      {/* Manutenções por Mês - CORRIGIDO e agrupado por ano */}
      <Card>
        <CardHeader className="bg-purple-50">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Calendar className="mr-2" size={20} />
              <div>
                <CardTitle>Manutenções por Mês em {selectedYear}</CardTitle>
                <CardDescription>
                  Histórico de manutenções e custos por mês
                </CardDescription>
              </div>
            </div>
            
            {/* Controles de navegação por ano */}
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedYear(prev => prev - 1)}
                disabled={!availableYears.includes(selectedYear - 1)}
              >
                <ChevronLeft size={16} />
              </Button>
              <select
                className="px-2 py-1 border rounded text-sm"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
              >
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedYear(prev => prev + 1)}
                disabled={!availableYears.includes(selectedYear + 1)}
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mês
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Inspeções
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reparações
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revisões
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Custo Total (€)
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {months.map(month => (
                  <tr key={month.monthYear} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {month.monthName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      {month.count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      {month.inspections}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      {month.repairs}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      {month.services}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {month.cost.toFixed(2)} €
                    </td>
                  </tr>
                ))}
                
                {months.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                      Sem dados de manutenção para {selectedYear}
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="font-bold bg-gray-50">
                  <td className="px-6 py-4">Total</td>
                  <td className="px-6 py-4 text-center">{totals.count}</td>
                  <td className="px-6 py-4 text-center">{totals.inspections}</td>
                  <td className="px-6 py-4 text-center">{totals.repairs}</td>
                  <td className="px-6 py-4 text-center">{totals.services}</td>
                  <td className="px-6 py-4 text-right">
                    {totals.cost.toFixed(2)} €
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