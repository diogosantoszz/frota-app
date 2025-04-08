import nodemailer from 'nodemailer';

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
  return transporter.sendMail(mailOptions);
}
