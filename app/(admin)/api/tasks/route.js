// app/api/tasks/route.js
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { sendTaskNotification } from '@/lib/email-service';

// GET - Obter todas as tarefas
export async function GET(request) {
  try {
    const client = await clientPromise;
    const db = client.db("frotaDB");
    
    // Verificar se há parâmetros de consulta
    const { searchParams } = new URL(request.url);
    const vehicleId = searchParams.get('vehicleId');
    const status = searchParams.get('status');
    
    // Construir o filtro de consulta
    const filter = {};
    
    if (vehicleId) {
      filter.vehicleId = vehicleId;
    }
    
    if (status) {
      filter.status = status;
    }
    
    // Consultar as tarefas
    const tasks = await db
      .collection("tasks")
      .find(filter)
      .sort({ dueDate: 1, priority: -1 })
      .toArray();
    
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Erro ao buscar tarefas:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Adicionar nova tarefa
export async function POST(request) {
  try {
    const client = await clientPromise;
    const db = client.db("frotaDB");
    
    const data = await request.json();
    
    // Validar dados obrigatórios
    if (!data.title || !data.vehicleId) {
      return NextResponse.json(
        { error: "Título e ID do veículo são obrigatórios" }, 
        { status: 400 }
      );
    }
    
    // Garantir que as datas estão em formato Date
    if (data.dueDate) {
      data.dueDate = new Date(data.dueDate);
    }
    
    // Definir valores padrão
    data.status = data.status || 'pending';
    data.priority = data.priority || 'medium';
    data.category = data.category || 'maintenance';
    data.estimatedCost = data.estimatedCost || 0;
    data.estimatedTime = data.estimatedTime || 0;
    data.completedAt = null;
    data.completedBy = null;
    
    // Adicionar timestamps
    data.createdAt = new Date();
    data.updatedAt = new Date();
    
    // Inserir a tarefa
    const result = await db.collection("tasks").insertOne(data);
    
    // Buscar o veículo para enviar notificação
    const vehicle = await db.collection("vehicles").findOne({ _id: new ObjectId(data.vehicleId) });
    
    // Se temos o veículo, enviar notificação sobre a nova tarefa
    if (vehicle) {
      try {
        await sendTaskNotification({ ...data, _id: result.insertedId }, vehicle);
      } catch (notificationError) {
        console.error('Erro ao enviar notificação de tarefa:', notificationError);
        // Não interromper o fluxo se a notificação falhar
      }
    }
    
    return NextResponse.json({ 
      _id: result.insertedId,
      ...data 
    }, { status: 201 });
  } catch (error) {
    console.error('Erro ao adicionar tarefa:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}