// app/users/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, User, Mail, Edit, Trash, Phone, MessageSquare, Star } from 'lucide-react';
import Link from 'next/link';
import UserForm from '@/components/users/UserForm';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  
  // Carregar usuários
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        console.error('Erro ao carregar utilizadores');
      }
    } catch (error) {
      console.error('Erro ao carregar utilizadores:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  // Filtrar usuários com base na pesquisa
  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Adicionar novo usuário
  const handleAddUser = async (userData) => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao adicionar utilizador');
      }
      
      // Atualizar a lista de usuários
      await fetchUsers();
      
      // Fechar o formulário
      setShowForm(false);
    } catch (error) {
      throw error;
    }
  };

  // Função para excluir usuário
  const handleDeleteUser = async (userId) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        // Atualizar a lista de usuários
        await fetchUsers();
        setShowDeleteConfirm(null);
      } else {
        const errorData = await response.json();
        if (errorData.vehiclesCount) {
          alert(`Não é possível excluir este utilizador pois existem ${errorData.vehiclesCount} veículos associados a ele.`);
        } else {
          alert(`Erro ao excluir utilizador: ${errorData.error || 'Erro desconhecido'}`);
        }
      }
    } catch (error) {
      console.error('Erro ao excluir utilizador:', error);
      alert('Ocorreu um erro ao excluir o utilizador');
    }
  };

  // Função para atualizar usuário
  const handleUpdateUser = async (userData) => {
    try {
      const response = await fetch(`/api/users/${editingUser._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      if (response.ok) {
        // Atualizar a lista de usuários
        await fetchUsers();
        setEditingUser(null);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao atualizar utilizador');
      }
    } catch (error) {
      console.error('Erro ao atualizar utilizador:', error);
      alert(error.message || 'Ocorreu um erro ao atualizar o utilizador');
    }
  };

  // Função para testar envio de WhatsApp
  const handleTestWhatsApp = async (user) => {
    if (!user.phone && !user.whatsapp) {
      alert('Este utilizador não tem número de telefone ou WhatsApp definido.');
      return;
    }

    const phoneNumber = user.whatsapp || user.phone;
    
    try {
      const response = await fetch('/api/whatsapp/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipient: phoneNumber,
          message: `Olá ${user.name}, esta é uma mensagem de teste do sistema de gestão de frota.`
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        alert(`Mensagem enviada com sucesso para ${phoneNumber}`);
      } else {
        alert(`Erro ao enviar mensagem: ${data.error}`);
      }
    } catch (error) {
      console.error('Erro ao testar WhatsApp:', error);
      alert('Ocorreu um erro ao enviar a mensagem de teste');
    }
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Utilizadores Responsáveis</h1>
        <Button 
          className="flex items-center"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancelar' : (
            <>
              <Plus className="mr-2" size={16} />
              Adicionar Utilizador
            </>
          )}
        </Button>
      </div>
      
      {showForm && (
        <div className="mb-6 max-w-lg mx-auto">
          <UserForm 
            onSubmit={handleAddUser}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}
      
      <div className="mb-4">
        <input 
          type="text" 
          placeholder="Pesquisar usuários..." 
          className="w-full md:w-1/2 p-2 border rounded"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {isLoading ? (
        <div className="text-center py-8">A carregar utilizadores...</div>
      ) : (
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Telefone
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    WhatsApp
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gestor Principal
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Veículos
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map(user => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                          <User size={20} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Mail className="mr-2" size={16} />
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.phone ? (
                        <div className="flex items-center text-sm text-gray-500">
                          <Phone className="mr-2" size={16} />
                          {user.phone}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Não definido</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.whatsapp ? (
                        <div className="flex items-center text-sm text-gray-500">
                          <MessageSquare className="mr-2" size={16} />
                          {user.whatsapp}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Igual ao telefone</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {user.isPrimaryManager ? (
                        <Star className="inline-block text-yellow-500" size={20} />
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link 
                        href={`/veiculos?userId=${user._id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Ver veículos
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button 
                          className="text-blue-600 hover:text-blue-900"
                          onClick={() => setEditingUser(user)}
                          title="Editar"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-900"
                          onClick={() => setShowDeleteConfirm(user._id)}
                          title="Excluir"
                        >
                          <Trash size={16} />
                        </button>
                        {(user.phone || user.whatsapp) && (
                          <button 
                            className="text-green-600 hover:text-green-900"
                            onClick={() => handleTestWhatsApp(user)}
                            title="Testar WhatsApp"
                          >
                            <MessageSquare size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                      Nenhum utilizador encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de edição de usuário */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <UserForm 
              initialData={editingUser}
              onSubmit={handleUpdateUser}
              onCancel={() => setEditingUser(null)}
              isEditing={true}
            />
          </div>
        </div>
      )}

      {/* Modal de confirmação de exclusão */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Confirmar Exclusão</h3>
            <p className="mb-6">
              Tem certeza que deseja excluir este utilizador? Esta ação não pode ser desfeita.
              Nota: Não é possível excluir utilizadores que estejam associados a veículos.
            </p>
            <div className="flex justify-end space-x-3">
              <Button 
                variant="outline"
                onClick={() => setShowDeleteConfirm(null)}
              >
                Cancelar
              </Button>
              <Button 
                variant="destructive"
                onClick={() => handleDeleteUser(showDeleteConfirm)}
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