// lib/whatsapp-service.js
/**
 * Serviço para envio de mensagens via WhatsApp
 * Usa a API fornecida: http://candal.memoriavisual.net:8000/api/message-url
 */

// URL base da API de WhatsApp
const WHATSAPP_API_URL = 'http://candal.memoriavisual.net:8000/api/message-url';
// Token da API (deve ser movido para variável de ambiente em ambiente de produção)
const WHATSAPP_API_TOKEN = 'vYaQt10KioSIdaNgTUlIZtzzn2yJ6O4qmS6UI5eq';

/**
 * Envia uma mensagem de WhatsApp para um número específico
 * @param {string} recipient - Número de telefone do destinatário (9XXXXXXXX)
 * @param {string} message - Mensagem a ser enviada
 * @param {Date|string} [scheduledDate] - Data para agendamento da mensagem (opcional)
 * @param {string} [scheduledTime] - Hora para agendamento da mensagem (opcional)
 * @returns {Promise<object>} - Resposta da API
 */
export async function sendWhatsAppMessage(recipient, message, scheduledDate = null, scheduledTime = null) {
  try {
    // Validar os parâmetros
    if (!recipient || !message) {
      throw new Error('Destinatário e mensagem são obrigatórios');
    }
    
    // Formatar o número de telefone (remover +351 se existir)
    const formattedRecipient = recipient.replace(/^\+351\s?/, '');
    
    // Criar a URL com os parâmetros
    let url = `${WHATSAPP_API_URL}?token=${WHATSAPP_API_TOKEN}&recipient=${formattedRecipient}&message=${encodeURIComponent(message)}`;
    
    // Adicionar data e hora agendadas, se fornecidas
    if (scheduledDate) {
      // Se scheduledDate for um objeto Date, convertê-lo para string no formato YYYY-MM-DD
      const dateStr = scheduledDate instanceof Date 
        ? scheduledDate.toISOString().split('T')[0] 
        : scheduledDate;
        
      url += `&date=${dateStr}`;
      
      // Adicionar hora agendada, se fornecida
      if (scheduledTime) {
        url += `&time=${scheduledTime}`;
      }
    }
    
    // Fazer a requisição para a API
    const response = await fetch(url);
    
    // Verificar se a resposta foi bem-sucedida
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Erro ao enviar mensagem: ${errorData.message || response.statusText}`);
    }
    
    // Retornar a resposta da API
    return await response.json();
  } catch (error) {
    console.error('Erro no serviço de WhatsApp:', error);
    throw error;
  }
}

/**
 * Envia mensagens para todos os gestores principais
 * @param {string} message - Mensagem a ser enviada
 * @param {object} db - Conexão com o banco de dados MongoDB
 * @returns {Promise<Array>} - Array com os resultados de cada envio
 */
export async function notifyPrimaryManagers(message, db) {
  try {
    // Buscar todos os gestores principais no banco de dados
    const managers = await db.collection('users')
      .find({ isPrimaryManager: true })
      .toArray();
    
    // Se não houver gestores, retornar array vazio
    if (!managers || managers.length === 0) {
      console.warn('Nenhum gestor principal encontrado para notificar');
      return [];
    }
    
    // Enviar mensagem para cada gestor e coletar resultados
    const results = await Promise.all(
      managers.map(async (manager) => {
        // Usar o número de WhatsApp se disponível, senão usar o telefone
        const phoneNumber = manager.whatsapp || manager.phone;
        
        // Se não tiver número de telefone, pular este gestor
        if (!phoneNumber) {
          return { 
            manager: manager.name,
            success: false, 
            error: 'Número de telefone não disponível'
          };
        }
        
        try {
          // Enviar mensagem WhatsApp
          const result = await sendWhatsAppMessage(phoneNumber, message);
          return { 
            manager: manager.name,
            success: true, 
            result 
          };
        } catch (error) {
          return { 
            manager: manager.name,
            success: false, 
            error: error.message 
          };
        }
      })
    );
    
    return results;
  } catch (error) {
    console.error('Erro ao notificar gestores principais:', error);
    throw error;
  }
}