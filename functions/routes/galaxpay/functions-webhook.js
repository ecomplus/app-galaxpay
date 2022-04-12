const { parseId, parseStatus, parsePeriodicity } = require('../../lib/galaxpay/parse-to-ecom')

const findOrderByTransactionId = (appSdk, storeId, auth, transactionId) => {
  return new Promise((resolve, reject) => {
    appSdk.apiRequest(storeId, `/orders.json?transactions._id=${transactionId}`, 'GET', null, auth)
      .then(({ response }) => {
        resolve({ response })
      })
      .catch((err) => {
        reject(err)
      })
  })
}

const findOrderById = (appSdk, storeId, auth, orderId) => {
  return new Promise((resolve, reject) => {
    appSdk.apiRequest(storeId, `/orders/${orderId}.json?fields=transactions,financial_status`, 'GET', null, auth)
      .then(({ response }) => {
        resolve({ response })
      })
      .catch((err) => {
        reject(err)
      })
  })
}

const createTransaction = (appSdk, res, subscription, GalaxPayTransaction, GalaxPaySubscription, subscriptionId) => {
  subscription.get()
    .then((documentSnapshot) => {
      // find StoreId in subscription
      const storeId = documentSnapshot.data().storeId
      const orderNumber = documentSnapshot.data().orderNumber // number original order
      const transactionId = documentSnapshot.data().transactionId // Id frist transaction subscription
      const subscriptionLabel = documentSnapshot.data().subscriptionLabel
      if (documentSnapshot.exists && storeId && transactionId !== GalaxPayTransaction.galaxPayId) {
        appSdk.getAuth(storeId)
          .then(auth => {
            // Get Original Order
            let body
            appSdk.apiRequest(storeId, `/orders/${subscriptionId}.json`, 'GET', null, auth)
              .then(({ response }) => {
                // console.log('> Create new Order ')
                const installment = GalaxPayTransaction.installment
                const oldOrder = response.data
                const buyers = oldOrder.buyers
                const items = oldOrder.items
                const channel_type = oldOrder.channel_type
                const domain = oldOrder.domain
                const amount = oldOrder.amount
                const shipping_lines = oldOrder.shipping_lines
                const shipping_method_label = oldOrder.shipping_method_label
                const payment_method_label = oldOrder.payment_method_label
                const originalTransaction = oldOrder.transactions[0]
                const quantity = installment
                const periodicity = parsePeriodicity(GalaxPaySubscription.periodicity)

                const transactions = [
                  {
                    amount: originalTransaction.amount,
                    status: {
                      updated_at: GalaxPayTransaction.datetimeLastSentToOperator || new Date().toISOString(),
                      current: parseStatus(GalaxPayTransaction.status)
                    },
                    intermediator: {
                      transaction_id: GalaxPayTransaction.tid || '',
                      transaction_code: GalaxPayTransaction.authorizationCode || ''
                    },
                    payment_method: originalTransaction.payment_method,
                    app: originalTransaction.app,
                    _id: String(parseId(GalaxPayTransaction.galaxPayId)),
                    notes: `Parcela #${quantity} referente à ${subscriptionLabel} ${periodicity}`,
                    custom_fields: originalTransaction.custom_fields
                  }
                ]

                if (transactions[0].payment_method.code === 'banking_billet') {
                  transactions[0].payment_link = GalaxPaySubscription.paymentLink
                }

                const financial_status = {
                  updated_at: GalaxPayTransaction.datetimeLastSentToOperator || new Date().toISOString(),
                  current: parseStatus(GalaxPayTransaction.status)
                }
                body = {
                  opened_at: new Date().toISOString(),
                  items,
                  shipping_lines,
                  buyers,
                  channel_type,
                  domain,
                  amount,
                  shipping_method_label,
                  payment_method_label,
                  transactions,
                  financial_status,
                  subscription_order: {
                    _id: subscriptionId,
                    number: parseInt(orderNumber)
                  },
                  notes: `Pedido #${quantity} referente à ${subscriptionLabel} ${periodicity}`
                }
                const transaction_id = String(parseId(GalaxPayTransaction.galaxPayId))
                return findOrderByTransactionId(appSdk, storeId, auth, transaction_id)
              })
              .then(({ response }) => {
                const { result } = response.data
                if (!result.length) {
                  appSdk.apiRequest(storeId, 'orders.json', 'POST', body, auth)
                    .then(({ response }) => {
                      // console.log('> Created new order API')
                      res.sendStatus(200)
                    })
                    .catch((err) => {
                      console.error(err)
                      res.sendStatus(500)
                    })
                } else {
                  // Order Exists
                  res.sendStatus(200)
                }
              })
              .catch((err) => {
                console.error(err)
                res.sendStatus(500)
              })
          })
          .catch(() => {
            res.sendStatus(401)
          })
      } else {
        // console.log('> Not Found Subscritpion or Transaction exists')
        res.sendStatus(404)
      }
    })
    .catch(err => {
      console.error(err)
      res.sendStatus(500)
    })
}

module.exports = {
  createTransaction
}
