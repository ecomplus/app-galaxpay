const {
  findOrderByTid,
  findOrderById,
  isStatusPaidAuthorized,
  createNewOrder
} = require('../../lib/store-api/utils')
const { parseStatus } = require('../../lib/galaxpay/parse-to-ecom')
const { updateValueSubscription } = require('../../lib/galaxpay/update-subscription')

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
  const metadataStoreId = webhookSubscription.ExtraFields.find(metadata => metadata.tagName === 'store_id')
  const storeId = metadataStoreId && parseInt(metadataStoreId.tagValue, 10)
  if (storeId > 100 && webhookTransaction.tid) {
    try {
      const auth = await appSdk.getAuth(storeId)
      // const appData = await getAppData({ appSdk, storeId, auth }, true)
      // console.log('>> appData ', appData)
      const originalOrder = await findOrderById(appSdk, storeId, auth, webhookSubscription.myId)
      // console.log('>>Original ', originalOrder)
      const documentSnapshot = await collectionSubscription.doc(originalOrder._id).get()
      let subscriptionDoc
      let planSubscription
      if (documentSnapshot && documentSnapshot.exists) {
        subscriptionDoc = { ...documentSnapshot.data() }
        planSubscription = subscriptionDoc.plan
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

            if (isStatusPaidAuthorized(webhookTransaction.status)) {
              const oldSubscriptionValue = subscriptionDoc.value ||
                ({ ...originalOrder.amount }.total * 100)

              const newValue = await updateValueSubscription(
                appSdk,
                storeId,
                auth,
                originalOrder._id,
                originalOrder.amount,
                originalOrder.items,
                planSubscription,
                oldSubscriptionValue
              )

              if (newValue && newValue !== oldSubscriptionValue) {
                let { updates } = subscriptionDoc
                const updatedAt = new Date().toISOString()
                if (updates) {
                  updates.push({ value: newValue, updatedAt })
                } else {
                  updates = []
                  updates.push({ value: newValue, updatedAt })
                }

                collectionSubscription.doc(originalOrder._id)
                  .set({
                    updates,
                    updatedAt,
                    value: newValue
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

          // console.log('bodyPH ', JSON.stringify(bodyPaymentHistory))

          await appSdk.apiRequest(storeId, resource, method, bodyPaymentHistory)
          res.status(200).send({ message: 'OK' })
        } else {
          // Order Not Found
          if (isStatusPaidAuthorized(webhookTransaction.status)) {
            await createNewOrder(appSdk, storeId, auth, originalOrder, webhookTransaction, webhookSubscription, subscriptionDoc)
            res.status(200).send({ message: 'New order successfully created.' })
          } else {
            res.status(200).send({ message: 'Payment status other than paid or authorized.' })
          }
        }
      } else {
        res.sendStatus(400)
      }
    } catch (err) {
      console.error(err)
      res.status(err.status || err.response.status || 500)
        .send({ message: err.message || 'Unexpected error' })
    }
  } else {
    res.status(404).send({ message: 'StoreId not found!', tid: webhookTransaction.tid })
  }
}
