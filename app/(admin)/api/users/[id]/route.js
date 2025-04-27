import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { validateUser, prepareUserData } from '@/lib/models/user';

// GET - Obter um usuário específico
export async function GET(request, { params }) {
  try {
    const client = await clientPromise;
    const db = client.db("frotaDB");
    
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(params.id) });
    
    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json(user);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH - Atualizar um usuário
export async function PATCH(request, { params }) {
  try {
    const client = await clientPromise;
    const db = client.db("frotaDB");
    
    const data = await request.json();
    
    // Validação parcial para atualização (apenas campos fornecidos)
    const validationErrors = [];
    if (data.email) {
      // Verificar se está tentando alterar para um email já existente
      const existingUser = await db
        .collection("users")
        .findOne({ 
          email: data.email,
          _id: { $ne: new ObjectId(params.id) }
        });
        
      if (existingUser) {
        return NextResponse.json(
          { error: "Já existe um usuário com este email" }, 
          { status: 400 }
        );
      }
    }
    
    // Remover o _id do objeto de atualização se estiver presente
    if (data._id) {
      delete data._id;
    }
    
    // Preparar dados para atualização
    const userData = prepareUserData(data);
    
    const result = await db
      .collection("users")
      .updateOne(
        { _id: new ObjectId(params.id) },
        { $set: userData }
      );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Usuário não encontrado" }, 
        { status: 404 }
      );
    }
    
    const updatedUser = await db
      .collection("users")
      .findOne({ _id: new ObjectId(params.id) });
    
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Remover um usuário
export async function DELETE(request, { params }) {
  try {
    const client = await clientPromise;
    const db = client.db("frotaDB");
    
    // Verificar se há veículos associados a este usuário
    const vehiclesCount = await db
      .collection("vehicles")
      .countDocuments({ userId: params.id });
    
    if (vehiclesCount > 0) {
      return NextResponse.json(
        { 
          error: "Não é possível excluir este usuário pois existem veículos associados a ele",
          vehiclesCount
        }, 
        { status: 400 }
      );
    }
    
    const result = await db
      .collection("users")
      .deleteOne({ _id: new ObjectId(params.id) });
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Usuário não encontrado" }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      message: "Usuário removido com sucesso" 
    });
  } catch (error) {
    console.error('Erro ao remover usuário:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}