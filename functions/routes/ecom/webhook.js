// read configured E-Com Plus app data
const getAppData = require('./../../lib/store-api/get-app-data')

// Auth GalaxPay
const GalaxpayAxios = require('./../../lib/galaxpay/create-access')

const { baseUri } = require('../../__env')

const SKIP_TRIGGER_NAME = 'SkipTrigger'
const ECHO_SUCCESS = 'SUCCESS'
const ECHO_SKIP = 'SKIP'
const ECHO_API_ERROR = 'STORE_API_ERR'

exports.post = ({ appSdk, admin }, req, res) => {
  // receiving notification from Store API
  const { storeId } = req

  /**
   * Treat E-Com Plus trigger body here
   * Ref.: https://developers.e-com.plus/docs/api/#/store/triggers/
   */
  const trigger = req.body
  const resourceId = trigger.resource_id || trigger.inserted_id

  // get app configured options
  getAppData({ appSdk, storeId })

    .then(appData => {
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
      const galaxpayAxios = new GalaxpayAxios(appData.galaxpay_id, appData.galaxpay_hash, appData.galaxpay_sandbox, storeId)
      const collectionSubscription = admin.firestore().collection('subscriptions')

      if (trigger.resource === 'orders' && trigger.body.status === 'cancelled') {
        let authorization

        galaxpayAxios.preparing
          .then(() => {
            return appSdk.getAuth(storeId)
          })
          .then(auth => {
            // Get Original Order
            console.log('s: ', storeId, '> ', resourceId)
            authorization = auth
            return appSdk.apiRequest(storeId, `/orders/${resourceId}.json`, 'GET', null, auth)
          })
          .then(({ response }) => {
            const order = response.data
            console.log('s: ', storeId, '> Cancell Subscription ', order._id)
            const subscription = collectionSubscription.doc(order._id)
            subscription.get()
              .then((documentSnapshot) => {
                return new Promise((resolve, reject) => {
                  const storeId = documentSnapshot.data().storeId
                  const status = documentSnapshot.data().status
                  if (documentSnapshot.exists && storeId) {
                    resolve({ status, order })
                  } else {
                    reject(new Error())
                  }
                })
              })
              .then(({ status, order }) => {
                if (status !== 'cancelled') {
                  galaxpayAxios.axios.delete(`/subscriptions/${order._id}/myId`)
                    .then((data) => {
                      console.log(`> ${order._id} Cancelled`)
                      res.send(ECHO_SUCCESS)
                      admin.firestore().collection('subscriptions').doc(order._id)
                        .set({
                          status: 'cancelled',
                          updated_at: new Date().toISOString
                        }, { merge: true })
                        .catch(console.error)
                    })
                    .catch((err) => {
                      console.error(err)
                      console.log(' > Response ', err.response)
                      // case error cancell GalaxPay, not cancelled in API
                      if (!order.subscription_order) {
                        const body = {
                          status: 'open'
                        }
                        console.log(`> Back  status  ${order._id}`)
                        appSdk.apiRequest(storeId, `orders/${order._id}.json`, 'PATCH', body, authorization)
                          .then(({ response }) => {
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
                      }
                    })
                } else {
                  res.send(ECHO_SUCCESS)
                }
              })
          })
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
