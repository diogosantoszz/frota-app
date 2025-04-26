// app/api/maintenance/[id]/route.js - Atualizar para incluir atualização da quilometragem do veículo
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET - Obter uma manutenção específica
export async function GET(request, { params }) {
  try {
    const client = await clientPromise;
    const db = client.db("frotaDB");
    
    const maintenance = await db
      .collection("maintenance")
      .findOne({ _id: new ObjectId(params.id) });
    
    if (!maintenance) {
      return NextResponse.json(
        { error: "Manutenção não encontrada" }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json(maintenance);
  } catch (error) {
    console.error('Erro ao buscar manutenção:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH - Atualizar uma manutenção
export async function PATCH(request, { params }) {
  try {
    const client = await clientPromise;
    const db = client.db("frotaDB");
    
    const data = await request.json();
    
    // Adicionar timestamp de atualização
    data.updatedAt = new Date();
    
    // Remover o _id do objeto de atualização se estiver presente
    if (data._id) {
      delete data._id;
    }
    
    // Converter data para formato Date se existir
    if (data.date) {
      data.date = new Date(data.date);
    }
    
    // Obter a manutenção atual para referência (precisamos do vehicleId)
    const currentMaintenance = await db
      .collection("maintenance")
      .findOne({ _id: new ObjectId(params.id) });
    
    if (!currentMaintenance) {
      return NextResponse.json(
        { error: "Manutenção não encontrada" }, 
        { status: 404 }
      );
    }
    
    // Atualizar a manutenção
    const result = await db
      .collection("maintenance")
      .updateOne(
        { _id: new ObjectId(params.id) },
        { $set: data }
      );
    
    // Se foi fornecida uma quilometragem, atualizar a quilometragem atual do veículo
    if (data.mileage && currentMaintenance.vehicleId) {
      // Converter a quilometragem para número
      const mileage = parseInt(data.mileage, 10);
      
      if (!isNaN(mileage)) {
        await db.collection("vehicles").updateOne(
          { _id: new ObjectId(currentMaintenance.vehicleId) },
          { 
            $set: { 
              currentMileage: mileage,
              updatedAt: new Date()
            } 
          }
        );
      }
    }
    
    const updatedMaintenance = await db
      .collection("maintenance")
      .findOne({ _id: new ObjectId(params.id) });
    
    return NextResponse.json(updatedMaintenance);
  } catch (error) {
    console.error('Erro ao atualizar manutenção:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Remover uma manutenção
export async function DELETE(request, { params }) {
  try {
    const client = await clientPromise;
    const db = client.db("frotaDB");
    
    const result = await db
      .collection("maintenance")
      .deleteOne({ _id: new ObjectId(params.id) });
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Manutenção não encontrada" }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      message: "Manutenção removida com sucesso" 
    });
  } catch (error) {
    console.error('Erro ao remover manutenção:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}