// components/admin/UpdateVehiclesButton.jsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export default function UpdateVehiclesButton() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  
  const handleUpdateVehicles = async () => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    setResult(null);
    setError(null);
    
    try {
      const response = await fetch('/api/vehicles/update-all');
      
      if (response.ok) {
        const data = await response.json();
        setResult(data);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao atualizar veículos');
      }
    } catch (err) {
      console.error('Erro:', err);
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };
  
  return (
    <>
      <Button
        onClick={handleUpdateVehicles}
        disabled={isUpdating}
        variant="outline"
        size="sm"
        title="Atualizar cálculos de inspeção em todos os veículos"
        className={isUpdating ? 'animate-spin' : ''}
      >
        <RefreshCw size={16} />
      </Button>
      
      {(result || error) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-xl w-full max-h-[80vh] overflow-y-auto">
            {result && (
              <div>
                <h3 className="text-lg font-bold mb-4 text-green-700">Atualização concluída!</h3>
                <p>Total de veículos: {result.totalVehicles}</p>
                <p>Veículos atualizados: {result.updatedVehicles}</p>
                <p>Veículos sem alterações: {result.unchangedVehicles}</p>
                
                {result.results.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Detalhes das alterações:</h4>
                    <div className="max-h-60 overflow-y-auto">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="bg-green-100">
                            <th className="px-2 py-1 text-left">Matrícula</th>
                            <th className="px-2 py-1 text-left">Próxima Inspeção (Anterior)</th>
                            <th className="px-2 py-1 text-left">Próxima Inspeção (Nova)</th>
                            <th className="px-2 py-1 text-left">Status (Anterior)</th>
                            <th className="px-2 py-1 text-left">Status (Novo)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.results.map((item, index) => (
                            <tr key={index} className="border-t border-green-200">
                              <td className="px-2 py-1">{item.plate}</td>
                              <td className="px-2 py-1">{item.oldNextInspection ? new Date(item.oldNextInspection).toLocaleDateString() : '-'}</td>
                              <td className="px-2 py-1">{new Date(item.newNextInspection).toLocaleDateString()}</td>
                              <td className="px-2 py-1">{item.oldStatus}</td>
                              <td className="px-2 py-1">{item.newStatus}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {error && (
              <div>
                <h3 className="text-lg font-bold mb-4 text-red-700">Erro ao atualizar veículos</h3>
                <p>{error}</p>
              </div>
            )}
            
            <div className="mt-6 flex justify-end">
              <Button onClick={() => { setResult(null); setError(null); }}>
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}