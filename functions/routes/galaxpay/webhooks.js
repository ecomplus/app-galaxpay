const getAppData = require('../../lib/store-api/get-app-data')
const GalaxpayAxios = require('../../lib/galaxpay/create-access')
const { parseId, parseStatus, parsePeriodicity } = require('../../lib/galaxpay/parse-to-ecom')
const { findOrderById, findOrderByTransactionId, createTransaction } = require('./functions-webhook')

exports.post = ({ appSdk, admin }, req, res) => {
  // const galaxpayAxios = new GalaxpayAxios(appData.galaxpay_id, appData.galaxpay_hash, appData.galaxpay_sandbox)
  // https://docs.galaxpay.com.br/webhooks

  // endpoint https://us-central1-ecom-galaxpay.cloudfunctions.net/app/galaxpay/webhooks

  // POST transaction.updateStatus update Transation status
  // POST subscription.addTransaction add transation in subscription

  const galaxpayHook = req.body
  const type = galaxpayHook.event
  const GalaxPaySubscription = galaxpayHook.Subscription
  const GalaxPaySubscriptionQuantity = GalaxPaySubscription.quantity
  const subscriptionId = GalaxPaySubscription.myId
  const GalaxPayTransaction = galaxpayHook.Transaction

  console.log('> Galaxy WebHook ', type)
  const collectionSubscription = admin.firestore().collection('subscriptions')

  if (galaxpayHook.confirmHash) {
    console.log('> ', galaxpayHook.confirmHash)
  }

  if (type === 'transaction.updateStatus') {
    const subscription = collectionSubscription.doc(subscriptionId)
    subscription.get()
      .then((documentSnapshot) => {
        // console.log('> Update Status')
        // find StoreId in subscription
        const storeId = documentSnapshot.data().storeId
        const orderNumber = documentSnapshot.data().orderNumber
        const transactionId = documentSnapshot.data().transactionId
        if (documentSnapshot.exists && storeId) {
          appSdk.getAuth(storeId)
            .then(auth => {
              let order
              if (transactionId === GalaxPayTransaction.galaxPayId) {
                // update frist payment
                findOrderById(appSdk, storeId, auth, subscriptionId)
                  .then(({ response }) => {
                    order = response.data
                    // console.log('> order ', order)
                    if (order.financial_status && order.financial_status.current === parseStatus(GalaxPayTransaction.status)) {
                      // console.log('> Equals Status')
                      res.sendStatus(200)
                    } else {
                      // update payment
                      const transaction_id = order.transactions[0]._id
                      const body = {
                        date_time: new Date().toISOString(),
                        status: parseStatus(GalaxPayTransaction.status),
                        transaction_id: transaction_id,
                        notification_code: type + ';' + galaxpayHook.webhookId,
                        flags: ['GalaxPay']
                      }
                      return appSdk.apiRequest(storeId, `orders/${order._id}/payments_history.json`, 'POST', body, auth)
                        .then(apiResponse => {
                          // console.log('>  create Payment History')
                          const body = {
                            intermediator: {
                              transaction_id: GalaxPayTransaction.tid || '',
                              transaction_code: GalaxPayTransaction.authorizationCode || ''
                            }
                          }
                          return appSdk.apiRequest(storeId, `orders/${order._id}/transactions/${transaction_id}.json`, 'PATCH', body, auth)
                        })
                        .then(apiResponse => {
                          // console.log('> UPDATE Transaction OK')
                          res.sendStatus(200)
                        })
                        .catch(err => {
                          console.error(err)
                          res.sendStatus(500)
                        })
                    }
                  })
              } else if (GalaxPaySubscriptionQuantity === 0) {
                const transaction_id = String(parseId(GalaxPayTransaction.galaxPayId))
                findOrderByTransactionId(appSdk, storeId, auth, transaction_id)
                  .then(({ response }) => {
                    return new Promise((resolve, reject) => {
                      const { result } = response.data
                      if (!result || !result.length) {
                        // console.log('> Not found Transaction in API')
                        reject(new Error())
                      } else {
                        resolve({ result })
                      }
                    })
                  })
                  .then(({ result }) => {
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
                    // console.log('>  create Payment History')
                    const body = {
                      intermediator: {
                        transaction_id: GalaxPayTransaction.tid || '',
                        transaction_code: GalaxPayTransaction.authorizationCode || ''
                      }
                    }
                    return appSdk.apiRequest(storeId, `orders/${order._id}/transactions/${transaction_id}.json`, 'PATCH', body, auth)
                  })

                  .then(apiResponse => {
                    if (parseStatus(GalaxPayTransaction.status) === 'voided') {
                      const body = {
                        status: 'cancelled'
                      }
                      appSdk.apiRequest(storeId, `orders/${order._id}.json`, 'PATCH', body, auth)
                        .then(({ response }) => {
                          // console.log('> UPDATE ORDER OK')
                          res.sendStatus(200)
                        })
                        .catch(err => {
                          console.error(err)
                          res.sendStatus(500)
                        })
                    } else {
                      // console.log('> UPDATE Transaction OK')
                      res.sendStatus(200)
                    }
                  })
                  .catch(err => {
                    console.error(err)
                    res.sendStatus(500)
                  })
              } else {
                // add order, because recorrence create all transaction in frist transaction when quantity non-zero, but we need create order when user to pay transaction
                createTransaction(appSdk, res, subscription, GalaxPayTransaction, GalaxPaySubscription, subscriptionId)
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
        res.sendStatus(500)
      })
  } else if (type === 'subscription.addTransaction' && GalaxPaySubscriptionQuantity === 0) {
    // find transaction in firebase
    const subscription = collectionSubscription.doc(subscriptionId)
    createTransaction(appSdk, res, subscription, GalaxPayTransaction, GalaxPaySubscription, subscriptionId)
  }
}
