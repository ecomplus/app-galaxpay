
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
    let sendPlan

    // appData.plans.find((plan) => (plan.label ? plan.label : 'Plano' + ' ' + plan.periodicity) === label.trim())
    console.log('># ', label)
    appData.plans.forEach((plan) => {
      let planLabel = plan.label || 'Plano'
      planLabel = planLabel + ' ' + plan.periodicity
      label = label.trim()
      console.log('-> ', planLabel)
      if (label === planLabel) {
        sendPlan = plan
      }
    })
    return sendPlan
  }
}

const discountPlan = (planName, discount, amount) => {
  if (discount && discount.value > 0) {
    // default discount option
    const { value } = discount
    const discountOption = {
      label: planName,
      value,
      type: discount.percentage ? 'percentage' : 'fixed'
    }
    // response.discount_option

    if (amount.total) {
      // check amount value to apply discount
      if (amount.total < discount.min_amount) {
        discount.value = 0
      } else {
        delete discount.min_amount

        // fix local amount object
        const applyDiscount = discount.apply_at && discount.apply_at === 'frete' ? 'freight' : discount.apply_at

        const maxDiscount = amount[applyDiscount || 'subtotal']
        let discountValue
        if (discount.percentage && discount.percentage === true) {
          discountValue = maxDiscount * discount.value / 100
        } else {
          discountValue = discount.value
          if (discountValue > maxDiscount) {
            discountValue = maxDiscount
          }
        }
        if (discountValue > 0) {
          amount.discount = (amount.discount || 0) + discountValue
          amount.total -= discountValue
          if (amount.total < 0) {
            amount.total = 0
          }
        }
      }
    }
    return { amount, discountOption }
  }
}

module.exports = {
  handleGateway,
  handlePlanTransction,
  discountPlan
}
