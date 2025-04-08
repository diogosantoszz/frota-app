import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

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
    
    const result = await db.collection("maintenance").insertOne(data);
    
    return NextResponse.json({ 
      _id: result.insertedId,
      ...data 
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
