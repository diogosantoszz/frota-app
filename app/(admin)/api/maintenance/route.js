// app/api/maintenance/route.js
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { sendMaintenanceNotification } from '@/lib/email-service';

// GET - Obter todas as manutenções
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("frotaDB");
    
    const maintenance = await db
      .collection("maintenance")
      .find({})
      .toArray();
    
    return NextResponse.json(maintenance);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Adicionar nova manutenção
export async function POST(request) {
  try {
    const client = await clientPromise;
    const db = client.db("frotaDB");
    
    const data = await request.json();
    
    // Garantir que as datas estão em formato Date
    if (data.date) {
      data.date = new Date(data.date);
    } else {
      data.date = new Date();
    }
    
    // Adicionar timestamps
    data.createdAt = new Date();
    data.updatedAt = new Date();
    
    // Inserir a manutenção
    const result = await db.collection("maintenance").insertOne(data);
    
    // Se foi fornecida uma quilometragem, atualizar a quilometragem atual do veículo
    let vehicle = null;
    if (data.mileage && data.vehicleId) {
      // Converter a quilometragem para número
      const mileage = parseInt(data.mileage, 10);
      
      if (!isNaN(mileage)) {
        await db.collection("vehicles").updateOne(
          { _id: new ObjectId(data.vehicleId) },
          { 
            $set: { 
              currentMileage: mileage,
              updatedAt: new Date()
            } 
          }
        );
        
        // Obter o veículo atualizado
        vehicle = await db.collection("vehicles").findOne({ _id: new ObjectId(data.vehicleId) });
      }
    }
    
    // Se temos o veículo, enviar notificação sobre a nova manutenção
    if (vehicle) {
      try {
        await sendMaintenanceNotification({ ...data, _id: result.insertedId }, vehicle);
      } catch (notificationError) {
        console.error('Erro ao enviar notificação de manutenção:', notificationError);
        // Não interromper o fluxo se a notificação falhar
      }
    }
    
    return NextResponse.json({ 
      _id: result.insertedId,
      ...data 
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}