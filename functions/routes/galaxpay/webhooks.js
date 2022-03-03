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
  const collectionTransaction = admin.firestore().collection('transactions')

  const addTransactionFireBase = ({ Transaction }) => {
    console.log('> GalaxPayId ', Transaction.galaxPayId)
    console.log('> Trasaction', Transaction)
    admin.firestore().collection('transactions').doc(Transaction.galaxPayId)
      .set({ Transaction })
      .catch(console.error)
  }

  const createDocFireBase = () => {
    console.log('> Function create')
    const subscription = collectionSubscription.doc(subscriptionId)
    subscription.get()
      .then((documentSnapshot) => {
        const storeId = documentSnapshot.data().store_id
        if (documentSnapshot.exists && storeId) {
          addTransactionFireBase(galaxpayHook.Transaction)
          res.status(200).send('SUCCESS ', storeId)
        } else {
          res.status(404).send('NOT FOUND Doc Subscription in Firebase')
        }
      })
      .catch(err => {
        console.error()
        // thinking (this error code is correct?)
        res.status(400).send(err)
      })
  }

  if (galaxpayHook.confirmHash) {
    console.log('> ', galaxpayHook.confirmHash)
  }

  if (type === 'transaction.updateStatus') {
    res.status(200).send('SUCCESS')
  } else if (type === 'subscription.addTransaction') {
    console.log('> Find Collection Transaction')
    const transaction = collectionTransaction.doc(String(TransactionId))
    transaction.get()
      .then((documentSnapshot) => {
        const Transaction = documentSnapshot.data()
        if (documentSnapshot.exists && Transaction) {
          // compare status, if status paid, create new order, thinking ( only when order paid? )
          console.log('> GET now')
          return Transaction
        } else {
          console.log('> Create Transaction in Firebase')
          return {}
        }
      })
      .then(data => {
        console.log('> ', data)
        if (data === {}) {
          createDocFireBase()
        }
      })
      .catch(console.error)
  }
}
