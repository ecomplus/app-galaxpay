const {
  findOrderByTid,
  findOrderById,
  checkStatusPaid,
  createNewOrder
} = require('../../lib/store-api/utils')
const { parseStatus } = require('../../lib/galaxpay/parse-to-ecom')
const { updateValueSubscription, checkAmountItemsOrder } = require('../../lib/galaxpay/update-subscription')
const getAppData = require('./../../lib/store-api/get-app-data')

// Auth GalaxPay
const GalaxpayAxios = require('./../../lib/galaxpay/create-access')

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

  const { body } = req
  const type = body?.event
  if (!type) {
    return res.sendStatus(400)
  }
  const webhookTransaction = body.Transaction
  const webhookSubscription = body.Subscription
  const galaxpaySubscriptionId = webhookSubscription?.myId
  if (!galaxpaySubscriptionId) {
    return res.sendStatus(400)
  }
  const metadataStoreId = webhookSubscription.ExtraFields?.find(metadata => metadata.tagName === 'store_id')
  let storeId = metadataStoreId && parseInt(metadataStoreId.tagValue, 10)
  let subscriptionDoc

  const getDocumentFirestore = async (docId, collection = 'subscriptions') => {
    let document
    const documentSnapshot = await admin.firestore().collection(collection).doc(docId).get()
    if (documentSnapshot && documentSnapshot.exists) {
      document = { ...documentSnapshot.data() }
    }
    return document
  }

  if (!storeId) {
    subscriptionDoc = await getDocumentFirestore(galaxpaySubscriptionId)
    storeId = subscriptionDoc && subscriptionDoc.storeId
  }

  if (storeId && storeId > 100 && webhookTransaction.tid) {
    const auth = await appSdk.getAuth(storeId)

    let statusTransaction = webhookTransaction.status
    let confirmHash
    try {
      confirmHash = (await getDocumentFirestore(storeId, 'hashToWebhook')).confirmHash
    } catch (err) {
      console.error(err)
    }

    /* checks if the webhook is authorized or searches for status in galaxpay */
    if (body.confirmHash !== confirmHash) {
      try {
        const appData = await getAppData({ appSdk, storeId, auth })
        const galaxpayAxios = new GalaxpayAxios(appData.galaxpay_id, appData.galaxpay_hash, storeId)
        await galaxpayAxios.preparing

        const { data } = await galaxpayAxios.axios
          .get(`transactions?galaxPayIds=${webhookTransaction.galaxPayId}&startAt=0&limit=1`)

        statusTransaction = data.Transactions[0]?.status
      } catch (err) {
        return sendError(err, res, 'Error getting transaction status in Galaxpay')
      }
    }

    let originalOrder
    let planSubscription

    try {
      originalOrder = await findOrderById(appSdk, storeId, auth, webhookSubscription.myId)
      // console.log('>>Original ', originalOrder)
      if (!subscriptionDoc) {
        subscriptionDoc = await getDocumentFirestore(originalOrder._id)
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
          if (checkStatusPaid(statusTransaction)) {
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
              admin.firestore().collection('subscriptions').doc(originalOrder._id)
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
          status: parseStatus(statusTransaction),
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
        if (checkStatusPaid(statusTransaction)) {
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
