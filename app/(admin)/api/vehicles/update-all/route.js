import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { calculateNextInspection } from '@/lib/utils/inspection-calculator';

// GET - Atualizar todos os veículos com cálculos corretos de inspeção
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("frotaDB");
    
    // Buscar todos os veículos
    const vehicles = await db.collection("vehicles").find({}).toArray();
    
    // Contador de veículos atualizados
    let updatedCount = 0;
    let unchanged = 0;
    const results = [];
    
    // Para cada veículo, recalcular a data de próxima inspeção e o status
    for (const vehicle of vehicles) {
      const firstRegDate = new Date(vehicle.firstRegistrationDate);
      const today = new Date();
      
      // Calcular anos desde a primeira matrícula
      const yearsDiff = today.getFullYear() - firstRegDate.getFullYear();
      const monthDiff = today.getMonth() - firstRegDate.getMonth();
      const dayDiff = today.getDate() - firstRegDate.getDate();
      const exactYears = yearsDiff - (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? 1 : 0);
      
      // Calcular a próxima data de inspeção correta
      const nextInspectionDate = calculateNextInspection(
        vehicle.firstRegistrationDate,
        null // Não precisamos passar a última inspeção, pois ela não influencia o cálculo
      );
      
      // Definir o status da inspeção
      let inspectionStatus = vehicle.inspectionStatus;
      
      // Se estiver nos primeiros 4 anos, marcar como confirmada
      if (exactYears < 4) {
        inspectionStatus = "confirmada";
      } 
      // Se tiver uma data de última inspeção, marcar como confirmada
      else if (vehicle.lastInspection) {
        inspectionStatus = "confirmada";
      }
      // Se a próxima inspeção já passou, marcar como atrasada (a menos que já esteja confirmada)
      else if (nextInspectionDate < today && inspectionStatus !== "confirmada") {
        inspectionStatus = "atrasada";
      }
      // Caso contrário, marcar como pendente (a menos que já esteja confirmada)
      else if (inspectionStatus !== "confirmada") {
        inspectionStatus = "pendente";
      }
      
      // Verificar se houve mudança na próxima data de inspeção ou no status
      const dateChanged = !vehicle.nextInspection || 
        nextInspectionDate.getTime() !== new Date(vehicle.nextInspection).getTime();
      
      const statusChanged = inspectionStatus !== vehicle.inspectionStatus;
      
      // Se houve mudança, atualizar o veículo
      if (dateChanged || statusChanged) {
        const updateData = {
          nextInspection: nextInspectionDate,
          inspectionStatus: inspectionStatus,
          updatedAt: new Date()
        };
        
        // Atualizar o veículo no banco de dados
        await db.collection("vehicles").updateOne(
          { _id: vehicle._id },
          { $set: updateData }
        );
        
        updatedCount++;
        results.push({
          plate: vehicle.plate,
          oldNextInspection: vehicle.nextInspection ? new Date(vehicle.nextInspection).toISOString() : null,
          newNextInspection: nextInspectionDate.toISOString(),
          oldStatus: vehicle.inspectionStatus,
          newStatus: inspectionStatus
        });
      } else {
        unchanged++;
      }
    }
    
    return NextResponse.json({
      success: true,
      totalVehicles: vehicles.length,
      updatedVehicles: updatedCount,
      unchangedVehicles: unchanged,
      results: results
    });
  } catch (error) {
    console.error('Erro ao atualizar veículos:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}