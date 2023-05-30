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
  getProductsById,
  getOrderWithQueryString
} = require('./../../lib/store-api/request-api')

const {
  getDocSubscription,
  updateDocSubscription
} = require('./../../lib/firestore/utils')

const SKIP_TRIGGER_NAME = 'SkipTrigger'
const ECHO_SUCCESS = 'SUCCESS'
const ECHO_SKIP = 'SKIP'
const ECHO_API_ERROR = 'STORE_API_ERR'

exports.post = async ({ appSdk, admin }, req, res) => {
  // receiving notification from Store API
  const { storeId } = req

  /**
   * Treat E-Com Plus trigger body here
   * Ref.: https://developers.e-com.plus/docs/api/#/store/triggers/
   */
  const trigger = req.body
  const resourceId = trigger.resource_id || trigger.inserted_id

  const addItemsAndValueSubscriptionDoc = async (collectionSubscription, amount, items, value, subscriptionId) => {
    const itemsAndAmount = {
      amount: amount,
      items: items.reduce((items, itemOrder) => {
        items.push({
          sku: itemOrder.sku,
          final_price: itemOrder.final_price,
          price: itemOrder.price,
          quantity: itemOrder.quantity,
          product_id: itemOrder.product_id,
          variation_id: itemOrder.variation_id
        })
        return items
      }, [])
    }
    const body = { itemsAndAmount }

    if (value) {
      body.value = value
    }

    await updateDocSubscription(collectionSubscription, body, subscriptionId)
  }

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

                addItemsAndValueSubscriptionDoc(
                  collectionSubscription,
                  amount,
                  items,
                  newValue,
                  resourceId
                )
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
          } else if (trigger.resource === 'products' && trigger.action === 'change') {
            console.log('> Edit product ', resourceId, 's: ', storeId)
            const { quantity, price, sku } = trigger.body
            // console.log(`body: ${JSON.stringify(trigger.body)}`)
            // console.log(`trigger: ${JSON.stringify(trigger)}`)
            const isVariation = trigger.subresource === 'variations'
            // console.log('>> ', quantity, ' ', price, ' ', resourceId, ' ', sku)
            let query = 'status!=cancelled&transactions.type=recurrence'
            query += '&&transactions.app.intermediator.code=galaxpay_app'
            if (sku) {
              query += `&&items.sku=${sku}`
            } else {
              query += `&&items.product_id=${resourceId}`
            }
            try {
              const { result } = await getOrderWithQueryString(appSdk, storeId, query, auth)

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
                      const order = await findOrderById(appSdk, storeId, subscription.myId, auth)
                      let product = { sku, price }

                      if (!sku) {
                        product = await getProductsById(appSdk, storeId, resourceId, auth)
                      }

                      if (order) {
                        const { plan } = await getDocSubscription(order._id, collectionSubscription)
                        order.items.forEach(item => {
                          if (isVariation) {
                            let variationProduct

                            if (!sku) {
                              variationProduct = product.variations
                                .find(variationFind => variationFind.sku === item.sku)
                            } else if (sku === item.sku) {
                              variationProduct = product
                            }

                            if (variationProduct) {
                              const newItem = {
                                sku: variationProduct.sku,
                                price: variationProduct.price || item.final_price || item.price
                              }
                              const isRemoveItem = quantity < item.quantity
                              checkItemsAndRecalculeteOrder(order.amount, order.items, plan, newItem, isRemoveItem)
                            }
                          } else {
                            if (item.sku === product.sku) {
                              const newItem = {
                                sku: product.sku,
                                price: product.price
                              }
                              const isRemoveItem = quantity < item.quantity
                              checkItemsAndRecalculeteOrder(order.amount, order.items, plan, newItem, isRemoveItem)
                            }
                          }
                        })
                        const newSubscriptionValue = checkItemsAndRecalculeteOrder(order.amount, order.items, plan)
                        if (newSubscriptionValue) {
                          await galaxpayAxios.preparing
                          const value = await updateValueSubscriptionGalaxpay(
                            galaxpayAxios,
                            order._id,
                            newSubscriptionValue,
                            subscription.value
                          )

                          if (value) {
                            await addItemsAndValueSubscriptionDoc(
                              collectionSubscription,
                              order.amount,
                              order.items,
                              value,
                              order._id
                            )
                          }
                        }
                        // TODO:
                        // Galaxpay still does not allow you to pause your subscription.
                        // new value equal to zero, quantity less than available, cancel subscription
                        // console.log('>> Cancel subscription as new value is zero')
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
