import { NextResponse } from 'next/server';
import { sendWhatsAppMessage } from '@/lib/whatsapp-service';

/**
 * POST - Enviar uma mensagem de teste via WhatsApp
 * 
 * Corpo da requisição:
 * {
 *   "recipient": "9XXXXXXXX",
 *   "message": "Mensagem de teste",
 *   "scheduledDate": "YYYY-MM-DD", // opcional
 *   "scheduledTime": "HH:MM"       // opcional
 * }
 */
export async function POST(request) {
  try {
    // Obter dados da requisição
    const data = await request.json();
    
    // Validar dados obrigatórios
    if (!data.recipient || !data.message) {
      return NextResponse.json(
        { error: "Destinatário e mensagem são obrigatórios" }, 
        { status: 400 }
      );
    }
    
    // Enviar mensagem
    const result = await sendWhatsAppMessage(
      data.recipient,
      data.message,
      data.scheduledDate || null,
      data.scheduledTime || null
    );
    
    // Retornar resultado
    return NextResponse.json({
      success: true,
      message: "Mensagem enviada com sucesso",
      result
    });
  } catch (error) {
    console.error('Erro ao enviar mensagem de teste:', error);
    return NextResponse.json(
      { error: error.message || "Erro ao enviar mensagem" }, 
      { status: 500 }
    );
  }
}