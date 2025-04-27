// lib/models/user.js
// Este arquivo define o esquema do usuário. Embora estejamos usando MongoDB diretamente,
// definir um modelo pode ser útil para validação e consistência.

/**
 * Estrutura do usuário na coleção 'users':
 * {
 *   _id: ObjectId,
 *   name: String,           // Nome completo do usuário
 *   email: String,          // Email para comunicações
 *   phone: String,          // Número de telefone (novo campo)
 *   whatsapp: String,       // Número de WhatsApp, se diferente do telefone (novo campo)
 *   isPrimaryManager: Boolean, // Indica se é um gestor principal (novo campo)
 *   createdAt: Date,        // Data de criação
 *   updatedAt: Date         // Data da última atualização
 * }
 */

// Função de validação de usuário
export function validateUser(userData) {
    const errors = [];
    
    // Validação de campos obrigatórios
    if (!userData.name || userData.name.trim() === '') {
      errors.push('Nome é obrigatório');
    }
    
    if (!userData.email || userData.email.trim() === '') {
      errors.push('Email é obrigatório');
    } else if (!isValidEmail(userData.email)) {
      errors.push('Email inválido');
    }
    
    // Validação de telefone (opcional, mas se fornecido deve ser válido)
    if (userData.phone && !isValidPhone(userData.phone)) {
      errors.push('Número de telefone inválido');
    }
    
    // Validação de WhatsApp (opcional, mas se fornecido deve ser válido)
    if (userData.whatsapp && !isValidPhone(userData.whatsapp)) {
      errors.push('Número de WhatsApp inválido');
    }
    
    return errors;
  }
  
  // Funções auxiliares de validação
  function isValidEmail(email) {
    // Regex simples para validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  function isValidPhone(phone) {
    // Regex para validação de telefone português
    // Aceita formatos: 9XXXXXXXX ou +351 9XXXXXXXX
    const phoneRegex = /^(\+351\s?)?9\d{8}$/;
    return phoneRegex.test(phone);
  }
  
  // Função para preparar os dados do usuário antes de inserir/atualizar
  export function prepareUserData(userData, isNew = false) {
    // Remover espaços extras
    if (userData.name) userData.name = userData.name.trim();
    if (userData.email) userData.email = userData.email.trim();
    if (userData.phone) userData.phone = userData.phone.trim();
    if (userData.whatsapp) userData.whatsapp = userData.whatsapp.trim();
    
    // Definir campos booleanos
    userData.isPrimaryManager = !!userData.isPrimaryManager;
    
    // Definir timestamps
    const now = new Date();
    if (isNew) {
      userData.createdAt = now;
    }
    userData.updatedAt = now;
    
    return userData;
  }