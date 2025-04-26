// app/tarefas/page.js
'use client';

import { useState, useEffect } from 'react';
import { Plus, Filter } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import TaskList from '@/components/tasks/TaskList';
import TaskForm from '@/components/tasks/TaskForm';

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [vehiclesMap, setVehiclesMap] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [filter, setFilter] = useState({
    status: 'all', // Modificado para mostrar todas as tarefas por padrão
    vehicleId: '',
    priority: ''
  });
  
  // Carregar dados
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        // Carregar veículos
        const vehiclesResponse = await fetch('/api/vehicles');
        const vehiclesData = await vehiclesResponse.json();
        
        // Criar mapa de veículos para acesso rápido
        const vMap = {};
        vehiclesData.forEach(vehicle => {
          vMap[vehicle._id] = vehicle;
        });
        
        // Carregar tarefas (usando os filtros)
        let url = '/api/tasks';
        const params = new URLSearchParams();
        
        if (filter.status && filter.status !== 'all') {
          params.append('status', filter.status);
        }
        if (filter.vehicleId) {
          params.append('vehicleId', filter.vehicleId);
        }
        
        if (params.toString()) {
          url += `?${params.toString()}`;
        }
        
        const tasksResponse = await fetch(url);
        const tasksData = await tasksResponse.json();
        
        // Filtrar por prioridade (feito no cliente porque não temos filtro de prioridade na API)
        const filteredTasks = filter.priority 
          ? tasksData.filter(task => task.priority === filter.priority)
          : tasksData;
        
        setVehicles(vehiclesData);
        setVehiclesMap(vMap);
        setTasks(filteredTasks);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, [filter]);
  
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
        // Atualizar a tarefa na lista
        const updatedTask = await response.json();
        setTasks(tasks.map(task => 
          task._id === taskId ? updatedTask : task
        ));
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
          // Remover a tarefa da lista
          setTasks(tasks.filter(task => task._id !== taskId));
        }
      } catch (error) {
        console.error('Erro ao excluir tarefa:', error);
      }
    }
  };
  
  // Função para editar tarefa
  const handleEditTask = (task) => {
    setEditingTask(task);
    setSelectedVehicleId(task.vehicleId);
    setShowForm(true);
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
        
        // Adicionar à lista de tarefas se corresponder aos filtros atuais
        if (
          (filter.status === 'all' || newTask.status === filter.status) &&
          (!filter.vehicleId || newTask.vehicleId === filter.vehicleId) &&
          (!filter.priority || newTask.priority === filter.priority)
        ) {
          setTasks([...tasks, newTask]);
        }
        
        // Fechar formulário
        setShowForm(false);
        setSelectedVehicleId(null);
      }
    } catch (error) {
      console.error('Erro ao adicionar tarefa:', error);
    }
  };
  
  // Função para atualizar tarefa
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
        setShowForm(false);
        setSelectedVehicleId(null);
      }
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
    }
  };
  
  // Handler para clicar em "Adicionar Tarefa"
  const handleClickAddTask = (vehicleId = null) => {
    setEditingTask(null);
    setSelectedVehicleId(vehicleId);
    setShowForm(true);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestão de Tarefas</h1>
        <Button onClick={() => handleClickAddTask()} className="flex items-center">
          <Plus className="mr-2" size={16} />
          Adicionar Tarefa
        </Button>
      </div>
      
      {/* Filtros */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Filter className="mr-2" size={18} />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select 
                className="w-full p-2 border rounded"
                value={filter.status}
                onChange={(e) => setFilter({...filter, status: e.target.value})}
              >
                <option value="all">Todos</option>
                <option value="pending">Pendentes</option>
                <option value="completed">Concluídas</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Veículo</label>
              <select 
                className="w-full p-2 border rounded"
                value={filter.vehicleId}
                onChange={(e) => setFilter({...filter, vehicleId: e.target.value})}
              >
                <option value="">Todos os veículos</option>
                {vehicles.map(vehicle => (
                  <option key={vehicle._id} value={vehicle._id}>
                    {vehicle.plate} - {vehicle.brand} {vehicle.model}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Prioridade</label>
              <select 
                className="w-full p-2 border rounded"
                value={filter.priority}
                onChange={(e) => setFilter({...filter, priority: e.target.value})}
              >
                <option value="">Todas</option>
                <option value="high">Alta</option>
                <option value="medium">Média</option>
                <option value="low">Baixa</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Formulário de adição/edição de tarefa */}
      {showForm && (
        <div className="mb-6">
          <TaskForm 
            vehicleId={selectedVehicleId}
            onSubmit={editingTask ? handleUpdateTask : handleAddTask}
            onCancel={() => {
              setShowForm(false);
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
  );
}