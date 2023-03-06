const { parseId, parseStatus, parsePeriodicity } = require('../../lib/galaxpay/parse-to-ecom')
const { updateValueSubscription, checkAmountItemsOrder } = require('../../lib/galaxpay/update-subscription')
const getAppData = require('./../../lib/store-api/get-app-data')
const GalaxpayAxios = require('./../../lib/galaxpay/create-access')

exports.post = async ({ appSdk, admin }, req, res) => {
  // const galaxpayAxios = new GalaxpayAxios(appData.galaxpay_id, appData.galaxpay_hash, appData.galaxpay_sandbox)
  // https://docs.galaxpay.com.br/webhooks

  // endpoint https://us-central1-ecom-galaxpay.cloudfunctions.net/app/galaxpay/webhooks

  // POST transaction.updateStatus update Transation status
  // POST subscription.addTransaction add transation in subscription

  const galaxpayHook = req.body
  const type = galaxpayHook?.event
  const GalaxPaySubscription = galaxpayHook?.Subscription
  const GalaxPaySubscriptionQuantity = GalaxPaySubscription?.quantity
  const subscriptionId = GalaxPaySubscription?.myId
  const GalaxPayTransaction = galaxpayHook?.Transaction
  const GalaxPayTransactionValue = GalaxPayTransaction?.value && (GalaxPayTransaction.value / 100)

  console.log('> Galaxy WebHook ', type, ' Body Webhook ', JSON.stringify(galaxpayHook), ' quantity: ', GalaxPaySubscriptionQuantity, ' status:', GalaxPayTransaction.status, ' <')
  const collectionSubscription = admin.firestore().collection('subscriptions')

  const checkStatus = (financialStatus, GalaxPayTransaction) => {
    if (financialStatus.current === parseStatus(GalaxPayTransaction.status)) {
      return true
    } else if ((financialStatus.current === 'paid' || financialStatus.current === 'authorized') && parseStatus(GalaxPayTransaction.status) !== 'refunded') {
      return true
    }
    return false
  }

  const checkStatusNotValid = (status) => {
    const parsedStatus = parseStatus(status)
    console.log('>> Status (', status, ')=> ', parsedStatus)
    if (parsedStatus === 'unauthorized' || parsedStatus === 'refunded' || parsedStatus === 'voided') {
      return true
    }
    return false
  }

  const checkPayDay = (str) => {
    // check if today is 3 days before payday.
    const payDay = new Date(str)
    const nowTime = new Date().getTime() + 259200000 // add 3day to today
    const now = new Date(nowTime)
    return (now >= payDay)
  }

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
        const plan = documentSnapshot.data().plan
        console.log('> Try create new Order s:', storeId, ' transactionId: ', transactionId, ' original Order: ', subscriptionId)
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
                  const channelType = oldOrder.channel_type
                  const domain = oldOrder.domain
                  const amount = oldOrder.amount
                  const shippingLines = oldOrder.shipping_lines
                  const shippingMethodLabel = oldOrder.shipping_method_label
                  const paymentMethodLabel = oldOrder.payment_method_label
                  const originalTransaction = oldOrder.transactions[0]
                  const quantity = installment
                  const periodicity = parsePeriodicity(GalaxPaySubscription.periodicity)
                  const dateUpdate = GalaxPayTransaction.datetimeLastSentToOperator ? new Date(GalaxPayTransaction.datetimeLastSentToOperator).toISOString() : new Date().toISOString()

                  // remove items free in new orders subscription
                  checkAmountItemsOrder(amount, items, plan)
                  if (amount.balance) {
                    delete amount.balance
                  }

                  const transactions = [
                    {
                      amount: originalTransaction.amount,
                      status: {
                        updated_at: dateUpdate,
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

                  transactions[0].payment_link = GalaxPaySubscription.paymentLink

                  const financialStatus = {
                    updated_at: dateUpdate,
                    current: parseStatus(GalaxPayTransaction.status)
                  }
                  body = {
                    opened_at: new Date().toISOString(),
                    items,
                    shipping_lines: shippingLines,
                    buyers,
                    channel_type: channelType,
                    domain,
                    amount,
                    shipping_method_label: shippingMethodLabel,
                    payment_method_label: paymentMethodLabel,
                    transactions,
                    financial_status: financialStatus,
                    subscription_order: {
                      _id: subscriptionId,
                      number: parseInt(orderNumber)
                    },
                    notes: `Pedido #${quantity} referente à ${subscriptionLabel} ${periodicity}`,
                    staff_notes: `Valor cobrado no GalaxPay R$${GalaxPayTransactionValue}`
                  }
                  const transactionId = String(parseId(GalaxPayTransaction.galaxPayId))
                  return findOrderByTransactionId(appSdk, storeId, auth, transactionId)
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

  if (galaxpayHook.confirmHash) {
    console.log('> ', galaxpayHook.confirmHash)
  }

  // part of refactoring code
  const findOrderByTid = (appSdk, storeId, auth, tid) => {
    return new Promise((resolve, reject) => {
      appSdk.apiRequest(storeId, `/orders.json?transactions.intermediator.transaction_id=${tid}&fields=transactions`, 'GET', null, auth)
        .then(({ response }) => {
          const { result } = response.data
          // console.log('>> ', result)
          resolve(result[0])
        })
        .catch((err) => {
          reject(err)
        })
    })
  }

  if (!type) {
    console.log('galaxpay webhook: eventType not found')
  }
  if (!subscriptionId) {
    console.log('galaxpay webhook: subscriptionId not found')
  }

  const refactorMetadataStoreId = GalaxPaySubscription.ExtraFields?.find(metadata => metadata.tagName === 'store_id')
  let refactorStoreId = refactorMetadataStoreId && parseInt(refactorMetadataStoreId.tagValue, 10)
  let subscriptionDoc

  console.log(`galaxpay webhook: ${refactorStoreId} ${subscriptionId} ${type}`)

  const getDocumentFirestore = async (docId, collection = 'subscriptions') => {
    try {
      let document
      const documentSnapshot = await admin.firestore().collection(collection).doc(docId).get()
      if (documentSnapshot && documentSnapshot.exists) {
        document = { ...documentSnapshot.data() }
      }
      return document
    } catch (err) {
      console.warn(`galaxpay webhook Error: getDocumentFirestore => ${err.message}`)
      return null
    }
  }

  if (!refactorStoreId) {
    subscriptionDoc = await getDocumentFirestore(subscriptionId)
    refactorStoreId = subscriptionDoc && subscriptionDoc.storeId
  }

  if (!refactorStoreId || refactorStoreId < 100 || !GalaxPayTransaction.tid) {
    console.warn(`galaxpay webhook: storeId or tid not found => type: ${type} storeId: ${refactorStoreId}, webhook body${JSON.stringify(galaxpayHook)}`)
  } else {
    const refactorAuth = await appSdk.getAuth(refactorStoreId)

    let refactorStatusTransaction = GalaxPayTransaction?.status
    let refactorConfirmHash
    try {
      refactorConfirmHash = (await getDocumentFirestore(refactorStoreId, 'hashToWebhook')).confirmHash
    } catch (err) {
      console.warn(`galaxpay webhook Error: getDocumentFirestore confirmHash => ${err.message}`)
    }

    if (galaxpayHook.confirmHash !== refactorConfirmHash) {
      try {
        const appData = await getAppData({ appSdk, refactorStoreId, refactorAuth })
        const galaxpayAxios = new GalaxpayAxios(appData.galaxpay_id, appData.galaxpay_hash, refactorStoreId)
        await galaxpayAxios.preparing

        const { data } = await galaxpayAxios.axios
          .get(`/transactions?galaxPayIds=${GalaxPayTransaction.galaxPayId}&startAt=0&limit=1`)

        refactorStatusTransaction = data.Transactions[0]?.status
      } catch (err) {
        console.warn(`galaxpay webhook Error: get Transaction in Galaxpay => ${err.message}, body webhook ${JSON.stringify(galaxpayHook)}`)
      }
    }
    let originalOrder
    let orderFoundTid
    let orderFoundTransactionId
    console.log(`galaxpay webhook status Transaction: ${refactorStatusTransaction}, parse: ${parseStatus(refactorStatusTransaction)} `)

    try {
      originalOrder = await findOrderById(appSdk, refactorStoreId, refactorAuth, subscriptionId)
      console.log(`galaxpay webhook, find original order (${subscriptionId}) => ${JSON.stringify(originalOrder)}`)
    } catch (err) {
      console.warn(`galaxpay webhook Error: original order (${subscriptionId}) not found => ${err.message}`)
    }
    if (type === 'transaction.updateStatus') {
      //
      try {
        orderFoundTid = await findOrderByTid(appSdk, refactorStoreId, refactorAuth, GalaxPayTransaction.tid)
        const transactionId = String(parseId(GalaxPayTransaction.galaxPayId))
        orderFoundTransactionId = await findOrderByTransactionId(appSdk, refactorStoreId, refactorAuth, transactionId)
      } catch (err) {
        console.warn(`galaxpay webhook Error: ${err.message}`)
      }
      console.log(`galaxpay webhook OriginalOrder: ${JSON.stringify(originalOrder)}`)
      console.log(`galaxpay webhook orderFoundTid: ${JSON.stringify(orderFoundTid)}`)
      console.log(`galaxpay webhook orderFoundTransactionId: ${orderFoundTransactionId}`)
    } else {
      console.log('galaxpay webhook ignored webhook')
    }
  }
  // End refactoring

  if (type === 'transaction.updateStatus') {
    const subscription = collectionSubscription.doc(subscriptionId)
    subscription.get()
      .then((documentSnapshot) => {
        // console.log('> Update Status')
        // find StoreId in subscription
        const storeId = documentSnapshot.data().storeId
        // const orderNumber = documentSnapshot.data().orderNumber
        const transactionId = documentSnapshot.data().transactionId
        const plan = documentSnapshot.data().plan
        const oldValue = documentSnapshot.data().value
        let updates = documentSnapshot.data().updates
        if (documentSnapshot.exists && storeId) {
          appSdk.getAuth(storeId)
            .then(auth => {
              let order
              if (transactionId === GalaxPayTransaction.galaxPayId) {
                // update frist payment
                findOrderById(appSdk, storeId, auth, subscriptionId)
                  .then(async ({ response }) => {
                    order = response.data

                    // Update value Subscription in GalaxPay
                    console.log('plan-> ', JSON.stringify(plan))
                    // not update subscripton canceled
                    if (!checkStatusNotValid(GalaxPayTransaction.status)) {
                      const newValue = await updateValueSubscription(appSdk, storeId, auth, subscriptionId, order.amount, order.items, plan, oldValue)

                      if (newValue && newValue !== oldValue) {
                        const updatedAt = new Date().toISOString()
                        if (updates) {
                          updates.push({ value: newValue, updatedAt })
                        } else {
                          updates = []
                          updates.push({ value: newValue, updatedAt })
                        }

                        admin.firestore().collection('subscriptions').doc(subscriptionId)
                          .set({
                            updates,
                            updatedAt,
                            value: newValue
                          }, { merge: true })
                          .catch(console.error)
                      }
                    }
                    console.log('ORDER: ', JSON.stringify(order.amount), ' **')

                    // console.log('> order ', order)
                    if (order.financial_status && checkStatus(order.financial_status, GalaxPayTransaction)) {
                      res.sendStatus(200)
                    } else {
                      // update payment
                      const transactionId = order.transactions[0]._id
                      const body = {
                        date_time: new Date().toISOString(),
                        status: parseStatus(GalaxPayTransaction.status),
                        transaction_id: transactionId,
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
                          return appSdk.apiRequest(storeId, `orders/${order._id}/transactions/${transactionId}.json`, 'PATCH', body, auth)
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
              } else {
                /* add order, because recurrence creates all transactions in the first transaction when quantity is non-zero,
                Search for the order by ID, if not found, create the transaction, and if found, check if it will be necessary
                to update the transaction status */
                const transactionId = String(parseId(GalaxPayTransaction.galaxPayId))
                findOrderByTransactionId(appSdk, storeId, auth, transactionId)
                  .then(({ response }) => {
                    return new Promise((resolve, reject) => {
                      const { result } = response.data
                      if (!result || !result.length) {
                        // console.log('> Not found Transaction in API')
                        if (!checkStatusNotValid(GalaxPayTransaction.status) && checkPayDay(GalaxPayTransaction.payday)) {
                          // necessary to create order
                          createTransaction(appSdk, res, subscription, GalaxPayTransaction, GalaxPaySubscription, subscriptionId)
                        } else {
                          reject(new Error('Status or checkPayDay invalid'))
                        }
                      } else {
                        resolve({ result })
                      }
                    })
                  })
                  .then(({ result }) => {
                    order = result[0]
                    if (order.financial_status && checkStatus(order.financial_status, GalaxPayTransaction)) {
                      // console.log('> Equals Status')
                      res.sendStatus(200)
                    } else {
                      // console.log('> Order id ')
                      // update payment
                      const body = {
                        date_time: new Date().toISOString(),
                        status: parseStatus(GalaxPayTransaction.status),
                        transaction_id: transactionId,
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
                    return appSdk.apiRequest(storeId, `orders/${order._id}/transactions/${transactionId}.json`, 'PATCH', body, auth)
                  })

                  .then(apiResponse => {
                    if (parseStatus(GalaxPayTransaction.status) === 'voided' || parseStatus(GalaxPayTransaction.status) === 'refunded') {
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
  } else if (type === 'subscription.addTransaction') {
    if (GalaxPaySubscriptionQuantity === 0) {
      // find transaction in firebase
      const subscription = collectionSubscription.doc(subscriptionId)
      if (checkPayDay(GalaxPayTransaction.payday)) {
        createTransaction(appSdk, res, subscription, GalaxPayTransaction, GalaxPaySubscription, subscriptionId)
      }
    } else {
      // Avoid retries of this GalaxPay webhook
      res.status(200)
        .send('Subscription webhook with non-zero quantity. The Order will be analyzed with the updateStatus webhook.')
    }
  }
}
