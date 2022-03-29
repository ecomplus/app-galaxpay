
const handleGateway = (appData) => {
  let gateways = []
  if (appData.plan_recurrence && !appData.plan_recurrence.disable) {
    const label = appData.galaxpay_subscription_label ? appData.galaxpay_subscription_label : ''
    const plan = {
      label,
      periodicity: appData.plan_recurrence.periodicity,
      quantity: appData.plan_recurrence.quantity,
      discount: { percentage: false }
    }
    gateways.push(plan)
  } else if (appData.plans) {
    appData.plans.forEach(plan => {
      gateways.push(plan)
    })
  }

  return gateways
}

module.exports = {
  handleGateway
}
