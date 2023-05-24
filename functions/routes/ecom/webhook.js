// read configured E-Com Plus app data
const getAppData = require('./../../lib/store-api/get-app-data')

// Auth GalaxPay
const GalaxpayAxios = require('./../../lib/galaxpay/create-access')

const { baseUri } = require('../../__env')
const {
  checkItemsAndRecalculeteOrder,
  updateValueSubscriptionGalaxpay,
  getSubscriptionsByListMyIds
} = require('../../lib/galaxpay/update-subscription')

const {
  findOrderById,
  updateOrderById,
  getProductsById,
  getOrdersHaveProduct
} = require('./../../lib/store-api/request-api')

const SKIP_TRIGGER_NAME = 'SkipTrigger'
const ECHO_SUCCESS = 'SUCCESS'
const ECHO_SKIP = 'SKIP'
const ECHO_API_ERROR = 'STORE_API_ERR'

const getDocSubscription = (
  orderId,
  collectionSubscription
) => new Promise((resolve, reject) => {
  console.log('>> OrderId ', orderId)
  const subscription = collectionSubscription.doc(orderId)

  subscription.get()
    .then(documentSnapshot => {
      if (documentSnapshot.exists) {
        const data = documentSnapshot.data()
        if (data.storeId) {
          resolve(data)
        } else {
          reject(new Error('StoreId property not found in document'))
        }
      } else {
        reject(new Error('Document does not exist Firestore'))
      }
    }).catch(err => {
      reject(err)
    })
})

const updateDocFirestore = async (collectionSubscription, value, subscriptionId, status) => {
  const updatedAt = new Date().toISOString()
  const body = {
    updatedAt,
    value
  }
  if (status) {
    body.status = status
  }

  await collectionSubscription.doc(subscriptionId)
    .set(body, { merge: true })
    .catch(console.error)
}

exports.post = async ({ appSdk, admin }, req, res) => {
  // receiving notification from Store API
  const { storeId } = req

  /**
   * Treat E-Com Plus trigger body here
   * Ref.: https://developers.e-com.plus/docs/api/#/store/triggers/
   */
  const trigger = req.body
  const resourceId = trigger.resource_id || trigger.inserted_id

  appSdk.getAuth(storeId)
    .then((auth) => {
      // get app configured options
      return getAppData({ appSdk, storeId, auth })
        .then(async appData => {
          if (
            Array.isArray(appData.ignore_triggers) &&
            appData.ignore_triggers.indexOf(trigger.resource) > -1
          ) {
            // ignore current trigger
            const err = new Error()
            err.name = SKIP_TRIGGER_NAME
            throw err
          }

          /* DO YOUR CUSTOM STUFF HERE */
          const galaxpayAxios = new GalaxpayAxios(appData.galaxpay_id, appData.galaxpay_hash, storeId)
          const collectionSubscription = admin.firestore().collection('subscriptions')

          if (trigger.resource === 'orders' && trigger.body.status === 'cancelled') {
            galaxpayAxios.preparing
              .then(async () => {
                // Get Original Order
                console.log('s: ', storeId, '> ', resourceId)
                const order = await findOrderById(appSdk, storeId, resourceId, auth)
                console.log('s: ', storeId, '> Cancell Subscription ', order._id)
                getDocSubscription(order._id, collectionSubscription)
                  .then(({ status }) => {
                    const updatedAt = new Date().toISOString()
                    if (status !== 'cancelled') {
                      galaxpayAxios.axios.delete(`/subscriptions/${order._id}/myId`)
                        .then(() => {
                          console.log(`> ${order._id} Cancelled`)
                          res.send(ECHO_SUCCESS)
                          admin.firestore().collection('subscriptions').doc(order._id)
                            .set({
                              status: 'cancelled',
                              updatedAt
                            }, { merge: true })
                            .catch(console.error)
                        })
                        .catch((err) => {
                          const statusCode = err.response.status
                          // case error cancell GalaxPay, not cancelled in API
                          if (!order.subscription_order && statusCode !== 404) {
                            const body = {
                              status: 'open'
                            }
                            console.error(err)
                            console.log(`> Set order status to open:  ${order._id}`)
                            appSdk.apiRequest(storeId, `orders/${order._id}.json`, 'PATCH', body, auth)
                              .then(() => {
                                res.send(ECHO_SUCCESS)
                              })
                              .catch((err) => {
                                res.status(500)
                                const { message } = err
                                res.send({
                                  error: ECHO_API_ERROR,
                                  message
                                })
                              })
                          } else if (statusCode === 404) {
                            console.log('>E-com webhook: Subscription canceled or finished in galaxPay')
                            admin.firestore().collection('subscriptions').doc(order._id)
                              .set({
                                status: 'cancelled',
                                description: 'Subscription canceled or finished in galaxPay',
                                updatedAt
                              }, { merge: true })
                              .catch(console.error)
                          } else {
                            console.error(err)
                            admin.firestore().collection('subscriptions').doc(order._id)
                              .set({
                                description: `GALAXPAY_TRANSACTION_ERR ${statusCode}`,
                                updatedAt
                              }, { merge: true })
                              .catch(console.error)
                          }
                        })
                    } else {
                      res.send(ECHO_SUCCESS)
                    }
                  })
                  .catch((err) => {
                    let status = 500
                    const { message } = err
                    if (message === 'Document does not exist Firestore') {
                      console.warn(`>> StoreApi webhook: Document does not exist Firestore, order #${resourceId}, not found`)
                      status = 404
                    }

                    res.status(status).send({
                      error: ECHO_API_ERROR,
                      message
                    })
                  })
              })
          } else if (trigger.resource === 'orders' &&
            trigger.body.status !== 'cancelled' && trigger.action !== 'create') {
            // When the original order is edited
            try {
              const docSubscription = await getDocSubscription(resourceId, collectionSubscription)
              const order = await findOrderById(appSdk, storeId, resourceId, auth)
              const { amount, items } = order
              const { plan } = docSubscription

              const newValue = checkItemsAndRecalculeteOrder({ ...amount }, [...items], { ...plan })
              await galaxpayAxios.preparing
              const resp = await updateValueSubscriptionGalaxpay(galaxpayAxios, resourceId, newValue)
              if (resp) {
                console.log('> Successful signature edit on Galax Pay')
                updateDocFirestore(collectionSubscription, newValue, resourceId)
              }
              res.send(ECHO_SUCCESS)
            } catch (err) {
              const { message, response } = err
              let status = response?.status || 500
              if (message === 'Document does not exist Firestore' ||
                message === 'StoreId property not found in document') {
                console.warn(`>> StoreApi webhook: Document does not exist Firestore, order #${resourceId}, not found`)
                status = 404
              } else {
                console.error('> Error editing subscription => ', err)
              }

              res.status(status).send({
                error: ECHO_API_ERROR,
                message
              })
            }
          } else if (trigger.resource === 'applications') {
            console.log('s: ', storeId, '> Edit Application')

            const body = {
              url: `${baseUri}/galaxpay/webhooks`,
              events: ['subscription.addTransaction', 'transaction.updateStatus']
            }

            galaxpayAxios.preparing
              .then(() => {
                return galaxpayAxios.axios.put('/webhooks', body)
              })
              .then(({ response }) => {
                console.log('> Success edit webhook')
                res.send(ECHO_SUCCESS)
              })
              .catch((err) => {
                console.error(err)
                res.status(500)
                const { message } = err
                res.send({
                  error: ECHO_API_ERROR,
                  message
                })
              })
          } else if (trigger.resource === 'products' && trigger.action !== 'create') {
            console.log('s: ', storeId, '> Edit product ', resourceId)
            // const { quantity, price } = trigger.body
            const sku = trigger.sku || trigger.body?.sku
            // console.log('>> ', quantity, ' ', price, ' ', sku, ' ', resourceId)
            let query = 'status!=cancelled'
            if (sku) {
              query += `&&items.sku=${sku}`
            } else {
              query += `&&items.product_id=${resourceId}`
            }
            try {
              const { result } = await getOrdersHaveProduct(appSdk, storeId, query, auth)
              // console.log('>Result ', JSON.stringify({ result }))

              if (result && result.length) {
                const galaxPaySubscriptions = await getSubscriptionsByListMyIds(
                  galaxpayAxios,
                  result.reduce((orderIds, order) => {
                    orderIds.push(order._id)
                    return orderIds
                  }, [])
                )

                if (galaxPaySubscriptions && galaxPaySubscriptions.length) {
                  galaxPaySubscriptions.forEach(async subscription => {
                    try {
                      // Need full item information, the order list does not provide information such as price
                      const order = await findOrderById(appSdk, storeId, subscription.myId, auth)
                      if (order) {
                        // console.log('>>Subscription  ', subscription)
                        // console.log('=> ', order)
                        const item = order.items.find((itemFind) => itemFind.sku === sku || itemFind.product_id === resourceId)
                        const product = await getProductsById(appSdk, storeId, item.product_id, auth)

                        const newItem = {
                          sku: product.sku,
                          price: product.price,
                          quantity: product.quantity
                        }
                        // console.log('>> product.sku !== item.sku ', product.sku !== item.sku, ' => ', product.sku, ' ', item.sku)
                        if (product.sku !== item.sku) {
                          const variation = product.variations.find((variationFind) => variationFind.sku === item.sku)
                          // console.log('>>variation ', variation)
                          newItem.sku = variation.sku
                          if (variation.price) {
                            newItem.price = variation.price
                          }
                          if (variation.quantity || variation.quantity === 0) {
                            newItem.quantity = variation.quantity
                          }
                        }
                        if (newItem.quantity < item.quantity || newItem.price !== (item.final_price || item.price)) {
                          const isRemoveItem = newItem.quantity < item.quantity
                          // console.log('>> check item ', newItem, ' remove ', isRemoveItem)
                          const { plan } = await getDocSubscription(order._id, collectionSubscription)
                          // console.log('order: ', JSON.stringify(order))
                          const newSubscriptionValue = checkItemsAndRecalculeteOrder(order.amount, order.items, plan, newItem, isRemoveItem)
                          // console.log('>> New: ', newSubscriptionValue, subscription.value)
                          if (newSubscriptionValue) {
                            await galaxpayAxios.preparing
                            const value = await updateValueSubscriptionGalaxpay(galaxpayAxios, order._id, newSubscriptionValue, subscription.value)
                            if (value) {
                              const body = {
                                amount: order.amount,
                                items: order.items
                              }
                              await updateOrderById(appSdk, storeId, order._id, body, auth)
                              await updateDocFirestore(collectionSubscription, value, order._id)
                            }
                          } else if (newSubscriptionValue === 0) {
                            console.log('>> Cancel subscription as new value is zero')
                            // Galaxpay still does not allow you to pause your subscription.
                            // new value equal to zero, quantity less than available, cancel subscription
                            await updateOrderById(appSdk, storeId, order._id, { status: 'cancelled' }, auth)
                          }
                        }
                      }
                    } catch (err) {
                      console.error(`Error trying to update signature #${subscription.myId} `, err)
                    }
                  })
                }
              }
              res.send(ECHO_SUCCESS)
            } catch (err) {
              console.error(err)
              res.status(500)
              const { message } = err
              res.send({
                error: ECHO_API_ERROR,
                message
              })
            }
          }
        })
    })
    .catch(err => {
      if (err.name === SKIP_TRIGGER_NAME) {
        // trigger ignored by app configuration
        res.send(ECHO_SKIP)
      } else if (err.appWithoutAuth === true) {
        const msg = `Webhook for ${storeId} unhandled with no authentication found`
        const error = new Error(msg)
        error.trigger = JSON.stringify(trigger)
        console.error(error)
        res.status(412).send(msg)
      } else {
        // console.error(err)
        // request to Store API with error response
        // return error status code
        res.status(500)
        const { message } = err
        res.send({
          error: ECHO_API_ERROR,
          message
        })
      }
    })
}
