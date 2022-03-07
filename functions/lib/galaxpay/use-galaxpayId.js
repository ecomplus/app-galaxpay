module.exports = galaxpayId => {
  const length = 24 - galaxpayId.toString().length + 1
  return Array(length).join('0') + galaxpayId
}
