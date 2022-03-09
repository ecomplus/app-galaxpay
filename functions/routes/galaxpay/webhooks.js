const getAppData = require('../../lib/store-api/get-app-data')
const GalaxpayAxios = require('../../lib/galaxpay/create-access')
const parseStatus = require('../../lib/payments/parse-status')
const parseId = require('../../lib/galaxpay/parseId-to-ecom')
exports.post = ({ appSdk, admin }, req, res) => {
  // const galaxpayAxios = new GalaxpayAxios(appData.galaxpay_id, appData.galaxpay_hash, appData.galaxpay_sandbox)
  // https://docs.galaxpay.com.br/webhooks

  // endpoint https://us-central1-ecom-galaxpay.cloudfunctions.net/app/galaxpay/webhooks

  // POST transaction.updateStatus update Transation status
  // POST subscription.addTransaction add transation in subscription

  const galaxpayHook = req.body
  const type = galaxpayHook.event
  const GalaxPaySubscription = galaxpayHook.Subscription
  const subscriptionId = GalaxPaySubscription.myId
  const GalaxPayTransaction = galaxpayHook.Transaction

  console.log('> Galaxy WebHook ', type)
  const collectionSubscription = admin.firestore().collection('subscriptions')

  const findOrderByTransactionId = (appSdk, storeId, auth, transactionId) => {
    return new Promise((resolve, reject) => {
      appSdk.apiRequest(storeId, `/orders.json?transactions._id=${transactionId}`, 'GET', null, auth)
        .then(({ response }) => {
          // console.log('> OK PROMISSE ')
          resolve({ response })
        })
        .catch((err) => {
          // console.log('> ERRO PROMISSE')
          reject(err)
        })
    })
  }

  const findOrderById = (appSdk, storeId, auth, orderId) => {
    return new Promise((resolve, reject) => {
      appSdk.apiRequest(storeId, `/orders/${orderId}.json`, 'GET', null, auth)
        .then(({ response }) => {
          // console.log('> OK PROMISSE ')
          resolve({ response })
        })
        .catch((err) => {
          // console.log('> ERRO PROMISSE')
          reject(err)
        })
    })
  }

  if (galaxpayHook.confirmHash) {
    console.log('> ', galaxpayHook.confirmHash)
  }

  if (type === 'transaction.updateStatus') {
    const subscription = collectionSubscription.doc(subscriptionId)
    subscription.get()
      .then((documentSnapshot) => {
        console.log('> Update Status')
        // find StoreId in subscription
        const storeId = documentSnapshot.data().storeId
        const orderNumber = documentSnapshot.data().orderNumber
        const transactionId = documentSnapshot.data().transactionId
        if (documentSnapshot.exists && storeId) {
          appSdk.getAuth(storeId)
            .then(auth => {
              let order
              if (transactionId === GalaxPayTransaction.galaxPayId) {
                findOrderById(appSdk, storeId, auth, subscriptionId)
                  .then(({ response }) => {
                    console.log('> order? ', response)
                    order = response.data
                    if (order.financial_status && order.financial_status.current === parseStatus(GalaxPayTransaction.status)) {
                      // console.log('> Equals Status')
                      res.sendStatus(200)
                    } else {
                      // console.log('> Order id ')
                      // update payment
                      // const body = {
                      //   date_time: new Date().toISOString(),
                      //   status: parseStatus(GalaxPayTransaction.status),
                      //   transaction_id: transactionId,
                      //   notification_code: type + ';' + galaxpayHook.webhookId,
                      //   flags: ['GalaxPay']
                      // }
                      // return appSdk.apiRequest(storeId, `orders/${order._id}/payments_history.json`, 'POST', body, auth)
                    }
                  })
              } else {
                const transaction_id = String(parseId(GalaxPayTransaction.galaxPayId))
                findOrderByTransactionId(appSdk, storeId, auth, transaction_id)
                  .then(({ response }) => {
                    return new Promise((resolve, reject) => {
                      const { result } = response.data
                      console.log('> result ', result)
                      if (!result || !result.length) {
                        // console.log('> Not found Transaction in API')
                        reject(new Error())
                      } else {
                        resolve({ result })
                      }
                    })
                  })
                  .then(({ result }) => {
                    console.log('> new result ', result)
                    order = result[0]
                    if (order.financial_status && order.financial_status.current === parseStatus(GalaxPayTransaction.status)) {
                      // console.log('> Equals Status')
                      res.sendStatus(200)
                    } else {
                      // console.log('> Order id ')
                      // update payment
                      const body = {
                        date_time: new Date().toISOString(),
                        status: parseStatus(GalaxPayTransaction.status),
                        transaction_id: transaction_id,
                        notification_code: type + ';' + galaxpayHook.webhookId,
                        flags: ['GalaxPay']
                      }
                      return appSdk.apiRequest(storeId, `orders/${order._id}/payments_history.json`, 'POST', body, auth)
                    }
                  })
                  .then(apiResponse => {
                    console.log('>  create Payment History')
                    const body = {
                      intermediator: {
                        transaction_id: GalaxPayTransaction.tid || '',
                        transaction_code: GalaxPayTransaction.authorizationCode || ''
                      }
                    }
                    return appSdk.apiRequest(storeId, `orders/${order._id}/transactions/${transaction_id}.json`, 'PATCH', body, auth)
                  })
                  .then(apiResponse => {
                    console.log('> UPDATE Transaction OK')
                    res.sendStatus(200)
                  })
                  .catch(err => {
                    console.error(err)
                    res.status(500).send('Error Internal')
                  })
              }
            })
            .catch(err => {
              console.error(err)
              res.sendStatus(400)
            })
        }
      })
      .catch(err => {
        console.error(err)
        res.status(500).send('Error Internal')
      })
  } else if (type === 'subscription.addTransaction') {
    // find transaction in firebase
    // create transaction in firebase and order API
    const subscription = collectionSubscription.doc(subscriptionId)
    subscription.get()
      .then((documentSnapshot) => {
      // find StoreId in subscription
        const storeId = documentSnapshot.data().storeId
        const orderNumber = documentSnapshot.data().orderNumber
        const transactionId = documentSnapshot.data().transactionId
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
                      notes: `${installment}ª Parcela da Assinatura ${orderNumber}`
                    }
                  ]
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
                    notes: `${installment}ª Parcela da Assinatura ${orderNumber}`
                  }
                  const transaction_id = String(parseId(GalaxPayTransaction.galaxPayId))
                  return findOrderByTransactionId(appSdk, storeId, auth, transaction_id)
                })
                .then(({ response }) => {
                  const { result } = response.data
                  if (!result.length) {
                    appSdk.apiRequest(storeId, 'orders.json', 'POST', body, auth)
                      .then(({ response }) => {
                        console.log('> Created new order API')
                        res.sendStatus(200)
                      })
                      .catch((err) => {
                        console.error(err)
                        res.status(500).send('Error Internal')
                      })
                  } else {
                    // Order Exists
                    res.sendStatus(200)
                  }
                })
                .catch((err) => {
                  console.error(err)
                  res.status(500).send('Error Internal')
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
        res.status(500).send('Error Internal')
      })
  }
}
