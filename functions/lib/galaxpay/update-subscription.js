const getAppData = require('../store-api/get-app-data')
const GalaxpayAxios = require('./create-access')

const updateValueSubscriptionGalaxpay = async (galaxpayAxios, subscriptionId, value, oldValue) => {
  if (!oldValue) {
    const { data } = await galaxpayAxios.axios.get(`subscriptions?myIds=${subscriptionId}&startAt=0&limit=1`)
    oldValue = data.Subscriptions[0] && data.Subscriptions[0].value
  }

  if (oldValue !== value) {
    const { data } = await galaxpayAxios.axios.put(`subscriptions/${subscriptionId}/myId`, { value })
    if (data.type) {
      console.log('> Update [GP] =>', subscriptionId, ': ', oldValue, ' to ', value)
      return value
    }
  }
  return null
}

const checkAndUpdateSubscriptionGalaxpay = async (appSdk, storeId, auth, subscriptionId, amount, items, plan, oldValue) => {
  const value = checkItemsAndRecalculeteOrder({ ...amount }, [...items], { ...plan })

  const appData = await getAppData({ appSdk, storeId, auth })
  const galaxpayAxios = new GalaxpayAxios(appData.galaxpay_id, appData.galaxpay_hash, storeId)
  await galaxpayAxios.preparing
  return updateValueSubscriptionGalaxpay(galaxpayAxios, subscriptionId, value, oldValue)
}

const checkItemsAndRecalculeteOrder = (amount, items, plan, newItem) => {
  let subtotal = 0
  let item
  let i = 0
  while (i < items.length) {
    item = items[i]
    if (newItem && item.sku === newItem.sku) {
      if (newItem.quantity === 0) {
        items.splice(i, 1)
      } else {
        if (item.final_price) {
          item.final_price = newItem.price
        }
        item.price = newItem.price
        item.quantity = newItem.quantity
        subtotal += item.quantity * (item.final_price || item.price)
        i++
      }
    } else {
      if (item.flags && (item.flags.includes('freebie') || item.flags.includes('discount-set-free'))) {
        items.splice(i, 1)
      } else {
        subtotal += item.quantity * (item.final_price || item.price)
        i++
      }
    }
  }

  if (subtotal > 0) {
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
    return amount.total > 0 ? Math.floor((amount.total).toFixed(2) * 1000) / 10 : 0
  }

  return 0
}

const getSubscriptionsByListMyIds = async (
  galaxpayAxios,
  listOrders
) => {
  // Consultation on galaxpay has a limit of 100 per request
  const promises = []
  try {
    let myIds = ''
    await galaxpayAxios.preparing
    // Handle when there are more than 100 orders
    for (let i = 0; i < listOrders.length; i++) {
      if ((i + 1) % 100 !== 0 && (i + 1) !== listOrders.length) {
        myIds += `${listOrders[i]},`
      } else if ((i + 1) !== listOrders.length) {
        promises.push(
          galaxpayAxios.axios.get(`/subscriptions?myIds=${myIds}&startAt=0&&limit=100&&status=active`)
        )
        myIds = ''
      } else {
        myIds += `${listOrders[i]},`
        promises.push(
          galaxpayAxios.axios.get(`/subscriptions?myIds=${myIds}&startAt=0&&limit=100&&status=active`)
        )
      }
    }
    const galaxPaySubscriptions = (await Promise.all(promises))?.reduce((subscriptions, resp) => {
      if (resp.data?.Subscriptions) {
        subscriptions.push(...resp.data.Subscriptions)
      }
      return subscriptions
    }, [])
    return galaxPaySubscriptions
  } catch (err) {
    console.error(err)
    return null
  }
}

const compareDocItemsWithOrder = (docItemsAndAmount, originalItems, originalAmount, galapayTransactionValue) => {
  const finalAmount = Math.floor((originalAmount.total).toFixed(2) * 1000) / 1000

  console.log(`>>Compare values: ${JSON.stringify(originalAmount)} => total: ${finalAmount} GP: ${galapayTransactionValue}`)
  if (galapayTransactionValue !== finalAmount && docItemsAndAmount) {
    // need update itens and recalculate order
    let i = 0
    let itemOrder
    while (i < originalItems.length) {
      itemOrder = originalItems[i]
      const itemDoc = docItemsAndAmount.items.find(itemFind => itemFind.sku === itemOrder.sku)
      if (itemDoc) {
        if (itemOrder.price !== itemDoc.price) {
          itemOrder.price = itemDoc.price
          if (itemOrder.final_price !== itemDoc.final_price) {
            itemOrder.final_price = itemDoc.final_price
          }
        }

        if (itemOrder.quantity !== itemDoc.quantity) {
          itemOrder.quantity = itemDoc.quantity
        }
        i++
      } else {
        originalItems.splice(i, 1)
      }
    }
  }
}

module.exports = {
  checkAndUpdateSubscriptionGalaxpay,
  checkItemsAndRecalculeteOrder,
  updateValueSubscriptionGalaxpay,
  getSubscriptionsByListMyIds,
  compareDocItemsWithOrder
}
