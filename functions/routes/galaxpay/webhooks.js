const getAppData = require('../../lib/store-api/get-app-data')
const GalaxpayAxios = require('../../lib/galaxpay/create-access')
exports.post = ({ appSdk, admin }, req, res) => {
  // const galaxpayAxios = new GalaxpayAxios(appData.galaxpay_id, appData.galaxpay_hash, appData.galaxpay_sandbox)
  // https://docs.galaxpay.com.br/webhooks

  // POST transaction.updateStatus update Transation status
  // POST subscription.addTransaction add transation in subscription

  const galaxpayHook = req.body
  console.log('WebHook Active')
  console.log(galaxpayHook)
  if (galaxpayHook.confirmHash) {
    console.log('> ', galaxpayHook.confirmHash)
  }
  if (galaxpayHook.type === 'transaction.updateStatus') {
    res.status(200)
  } else if (galaxpayHook.type === 'subscription.addTransaction') {
    res.status(200)
  }
}
