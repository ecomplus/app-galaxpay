const getAppData = require('../../lib/store-api/get-app-data')
const GalaxpayAxios = require('../../lib/galaxpay/create-access')
const parseStatus = require('../../lib/payments/parse-status')
const getGalaxPayId = require('../../lib/galaxpay/use-galaxpayId')
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
    res.status(200).send('SUCCESS')
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
              const items = documentSnapshot.data().items
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
                  _id: String(getGalaxPayId(GalaxPayTransaction.galaxPayId)),
                  payment_method: paymentMethod,
                  status: {
                    updated_at: new Date().toISOString(),
                    current: parseStatus(GalaxPayTransaction.status)
                  },
                  notes: `${GalaxPayTransaction.installment}ª Parcela da Assinatura: ${orderNumber}`,
                  items,
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
                console.log('> BODY ', body)
                appSdk.apiRequest(storeId, 'orders.json', 'POST', body)
                  .then(apiResponse => {
                    console.log('> API ', apiResponse)
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
