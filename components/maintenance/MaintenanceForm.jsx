// Componente para adicionar/editar manutenção
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function MaintenanceForm({ 
  vehicleId, 
  onSubmit, 
  onCancel, 
  initialData = null, 
  isEditing = false,
  currentVehicleMileage = 0
}) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'Revisão',
    description: '',
    cost: '',
    mileage: currentVehicleMileage || ''
  });
  
  // Preencher form com dados iniciais se disponíveis
  useEffect(() => {
    if (initialData) {
      // Formatar datas para o formato esperado pelos inputs
      const formattedData = {
        ...initialData,
        date: initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        cost: initialData.cost || '',
        mileage: initialData.mileage || currentVehicleMileage || ''
      };
      setFormData(formattedData);
    } else if (currentVehicleMileage) {
      setFormData(prev => ({
        ...prev,
        mileage: currentVehicleMileage
      }));
    }
  }, [initialData, currentVehicleMileage]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Converter custo para número
    const submitData = {
      ...formData,
      vehicleId: vehicleId,
      cost: parseFloat(formData.cost),
      mileage: parseInt(formData.mileage, 10)
    };
    
    onSubmit(submitData);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Editar Manutenção' : 'Adicionar Manutenção'}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block mb-1">Data</label>
              <input 
                type="date" 
                className="w-full p-2 border rounded"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block mb-1">Tipo</label>
              <select 
                className="w-full p-2 border rounded"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
              >
                <option value="Revisão">Revisão</option>
                <option value="Reparação">Reparação</option>
                <option value="Inspeção">Inspeção</option>
                <option value="Outro">Outro</option>
              </select>
            </div>
            <div>
              <label className="block mb-1">Descrição</label>
              <textarea 
                className="w-full p-2 border rounded"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                required
              />
            </div>
            <div>
              <label className="block mb-1">Custo (€)</label>
              <input 
                type="number" 
                className="w-full p-2 border rounded"
                name="cost"
                value={formData.cost}
                onChange={handleChange}
                step="0.01"
                min="0"
                required
              />
            </div>
            <div>
              <label className="block mb-1">Quilometragem Atual</label>
              <input 
                type="number" 
                className="w-full p-2 border rounded"
                name="mileage"
                value={formData.mileage}
                onChange={handleChange}
                min="0"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Esta informação atualizará a quilometragem atual do veículo
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
            {isEditing ? 'Atualizar' : 'Adicionar'} Manutenção
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}