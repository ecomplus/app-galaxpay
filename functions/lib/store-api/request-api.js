const findOrderById = (appSdk, storeId, orderId, auth) => new Promise((resolve, reject) => {
  appSdk.apiRequest(storeId, `/orders/${orderId}.json`, 'GET', null, auth)
    .then(({ response }) => {
      resolve(response.data)
    })
    .catch(err => {
      reject(err)
    })
})

const getProductsById = (appSdk, storeId, productId, auth, isRetry) => new Promise((resolve, reject) => {
  appSdk.apiRequest(storeId, `/products/${productId}.json`, 'GET', null, auth)
    .then(({ response }) => {
      resolve(response.data)
    })
    .catch(err => {
      if (!isRetry && err.response && err.response.status >= 429) {
        setTimeout(() => getProductsById(appSdk, storeId, productId, auth, true), 10)
      }
      reject(err)
    })
})

const getOrderWithQueryString = (appSdk, storeId, query, auth) => new Promise((resolve, reject) => {
  // console.log(' query:', query)
  appSdk.apiRequest(storeId, `/orders.json?${query}`, 'GET', null, auth)
    .then(({ response }) => {
      resolve(response.data)
    })
    .catch(err => {
      reject(err)
    })
})

module.exports = {
  findOrderById,
  getProductsById,
  getOrderWithQueryString
}
