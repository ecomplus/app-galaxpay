const getAppData = require('../../lib/store-api/get-app-data')
const GalaxpayAxios = require('../../lib/galaxpay/create-access')
exports.post = ({ appSdk, admin }, req, res) => {
  // const galaxpayAxios = new GalaxpayAxios(appData.galaxpay_id, appData.galaxpay_hash, appData.galaxpay_sandbox)
  // https://docs.galaxpay.com.br/webhooks

  // POST transaction.updateStatus alterar o status da transação
  // POST subscription.addTransaction adiciona uma transação a assinatura

  const galaxpayHook = req.body
  console.log('WebHook Active')
  console.log(galaxpayHook)
  if (galaxpayHook.confirmHash) {
    // verificar o hash do webHook do galaxpay com a propriedade confirmHash, evitar invação

  }
  if (galaxpayHook.type === 'transaction.updateStatus') {

  }
}
