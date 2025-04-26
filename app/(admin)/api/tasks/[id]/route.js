// app/api/tasks/[id]/route.js
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET - Obter uma tarefa específica
export async function GET(request, { params }) {
  try {
    const client = await clientPromise;
    const db = client.db("frotaDB");
    
    const task = await db
      .collection("tasks")
      .findOne({ _id: new ObjectId(params.id) });
    
    if (!task) {
      return NextResponse.json(
        { error: "Tarefa não encontrada" }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json(task);
  } catch (error) {
    console.error('Erro ao buscar tarefa:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH - Atualizar uma tarefa
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
    
    // Se estiver alterando o status para concluído, adicionar data de conclusão
    if (data.status === 'completed' && !data.completedAt) {
      data.completedAt = new Date();
    }
    
    // Converter dueDate para Date se fornecido
    if (data.dueDate) {
      data.dueDate = new Date(data.dueDate);
    }
    
    const result = await db
      .collection("tasks")
      .updateOne(
        { _id: new ObjectId(params.id) },
        { $set: data }
      );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Tarefa não encontrada" }, 
        { status: 404 }
      );
    }
    
    const updatedTask = await db
      .collection("tasks")
      .findOne({ _id: new ObjectId(params.id) });
    
    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Erro ao atualizar tarefa:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Remover uma tarefa
export async function DELETE(request, { params }) {
  try {
    const client = await clientPromise;
    const db = client.db("frotaDB");
    
    const result = await db
      .collection("tasks")
      .deleteOne({ _id: new ObjectId(params.id) });
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Tarefa não encontrada" }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      message: "Tarefa removida com sucesso" 
    });
  } catch (error) {
    console.error('Erro ao remover tarefa:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}