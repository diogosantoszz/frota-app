import nodemailer from 'nodemailer';
import { sendWhatsAppMessage, notifyPrimaryManagers } from './whatsapp-service';
import clientPromise from './mongodb';

// Criar um transporter reutilizável usando SMTP
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

/**
 * Envia um email de lembrete para inspeção
 */
export async function sendInspectionReminder(vehicle) {
  // Template do email
  const emailTemplate = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #3b82f6;">Lembrete de Inspeção Obrigatória</h2>
      <p>Olá ${vehicle.userName},</p>
      <p>Este é um lembrete que o veículo <strong>${vehicle.plate} (${vehicle.brand} ${vehicle.model})</strong> 
      tem uma inspeção periódica agendada para <strong>${new Date(vehicle.nextInspection).toLocaleDateString('pt-PT')}</strong>.</p>
      <p>Por favor, agende a inspeção e confirme quando realizada no sistema.</p>
      <div style="margin: 20px 0; padding: 15px; background-color: #f3f4f6; border-radius: 5px;">
        <p style="margin: 0;"><strong>Detalhes do Veículo:</strong></p>
        <ul style="padding-left: 20px;">
          <li>Matrícula: ${vehicle.plate}</li>
          <li>Marca/Modelo: ${vehicle.brand} ${vehicle.model}</li>
          <li>Empresa: ${vehicle.company}</li>
          <li>Data da Próxima Inspeção: ${new Date(vehicle.nextInspection).toLocaleDateString('pt-PT')}</li>
        </ul>
      </div>
      <p>Atenciosamente,<br>Sistema de Gestão de Frota Automóvel</p>
    </div>
  `;

  // Configuração do email
  const mailOptions = {
    from: `"Sistema de Frota" <${process.env.EMAIL_FROM}>`,
    to: vehicle.userEmail,
    subject: `Lembrete: Inspeção do veículo ${vehicle.plate}`,
    html: emailTemplate
  };

  // Enviar email
  const emailResult = await transporter.sendMail(mailOptions);
  
  // Também enviar mensagem WhatsApp para o responsável, se tiver número
  let whatsappResult = null;
  try {
    // Obter a conexão com o MongoDB
    const client = await clientPromise;
    const db = client.db("frotaDB");
    
    // Buscar o usuário responsável para obter o número de telefone
    const user = await db.collection("users").findOne({ _id: vehicle.userId });
    
    if (user && (user.whatsapp || user.phone)) {
      // Criar uma mensagem simplificada para WhatsApp
      const whatsappMessage = 
        `📅 *Lembrete de Inspeção* 📅\n\n` +
        `Olá ${user.name},\n\n` +
        `O veículo *${vehicle.plate}* (${vehicle.brand} ${vehicle.model}) tem inspeção agendada para *${new Date(vehicle.nextInspection).toLocaleDateString('pt-PT')}*.\n\n` +
        `Por favor, agende a inspeção o mais rápido possível.`;
      
      // Enviar mensagem WhatsApp
      whatsappResult = await sendWhatsAppMessage(user.whatsapp || user.phone, whatsappMessage);
    }
    
    // Notificar gestores principais sobre a inspeção
    const managerMessage = 
      `🚨 *Notificação de Inspeção* 🚨\n\n` +
      `Foi enviado um lembrete de inspeção para o veículo *${vehicle.plate}* (${vehicle.brand} ${vehicle.model}).\n\n` +
      `Data da inspeção: *${new Date(vehicle.nextInspection).toLocaleDateString('pt-PT')}*\n` +
      `Responsável: ${vehicle.userName}`;
    
    await notifyPrimaryManagers(managerMessage, db);
  } catch (error) {
    console.error('Erro ao enviar notificação WhatsApp:', error);
  }

  return { email: emailResult, whatsapp: whatsappResult };
}

/**
 * Envia uma notificação sobre manutenção realizada
 */
export async function sendMaintenanceNotification(maintenance, vehicle) {
  // Obter a conexão com o MongoDB
  const client = await clientPromise;
  const db = client.db("frotaDB");
  
  // Notificar gestores principais sobre a manutenção
  const message = 
    `🔧 *Nova Manutenção Registrada* 🔧\n\n` +
    `Foi registrada uma nova manutenção do tipo *${maintenance.type}* para o veículo *${vehicle.plate}* (${vehicle.brand} ${vehicle.model}).\n\n` +
    `Descrição: ${maintenance.description}\n` +
    `Custo: ${maintenance.cost.toFixed(2)} €\n` +
    `Data: ${new Date(maintenance.date).toLocaleDateString('pt-PT')}`;
  
  return await notifyPrimaryManagers(message, db);
}

/**
 * Envia uma notificação sobre uma nova tarefa criada
 */
export async function sendTaskNotification(task, vehicle) {
  // Obter a conexão com o MongoDB
  const client = await clientPromise;
  const db = client.db("frotaDB");
  
  // Notificar gestores principais sobre a tarefa
  const message = 
    `📋 *Nova Tarefa Criada* 📋\n\n` +
    `Foi criada uma nova tarefa para o veículo *${vehicle.plate}* (${vehicle.brand} ${vehicle.model}).\n\n` +
    `Título: ${task.title}\n` +
    `Descrição: ${task.description || 'Sem descrição'}\n` +
    `Prioridade: ${task.priority === 'high' ? '⚠️ Alta' : task.priority === 'medium' ? '⚠ Média' : '✓ Baixa'}\n` +
    `Data Limite: ${new Date(task.dueDate).toLocaleDateString('pt-PT')}`;
  
  return await notifyPrimaryManagers(message, db);
}