const getAppData = require('../store-api/get-app-data')
const GalaxpayAxios = require('./create-access')

const updateValueSubscription = (appSdk, storeId, auth, subscriptionId, amount, items, plan, GalaxPaySubscription) => {
  const value = checkAmountItemsOrder({ ...amount }, [...items], { ...plan })

  return new Promise((resolve, reject) => {
    getAppData({ appSdk, storeId, auth })
      .then((appData) => {
        const galaxpayAxios = new GalaxpayAxios(appData.galaxpay_id, appData.galaxpay_hash, appData.galaxpay_sandbox, storeId)
        return galaxpayAxios.preparing
          .then(() => {
            return galaxpayAxios.axios.put(`subscriptions/${subscriptionId}/myId`, { value })
              .then(({ data }) => {
                if (data.type) {
                  resolve(true)
                }
              })
          })
      })
      .catch((err) => {
        reject(err)
      })
  })
}

const checkAmountItemsOrder = (amount, items, plan) => {
  let subtotal = 0
  let item
  for (let i = 0; i < items.length; i++) {
    item = items[i]
    if (item.flags && (item.flags.includes('freebie') || item.flags.includes('discount-set-free'))) {
      items.splice(i, 1)
    } else {
      subtotal += item.quantity * item.price
    }
  }
  amount.subtotal = subtotal
  amount.total = amount.subtotal + (amount.tax || 0) + (amount.freight || 0) + (amount.extra || 0)
  let planDiscount
  if (plan && plan.discount) {
    if (plan.discount.percentage) {
      planDiscount = amount[plan.discount.apply_at]
      planDiscount = planDiscount * ((plan.discount.value) / 100)
    }
  }
  // if the plan doesn't exist, because it's subscription before the update
  amount.discount = plan ? ((plan.discount && !plan.discount.percentage ? plan.discount.value : planDiscount) || 0) : amount.discount
  amount.total -= amount.discount
  return Math.floor((amount.total - amount.discount).toFixed(2) * 100)
}

module.exports = {
  updateValueSubscription,
  checkAmountItemsOrder
}
