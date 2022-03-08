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
          console.log('> OK PROMISSE ')
          resolve({ response })
        })
        .catch((err) => {
          console.log('> ERRO PROMISSE')
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
      // find StoreId in subscription
        const storeId = documentSnapshot.data().storeId
        const orderNumber = documentSnapshot.data().orderNumber
        const transactionId = documentSnapshot.data().transactionId
        if (documentSnapshot.exists && storeId) {
          appSdk.getAuth(storeId)
            .then(auth => {
              const transactionId = String(parseId(GalaxPayTransaction.galaxPayId))
              findOrderByTransactionId(appSdk, storeId, auth, transactionId)
                .then(({ response }) => {
                  const { result } = response.data
                  if (!result.length) {
                    console.log('> Not found Transaction in API')
                    res.sendStatus(400)
                  }
                  console.log('> result ', result)
                  const order = result[0]
                  if (order.financial_status.current === parseStatus(GalaxPayTransaction.status)) {
                    console.log('> equals Status')
                    res.sendStatus(200)
                  } else {
                    console.log('> Order id ', order._id)
                    // update payment
                    let body = {
                      date_time: new Date().toISOString(),
                      status: parseStatus(GalaxPayTransaction.status),
                      transaction_id: transactionId,
                      notification_code: type + ';' + galaxpayHook.webhookId,
                      flags: ['GalaxPay']
                    }
                    appSdk.apiRequest(storeId, `orders/${order._id}/payments_history.json`, 'POST', body, auth)
                      .then(apiResponse => {
                        body = {
                          status: {
                            updated_at: GalaxPayTransaction.datetimeLastSentToOperator || new Date().toISOString(),
                            current: parseStatus(GalaxPayTransaction.status)
                          },
                          intermediator: {
                            transaction_id: GalaxPayTransaction.tid || '',
                            transaction_code: GalaxPayTransaction.authorizationCode || ''
                          }
                        }
                        appSdk.apiRequest(storeId, `orders/${order._id}/transactions/${transactionId}.json`, 'PATCH', body, auth)
                          .then(apiResponse => {
                            console.log('> UPDATE Transaction OK')
                            res.sendStatus(200)
                          })
                          .catch((err) => {
                            console.log('> ERRO UPDATE Transaction')
                            console.error(err)
                            res.sendStatus(500)
                          })
                      })
                      .catch(err => {
                        console.error(err)
                        res.sendStatus(500)
                      })
                  }
                })
                .catch(err => {
                  console.error(err)
                  res.sendStatus(500)
                })
            })
            .catch(err => {
              console.error(err)
              res.sendStatus(500)
            })
        }
      })
      .catch(err => {
        console.error(err)
        res.sendStatus(500)
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
              appSdk.apiRequest(storeId, `/orders/${subscriptionId}.json`, 'GET', null, auth)
                .then(({ response }) => {
                  console.log('> Create new Order ')
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
                      _id: String(parseId(GalaxPayTransaction.galaxPayId))
                    }
                  ]
                  const body = {
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
                    subscription_order: {
                      _id: subscriptionId,
                      number: parseInt(orderNumber)
                    },
                    notes: `${installment}ª Parcela da Assinatura ${orderNumber}`
                  }
                  const transactionId = String(parseId(GalaxPayTransaction.galaxPayId))
                  findOrderByTransactionId(appSdk, storeId, auth, transactionId)
                    .then(({ response }) => {
                      const { result } = response.data
                      if (!result.length) {
                        appSdk.apiRequest(storeId, 'orders.json', 'POST', body, auth)
                          .then(({ response }) => {
                            console.log('> *Created new order')
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
                .catch(err => {
                  console.error(err)
                  res.sendStatus(500)
                })
            })
        } else {
          console.log('> Not Found Subscritpion or Transaction exists')
          res.sendStatus(400)
        }
      })
      .catch(err => {
        console.error(err)
        res.sendStatus(500)
      })
  }
}
