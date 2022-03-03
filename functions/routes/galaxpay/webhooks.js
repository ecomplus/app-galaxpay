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
  let transaction
  console.log('> Galaxy WebHook ', type)
  const collectionSubscription = admin.firestore().collection('subscriptions')
  const collectionTransaction = admin.firestore().collection('transaction')

  const addTransactionFireBase = ({ Transaction }) => {
    admin.firestore().collection('transaction').doc(Transaction.galaxPayId)
      .set({ Transaction })
      .catch(console.error)
  }

  const createDocFireBase = () => {
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

  if (galaxpayHook.confirmHash) {
    console.log('> ', galaxpayHook.confirmHash)
  }
  if (type === 'transaction.updateStatus') {
    res.status(200).send('SUCCESS')
  } else if (type === 'subscription.addTransaction') {
    console.log('> Find Collection Transaction')
    console.log('> Collection ', collectionTransaction)
    // transaction = collectionTransaction.doc(TransactionId)
    // if (transaction) {
    //   console.log('> Exists')
    //   transaction.get()
    //     .then((documentSnapshot) => {
    //       console.log('> Transactio Test ', documentSnapshot.data())
    //     })
    //     .catch(console.error)
    // } else {
    //   console.log('> Not Exists')
    //   createDocFireBase()
    // }
  }
}
