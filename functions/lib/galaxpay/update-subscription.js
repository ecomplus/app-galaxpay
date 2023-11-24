const getAppData = require('../store-api/get-app-data')
const GalaxpayAxios = require('./create-access')
const axios = require('axios')
const { getProductsById } = require('../store-api/request-api')
const { error } = require('firebase-functions/logger')

const checkProducstExists = async (appSdk, storeId, items, auth) => {
  // product may have been deleted but still belong to a subscription
  let i = 0
  while (i < items.length) {
    const item = items[i]
    const product = await getProductsById(appSdk, storeId, item.product_id, auth)
      .catch(console.error)

    if (!product) {
      items.splice(i, 1)
    } else {
      i += 1
    }
  }
}

const getNewFreight = async (storeId, itemsOrder, to, subtotal, shippingLineOriginal, appSdk, auth) => {
  if (!shippingLineOriginal.app) return null
  const items = []
  let i = 0

  while (i < itemsOrder.length) {
    const item = itemsOrder[i]
    if (!item.dimensions) {
      // add dimensions for shipping calculation
      const product = await getProductsById(appSdk, storeId, item.product_id, auth)
        .catch(console.error)

      let dimensions = product?.dimensions
      let weight = product?.weight

      if (product) {
        if (item.variation_id) {
          const variation = product.variations.find(itemFind => itemFind.sku === item.sku)
          if (variation.dimensions) {
            dimensions = variation.dimensions
          }
          if (variation.weight) {
            weight = variation.weight
          }
        }
        items.push({ ...item, dimensions, weight })
      }
    } else {
      items.push({ ...item })
    }
    i += 1
  }

  const body = {
    items,
    subtotal,
    to
  }

  const headers = {
    'x-store-id': storeId,
    accept: 'application/json'
  }

  try {
    const { data: { result } } = await axios.post(
      'https://apx-mods.e-com.plus/api/v1/calculate_shipping.json',
      body,
      { headers }
    )

    if (!result.length) return null

    const sameApp = result.find(appFind => appFind._id === shippingLineOriginal.app._id)

    if (sameApp) {
      const service = sameApp.response?.shipping_services?.find(
        serviceFind => serviceFind.service_code === shippingLineOriginal.app.service_code
      )

      return {
        app: sameApp,
        service: service || sameApp.response?.shipping_services[0]
      }
    } else {
      let minPrice = result[0]?.response?.shipping_services[0]?.shipping_line?.total_price
      const indexPosition = { app: 0, service: 0 }
      for (let i = 0; i < result.length; i++) {
        const app = result[i]

        for (let j = 0; j < app.response?.shipping_services.length; j++) {
          const service = app.response?.shipping_services[j]

          if (service.service_code === shippingLineOriginal.app.service_code) {
            return { app, service }
          } else if (minPrice > service?.shipping_line?.total_price) {
            minPrice = service?.shipping_line?.total_price
            indexPosition.app = i
            indexPosition.service = j
          }
        }
      }
      return {
        app: result[indexPosition.app],
        service: result[indexPosition.app]?.response?.shipping_services[indexPosition.service]
      }
    }
  } catch (err) {
    console.error(err)
    return null
  }
}

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

const checkAndUpdateSubscriptionGalaxpay = async (appSdk, storeId, auth, subscriptionId, amount, items, plan, oldValue, shippingLine) => {
  const { value } = await checkItemsAndRecalculeteOrder(
    { ...amount },
    [...items],
    { ...plan },
    null,
    { ...shippingLine },
    storeId,
    appSdk,
    auth
  )

  const appData = await getAppData({ appSdk, storeId, auth })
  const galaxpayAxios = new GalaxpayAxios(appData.galaxpay_id, appData.galaxpay_hash, storeId)
  await galaxpayAxios.preparing
  return updateValueSubscriptionGalaxpay(galaxpayAxios, subscriptionId, value, oldValue)
}

const checkItemsAndRecalculeteOrder = async (amount, items, plan, newItem, shippingLine, storeId, appSdk, auth) => {
  let subtotal = 0
  let item
  let i = 0

  if (appSdk) {
    await checkProducstExists(appSdk, storeId, items, auth)
  }

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
    if (shippingLine && storeId && appSdk && auth) {
      const newFreight = await getNewFreight(storeId, items, shippingLine.to, subtotal, shippingLine, appSdk, auth)

      if (newFreight) {
        const { app, service } = newFreight
        if (service && service?.service_code !== shippingLine.app.service_code) {
          shippingLine = {
            ...service.shipping_line,
            app: {
              _id: app._id,
              service_code: service?.service_code,
              label: service?.label
            }
          }
          amount.freight = service.shipping_line.total_price
        }
        delete shippingLine._id
        delete shippingLine.tracking_codes
        delete shippingLine.invoices
      }
    }

    amount.subtotal = subtotal
    amount.total = amount.subtotal + (amount.tax || 0) + (amount.freight || 0) + (amount.extra || 0)
    let planDiscount
    if (plan && plan.discount) {
      if (plan.discount.percentage || plan.discount.type === 'percentage') {
        planDiscount = amount[plan.discount.apply_at]
        planDiscount = planDiscount * ((plan.discount.value) / 100)
      } else {
        planDiscount = plan.discount.value
      }
    }
    amount.discount = planDiscount || amount.discount || 0

    amount.total -= amount.discount
    return {
      value: amount.total > 0 ? Math.floor((amount.total).toFixed(2) * 1000) / 10 : 0,
      shippingLine
    }
  }

  return { value: 0, shippingLine }
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
    if (err.response) {
      const { status, data } = err.response
      console.log('Error: ', status, ' ', data && JSON.stringify(data))
    } else {
      console.error(err)
    }
    return null
  }
}

const compareDocItemsWithOrder = (docItemsAndAmount, originalItems, originalAmount, galapayTransactionValue) => {
  const finalAmount = Math.floor((originalAmount.total).toFixed(2) * 1000) / 1000

  console.log(`>>Compare values: ${JSON.stringify(originalAmount)} => total: ${finalAmount} GP: ${galapayTransactionValue}`)
  if (galapayTransactionValue !== finalAmount) {
    // need update itens and recalculate order
    let i = 0
    let itemOrder
    while (i < originalItems.length) {
      itemOrder = originalItems[i]
      const itemDoc = docItemsAndAmount.items?.find(itemFind => itemFind.sku === itemOrder.sku)
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

const updateTransactionGalaxpay = async (galaxpayAxios, galaxPayId, value) => {
  const { data } = await galaxpayAxios.axios
    .put(`/transactions/${galaxPayId}/galaxPayId`,
      {
        value
      }
    )

  if (data) {
    console.log('> Successful transaction edit on Galax Pay #', galaxPayId)
  }
}

module.exports = {
  checkAndUpdateSubscriptionGalaxpay,
  checkItemsAndRecalculeteOrder,
  updateValueSubscriptionGalaxpay,
  getSubscriptionsByListMyIds,
  compareDocItemsWithOrder,
  updateTransactionGalaxpay
}
