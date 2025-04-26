// components/tasks/TaskList.jsx
import React from 'react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Check, X, Edit, Clock, AlertCircle, Calendar, Tag, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function TaskList({ 
  tasks, 
  showVehicle = false, 
  vehicles = {},
  onMarkComplete,
  onEdit,
  onDelete
}) {
  // Função para renderizar o ícone de prioridade
  const renderPriorityIcon = (priority) => {
    switch(priority) {
      case 'high':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Alta</span>;
      case 'medium':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Média</span>;
      case 'low':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Baixa</span>;
      default:
        return null;
    }
  };
  
  // Função para determinar se uma tarefa está atrasada
  const isTaskOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };
  
  // Renderizar a lista de tarefas
  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-center py-8 bg-white rounded-lg shadow">
        <p className="text-gray-500">Nenhuma tarefa encontrada.</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <ul className="divide-y divide-gray-200">
        {tasks.map(task => (
          <li key={task._id} className="p-4 hover:bg-gray-50">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-1">
                  {renderPriorityIcon(task.priority)}
                  <span className="ml-2 text-sm text-gray-500">
                    {task.category === 'maintenance' ? 'Manutenção' : 
                     task.category === 'repair' ? 'Reparação' : 
                     task.category === 'inspection' ? 'Inspeção' : 'Outro'}
                  </span>
                  
                  {task.status === 'completed' && (
                    <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      Concluída {task.completedAt && `em ${format(new Date(task.completedAt), 'dd/MM/yyyy', { locale: pt })}`}
                    </span>
                  )}
                </div>
                
                <h3 className="font-medium text-gray-900">{task.title}</h3>
                
                {task.description && (
                  <p className="mt-1 text-sm text-gray-600">{task.description}</p>
                )}
                
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                  {showVehicle && vehicles[task.vehicleId] && (
                    <Link href={`/veiculos/${task.vehicleId}`} className="inline-flex items-center text-blue-600 hover:underline">
                      <span className="mr-1">{vehicles[task.vehicleId].plate}</span>
                      <span>({vehicles[task.vehicleId].brand} {vehicles[task.vehicleId].model})</span>
                    </Link>
                  )}
                  
                  <span className={`inline-flex items-center ${task.status !== 'completed' && isTaskOverdue(task.dueDate) ? 'text-red-600 font-medium' : ''}`}>
                    <Calendar className="h-3.5 w-3.5 mr-1" />
                    {format(new Date(task.dueDate), 'dd/MM/yyyy', { locale: pt })}
                  </span>
                  
                  {task.estimatedCost > 0 && (
                    <span className="inline-flex items-center">
                      <span className="mr-1">€</span>
                      {task.estimatedCost.toFixed(2)}
                    </span>
                  )}
                  
                  {task.estimatedTime > 0 && (
                    <span className="inline-flex items-center">
                      <Clock className="h-3.5 w-3.5 mr-1" />
                      {task.estimatedTime} min
                    </span>
                  )}
                  
                  {task.tags && task.tags.length > 0 && (
                    <span className="inline-flex items-center">
                      <Tag className="h-3.5 w-3.5 mr-1" />
                      {task.tags.join(', ')}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="ml-4 flex-shrink-0 flex items-center space-x-2">
                {task.status === 'pending' && (
                  <>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onEdit(task)}
                      title="Editar"
                    >
                      <Edit size={16} />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onMarkComplete(task._id)}
                      title="Marcar como concluída"
                      className="text-green-600 hover:text-green-800"
                    >
                      <Check size={16} />
                    </Button>
                  </>
                )}
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDelete(task._id)}
                  title="Excluir"
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash size={16} />
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}