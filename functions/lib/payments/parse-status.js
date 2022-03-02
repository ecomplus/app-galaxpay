module.exports = galaxPayTransationStatus => {
  switch (galaxPayTransationStatus) {
    case 'pendingBoleto': // Boleto em aberto
    case 'pendingPix': // Pix em aberto
      return 'pending'
    case 'captured': // Capturada na Operadora de Cartão
    case 'authorized': // Autorizado na Operadora de Cartão
      return 'authorized'
    case 'payExternal' : // Paga fora do sistema
    case 'payedBoleto' : // Boleto compensado
    case 'payedPix' : // Pix pago
    case 'free' : // Isento
      return 'paid'
    case 'denied': // Negada na Operadora de Cartão
      return 'unauthorized'
    case 'reversed': // Estornada na Operadora de Cartão
      return 'refunded'
    case 'cancel': // Cancelada manualmente
    case 'cancelByContract': // Cancelada ao cancelar a cobrança
    case 'notCompensated' : // Boleto baixado por decurso de prazo
    case 'unavailablePix' : // Pix indisponível para pagamento
      return 'voided'
    case 'notSend': // Ainda não enviada para operadora de Cartão
      return 'under_analysis'
  }
  return 'unknown'
}
