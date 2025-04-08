import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET - Obter um veículo específico
export async function GET(request, { params }) {
  try {
    const client = await clientPromise;
    const db = client.db("frotaDB");
    
    const vehicle = await db
      .collection("vehicles")
      .findOne({ _id: new ObjectId(params.id) });
    
    if (!vehicle) {
      return NextResponse.json(
        { error: "Veículo não encontrado" }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json(vehicle);
  } catch (error) {
    console.error('Erro ao buscar veículo:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH - Atualizar um veículo
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
    
    const result = await db
      .collection("vehicles")
      .updateOne(
        { _id: new ObjectId(params.id) },
        { $set: data }
      );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Veículo não encontrado" }, 
        { status: 404 }
      );
    }
    
    const updatedVehicle = await db
      .collection("vehicles")
      .findOne({ _id: new ObjectId(params.id) });
    
    return NextResponse.json(updatedVehicle);
  } catch (error) {
    console.error('Erro ao atualizar veículo:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Remover um veículo
export async function DELETE(request, { params }) {
  try {
    const client = await clientPromise;
    const db = client.db("frotaDB");
    
    // Verificar se o veículo existe
    const vehicle = await db
      .collection("vehicles")
      .findOne({ _id: new ObjectId(params.id) });
    
    if (!vehicle) {
      return NextResponse.json(
        { error: "Veículo não encontrado" }, 
        { status: 404 }
      );
    }
    
    // Remover o veículo
    await db
      .collection("vehicles")
      .deleteOne({ _id: new ObjectId(params.id) });
    
    // Remover também as manutenções associadas a este veículo
    await db
      .collection("maintenance")
      .deleteMany({ vehicleId: params.id });
    
    return NextResponse.json({ 
      message: "Veículo e manutenções associadas removidos com sucesso" 
    });
  } catch (error) {
    console.error('Erro ao remover veículo:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
