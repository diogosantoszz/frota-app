'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import VehicleForm from '@/components/vehicles/VehicleForm';

export default function AddVehiclePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/vehicles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (response.ok) {
        // Redirecionar para a lista de veículos após sucesso
        router.push('/veiculos');
      } else {
        const errorData = await response.json();
        alert(`Erro ao adicionar veículo: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Erro ao adicionar veículo:', error);
      alert('Ocorreu um erro ao adicionar o veículo. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleCancel = () => {
    router.push('/veiculos');
  };
  
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Adicionar Novo Veículo</h1>
      
      <VehicleForm 
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
}
