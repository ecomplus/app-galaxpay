const { parseId, parseStatus, parsePeriodicity } = require('../../lib/galaxpay/parse-to-ecom')
const {
  checkAndUpdateSubscriptionGalaxpay,
  checkItemsAndRecalculeteOrder,
  compareDocItemsWithOrder,
  updateValueSubscriptionGalaxpay,
  updateTransactionGalaxpay,
  cancellTransactionGalaxpay
} = require('../../lib/galaxpay/update-subscription')
const {
  createItemsAndAmount,
  updateDocSubscription
} = require('./../../lib/firestore/utils')
const getAppData = require('./../../lib/store-api/get-app-data')
const GalaxpayAxios = require('./../../lib/galaxpay/create-access')
const ecomUtils = require('@ecomplus/utils')

exports.post = async ({ appSdk, admin }, req, res) => {
  // const galaxpayAxios = new GalaxpayAxios(appData.galaxpay_id, appData.galaxpay_hash, appData.galaxpay_sandbox)
  // https://docs.galaxpay.com.br/webhooks

  // endpoint https://us-central1-ecom-galaxpay.cloudfunctions.net/app/galaxpay/webhooks

  // POST transaction.updateStatus update Transation status
  // POST subscription.addTransaction add transation in subscription

  const galaxpayHook = req.body
  const type = galaxpayHook?.event
  const GalaxPaySubscription = galaxpayHook?.Subscription
  // const GalaxPaySubscriptionQuantity = GalaxPaySubscription?.quantity
  const subscriptionId = GalaxPaySubscription?.myId
  const GalaxPayTransaction = galaxpayHook?.Transaction
  const GalaxPayTransactionValue = GalaxPayTransaction?.value && (GalaxPayTransaction.value / 100)

  console.log('> Galaxy WebHook ', type, ' Body Webhook ', JSON.stringify(galaxpayHook),
    ' status:', GalaxPayTransaction?.status, ' <')
  const collectionSubscription = admin.firestore().collection('subscriptions')
  const collectionTransactions = admin.firestore().collection('transactions')

  const checkStatusIsEqual = (financialStatus, galaxPayTransactionStatus) => {
    if (financialStatus.current === parseStatus(galaxPayTransactionStatus)) {
      return true
    }
    return false
  }

  const checkStatusPaid = (status) => {
    const parsedStatus = parseStatus(status)
    console.log(`>> Status is ${status} => ${parsedStatus}`)
    if (parsedStatus === 'paid') {
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

  const createTransaction = (appSdk, res, subscription, GalaxPayTransaction, GalaxPaySubscription, subscriptionId, galaxPayTransactionStatus) => {
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
                .then(async ({ response }) => {
                  // console.log('> Create new Order ')
                  const installment = GalaxPayTransaction.installment
                  const oldOrder = response.data
                  const buyers = oldOrder.buyers
                  const items = oldOrder.items
                  const channelType = oldOrder.channel_type
                  const domain = oldOrder.domain
                  const amount = oldOrder.amount
                  const shippingLines = oldOrder.shipping_lines
                  let shippingMethodLabel = oldOrder.shipping_method_label
                  const paymentMethodLabel = oldOrder.payment_method_label
                  const originalTransaction = oldOrder.transactions[0]
                  const quantity = installment
                  const periodicity = parsePeriodicity(GalaxPaySubscription.periodicity)
                  const dateUpdate = GalaxPayTransaction.datetimeLastSentToOperator ? new Date(GalaxPayTransaction.datetimeLastSentToOperator).toISOString() : new Date().toISOString()

                  let { itemsAndAmount } = documentSnapshot.data()
                  try {
                    const transactionDoc = (await collectionTransactions.doc(`${storeId}-${GalaxPayTransaction.galaxPayId}`).get())?.data()
                    if (transactionDoc && transactionDoc.itemsAndAmount) {
                      itemsAndAmount = transactionDoc?.itemsAndAmount
                      console.log('>> items to transaction')
                    }
                  } catch (err) {
                    console.warn(err)
                  }

                  if (itemsAndAmount && itemsAndAmount.items?.length) {
                    compareDocItemsWithOrder(itemsAndAmount, items, amount, GalaxPayTransactionValue)
                  }
                  // recalculate order
                  const shippingLine = { ...shippingLines[0] }
                  console.log('>> check items ', JSON.stringify(items))

                  const { shippingLine: newShippingLine } = await checkItemsAndRecalculeteOrder(amount, items, plan, null, shippingLine, storeId, appSdk, auth)
                  shippingLines[0] = {
                    _id: ecomUtils.randomObjectId(),
                    ...newShippingLine
                  }
                  shippingMethodLabel = newShippingLine.label

                  if (amount.balance) {
                    delete amount.balance
                  }

                  items.forEach(item => {
                    if (item.stock_status && item.stock_status !== 'unmanaged') {
                      item.stock_status = 'pending'
                    }
                  })

                  const transactions = [
                    {
                      amount: amount.total,
                      status: {
                        updated_at: dateUpdate,
                        current: parseStatus(galaxPayTransactionStatus)
                      },
                      intermediator: {
                        transaction_id: GalaxPayTransaction.tid || '',
                        transaction_code: GalaxPayTransaction.authorizationCode || '',
                        transaction_reference: `${GalaxPayTransaction.galaxPayId}`
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
                    current: parseStatus(galaxPayTransactionStatus)
                  }

                  const planPergentage = plan?.discount
                    ? plan.discount.type === 'percentage' || plan.discount.percentage
                    : null
                  let notes = `Parcela #${quantity} desconto de ${planPergentage ? '' : 'R$'}`
                  if (planPergentage) {
                    notes += ` ${plan?.discount?.value || ''} ${planPergentage ? '%' : ''}`
                    notes += ` sobre ${plan?.discount?.apply_at || ''}`
                    notes += ` referente à ${subscriptionLabel} ${periodicity}`
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
                    notes,
                    staff_notes: `Valor cobrado no GalaxPay R$${GalaxPayTransactionValue}`
                  }
                  const transactionId = String(parseId(GalaxPayTransaction.galaxPayId))
                  const finalAmount = Math.floor((amount.total).toFixed(2) * 1000) / 1000
                  if (GalaxPayTransactionValue !== finalAmount) {
                    // GalaxPayTransactionValue === finalAmount
                    // return findOrderByTransactionId(appSdk, storeId, auth, transactionId)
                    // } else {
                    console.log(`>>[Transaction Error GP: #${GalaxPayTransaction.galaxPayId}] s: ${storeId}` +
                      `total: ${amount.total}, Galaxpay value: ${GalaxPayTransactionValue}` +
                      `amount: ${JSON.stringify(amount)}, items: ${JSON.stringify(items)},` +
                      `itemsAndAmount: ${itemsAndAmount && JSON.stringify(itemsAndAmount)}`)
                  }
                  return findOrderByTransactionId(appSdk, storeId, auth, transactionId)
                })
                .then(({ response }) => {
                  const { result } = response.data
                  if (!result.length) {
                    // console.log('>>Test ', JSON.stringify(body))
                    appSdk.apiRequest(storeId, 'orders.json', 'POST', body, auth)
                      .then(({ response }) => {
                        // console.log('> Created new order API')
                        res.sendStatus(201)
                        collectionTransactions.doc(`${storeId}-${GalaxPayTransaction.galaxPayId}`)
                          .delete()
                          .catch(console.error)
                      })
                      .catch((err) => {
                        console.error(err)
                        res.sendStatus(500)
                      })
                  } else {
                    // Order Exists
                    res.sendStatus(200)
                    collectionTransactions.doc(`${storeId}-${GalaxPayTransaction.galaxPayId}`)
                      .delete()
                      .catch(console.error)
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

  // if (galaxpayHook.confirmHash) {
  //   console.log('> confirmHash:', galaxpayHook.confirmHash)
  // }

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
        const docValue = documentSnapshot.data().value

        if (documentSnapshot.exists && storeId) {
          appSdk.getAuth(storeId)
            .then(async (auth) => {
              let galaxPayTransactionStatus
              let galaxpaySubscriptionStatus
              let transactionPaymentDay

              try {
                // check subscription and transaction status before in galaxpay
                const appData = await getAppData({ appSdk, storeId, auth })

                const galaxpayAxios = new GalaxpayAxios(appData.galaxpay_id, appData.galaxpay_hash, storeId)
                await galaxpayAxios.preparing

                let { data } = await galaxpayAxios.axios
                  .get(`/transactions?galaxPayIds=${GalaxPayTransaction.galaxPayId}&startAt=0&limit=1`)

                galaxPayTransactionStatus = data.Transactions[0]?.status
                const dateTimeTransaction = data.Transactions[0]?.paydayDate
                transactionPaymentDay = dateTimeTransaction && new Date(`${dateTimeTransaction} UTC-3`)
                console.log('>> galaxpay webhook: Transaction status ', galaxPayTransactionStatus, ' ', transactionPaymentDay)

                data = (await galaxpayAxios.axios
                  .get(`/subscriptions?myIds=${subscriptionId}&startAt=0&limit=1`)).data

                galaxpaySubscriptionStatus = data.Subscriptions[0]?.status
                console.log('>> galaxpay webhook: Subscription status ', galaxpaySubscriptionStatus)
              } catch (err) {
                console.warn(`galaxpay webhook Error: get Transaction/Subscription in Galaxpay => ${err.message}`)
                if (err.response && typeof err.response === 'object') {
                  console.log(`galaxpay webhook Error response: ${JSON.stringify(err.response)}`)
                }
                return res.sendStatus(500)
              }

              let order
              if (transactionId === GalaxPayTransaction.galaxPayId) {
                // update frist payment
                findOrderById(appSdk, storeId, auth, subscriptionId)
                  .then(async ({ response }) => {
                    order = response.data

                    // Update value Subscription in GalaxPay
                    // console.log('plan-> ', JSON.stringify(plan))
                    // not update subscripton canceled
                    if (checkStatusPaid(galaxPayTransactionStatus)) {
                      const oldValue = GalaxPayTransactionValue

                      // Calculates new value
                      const { value: newValue } = await checkItemsAndRecalculeteOrder(
                        order.amount,
                        order.items,
                        plan,
                        null,
                        order.shipping_lines[0],
                        storeId,
                        appSdk,
                        auth
                      )

                      if (newValue && (newValue / 100) !== oldValue) {
                        await checkAndUpdateSubscriptionGalaxpay(
                          appSdk,
                          storeId,
                          auth,
                          subscriptionId,
                          order.amount,
                          order.items,
                          plan,
                          oldValue,
                          order.shipping_lines[0]
                        )
                      }
                      // if docValue is zero, the subscription has no products (no stock), keep the value in firebase as zero
                      await updateDocSubscription(
                        collectionSubscription,
                        {
                          value: docValue === 0 ? 0 : newValue
                        },
                        subscriptionId
                      )
                    }
                    // console.log('ORDER: ', JSON.stringify(order.amount), ' **')

                    if (order.financial_status && checkStatusIsEqual(order.financial_status, galaxPayTransactionStatus)) {
                      console.log('>> Order status already updated')
                      res.sendStatus(200)
                    } else {
                      // update payment
                      let transactionId
                      if (order.transactions && order.transactions[0]) {
                        transactionId = order.transactions[0]._id
                      }
                      const notificationCode = `;${GalaxPayTransaction.tid || ''};${GalaxPayTransaction.authorizationCode || ''}`
                      const body = {
                        date_time: transactionPaymentDay || new Date().toISOString(),
                        status: parseStatus(galaxPayTransactionStatus),
                        notification_code: type + ';' + galaxpayHook.webhookId + notificationCode,
                        flags: ['GalaxPay']
                      }

                      if (transactionId) {
                        body.transaction_id = transactionId
                      }

                      return appSdk.apiRequest(storeId, `orders/${order._id}/payments_history.json`, 'POST', body, auth)
                        .then(apiResponse => {
                          // console.log('>  create Payment History')
                          const body = {
                            intermediator: {
                              transaction_id: GalaxPayTransaction.tid || '',
                              transaction_code: GalaxPayTransaction.authorizationCode || '',
                              transaction_reference: `${GalaxPayTransaction.galaxPayId}`
                            }
                          }
                          if (transactionId) {
                            return appSdk.apiRequest(storeId, `orders/${order._id}/transactions/${transactionId}.json`, 'PATCH', body, auth)
                          } else {
                            body.amount = order.amount.total
                            let code = GalaxPaySubscription.mainPaymentMethodId === 'creditcard' ? 'credit_card' : 'banking_billet'
                            if (GalaxPaySubscription.mainPaymentMethodId === 'pix') {
                              code = 'account_deposit'
                            }
                            body.payment_method = { code }
                            return appSdk.apiRequest(storeId, `orders/${order._id}/transactions.json`, 'POST', body, auth)
                          }
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
                    return new Promise(async (resolve, reject) => {
                      const { result } = response?.data
                      if (!result || !result.length) {
                        // console.log('> Not found Transaction in API')
                        if (checkStatusPaid(galaxPayTransactionStatus) && checkPayDay(GalaxPayTransaction.payday)) {
                          // necessary to create order
                          createTransaction(appSdk, res, subscription, GalaxPayTransaction, GalaxPaySubscription, subscriptionId, galaxPayTransactionStatus)
                        } else {
                          // reject(new Error('Status or checkPayDay invalid'))

                          // fetches the original order again to avoid delay from other webhooks
                          let originalOrder
                          try {
                            originalOrder = (await findOrderById(appSdk, storeId, auth, subscriptionId))?.response?.data
                          } catch (err) {
                            console.warn(`>> galaxpay webhook: Original Order not found (${subscriptionId}) `)
                            res.status(404).send({ message: 'Original Order not found' })
                          }
                          console.log(`>> galaxpay webhook: status Original Order: ${originalOrder?.status} `)

                          if (originalOrder && galaxpaySubscriptionStatus === 'canceled' && originalOrder?.status !== 'cancelled') {
                            console.log('>> galaxpay webhook: Subscription canceled at galapay')
                            appSdk.apiRequest(storeId, `orders/${subscriptionId}.json`, 'PATCH', { status: 'cancelled' }, auth)
                              .then(() => {
                                collectionSubscription.doc(subscriptionId)
                                  .set({
                                    status: 'cancelled',
                                    updatedAt: new Date().toISOString()
                                  }, { merge: true })
                                  .catch(console.error)

                                res.sendStatus(200)
                              }).catch(err => {
                                console.error(err)
                                res.sendStatus(400)
                              })
                          } else {
                            console.log(`>> galaxpay webhook: Status or checkPayDay invalid => Payday: ${GalaxPayTransaction.payday} now: ${new Date().toISOString()}`)
                            res.status(400).send({ message: 'Status or checkPayDay invalid' })
                          }
                        }
                      } else {
                        resolve({ result })
                      }
                    })
                  })
                  .then(({ result }) => {
                    order = result[0]
                    if (order.financial_status && checkStatusIsEqual(order.financial_status, galaxPayTransactionStatus)) {
                      console.log('>> Order status already updated')
                      res.sendStatus(200)
                    } else {
                      // console.log('> Order id ')
                      // update payment
                      const notificationCode = `;${GalaxPayTransaction.tid || ''};${GalaxPayTransaction.authorizationCode || ''}`
                      const body = {
                        date_time: transactionPaymentDay || new Date().toISOString(),
                        status: parseStatus(galaxPayTransactionStatus),
                        transaction_id: transactionId,
                        notification_code: type + ';' + galaxpayHook.webhookId + notificationCode,
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
                        transaction_code: GalaxPayTransaction.authorizationCode || '',
                        transaction_reference: `${GalaxPayTransaction.galaxPayId}`
                      }
                    }
                    return appSdk.apiRequest(storeId, `orders/${order._id}/transactions/${transactionId}.json`, 'PATCH', body, auth)
                  })

                  .then(apiResponse => {
                    if (parseStatus(galaxPayTransactionStatus) === 'voided' || parseStatus(galaxPayTransactionStatus) === 'refunded') {
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
    if (GalaxPaySubscription?.quantity === 0) {
      try {
        console.log('>> Add transaction')
        const subscriptionDoc = (await collectionSubscription.doc(subscriptionId).get())?.data()
        const { storeId, plan, transactionId, value: subscriptionValue } = subscriptionDoc
        if (storeId) {
          if (transactionId !== GalaxPayTransaction.galaxPayId) {
            const auth = await appSdk.getAuth(storeId)
            const order = (await findOrderById(appSdk, storeId, auth, subscriptionId))?.response?.data
            let items = order.items

            let { itemsAndAmount } = subscriptionDoc
            if (itemsAndAmount && itemsAndAmount.items?.length) {
              items = itemsAndAmount.items
            }

            await checkItemsAndRecalculeteOrder(
              order.amount,
              items,
              plan,
              null,
              order.shipping_lines[0],
              storeId,
              appSdk,
              auth
            )
            itemsAndAmount = createItemsAndAmount(order.amount, items)

            await collectionTransactions.doc(`${storeId}-${GalaxPayTransaction.galaxPayId}`)
              .set(
                {
                  itemsAndAmount,
                  updatedAt: new Date().toISOString()
                },
                { merge: true }
              )

            try {
              const appData = await getAppData({ appSdk, storeId, auth })

              const galaxpayAxios = new GalaxpayAxios(appData.galaxpay_id, appData.galaxpay_hash, storeId)
              await galaxpayAxios.preparing

              const { data } = await galaxpayAxios.axios
                .get(`/transactions?galaxPayIds=${GalaxPayTransaction.galaxPayId}&startAt=0&limit=1`)

              const total = itemsAndAmount?.amount?.total && Math.floor((itemsAndAmount?.amount?.total).toFixed(2) * 100)
              // console.log('>> ', data?.Transactions[0]?.value, ' ', total , ' ', JSON.stringify(data))
              const hasUpdateValue = total && data?.Transactions[0]?.value && total !== data?.Transactions[0]?.value
              const { status } = data?.Transactions[0]
              console.log('>> new value ', subscriptionValue, ' status ', status)
              if (hasUpdateValue) {
                const resp = await updateValueSubscriptionGalaxpay(galaxpayAxios, subscriptionId, total)
                if (resp) {
                  console.log('> Successful signature edit on Galax Pay')
                  const body = { itemsAndAmount }
                  if (total) {
                    body.value = total
                  }
                  await updateDocSubscription(collectionSubscription, body, subscriptionId)
                }
                // Update transaction
                if (!status || status === 'notSend' || status === 'pendingBoleto' || status === 'pendingPix') {
                  await updateTransactionGalaxpay(galaxpayAxios, GalaxPayTransaction.galaxPayId, total)
                }
              } else if (subscriptionValue === 0) {
                console.log('Try canceling transaction: ',
                  GalaxPayTransaction.galaxPayId, ' subscriptions is ',
                  subscriptionValue
                )
                // cancell transaction
                if (!status || status === 'notSend' || status === 'pendingBoleto' || status === 'pendingPix') {
                  await cancellTransactionGalaxpay(galaxpayAxios, GalaxPayTransaction.galaxPayId)
                }
              }
            } catch (error) {
              console.error(error)
              if (error.response) {
                const { status, data } = error.response
                console.error('Error response: ', status, ' ', data && JSON.stringify(data))
              }
            }

            res.sendStatus(200)
          } else {
            // console.log('>> Transaction Original')
            res.sendStatus(200)
          }
        } else {
          // console.log('>> storeId not found')
          res.sendStatus(400)
        }
      } catch (err) {
        console.error(err)
        res.sendStatus(500)
      }
    } else {
      // Avoid retries of this GalaxPay webhook
      res.status(200)
        .send('Subscription webhook with non-zero quantity. The Order will be analyzed with the updateStatus webhook.')
    }
  }
}
