
// for list-payments
const handleGateway = (appData) => {
  const gateways = []
  // Check that the app has the plan_recurrence property and that the property is not disabled.
  if (appData.plan_recurrence && !appData.plan_recurrence.disable) {
    const label = appData.galaxpay_subscription_label ? appData.galaxpay_subscription_label : ''
    // create plan, to list-payments
    const plan = {
      label,
      periodicity: appData.plan_recurrence.periodicity,
      quantity: appData.plan_recurrence.quantity,
      discount: { percentage: false }
    }
    // add plan on  payments gateways list
    gateways.push(plan)
  } else if (appData.plans) {
    // Newer versions of the app will have a list of plans
    appData.plans.forEach(plan => {
      gateways.push(plan)
    })
  }

  return gateways
}

// for create-transaction
const handlePlanTransction = (label, appData) => {
  // Check that the app has the plan_recurrence property and that the property is not disabled.
  if (appData.plan_recurrence && !appData.plan_recurrence.disable) {
    const plan = {
      label,
      periodicity: appData.plan_recurrence.periodicity,
      quantity: appData.plan_recurrence.quantity,
      discount: { percentage: false }
    }
    return plan
  } else if (appData.plans) {
    /* More recent versions of the application will have a list of plans, where it will be necessary to find the plan by name,
    and return it since it will be necessary to use the periodicity and quantity property */
    let sendPlan

    // find plan by name (label)
    appData.plans.forEach((plan) => {
      // if the name of the plan is blank, on the list-payments side it is set to 'Plano'
      let planLabel = plan.label || 'Plano'
      planLabel = planLabel + ' ' + plan.periodicity
      label = label.trim()
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
