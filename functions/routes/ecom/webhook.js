// read configured E-Com Plus app data
const getAppData = require('./../../lib/store-api/get-app-data')

// Auth GalaxPay
const GalaxpayAxios = require('./../../lib/galaxpay/create-access')

const SKIP_TRIGGER_NAME = 'SkipTrigger'
const ECHO_SUCCESS = 'SUCCESS'
const ECHO_SKIP = 'SKIP'
const ECHO_API_ERROR = 'STORE_API_ERR'

exports.post = ({ appSdk }, req, res) => {
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
      const galaxpayAxios = new GalaxpayAxios(appData.galaxpay_id, appData.galaxpay_hash, appData.galaxpay_sandbox)

      if (trigger.resource === 'orders' && trigger.body.status === 'cancelled') {
        let autorization
        console.log('> Cancell Subscription ')
        galaxpayAxios.preparing
          .then(() => {
            return appSdk.getAuth(storeId)
          })
          .then(auth => {
            // Get Original Order
            autorization = auth
            return appSdk.apiRequest(storeId, `/orders/${resourceId}.json`, 'GET', null, auth)
          })
          .then(({ response }) => {
            const order = response.data
            galaxpayAxios.axios.delete(`/subscriptions/${order._id}/myId`)
              .then((data) => {
                console.log(`> ${order._id} Cancelled`)
                res.send(ECHO_SUCCESS)
              })
              .catch(() => {
                // case error cancell GalaxPay, not cancelled in API
                const body = {
                  status: 'open'
                }
                console.log(`> Back  status  ${order._id}`)
                appSdk.apiRequest(storeId, `orders/${order._id}.json`, 'PATCH', body, autorization)
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
