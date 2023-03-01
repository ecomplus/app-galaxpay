// read configured E-Com Plus app data
const getAppData = require('./../../lib/store-api/get-app-data')

// Auth GalaxPay
const GalaxpayAxios = require('./../../lib/galaxpay/create-access')

const { baseUri } = require('../../__env')
const { checkAmountItemsOrder } = require('../../lib/galaxpay/update-subscription')

const SKIP_TRIGGER_NAME = 'SkipTrigger'
const ECHO_SUCCESS = 'SUCCESS'
const ECHO_SKIP = 'SKIP'
const ECHO_API_ERROR = 'STORE_API_ERR'

const getDocSubscription = (
  orderId,
  collectionSubscription
) => new Promise((resolve, reject) => {
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

const findOrderById = (appSdk, storeId, orderId, auth) => new Promise((resolve, reject) => {
  appSdk.apiRequest(storeId, `/orders/${orderId}.json`, 'GET', null, auth)
    .then(({ response }) => {
      resolve(response.data)
    })
    .catch(err => {
      reject(err)
    })
})

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
                          console.error(err)
                          const statusCode = err.response.status
                          // case error cancell GalaxPay, not cancelled in API
                          if (!order.subscription_order && statusCode !== 404) {
                            const body = {
                              status: 'open'
                            }
                            console.log(`> Back  status  ${order._id}`)
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
                            console.log('> ', updatedAt, 'Type ', typeof updatedAt)
                            admin.firestore().collection('subscriptions').doc(order._id)
                              .set({
                                status: 'cancelled',
                                description: 'Subscription canceled or finished in galaxPay',
                                updatedAt
                              }, { merge: true })
                              .catch(console.error)
                          } else {
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
              })
          } else if (trigger.resource === 'orders' &&
            trigger.body.status !== 'cancelled' && trigger.action !== 'create') {
            //
            try {
              const docSubscription = await getDocSubscription(resourceId, collectionSubscription)
              const order = await findOrderById(appSdk, storeId, resourceId, auth)
              const { amount, items } = order
              let { plan, updates, value } = docSubscription

              const newValue = checkAmountItemsOrder({ ...amount }, [...items], { ...plan })
              await galaxpayAxios.preparing

              if (!value) {
                const { data } = await galaxpayAxios.axios.get(`subscriptions?myIds=${resourceId}&startAt=0&limit=1`)
                value = data.Subscriptions[0] && data.Subscriptions[0].value
              }

              if (newValue !== value) {
                const { data } = await galaxpayAxios.axios.put(`subscriptions/${resourceId}/myId`, { value: newValue })
                if (data.type) {
                  console.log('> Successful signature edit on Galax Pay')
                  res.send(ECHO_SUCCESS)

                  const updatedAt = new Date().toISOString()
                  if (updates) {
                    updates.push({ value: newValue, updatedAt })
                  } else {
                    updates = []
                    updates.push({ value: newValue, updatedAt })
                  }

                  admin.firestore().collection('subscriptions').doc(resourceId)
                    .set({
                      updates,
                      updatedAt,
                      value: newValue
                    }, { merge: true })
                    .catch(console.error)
                }
              }
            } catch (err) {
              console.error('> Error editing subscription => ', err)
              const statusCode = err.response.status
              res.status(statusCode || 500)
              const { message } = err

              res.send({
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
