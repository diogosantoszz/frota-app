// components/tasks/TaskForm.jsx
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Tag, AlertTriangle } from 'lucide-react';

export default function TaskForm({ 
  vehicleId = null, 
  onSubmit, 
  onCancel, 
  initialData = null, 
  isEditing = false 
}) {
  const [vehicles, setVehicles] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    vehicleId: vehicleId || '',
    category: 'maintenance',
    priority: 'medium',
    dueDate: new Date().toISOString().split('T')[0],
    estimatedCost: '',
    estimatedTime: '',
    tags: ''
  });
  
  // Carregar lista de veículos se não tiver um veículo pré-definido
  useEffect(() => {
    if (!vehicleId) {
      async function fetchVehicles() {
        try {
          const response = await fetch('/api/vehicles');
          if (response.ok) {
            const data = await response.json();
            setVehicles(data);
          }
        } catch (error) {
          console.error('Erro ao carregar veículos:', error);
        }
      }
      
      fetchVehicles();
    }
  }, [vehicleId]);
  
  // Preencher form com dados iniciais se disponíveis
  useEffect(() => {
    if (initialData) {
      // Formatar datas para o formato esperado pelos inputs
      const formattedData = {
        ...initialData,
        dueDate: initialData.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        estimatedCost: initialData.estimatedCost || '',
        estimatedTime: initialData.estimatedTime || '',
        tags: initialData.tags ? initialData.tags.join(', ') : ''
      };
      setFormData(formattedData);
    } else if (vehicleId) {
      setFormData(prev => ({
        ...prev,
        vehicleId
      }));
    }
  }, [initialData, vehicleId]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Preparar dados para envio
    const submitData = {
      ...formData,
      estimatedCost: formData.estimatedCost ? parseFloat(formData.estimatedCost) : 0,
      estimatedTime: formData.estimatedTime ? parseInt(formData.estimatedTime, 10) : 0,
      tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : []
    };
    
    onSubmit(submitData);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Editar Tarefa' : 'Adicionar Nova Tarefa'}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
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
            
            {!vehicleId && (
              <div>
                <label className="block text-sm font-medium mb-1">Veículo *</label>
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
            )}
            
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
        <CardFooter className="flex justify-between">
          <Button 
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancelar
          </Button>
          <Button 
            type="submit"
          >
            {isEditing ? 'Atualizar' : 'Adicionar'} Tarefa
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}