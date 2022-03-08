const getAppData = require('../../lib/store-api/get-app-data')
const GalaxpayAxios = require('../../lib/galaxpay/create-access')
const parseStatus = require('../../lib/payments/parse-status')
const parseId = require('../../lib/galaxpay/parseId-to-ecom')
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

  console.log('> Galaxy WebHook ', type)
  const collectionSubscription = admin.firestore().collection('subscriptions')

  if (galaxpayHook.confirmHash) {
    console.log('> ', galaxpayHook.confirmHash)
  }

  if (type === 'transaction.updateStatus') {
    res.sendStatus(200)
    // const transaction = collectionTransaction.doc(String(GalaxPayTransaction.galaxPayId))
    // transaction.get()
    //   .then((documentSnapshot) => {
    //     const Transaction = documentSnapshot.data()
    //     if (documentSnapshot.exists && Transaction) {
    //       const transactionStatus = Transaction.status
    //       const orderId = Transaction.orderId
    //       const storeId = Transaction.storeId
    //       const subscriptionMyId = Transaction.subscriptionMyId
    //       if (transactionStatus !== GalaxPayTransaction.status) {
    //         console.log('> Order id ', orderId)
    //         // update payment
    //         const body = {
    //           date_time: new Date().toISOString(),
    //           status: parseStatus(GalaxPayTransaction.status),
    //           transaction_id: String(parseId(GalaxPayTransaction.galaxPayId)),
    //           notification_code: type + ';' + galaxpayHook.webhookId,
    //           flags: ['GalaxPay']
    //         }
    //         appSdk.apiRequest(storeId, `orders/${orderId}/payments_history.json`, 'POST', body)
    //           .then(apiResponse => {
    //             console.log('> UPDATE ', apiResponse)
    //             // update status in firebase
    //             admin.firestore().collection('transactions').doc(String(GalaxPayTransaction.galaxPayId))
    //               .set({
    //                 transactionId: GalaxPayTransaction.galaxPayId,
    //                 status: GalaxPayTransaction.status,
    //                 tid: GalaxPayTransaction.tid,
    //                 subscriptionMyId,
    //                 authorizationCode: GalaxPayTransaction.authorizationCode,
    //                 orderId,
    //                 storeId
    //               })
    //               .then(() => {
    //                 const intermediator = {
    //                   transaction_id: GalaxPayTransaction.tid,
    //                   transaction_code: GalaxPayTransaction.authorizationCode
    //                 }
    //                 // appSdk.apiRequest(storeId, `orders/${orderId}/transactions/.json`, 'PATCH', body)
    //                 res.sendStatus(200)
    //               })
    //               .catch(console.error)
    //           })
    //           .catch(err => {
    //             console.error(err)
    //             res.sendStatus(500)
    //           })
    //       } else {
    //         res.sendStatus(200)
    //       }
    //     } else {
    //       console.log('> Not Found Transaction')
    //       res.sendStatus(400)
    //     }
    //   })
  } else if (type === 'subscription.addTransaction') {
    // find transaction in firebase
    // create transaction in firebase and order API
    const subscription = collectionSubscription.doc(subscriptionId)
    subscription.get()
      .then((documentSnapshot) => {
      // find StoreId in subscription
        const storeId = documentSnapshot.data().storeId
        const orderNumber = documentSnapshot.data().orderNumber
        const transactionId = documentSnapshot.data().transactionId
        if (documentSnapshot.exists && storeId && transactionId !== GalaxPayTransaction.galaxPayId) {
          appSdk.getAuth(storeId)
            .then(auth => {
              appSdk.apiRequest(storeId, `orders/${subscriptionId}.json`, 'GET', null, auth)
                .then(({ response }) => {
                  console.log('> ', response.data)
                })
            })
        } else {
          console.log('> Not Found Subscritpion or Transaction exists')
          res.sendStatus(400)
        }
      })
      .catch(err => {
        console.error(err)
        res.sendStatus(500)
      })
  }
}
