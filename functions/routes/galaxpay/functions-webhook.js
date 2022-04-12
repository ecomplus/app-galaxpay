const { parseId, parseStatus, parsePeriodicity } = require('../../lib/galaxpay/parse-to-ecom')

const findOrderByTransactionId = (appSdk, storeId, auth, transactionId) => {
  return new Promise((resolve, reject) => {
    appSdk.apiRequest(storeId, `/orders.json?transactions._id=${transactionId}`, 'GET', null, auth)
      .then(({ response }) => {
        resolve({ response })
      })
      .catch((err) => {
        reject(err)
      })
  })
}

const findOrderById = (appSdk, storeId, auth, orderId) => {
  return new Promise((resolve, reject) => {
    appSdk.apiRequest(storeId, `/orders/${orderId}.json?fields=transactions,financial_status`, 'GET', null, auth)
      .then(({ response }) => {
        resolve({ response })
      })
      .catch((err) => {
        reject(err)
      })
  })
}

module.exports = {
  findOrderById
}
