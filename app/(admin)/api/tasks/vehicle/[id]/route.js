// app/api/tasks/vehicle/[id]/route.js
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// GET - Obter tarefas para um veículo específico
export async function GET(request, { params }) {
  try {
    const client = await clientPromise;
    const db = client.db("frotaDB");
    
    // Verificar se há parâmetros de consulta
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    // Construir o filtro de consulta
    const filter = { vehicleId: params.id };
    
    if (status) {
      filter.status = status;
    }
    
    // Consultar as tarefas do veículo
    const tasks = await db
      .collection("tasks")
      .find(filter)
      .sort({ dueDate: 1, priority: -1 })
      .toArray();
    
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Erro ao buscar tarefas do veículo:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}