// components/users/UserForm.jsx
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function UserForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err.message || 'Ocorreu um erro ao adicionar o usuário.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Adicionar Novo Usuário</CardTitle>
        <CardDescription>Preencha os detalhes do usuário responsável</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block mb-1">Nome *</label>
              <input 
                type="text" 
                name="name"
                className="w-full p-2 border rounded"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Nome completo"
              />
            </div>
            <div>
              <label className="block mb-1">Email *</label>
              <input 
                type="email" 
                name="email"
                className="w-full p-2 border rounded"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="email@exemplo.com"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            type="button"
            className="bg-gray-200 text-gray-800"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button 
            type="submit"
            className="bg-blue-500 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Adicionando...' : 'Adicionar Usuário'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
