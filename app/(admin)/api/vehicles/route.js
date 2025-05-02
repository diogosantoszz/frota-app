// app/api/vehicles/route.js - Atualizar a rota POST
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { calculateNextInspection } from '@/lib/utils/inspection-calculator';
import { ObjectId } from 'mongodb';

// GET - Obter todos os veículos
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("frotaDB");
    
    const vehicles = await db
      .collection("vehicles")
      .find({})
      .toArray();
    
    return NextResponse.json(vehicles);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Adicionar novo veículo
// Modificação na rota POST de veículos para considerar a isenção nos primeiros 4 anos
export async function POST(request) {
  try {
    const client = await clientPromise;
    const db = client.db("frotaDB");
    
    const data = await request.json();
    
    // Verificar se a matrícula já existe
    const existingVehicle = await db
      .collection("vehicles")
      .findOne({ plate: data.plate });
      
    if (existingVehicle) {
      return NextResponse.json(
        { error: "Já existe um veículo com esta matrícula" }, 
        { status: 400 }
      );
    }
    
    // Calcular a próxima data de inspeção se não for fornecida
    if (!data.nextInspection) {
      data.nextInspection = calculateNextInspection(
        data.firstRegistrationDate,
        data.lastInspection
      );
    } else {
      data.nextInspection = new Date(data.nextInspection);
    }
    
    // Garantir que as datas estão em formato Date
    if (data.firstRegistrationDate) {
      data.firstRegistrationDate = new Date(data.firstRegistrationDate);
    }
    
    if (data.lastInspection) {
      data.lastInspection = new Date(data.lastInspection);
    }
    
    // Verificar se está nos primeiros 4 anos (isento)
    const firstRegDate = new Date(data.firstRegistrationDate);
    const today = new Date();
    const yearsSinceReg = today.getFullYear() - firstRegDate.getFullYear();
    
    // Definir valores padrão
    if (yearsSinceReg < 4) {
      // Se estiver nos primeiros 4 anos, definir como confirmada
      data.inspectionStatus = "confirmada";
    } else {
      // Caso contrário, usar o valor fornecido ou o padrão "pendente"
      data.inspectionStatus = data.inspectionStatus || 'pendente';
    }
    
    data.emailSent = data.emailSent || false;
    
    // Definir valores padrão para novos campos
    data.frontTires = data.frontTires || '';
    data.rearTires = data.rearTires || '';
    data.initialMileage = data.initialMileage || 0;
    data.currentMileage = data.currentMileage || data.initialMileage || 0;
    data.lastInspectionMileage = data.lastInspectionMileage || data.currentMileage || 0;
    
    // Adicionar timestamps
    data.createdAt = new Date();
    data.updatedAt = new Date();
    
    const result = await db.collection("vehicles").insertOne(data);
    
    return NextResponse.json({ 
      _id: result.insertedId,
      ...data 
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}