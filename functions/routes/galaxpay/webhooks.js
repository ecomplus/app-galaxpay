const getAppData = require('../../lib/store-api/get-app-data')
const GalaxpayAxios = require('../../lib/galaxpay/create-access')
const parseStatus = require('../../lib/payments/parse-status')
const createTransaction = require('../ecom/modules/create-transaction')
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

  const addTransactionFireBase = (Transaction, storeId) => {
    console.log('>  Transaction ID ', Transaction.galaxPayId)
    admin.firestore().collection('transactions').doc(String(Transaction.galaxPayId))
      .set(Transaction)
      .then((data) => {
        console.log('> dados ', data)
        res.status(200).send(`SUCCESS  ${storeId}`)
      })
      .catch(console.error)
  }
  const parsePaymentMethod = (code) => {
    switch (code) {
      case 'boleto':
        return 'banking_billet'
      case 'creditCard':
        return 'credit_card'
    }
    return 'other'
  }

  const createDocFireBase = () => {
    console.log('> Function create')
    const subscription = collectionSubscription.doc(subscriptionId)
    subscription.get()
      .then((documentSnapshot) => {
        const storeId = documentSnapshot.data().store_id
        if (documentSnapshot.exists && storeId) {
          const transaction = galaxpayHook.Transaction
          addTransactionFireBase(transaction, storeId)
        } else {
          res.status(404).send('NOT FOUND Doc Subscription in Firebase')
        }
      })
  }

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
              if (documentSnapshot.exists && storeId) {
                const name = GalaxPaySubscription.Customer.name.split(' ')
                const buyer = {
                  _id: GalaxPaySubscription.Customer.myId,
                  name: { given_name: name[0] },
                  main_email: GalaxPaySubscription.Customer.emails[0],
                  doc_number: GalaxPaySubscription.Customer.document
                }
                const transaction = {
                  _id: new Date().getTime().toString(),
                  payment_method: { code: 'credit_card' },
                  amount: (GalaxPayTransaction.value / 100)
                }
                // create new orders in API
                const installment = GalaxPayTransaction.installment
                console.log('> Create Orders')
                const resource = 'orders.json'
                const method = 'POST'
                const body = {
                  buyers: [buyer],
                  amount: { total: (GalaxPayTransaction.value / 100) },
                  subscription_order: {
                    _id: subscriptionId,
                    number: parseInt(orderNumber)
                  },
                  notes: `${installment}ª Parcela da Assinatura ${orderNumber}`
                }
                console.log('> BODY ', body)
                appSdk.apiRequest(storeId, resource, method, body)
                  .then(apiResponse => {
                    createTransaction({appSdk,admin},req, res)
                      .then(() => {
                        console.log('>> TEST OK')
                      })
                    console.log('> API ', apiResponse)
                    res.sendStatus(200)
                  })
                  .catch(err => {
                    console.log(err)
                    res.sendStatus(400)
                  })
              }
            })
        } else {
          console.log('> Exists docs')
        }
      })
  }
}
