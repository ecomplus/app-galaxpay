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
  console.log('> Galaxy WebHook ', type)
  const collectionRef = admin.firestore().collection('subscriptions')

  if (galaxpayHook.confirmHash) {
    console.log('> ', galaxpayHook.confirmHash)
  }
  if (type === 'transaction.updateStatus') {
    res.status(200).send('SUCCESS')
  } else if (type === 'subscription.addTransaction') {
    const subscription = collectionRef.doc(subscriptionId)
    subscription.get()
      .then((documentSnapshot) => {
        console.log('> FireBase Subscription ', documentSnapshot)
        if (documentSnapshot.exists) {
          res.status(200).send('SUCCESS')
        } else {
          res.status(404).send('NOT FOUND')
        }
      })
  }
}
