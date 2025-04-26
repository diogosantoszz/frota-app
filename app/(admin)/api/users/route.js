import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// GET - Obter todos os usuários
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("frotaDB");
    
    const users = await db
      .collection("users")
      .find({})
      .toArray();
    
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Adicionar novo usuário
export async function POST(request) {
  try {
    const client = await clientPromise;
    const db = client.db("frotaDB");
    
    const data = await request.json();
    
    // Verificar se o email já existe
    const existingUser = await db
      .collection("users")
      .findOne({ email: data.email });
      
    if (existingUser) {
      return NextResponse.json(
        { error: "Já existe um usuário com este email" }, 
        { status: 400 }
      );
    }
    
    // Adicionar timestamps
    data.createdAt = new Date();
    data.updatedAt = new Date();
    
    const result = await db.collection("users").insertOne(data);
    
    return NextResponse.json({ 
      _id: result.insertedId,
      ...data 
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
