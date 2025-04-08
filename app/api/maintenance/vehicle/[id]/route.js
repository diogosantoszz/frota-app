import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET - Obter todas as manutenções para um veículo específico
export async function GET(request, { params }) {
  try {
    const client = await clientPromise;
    const db = client.db("frotaDB");
    
    const maintenance = await db
      .collection("maintenance")
      .find({ vehicleId: params.id })
      .sort({ date: -1 })
      .toArray();
    
    return NextResponse.json(maintenance);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
