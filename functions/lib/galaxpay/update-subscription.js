const getAppData = require('../store-api/get-app-data')
const GalaxpayAxios = require('./create-access')

const updateValueSubscription = async (appSdk, storeId, auth, subscriptionId, amount, items, plan, oldValue) => {
  const value = checkAmountItemsOrder({ ...amount }, [...items], { ...plan })

  const appData = await getAppData({ appSdk, storeId, auth })
  const galaxpayAxios = new GalaxpayAxios(appData.galaxpay_id, appData.galaxpay_hash, storeId)
  await galaxpayAxios.preparing

  if (!oldValue) {
    const { data } = await galaxpayAxios.axios.get(`subscriptions?myIds=${subscriptionId}&startAt=0&limit=1`)
    oldValue = data.Subscriptions[0] && data.Subscriptions[0].value
  }

  if (oldValue !== value) {
    const { data } = await galaxpayAxios.axios.put(`subscriptions/${subscriptionId}/myId`, { value })
    if (data.type) {
      return value
    }
  }
  return null
}

const checkAmountItemsOrder = (amount, items, plan) => {
  let subtotal = 0
  let item
  for (let i = 0; i < items.length; i++) {
    item = items[i]
    if (item.flags && (item.flags.includes('freebie') || item.flags.includes('discount-set-free'))) {
      items.splice(i, 1)
    } else {
      subtotal += item.quantity * (item.final_price || item.price)
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
  amount.discount = plan ? ((plan.discount && !plan.discount.percentage ? plan.discount.value : planDiscount) || 0) : (amount.discount || 0)

  amount.total -= amount.discount
  return Math.floor((amount.total).toFixed(2) * 100)
}

module.exports = {
  updateValueSubscription,
  checkAmountItemsOrder
}
