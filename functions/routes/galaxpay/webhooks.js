const getAppData = require('../../lib/store-api/get-app-data')
const GalaxpayAxios = require('../../lib/galaxpay/create-access')
const parseStatus = require('../../lib/payments/parse-status')
const getGalaxPayId = require('../../lib/galaxpay/parseId-to-ecom')
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
  const TransactionId = GalaxPayTransaction.galaxPayId

  console.log('> Galaxy WebHook ', type)
  const collectionSubscription = admin.firestore().collection('subscriptions')
  const collectionTransaction = admin.firestore().collection('transactions')

  if (galaxpayHook.confirmHash) {
    console.log('> ', galaxpayHook.confirmHash)
  }

  if (type === 'transaction.updateStatus') {
    const transaction = collectionTransaction.doc(String(TransactionId))
    transaction.get()
      .then((documentSnapshot) => {
        const Transaction = documentSnapshot.data()
        if (documentSnapshot.exists && Transaction) {
          const transactionStatus = Transaction.status
          const orderId = Transaction.orderId
          if (transactionStatus !== GalaxPayTransaction.status) {
            console.log('> Order id ', orderId)
            // update payment
            // appSdk.apiRequest(storeId, 'orders/${orderId}/payments_history.json, 'PATCH', body)

            res.sendStatus(200)
          } else {
            console.log('>Status Equal ', GalaxPayTransaction)
            res.sendStatus(500)
          }
        } else {
          console.log('> Not Found Document')
          res.sendStatus(400)
        }
        // verify in API ?
      })
  } else if (type === 'subscription.addTransaction') {
    // find transactio in firebase
    const transaction = collectionTransaction.doc(String(TransactionId))
    transaction.get()
      .then((documentSnapshot) => {
        const Transaction = documentSnapshot.data()
        if (!documentSnapshot.exists || !Transaction) {
          // create transaction in firebase and order API
          const subscription = collectionSubscription.doc(subscriptionId)
          subscription.get()
            .then((documentSnapshot) => {
              // find StoreId in subscription
              const storeId = documentSnapshot.data().store_id
              const orderNumber = documentSnapshot.data().order_number
              // const items = documentSnapshot.data().items // need _id all items
              const paymentMethod = documentSnapshot.data().payment_method
              if (documentSnapshot.exists && storeId) {
                const name = GalaxPaySubscription.Customer.name.split(' ')
                const buyer = {
                  _id: GalaxPaySubscription.Customer.myId,
                  name: { given_name: name[0], family_name: name[name.length - 1] },
                  display_name: name[0],
                  main_email: GalaxPaySubscription.Customer.emails[0],
                  doc_number: GalaxPaySubscription.Customer.document
                }
                // create new orders in API
                const installment = GalaxPayTransaction.installment
                console.log('> Create Order')
                const transaction = {
                  _id: String(getGalaxPayId(TransactionId)),
                  payment_method: paymentMethod,
                  status: {
                    updated_at: new Date().toISOString(),
                    current: parseStatus(GalaxPayTransaction.status)
                  },
                  notes: `${GalaxPayTransaction.installment}ª Parcela da Assinatura: ${orderNumber}`,
                  amount: GalaxPayTransaction.value / 100
                }
                const body = {
                  buyers: [buyer],
                  amount: { total: (GalaxPayTransaction.value / 100) },
                  transactions: [transaction],
                  subscription_order: {
                    _id: subscriptionId,
                    number: parseInt(orderNumber)
                  },
                  notes: `${installment}ª Parcela da Assinatura ${orderNumber}`
                }
                // TODO: verify transaction exists in firebase, if exists, order exists in API
                appSdk.apiRequest(storeId, 'orders.json', 'POST', body)
                  .then(apiResponse => {
                    console.log('> API ', apiResponse)
                    console.log('> id ', apiResponse.data._id)
                    // save new transaction in firebase
                    admin.firestore().collection('transactions').doc(String(TransactionId))
                      .set({
                        transaction_id: TransactionId,
                        status: GalaxPayTransaction.status,
                        tid: GalaxPayTransaction.tid,
                        subscriptionMyId: GalaxPayTransaction.subscriptionMyId,
                        authorizationCode: GalaxPayTransaction.authorizationCode,
                        orderId: apiResponse.data._id
                      })
                      .catch(console.error)
                    res.sendStatus(200)
                  })
                  .catch(err => {
                    console.log(err)
                    res.sendStatus(400)
                  })
              }
            })
        }
      })
  }
}
