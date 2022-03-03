const getAppData = require('../../lib/store-api/get-app-data')
const GalaxpayAxios = require('../../lib/galaxpay/create-access')
exports.post = ({ appSdk, admin }, req, res) => {
  // const galaxpayAxios = new GalaxpayAxios(appData.galaxpay_id, appData.galaxpay_hash, appData.galaxpay_sandbox)
  // https://docs.galaxpay.com.br/webhooks

  // endpoint https://us-central1-ecom-galaxpay.cloudfunctions.net/app/galaxpay/webhooks

  // POST transaction.updateStatus update Transation status
  // POST subscription.addTransaction add transation in subscription

  const galaxpayHook = req.body
  const type = galaxpayHook.event
  const subscriptionId = galaxpayHook.Subscription.myId
  const TransactionId = galaxpayHook.Transaction.galaxPayId
  console.log('> Galaxy WebHook ', type)
  const collectionSubscription = admin.firestore().collection('subscriptions')
  const collectionTransaction = admin.firestore().collection('transaction')

  const addTransactionFireBase = ({ Transaction }) => {
    admin.firestore().collection('transation').doc(Transaction.galaxPayId)
      .set({ Transaction })
      .catch(console.error)
  }

  if (galaxpayHook.confirmHash) {
    console.log('> ', galaxpayHook.confirmHash)
  }
  if (type === 'transaction.updateStatus') {
    res.status(200).send('SUCCESS')
  } else if (type === 'subscription.addTransaction') {
    const transaction = collectionTransaction.doc(TransactionId)
    transaction.get()
      .then((documentSnapshot) => {
        console.log('> Transactio Test ', documentSnapshot.data())
        if (documentSnapshot.exists) {
          console.log('> Exists')
        } else {
          console.log('> NOT Exists')
        }

        if (collectionTransaction) {
          console.log('Collection Transaction OK ', TransactionId)
        } else {
          console.log('Collection Transaction NOT FOUND')
          const subscription = collectionSubscription.doc(subscriptionId)
          subscription.get()
            .then((documentSnapshot) => {
              const storeId = documentSnapshot.data().store_id
              if (documentSnapshot.exists && storeId) {
                addTransactionFireBase(galaxpayHook.Transaction)
                res.status(200).send('SUCCESS ', storeId)
              } else {
                res.status(404).send('NOT FOUND')
              }
            })
            .catch(() => {
              res.status(404).send('NOT FOUND')
            })
        }
      })
  }
}
