// components/users/UserForm.jsx
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Mail, Phone, MessageSquare, Star } from 'lucide-react';

export default function UserForm({ onSubmit, onCancel, initialData = null, isEditing = false }) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    whatsapp: initialData?.whatsapp || '',
    isPrimaryManager: initialData?.isPrimaryManager || false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err.message || 'Ocorreu um erro ao processar o usuário.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Editar Usuário' : 'Adicionar Novo Usuário'}</CardTitle>
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
              <label className="block mb-1 flex items-center">
                <User className="w-4 h-4 mr-2" />
                Nome *
              </label>
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
              <label className="block mb-1 flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                Email *
              </label>
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
            
            <div>
              <label className="block mb-1 flex items-center">
                <Phone className="w-4 h-4 mr-2" />
                Telefone
              </label>
              <input 
                type="tel" 
                name="phone"
                className="w-full p-2 border rounded"
                value={formData.phone}
                onChange={handleChange}
                placeholder="9XXXXXXXX"
              />
              <p className="text-xs text-gray-500 mt-1">
                Formato: 9XXXXXXXX ou +351 9XXXXXXXX
              </p>
            </div>
            
            <div>
              <label className="block mb-1 flex items-center">
                <MessageSquare className="w-4 h-4 mr-2" />
                Número de WhatsApp
              </label>
              <input 
                type="tel" 
                name="whatsapp"
                className="w-full p-2 border rounded"
                value={formData.whatsapp}
                onChange={handleChange}
                placeholder="9XXXXXXXX"
              />
              <p className="text-xs text-gray-500 mt-1">
                Deixe em branco se for o mesmo que o telefone
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                id="isPrimaryManager"
                name="isPrimaryManager"
                className="w-4 h-4"
                checked={formData.isPrimaryManager}
                onChange={handleChange}
              />
              <label htmlFor="isPrimaryManager" className="flex items-center cursor-pointer">
                <Star className="w-4 h-4 mr-2 text-yellow-500" />
                Gestor Principal
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Os gestores principais recebem todas as notificações do sistema
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button 
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting 
              ? 'Processando...' 
              : isEditing ? 'Atualizar' : 'Adicionar Usuário'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}