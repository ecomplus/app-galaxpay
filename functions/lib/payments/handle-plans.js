
const handleGateway = (appData) => {
  let gateways = []
  if (appData.plan_recurrence) {
    const plan = {
      disable: false,
      periodicity: appData.plan_recurrence.periodicity,
      quantity: appData.plan_recurrence.quantity,
      discount: { percentage: false }
    }
    gateways.push(plan)
    return gateways
  }
}

module.exports = {
  handleGateway
}
