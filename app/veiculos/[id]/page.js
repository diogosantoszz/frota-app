'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash, CheckCircle, Mail, ArrowLeft, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import Link from 'next/link';
import VehicleForm from '@/components/vehicles/VehicleForm';

export default function VehicleDetailsPage({ params }) {
  const router = useRouter();
  const { id } = params;
  
  const [vehicle, setVehicle] = useState(null);
  const [maintenance, setMaintenance] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingMaintenance, setEditingMaintenance] = useState(null);
  const [showDeleteMaintenanceConfirm, setShowDeleteMaintenanceConfirm] = useState(null);
  const [newMaintenance, setNewMaintenance] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'Revisão',
    description: '',
    cost: ''
  });
  const [notification, setNotification] = useState(null);
  
  // Carregar dados do veículo e manutenções
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        // Carregar veículo
        const vehicleResponse = await fetch(`/api/vehicles/${id}`);
        if (!vehicleResponse.ok) {
          throw new Error('Veículo não encontrado');
        }
        const vehicleData = await vehicleResponse.json();
        
        // Carregar manutenções
        const maintenanceResponse = await fetch(`/api/maintenance/vehicle/${id}`);
        const maintenanceData = await maintenanceResponse.json();
        
        setVehicle(vehicleData);
        setMaintenance(maintenanceData);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setNotification({
          type: 'error',
          message: 'Erro ao carregar dados do veículo: ' + error.message
        });
        router.push('/veiculos');
      } finally {
        setIsLoading(false);
      }
    }
    
    if (id) {
      fetchData();
    }
  }, [id, router]);
  
  // Função para deletar o veículo
  const handleDeleteVehicle = async () => {
    try {
      const response = await fetch(`/api/vehicles/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setNotification({
          type: 'success',
          message: 'Veículo excluído com sucesso!'
        });
        
        // Redirecionar para a lista de veículos após exclusão
        setTimeout(() => {
          router.push('/veiculos');
        }, 1500);
      } else {
        const errorData = await response.json();
        setNotification({
          type: 'error',
          message: `Erro ao excluir veículo: ${errorData.error || 'Erro desconhecido'}`
        });
      }
    } catch (error) {
      console.error('Erro ao excluir veículo:', error);
      setNotification({
        type: 'error',
        message: 'Ocorreu um erro ao excluir o veículo'
      });
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  // Função para atualizar o veículo
  const handleUpdateVehicle = async (updatedData) => {
    try {
      const response = await fetch(`/api/vehicles/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });
      
      if (response.ok) {
        const updatedVehicle = await response.json();
        setVehicle(updatedVehicle);
        setIsEditing(false);
        setNotification({
          type: 'success',
          message: 'Veículo atualizado com sucesso!'
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao atualizar veículo');
      }
    } catch (error) {
      console.error('Erro ao atualizar veículo:', error);
      setNotification({
        type: 'error',
        message: error.message || 'Ocorreu um erro ao atualizar o veículo'
      });
    }
  };
  
  // Função para adicionar manutenção
  const handleAddMaintenance = async (e) => {
    e.preventDefault();
    
    try {
      const maintenanceData = {
        ...newMaintenance,
        vehicleId: id,
        cost: parseFloat(newMaintenance.cost)
      };
      
      const response = await fetch('/api/maintenance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(maintenanceData),
      });
      
      if (response.ok) {
        const addedMaintenance = await response.json();
        
        // Atualizar a lista de manutenções
        setMaintenance([addedMaintenance, ...maintenance]);
        
        // Resetar o formulário
        setNewMaintenance({
          date: new Date().toISOString().split('T')[0],
          type: 'Revisão',
          description: '',
          cost: ''
        });
        
        setNotification({
          type: 'success',
          message: 'Manutenção adicionada com sucesso!'
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao adicionar manutenção');
      }
    } catch (error) {
      console.error('Erro ao adicionar manutenção:', error);
      setNotification({
        type: 'error',
        message: error.message || 'Ocorreu um erro ao adicionar a manutenção'
      });
    }
  };
  
  // Função para excluir manutenção
  const handleDeleteMaintenance = async (maintenanceId) => {
    try {
      const response = await fetch(`/api/maintenance/${maintenanceId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        // Atualizar a lista de manutenções
        setMaintenance(maintenance.filter(m => m._id !== maintenanceId));
        setShowDeleteMaintenanceConfirm(null);
        
        setNotification({
          type: 'success',
          message: 'Manutenção excluída com sucesso!'
        });
      } else {
        const errorData = await response.json();
        setNotification({
          type: 'error',
          message: `Erro ao excluir manutenção: ${errorData.error || 'Erro desconhecido'}`
        });
      }
    } catch (error) {
      console.error('Erro ao excluir manutenção:', error);
      setNotification({
        type: 'error',
        message: 'Ocorreu um erro ao excluir a manutenção'
      });
    }
  };
  
  // Função para atualizar manutenção
  const handleUpdateMaintenance = async (maintenanceData) => {
    try {
      const response = await fetch(`/api/maintenance/${maintenanceData._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...maintenanceData,
          vehicleId: id // Garantir que o veículo não mude
        }),
      });
      
      if (response.ok) {
        const updatedMaintenance = await response.json();
        
        // Atualizar a lista de manutenções
        setMaintenance(maintenance.map(m => 
          m._id === updatedMaintenance._id ? updatedMaintenance : m
        ));
        
        setEditingMaintenance(null);
        
        setNotification({
          type: 'success',
          message: 'Manutenção atualizada com sucesso!'
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao atualizar manutenção');
      }
    } catch (error) {
      console.error('Erro ao atualizar manutenção:', error);
      setNotification({
        type: 'error',
        message: error.message || 'Ocorreu um erro ao atualizar a manutenção'
      });
    }
  };
  
  // Calcular dias até a próxima inspeção
  const getDaysUntilInspection = (dateString) => {
    const inspectionDate = new Date(dateString);
    const today = new Date();
    const differenceInTime = inspectionDate.getTime() - today.getTime();
    return Math.ceil(differenceInTime / (1000 * 3600 * 24));
  };
  
  if (isLoading) return <div className="flex justify-center items-center h-64">Carregando...</div>;
  if (!vehicle) return <div className="bg-red-50 p-4 rounded-md">Veículo não encontrado</div>;
  
  // Determinar se a inspeção está atrasada
  const daysUntil = getDaysUntilInspection(vehicle.nextInspection);
  const isOverdue = daysUntil < 0;
  
  return (
    <div>
      {notification && (
        <div className={`fixed top-4 right-4 z-50 flex items-center p-4 mb-4 rounded-lg border 
          ${notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 
            notification.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
            'bg-blue-50 border-blue-200 text-blue-800'}`}>
          <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 mr-3">
            {notification.type === 'success' ? <CheckCircle /> : 
             notification.type === 'error' ? <AlertTriangle /> : null}
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

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Detalhes do Veículo: {vehicle.plate}</h1>
        <div className="flex space-x-2">
          <Link href="/veiculos">
            <Button variant="outline" className="flex items-center">
              <ArrowLeft className="mr-2" size={16} />
              Voltar
            </Button>
          </Link>
          
          <Button
            variant="outline"
            className="flex items-center"
            onClick={() => setIsEditing(!isEditing)}
          >
            <Edit size={16} className="mr-2" />
            {isEditing ? 'Cancelar' : 'Editar'}
          </Button>
          
          <Button
            variant="destructive"
            className="flex items-center"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash size={16} className="mr-2" />
            Excluir
          </Button>
        </div>
      </div>
      
      {isEditing ? (
        <VehicleForm 
          initialData={vehicle}
          onSubmit={handleUpdateVehicle}
          onCancel={() => setIsEditing(false)}
          isEditing={true}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Veículo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Matrícula:</span>
                  <span>{vehicle.plate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Marca/Modelo:</span>
                  <span>{vehicle.brand} {vehicle.model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Primeira Matrícula:</span>
                  <span>{new Date(vehicle.firstRegistrationDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Empresa:</span>
                  <span>{vehicle.company}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Responsável:</span>
                  <span>{vehicle.userName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Email:</span>
                  <span>{vehicle.userEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Última Inspeção:</span>
                  <span>
                    {vehicle.lastInspection 
                      ? format(new Date(vehicle.lastInspection), 'dd/MM/yyyy', { locale: pt })
                      : 'Não realizada'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Próxima Inspeção:</span>
                  <span className={isOverdue ? "text-red-500 font-semibold" : ""}>
                    {format(new Date(vehicle.nextInspection), 'dd/MM/yyyy', { locale: pt })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Status da Inspeção:</span>
                  <span 
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      vehicle.inspectionStatus === "pendente" 
                        ? "bg-yellow-100 text-yellow-800"
                        : vehicle.inspectionStatus === "atrasada"
                          ? "bg-red-100 text-red-800"
                          : "bg-green-100 text-green-800"
                    }`}
                  >
                    {vehicle.inspectionStatus === "pendente" 
                      ? "Pendente" 
                      : vehicle.inspectionStatus === "atrasada"
                        ? "Atrasada" 
                        : "Confirmada"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">
                    {isOverdue ? "Dias Atrasados:" : "Dias até a Inspeção:"}
                  </span>
                  <span className={
                    isOverdue 
                      ? "text-red-500 font-semibold" 
                      : daysUntil < 15 
                        ? "text-yellow-500 font-semibold"
                        : ""
                  }>
                    {Math.abs(daysUntil)}
                  </span>
                </div>
                
                {/* Botões de ação para inspeção */}
                {vehicle.inspectionStatus !== "confirmada" && (
                  <div className="mt-4">
                    <Button 
                      className="bg-green-500 text-white px-3 py-2 rounded mr-2"
                      onClick={() => {
                        const today = new Date().toISOString().split('T')[0];
                        handleUpdateVehicle({
                          ...vehicle,
                          inspectionStatus: "confirmada",
                          lastInspection: today
                        });
                      }}
                    >
                      <CheckCircle className="mr-2" size={16} />
                      Confirmar Inspeção Realizada
                    </Button>
                    
                    {!vehicle.emailSent && (
                      <Button 
                        variant="secondary"
                        className="flex items-center"
                        onClick={() => {
                          handleUpdateVehicle({
                            ...vehicle,
                            emailSent: true
                          });
                          setNotification({
                            type: 'success',
                            message: `Email enviado para ${vehicle.userEmail}`
                          });
                        }}
                      >
                        <Mail className="mr-2" size={16} />
                        Enviar Lembrete por Email
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Adicionar Manutenção</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddMaintenance}>
                <div className="space-y-4">
                  <div>
                    <label className="block mb-1">Data</label>
                    <input 
                      type="date" 
                      className="w-full p-2 border rounded"
                      value={newMaintenance.date}
                      onChange={(e) => setNewMaintenance({...newMaintenance, date: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Tipo</label>
                    <select 
                      className="w-full p-2 border rounded"
                      value={newMaintenance.type}
                      onChange={(e) => setNewMaintenance({...newMaintenance, type: e.target.value})}
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
                      value={newMaintenance.description}
                      onChange={(e) => setNewMaintenance({...newMaintenance, description: e.target.value})}
                      rows={3}
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Custo (€)</label>
                    <input 
                      type="number" 
                      className="w-full p-2 border rounded"
                      value={newMaintenance.cost}
                      onChange={(e) => setNewMaintenance({...newMaintenance, cost: e.target.value})}
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                  <Button 
                    type="submit"
                    className="w-full bg-blue-500 text-white"
                  >
                    Adicionar Manutenção
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Manutenções</CardTitle>
        </CardHeader>
        <CardContent>
          {maintenance.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descrição
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Custo (€)
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {maintenance.map(record => (
                    <tr key={record._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(record.date), 'dd/MM/yyyy', { locale: pt })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span 
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            record.type === "Inspeção" 
                              ? "bg-blue-100 text-blue-800" 
                              : record.type === "Reparação"
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                          }`}
                        >
                          {record.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {record.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                        {record.cost.toFixed(2)} €
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button 
                            className="text-blue-600 hover:text-blue-900"
                            onClick={() => setEditingMaintenance(record)}
                            title="Editar"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            className="text-red-600 hover:text-red-900"
                            onClick={() => setShowDeleteMaintenanceConfirm(record._id)}
                            title="Excluir"
                          >
                            <Trash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="font-bold bg-gray-50">
                    <td className="px-6 py-4" colSpan={3}>Total</td>
                    <td className="px-6 py-4 text-right">
                      {maintenance
                        .reduce((sum, record) => sum + record.cost, 0)
                        .toFixed(2)} €
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Sem registos de manutenção.</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Modal de confirmação de exclusão */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Confirmar Exclusão</h3>
            <p className="mb-6">
              Tem certeza que deseja excluir o veículo {vehicle.plate}? Esta ação não pode ser desfeita e todas as manutenções associadas também serão excluídas.
            </p>
            <div className="flex justify-end space-x-3">
              <Button 
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancelar
              </Button>
              <Button 
                variant="destructive"
                onClick={handleDeleteVehicle}
              >
                Sim, Excluir
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de edição de manutenção */}
      {editingMaintenance && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Editar Manutenção</h3>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              handleUpdateMaintenance(editingMaintenance);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block mb-1">Data</label>
                  <input 
                    type="date" 
                    className="w-full p-2 border rounded"
                    value={new Date(editingMaintenance.date).toISOString().split('T')[0]}
                    onChange={(e) => setEditingMaintenance({
                      ...editingMaintenance,
                      date: e.target.value
                    })}
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1">Tipo</label>
                  <select 
                    className="w-full p-2 border rounded"
                    value={editingMaintenance.type}
                    onChange={(e) => setEditingMaintenance({
                      ...editingMaintenance,
                      type: e.target.value
                    })}
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
                    value={editingMaintenance.description}
                    onChange={(e) => setEditingMaintenance({
                      ...editingMaintenance,
                      description: e.target.value
                    })}
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1">Custo (€)</label>
                  <input 
                    type="number" 
                    className="w-full p-2 border rounded"
                    value={editingMaintenance.cost}
                    onChange={(e) => setEditingMaintenance({
                      ...editingMaintenance,
                      cost: parseFloat(e.target.value)
                    })}
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
              </div>
              
              <div className="flex justify-end mt-6 space-x-3">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => setEditingMaintenance(null)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  className="bg-blue-500 text-white"
                >
                  Atualizar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Modal de confirmação de exclusão de manutenção */}
      {showDeleteMaintenanceConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Confirmar Exclusão</h3>
            <p className="mb-6">
              Tem certeza que deseja excluir esta manutenção? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end space-x-3">
              <Button 
                variant="outline"
                onClick={() => setShowDeleteMaintenanceConfirm(null)}
              >
                Cancelar
              </Button>
              <Button 
                variant="destructive"
                onClick={() => handleDeleteMaintenance(showDeleteMaintenanceConfirm)}
              >
                Sim, Excluir
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
