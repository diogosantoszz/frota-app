import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { CheckCircle, Mail, AlertTriangle, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

export default function InspectionsList({ 
  title,
  description, 
  vehicles, 
  type = "upcoming", // "upcoming" or "overdue"
  onConfirmInspection,
  onSendEmail 
}) {
  const isOverdue = type === "overdue";
  
  return (
    <Card className={isOverdue ? "border-red-200" : ""}>
      <CardHeader className={isOverdue ? "bg-red-50" : "bg-orange-50"}>
        <CardTitle className={`flex items-center ${isOverdue ? "text-red-800" : ""}`}>
          {isOverdue ? (
            <AlertTriangle className="mr-2" size={20} />
          ) : (
            <Calendar className="mr-2" size={20} />
          )}
          {title || (isOverdue ? "Inspeções Atrasadas" : "Inspeções Próximas")}
        </CardTitle>
        <CardDescription>
          {description || (isOverdue 
            ? "Estes veículos precisam de atenção imediata. A inspeção já está atrasada."
            : "Inspeções agendadas para os próximos 30 dias."
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Matrícula</th>
                <th className="text-left py-2">Veículo</th>
                <th className="text-left py-2">Responsável</th>
                <th className="text-left py-2">{isOverdue ? "Data Vencida" : "Data da Inspeção"}</th>
                <th className="text-left py-2">{isOverdue ? "Dias Atrasados" : "Dias Restantes"}</th>
                <th className="text-left py-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map(vehicle => (
                <tr key={vehicle._id} className="border-b hover:bg-gray-50">
                  <td className="py-2">{vehicle.plate}</td>
                  <td className="py-2">{vehicle.brand} {vehicle.model}</td>
                  <td className="py-2">{vehicle.userName}</td>
                  <td className={`py-2 ${isOverdue ? "text-red-500 font-medium" : ""}`}>
                    {format(new Date(vehicle.nextInspection), 'dd/MM/yyyy', { locale: pt })}
                  </td>
                  <td className={`py-2 ${isOverdue ? "text-red-500 font-medium" : ""}`}>
                    {Math.abs(Math.floor((new Date(vehicle.nextInspection) - new Date()) / (1000 * 60 * 60 * 24)))}
                  </td>
                  <td className="py-2">
                    <div className="flex space-x-1">
                      <Button
                        variant="primary"
                        size="sm"
                        className="flex items-center"
                        onClick={() => onConfirmInspection(vehicle._id)}
                        title="Confirmar realização da inspeção"
                      >
                        <CheckCircle size={16} className="mr-1" />
                        {isOverdue ? "Confirmar" : ""}
                      </Button>
                      {!vehicle.emailSent && (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="flex items-center"
                          onClick={() => onSendEmail(vehicle._id)}
                          title="Enviar email de lembrete"
                        >
                          <Mail size={16} className="mr-1" />
                          {!isOverdue ? "Lembrar" : ""}
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
