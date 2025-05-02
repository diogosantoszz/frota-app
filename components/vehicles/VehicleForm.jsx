// components/vehicles/VehicleForm.jsx
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function VehicleForm({ onSubmit, onCancel, initialData = null, isEditing = false }) {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    plate: '',
    brand: '',
    model: '',
    firstRegistrationDate: '',
    company: '',
    userId: '',
    lastInspection: '',
    // Novos campos
    frontTires: '',
    rearTires: '',
    initialMileage: '',
    currentMileage: '',
    lastInspectionMileage: ''
  });
  
  // Carregar usuários
  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch('/api/users');
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        }
      } catch (error) {
        console.error('Erro ao carregar usuários:', error);
      }
    }
    
    fetchUsers();
  }, []);
  
  // Preencher form com dados iniciais se disponíveis
  useEffect(() => {
    if (initialData) {
      // Formatar datas para o formato esperado pelos inputs
      const formattedData = {
        ...initialData,
        firstRegistrationDate: initialData.firstRegistrationDate ? new Date(initialData.firstRegistrationDate).toISOString().split('T')[0] : '',
        lastInspection: initialData.lastInspection ? new Date(initialData.lastInspection).toISOString().split('T')[0] : '',
        nextInspection: initialData.nextInspection ? new Date(initialData.nextInspection).toISOString().split('T')[0] : '',
        // Garantir que os novos campos existam
        frontTires: initialData.frontTires || '',
        rearTires: initialData.rearTires || '',
        initialMileage: initialData.initialMileage || 0,
        currentMileage: initialData.currentMileage || 0,
        lastInspectionMileage: initialData.lastInspectionMileage || 0
      };
      setFormData(formattedData);
    }
  }, [initialData]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Converter campos numéricos para número
    if (['initialMileage', 'currentMileage', 'lastInspectionMileage'].includes(name)) {
      const numValue = parseInt(value, 10);
      setFormData(prev => ({
        ...prev,
        [name]: isNaN(numValue) ? '' : numValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Encontrar dados do usuário selecionado
    const selectedUser = users.find(user => user._id === formData.userId);
    
    // Adicionar nome e email do usuário selecionado
    const submitData = {
      ...formData,
      userName: selectedUser ? selectedUser.name : '',
      userEmail: selectedUser ? selectedUser.email : ''
    };
    
    // Se for um novo veículo e a quilometragem atual não estiver definida,
    // usar a quilometragem inicial como a atual
    if (!isEditing && submitData.initialMileage && !submitData.currentMileage) {
      submitData.currentMileage = submitData.initialMileage;
    }
    
    // Se for um novo veículo e a quilometragem da última inspeção não estiver definida,
    // usar a quilometragem atual como a da última inspeção
    if (!isEditing && submitData.currentMileage && !submitData.lastInspectionMileage) {
      submitData.lastInspectionMileage = submitData.currentMileage;
    }
    
    onSubmit(submitData);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? 'Editar Veículo' : 'Adicionar Novo Veículo'}</CardTitle>
        <CardDescription>Preencha os detalhes do veículo</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Matrícula *</label>
              <input 
                type="text" 
                name="plate"
                className="w-full p-2 border rounded"
                value={formData.plate}
                onChange={handleChange}
                required
                placeholder="AA-00-AA"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Marca *</label>
              <input 
                type="text" 
                name="brand"
                className="w-full p-2 border rounded"
                value={formData.brand}
                onChange={handleChange}
                required
                placeholder="Ex: Toyota, Renault, etc."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Modelo *</label>
              <input 
                type="text" 
                name="model"
                className="w-full p-2 border rounded"
                value={formData.model}
                onChange={handleChange}
                required
                placeholder="Ex: Corolla, Clio, etc."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Data da Primeira Matrícula *</label>
              <input 
                type="date" 
                name="firstRegistrationDate"
                className="w-full p-2 border rounded"
                value={formData.firstRegistrationDate}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Empresa *</label>
              <input 
                type="text" 
                name="company"
                className="w-full p-2 border rounded"
                value={formData.company}
                onChange={handleChange}
                required
                placeholder="Nome da empresa"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Responsável *</label>
              <select 
                name="userId"
                className="w-full p-2 border rounded"
                value={formData.userId}
                onChange={handleChange}
                required
              >
                <option value="">Selecione um responsável</option>
                {users.map(user => (
                  <option key={user._id} value={user._id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>
            
            {/* Novos campos de pneus */}
            <div>
              <label className="block text-sm font-medium mb-1">Medida dos Pneus Dianteiros</label>
              <input 
                type="text" 
                name="frontTires"
                className="w-full p-2 border rounded"
                value={formData.frontTires}
                onChange={handleChange}
                placeholder="Ex: 205/55 R16"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Medida dos Pneus Traseiros</label>
              <input 
                type="text" 
                name="rearTires"
                className="w-full p-2 border rounded"
                value={formData.rearTires}
                onChange={handleChange}
                placeholder="Ex: 205/55 R16"
              />
            </div>
            
            {/* Novos campos de quilometragem */}
            <div>
              <label className="block text-sm font-medium mb-1">Quilometragem Inicial</label>
              <input 
                type="number" 
                name="initialMileage"
                className="w-full p-2 border rounded"
                value={formData.initialMileage}
                onChange={handleChange}
                placeholder="Quilometragem quando adicionado ao sistema"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Quilometragem Atual</label>
              <input 
                type="number" 
                name="currentMileage"
                className="w-full p-2 border rounded"
                value={formData.currentMileage}
                onChange={handleChange}
                placeholder="Quilometragem atual"
              />
              <p className="text-xs text-gray-500 mt-1">
                {!isEditing && "Se não informada, será usada a quilometragem inicial"}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Data da Última Inspeção</label>
              <input 
                type="date" 
                name="lastInspection"
                className="w-full p-2 border rounded"
                value={formData.lastInspection}
                onChange={handleChange}
                placeholder="Data da última inspeção"
              />
              <p className="text-xs text-gray-500 mt-1">
                Definir esta data atualizará automaticamente o status para "confirmada"
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Quilometragem na Última Inspeção</label>
              <input 
                type="number" 
                name="lastInspectionMileage"
                className="w-full p-2 border rounded"
                value={formData.lastInspectionMileage}
                onChange={handleChange}
                placeholder="Quilometragem na última inspeção"
              />
              <p className="text-xs text-gray-500 mt-1">
                {!isEditing && "Se não informada, será usada a quilometragem atual"}
              </p>
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
            className="bg-blue-500 text-white"
          >
            {isEditing ? 'Atualizar' : 'Adicionar'} Veículo
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}