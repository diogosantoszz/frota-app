'use client';

import { useState, useEffect } from 'react';
import { Car, Clock, Wrench, AlertTriangle, Plus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/modern-card';
import { Button } from '@/components/ui/modern-button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import TaskList from '@/components/tasks/TaskList';
import TaskForm from '@/components/tasks/TaskForm';

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
  const [tasks, setTasks] = useState([]);  // Novo estado para tarefas
  const [isLoading, setIsLoading] = useState(true);
  
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
        
        // Carregar tarefas pendentes
        const tasksResponse = await fetch('/api/tasks?status=pending');
        const tasksData = await tasksResponse.json();
        
        setVehicles(vehiclesData);
        setMaintenance(maintenanceData);
        setTasks(tasksData);
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
      // Primeiro, obter os dados do veículo para ter a quilometragem atual
      const vehicleResponse = await fetch(`/api/vehicles/${vehicleId}`);
      if (!vehicleResponse.ok) {
        throw new Error('Erro ao obter dados do veículo');
      }
      
      const vehicleData = await vehicleResponse.json();
      const currentMileage = vehicleData.currentMileage || 0;
      
      // Atualizar o veículo com inspeção confirmada e atualizar a quilometragem da inspeção
      const response = await fetch(`/api/vehicles/${vehicleId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inspectionStatus: 'confirmada',
          lastInspection: new Date().toISOString(),
          lastInspectionMileage: currentMileage
        }),
      });
      
      if (response.ok) {
        // Registrar a inspeção como uma manutenção
        const maintenanceResponse = await fetch('/api/maintenance', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            vehicleId,
            date: new Date().toISOString(),
            type: 'Inspeção',
            description: 'Inspeção periódica obrigatória',
            cost: 0, // O custo pode ser atualizado posteriormente
            mileage: currentMileage
          }),
        });
        
        // Atualizar a lista de veículos
        const updatedVehicles = vehicles.map(vehicle => 
          vehicle._id === vehicleId 
            ? { 
                ...vehicle, 
                inspectionStatus: 'confirmada',
                lastInspection: new Date().toISOString(),
                lastInspectionMileage: currentMileage
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
  
  // Converter array de veículos para um objeto para acesso mais fácil
  const vehiclesMap = {};
  vehicles.forEach(vehicle => {
    vehiclesMap[vehicle._id] = vehicle;
  });
  
  // Função para marcar tarefa como concluída
  const handleMarkTaskComplete = async (taskId) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'completed',
          completedAt: new Date().toISOString()
        }),
      });
      
      if (response.ok) {
        // Atualizar a lista de tarefas
        setTasks(tasks.filter(task => task._id !== taskId));
      }
    } catch (error) {
      console.error('Erro ao concluir tarefa:', error);
    }
  };
  
  // Função para deletar tarefa
  const handleDeleteTask = async (taskId) => {
    if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
      try {
        const response = await fetch(`/api/tasks/${taskId}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          // Atualizar a lista de tarefas
          setTasks(tasks.filter(task => task._id !== taskId));
        }
      } catch (error) {
        console.error('Erro ao excluir tarefa:', error);
      }
    }
  };
  
  // Estado para edição de tarefa
  const [editingTask, setEditingTask] = useState(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  
  // Função para editar tarefa
  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };
  
  // Função para salvar tarefa editada
  const handleUpdateTask = async (updatedData) => {
    try {
      const response = await fetch(`/api/tasks/${editingTask._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });
      
      if (response.ok) {
        const updatedTask = await response.json();
        
        // Atualizar a lista de tarefas
        setTasks(tasks.map(task => 
          task._id === updatedTask._id ? updatedTask : task
        ));
        
        // Fechar formulário de edição
        setEditingTask(null);
        setShowTaskForm(false);
      }
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
    }
  };
  
  // Função para adicionar nova tarefa
  const handleAddTask = async (taskData) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });
      
      if (response.ok) {
        const newTask = await response.json();
        
        // Adicionar à lista de tarefas
        setTasks([...tasks, newTask]);
        
        // Fechar formulário
        setShowTaskForm(false);
        setSelectedVehicleId(null);
      }
    } catch (error) {
      console.error('Erro ao adicionar tarefa:', error);
    }
  };
  
  // Manipular o clique em "Adicionar Tarefa"
  const handleClickAddTask = (vehicleId = null) => {
    setEditingTask(null);
    setSelectedVehicleId(vehicleId);
    setShowTaskForm(true);
  };

  if (isLoading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
  
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Cards de estatísticas existentes */}
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
          title="Tarefas Pendentes" 
          value={tasks.length} 
          bgColor="bg-green-50" 
        />
      </div>
      
      {/* Seção de tarefas pendentes */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Tarefas Pendentes</h2>
          <Button onClick={() => handleClickAddTask()} className="flex items-center">
            <Plus className="mr-2" size={16} />
            Adicionar Tarefa
          </Button>
        </div>
        
        {/* Formulário de adição/edição de tarefa */}
        {showTaskForm && (
          <div className="mb-6">
            <TaskForm 
              vehicleId={selectedVehicleId}
              onSubmit={editingTask ? handleUpdateTask : handleAddTask}
              onCancel={() => {
                setShowTaskForm(false);
                setEditingTask(null);
                setSelectedVehicleId(null);
              }}
              initialData={editingTask}
              isEditing={!!editingTask}
            />
          </div>
        )}
        
        {/* Lista de tarefas */}
        <TaskList 
          tasks={tasks}
          showVehicle={true}
          vehicles={vehiclesMap}
          onMarkComplete={handleMarkTaskComplete}
          onEdit={handleEditTask}
          onDelete={handleDeleteTask}
        />
      </div>
      
      {/* Inspeções Atrasadas e Próximas (código existente) */}
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

      {overdueInspections.length === 0 && upcomingInspections.length === 0 && tasks.length === 0 && (
        <Card className="mt-6">
          <CardContent className="p-6">
            <div className="text-center py-8">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <Car className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="mt-2 text-lg font-medium text-gray-900">Tudo em dia!</h3>
              <p className="mt-1 text-sm text-gray-500">
                Não há inspeções pendentes, atrasadas ou tarefas a realizar no momento.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}