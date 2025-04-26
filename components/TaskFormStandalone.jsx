// components/TaskFormStandalone.jsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Tag, CheckCircle, AlertTriangle, Car } from 'lucide-react';

export default function TaskFormStandalone() {
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [formData, setFormData] = useState({
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
  
  // Carregar lista de veículos
  useEffect(() => {
    async function fetchVehicles() {
      try {
        const response = await fetch('/api/vehicles');
        if (response.ok) {
          const data = await response.json();
          setVehicles(data);
        }
      } catch (error) {
        console.error('Erro ao carregar veículos:', error);
        setNotification({
          type: 'error',
          message: 'Erro ao carregar veículos. Por favor, recarregue a página.'
        });
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
  
  const resetForm = () => {
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
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Estilo customizado para esta página
  return (
    <div className="min-h-screen bg-gray-50" style={{ 
      padding: '2rem',
      fontFamily: 'system-ui, -apple-system, sans-serif' 
    }}>
      {notification && (
        <div 
          style={{
            position: 'fixed',
            top: '1rem',
            right: '1rem',
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            padding: '1rem',
            borderRadius: '0.5rem',
            border: '1px solid',
            borderColor: notification.type === 'success' ? '#d1fae5' : '#fee2e2',
            backgroundColor: notification.type === 'success' ? '#ecfdf5' : '#fef2f2',
            color: notification.type === 'success' ? '#065f46' : '#b91c1c',
          }}
        >
          <div style={{ marginRight: '0.75rem' }}>
            {notification.type === 'success' ? <CheckCircle size={24} /> : <AlertTriangle size={24} />}
          </div>
          <div style={{ fontSize: '0.875rem', maxWidth: '20rem' }}>
            {notification.message}
          </div>
          <button 
            style={{
              marginLeft: '0.75rem',
              padding: '0.375rem',
              borderRadius: '0.375rem',
              backgroundColor: 'transparent',
              cursor: 'pointer',
            }}
            onClick={() => setNotification(null)}
          >
            <span style={{ display: 'none' }}>Fechar</span>
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
            </svg>
          </button>
        </div>
      )}
      
      <div style={{ maxWidth: '32rem', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            Adicionar Nova Tarefa
          </h1>
          <p style={{ color: '#4b5563', marginTop: '0.25rem' }}>
            Preencha o formulário para criar uma nova tarefa no sistema
          </p>
        </div>
        
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '0.5rem', 
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          overflow: 'hidden'
        }}>
          <form onSubmit={handleSubmit}>
            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                    Título *
                  </label>
                  <input 
                    type="text" 
                    style={{ 
                      width: '100%', 
                      padding: '0.5rem', 
                      border: '1px solid #d1d5db', 
                      borderRadius: '0.375rem' 
                    }}
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="Título da tarefa"
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                    Descrição
                  </label>
                  <textarea 
                    style={{ 
                      width: '100%', 
                      padding: '0.5rem', 
                      border: '1px solid #d1d5db', 
                      borderRadius: '0.375rem',
                      minHeight: '5rem'
                    }}
                    name="description"
                    value={formData.description || ''}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Descrição detalhada da tarefa"
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                    Veículo *
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Car style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.5rem', color: '#9ca3af' }} />
                    <select 
                      style={{ 
                        width: '100%', 
                        padding: '0.5rem', 
                        border: '1px solid #d1d5db', 
                        borderRadius: '0.375rem' 
                      }}
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
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                      Categoria
                    </label>
                    <select 
                      style={{ 
                        width: '100%', 
                        padding: '0.5rem', 
                        border: '1px solid #d1d5db', 
                        borderRadius: '0.375rem' 
                      }}
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
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                      Prioridade
                    </label>
                    <select 
                      style={{ 
                        width: '100%', 
                        padding: '0.5rem', 
                        border: '1px solid #d1d5db', 
                        borderRadius: '0.375rem' 
                      }}
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
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                      Data Limite *
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Calendar style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.5rem', color: '#9ca3af' }} />
                      <input 
                        type="date" 
                        style={{ 
                          width: '100%', 
                          padding: '0.5rem', 
                          border: '1px solid #d1d5db', 
                          borderRadius: '0.375rem' 
                        }}
                        name="dueDate"
                        value={formData.dueDate}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                      Custo Estimado (€)
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ 
                        width: '1.25rem', 
                        height: '1.25rem', 
                        marginRight: '0.5rem', 
                        color: '#9ca3af',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>€</span>
                      <input 
                        type="number" 
                        style={{ 
                          width: '100%', 
                          padding: '0.5rem', 
                          border: '1px solid #d1d5db', 
                          borderRadius: '0.375rem' 
                        }}
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
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                      Tempo Estimado (min)
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Clock style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.5rem', color: '#9ca3af' }} />
                      <input 
                        type="number" 
                        style={{ 
                          width: '100%', 
                          padding: '0.5rem', 
                          border: '1px solid #d1d5db', 
                          borderRadius: '0.375rem' 
                        }}
                        name="estimatedTime"
                        value={formData.estimatedTime}
                        onChange={handleChange}
                        min="0"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                      Tags (separadas por vírgula)
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Tag style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.5rem', color: '#9ca3af' }} />
                      <input 
                        type="text" 
                        style={{ 
                          width: '100%', 
                          padding: '0.5rem', 
                          border: '1px solid #d1d5db', 
                          borderRadius: '0.375rem' 
                        }}
                        name="tags"
                        value={formData.tags || ''}
                        onChange={handleChange}
                        placeholder="Ex: urgente, exterior, motor"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              padding: '1rem 1.5rem',
              borderTop: '1px solid #e5e7eb',
              gap: '0.5rem'
            }}>
              <button 
                type="button"
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '0.375rem',
                  backgroundColor: 'transparent',
                  border: '1px solid #d1d5db',
                  color: '#374151',
                  fontWeight: '500',
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
                onClick={resetForm}
              >
                Limpar
              </button>
              <button 
                type="submit"
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '0.375rem',
                  backgroundColor: '#2563eb',
                  border: 'none',
                  color: 'white',
                  fontWeight: '500',
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                Adicionar Tarefa
              </button>
            </div>
          </form>
        </div>
        
        <div style={{ 
          marginTop: '1.5rem',
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '0.5rem',
          padding: '1rem',
          color: '#1e40af'
        }}>
          <p style={{ textAlign: 'center', fontSize: '0.875rem' }}>
            Formulário de adição de tarefas para o sistema de gestão de frota.
            <br />
            As tarefas adicionadas aqui serão processadas pela equipe de gestão.
          </p>
        </div>
      </div>
    </div>
  );
}