const {
  findOrderByTid,
  findOrderById,
  isStatusPaid,
  createNewOrder
} = require('../../lib/store-api/utils')
const { parseStatus } = require('../../lib/galaxpay/parse-to-ecom')
const { updateValueSubscription, checkAmountItemsOrder } = require('../../lib/galaxpay/update-subscription')

const sendError = (err, res, message) => {
  console.error(err)
  const msgErr = err.message || 'Unexpected error'

  let { status } = err
  status = !status && err.response.status

  return res.status(status || 500)
    .send({ message: message || msgErr })
}

exports.post = async ({ appSdk, admin }, req, res) => {
  // const galaxpayAxios = new GalaxpayAxios(appData.galaxpay_id, appData.galaxpay_hash, appData.galaxpay_sandbox)
  // https://docs.galaxpay.com.br/webhooks

  // endpoint https://us-central1-ecom-galaxpay.cloudfunctions.net/app/galaxpay/webhooks

  // POST transaction.updateStatus update Transation status
  // POST subscription.addTransaction add transation in subscription

  const collectionSubscription = admin.firestore().collection('subscriptions')

  const { body } = req
  const type = body.event
  // const { Transaction, Subscription } = body
  const webhookTransaction = body.Transaction
  const webhookSubscription = body.Subscription
  const galaxpaySubscriptionId = webhookSubscription.myId
  const metadataStoreId = webhookSubscription.ExtraFields.find(metadata => metadata.tagName === 'store_id')
  let storeId = metadataStoreId && parseInt(metadataStoreId.tagValue, 10)
  let subscriptionDoc

  const getSubscriptionDocument = async (docId) => {
    let document
    const documentSnapshot = await collectionSubscription.doc(docId).get()
    if (documentSnapshot && documentSnapshot.exists) {
      document = { ...documentSnapshot.data() }
    }
    return document
  }

  if (!storeId) {
    subscriptionDoc = await getSubscriptionDocument(galaxpaySubscriptionId)
    storeId = subscriptionDoc && subscriptionDoc.storeId
  }

  if (storeId && storeId > 100 && webhookTransaction.tid) {
    const auth = await appSdk.getAuth(storeId)
    // const appData = await getAppData({ appSdk, storeId, auth }, true)
    // console.log('>> appData ', appData)
    let originalOrder
    let planSubscription

    try {
      originalOrder = await findOrderById(appSdk, storeId, auth, webhookSubscription.myId)
      // console.log('>>Original ', originalOrder)
      if (!subscriptionDoc) {
        subscriptionDoc = await getSubscriptionDocument(originalOrder._id)
      }
      planSubscription = subscriptionDoc && subscriptionDoc.plan
    } catch (err) {
      return sendError(err, res, 'Original order not found')
    }
    // console.log('>> subscriptionDoc ', subscriptionDoc)
    if (type === 'transaction.updateStatus') {
      //
      const orderFound = await findOrderByTid(appSdk, storeId, auth, webhookTransaction.tid)
      console.log('>> ', orderFound)
      if (orderFound) {
        if (originalOrder._id === orderFound._id) {
          /*
            After the first payment is made, update the subscription value in GalaxPay
            to remove gifts and payments with points
          */
          if (isStatusPaid(webhookTransaction.status)) {
            const oldSubscriptionValue = subscriptionDoc.value ||
              ({ ...originalOrder.amount }.total * 100)
            const newValue = checkAmountItemsOrder(
              { ...originalOrder.amount },
              [...originalOrder.items],
              { ...planSubscription }
            )
            if (newValue && newValue !== oldSubscriptionValue) {
              const value = await updateValueSubscription(
                appSdk,
                storeId,
                auth,
                originalOrder._id,
                originalOrder.amount,
                originalOrder.items,
                planSubscription,
                oldSubscriptionValue
              )
              let { updates } = subscriptionDoc
              const updatedAt = new Date().toISOString()
              if (updates) {
                updates.push({ value, updatedAt })
              } else {
                updates = []
                updates.push({ value, updatedAt })
              }
              collectionSubscription.doc(originalOrder._id)
                .set({
                  updates,
                  updatedAt,
                  value
                }, { merge: true })
                .catch(console.error)
            }
          }
        }
        // Add Payment History
        const transaction = orderFound.transactions?.find(({ intermediator }) => {
          return intermediator && intermediator.transaction_id === String(webhookTransaction.tid)
        })
        const resource = `orders/${orderFound._id}/payments_history.json`
        const method = 'POST'
        const bodyPaymentHistory = {
          date_time: new Date().toISOString(),
          status: parseStatus(webhookTransaction.status),
          notification_code: type + ';' + body.webhookId,
          flags: ['GalaxPay']
        }
        if (transaction) {
          bodyPaymentHistory.transaction_id = transaction._id
        }
        try {
        // console.log('bodyPH ', JSON.stringify(bodyPaymentHistory))
          await appSdk.apiRequest(storeId, resource, method, bodyPaymentHistory)
          return res.status(200).send({ message: 'OK' })
        } catch (err) {
          return sendError(err, res, 'Error adding payment history')
        }
      } else {
        // Order Not Found
        if (isStatusPaid(webhookTransaction.status)) {
          try {
            await createNewOrder(appSdk, storeId, auth, originalOrder, webhookTransaction, webhookSubscription, subscriptionDoc)
            return res.status(200).send({ message: 'New order successfully created.' })
          } catch (err) {
            return sendError(err, res, 'Error creating new order')
          }
        } else {
          return res.status(200).send({ message: 'Payment status other than paid' })
        }
      }
    } else {
      return res.sendStatus(400)
    }
  } else {
    return res.status(404).send({ message: 'StoreId not found!', tid: webhookTransaction.tid })
  }
}
