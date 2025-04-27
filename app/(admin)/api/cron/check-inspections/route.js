import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { sendInspectionReminder } from '@/lib/email-service';

// GET - Verificar inspeções próximas e enviar emails/notificações
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
    
    // Contador de notificações enviadas
    let notificationsSent = 0;
    
    // Enviar emails/WhatsApp e atualizar status
    for (const vehicle of vehicles) {
      try {
        // Buscar o usuário para ter os dados de telefone
        let user = null;
        if (vehicle.userId) {
          user = await db.collection("users").findOne({ _id: vehicle.userId });
        }
        
        // Se encontrou o usuário, atualizar o veículo com os dados mais recentes
        if (user) {
          vehicle.userName = user.name;
          vehicle.userEmail = user.email;
          vehicle.userPhone = user.phone;
          vehicle.userWhatsapp = user.whatsapp;
        }
        
        // Enviar notificações (email e WhatsApp)
        await sendInspectionReminder(vehicle);
        
        // Atualizar status do veículo para indicar que as notificações foram enviadas
        await db.collection("vehicles").updateOne(
          { _id: vehicle._id },
          { $set: { emailSent: true, updatedAt: new Date() } }
        );
        
        notificationsSent++;
      } catch (error) {
        console.error(`Erro ao enviar notificações para ${vehicle.plate}:`, error);
        // Continuar mesmo se uma notificação falhar
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
      notificationsSent,
      vehiclesUpdated: updateResult.modifiedCount
    });
  } catch (error) {
    console.error('Erro na verificação de inspeções:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}