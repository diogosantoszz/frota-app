import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { sendInspectionReminder } from '@/lib/email-service';

// GET - Verificar inspeções próximas e enviar emails
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("frotaDB");
    
    const today = new Date();
    const thirtyDaysLater = new Date(today);
    thirtyDaysLater.setDate(today.getDate() + 30);
    
    // Encontrar veículos com inspeção nos próximos 30 dias
    const vehicles = await db.collection("vehicles").find({
      nextInspection: { 
        $gte: today, 
        $lte: thirtyDaysLater 
      },
      inspectionStatus: "pendente",
      emailSent: false
    }).toArray();
    
    // Contador de emails enviados
    let emailsSent = 0;
    
    // Enviar emails e atualizar status
    for (const vehicle of vehicles) {
      try {
        await sendInspectionReminder(vehicle);
        
        await db.collection("vehicles").updateOne(
          { _id: vehicle._id },
          { $set: { emailSent: true, updatedAt: new Date() } }
        );
        
        emailsSent++;
      } catch (emailError) {
        console.error(`Erro ao enviar email para ${vehicle.userEmail}:`, emailError);
        // Continuar mesmo se um email falhar
      }
    }
    
    // Atualizar veículos com inspeções atrasadas
    const updateResult = await db.collection("vehicles").updateMany(
      {
        nextInspection: { $lt: today },
        inspectionStatus: "pendente"
      },
      {
        $set: { 
          inspectionStatus: "atrasada",
          updatedAt: new Date()
        }
      }
    );
    
    return NextResponse.json({ 
      success: true, 
      emailsSent,
      vehiclesUpdated: updateResult.modifiedCount
    });
  } catch (error) {
    console.error('Erro na verificação de inspeções:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
