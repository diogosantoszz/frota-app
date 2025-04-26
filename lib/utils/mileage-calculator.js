// lib/utils/mileage-calculator.js - Utilitário para calcular média de km por ano

/**
 * Calcula a média de quilômetros por ano de um veículo
 * @param {Number} currentMileage - Quilometragem atual do veículo
 * @param {Number} initialMileage - Quilometragem inicial quando o veículo foi adicionado ao sistema
 * @param {Date} firstRegistrationDate - Data da primeira matrícula do veículo
 * @param {Date} lastMileageUpdate - Data da última atualização de quilometragem (opcional)
 * @returns {Number} Média de quilômetros por ano
 */
export function calculateAverageKmPerYear(currentMileage, initialMileage, firstRegistrationDate, lastMileageUpdate = null) {
    // Se não temos registros de quilometragem, retorna 0
    if (currentMileage === undefined || initialMileage === undefined || !firstRegistrationDate) {
      return 0;
    }
  
    const firstRegDate = new Date(firstRegistrationDate);
    const today = lastMileageUpdate ? new Date(lastMileageUpdate) : new Date();
    
    // Total de quilômetros percorridos
    const totalKm = currentMileage - initialMileage;
    
    // Total de anos desde a primeira matrícula
    const yearsElapsed = (today.getTime() - firstRegDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    
    // Se o veículo é muito novo (menos de 1 mês), projetamos para um ano completo
    if (yearsElapsed < 1/12) {
      return totalKm * 12;
    }
    
    return Math.round(totalKm / yearsElapsed);
  }
  
  /**
   * Calcula a média de quilômetros entre inspeções
   * @param {Number} currentMileage - Quilometragem atual do veículo
   * @param {Number} lastInspectionMileage - Quilometragem na última inspeção
   * @param {Date} lastInspection - Data da última inspeção
   * @returns {Number} Média de quilômetros por mês desde a última inspeção
   */
  export function calculateKmSinceLastInspection(currentMileage, lastInspectionMileage, lastInspection) {
    // Se não temos registros de inspeção, retorna 0
    if (currentMileage === undefined || lastInspectionMileage === undefined || !lastInspection) {
      return 0;
    }
  
    const lastInspDate = new Date(lastInspection);
    const today = new Date();
    
    // Total de quilômetros percorridos desde a última inspeção
    const kmSinceInspection = currentMileage - lastInspectionMileage;
    
    // Total de meses desde a última inspeção
    const monthsElapsed = (today.getTime() - lastInspDate.getTime()) / (30 * 24 * 60 * 60 * 1000);
    
    // Se a última inspeção foi há menos de uma semana, projetamos para um mês completo
    if (monthsElapsed < 0.25) {
      return 0;
    }
    
    return Math.round(kmSinceInspection / monthsElapsed);
  }