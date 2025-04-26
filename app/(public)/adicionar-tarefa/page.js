// app/(public)/adicionar-tarefa/page.js
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Tag, CheckCircle, AlertTriangle, Car } from 'lucide-react';

export default function AddTaskStandalonePage() {
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    vehicleId: '',
    category: 'maintenance',
    priority: 'medium',
    dueDate: '',
    estimatedCost: '',
    estimatedTime: '',
    tags: ''
  });
  
  // Inicializar componente apenas no cliente
  useEffect(() => {
    // Definir a data inicial após montagem
    setFormData(prev => ({
      ...prev,
      dueDate: new Date().toISOString().split('T')[0]
    }));
    
    // Carregar veículos
    async function fetchVehicles() {
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
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Preparar dados para envio
    const submitData = {
      ...formData,
      estimatedCost: formData.estimatedCost ? parseFloat(formData.estimatedCost) : 0,
      estimatedTime: formData.estimatedTime ? parseInt(formData.estimatedTime, 10) : 0,
      tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : []
    };
    
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });
      
      if (response.ok) {
        // Limpar o formulário
        setFormData({
          title: '',
          description: '',
          vehicleId: '',
          category: 'maintenance',
          priority: 'medium',
          dueDate: new Date().toISOString().split('T')[0],
          estimatedCost: '',
          estimatedTime: '',
          tags: ''
        });
        
        // Mostrar notificação de sucesso
        setNotification({
          type: 'success',
          message: 'Tarefa adicionada com sucesso!'
        });
        
        // Limpar a notificação após 3 segundos
        setTimeout(() => {
          setNotification(null);
        }, 3000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao adicionar tarefa');
      }
    } catch (error) {
      console.error('Erro ao adicionar tarefa:', error);
      setNotification({
        type: 'error',
        message: error.message || 'Ocorreu um erro ao adicionar a tarefa'
      });
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      {notification && (
        <div className={`fixed top-4 right-4 z-50 flex items-center p-4 mb-4 rounded-lg border 
          ${notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 
            'bg-red-50 border-red-200 text-red-800'}`}>
          <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 mr-3">
            {notification.type === 'success' ? <CheckCircle /> : <AlertTriangle />}
          </div>
          <div className="text-sm font-normal max-w-xs">{notification.message}</div>
          <button 
            type="button" 
            className="ml-3 -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex h-8 w-8 hover:bg-gray-200" 
            onClick={() => setNotification(null)}
          >
            <span className="sr-only">Fechar</span>
            <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
            </svg>
          </button>
        </div>
      )}
      
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">Adicionar Nova Tarefa</h1>
          <p className="text-gray-600 mt-1">Preencha o formulário para criar uma nova tarefa no sistema</p>
        </div>
        
        <Card>
          <form onSubmit={handleSubmit}>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Título *</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border rounded"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="Título da tarefa"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Descrição</label>
                  <textarea 
                    className="w-full p-2 border rounded"
                    name="description"
                    value={formData.description || ''}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Descrição detalhada da tarefa"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Veículo *</label>
                  <div className="flex items-center">
                    <Car className="h-5 w-5 mr-2 text-gray-400" />
                    <select 
                      className="w-full p-2 border rounded"
                      name="vehicleId"
                      value={formData.vehicleId}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Selecione um veículo</option>
                      {vehicles.map(vehicle => (
                        <option key={vehicle._id} value={vehicle._id}>
                          {vehicle.plate} - {vehicle.brand} {vehicle.model}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Categoria</label>
                    <select 
                      className="w-full p-2 border rounded"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                    >
                      <option value="maintenance">Manutenção</option>
                      <option value="repair">Reparação</option>
                      <option value="inspection">Inspeção</option>
                      <option value="other">Outro</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Prioridade</label>
                    <select 
                      className="w-full p-2 border rounded"
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                    >
                      <option value="low">Baixa</option>
                      <option value="medium">Média</option>
                      <option value="high">Alta</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Data Limite *</label>
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-gray-400" />
                      <input 
                        type="date" 
                        className="w-full p-2 border rounded"
                        name="dueDate"
                        value={formData.dueDate}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Custo Estimado (€)</label>
                    <div className="flex items-center">
                      <span className="h-5 w-5 mr-2 text-gray-400 flex items-center justify-center">€</span>
                      <input 
                        type="number" 
                        className="w-full p-2 border rounded"
                        name="estimatedCost"
                        value={formData.estimatedCost}
                        onChange={handleChange}
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Tempo Estimado (min)</label>
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-gray-400" />
                      <input 
                        type="number" 
                        className="w-full p-2 border rounded"
                        name="estimatedTime"
                        value={formData.estimatedTime}
                        onChange={handleChange}
                        min="0"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Tags (separadas por vírgula)</label>
                    <div className="flex items-center">
                      <Tag className="h-5 w-5 mr-2 text-gray-400" />
                      <input 
                        type="text" 
                        className="w-full p-2 border rounded"
                        name="tags"
                        value={formData.tags || ''}
                        onChange={handleChange}
                        placeholder="Ex: urgente, exterior, motor"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button 
                type="button"
                variant="outline"
                onClick={() => {
                  setFormData({
                    title: '',
                    description: '',
                    vehicleId: '',
                    category: 'maintenance',
                    priority: 'medium',
                    dueDate: new Date().toISOString().split('T')[0],
                    estimatedCost: '',
                    estimatedTime: '',
                    tags: ''
                  });
                }}
              >
                Limpar
              </Button>
              <Button 
                type="submit"
                className="bg-blue-600 hover:bg-blue-700"
              >
                Adicionar Tarefa
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800">
          <p className="text-center text-sm">
            Formulário de adição de tarefas para o sistema de gestão de frota.
            <br />
            As tarefas adicionadas aqui serão processadas pela equipe de gestão.
          </p>
        </div>
      </div>
    </div>
  );
}