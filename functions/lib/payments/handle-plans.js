
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

const handlePlanTransction = (label, appData) => {
  if (appData.plan_recurrence && !appData.plan_recurrence.disable) {
    const plan = {
      label,
      periodicity: appData.plan_recurrence.periodicity,
      quantity: appData.plan_recurrence.quantity,
      discount: { percentage: false }
    }
    return plan
  } else if (appData.plans) {
    console.log('> label ' + label)
    for (let i = 0; i < appData.plans.length; i++) {
      const planName = appData.plan[i].label ? appData.plan[i].label : 'Plano'
      console.log(planName + ' ' + appData.plan[i].periodicity)
      if (planName + ' ' + appData.plan[i].periodicity === label.trim()) {
        return appData.plan[i]
      }
    }
  }
}

module.exports = {
  handleGateway,
  handlePlanTransction
}
