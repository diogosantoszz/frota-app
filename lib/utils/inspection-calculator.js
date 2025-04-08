/**
 * Calcula a próxima data de inspeção baseada nas regras portuguesas
 * - Primeira inspeção: 4 anos após a primeira matrícula
 * - Segunda inspeção: 2 anos após a primeira inspeção
 * - Terceira inspeção: 2 anos após a segunda inspeção
 * - Inspeções subsequentes: anuais
 */
export function calculateNextInspection(firstRegistrationDate, lastInspectionDate) {
  const firstRegDate = new Date(firstRegistrationDate);
  const lastInspDate = lastInspectionDate ? new Date(lastInspectionDate) : null;
  const today = new Date();
  
  // Se não houver inspeção anterior, calcular a partir da primeira matrícula
  if (!lastInspDate) {
    const firstInspectionDate = new Date(firstRegDate);
    firstInspectionDate.setFullYear(firstInspectionDate.getFullYear() + 4);
    
    // Se a data da primeira inspeção ainda não passou
    if (firstInspectionDate > today) {
      return firstInspectionDate;
    }
    
    // Se a data da primeira inspeção já passou
    // Tentar estimar onde estamos na sequência (4-2-2-1-1-...)
    const yearsSinceReg = today.getFullYear() - firstRegDate.getFullYear();
    
    if (yearsSinceReg < 4) {
      // Ainda não chegou à primeira inspeção
      const nextDate = new Date(firstRegDate);
      nextDate.setFullYear(nextDate.getFullYear() + 4);
      return nextDate;
    } else if (yearsSinceReg < 6) {
      // Entre a primeira e segunda inspeção
      const nextDate = new Date(firstRegDate);
      nextDate.setFullYear(nextDate.getFullYear() + 6);
      return nextDate;
    } else if (yearsSinceReg < 8) {
      // Entre a segunda e terceira inspeção
      const nextDate = new Date(firstRegDate);
      nextDate.setFullYear(nextDate.getFullYear() + 8);
      return nextDate;
    } else {
      // Após a terceira inspeção (anual)
      const nextDate = new Date(firstRegDate);
      const annualOffset = 8 + (yearsSinceReg - 8);
      nextDate.setFullYear(nextDate.getFullYear() + annualOffset + 1);
      return nextDate;
    }
  }
  
  // Se há uma inspeção anterior, calcular baseado na idade do veículo
  const yearsSinceReg = lastInspDate.getFullYear() - firstRegDate.getFullYear();
  
  if (yearsSinceReg < 4) {
    // Ainda não passou pela primeira inspeção
    const nextDate = new Date(firstRegDate);
    nextDate.setFullYear(nextDate.getFullYear() + 4);
    return nextDate;
  } else if (yearsSinceReg === 4) {
    // Após primeira inspeção (4 anos) -> próxima é em 2 anos
    const nextDate = new Date(lastInspDate);
    nextDate.setFullYear(nextDate.getFullYear() + 2);
    return nextDate;
  } else if (yearsSinceReg === 6) {
    // Após segunda inspeção (6 anos) -> próxima é em 2 anos
    const nextDate = new Date(lastInspDate);
    nextDate.setFullYear(nextDate.getFullYear() + 2);
    return nextDate;
  } else {
    // Após terceira inspeção ou mais -> inspeções anuais
    const nextDate = new Date(lastInspDate);
    nextDate.setFullYear(nextDate.getFullYear() + 1);
    return nextDate;
  }
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
