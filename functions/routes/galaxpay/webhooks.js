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
    const subscription = collectionSubscription.doc(subscriptionId)
    if (collectionTransaction) {
      console.log('Collection Transaction OK')
    } else {
      console.log('Collection Transaction NOT FOUND')
    }
    subscription.get()
      .then((documentSnapshot) => {
        console.log('> Test ', documentSnapshot)
        if (documentSnapshot.exists && documentSnapshot.get('store_id')) {
          const storeId = documentSnapshot.get('store_id')
          res.status(200).send('SUCCESS ', storeId)
        } else {
          res.status(404).send('NOT FOUND')
        }
      })
  }
}
