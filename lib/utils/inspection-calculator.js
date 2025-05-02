/**
 * Calcula a próxima data de inspeção baseada nas regras portuguesas
 * - Primeira inspeção: 4 anos após a primeira matrícula
 * - Segunda inspeção: 2 anos após a primeira inspeção
 * - Terceira inspeção: 2 anos após a segunda inspeção
 * - Inspeções subsequentes: anuais
 */
/**
 * Calcula a próxima data de inspeção baseada nas regras portuguesas
 * - Primeira inspeção: 4 anos após a primeira matrícula
 * - Segunda inspeção: 2 anos após a primeira inspeção (6 anos após primeira matrícula)
 * - Terceira inspeção: 2 anos após a segunda inspeção (8 anos após primeira matrícula)
 * - Inspeções subsequentes: anuais (9, 10, 11, etc. anos após primeira matrícula)
 */
export function calculateNextInspection(firstRegistrationDate, lastInspectionDate) {
  const firstRegDate = new Date(firstRegistrationDate);
  const today = new Date();
  
  // Criar cópia da data para evitar modificar o parâmetro original
  const firstRegDateCopy = new Date(firstRegDate);
  
  // Calcular a idade exata do veículo em anos, considerando mês e dia
  const ageInYears = calculateExactYears(firstRegDate, today);
  
  // Determinar qual inspeção seria a próxima com base na idade do veículo
  // Independentemente da data da última inspeção
  
  // Primeira inspeção: 4 anos após primeira matrícula
  const firstInspectionDate = new Date(firstRegDateCopy);
  firstInspectionDate.setFullYear(firstRegDateCopy.getFullYear() + 4);
  
  // Se ainda não chegou à idade da primeira inspeção
  if (ageInYears < 4) {
    return firstInspectionDate;
  }
  
  // Segunda inspeção: 6 anos após primeira matrícula
  const secondInspectionDate = new Date(firstRegDateCopy);
  secondInspectionDate.setFullYear(firstRegDateCopy.getFullYear() + 6);
  
  // Se ainda não chegou à idade da segunda inspeção
  if (ageInYears < 6) {
    return secondInspectionDate;
  }
  
  // Terceira inspeção: 8 anos após primeira matrícula
  const thirdInspectionDate = new Date(firstRegDateCopy);
  thirdInspectionDate.setFullYear(firstRegDateCopy.getFullYear() + 8);
  
  // Se ainda não chegou à idade da terceira inspeção
  if (ageInYears < 8) {
    return thirdInspectionDate;
  }
  
  // Inspeções anuais após os 8 anos
  // Primeiro, calculamos quantos anos completos se passaram desde a primeira matrícula
  const completedYears = Math.floor(ageInYears);
  
  // Em seguida, calculamos qual será o próximo ano de inspeção
  // Se o veículo tem 8 anos completos, a próxima inspeção será aos 9 anos
  // Se tem 9 anos completos, a próxima será aos 10, e assim por diante
  const nextInspectionYears = Math.max(9, completedYears + 1);
  
  const nextInspectionDate = new Date(firstRegDateCopy);
  nextInspectionDate.setFullYear(firstRegDateCopy.getFullYear() + nextInspectionYears);
  
  return nextInspectionDate;
}

/**
 * Calcula a idade exata em anos entre duas datas, considerando mês e dia
 */
function calculateExactYears(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  let years = end.getFullYear() - start.getFullYear();
  
  // Ajustar se ainda não chegou ao mês/dia do aniversário neste ano
  if (
    end.getMonth() < start.getMonth() || 
    (end.getMonth() === start.getMonth() && end.getDate() < start.getDate())
  ) {
    years--;
  }
  
  return years;
}

/**
 * Calcula dias até a próxima inspeção
 */
export function getDaysUntilInspection(nextInspectionDate) {
  const inspectionDate = new Date(nextInspectionDate);
  const today = new Date();
  const differenceInTime = inspectionDate.getTime() - today.getTime();
  return Math.ceil(differenceInTime / (1000 * 3600 * 24));
}
