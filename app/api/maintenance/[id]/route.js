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
    
    const result = await db
      .collection("maintenance")
      .updateOne(
        { _id: new ObjectId(params.id) },
        { $set: data }
      );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Manutenção não encontrada" }, 
        { status: 404 }
      );
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
